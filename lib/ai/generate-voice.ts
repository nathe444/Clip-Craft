import dns from "node:dns";
import fs from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEEPGRAM_LANGUAGES, type DeepgramVoice } from "@/components/dashboard/create/deepgram-voices";

// Prevent Windows Node.js fetch DNS errors by preferring IPv4
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where setDefaultResultOrder is unavailable
}

const DEEPGRAM_API_URL = "https://api.deepgram.com/v1/speak";
const DEFAULT_VOICE_MODEL = "aura-2-zeus-en";
const DEFAULT_LANGUAGE = "en-us";

export interface GenerateVoiceParams {
  text: string;
  voiceModel?: string | null;
  language?: string | null;
  seriesId?: string;
  backgroundMusicId?: string | null;
  musicVolume?: number | null;
  supabase?: SupabaseClient | null;
}

export interface VoiceoverOutput {
  audioUrl: string;
  storagePath: string | null;
  storageType: "supabase" | "local" | "data-uri";
  durationSeconds: number;
  format: "mp3";
  sizeBytes: number;
  voiceModel: string;
  voiceName: string;
  language: string;
  characterCount: number;
  wordCount: number;
  fullScript: string;
  backgroundMusicId: string;
  musicVolume: number;
}

/**
 * Resolves the Voice metadata from the curated Deepgram catalog
 */
export function getDeepgramVoiceInfo(
  modelId?: string | null,
  languageLocale?: string | null
): { voice: DeepgramVoice | null; model: string; name: string; lang: string } {
  const allVoices = DEEPGRAM_LANGUAGES.flatMap((l) => l.voices);

  // 1. Try finding by modelId
  if (modelId) {
    const found = allVoices.find((v) => v.model === modelId);
    if (found) {
      return {
        voice: found,
        model: found.model,
        name: found.name,
        lang: found.lang,
      };
    }
  }

  // 2. Try finding default voice for specified language locale
  if (languageLocale) {
    const langEntry = DEEPGRAM_LANGUAGES.find(
      (l) => l.locale.toLowerCase() === languageLocale.toLowerCase() || l.code.toLowerCase() === languageLocale.toLowerCase()
    );
    if (langEntry && langEntry.voices.length > 0) {
      const defaultVoice = langEntry.voices[0];
      return {
        voice: defaultVoice,
        model: defaultVoice.model,
        name: defaultVoice.name,
        lang: defaultVoice.lang,
      };
    }
  }

  // 3. Fallback to default English voice (Zeus)
  const defaultVoice = allVoices.find((v) => v.model === DEFAULT_VOICE_MODEL) || null;
  return {
    voice: defaultVoice,
    model: DEFAULT_VOICE_MODEL,
    name: defaultVoice?.name || "Zeus",
    lang: defaultVoice?.lang || DEFAULT_LANGUAGE,
  };
}

/**
 * Sanitizes voiceover script text for natural speech synthesis:
 * - Strips stage directions like [sound fades], (whispering)
 * - Strips speaker prefixes like "Narrator:", "Host:"
 * - Strips markdown symbols (*, _, #, ~, etc.)
 * - Cleans up spacing and line breaks
 */
export function sanitizeSpeechText(rawText: string): string {
  if (!rawText) return "";

  return rawText
    // Remove speaker prefixes, e.g. "Narrator:", "Host:", "Voice:"
    .replace(/^(narrator|speaker|voice|host)\s*:\s*/gim, "")
    // Remove bracketed instructions, e.g. [pause], [music swells], (laughs)
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    // Remove markdown formatting
    .replace(/[*_#~`>]/g, "")
    // Normalize dashes and smart quotes
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, ", ")
    // Collapse excess spaces and newlines
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculate accurate audio duration in seconds from an MP3 buffer by parsing MPEG frame headers.
 * Falls back to estimated duration based on speech rate (~145 words/minute).
 */
export function calculateMp3Duration(buffer: Buffer, wordCountFallback: number): number {
  if (!buffer || buffer.length === 0) {
    return Math.max(1, Number((wordCountFallback / 2.4).toFixed(1)));
  }

  try {
    let offset = 0;
    // Skip ID3v2 tag if present
    if (buffer.length > 10 && buffer.subarray(0, 3).toString("ascii") === "ID3") {
      const tagSize =
        ((buffer[6] & 0x7f) << 21) |
        ((buffer[7] & 0x7f) << 14) |
        ((buffer[8] & 0x7f) << 7) |
        (buffer[9] & 0x7f);
      offset = 10 + tagSize;
    }

    let totalDurationSeconds = 0;
    let frameCount = 0;

    // Bitrate tables in kbps for MPEG Audio Layer III
    const bitratesMpeg1Layer3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
    const bitratesMpeg2Layer3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];

    const sampleRatesMpeg1 = [44100, 48000, 32000];
    const sampleRatesMpeg2 = [22050, 24000, 16000];
    const sampleRatesMpeg25 = [11025, 12000, 8000];

    while (offset < buffer.length - 4) {
      // Find sync word: 11 bits of 1s (0xFF followed by 0xE0 mask)
      if (buffer[offset] === 0xff && (buffer[offset + 1] & 0xe0) === 0xe0) {
        const byte1 = buffer[offset + 1];
        const byte2 = buffer[offset + 2];

        const mpegVersion = (byte1 >> 3) & 0x03; // 3 = MPEG1, 2 = MPEG2, 0 = MPEG2.5
        const layer = (byte1 >> 1) & 0x03; // 1 = Layer III, 2 = Layer II, 3 = Layer I
        const bitrateIdx = (byte2 >> 4) & 0x0f;
        const sampleRateIdx = (byte2 >> 2) & 0x03;
        const padding = (byte2 >> 1) & 0x01;

        if (layer === 1 && bitrateIdx > 0 && bitrateIdx < 15 && sampleRateIdx < 3) {
          let bitrate = 0;
          let sampleRate = 0;
          let samplesPerFrame = 1152;

          if (mpegVersion === 3) {
            // MPEG 1
            bitrate = bitratesMpeg1Layer3[bitrateIdx];
            sampleRate = sampleRatesMpeg1[sampleRateIdx];
            samplesPerFrame = 1152;
          } else if (mpegVersion === 2 || mpegVersion === 0) {
            // MPEG 2 or 2.5
            bitrate = bitratesMpeg2Layer3[bitrateIdx];
            sampleRate = mpegVersion === 2 ? sampleRatesMpeg2[sampleRateIdx] : sampleRatesMpeg25[sampleRateIdx];
            samplesPerFrame = 576;
          }

          if (bitrate > 0 && sampleRate > 0) {
            const frameLength = Math.floor((samplesPerFrame / 8 * (bitrate * 1000)) / sampleRate) + padding;
            if (frameLength > 0 && offset + frameLength <= buffer.length) {
              totalDurationSeconds += samplesPerFrame / sampleRate;
              frameCount++;
              offset += frameLength;
              continue;
            }
          }
        }
      }
      offset++;
    }

    if (frameCount > 5 && totalDurationSeconds > 0) {
      return Number(totalDurationSeconds.toFixed(2));
    }
  } catch (err) {
    console.warn("[MP3_DURATION_PARSE_WARN] Failed parsing frames, falling back to estimation:", err);
  }

  // Fallback: standard speech rate estimation (~2.4 words per second)
  const estimated = Math.max(1.5, Number((wordCountFallback / 2.4).toFixed(1)));
  return estimated;
}

/**
 * Uploads voiceover audio to Supabase Storage with bucket auto-detection and fallback.
 */
async function uploadToSupabaseStorage(
  supabase: SupabaseClient,
  audioBuffer: Buffer,
  seriesId: string,
  modelName: string
): Promise<{ publicUrl: string; storagePath: string } | null> {
  const bucketName = "audio";
  const sanitizedSeriesId = seriesId.replace(/[^a-zA-Z0-9-_]/g, "_");
  const fileName = `voiceovers/${sanitizedSeriesId}/${Date.now()}-${modelName}.mp3`;

  try {
    // Check or ensure bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === bucketName);
      if (!hasBucket) {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 20 * 1024 * 1024, // 20 MB
        });
      }
    } catch {
      // Continue even if listBuckets is restricted
    }

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.warn("[SUPABASE_AUDIO_UPLOAD_WARN]", uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    if (urlData?.publicUrl) {
      return {
        publicUrl: urlData.publicUrl,
        storagePath: `${bucketName}/${fileName}`,
      };
    }
  } catch (error) {
    console.warn("[SUPABASE_AUDIO_UPLOAD_ERROR]", error);
  }

  return null;
}

/**
 * Saves audio buffer locally in the public directory for instant dev preview.
 */
async function saveToLocalPublicDir(
  audioBuffer: Buffer,
  seriesId: string,
  modelName: string
): Promise<string | null> {
  try {
    const sanitizedSeriesId = seriesId.replace(/[^a-zA-Z0-9-_]/g, "_");
    const outputDir = path.join(process.cwd(), "public", "generated-audio");
    await fs.mkdir(outputDir, { recursive: true });

    const fileName = `${sanitizedSeriesId}-${Date.now()}-${modelName}.mp3`;
    const filePath = path.join(outputDir, fileName);

    await fs.writeFile(filePath, audioBuffer);
    return `/generated-audio/${fileName}`;
  } catch (error) {
    console.warn("[LOCAL_AUDIO_SAVE_WARN] Unable to write to public/generated-audio:", error);
    return null;
  }
}

/**
 * Primary Text-To-Speech generator using Deepgram Aura TTS API.
 * Synthesizes voiceover based on series data and generated script.
 */
export async function generateVoiceover(params: GenerateVoiceParams): Promise<VoiceoverOutput> {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey || apiKey === "your_deepgram_api_key_here") {
    throw new Error(
      "DEEPGRAM_API_KEY is missing. Please configure DEEPGRAM_API_KEY in your .env.local file to enable voiceover generation."
    );
  }

  // 1. Prepare clean spoken text
  const cleanScript = sanitizeSpeechText(params.text);
  if (!cleanScript) {
    throw new Error("Cannot generate voiceover: spoken script text is empty.");
  }

  const wordCount = cleanScript.split(/\s+/).filter(Boolean).length;
  const characterCount = cleanScript.length;

  // 2. Resolve target voice model & language
  const voiceInfo = getDeepgramVoiceInfo(params.voiceModel, params.language);
  const selectedModel = voiceInfo.model;
  const selectedLang = voiceInfo.lang;
  const voiceName = voiceInfo.name;

  console.log(`[DEEPGRAM_TTS] Synthesizing voiceover with model="${selectedModel}", language="${selectedLang}", wordCount=${wordCount}`);

  // 3. Request TTS from Deepgram API
  let response = await fetch(`${DEEPGRAM_API_URL}?model=${encodeURIComponent(selectedModel)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${apiKey}`,
    },
    body: JSON.stringify({ text: cleanScript }),
  });

  // Fallback: If requested model is not found, fallback to default English Aura model
  if (!response.ok && response.status === 400 && selectedModel !== DEFAULT_VOICE_MODEL) {
    console.warn(`[DEEPGRAM_TTS_FALLBACK] Model "${selectedModel}" returned 400. Retrying with "${DEFAULT_VOICE_MODEL}"...`);
    response = await fetch(`${DEEPGRAM_API_URL}?model=${DEFAULT_VOICE_MODEL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({ text: cleanScript }),
    });
  }

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error("[DEEPGRAM_TTS_ERROR]", response.status, errorDetails);
    throw new Error(`Deepgram TTS API failed with status ${response.status}: ${errorDetails}`);
  }

  // 4. Retrieve audio buffer
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);
  const sizeBytes = audioBuffer.length;

  if (sizeBytes === 0) {
    throw new Error("Deepgram TTS returned an empty audio stream.");
  }

  // 5. Calculate audio duration
  const durationSeconds = calculateMp3Duration(audioBuffer, wordCount);

  // 6. Persist audio file
  const seriesId = params.seriesId || "series-default";
  let audioUrl: string = "";
  let storagePath: string | null = null;
  let storageType: "supabase" | "local" | "data-uri" = "data-uri";

  // Strategy A: Upload to Supabase Storage (if Supabase client is available)
  if (params.supabase) {
    const supabaseResult = await uploadToSupabaseStorage(
      params.supabase,
      audioBuffer,
      seriesId,
      selectedModel
    );
    if (supabaseResult) {
      audioUrl = supabaseResult.publicUrl;
      storagePath = supabaseResult.storagePath;
      storageType = "supabase";
    }
  }

  // Strategy B: Save to local public/ directory (if Supabase wasn't used or failed)
  if (!audioUrl) {
    const localUrl = await saveToLocalPublicDir(audioBuffer, seriesId, selectedModel);
    if (localUrl) {
      audioUrl = localUrl;
      storageType = "local";
    }
  }

  // Strategy C: High-reliability fallback to Base64 Data URI
  if (!audioUrl) {
    audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
    storageType = "data-uri";
  }

  return {
    audioUrl,
    storagePath,
    storageType,
    durationSeconds,
    format: "mp3",
    sizeBytes,
    voiceModel: selectedModel,
    voiceName,
    language: selectedLang,
    characterCount,
    wordCount,
    fullScript: cleanScript,
    backgroundMusicId: params.backgroundMusicId || "horror-suspense",
    musicVolume: typeof params.musicVolume === "number" ? params.musicVolume : 18,
  };
}
