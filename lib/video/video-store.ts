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
    completedVideosStore.set(seriesId, video);
  }

  // Attempt to persist to Supabase if client is available
  if (supabase) {
    try {
      if (status === "completed" && video) {
        // Try inserting into videos table if exists
        await supabase
          .from("videos")
          .upsert({
            id: video.id,
            series_id: seriesId,
            video_title: video.videoTitle,
            status: "completed",
            thumbnail_url: video.thumbnailUrl,
            video_url: video.videoUrl,
            metadata: video.metadata,
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });
      }
    } catch {
      // Gracefully continue with in-memory cache
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
