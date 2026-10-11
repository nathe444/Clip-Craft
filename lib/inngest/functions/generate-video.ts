import { inngest } from "../client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";
import { createAdminClient, hasSupabaseSecretKey } from "@/lib/supabase/admin";
import { generateVideoScript, type VideoScriptOutput } from "@/lib/ai/generate-script";
import { generateVoiceover, type VoiceoverOutput } from "@/lib/ai/generate-voice";
import { generateCaptions, type CaptionsOutput } from "@/lib/ai/generate-captions";
import { generateImagesForScenes, type GenerateImagesOutput } from "@/lib/ai/generate-images";
import { updateVideoProgress, type GeneratedVideoRecord } from "@/lib/video/video-store";
import { renderCompositionToMp4 } from "@/lib/remotion/lambda";
import type { VideoCompositionProps } from "@/remotion/types";

export interface GenerateVideoEventData {
  seriesId: string;
  seriesName?: string;
  userId?: string | null;
  [key: string]: unknown;
}

/**
 * Helper to obtain a Supabase client suitable for background worker execution
 * (uses service role / secret key if available, or publishable key with no cookies required).
 */
function getWorkerSupabaseClient() {
  if (hasSupabaseSecretKey()) {
    return createAdminClient();
  }
  const { url, key } = getSupabaseEnv();
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Inngest function: generateVideo
 * Workflow triggered when a user clicks "Generate" on a video series.
 * Runs 6 sequential steps:
 * 1. Fetch Series data from supabase (Real logic)
 * 2. Generate Video Script using AI (Placeholder)
 * 3. Generate Voice using TTS model (Placeholder)
 * 4. Generate Caption using Model (Placeholder)
 * 5. Generate Images from image prompt generated data from step 2 (Placeholder)
 * 6. Save everything to database (Placeholder)
 */
export const generateVideo = inngest.createFunction(
  {
    id: "generate-video",
    name: "Generate Video Workflow",
    triggers: [{ event: "video/generate" }],
    retries: 1,
  },
  async ({ event, step }) => {
    const data = event.data as GenerateVideoEventData;

    if (!data?.seriesId) {
      throw new Error("Missing required seriesId in event payload");
    }

    // =========================================================================
    // STEP 1: Fetch Series data from Supabase (Real Logic)
    // =========================================================================
    const series = await step.run("fetch-series-from-supabase", async () => {
      await updateVideoProgress({
        seriesId: data.seriesId,
        seriesName: data.seriesName,
        currentStep: 1,
        progressPercent: 12,
        status: "generating",
      });

      // Graceful fallback for sample dummy series during UI previews
      if (data.seriesId.startsWith("sample-")) {
        return {
          id: data.seriesId,
          series_name: data.seriesName || "Historical Stories",
          niche_type: "available",
          selected_niche_id: "history",
          custom_niche_title: null,
          custom_niche_description: null,
          language: "en-us",
          voice_model: "aura-2-zeus-en",
          background_music_id: "horror-suspense",
          music_volume: 18,
          visual_style: "cinematic",
          caption_style: "hormozi-pop",
          caption_density: "1-2-words",
          caption_position: "middle",
          caption_color: "#FACC15",
          duration: "30-50",
          platforms: ["youtube", "email"],
          status: "active",
          user_id: data.userId || null,
        };
      }

      if (!hasSupabaseEnv()) {
        throw new Error("Supabase environment variables are missing");
      }

      const supabase = getWorkerSupabaseClient();
      const { data: dbSeries, error } = await supabase
        .from("series")
        .select("*")
        .eq("id", data.seriesId)
        .single();

      if (error || !dbSeries) {
        throw new Error(
          `Failed to fetch series with id "${data.seriesId}": ${
            error?.message || "Record not found"
          }`
        );
      }

      return dbSeries;
    });

    // =========================================================================
    // STEP 2: Generate Video Script using AI (Google Gen AI - Gemini)
    // =========================================================================
    const script: VideoScriptOutput = await step.run(
      "generate-video-script-ai",
      async () => {
        await updateVideoProgress({
          seriesId: series.id,
          seriesName: series.series_name,
          currentStep: 2,
          progressPercent: 30,
          status: "generating",
        });

        return await generateVideoScript({
          seriesName: series.series_name,
          niche: series.selected_niche_id,
          customNicheTitle: series.custom_niche_title,
          customNicheDescription: series.custom_niche_description,
          visualStyle: series.visual_style,
          duration: series.duration,
          language: series.language,
        });
      }
    );

    // =========================================================================
    // STEP 3: Generate Voice using Deepgram TTS Model
    // =========================================================================
    const voice: VoiceoverOutput = await step.run("generate-voice-tts", async () => {
      await updateVideoProgress({
        seriesId: series.id,
        seriesName: series.series_name,
        currentStep: 3,
        progressPercent: 50,
        status: "generating",
      });

      const supabase = hasSupabaseEnv() ? getWorkerSupabaseClient() : null;
      return await generateVoiceover({
        text: script.fullScript,
        voiceModel: series.voice_model,
        language: series.language,
        seriesId: series.id,
        backgroundMusicId: series.background_music_id,
        musicVolume: series.music_volume,
        supabase,
      });
    });

    // =========================================================================
    // STEP 4: Generate Captions using Deepgram STT Model
    // =========================================================================
    const captions: CaptionsOutput = await step.run("generate-captions", async () => {
      await updateVideoProgress({
        seriesId: series.id,
        seriesName: series.series_name,
        currentStep: 4,
        progressPercent: 70,
        status: "generating",
      });

      return await generateCaptions({
        audioUrl: voice.audioUrl,
        fullScript: script.fullScript,
        durationSeconds: voice.durationSeconds,
        captionStyle: series.caption_style,
        captionDensity: series.caption_density,
        captionPosition: series.caption_position,
        captionColor: series.caption_color,
        language: series.language,
      });
    });

    // =========================================================================
    // STEP 5: Generate Visuals for Each Scene
    // =========================================================================
    const images: GenerateImagesOutput = await step.run(
      "generate-images-from-prompts",
      async () => {
        await updateVideoProgress({
          seriesId: series.id,
          seriesName: series.series_name,
          currentStep: 5,
          progressPercent: 88,
          status: "generating",
        });

        const supabase = hasSupabaseEnv() ? getWorkerSupabaseClient() : null;
        return await generateImagesForScenes({
          imagePrompts: script.imagePrompts,
          seriesId: series.id,
          visualStyle: series.visual_style,
          supabase,
        });
      }
    );

    // =========================================================================
    // STEP 6: Render Remotion composition to MP4 & save to database
    // =========================================================================
    const savedResult = await step.run("save-everything-to-database", async () => {
      const supabase = hasSupabaseEnv() ? getWorkerSupabaseClient() : null;

      // 1. Prepare Remotion Video Composition Props
      const compositionProps: VideoCompositionProps = {
        title: script.videoTitle,
        durationInSeconds: voice.durationSeconds,
        voiceoverAudioUrl: voice.audioUrl,
        backgroundMusicUrl: series.background_music_id
          ? `/music/${series.background_music_id}.mp3`
          : null,
        musicVolume: series.music_volume ?? 18,
        scenes: images.generatedImages.map((img, idx) => ({
          sceneNumber: img.sceneNumber,
          imageUrl: img.imageUrl,
          prompt: img.prompt,
          spokenText: script.scenes[idx]?.spokenText || "",
        })),
        subtitles: captions.subtitles,
        captionStyle: series.caption_style || "hormozi-pop",
        captionColor: series.caption_color || "#FACC15",
        captionPosition: series.caption_position || "middle",
        captionDensity: series.caption_density || "1-2-words",
      };

      // 2. Render Remotion Composition to MP4 using AWS Lambda
      const renderResult = await renderCompositionToMp4(compositionProps);

      // 3. Construct and save the finalized video record with the rendered MP4 URL
      const videoRecord: GeneratedVideoRecord = {
        id: `vid-${series.id}-${Date.now()}`,
        seriesId: series.id,
        seriesName: series.series_name,
        videoTitle: script.videoTitle,
        thumbnailUrl: images.generatedImages[0]?.imageUrl || null,
        videoUrl: renderResult.videoUrl || voice.audioUrl,
        status: "completed",
        metadata: {
          script,
          voice,
          captions,
          images: images.generatedImages,
        },
        createdAt: new Date().toISOString(),
      };

      await updateVideoProgress({
        seriesId: series.id,
        seriesName: series.series_name,
        currentStep: 6,
        progressPercent: 100,
        status: "completed",
        video: videoRecord,
        supabase,
      });

      return videoRecord;
    });

    return {
      success: true,
      seriesId: series.id,
      video: savedResult,
    };
  }
);
