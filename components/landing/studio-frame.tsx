import { queue } from "./content";
import { PlatformIcon } from "./icons";

const channels = ["YouTube Shorts", "Instagram Reels", "TikTok", "Email"];

export function StudioFrame() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[#101114] shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
        <p className="flex min-w-0 items-center gap-2 text-sm">
          <span className="size-2 shrink-0 rounded-full bg-emerald-400" />
          <span className="truncate text-[var(--muted)]">Workspace / Launch week</span>
        </p>
        <span className="shrink-0 rounded-md bg-[#f4f4f5] px-2.5 py-1 text-xs font-medium text-[#09090b]">
          Generate video
        </span>
      </div>
      <div className="grid lg:grid-cols-[11.5rem_1fr]">
        <aside className="hidden border-r border-[var(--line)] p-3 lg:block">
          <p className="px-2 pb-2 text-[11px] tracking-[0.14em] text-[var(--faint)]">LIBRARY</p>
          {["Generate", "Calendar", "Queue", "Brand"].map((item, index) => (
            <p
              key={item}
              className={`rounded-md px-2 py-2 text-sm ${index === 0 ? "bg-white/[0.08] text-white" : "text-[var(--muted)]"}`}
            >
              {item}
            </p>
          ))}
        </aside>
        <div className="grid gap-4 p-4 sm:grid-cols-[9.5rem_1fr] sm:p-5">
          <div className="mx-auto w-full max-w-[9.5rem]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-[#1a2433]">
              <div className="absolute inset-x-0 top-[46%] h-px bg-white/30" />
              <div className="absolute bottom-[28%] left-1/2 h-16 w-10 -translate-x-1/2 bg-[#e4c7a2]" />
              <div className="absolute inset-x-3 bottom-[14%] h-6 bg-[#0e1b28]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 pt-8">
                <p className="text-[11px] leading-snug text-white">The first frame is the product.</p>
              </div>
              <p className="absolute top-2 left-2 font-mono text-[10px] text-white/80">0:08 / 0:15</p>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.14em] text-[var(--faint)]">PROMPT</p>
            <p className="mt-2 rounded-lg border border-[var(--line)] bg-black/30 px-3 py-2.5 text-sm leading-6">
              A 15-second short on why the first frame has to be the product. Direct, no intro.
            </p>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--faint)]">
                <span className="tracking-[0.14em]">TIMELINE</span>
                <span className="font-mono">00:15</span>
              </div>
              <div className="relative h-8 overflow-hidden rounded-md bg-white/5">
                <span className="absolute top-1.5 bottom-1.5 left-[8%] w-[28%] rounded bg-white/25" />
                <span className="absolute top-1.5 bottom-1.5 left-[40%] w-[22%] rounded bg-white/15" />
                <span className="absolute top-1.5 bottom-1.5 left-[66%] w-[18%] rounded bg-white/20" />
                <span className="cc-playhead absolute top-0 bottom-0 w-px bg-white" />
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {channels.map((channel) => (
                <li
                  key={channel}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/5 px-2.5 py-1 text-xs"
                >
                  <PlatformIcon name={channel} className="size-3.5" />
                  {channel}
                </li>
              ))}
            </ul>
            <ul className="mt-4 divide-y divide-[var(--line)] border-t border-[var(--line)]">
              {queue.map((item) => (
                <li key={item.day} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="w-24 shrink-0 text-[var(--muted)]">{item.day}</span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-mono text-xs text-[var(--muted)]">{item.time}</span>
                    <span className="mx-2 text-[var(--faint)]">—</span>
                    {item.channel}
                  </span>
                  <span className="shrink-0 text-xs text-emerald-300">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
