import { inngest } from "../client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";
import { createAdminClient, hasSupabaseSecretKey } from "@/lib/supabase/admin";
import { generateVideoScript, type VideoScriptOutput } from "@/lib/ai/generate-script";

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
    // STEP 3: Generate Voice using TTS model (Placeholder)
    // =========================================================================
    const voice = await step.run("generate-voice-tts", async () => {
      // Placeholder: Call TTS API (e.g. Deepgram Aura / ElevenLabs) using series.voice_model
      return {
        voiceModel: series.voice_model || "aura-2-zeus-en",
        language: series.language || "en-us",
        audioUrl: "https://placeholder.audio/generated-voiceover-sample.mp3",
        durationSeconds: 42.5,
        format: "mp3",
        backgroundMusicId: series.background_music_id || "horror-suspense",
        musicVolume: series.music_volume ?? 18,
      };
    });

    // =========================================================================
    // STEP 4: Generate Caption using Model (Placeholder)
    // =========================================================================
    const captions = await step.run("generate-captions", async () => {
      // Placeholder: Generate word-level timed captions and typography metadata
      return {
        captionStyle: series.caption_style || "hormozi-pop",
        captionDensity: series.caption_density || "1-2-words",
        captionPosition: series.caption_position || "middle",
        accentColor: series.caption_color || "#FACC15",
        subtitles: [
          { start: 0.0, end: 1.2, text: "DID YOU KNOW" },
          { start: 1.2, end: 2.8, text: "THIS SHOCKING FACT" },
          { start: 2.8, end: 4.5, text: "LOST TO HISTORY?" },
        ],
      };
    });

    // =========================================================================
    // STEP 5: Generate Images from image prompt data from Step 2 (Placeholder)
    // =========================================================================
    const images = await step.run("generate-images-from-prompts", async () => {
      // Placeholder: Call Image Generation AI (e.g. Flux, Imagen, DALL-E) for each prompt from Step 2
      const generatedImages = script.imagePrompts.map((prompt, index) => ({
        sceneNumber: index + 1,
        promptIndex: index,
        prompt,
        imageUrl: `https://images.unsplash.com/photo-${1518709268805 + index}?w=1080&q=80`,
        aspectRatio: "9:16",
      }));

      return {
        totalPrompts: script.imagePrompts.length,
        promptsUsed: script.imagePrompts,
        generatedImages,
      };
    });

    // =========================================================================
    // STEP 6: Save everything to database (Placeholder)
    // =========================================================================
    const savedResult = await step.run("save-everything-to-database", async () => {
      // Placeholder: Persist final video record, generated assets, and status to Supabase
      return {
        seriesId: series.id,
        videoTitle: script.videoTitle,
        status: "completed",
        videoUrl: "https://placeholder.video/sample-render.mp4",
        thumbnailUrl: images.generatedImages[0]?.imageUrl || null,
        metadata: {
          script,
          voice,
          captions,
          images: images.generatedImages,
        },
        savedAt: new Date().toISOString(),
      };
    });

    return {
      success: true,
      seriesId: series.id,
      video: savedResult,
    };
  }
);
