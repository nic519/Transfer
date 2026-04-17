"use client";

import { useEffect, useMemo, useState } from "react";
import { HomeConsole } from "@/components/home/home-console";
import { HomeRail } from "@/components/home/home-rail";
import { HomeResponse } from "@/components/home/home-response";
import { HistoryEntry, HistoryMethod, mergeHistoryEntry } from "@/lib/history";
import {
  ActivePanel,
  ResponseSummary,
  createStandardPayload,
  extractErrorMessage,
  formatBytes,
  getProxyLink,
  getResponseStats,
  isHeadersJsonValid,
  isSupportedHttpUrl,
  toggleActivePanel,
} from "@/lib/home";

const HISTORY_KEY = "web-relay-history";
const SAMPLE_URL = "https://example.com/data";

export default function Home() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<HistoryMethod>("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ResponseSummary>({
    status: null,
    headers: {},
    body: "",
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const isValidUrl = useMemo(() => isSupportedHttpUrl(url), [url]);
  const headersValid = useMemo(() => isHeadersJsonValid(headers), [headers]);
  const resultStats = useMemo(() => getResponseStats(response.body), [response.body]);

  const formattedResultSize = useMemo(() => formatBytes(resultStats.bytes), [resultStats.bytes]);

  const proxyLink = useMemo(() => {
    if (!isValidUrl || typeof window === "undefined") {
      return "";
    }

    return getProxyLink(window.location.origin, url);
  }, [isValidUrl, url]);

  const standardPayload = useMemo(
    () => createStandardPayload(url, method, headers, body, SAMPLE_URL),
    [body, headers, method, url],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawHistory = window.localStorage.getItem(HISTORY_KEY);
      if (!rawHistory) {
        return;
      }

      const parsed = JSON.parse(rawHistory);
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      window.localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && !loading) {
        event.preventDefault();
        void handleExecute();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, url, method, headers, body, isValidUrl, headersValid]);

  async function handleExecute() {
    if (!url.trim()) {
      setError("请输入目标 URL");
      return;
    }

    if (!isValidUrl) {
      setError("仅支持 http / https 链接");
      return;
    }

    if (!headersValid) {
      setError("请求头 JSON 格式无效");
      return;
    }

    setLoading(true);
    setError("");
    setResponse({ status: null, headers: {}, body: "" });

    try {
      const customHeaders = headers.trim() ? JSON.parse(headers) : {};
      const requestBody = method === "GET" ? undefined : body;

      const relayResponse = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url,
          method,
          headers: customHeaders,
          body: requestBody,
        }),
      });

      const text = await relayResponse.text();
      const nextHeaders = Object.fromEntries(relayResponse.headers.entries());

      if (!relayResponse.ok) {
        const message = extractErrorMessage(text) ?? `请求失败 (${relayResponse.status})`;
        setError(message);
      }

      setResponse({
        status: relayResponse.status,
        headers: nextHeaders,
        body: text,
      });

      setHistory((current) =>
        mergeHistoryEntry(
          current,
          {
            url,
            method,
            headers: headers.trim() || "{}",
            body,
          },
          Date.now(),
        ),
      );
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : "代理请求失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectHistory(entry: HistoryEntry) {
    setUrl(entry.url);
    setMethod(entry.method);
    setHeaders(entry.headers === "{}" ? "" : entry.headers);
    setBody(entry.body);
    setError("");
    setActivePanel(null);
  }

  function handleClearHistory() {
    setHistory([]);
  }

  function togglePanel(panel: Exclude<ActivePanel, null>) {
    setActivePanel((current) => toggleActivePanel(current, panel));
  }

  async function copyToClipboard(text: string, target: "link" | "response") {
    try {
      await navigator.clipboard.writeText(text);

      if (target === "link") {
        setCopiedLink(true);
        window.setTimeout(() => setCopiedLink(false), 1400);
      } else {
        setCopiedResponse(true);
        window.setTimeout(() => setCopiedResponse(false), 1400);
      }
    } catch {
      setError("复制失败，请检查浏览器权限");
    }
  }

  return (
    <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1560px] grid-cols-1 gap-4 lg:grid-cols-[78px_minmax(0,1.2fr)_minmax(0,1fr)] lg:items-stretch lg:gap-5">
        <HomeRail
          activePanel={activePanel}
          history={history}
          standardPayload={standardPayload}
          proxyLink={proxyLink}
          onClearHistory={handleClearHistory}
          onSelectHistory={handleSelectHistory}
          onTogglePanel={togglePanel}
        />

        <HomeConsole
          body={body}
          copiedLink={copiedLink}
          error={error}
          headers={headers}
          headersValid={headersValid}
          isValidUrl={isValidUrl}
          loading={loading}
          method={method}
          proxyLink={proxyLink}
          sampleUrl={SAMPLE_URL}
          standardPayload={standardPayload}
          url={url}
          onBodyChange={setBody}
          onCopyLink={() => proxyLink && void copyToClipboard(proxyLink, "link")}
          onExecute={() => void handleExecute()}
          onHeadersChange={setHeaders}
          onMethodChange={setMethod}
          onUrlChange={setUrl}
        />

        <HomeResponse
          copiedResponse={copiedResponse}
          formattedResultSize={formattedResultSize}
          resultLines={resultStats.lines}
          response={response}
          onCopyResponse={() => void copyToClipboard(response.body, "response")}
        />
      </div>
    </main>
  );
}
