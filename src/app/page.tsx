"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Keyboard,
  Link2,
  Loader2,
  TerminalSquare,
} from "lucide-react";

const SAMPLE_URL = "https://example.com/clash.yaml";
const SAMPLE_HEADERS = '{\n  "User-Agent": "Clash/1.0",\n  "X-Subscription-Token": "demo-token"\n}';

export default function Home() {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isValidUrl = useMemo(() => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, [url]);

  const headersValid = useMemo(() => {
    if (!headers.trim()) return true;
    try {
      JSON.parse(headers);
      return true;
    } catch {
      return false;
    }
  }, [headers]);

  const resultStats = useMemo(() => {
    const chars = result.length;
    const lines = result ? result.split("\n").length : 0;
    return { chars, lines };
  }, [result]);

  const proxyLink = useMemo(() => {
    if (!isValidUrl || typeof window === "undefined") return "";
    return `${window.location.origin}/api/proxy?url=${encodeURIComponent(url)}`;
  }, [url, isValidUrl]);

  const handleTest = async () => {
    if (!url) {
      setError("请输入目标链接");
      return;
    }
    if (!isValidUrl) {
      setError("请输入有效的 http(s) 链接");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      let customHeaders = {};
      if (headers.trim()) {
        try {
          customHeaders = JSON.parse(headers);
        } catch {
          setError("请求头 JSON 格式错误");
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, headers: customHeaders }),
      });

      const data = await response.text();
      if (!response.ok) {
        setError(data || `请求失败: ${response.status}`);
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "发生未知错误";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const withCommand = event.metaKey || event.ctrlKey;
      if (withCommand && event.key === "Enter" && !loading) {
        event.preventDefault();
        void handleTest();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, url, headers, isValidUrl]);

  const copyToClipboard = async (text: string, type: "result" | "link") => {
    await navigator.clipboard.writeText(text);
    if (type === "result") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 text-slate-900 md:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_-8%,rgba(59,130,246,0.24),transparent_30%),radial-gradient(circle_at_95%_0%,rgba(45,212,191,0.16),transparent_24%),linear-gradient(180deg,#edf6ff_0%,#f4f8fc_100%)]" />

      <div className="mx-auto grid h-[calc(100vh-3.2rem)] w-full max-w-7xl grid-cols-[420px_1fr] gap-5">
        <section className="flex min-h-0 flex-col overflow-auto rounded-[26px] bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-[22px] font-semibold tracking-tight">Clash 订阅测试</h1>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
              <Keyboard className="h-3.5 w-3.5" /> Cmd/Ctrl + Enter
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2">
            <button
              onClick={() => setUrl(SAMPLE_URL)}
              className="h-9 rounded-xl bg-slate-100 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
            >
              示例链接
            </button>
            <button
              onClick={() => setHeaders(SAMPLE_HEADERS)}
              className="h-9 rounded-xl bg-slate-100 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
            >
              示例请求头
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">目标链接</label>
              <div
                className={`flex h-12 items-center rounded-2xl bg-slate-100 px-3 transition focus-within:bg-white focus-within:ring-2 ${
                  url && !isValidUrl ? "focus-within:ring-red-200" : "focus-within:ring-cyan-200"
                }`}
              >
                <Link2 className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/clash.yaml"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">请求头 JSON（可选）</label>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder='{"User-Agent": "Clash/1.0"}'
                className={`h-40 w-full resize-none rounded-2xl bg-slate-100 px-3 py-3 font-mono text-sm outline-none transition focus:bg-white focus:ring-2 ${
                  headersValid ? "focus:ring-cyan-200" : "focus:ring-red-200"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTest}
                disabled={loading || !isValidUrl || !headersValid}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TerminalSquare className="h-4 w-4" />}
                {loading ? "请求中" : "开始测试"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
              <button
                disabled={!proxyLink}
                onClick={() => proxyLink && copyToClipboard(proxyLink, "link")}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <ExternalLink className="h-4 w-4" />}
                {copiedLink ? "已复制" : "复制链接"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-[26px] bg-slate-950 p-6 text-slate-100 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-[0.14em] text-slate-300">结果预览</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-slate-400">{resultStats.lines} 行</span>
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-slate-400">{resultStats.chars} 字符</span>
              {result && (
                <button
                  onClick={() => copyToClipboard(result, "result")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "已复制" : "复制内容"}
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {result ? (
              <pre className="h-full overflow-auto rounded-2xl bg-slate-900/92 p-4 font-mono text-xs leading-6 text-emerald-300">
                {result}
              </pre>
            ) : (
              <div className="flex h-full min-h-[380px] items-center justify-center rounded-2xl bg-slate-900/80 text-center">
                <div>
                  <TerminalSquare className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                  <p className="text-sm text-slate-300">还没有结果，点击左侧“开始测试”</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
