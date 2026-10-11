import dns from "node:dns";
import fs from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

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
  modelUsed: "google-imagen" | "pollinations-flux" | "photographic-stock";
}

export interface GenerateImagesOutput {
  totalPrompts: number;
  promptsUsed: string[];
  generatedImages: GeneratedSceneImage[];
}

export interface GenerateImagesParams {
  imagePrompts: string[];
  seriesId?: string;
  visualStyle?: string | null;
  supabase?: SupabaseClient | null;
}

// Curated high-resolution vertical 9:16 photography for popular video themes
const THEMATIC_COLLECTIONS: Record<string, string[]> = {
  history: [
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1080&h=1920&fit=crop", // Colosseum
    "https://images.unsplash.com/photo-1544986581-efac024faf62?w=1080&h=1920&fit=crop", // Roman Forum
    "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1080&h=1920&fit=crop", // Ancient ruins
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1080&h=1920&fit=crop", // Classical sculpture
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1080&h=1920&fit=crop", // Greek pillars
  ],
  scary: [
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&h=1920&fit=crop", // Dark mist
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&h=1920&fit=crop", // Dark eerie woods
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1080&h=1920&fit=crop", // Dark fog path
    "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=1080&h=1920&fit=crop", // Shadow night
  ],
  tech: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&h=1920&fit=crop", // Microchip
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&h=1920&fit=crop", // Digital matrix
    "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1080&h=1920&fit=crop", // High-tech neon
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1080&h=1920&fit=crop", // Cyber security
  ],
  space: [
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1080&h=1920&fit=crop", // Nebula
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&h=1920&fit=crop", // Earth from orbit
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1080&h=1920&fit=crop", // Deep cosmic sky
    "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?w=1080&h=1920&fit=crop", // Milky Way
  ],
  success: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&h=1920&fit=crop", // Glass skyscrapers
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1080&h=1920&fit=crop", // Executive luxury
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1080&h=1920&fit=crop", // Gold watch wealth
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1080&h=1920&fit=crop", // Creative studio
  ],
  nature: [
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&h=1920&fit=crop", // Mountain mist
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1080&h=1920&fit=crop", // Forest valley
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&h=1920&fit=crop", // Ocean waves
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1080&h=1920&fit=crop", // Sunlight trees
  ],
};

function getCuratedThematicUrl(prompt: string, sceneIndex: number): string {
  const p = prompt.toLowerCase();
  let collection: string[] | null = null;

  if (
    p.includes("rome") ||
    p.includes("roman") ||
    p.includes("colosseum") ||
    p.includes("gladiator") ||
    p.includes("history") ||
    p.includes("ancient") ||
    p.includes("caesar") ||
    p.includes("empire") ||
    p.includes("myth") ||
    p.includes("greek")
  ) {
    collection = THEMATIC_COLLECTIONS.history;
  } else if (
    p.includes("horror") ||
    p.includes("scary") ||
    p.includes("dark") ||
    p.includes("ghost") ||
    p.includes("creepy") ||
    p.includes("mystery") ||
    p.includes("shadow")
  ) {
    collection = THEMATIC_COLLECTIONS.scary;
  } else if (
    p.includes("tech") ||
    p.includes("future") ||
    p.includes("cyber") ||
    p.includes("ai") ||
    p.includes("robot") ||
    p.includes("code") ||
    p.includes("computer")
  ) {
    collection = THEMATIC_COLLECTIONS.tech;
  } else if (
    p.includes("space") ||
    p.includes("galaxy") ||
    p.includes("planet") ||
    p.includes("star") ||
    p.includes("universe") ||
    p.includes("cosmos")
  ) {
    collection = THEMATIC_COLLECTIONS.space;
  } else if (
    p.includes("money") ||
    p.includes("rich") ||
    p.includes("success") ||
    p.includes("luxury") ||
    p.includes("business") ||
    p.includes("dollar") ||
    p.includes("wealth")
  ) {
    collection = THEMATIC_COLLECTIONS.success;
  } else if (
    p.includes("nature") ||
    p.includes("ocean") ||
    p.includes("mountain") ||
    p.includes("forest") ||
    p.includes("river") ||
    p.includes("tree")
  ) {
    collection = THEMATIC_COLLECTIONS.nature;
  }

  if (collection && collection.length > 0) {
    return collection[sceneIndex % collection.length];
  }

  // Consistent, unique vertical stock image per scene
  const hash = Math.abs(
    prompt.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0) +
      sceneIndex * 31
  );
  return `https://picsum.photos/seed/${hash}/1080/1920`;
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

/**
 * Primary Generator: Google AI Imagen (with fast timeout failover)
 */
async function generateWithGoogleImagen(
  prompt: string,
  apiKey: string
): Promise<Buffer | null> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 2500)
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
 * Secondary Generator: Pollinations with defensive fallback
 */
async function generateWithPollinations(prompt: string): Promise<Buffer | null> {
  try {
    // Sanitize prompt and keep core descriptive words
    const sanitizedPrompt = prompt
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100);

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(sanitizedPrompt)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "image/jpeg,image/png,image/*",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const arrayBuf = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      if (buffer.length > 1000) {
        return buffer;
      }
    }
  } catch {
    // Gracefully handled by next tier
  }

  return null;
}

/**
 * Tertiary Generator: Curated High-Definition Thematic Vertical Photography
 */
async function fetchThematicStockBuffer(
  prompt: string,
  sceneIndex: number
): Promise<{ buffer: Buffer; sourceUrl: string } | null> {
  try {
    const imageUrl = getCuratedThematicUrl(prompt, sceneIndex);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      if (buffer.length > 500) {
        return { buffer, sourceUrl: imageUrl };
      }
    }
  } catch {
    // Fall back to direct URL
  }

  return null;
}

/**
 * Generates an image for a single scene with guaranteed zero-failure multi-tier cascade.
 */
export async function generateSingleSceneImage(
  prompt: string,
  sceneNumber: number,
  promptIndex: number,
  seriesId: string,
  supabase?: SupabaseClient | null
): Promise<GeneratedSceneImage> {
  const googleApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  let imageBuffer: Buffer | null = null;
  let modelUsed: "google-imagen" | "pollinations-flux" | "photographic-stock" =
    "photographic-stock";
  let fallbackStockUrl: string | null = null;

  // 1. Try Google Imagen
  if (googleApiKey && googleApiKey !== "your_gemini_api_key_here") {
    imageBuffer = await generateWithGoogleImagen(prompt, googleApiKey);
    if (imageBuffer) {
      modelUsed = "google-imagen";
    }
  }

  // 2. Try Pollinations with defensive timeout & error recovery
  if (!imageBuffer) {
    imageBuffer = await generateWithPollinations(prompt);
    if (imageBuffer) {
      modelUsed = "pollinations-flux";
    }
  }

  // 3. Guaranteed High-Res Thematic Vertical Photography
  if (!imageBuffer) {
    const stockResult = await fetchThematicStockBuffer(prompt, promptIndex);
    if (stockResult) {
      imageBuffer = stockResult.buffer;
      fallbackStockUrl = stockResult.sourceUrl;
      modelUsed = "photographic-stock";
    } else {
      fallbackStockUrl = getCuratedThematicUrl(prompt, promptIndex);
    }
  }

  // 4. Save image (Supabase Storage -> Local Public -> Direct Stock URL)
  let imageUrl: string = "";
  let storagePath: string | null = null;
  let storageType: "supabase" | "local" | "pollinations" | "data-uri" = "local";

  if (imageBuffer && supabase) {
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

  if (!imageUrl && imageBuffer) {
    const localUrl = await saveImageToLocal(imageBuffer, seriesId, sceneNumber);
    if (localUrl) {
      imageUrl = localUrl;
      storageType = "local";
    }
  }

  if (!imageUrl) {
    imageUrl = fallbackStockUrl || getCuratedThematicUrl(prompt, promptIndex);
    storageType = "pollinations";
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
  const { imagePrompts, seriesId = "series-default", supabase } = params;

  if (!imagePrompts || imagePrompts.length === 0) {
    throw new Error("No image prompts provided for image generation.");
  }

  const generatedImages: GeneratedSceneImage[] = [];

  for (let i = 0; i < imagePrompts.length; i++) {
    const prompt = imagePrompts[i];
    const sceneNumber = i + 1;

    const img = await generateSingleSceneImage(
      prompt,
      sceneNumber,
      i,
      seriesId,
      supabase
    );
    generatedImages.push(img);

    // Brief pacing between scenes
    if (i < imagePrompts.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return {
    totalPrompts: imagePrompts.length,
    promptsUsed: imagePrompts,
    generatedImages,
  };
}
