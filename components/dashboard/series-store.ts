export type ClipSeries = {
  id: string;
  name: string;
  createdAt: number;
};

const KEY = "clipcraft.series";
export const SERIES_CHANGED = "clipcraft:series";

export function readSeries(): ClipSeries[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(sessionStorage.getItem(KEY) ?? "[]") as ClipSeries[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSeries(items: ClipSeries[]) {
  sessionStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(SERIES_CHANGED));
}
