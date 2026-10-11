"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video as VideoIcon,
  Zap,
  Sparkles,
  Download,
  Share2,
  Calendar,
  Volume2,
  FileText,
  Clock,
  ChevronDown,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { VideoProgressState, GeneratedVideoRecord } from "@/lib/video/video-store";
import { LiveProgress } from "@/components/dashboard/video/live-progress";
import { VideoPlayer } from "@/components/dashboard/video/video-player";
import { Storyboard } from "@/components/dashboard/video/storyboard";

interface SeriesItem {
  id: string;
  name: string;
  niche?: string;
  status?: string;
}

function VideoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const querySeriesId = searchParams.get("seriesId");

  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(querySeriesId || "");
  const [videoState, setVideoState] = useState<VideoProgressState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeTab, setActiveTab] = useState<"player" | "storyboard" | "script">("player");

  // Fetch series list to populate series switcher
  useEffect(() => {
    async function loadSeries() {
      try {
        const res = await fetch("/api/series");
        const data = await res.json();
        if (data?.ok && Array.isArray(data.series) && data.series.length > 0) {
          const mapped = data.series.map((s: { id: string; series_name: string; selected_niche_id?: string }) => ({
            id: s.id,
            name: s.series_name,
            niche: s.selected_niche_id,
          }));
          setSeriesList(mapped);

          // If no querySeriesId provided, default to first series
          if (!querySeriesId && mapped[0]) {
            setSelectedSeriesId(mapped[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load series list:", err);
      }
    }
    loadSeries();
  }, [querySeriesId]);

  // Sync selected series id when search param changes
  useEffect(() => {
    if (querySeriesId) {
      setSelectedSeriesId(querySeriesId);
    }
  }, [querySeriesId]);

  // Fetch current video state for the selected series
  const fetchVideoState = useCallback(async (seriesId: string) => {
    if (!seriesId) return;
    try {
      const res = await fetch(`/api/videos?seriesId=${encodeURIComponent(seriesId)}`);
      const data = await res.json();
      if (data?.ok && data.state) {
        setVideoState(data.state);
      }
    } catch (err) {
      console.error("Failed to fetch video state:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (selectedSeriesId) {
      setIsLoading(true);
      fetchVideoState(selectedSeriesId);
    } else {
      setIsLoading(false);
    }
  }, [selectedSeriesId, fetchVideoState]);

  // Polling loop when status === "generating"
  useEffect(() => {
    if (!selectedSeriesId) return;
    if (videoState?.status !== "generating") return;

    const interval = setInterval(() => {
      fetchVideoState(selectedSeriesId);
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedSeriesId, videoState?.status, fetchVideoState]);

  // Handle re-triggering generation
  const handleTriggerGenerate = async () => {
    if (!selectedSeriesId) return;
    setIsTriggering(true);
    const activeSeries = seriesList.find((s) => s.id === selectedSeriesId);
    try {
      const res = await fetch("/api/series/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId: selectedSeriesId,
          seriesName: activeSeries?.name || "Video Series",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        // Set local state to generating immediately for instant UI feedback
        setVideoState({
          seriesId: selectedSeriesId,
          seriesName: activeSeries?.name,
          status: "generating",
          currentStep: 1,
          stepLabel: "Queueing video generation workflow...",
          progressPercent: 10,
          updatedAt: Date.now(),
        });
      }
    } catch (err) {
      console.error("Trigger generate error:", err);
    } finally {
      setIsTriggering(false);
    }
  };

  const currentSeries = seriesList.find((s) => s.id === selectedSeriesId);
  const currentVideo = videoState?.video;
  const isGenerating = videoState?.status === "generating";
  const isCompleted = videoState?.status === "completed" && Boolean(currentVideo);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-10 py-8 sm:py-10 space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition cursor-pointer"
            title="Back to series"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Video Production
              </span>
              {isGenerating && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold animate-pulse">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Generating ({videoState?.progressPercent || 15}%)
                </span>
              )}
              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 text-white px-2 py-0.5 text-[10px] font-bold">
                  Ready
                </span>
              )}
            </div>

            {/* Series Title with Dropdown Selector */}
            <div className="flex items-center gap-2 mt-0.5">
              {seriesList.length > 1 ? (
                <div className="relative inline-block">
                  <select
                    value={selectedSeriesId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setSelectedSeriesId(nextId);
                      router.replace(`/dashboard/video?seriesId=${encodeURIComponent(nextId)}`);
                    }}
                    className="appearance-none bg-transparent pr-7 text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight cursor-pointer focus:outline-none"
                  >
                    {seriesList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                </div>
              ) : (
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                  {currentSeries?.name || "Video Series"}
                </h1>
              )}
            </div>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isCompleted && (
            <button
              type="button"
              onClick={handleTriggerGenerate}
              disabled={isTriggering || isGenerating}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 px-4 py-2.5 text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`size-3.5 ${isTriggering ? "animate-spin" : ""}`} />
              Re-generate
            </button>
          )}

          {currentVideo?.metadata.voice?.audioUrl && (
            <a
              href={currentVideo.metadata.voice.audioUrl}
              download="voiceover.mp3"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 px-4 py-2.5 text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <Download className="size-3.5" />
              Audio
            </a>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="size-8 animate-spin text-zinc-900" />
          <p className="text-sm text-zinc-500 font-medium">Loading video assets...</p>
        </div>
      ) : isGenerating ? (
        /* ================= 1. GENERATING STATE ================= */
        <LiveProgress
          state={videoState!}
          seriesName={currentSeries?.name}
        />
      ) : isCompleted && currentVideo ? (
        /* ================= 2. COMPLETED STATE ================= */
        <div className="space-y-8">
          {/* Video Title Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Generated Short Video
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 mt-0.5">
                {currentVideo.videoTitle}
              </h2>
            </div>

            {/* Segmented View Tabs */}
            <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-100/70 p-1 self-start md:self-auto">
              {(["player", "storyboard", "script"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Video Player & Metadata Grid */}
          {activeTab === "player" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Vertical Video Player (5 cols) */}
              <div className="lg:col-span-5 flex justify-center">
                <VideoPlayer video={currentVideo} />
              </div>

              {/* Right Column: Video Specs & Details (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Specs Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Duration
                    </div>
                    <div className="mt-1 text-base font-bold text-zinc-900 flex items-center gap-1.5">
                      <Clock className="size-4 text-emerald-600" />
                      <span>{Math.round(currentVideo.metadata.voice?.durationSeconds || 30)}s</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Total Scenes
                    </div>
                    <div className="mt-1 text-base font-bold text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="size-4 text-amber-500" />
                      <span>{currentVideo.metadata.images.length} Scenes</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Voice Narrator
                    </div>
                    <div className="mt-1 text-base font-bold text-zinc-900 flex items-center gap-1.5 truncate">
                      <Volume2 className="size-4 text-indigo-600" />
                      <span className="truncate">{currentVideo.metadata.voice?.voiceName || "Zeus"}</span>
                    </div>
                  </div>
                </div>

                {/* Voiceover & Audio Player Card */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <Volume2 className="size-4 text-zinc-600" />
                      <span>Studio Narration Track</span>
                    </h3>
                    <span className="text-xs font-mono text-zinc-400">
                      Deepgram Aura-2
                    </span>
                  </div>

                  {currentVideo.metadata.voice?.audioUrl && (
                    <audio
                      controls
                      src={currentVideo.metadata.voice.audioUrl}
                      className="w-full h-10 accent-zinc-900"
                    />
                  )}
                </div>

                {/* Spoken Script Preview Card */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <FileText className="size-4 text-zinc-600" />
                      <span>Full Voiceover Script</span>
                    </h3>
                    <span className="text-xs font-mono text-zinc-400">
                      {currentVideo.metadata.voice?.wordCount || 0} words
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 font-serif">
                    "{currentVideo.metadata.script.fullScript}"
                  </p>
                </div>

                {/* Quick Scene Thumbs Strip */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <span>Scene Visuals ({currentVideo.metadata.images.length})</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("storyboard")}
                      className="text-zinc-900 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
                    {currentVideo.metadata.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900"
                      >
                        <img
                          src={img.imageUrl}
                          alt={`Scene ${idx + 1}`}
                          className="size-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 rounded-sm bg-black/60 px-1 text-[9px] font-bold text-white">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Storyboard Grid */}
          {activeTab === "storyboard" && (
            <Storyboard video={currentVideo} />
          )}

          {/* Tab 3: Detailed Script Breakdown */}
          {activeTab === "script" && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-4">
                <h3 className="text-lg font-bold text-zinc-900">Scene Breakdown</h3>
                <div className="divide-y divide-zinc-100">
                  {currentVideo.metadata.script.scenes.map((scene, idx) => (
                    <div key={idx} className="py-4 space-y-2 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
                          {scene.sceneNumber}
                        </span>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Scene {scene.sceneNumber}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-800 italic pl-8">
                        "{scene.spokenText}"
                      </p>
                      <p className="text-xs text-zinc-500 pl-8">
                        <strong className="text-zinc-600">Prompt:</strong> {scene.imagePrompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= 3. IDLE / EMPTY STATE ================= */
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center max-w-xl mx-auto space-y-5 my-8">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 shadow-xs">
            <VideoIcon className="size-8 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900">No Video Generated Yet</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              Ready to create your first short-form video clip for{" "}
              <strong className="text-zinc-800">{currentSeries?.name || "this series"}</strong>?
            </p>
          </div>
          <button
            type="button"
            onClick={handleTriggerGenerate}
            disabled={isTriggering}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--dash-ink)] hover:bg-zinc-800 text-white px-6 py-3 text-sm font-semibold transition cursor-pointer shadow-sm hover:shadow-md disabled:opacity-75"
          >
            {isTriggering ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Queueing Generation...
              </>
            ) : (
              <>
                <Zap className="size-4 fill-white text-white" />
                Generate First Video
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function VideoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-zinc-900" />
        </div>
      }
    >
      <VideoContent />
    </Suspense>
  );
}
