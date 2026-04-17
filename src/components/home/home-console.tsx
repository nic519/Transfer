import {
  ArrowRight,
  Check,
  ExternalLink,
  FileJson2,
  Globe,
  Keyboard,
  Loader2,
  Orbit,
  ReceiptText,
  Send,
  TerminalSquare,
  Waypoints,
} from "lucide-react";
import { HistoryMethod } from "@/lib/history";

const METHOD_OPTIONS: HistoryMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

type HomeConsoleProps = {
  body: string;
  copiedLink: boolean;
  error: string;
  headers: string;
  headersValid: boolean;
  isValidUrl: boolean;
  loading: boolean;
  method: HistoryMethod;
  proxyLink: string;
  standardPayload: string;
  url: string;
  sampleUrl: string;
  onBodyChange: (value: string) => void;
  onCopyLink: () => void;
  onExecute: () => void;
  onHeadersChange: (value: string) => void;
  onMethodChange: (value: HistoryMethod) => void;
  onUrlChange: (value: string) => void;
};

export function HomeConsole({
  body,
  copiedLink,
  error,
  headers,
  headersValid,
  isValidUrl,
  loading,
  method,
  proxyLink,
  standardPayload,
  url,
  sampleUrl,
  onBodyChange,
  onCopyLink,
  onExecute,
  onHeadersChange,
  onMethodChange,
  onUrlChange,
}: HomeConsoleProps) {
  return (
    <section className="relative z-0 overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(9,14,25,0.94),rgba(7,11,19,0.98))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:p-6">
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
                  onChange={(event) => onUrlChange(event.target.value)}
                  placeholder={sampleUrl}
                  className={`h-12 w-full rounded-2xl border bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 ${url && !isValidUrl ? "border-rose-400/80" : "border-white/10 focus:border-cyan-300/70"
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
                    onChange={(event) => onMethodChange(event.target.value as HistoryMethod)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm font-medium text-white outline-none transition focus:border-cyan-300/70"
                  >
                    {METHOD_OPTIONS.map((option) => (
                      <option key={option} value={option} className="bg-slate-950 text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>


              </div>

              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <FileJson2 size={15} className="text-cyan-200" />
                  Headers JSON
                </label>
                <textarea
                  value={headers}
                  onChange={(event) => onHeadersChange(event.target.value)}
                  placeholder={`{\n  "Authorization": "Bearer token"\n}`}
                  className={`h-40 w-full resize-none rounded-[22px] border bg-slate-950/60 px-4 py-3 font-mono text-[13px] leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 ${headersValid ? "border-white/10 focus:border-cyan-300/70" : "border-rose-400/80"
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
                  onChange={(event) => onBodyChange(event.target.value)}
                  placeholder="可选请求体，常用于 POST / PUT / PATCH"
                  className="h-36 w-full resize-none rounded-[22px] border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-[13px] leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onExecute}
                  disabled={loading || !isValidUrl || !headersValid}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {loading ? "Relay Running" : "Execute Relay"}
                  {!loading ? <ArrowRight size={16} /> : null}
                </button>

                <button
                  type="button"
                  onClick={onCopyLink}
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

              <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <ExternalLink size={13} />
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
  );
}
