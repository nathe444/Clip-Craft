import dns from "node:dns";
import fs from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { InferenceClient } from "@huggingface/inference";
import { VIDEO_STYLES } from "@/components/dashboard/create/video-styles";
import { stableImageSeed } from "@/lib/ai/scene-prompt";

// Prefer IPv4 to avoid Windows Node.js fetch DNS issues
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where setDefaultResultOrder is unavailable
}

export interface GeneratedSceneImage {
  sceneNumber: number;
  promptIndex: number;
  prompt: string;
  imageUrl: string;
  storagePath?: string | null;
  storageType: "supabase" | "local" | "pollinations" | "data-uri";
  aspectRatio: "9:16";
  modelUsed:
    | "huggingface-flux"
    | "huggingface-sdxl"
    | "google-imagen"
    | "pollinations-flux";
}

export interface GenerateImagesOutput {
  totalPrompts: number;
  promptsUsed: string[];
  generatedImages: GeneratedSceneImage[];
}

export interface GenerateImagesParams {
  imagePrompts: string[];
  scenes?: Array<{ spokenText?: string; imagePrompt?: string }>;
  visualAnchor?: string | null;
  niche?: string | null;
  seriesId?: string;
  visualStyle?: string | null;
  supabase?: SupabaseClient | null;
}

/**
 * Automatically enriches and optimizes scene prompts for high-fidelity 9:16 diffusion models (FLUX / SDXL).
 * Adds professional cinema camera optics, lighting, detail enhancements, and strict negative cues.
 */
export function enhanceImagePrompt(
  rawPrompt: string,
  visualStyleId?: string | null
): string {
  const prompt = (rawPrompt || "").trim();
  if (!prompt) return "the story subject in the story location. vertical portrait 9:16, no text, no logos.";
  if (/9:16/.test(prompt)) return prompt;

  const selectedStyle = VIDEO_STYLES.find((s) => s.id === visualStyleId);
  const style = (selectedStyle?.promptModifier || "photorealistic still")
    .split(",")
    .slice(0, 2)
    .join(",");

  return `${prompt}. ${style}. vertical portrait 9:16, no text, no logos.`;
}

/**
 * Uploads generated image buffer to Supabase Storage.
 */
async function uploadImageToSupabase(
  supabase: SupabaseClient,
  buffer: Buffer,
  seriesId: string,
  sceneNumber: number
): Promise<{ publicUrl: string; storagePath: string } | null> {
  const bucketName = "images";
  const sanitizedSeriesId = seriesId.replace(/[^a-zA-Z0-9-_]/g, "_");
  const fileName = `scenes/${sanitizedSeriesId}/scene-${sceneNumber}-${Date.now()}.jpg`;

  try {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === bucketName);
      if (!hasBucket) {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 25 * 1024 * 1024,
        });
      }
    } catch {
      // Continue if listBuckets is restricted
    }

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.warn("[STORAGE_UPLOAD_WARN]", uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    if (urlData?.publicUrl) {
      return {
        publicUrl: urlData.publicUrl,
        storagePath: `${bucketName}/${fileName}`,
      };
    }
  } catch (err) {
    console.warn("[STORAGE_UPLOAD_ERROR]", err);
  }

  return null;
}

/**
 * Saves image buffer to local public/ directory for instant dev preview.
 */
async function saveImageToLocal(
  buffer: Buffer,
  seriesId: string,
  sceneNumber: number
): Promise<string | null> {
  try {
    const sanitizedSeriesId = seriesId.replace(/[^a-zA-Z0-9-_]/g, "_");
    const outputDir = path.join(process.cwd(), "public", "generated-images", sanitizedSeriesId);
    await fs.mkdir(outputDir, { recursive: true });

    const fileName = `scene-${sceneNumber}-${Date.now()}.jpg`;
    const filePath = path.join(outputDir, fileName);

    await fs.writeFile(filePath, buffer);
    return `/generated-images/${sanitizedSeriesId}/${fileName}`;
  } catch (err) {
    console.warn("[LOCAL_IMAGE_SAVE_WARN] Could not write image locally:", err);
    return null;
  }
}

const HF_IMAGE_ROUTES: Array<{ provider: "fal-ai" | "wavespeed"; model: string }> = [
  { provider: "fal-ai", model: "black-forest-labs/FLUX.1-schnell" },
  { provider: "wavespeed", model: "black-forest-labs/FLUX.1-schnell" },
  { provider: "fal-ai", model: "black-forest-labs/FLUX.1-dev" },
];

async function generateWithHuggingFace(
  prompt: string,
  token: string,
  seed: number,
): Promise<{ buffer: Buffer; model: string } | null> {
  const client = new InferenceClient(token.trim());

  for (const route of HF_IMAGE_ROUTES) {
    try {
      const blob = await client.textToImage(
        {
          provider: route.provider,
          model: route.model,
          inputs: prompt,
          parameters: { width: 768, height: 1344, seed },
        },
        { outputType: "blob", signal: AbortSignal.timeout(60000) },
      );
      const buffer = Buffer.from(await blob.arrayBuffer());
      if (buffer.length > 1000) {
        return { buffer, model: `${route.provider}/${route.model}` };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[HF_IMAGE_GEN_WARN] ${route.provider} ${route.model}: ${msg.slice(0, 200)}`);
    }
  }

  return null;
}

/**
 * Pollinations FLUX. The anonymous endpoint is heavily rate-limited; set
 * POLLINATIONS_API_KEY for reliable access.
 */
async function generateWithPollinationsFlux(
  prompt: string,
  seed: number,
): Promise<Buffer | null> {
  try {
    const sanitizedPrompt = prompt
      .replace(/[\r\n]+/g, " ")
      .replace(/[^\w\s,.'-]/g, "")
      .trim()
      .slice(0, 520);

    const encodedPrompt = encodeURIComponent(sanitizedPrompt);
    const endpoints = [
      `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux&width=720&height=1280&nologo=true&seed=${seed}`,
      `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=720&height=1280&nologo=true&seed=${seed}`,
      `https://gen.pollinations.ai/image/${encodedPrompt}?model=turbo&width=720&height=1280&nologo=true&seed=${seed}`,
    ];

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const pollinationsKey = process.env.POLLINATIONS_API_KEY?.trim();
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "image/jpeg,image/png,image/*",
            ...(pollinationsKey ? { Authorization: `Bearer ${pollinationsKey}` } : {}),
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          const arrayBuf = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          if (
            buffer.length > 5000 &&
            !contentType.includes("json") &&
            !contentType.includes("html")
          ) {
            return buffer;
          }
        }
      } catch {
        // try next endpoint in array
      }
    }
  } catch (err) {
    console.warn("[POLLINATIONS_FLUX_WARN]", err);
  }

  return null;
}

/**
 * Fallback Generator: Google AI Imagen (with fast timeout failover)
 */
async function generateWithGoogleImagen(
  prompt: string,
  apiKey: string
): Promise<Buffer | null> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 18000)
    );

    const callPromise = (async () => {
      try {
        const response = await ai.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: "9:16",
            outputMimeType: "image/jpeg",
          },
        });
        const firstImage = response.generatedImages?.[0];
        const imageBytesBase64 = firstImage?.image?.imageBytes;
        if (imageBytesBase64) {
          return Buffer.from(imageBytesBase64, "base64");
        }
      } catch {
        return null;
      }
      return null;
    })();

    return await Promise.race([callPromise, timeoutPromise]);
  } catch {
    // Graceful fallback to next tier
  }

  return null;
}

/**
 * Generates one scene image. Tries Hugging Face Inference Providers, then
 * Pollinations, then Google Imagen. Throws instead of substituting stock photos,
 * because an unrelated image is worse than a retry.
 */
export async function generateSingleSceneImage(
  rawPrompt: string,
  sceneNumber: number,
  promptIndex: number,
  seriesId: string,
  visualStyle?: string | null,
  supabase?: SupabaseClient | null,
): Promise<GeneratedSceneImage> {
  const prompt = enhanceImagePrompt(rawPrompt, visualStyle);
  const seed = stableImageSeed(seriesId, sceneNumber);

  const hfToken =
    process.env.HUGGINGFACE_API_KEY ||
    process.env.HF_TOKEN ||
    process.env.HUGGING_FACE_HUB_TOKEN;

  const googleApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  let imageBuffer: Buffer | null = null;
  let modelUsed: GeneratedSceneImage["modelUsed"] = "huggingface-flux";

  if (hfToken && hfToken !== "your_huggingface_token_here") {
    const result = await generateWithHuggingFace(prompt, hfToken, seed);
    if (result) {
      imageBuffer = result.buffer;
      modelUsed = "huggingface-flux";
      console.log(`[IMAGE_GEN] Scene ${sceneNumber}: ${result.model}`);
    }
  }

  if (!imageBuffer) {
    imageBuffer = await generateWithPollinationsFlux(prompt, seed);
    if (imageBuffer) {
      modelUsed = "pollinations-flux";
      console.log(`[IMAGE_GEN] Scene ${sceneNumber}: Pollinations FLUX`);
    }
  }

  if (!imageBuffer && googleApiKey && googleApiKey !== "your_gemini_api_key_here") {
    imageBuffer = await generateWithGoogleImagen(prompt, googleApiKey);
    if (imageBuffer) {
      modelUsed = "google-imagen";
      console.log(`[IMAGE_GEN] Scene ${sceneNumber}: Google Imagen`);
    }
  }

  if (!imageBuffer) {
    throw new Error(
      `Image generation failed for scene ${sceneNumber}. Check HUGGINGFACE_API_KEY has Inference Providers credit, or set POLLINATIONS_API_KEY or GEMINI_API_KEY.`,
    );
  }

  // Save image (Supabase Storage -> Local Public -> Direct Stock URL)
  let imageUrl: string = "";
  let storagePath: string | null = null;
  let storageType: "supabase" | "local" | "pollinations" | "data-uri" = "local";

  if (supabase) {
    const supabaseResult = await uploadImageToSupabase(
      supabase,
      imageBuffer,
      seriesId,
      sceneNumber
    );
    if (supabaseResult) {
      imageUrl = supabaseResult.publicUrl;
      storagePath = supabaseResult.storagePath;
      storageType = "supabase";
    }
  }

  if (!imageUrl) {
    const localUrl = await saveImageToLocal(imageBuffer, seriesId, sceneNumber);
    if (localUrl) {
      imageUrl = localUrl;
      storageType = "local";
    }
  }

  if (!imageUrl) {
    imageUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
    storageType = "data-uri";
  }

  return {
    sceneNumber,
    promptIndex,
    prompt,
    imageUrl,
    storagePath,
    storageType,
    aspectRatio: "9:16",
    modelUsed,
  };
}

/**
 * Generates vertical 9:16 scene images for all script prompts.
 * Processes sequentially with small pacing to ensure rock-solid stability.
 */
export async function generateImagesForScenes(
  params: GenerateImagesParams
): Promise<GenerateImagesOutput> {
  const { imagePrompts, scenes, visualAnchor, seriesId = "series-default", visualStyle, supabase } = params;

  const fromScenes = scenes
    ?.map((scene, index) => (scene.imagePrompt || imagePrompts[index] || scene.spokenText || "").trim())
    .filter(Boolean);

  const activePrompts = fromScenes && fromScenes.length > 0 ? fromScenes : imagePrompts.filter(Boolean);

  if (activePrompts.length === 0) {
    throw new Error("No image prompts provided for image generation.");
  }

  const generatedImages: GeneratedSceneImage[] = [];

  for (let i = 0; i < activePrompts.length; i++) {
    const prompt = activePrompts[i];
    const sceneNumber = i + 1;

    console.log(
      `[IMAGE_GEN_START] Scene ${sceneNumber}/${activePrompts.length}: "${prompt.slice(0, 80)}..."`
    );

    const anchor = visualAnchor?.trim();
    const anchoredPrompt =
      anchor && !prompt.toLowerCase().includes(anchor.slice(0, 24).toLowerCase())
        ? `${anchor}. ${prompt}`
        : prompt;

    const img = await generateSingleSceneImage(
      anchoredPrompt,
      sceneNumber,
      i,
      seriesId,
      visualStyle,
      supabase,
    );
    generatedImages.push(img);

    console.log(
      `[IMAGE_GEN_DONE] Scene ${sceneNumber} succeeded via ${img.modelUsed} (${img.storageType})`
    );

    // Polite pacing to prevent endpoint rate limiting
    if (i < activePrompts.length - 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  return {
    totalPrompts: activePrompts.length,
    promptsUsed: activePrompts,
    generatedImages,
  };
}
