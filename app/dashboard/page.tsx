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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <ul className="divide-y divide-[var(--dash-line)] rounded-2xl border border-[var(--dash-line)]">
        {series.map((item) => (
          <li key={item.id} className="px-5 py-4">
            <p className="text-sm font-medium">{item.name}</p>
            <p className="mt-1 text-xs text-[var(--dash-muted)]">
              Created {new Date(item.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
