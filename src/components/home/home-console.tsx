import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  FileJson2,
  Globe,
  Keyboard,
  Loader2,
  ReceiptText,
  Send,
  TerminalSquare,
  Waypoints,
} from "lucide-react";
import { HistoryMethod } from "@/lib/history";

const METHOD_OPTIONS: HistoryMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

type HomeConsoleProps = {
  className?: string;
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
  className,
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
  const payloadPreview = JSON.parse(standardPayload) as {
    body: string;
    headers: Record<string, string>;
    method: string;
    url: string;
  };
  const previewHeaders = Object.entries(payloadPreview.headers);

  return (
    <section
      className={`relative z-0 flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(9,14,25,0.94),rgba(7,11,19,0.98))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:p-6 ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-12 top-24 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative flex min-h-0 h-full flex-1 flex-col gap-5">
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
        </div>

        <section className="min-h-0 flex-1 overflow-auto rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm custom-scrollbar">
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
                  className={`field-scrollbar h-12 w-full rounded-2xl border bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 ${url && !isValidUrl ? "border-rose-400/80" : "border-white/10 focus:border-cyan-300/70"
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
                  <div className="relative">
                    <select
                      value={method}
                      onChange={(event) => onMethodChange(event.target.value as HistoryMethod)}
                      className="field-scrollbar h-12 w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 pr-16 text-sm font-medium text-white outline-none transition focus:border-cyan-300/70"
                    >
                      {METHOD_OPTIONS.map((option) => (
                        <option key={option} value={option} className="bg-slate-950 text-white">
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      strokeWidth={2}
                      className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-200"
                    />
                  </div>
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
                  className={`field-scrollbar h-40 w-full resize-none rounded-[22px] border bg-slate-950/60 px-4 py-3 font-mono text-[13px] leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 ${headersValid ? "border-white/10 focus:border-cyan-300/70" : "border-rose-400/80"
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
                  className="field-scrollbar h-36 w-full resize-none rounded-[22px] border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-[13px] leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col items-start gap-2">
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
                  <p className="inline-flex items-center gap-2 mt-1 pl-2 text-xs text-slate-400">
                    <Keyboard size={13} />
                    Cmd / Ctrl + Enter
                  </p>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      <TerminalSquare size={13} />
                      Standard Payload
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <PreviewRow label="URL" value={payloadPreview.url} mono />
                  <PreviewRow
                    label="HEADERS"
                    value={
                      previewHeaders.length > 0
                        ? previewHeaders.map(([key, value]) => `${key}: ${value}`).join("\n")
                        : "No custom headers"
                    }
                    mono
                    multiline
                  />
                  <PreviewRow
                    label="BODY"
                    value={payloadPreview.body || "Empty body"}
                    mono
                    multiline
                  />
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      <ExternalLink size={13} />
                      生成的链接
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onCopyLink}
                    disabled={!proxyLink}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-300" /> : <ExternalLink size={14} />}
                    {copiedLink ? "Copied" : "复制链接"}
                  </button>
                </div>

                <div className="mt-4 border-t border-white/8 pt-4">
                  <p className=" break-all font-mono text-[13px] leading-7 text-slate-100">
                    {proxyLink || "/api/proxy?url=https%3A%2F%2Fexample.com%2Fdata"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function PreviewRow({
  label,
  value,
  mono = false,
  multiline = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="border-t border-white/8 pt-3 first:border-t-0 first:pt-0">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p
        className={`mt-2 text-sm leading-7 text-slate-100 ${mono ? "font-mono text-[13px]" : ""} ${multiline ? "whitespace-pre-wrap break-words" : "break-all"
          }`}
      >
        {value}
      </p>
    </div>
  );
}
