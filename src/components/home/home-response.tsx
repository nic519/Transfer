import { Check, Copy, Radar } from "lucide-react";
import { ResponseSummary, truncate } from "@/lib/home";

type HomeResponseProps = {
  copiedResponse: boolean;
  response: ResponseSummary;
  onCopyResponse: () => void;
};

export function HomeResponse({ copiedResponse, response, onCopyResponse }: HomeResponseProps) {
  return (
    <section className="relative z-0 overflow-hidden rounded-[30px] border border-slate-900/80 bg-[linear-gradient(180deg,#f4f7fb_0%,#eef3f7_100%)] p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] md:p-6">
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
          </div>

          {response.body ? (
            <button
              type="button"
              onClick={onCopyResponse}
              className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-white"
            >
              {copiedResponse ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copiedResponse ? "Copied" : "复制响应"}
            </button>
          ) : null}
        </div>

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

        <pre className="min-h-[70vh] overflow-auto whitespace-pre-wrap break-all rounded-[22px] border border-slate-900/10 bg-slate-950 px-4 py-4 font-mono text-[12px] leading-6 text-cyan-100 custom-scrollbar">
          {response.body || "执行一次代理请求后，目标网址的响应内容会显示在这里。"}
        </pre>
      </div>
    </section>
  );
}
