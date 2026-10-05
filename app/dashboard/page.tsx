"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Video,
  Zap,
  MoreVertical,
  Pencil,
  Pause,
  Play,
  Trash2,
  Calendar,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import {
  type ClipSeries,
  readSeries,
  saveSeries,
  SERIES_CHANGED,
} from "@/components/dashboard/series-store";

// Sample series shown when no series has been scheduled yet
const DEFAULT_SAMPLE_SERIES: ClipSeries = {
  id: "sample-historical-stories",
  name: "Historical Stories",
  createdAt: new Date("2026-01-24T10:00:00").getTime(),
  status: "pending",
  platforms: ["youtube", "email"],
  niche: "history",
  image: "/niches/history.jpg",
  duration: "30-50",
  publishTime: "12:00 AM",
};

function resolveSeriesImage(item: ClipSeries): string {
  if (item.image) return item.image;
  const combined = ((item.name || "") + " " + (item.niche || "")).toLowerCase();
  if (combined.includes("histor")) return "/niches/history.jpg";
  if (combined.includes("scary") || combined.includes("horror")) return "/niches/scary_stories.jpg";
  if (combined.includes("crime")) return "/niches/true_crime.jpg";
  if (combined.includes("motivat")) return "/niches/motivational.jpg";
  if (combined.includes("tech") || combined.includes("ai")) return "/niches/tech_ai.jpg";
  if (combined.includes("fact")) return "/niches/facts.jpg";
  if (combined.includes("stoic") || combined.includes("philosophy")) return "/niches/stoicism.jpg";
  if (combined.includes("wealth") || combined.includes("business")) return "/niches/wealth.jpg";
  return "/niches/history.jpg";
}

function formatSeriesDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Jan 24, 2026";
  }
}

export default function SeriesPage() {
  const router = useRouter();
  const [seriesList, setSeriesList] = useState<ClipSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch from Supabase and sync with local store
  useEffect(() => {
    let isMounted = true;

    async function loadSeries() {
      try {
        const res = await fetch("/api/series");
        const json = await res.json().catch(() => null);

        if (json?.ok && Array.isArray(json.series) && json.series.length > 0 && isMounted) {
          interface DbSeries {
            id: string;
            series_name: string;
            created_at: string;
            duration?: "30-50" | "60-70";
            platforms?: string[];
            publish_time?: string;
            custom_niche_title?: string;
            selected_niche_id?: string;
            voice_model?: string;
            background_music_id?: string;
            visual_style?: string;
            caption_style?: string;
            status?: string;
          }

          const mapped: ClipSeries[] = json.series.map((item: DbSeries) => ({
            id: item.id,
            name: item.series_name,
            createdAt: new Date(item.created_at).getTime(),
            duration: item.duration,
            platforms: item.platforms,
            publishTime: item.publish_time,
            niche: item.custom_niche_title || item.selected_niche_id,
            voice: item.voice_model,
            music: item.background_music_id,
            visualStyle: item.visual_style,
            captionStyle: item.caption_style,
            status: item.status || "pending",
          }));

          setSeriesList(mapped);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Could not fetch database series, falling back to local storage:", err);
      }

      if (isMounted) {
        const local = readSeries();
        if (local.length > 0) {
          setSeriesList(local);
        } else {
          // Provide default sample series matching the exact user screenshot
          setSeriesList([DEFAULT_SAMPLE_SERIES]);
        }
        setIsLoading(false);
      }
    }

    const syncLocal = () => {
      const local = readSeries();
      if (local.length > 0) {
        setSeriesList(local);
      }
    };

    syncLocal();
    loadSeries();

    window.addEventListener(SERIES_CHANGED, syncLocal);
    return () => {
      isMounted = false;
      window.removeEventListener(SERIES_CHANGED, syncLocal);
    };
  }, []);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Toggle pause/resume
  async function handleTogglePause(item: ClipSeries) {
    const newStatus = item.status === "paused" ? "pending" : "paused";
    const updated = seriesList.map((s) => (s.id === item.id ? { ...s, status: newStatus } : s));
    setSeriesList(updated);
    saveSeries(updated);
    setOpenMenuId(null);

    try {
      await fetch("/api/series", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      });
      showToast(`Series ${newStatus === "paused" ? "paused" : "resumed"}`);
    } catch {
      // Local state is already updated
    }
  }

  // Delete series
  async function handleDelete(item: ClipSeries) {
    const updated = seriesList.filter((s) => s.id !== item.id);
    setSeriesList(updated);
    saveSeries(updated);
    setOpenMenuId(null);

    try {
      await fetch(`/api/series?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      showToast("Series deleted successfully");
    } catch {
      // Local state is already updated
    }
  }

  // Simulate or trigger video generation
  async function handleGenerate(item: ClipSeries) {
    setGeneratingId(item.id);
    setTimeout(() => {
      setGeneratingId(null);
      showToast(`Video generation queued for "${item.name}"!`);
    }, 1200);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-10 py-8 sm:py-10 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-zinc-900 text-white px-4 py-3 text-sm shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Your Series</h1>
          <p className="mt-1 text-sm sm:text-base text-zinc-500">
            Manage and monitor your automated video series.
          </p>
        </div>

        <Link
          href="/dashboard/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--dash-ink)] hover:bg-zinc-800 text-white px-5 py-2.5 text-sm font-semibold transition shadow-xs hover:shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-4 stroke-[2.5]" />
          New Series
        </Link>
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {seriesList.map((item) => {
          const imageSrc = resolveSeriesImage(item);
          const platforms = item.platforms && item.platforms.length > 0 ? item.platforms : ["youtube", "email"];
          const isMenuOpen = openMenuId === item.id;
          const isGenerating = generatingId === item.id;
          const statusText = (item.status || "pending").toUpperCase();

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col rounded-3xl border border-zinc-200/80 bg-white shadow-xs hover:shadow-md transition-all duration-200 ${
                isMenuOpen ? "z-40 ring-1 ring-black/5" : "z-10"
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[23px] bg-zinc-900 select-none">
                <Image
                  src={imageSrc}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Top-Left Status Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-xs backdrop-blur-xs ${
                      statusText === "PAUSED"
                        ? "bg-amber-600 text-white"
                        : "bg-[#10b981] text-white"
                    }`}
                  >
                    {statusText}
                  </span>
                </div>

                {/* Top-Right Floating Edit Button */}
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/create?id=${item.id}`)}
                  title="Edit Series"
                  className="absolute top-3.5 right-3.5 z-10 size-8 rounded-full bg-white/95 hover:bg-white text-zinc-700 hover:text-black shadow-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                </button>

                {/* Bottom-Left Platform Badges */}
                <div className="absolute bottom-3 left-3.5 z-10 flex items-center gap-1.5 flex-wrap">
                  {platforms.map((plat) => (
                    <span
                      key={plat}
                      className="bg-black/60 backdrop-blur-xs text-white/95 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10"
                    >
                      {plat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                {/* Title & Date & Menu */}
                <div className="relative">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight truncate"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                        <Calendar className="size-3.5 text-zinc-400" />
                        <span>{formatSeriesDate(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Three Dots Button */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : item.id);
                        }}
                        className="size-8 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition cursor-pointer"
                        title="Series options"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {/* Dropdown Menu (Screenshot 2) */}
                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-9 z-50 w-44 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                        >
                          {/* Edit Series */}
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              router.push(`/dashboard/create?id=${item.id}`);
                            }}
                            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition cursor-pointer text-left"
                          >
                            <Pencil className="size-3.5 text-zinc-500" />
                            Edit Series
                          </button>

                          {/* Pause / Resume */}
                          <button
                            type="button"
                            onClick={() => handleTogglePause(item)}
                            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition cursor-pointer text-left"
                          >
                            {item.status === "paused" ? (
                              <>
                                <Play className="size-3.5 text-zinc-500" />
                                Resume
                              </>
                            ) : (
                              <>
                                <Pause className="size-3.5 text-zinc-500" />
                                Pause
                              </>
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
                          >
                            <Trash2 className="size-3.5 text-red-500" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons (View Videos & Generate) */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <Link
                    href="/dashboard/video"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold py-2.5 px-3 transition shadow-2xs cursor-pointer text-center"
                  >
                    <Video className="size-3.5 text-zinc-600" />
                    View Videos
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleGenerate(item)}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--dash-ink)] hover:bg-zinc-800 text-white text-xs font-semibold py-2.5 px-3 transition shadow-xs cursor-pointer disabled:opacity-75 text-center"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="size-3.5 fill-white text-white" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
