import dns from "node:dns";
import fs from "node:fs/promises";
import path from "node:path";
import { CAPTION_STYLES } from "@/components/dashboard/create/caption-styles";

// Prevent Windows Node.js fetch DNS errors by preferring IPv4
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where setDefaultResultOrder is unavailable
}

const DEEPGRAM_LISTEN_URL = "https://api.deepgram.com/v1/listen";

export interface TimedWord {
  word: string;
  start: number;
  end: number;
  confidence?: number;
  punctuatedWord?: string;
}

export interface SubtitleCue {
  id: number;
  start: number;
  end: number;
  text: string;
  words: TimedWord[];
}

export interface CaptionsOutput {
  captionStyle: string;
  captionDensity: "1-2-words" | "3-5-words";
  captionPosition: "middle" | "bottom";
  accentColor: string;
  totalSubtitles: number;
  totalWords: number;
  fullTranscript: string;
  subtitles: SubtitleCue[];
  rawWords: TimedWord[];
}

export interface GenerateCaptionsParams {
  audioUrl?: string | null;
  audioBuffer?: Buffer | null;
  fullScript?: string | null;
  durationSeconds?: number | null;
  captionStyle?: string | null;
  captionDensity?: "1-2-words" | "3-5-words" | string | null;
  captionPosition?: "middle" | "bottom" | string | null;
  captionColor?: string | null;
  language?: string | null;
}

/**
 * Resolves binary audio buffer from a variety of sources:
 * - Direct Buffer
 * - Data URI (base64)
 * - Local public file path (/generated-audio/...)
 * - Remote URL (https://... / Supabase Storage)
 */
async function resolveAudioBuffer(
  audioBuffer?: Buffer | null,
  audioUrl?: string | null
): Promise<Buffer | null> {
  if (audioBuffer && audioBuffer.length > 0) {
    return audioBuffer;
  }

  if (!audioUrl) {
    return null;
  }

  // 1. Data URI
  if (audioUrl.startsWith("data:")) {
    const commaIndex = audioUrl.indexOf(",");
    if (commaIndex !== -1) {
      const base64Data = audioUrl.slice(commaIndex + 1);
      return Buffer.from(base64Data, "base64");
    }
  }

  // 2. Local public file path (e.g. /generated-audio/filename.mp3)
  if (audioUrl.startsWith("/")) {
    try {
      const localPath = path.join(process.cwd(), "public", audioUrl.replace(/^\//, ""));
      return await fs.readFile(localPath);
    } catch (err) {
      console.warn("[CAPTIONS_LOCAL_FILE_READ_WARN] Could not read local audio file:", err);
    }
  }

  // 3. Remote URL (Supabase CDN, etc.)
  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
    try {
      const response = await fetch(audioUrl);
      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
    } catch (err) {
      console.warn("[CAPTIONS_REMOTE_AUDIO_FETCH_WARN] Could not fetch audio from URL:", err);
    }
  }

  return null;
}

/**
 * Extract clean 2-letter language code for Deepgram STT (e.g. "en-us" -> "en", "es-mx" -> "es").
 */
function resolveDeepgramLangCode(language?: string | null): string {
  if (!language) return "en";
  const clean = language.toLowerCase().trim();
  const parts = clean.split("-");
  return parts[0] || "en";
}

/**
 * Groups timed words into subtitle cues based on density ("1-2-words" vs "3-5-words")
 * and applies styling transformations (e.g. uppercase for Hormozi/Beast styles).
 */
export function chunkWordsIntoSubtitles(
  words: TimedWord[],
  density: "1-2-words" | "3-5-words",
  isUppercase: boolean
): SubtitleCue[] {
  if (!words || words.length === 0) return [];

  const maxWordsPerChunk = density === "1-2-words" ? 2 : 4;
  const subtitles: SubtitleCue[] = [];
  let currentChunk: TimedWord[] = [];

  for (let i = 0; i < words.length; i++) {
    const wordObj = words[i];
    currentChunk.push(wordObj);

    const rawWord = wordObj.punctuatedWord || wordObj.word;
    const endsWithTerminalPunctuation = /[.!?]$/.test(rawWord);
    const endsWithPause = /[,;:]$/.test(rawWord);
    const isLastWord = i === words.length - 1;

    // Determine whether to flush current chunk
    let shouldFlush = isLastWord;

    if (density === "1-2-words") {
      // Flush at 2 words, or 1 word if terminal punctuation is present
      if (currentChunk.length >= 2 || endsWithTerminalPunctuation) {
        shouldFlush = true;
      }
    } else {
      // 3-5 words density: flush at max words, or at 3+ words on pause / terminal punctuation
      if (
        currentChunk.length >= maxWordsPerChunk ||
        (currentChunk.length >= 3 && (endsWithTerminalPunctuation || endsWithPause))
      ) {
        shouldFlush = true;
      }
    }

    if (shouldFlush && currentChunk.length > 0) {
      const cueStart = Number(currentChunk[0].start.toFixed(2));
      const cueEnd = Number(currentChunk[currentChunk.length - 1].end.toFixed(2));

      const cueTextWords = currentChunk.map((w) => {
        const text = w.punctuatedWord || w.word;
        return isUppercase ? text.toUpperCase() : text;
      });

      const cueWords: TimedWord[] = currentChunk.map((w) => ({
        word: isUppercase ? (w.punctuatedWord || w.word).toUpperCase() : (w.punctuatedWord || w.word),
        start: Number(w.start.toFixed(2)),
        end: Number(w.end.toFixed(2)),
        confidence: w.confidence,
        punctuatedWord: w.punctuatedWord,
      }));

      subtitles.push({
        id: subtitles.length + 1,
        start: cueStart,
        end: Math.max(cueEnd, cueStart + 0.3),
        text: cueTextWords.join(" "),
        words: cueWords,
      });

      currentChunk = [];
    }
  }

  return subtitles;
}

/**
 * Fallback alignment: if STT is unavailable, interpolates word timings across the audio duration.
 */
function generateFallbackCaptions(
  scriptText: string,
  durationSeconds: number,
  density: "1-2-words" | "3-5-words",
  isUppercase: boolean
): SubtitleCue[] {
  const words = scriptText.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const safeDuration = Math.max(2, durationSeconds || words.length * 0.4);
  const timePerWord = safeDuration / words.length;

  const timedWords: TimedWord[] = words.map((w, idx) => {
    const start = Number((idx * timePerWord).toFixed(2));
    const end = Number(((idx + 1) * timePerWord).toFixed(2));
    return {
      word: w,
      punctuatedWord: w,
      start,
      end,
      confidence: 1,
    };
  });

  return chunkWordsIntoSubtitles(timedWords, density, isUppercase);
}

/**
 * Generates timed, styled captions from voiceover audio using Deepgram's Speech-To-Text API.
 */
export async function generateCaptions(params: GenerateCaptionsParams): Promise<CaptionsOutput> {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  const captionStyle = params.captionStyle || "hormozi-pop";
  const captionDensity: "1-2-words" | "3-5-words" =
    params.captionDensity === "3-5-words" ? "3-5-words" : "1-2-words";
  const captionPosition: "middle" | "bottom" =
    params.captionPosition === "bottom" ? "bottom" : "middle";
  const accentColor = params.captionColor || "#FACC15";

  // Check style configuration for uppercase transformation
  const matchedStyle = CAPTION_STYLES.find((s) => s.id === captionStyle);
  const isUppercase = matchedStyle ? matchedStyle.textTransform === "uppercase" : true;

  // Resolve audio buffer
  const audioBuffer = await resolveAudioBuffer(params.audioBuffer, params.audioUrl);

  // If no audio or no API key, use fallback script interpolation
  if (!apiKey || apiKey === "your_deepgram_api_key_here" || !audioBuffer || audioBuffer.length === 0) {
    console.warn(
      "[DEEPGRAM_STT_FALLBACK] Missing audio buffer or DEEPGRAM_API_KEY, utilizing fallback word alignment."
    );
    const fallbackScript = params.fullScript || "Video script subtitle preview.";
    const fallbackSubtitles = generateFallbackCaptions(
      fallbackScript,
      params.durationSeconds || 30,
      captionDensity,
      isUppercase
    );

    return {
      captionStyle,
      captionDensity,
      captionPosition,
      accentColor,
      totalSubtitles: fallbackSubtitles.length,
      totalWords: fallbackSubtitles.reduce((acc, c) => acc + c.words.length, 0),
      fullTranscript: fallbackScript,
      subtitles: fallbackSubtitles,
      rawWords: fallbackSubtitles.flatMap((s) => s.words),
    };
  }

  // Resolve language & model for Deepgram STT
  const langCode = resolveDeepgramLangCode(params.language);
  const model = langCode === "en" ? "nova-3" : "nova-2";

  const sttUrl = `${DEEPGRAM_LISTEN_URL}?model=${model}&language=${langCode}&smart_format=true&words=true&punctuate=true`;

  console.log(`[DEEPGRAM_STT] Requesting transcription with model="${model}", language="${langCode}", audioBytes=${audioBuffer.length}`);

  let timedWords: TimedWord[] = [];
  let fullTranscript = "";

  try {
    let response: Response | null = null;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        response = await fetch(sttUrl, {
          method: "POST",
          headers: {
            "Content-Type": "audio/mpeg",
            Authorization: `Token ${apiKey}`,
          },
          body: new Uint8Array(audioBuffer),
        });
        if (response.ok) break;
      } catch (attemptErr) {
        lastError = attemptErr;
        if (attempt < 2) {
          console.warn(`[DEEPGRAM_STT_RETRY] Attempt ${attempt} failed, retrying...`);
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    if (!response || !response.ok) {
      const errText = response ? await response.text() : String(lastError || "Unknown error");
      console.warn(`[DEEPGRAM_STT_ERROR] Deepgram listen failed:`, errText);
      throw new Error(`Deepgram STT API returned ${response?.status || "connection error"}`);
    }

    const data = await response.json();
    const alternative = data.results?.channels?.[0]?.alternatives?.[0];

    fullTranscript = alternative?.transcript || params.fullScript || "";

    const rawDeepgramWords = alternative?.words || [];

    timedWords = rawDeepgramWords.map((w: {
      word: string;
      start: number;
      end: number;
      confidence?: number;
      punctuated_word?: string;
    }) => ({
      word: w.word,
      punctuatedWord: w.punctuated_word || w.word,
      start: Number(w.start.toFixed(2)),
      end: Number(w.end.toFixed(2)),
      confidence: w.confidence,
    }));
  } catch (sttError) {
    console.warn("[DEEPGRAM_STT_EXCEPTION] Falling back to script alignment:", sttError);
    const fallbackScript = params.fullScript || "Video script subtitle preview.";
    const fallbackSubtitles = generateFallbackCaptions(
      fallbackScript,
      params.durationSeconds || 30,
      captionDensity,
      isUppercase
    );

    return {
      captionStyle,
      captionDensity,
      captionPosition,
      accentColor,
      totalSubtitles: fallbackSubtitles.length,
      totalWords: fallbackSubtitles.reduce((acc, c) => acc + c.words.length, 0),
      fullTranscript: fallbackScript,
      subtitles: fallbackSubtitles,
      rawWords: fallbackSubtitles.flatMap((s) => s.words),
    };
  }

  // If no words were detected from audio, fallback to script
  if (timedWords.length === 0) {
    console.warn("[DEEPGRAM_STT] No words detected in audio stream, using script fallback.");
    const fallbackScript = params.fullScript || "Video script subtitle preview.";
    const fallbackSubtitles = generateFallbackCaptions(
      fallbackScript,
      params.durationSeconds || 30,
      captionDensity,
      isUppercase
    );

    return {
      captionStyle,
      captionDensity,
      captionPosition,
      accentColor,
      totalSubtitles: fallbackSubtitles.length,
      totalWords: fallbackSubtitles.reduce((acc, c) => acc + c.words.length, 0),
      fullTranscript: fallbackScript,
      subtitles: fallbackSubtitles,
      rawWords: fallbackSubtitles.flatMap((s) => s.words),
    };
  }

  // Chunk words into subtitles based on series preferences
  const subtitles = chunkWordsIntoSubtitles(timedWords, captionDensity, isUppercase);

  console.log(
    `[DEEPGRAM_STT] Generated ${subtitles.length} timed subtitle cues (${timedWords.length} words total)`
  );

  return {
    captionStyle,
    captionDensity,
    captionPosition,
    accentColor,
    totalSubtitles: subtitles.length,
    totalWords: timedWords.length,
    fullTranscript,
    subtitles,
    rawWords: timedWords,
  };
}
