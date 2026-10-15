import type { SupabaseClient } from "@supabase/supabase-js";
import type { VideoScriptOutput } from "@/lib/ai/generate-script";
import type { VoiceoverOutput } from "@/lib/ai/generate-voice";
import type { CaptionsOutput } from "@/lib/ai/generate-captions";
import type { GeneratedSceneImage } from "@/lib/ai/generate-images";

export type VideoGenerationStatus = "idle" | "generating" | "completed" | "failed";

export interface GeneratedVideoRecord {
  id: string;
  seriesId: string;
  seriesName?: string;
  videoTitle: string;
  thumbnailUrl: string | null;
  videoUrl?: string | null;
  status: "completed";
  metadata: {
    script: VideoScriptOutput;
    voice: VoiceoverOutput;
    captions: CaptionsOutput;
    images: GeneratedSceneImage[];
  };
  createdAt: string;
}

export interface VideoProgressState {
  seriesId: string;
  seriesName?: string;
  status: VideoGenerationStatus;
  currentStep: number; // 1 to 6
  stepLabel: string;
  progressPercent: number; // 0 to 100
  error?: string | null;
  updatedAt: number;
  video?: GeneratedVideoRecord | null;
}

// Global in-memory cache to maintain state across serverless calls and dev reloads
const globalForVideos = globalThis as unknown as {
  videoProgressStore: Map<string, VideoProgressState>;
  completedVideosStore: Map<string, GeneratedVideoRecord>;
};

if (!globalForVideos.videoProgressStore) {
  globalForVideos.videoProgressStore = new Map();
}
if (!globalForVideos.completedVideosStore) {
  globalForVideos.completedVideosStore = new Map();
}

export const videoProgressStore = globalForVideos.videoProgressStore;
export const completedVideosStore = globalForVideos.completedVideosStore;

const globalVideoIndex = globalThis as unknown as {
  allCompletedVideos: Map<string, GeneratedVideoRecord>;
};

if (!globalVideoIndex.allCompletedVideos) {
  globalVideoIndex.allCompletedVideos = new Map();
}

export const allCompletedVideos = globalVideoIndex.allCompletedVideos;

export interface VideoCatalogItem {
  id: string;
  seriesId: string;
  seriesName: string;
  videoTitle: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  sceneCount: number;
  createdAt: string;
}

const VIDEO_BUCKET = "video-records";

export function toCatalogItem(video: GeneratedVideoRecord): VideoCatalogItem {
  return {
    id: video.id,
    seriesId: video.seriesId,
    seriesName: video.seriesName || "Series",
    videoTitle: video.videoTitle,
    thumbnailUrl: video.thumbnailUrl,
    durationSeconds: Math.round(video.metadata?.voice?.durationSeconds || 0),
    sceneCount: video.metadata?.images?.length || video.metadata?.script?.scenes?.length || 0,
    createdAt: video.createdAt,
  };
}

function rememberVideo(video: GeneratedVideoRecord) {
  allCompletedVideos.set(video.id, video);
  completedVideosStore.set(video.seriesId, video);
}

async function ensureVideoBucket(supabase: SupabaseClient) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === VIDEO_BUCKET)) {
    await supabase.storage.createBucket(VIDEO_BUCKET, { public: false });
  }
}

async function persistVideoRecord(supabase: SupabaseClient, video: GeneratedVideoRecord) {
  await ensureVideoBucket(supabase);
  const body = JSON.stringify(video);
  const { error: recordError } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(`records/${video.id}.json`, Buffer.from(body), {
      contentType: "application/json",
      upsert: true,
    });
  if (recordError) throw recordError;

  const existing = await readCatalog(supabase);
  const next = [toCatalogItem(video), ...existing.filter((item) => item.id !== video.id)];
  const { error: catalogError } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload("catalog.json", Buffer.from(JSON.stringify(next)), {
      contentType: "application/json",
      upsert: true,
    });
  if (catalogError) throw catalogError;
}

async function readCatalog(supabase: SupabaseClient): Promise<VideoCatalogItem[]> {
  const { data, error } = await supabase.storage.from(VIDEO_BUCKET).download("catalog.json");
  if (error || !data) return [];
  const parsed = JSON.parse(await data.text()) as VideoCatalogItem[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function listVideoCatalog(supabase?: SupabaseClient | null): Promise<VideoCatalogItem[]> {
  const byId = new Map<string, VideoCatalogItem>();

  if (supabase) {
    try {
      for (const item of await readCatalog(supabase)) {
        byId.set(item.id, item);
      }
    } catch (err) {
      console.warn("[VIDEO_CATALOG_READ]", err);
    }
  }

  for (const video of allCompletedVideos.values()) {
    byId.set(video.id, toCatalogItem(video));
  }
  for (const video of completedVideosStore.values()) {
    byId.set(video.id, toCatalogItem(video));
  }

  if (supabase) {
    const storedIds = new Set<string>();
    try {
      for (const item of await readCatalog(supabase)) storedIds.add(item.id);
    } catch {
      storedIds.clear();
    }
    for (const video of [...allCompletedVideos.values(), ...completedVideosStore.values()]) {
      if (storedIds.has(video.id)) continue;
      storedIds.add(video.id);
      try {
        await persistVideoRecord(supabase, video);
      } catch (err) {
        console.warn("[VIDEO_RECORD_BACKFILL]", err);
      }
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getVideoById(
  videoId: string,
  supabase?: SupabaseClient | null,
): Promise<GeneratedVideoRecord | null> {
  const cached = allCompletedVideos.get(videoId);
  if (cached) return cached;

  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage.from(VIDEO_BUCKET).download(`records/${videoId}.json`);
    if (error || !data) return null;
    const record = JSON.parse(await data.text()) as GeneratedVideoRecord;
    rememberVideo(record);
    return record;
  } catch (err) {
    console.warn("[VIDEO_RECORD_READ]", err);
    return null;
  }
}

export const STEP_LABELS: Record<number, string> = {
  1: "Setting up series and audio preferences...",
  2: "Writing engaging script and scene concepts...",
  3: "Creating voiceover narration...",
  4: "Aligning subtitles and timings...",
  5: "Generating high-definition scene artwork...",
  6: "Assembling video and finalizing assets...",
};

/**
 * Updates in-memory and Supabase video generation progress.
 */
export async function updateVideoProgress(params: {
  seriesId: string;
  seriesName?: string;
  currentStep: number;
  stepLabel?: string;
  progressPercent: number;
  status?: VideoGenerationStatus;
  error?: string | null;
  video?: GeneratedVideoRecord | null;
  supabase?: SupabaseClient | null;
}): Promise<VideoProgressState> {
  const {
    seriesId,
    seriesName,
    currentStep,
    stepLabel = STEP_LABELS[currentStep] || "Processing...",
    progressPercent,
    status = "generating",
    error = null,
    video = null,
    supabase,
  } = params;

  const existing = videoProgressStore.get(seriesId);
  const state: VideoProgressState = {
    seriesId,
    seriesName: seriesName || existing?.seriesName || "Video Series",
    status,
    currentStep,
    stepLabel,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    error,
    updatedAt: Date.now(),
    video: video || existing?.video || null,
  };

  videoProgressStore.set(seriesId, state);

  if (video && status === "completed") {
    rememberVideo(video);
  }

  if (supabase && status === "completed" && video) {
    try {
      await persistVideoRecord(supabase, video);
    } catch (err) {
      console.warn("[VIDEO_RECORD_SAVE]", err);
    }
  }

  return state;
}

/**
 * Retrieves the current video state for a given series.
 */
export async function getVideoState(
  seriesId: string,
  supabase?: SupabaseClient | null
): Promise<VideoProgressState> {
  // 1. Check in-memory progress cache
  const inMemory = videoProgressStore.get(seriesId);
  if (inMemory && (inMemory.status === "generating" || inMemory.video)) {
    return inMemory;
  }

  // 2. Check in-memory completed cache
  const completed = completedVideosStore.get(seriesId);
  if (completed) {
    return {
      seriesId,
      seriesName: completed.seriesName,
      status: "completed",
      currentStep: 6,
      stepLabel: "Video ready!",
      progressPercent: 100,
      updatedAt: Date.now(),
      video: completed,
    };
  }

  // 3. Check Supabase videos table if available
  if (supabase) {
    try {
      const { data: dbVideo, error } = await supabase
        .from("videos")
        .select("*")
        .eq("series_id", seriesId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && dbVideo) {
        const record: GeneratedVideoRecord = {
          id: dbVideo.id,
          seriesId: dbVideo.series_id,
          seriesName: dbVideo.series_name,
          videoTitle: dbVideo.video_title,
          thumbnailUrl: dbVideo.thumbnail_url,
          videoUrl: dbVideo.video_url,
          status: "completed",
          metadata: dbVideo.metadata,
          createdAt: dbVideo.created_at || new Date().toISOString(),
        };

        completedVideosStore.set(seriesId, record);

        return {
          seriesId,
          seriesName: record.seriesName,
          status: "completed",
          currentStep: 6,
          stepLabel: "Video ready!",
          progressPercent: 100,
          updatedAt: Date.now(),
          video: record,
        };
      }
    } catch {
      // Supabase table query fallback
    }
  }

  if (supabase) {
    try {
      const latest = (await listVideoCatalog(supabase)).find((item) => item.seriesId === seriesId);
      if (latest) {
        const record = await getVideoById(latest.id, supabase);
        if (record) {
          return {
            seriesId,
            seriesName: record.seriesName,
            status: "completed",
            currentStep: 6,
            stepLabel: "Video ready!",
            progressPercent: 100,
            updatedAt: Date.now(),
            video: record,
          };
        }
      }
    } catch {
      // Catalog is optional when storage is unavailable.
    }
  }

  // 4. Default to idle state
  return {
    seriesId,
    status: "idle",
    currentStep: 0,
    stepLabel: "No generation in progress",
    progressPercent: 0,
    updatedAt: Date.now(),
    video: null,
  };
}
