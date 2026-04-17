import { Check, Copy, Radar, ReceiptText, Waypoints } from "lucide-react";
import { ResponseSummary, truncate } from "@/lib/home";

type HomeResponseProps = {
  copiedResponse: boolean;
  formattedResultSize: string;
  resultLines: number;
  response: ResponseSummary;
  onCopyResponse: () => void;
};

export function HomeResponse({
  copiedResponse,
  formattedResultSize,
  resultLines,
  response,
  onCopyResponse,
}: HomeResponseProps) {
  return (
    <section className="relative z-0 flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-slate-900/80 bg-[linear-gradient(180deg,#f4f7fb_0%,#eef3f7_100%)] p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] md:p-6 lg:max-h-[calc(100vh-3rem)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_60%)]" />

      <div className="relative flex min-h-0 flex-1 flex-col gap-5">
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

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Status" value={response.status ? String(response.status) : "--"} />
          <Metric label="Lines" value={String(resultLines)} />
          <Metric label="Size" value={formattedResultSize} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-slate-900/10 bg-white/80 p-4">
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

          <pre className="mt-4 min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-all rounded-[22px] border border-slate-900/10 bg-slate-950 px-4 py-4 font-mono text-[12px] leading-6 text-cyan-100 custom-scrollbar">
            {response.body || "执行一次代理请求后，目标网址的响应内容会显示在这里。"}
          </pre>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const icons = {
    Status: <Radar size={15} className="text-sky-600" />,
    Lines: <ReceiptText size={15} className="text-sky-600" />,
    Size: <Waypoints size={15} className="text-sky-600" />,
  };

  return (
    <div className="rounded-[18px] border border-slate-900/10 bg-white/80 px-4 py-3">
      <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {icons[label as keyof typeof icons]}
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
