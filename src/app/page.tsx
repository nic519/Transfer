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
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";

const SAMPLE_URL = "https://example.com/clash.yaml";
const HEADER_PRESETS = [
  {
    key: "clash-meta",
    label: "clash.meta",
    headers: {
      "User-Agent": "clash.meta",
    },
  },
  {
    key: "mihomo",
    label: "mihomo",
    headers: {
      "User-Agent": "mihomo",
    },
  },
  {
    key: "clash-verge-rev",
    label: "Clash Verge Rev",
    headers: {
      "User-Agent": "Clash-Verge/v2.3.1",
    },
  },
  {
    key: "clash-for-windows",
    label: "Clash for Windows",
    headers: {
      "User-Agent": "Clash for Windows",
    },
  },
  {
    key: "stash",
    label: "Stash (iOS)",
    headers: {
      "User-Agent": "Stash iOS",
    },
  },
  {
    key: "nekobox",
    label: "NekoBox",
    headers: {
      "User-Agent": "NekoBox/Android",
    },
  },
] as const;

export default function Home() {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [headerPreset, setHeaderPreset] = useState("");
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
    const bytes = new TextEncoder().encode(result).length;
    return { chars, lines, bytes };
  }, [result]);

  const formattedResultSize = useMemo(() => {
    const bytes = resultStats.bytes;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }, [resultStats.bytes]);

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
  }, [loading]);

  const copyToClipboard = async (text: string, type: "result" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "result") {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1400);
      }
    } catch {
      setError("复制失败，请检查浏览器权限");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 md:px-6 md:py-6">
      <div className="pointer-events-none absolute -left-28 top-0 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-8 h-64 w-64 rounded-full bg-teal-300/35 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1320px] flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
        <section className="w-full rounded-[26px] border border-white/80 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:fixed lg:left-[max(1.5rem,calc(50%-660px))] lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[360px] lg:flex-none lg:overflow-auto lg:self-start lg:p-6">
          <div className="mb-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-slate-600">
              <Sparkles size={13} />
              TRANSFER LAB
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <h1 className="text-[20px] font-semibold leading-none tracking-[-0.03em] text-slate-900">Clash Console</h1>
              <div className="hidden items-center gap-1.5 rounded-xl bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-slate-100 lg:inline-flex">
                <Keyboard size={12} />
                Cmd/Ctrl + Enter
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">目标链接</label>
            <div
              className={`flex h-11 items-center gap-2 rounded-xl border bg-white px-3 transition focus-within:shadow-[0_0_0_4px_rgba(14,165,233,0.2)] ${url && !isValidUrl ? "border-red-400" : "border-slate-300/80"
                }`}
            >
              <Link2 size={17} className="text-slate-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/clash.yaml"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            {url && !isValidUrl && <p className="text-xs text-red-600">请输入合法的 http/https 地址</p>}
          </div>

          <div className="mt-3 space-y-2">
            <label className="block text-sm font-semibold text-slate-800">请求头 JSON（可选）</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <select
                value={headerPreset}
                onChange={(e) => {
                  const nextPreset = e.target.value;
                  setHeaderPreset(nextPreset);
                  const preset = HEADER_PRESETS.find((item) => item.key === nextPreset);
                  setHeaders(preset ? JSON.stringify(preset.headers, null, 2) : "");
                }}
                className="h-10 rounded-xl border border-slate-300/80 bg-white px-3 text-sm text-slate-900 outline-none transition focus:shadow-[0_0_0_4px_rgba(16,185,129,0.18)]"
              >
                <option value="">选择 Header 预设</option>
                {HEADER_PRESETS.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setHeaderPreset("");
                  setHeaders("");
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                清空
              </button>
            </div>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"User-Agent": "Clash/1.0"}'
              className={`h-36 w-full resize-none rounded-xl border bg-white px-3 py-2.5 font-mono text-[13px] leading-6 text-slate-900 outline-none transition focus:shadow-[0_0_0_4px_rgba(16,185,129,0.18)] ${headersValid ? "border-slate-300/80" : "border-red-400"
                }`}
            />
            {!headersValid && <p className="text-xs text-red-600">JSON 格式无效，请检查引号与逗号</p>}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={loading || !isValidUrl || !headersValid}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <TerminalSquare size={16} />}
              {loading ? "请求中" : "开始测试"}
              {!loading && <ArrowRight size={16} />}
            </button>
            <button
              type="button"
              disabled={!proxyLink}
              onClick={() => proxyLink && copyToClipboard(proxyLink, "link")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {copiedLink ? <Check size={16} className="text-emerald-600" /> : <ExternalLink size={16} />}
              {copiedLink ? "链接已复制" : "复制代理链接"}
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        <section className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-[26px] border border-slate-800/50 bg-gradient-to-b from-slate-950 to-slate-900 p-4 shadow-[0_24px_72px_rgba(2,6,23,0.38)] md:p-5 lg:ml-[380px] lg:h-[calc(100vh-3rem)] lg:overflow-auto custom-scrollbar">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <p className="ml-2 text-xs font-semibold tracking-[0.16em] text-slate-300">LIVE RESPONSE</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">{resultStats.lines} 行</span>
              <span className="rounded-full border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">{resultStats.chars} 字符</span>
              <span className="rounded-full border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">{formattedResultSize}</span>
              {result && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(result, "result")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? "已复制" : "复制内容"}
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {result ? (
              <pre className="min-h-[350px] rounded-2xl border border-white/10 bg-slate-900/90 p-4 font-mono text-xs leading-6 text-emerald-300 whitespace-pre-wrap break-all">
                {result}
              </pre>
            ) : (
              <div className="flex h-full min-h-[350px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-slate-900/70 text-center text-slate-300">
                <TerminalSquare size={30} className="text-slate-500" />
                <p className="text-sm">还没有结果，点击左侧“开始测试”</p>
                <p className="text-xs text-slate-500">请求返回内容会实时展示在这里</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
