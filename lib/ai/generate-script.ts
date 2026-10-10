import dns from "node:dns";
import { GoogleGenAI } from "@google/genai";
import { VIDEO_STYLES } from "@/components/dashboard/create/video-styles";

// Prevent Windows Node.js fetch DNS errors by preferring IPv4
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where setDefaultResultOrder is unavailable
}

export interface SceneItem {
  sceneNumber: number;
  spokenText: string;
  imagePrompt: string;
}

export interface VideoScriptOutput {
  videoTitle: string;
  niche: string;
  visualStyle: string;
  targetDuration: string;
  totalScenes: number;
  fullScript: string;
  scenes: SceneItem[];
  imagePrompts: string[];
}

export interface GenerateScriptParams {
  seriesName: string;
  niche?: string | null;
  customNicheTitle?: string | null;
  customNicheDescription?: string | null;
  visualStyle?: string | null;
  duration?: string | null;
  language?: string | null;
}

/**
 * Generates an engaging short-form video script and matching scene image prompts
 * using Google's Gen AI SDK (Gemini).
 */
export async function generateVideoScript(
  params: GenerateScriptParams
): Promise<VideoScriptOutput> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Please add GEMINI_API_KEY to your .env.local file to enable AI script generation."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  // Resolve target duration & scene count
  // Requirement: 5-6 image prompts for 30-40s (or 30-50s), 7-9 image prompts for 60-70s
  const duration = params.duration || "30-50";
  const isLonger =
    duration.includes("60") || duration.includes("70");
  const targetSceneCount = isLonger ? "7-9" : "5-6";
  const targetWords = isLonger ? "140 to 180 words" : "75 to 110 words";

  // Resolve niche & visual style description
  const nicheLabel =
    params.customNicheTitle ||
    params.niche ||
    params.seriesName ||
    "General Interest";

  const selectedStyle = VIDEO_STYLES.find(
    (s) => s.id === params.visualStyle
  );
  const stylePromptModifier =
    selectedStyle?.promptModifier ||
    "cinematic, hyper-realistic, dramatic lighting, 8k resolution, vertical 9:16 aspect ratio";

  const systemInstruction = `You are an elite short-form video scriptwriter and AI visual prompt director for viral TikTok, YouTube Shorts, and Instagram Reels.
Your task is to write a high-retention, natural-sounding voiceover script and corresponding scene image prompts based on the provided series details.

CRITICAL RULES FOR VOICEOVER SCRIPT:
1. The script must sound extremely natural, engaging, and conversational when read out loud by a Text-to-Speech (TTS) voice model.
2. DO NOT include any stage directions, emotions, bracketed notes, speaker names, sound effect tags (e.g., NO "(whispering)", NO "[music fades]", NO "Narrator:").
3. DO NOT use emojis or asterisks. Pure spoken sentences only.
4. Start with a magnetic hook in the first 2-3 seconds that stops scrolling.
5. End with a subtle, natural payoff or call-to-action.
6. The total spoken script length must fit the requested target duration: exactly ${targetWords}.

CRITICAL RULES FOR IMAGE PROMPTS:
1. Provide exactly ${targetSceneCount} sequential scenes.
2. For each scene, write a highly descriptive visual prompt suitable for modern AI image generators (Midjourney/Flux/DALL-E).
3. Every image prompt MUST incorporate the visual style: "${stylePromptModifier}".
4. Specify: "vertical 9:16 composition, cinematic depth of field, high detail, no text, no watermarks".
5. Ensure visual continuity between scenes.

JSON OUTPUT ONLY:
Return strictly a valid JSON object matching this schema with NO markdown codeblocks and NO extraneous text:
{
  "videoTitle": "Catchy 3-7 word viral video title",
  "fullScript": "The complete spoken script concatenated as a single seamless paragraph",
  "scenes": [
    {
      "sceneNumber": 1,
      "spokenText": "The natural spoken words for this exact scene segment",
      "imagePrompt": "Detailed visual image prompt for this scene with style modifiers"
    }
  ]
}`;

  const userPrompt = `Generate a video script and scene image prompts with the following series parameters:
- Series Name: "${params.seriesName}"
- Topic / Niche: "${nicheLabel}"
${params.customNicheDescription ? `- Topic Details / Context: "${params.customNicheDescription}"` : ""}
- Visual Style: "${params.visualStyle || "cinematic"}" (Style guidance: ${stylePromptModifier})
- Target Video Duration: ${duration} seconds (Requires exactly ${targetSceneCount} scenes)
- Language: "${params.language || "English"}"

Return ONLY valid JSON.`;

  // Default to gemini-3.8-flash (Google's latest active model)
  const preferredModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  let response;
  try {
    response = await ai.models.generateContent({
      model: preferredModel,
      contents: `${systemInstruction}\n\n${userPrompt}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // If the configured model is unavailable or discontinued, fallback to gemini-3.8-flash
    if (preferredModel !== "gemini-3.8-flash" && errorMsg.includes("not found")) {
      console.warn(`[GEMINI_MODEL_FALLBACK] Model ${preferredModel} not found. Retrying with gemini-3.8-flash...`);
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `${systemInstruction}\n\n${userPrompt}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
    } else {
      throw error;
    }
  }

  const rawText = response?.text || "";
  if (!rawText.trim()) {
    throw new Error("Received empty response from Gemini model");
  }

  // Sanitize potential formatting artifacts
  const cleanJson = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsedData: {
    videoTitle?: string;
    fullScript?: string;
    scenes?: Array<{
      sceneNumber?: number;
      spokenText?: string;
      imagePrompt?: string;
    }>;
  };

  try {
    parsedData = JSON.parse(cleanJson);
  } catch (parseError) {
    console.error("[GEMINI_JSON_PARSE_ERROR] Raw output:", rawText);
    throw new Error(
      `Failed to parse Gemini output as JSON: ${(parseError as Error).message}`
    );
  }

  const scenes: SceneItem[] = (parsedData.scenes || []).map((s, index) => ({
    sceneNumber: s.sceneNumber || index + 1,
    spokenText: (s.spokenText || "").trim(),
    imagePrompt: (s.imagePrompt || "").trim(),
  }));

  const fullScript =
    parsedData.fullScript?.trim() ||
    scenes.map((s) => s.spokenText).filter(Boolean).join(" ");

  const imagePrompts = scenes.map((s) => s.imagePrompt).filter(Boolean);

  return {
    videoTitle: parsedData.videoTitle || params.seriesName || "Untitled Video",
    niche: nicheLabel,
    visualStyle: params.visualStyle || "cinematic",
    targetDuration: duration,
    totalScenes: scenes.length,
    fullScript,
    scenes,
    imagePrompts,
  };
}
