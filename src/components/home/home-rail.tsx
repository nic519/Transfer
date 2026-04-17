import { ReactNode } from "react";
import { BookOpen, ChevronRight, Clock3, History, Trash2 } from "lucide-react";
import { HistoryEntry } from "@/lib/history";
import { ActivePanel, formatTimestamp } from "@/lib/home";

type HomeRailProps = {
  activePanel: ActivePanel;
  history: HistoryEntry[];
  standardPayload: string;
  proxyLink: string;
  onClearHistory: () => void;
  onSelectHistory: (entry: HistoryEntry) => void;
  onTogglePanel: (panel: Exclude<ActivePanel, null>) => void;
};

export function HomeRail({
  activePanel,
  history,
  standardPayload,
  proxyLink,
  onClearHistory,
  onSelectHistory,
  onTogglePanel,
}: HomeRailProps) {
  return (
    <aside className="relative z-50 self-start overflow-visible rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,21,0.94),rgba(8,12,21,0.82))] p-3 shadow-[0_24px_72px_rgba(0,0,0,0.28)] lg:sticky lg:top-6 lg:h-fit">
      <div className="flex flex-row gap-2 lg:flex-col">
        <RailButton
          icon={<History size={18} />}
          label="历史"
          active={activePanel === "history"}
          badge={history.length > 0 ? String(history.length) : undefined}
          onClick={() => onTogglePanel("history")}
        />
        <RailButton
          icon={<BookOpen size={18} />}
          label="教程"
          active={activePanel === "guide"}
          onClick={() => onTogglePanel("guide")}
        />
      </div>

      {activePanel === "history" ? (
        <div className="absolute left-[calc(100%+14px)] top-0 z-[60] w-[320px] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,25,0.98),rgba(7,11,19,0.98))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.36)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recent Requests</p>
              <h2 className="mt-1 text-lg font-semibold text-white">本地历史记录</h2>
              <p className="mt-1 text-sm text-slate-400">点击即可回填，不占首页主空间。</p>
            </div>
            <button
              type="button"
              onClick={onClearHistory}
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
                  onClick={() => onSelectHistory(entry)}
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
        <div className="absolute left-[calc(100%+14px)] top-0 z-[60] w-[360px] rounded-[28px] border border-slate-900/10 bg-[linear-gradient(180deg,#f4f7fb_0%,#eef3f7_100%)] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
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
