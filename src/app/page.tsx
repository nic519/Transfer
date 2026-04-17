"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  FileJson2,
  Globe,
  History,
  Keyboard,
  Loader2,
  Orbit,
  Radar,
  ReceiptText,
  ScanSearch,
  Send,
  TerminalSquare,
  Trash2,
  Waypoints,
} from "lucide-react";
import { HistoryEntry, HistoryMethod, mergeHistoryEntry } from "@/lib/history";

const HISTORY_KEY = "web-relay-history";
const SAMPLE_URL = "https://example.com/data";
const METHOD_OPTIONS: HistoryMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

type ResponseSummary = {
  status: number | null;
  headers: Record<string, string>;
  body: string;
};

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
  const [activePanel, setActivePanel] = useState<"history" | "guide" | null>(null);

  const isValidUrl = useMemo(() => {
    if (!url.trim()) {
      return false;
    }

    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, [url]);

  const headersValid = useMemo(() => {
    if (!headers.trim()) {
      return true;
    }

    try {
      const parsed = JSON.parse(headers);
      return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
    } catch {
      return false;
    }
  }, [headers]);

  const resultStats = useMemo(() => {
    const chars = response.body.length;
    const lines = response.body ? response.body.split("\n").length : 0;
    const bytes = new TextEncoder().encode(response.body).length;
    return { chars, lines, bytes };
  }, [response.body]);

  const formattedResultSize = useMemo(() => formatBytes(resultStats.bytes), [resultStats.bytes]);

  const proxyLink = useMemo(() => {
    if (!isValidUrl || typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/api/proxy?url=${encodeURIComponent(url)}`;
  }, [isValidUrl, url]);

  const standardPayload = useMemo(() => {
    const parsedHeaders = headers.trim() && headersValid ? JSON.parse(headers) : {};

    return JSON.stringify(
      {
        url: url || SAMPLE_URL,
        method,
        headers: parsedHeaders,
        body: body || "",
      },
      null,
      2,
    );
  }, [body, headers, headersValid, method, url]);

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

  function togglePanel(panel: "history" | "guide") {
    setActivePanel((current) => (current === panel ? null : panel));
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
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1560px] grid-cols-1 gap-4 lg:grid-cols-[78px_minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
        <aside className="relative self-start overflow-visible rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,21,0.94),rgba(8,12,21,0.82))] p-3 shadow-[0_24px_72px_rgba(0,0,0,0.28)] lg:sticky lg:top-6 lg:h-fit">
          <div className="flex flex-row gap-2 lg:flex-col">
            <RailButton
              icon={<History size={18} />}
              label="历史"
              active={activePanel === "history"}
              badge={history.length > 0 ? String(history.length) : undefined}
              onClick={() => togglePanel("history")}
            />
            <RailButton
              icon={<BookOpen size={18} />}
              label="教程"
              active={activePanel === "guide"}
              onClick={() => togglePanel("guide")}
            />
          </div>

          {activePanel === "history" ? (
            <div className="absolute left-[calc(100%+14px)] top-0 z-30 w-[320px] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,25,0.98),rgba(7,11,19,0.98))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.36)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recent Requests</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">本地历史记录</h2>
                  <p className="mt-1 text-sm text-slate-400">点击即可回填，不占首页主空间。</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={history.length === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={14} />
                  清空
                </button>
              </div>

              <div className="mt-4 max-h-[72vh] space-y-3 overflow-auto pr-1 custom-scrollbar">
                {history.length > 0 ? (
                  history.map((entry) => (
                    <button
                      type="button"
                      key={entry.id}
                      onClick={() => handleSelectHistory(entry)}
                      className="block w-full cursor-pointer rounded-[20px] border border-white/10 bg-slate-950/45 p-3 text-left transition hover:border-cyan-300/40 hover:bg-slate-950/70"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-cyan-300/90 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                              {entry.method}
                            </span>
                            <p className="truncate text-sm font-medium text-white">{entry.url}</p>
                          </div>
                          <p className="mt-2 line-clamp-2 font-mono text-[11px] leading-5 text-slate-400">
                            {entry.headers}
                          </p>
                        </div>

                        <div className="shrink-0 text-right text-[11px] text-slate-400">
                          <div className="inline-flex items-center gap-1">
                            <Clock3 size={12} />
                            {formatTimestamp(entry.timestamp)}
                          </div>
                          <div className="mt-2 inline-flex items-center gap-1 text-cyan-200">
                            回填
                            <ChevronRight size={12} />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-slate-400">
                    最近执行过的请求会保存在浏览器本地，便于快速回填。
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activePanel === "guide" ? (
            <div className="absolute left-[calc(100%+14px)] top-0 z-30 w-[360px] rounded-[28px] border border-slate-900/10 bg-[linear-gradient(180deg,#f4f7fb_0%,#eef3f7_100%)] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Guide</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">API 使用教程</h2>
                <p className="mt-1 text-sm text-slate-600">默认收起，只在需要接入时展开查看。</p>
              </div>

              <div className="mt-4 space-y-4">
                <section className="rounded-[22px] border border-slate-900/10 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">STANDARD API</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">POST /api/proxy</h3>
                  <pre className="mt-4 overflow-x-auto rounded-[18px] bg-slate-950 px-4 py-4 font-mono text-[12px] leading-6 text-slate-100">
{`POST /api/proxy
Content-Type: application/json

${standardPayload}`}
                  </pre>
                </section>

                <section className="rounded-[22px] border border-slate-900/10 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">QUICK ACCESS</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">GET /api/proxy?url=...</h3>
                  <pre className="mt-4 overflow-x-auto rounded-[18px] bg-slate-950 px-4 py-4 font-mono text-[12px] leading-6 text-slate-100">
                    {proxyLink || "/api/proxy?url=https%3A%2F%2Fexample.com%2Fdata"}
                  </pre>
                </section>

                <section className="rounded-[22px] border border-slate-900/10 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ERROR ENVELOPE</p>
                  <pre className="mt-2 overflow-x-auto rounded-[18px] bg-slate-950 px-4 py-4 font-mono text-[12px] leading-6 text-slate-100">
{`{
  "error": "proxy_request_failed",
  "message": "Upstream request could not be completed",
  "status": 502
}`}
                  </pre>
                </section>
              </div>
            </div>
          ) : null}
        </aside>

        <section className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(9,14,25,0.94),rgba(7,11,19,0.98))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_55%)]" />
          <div className="pointer-events-none absolute -right-12 top-24 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex h-full flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-cyan-100/80">
                  <Globe size={13} />
                  WEB RELAY PLATFORM
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white md:text-[40px]">
                  通过边缘网络，稳定访问目标网址
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">用于调试、转发和稳定接入目标 URL。</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                <Keyboard size={14} />
                Cmd / Ctrl + Enter
              </div>
            </div>

            <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                      <Globe size={15} className="text-cyan-200" />
                      Target URL
                    </label>
                    <input
                      type="text"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      placeholder={SAMPLE_URL}
                      className={`h-12 w-full rounded-2xl border bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                        url && !isValidUrl ? "border-rose-400/80" : "border-white/10 focus:border-cyan-300/70"
                      }`}
                    />
                    {url && !isValidUrl ? <p className="text-xs text-rose-300">请输入合法的 http / https 地址</p> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                        <Waypoints size={15} className="text-cyan-200" />
                        Method
                      </label>
                      <select
                        value={method}
                        onChange={(event) => setMethod(event.target.value as HistoryMethod)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm font-medium text-white outline-none transition focus:border-cyan-300/70"
                      >
                        {METHOD_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-slate-950 text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                        <Orbit size={13} />
                        Default Mode
                      </p>
                      <p className="mt-2 text-sm text-slate-200">
                        控制台默认走 <span className="font-semibold text-white">POST /api/proxy</span>。需要直接访问时，再复制 GET 快捷入口。
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                      <FileJson2 size={15} className="text-cyan-200" />
                      Headers JSON
                    </label>
                    <textarea
                      value={headers}
                      onChange={(event) => setHeaders(event.target.value)}
                      placeholder={`{\n  "Authorization": "Bearer token"\n}`}
                      className={`h-40 w-full resize-none rounded-[22px] border bg-slate-950/60 px-4 py-3 font-mono text-[13px] leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 ${
                        headersValid ? "border-white/10 focus:border-cyan-300/70" : "border-rose-400/80"
                      }`}
                    />
                    {!headersValid ? <p className="text-xs text-rose-300">请求头必须是合法 JSON 对象</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                      <ReceiptText size={15} className="text-cyan-200" />
                      Body
                    </label>
                    <textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="可选请求体，常用于 POST / PUT / PATCH"
                      className="h-36 w-full resize-none rounded-[22px] border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-[13px] leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleExecute()}
                      disabled={loading || !isValidUrl || !headersValid}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {loading ? "Relay Running" : "Execute Relay"}
                      {!loading ? <ArrowRight size={16} /> : null}
                    </button>

                    <button
                      type="button"
                      onClick={() => proxyLink && copyToClipboard(proxyLink, "link")}
                      disabled={!proxyLink}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copiedLink ? <Check size={16} className="text-emerald-300" /> : <ExternalLink size={16} />}
                      {copiedLink ? "GET Link Copied" : "复制 GET 快捷入口"}
                    </button>
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                      {error}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                    <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      <TerminalSquare size={13} />
                      Standard Payload
                    </p>
                    <pre className="mt-3 overflow-x-auto rounded-[18px] border border-white/8 bg-black/30 px-4 py-4 font-mono text-[12px] leading-6 text-slate-200">
                      {standardPayload}
                    </pre>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    <Metric label="Status" value={response.status ? String(response.status) : "--"} />
                    <Metric label="Lines" value={String(resultStats.lines)} />
                    <Metric label="Size" value={formattedResultSize} />
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                    <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      <ScanSearch size={13} />
                      Quick Access
                    </p>
                    <pre className="mt-3 overflow-x-auto rounded-[18px] border border-white/8 bg-black/30 px-4 py-4 font-mono text-[12px] leading-6 text-slate-200">
                      {proxyLink || "/api/proxy?url=https%3A%2F%2Fexample.com%2Fdata"}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[30px] border border-slate-900/80 bg-[linear-gradient(180deg,#f4f7fb_0%,#eef3f7_100%)] p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] md:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_60%)]" />

          <div className="relative flex h-full flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-slate-600">
                  <Radar size={13} />
                  LIVE RESULT
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950 md:text-[38px]">
                  目标网址的访问结果
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">这里专门展示上游响应体和响应头摘要，不再承担教程说明。</p>
              </div>

              {response.body ? (
                <button
                  type="button"
                  onClick={() => copyToClipboard(response.body, "response")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-white"
                >
                  {copiedResponse ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedResponse ? "Copied" : "复制响应"}
                </button>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-slate-900/10 bg-white/80 p-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(response.headers).length > 0 ? (
                  Object.entries(response.headers).map(([key, value]) => (
                    <span
                      key={key}
                      className="rounded-full border border-slate-900/10 bg-slate-950 px-3 py-1 text-[11px] text-slate-200"
                    >
                      {key}: {truncate(value, 48)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">执行请求后，这里会显示响应头摘要。</span>
                )}
              </div>

              <pre className="mt-4 min-h-[70vh] overflow-auto whitespace-pre-wrap break-all rounded-[18px] border border-slate-900/10 bg-slate-950 px-4 py-4 font-mono text-[12px] leading-6 text-cyan-100 custom-scrollbar">
                {response.body || "执行一次代理请求后，目标网址的响应内容会显示在这里。"}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function RailButton({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-[18px] border px-3 py-3 text-sm font-medium transition lg:flex-col lg:justify-center lg:px-2 lg:py-4 ${
        active
          ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-100"
          : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/16 hover:bg-white/[0.06]"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-xs lg:text-[11px]">{label}</span>
      {badge ? (
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-200">{badge}</span>
      ) : null}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const icons: Record<string, ReactNode> = {
    Status: <Radar size={15} className="text-cyan-200" />,
    Lines: <ReceiptText size={15} className="text-cyan-200" />,
    Size: <Waypoints size={15} className="text-cyan-200" />,
  };

  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
        {icons[label]}
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function truncate(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit)}...`;
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function extractErrorMessage(payload: string) {
  try {
    const parsed = JSON.parse(payload) as { message?: string };
    return parsed.message;
  } catch {
    return null;
  }
}
