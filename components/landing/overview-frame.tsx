"use client";

import { useState } from "react";
import { week } from "./content";

const activity = [
  { time: "2m ago", text: "Short rendered · Launch hook" },
  { time: "1h ago", text: "TikTok held for Tue 2:30 PM" },
  { time: "Today", text: "Instagram Reel on Mon 10:00 AM" },
  { time: "Yesterday", text: "YouTube Short published" },
];

const stats = [
  { label: "Scheduled", value: "18" },
  { label: "Generated", value: "12" },
  { label: "Published", value: "7" },
];

export function OverviewFrame() {
  const [day, setDay] = useState("wed");
  const selected = week.find((item) => item.id === day) ?? week[2];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[#101114] shadow-[0_30px_70px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <p className="text-sm">
          <span className="text-[var(--muted)]">Calendar</span>
          <span className="mx-2 text-[var(--faint)]">/</span>
          This week
        </p>
        <span className="rounded-md bg-[#f4f4f5] px-2.5 py-1 text-xs font-medium text-[#09090b]">
          Generate video
        </span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[var(--line)] bg-white/[0.03] px-3 py-3">
            <p className="text-xs text-[var(--muted)]">{stat.label}</p>
            <p className="mt-1 text-2xl font-medium tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[11px] tracking-[0.14em] text-[var(--faint)]">CONTENT CALENDAR</p>
          <div className="mt-3 grid grid-cols-7 gap-1.5" role="listbox" aria-label="This week">
            {week.map((item) => {
              const active = item.id === day;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => setDay(item.id)}
                  className={`rounded-lg border px-1 py-2 text-center transition ${
                    active
                      ? "border-white bg-white text-[#09090b]"
                      : "border-[var(--line)] bg-white/[0.03] hover:border-white/25"
                  }`}
                >
                  <span className="block text-[10px] tracking-wide uppercase">{item.label}</span>
                  <span className={`mt-2 block text-[10px] ${active ? "text-[#09090b]" : "text-[var(--muted)]"}`}>
                    {item.open ? "Open" : "Set"}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]" aria-live="polite">
            {selected.label} · {selected.slot}
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.14em] text-[var(--faint)]">RECENT ACTIVITY</p>
          <ul className="mt-3 space-y-2">
            {activity.map((item) => (
              <li key={item.text} className="rounded-lg border border-[var(--line)] px-3 py-2">
                <p className="text-sm">{item.text}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{item.time}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
