export type ClipSeries = {
  id: string;
  name: string;
  createdAt: number;
  duration?: "30-50" | "60-70";
  platforms?: string[];
  publishTime?: string;
  niche?: string;
  voice?: string;
  music?: string;
  visualStyle?: string;
  captionStyle?: string;
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
