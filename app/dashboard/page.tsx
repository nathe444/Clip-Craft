"use client";

import { useEffect, useState } from "react";
import { type ClipSeries, readSeries, SERIES_CHANGED } from "@/components/dashboard/series-store";

export default function SeriesPage() {
  const [series, setSeries] = useState<ClipSeries[]>([]);

  useEffect(() => {
    const sync = () => setSeries(readSeries());
    sync();
    window.addEventListener(SERIES_CHANGED, sync);
    return () => window.removeEventListener(SERIES_CHANGED, sync);
  }, []);

  if (series.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-medium tracking-[-0.03em]">No series yet</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--dash-muted)]">
            Create a series to generate short videos and schedule them across YouTube, Instagram,
            TikTok, and email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--dash-ink)]">Your Series</h1>
          <p className="text-sm text-[var(--dash-muted)]">
            Manage your automated content generation and publishing schedules.
          </p>
        </div>
      </div>

      <ul className="divide-y divide-[var(--dash-line)] rounded-3xl border border-[var(--dash-line)] bg-white overflow-hidden shadow-xs">
        {series.map((item) => (
          <li key={item.id} className="p-5 sm:p-6 hover:bg-zinc-50/50 transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-semibold text-[var(--dash-ink)]">{item.name}</h3>
                  {item.duration && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {item.duration}s
                    </span>
                  )}
                  {item.niche && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {item.niche}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--dash-muted)]">
                  <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.publishTime && (
                    <span className="flex items-center gap-1 font-medium text-emerald-700">
                      • Daily publish at {item.publishTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Platform Pills */}
              {item.platforms && item.platforms.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.platforms.map((plat) => (
                    <span
                      key={plat}
                      className="capitalize text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--dash-line)] bg-white text-[var(--dash-ink)]"
                    >
                      {plat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
