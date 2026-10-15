import dns from "node:dns";
import { VIDEO_STYLES } from "@/components/dashboard/create/video-styles";
import { composeSceneImagePrompt, shortStyleCue } from "@/lib/ai/scene-prompt";

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
  visualAnchor: string;
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
 * Returns genre-specific storytelling rules, tone guidance, and psychological hook strategies.
 */
function getNicheStorytellingDirectives(nicheId?: string | null): string {
  const n = (nicheId || "").toLowerCase();

  if (n.includes("scary") || n.includes("horror") || n.includes("creep") || n.includes("ghost")) {
    return `STORY TYPE: one specific storytime, not a horror-movie trailer.
Open on a concrete wrong detail in a real-feeling place (an apartment number, a night shift, a road, a phone). Stay with that same object or room. End on the exact thing the narrator still cannot explain.`;
  }

  if (n.includes("history") || n.includes("ancient") || n.includes("war") || n.includes("rome") || n.includes("empire")) {
    return `STORY TYPE: one real historical incident.
Include a year, a place, and a named person. Open on the strange specific fact, not "history hides secrets". Stay inside that one event. Do not add fantasy armor, magic, or a battle the event did not have.`;
  }

  if (n.includes("crime") || n.includes("detective") || n.includes("murder") || n.includes("mystery")) {
    return `STORY TYPE: one case.
Open with the detail that did not fit: a receipt, a timestamp, a locked door. Name the city and the year. Follow only that case. Use a well-known public case, or a clearly fictional story with invented names. Do not invent crimes about real private people.`;
  }

  if (n.includes("stoic") || n.includes("philosoph")) {
    return `STORY TYPE: one modern situation plus one real idea.
Use a specific moment (a layoff text, a 2am scroll, a public argument) and one named philosopher. Paraphrase one actual idea. No vague lines about discipline, weakness, or destiny.`;
  }

  if (n.includes("wealth") || n.includes("money") || n.includes("business") || n.includes("billion")) {
    return `STORY TYPE: one real company, founder, or money decision people still argue about.
Include a number: a price, a year, a loss, or a valuation. Explain the actual move. No "mindset of the rich" and no fake billions.`;
  }

  if (n.includes("tech") || n.includes("ai") || n.includes("cyber")) {
    return `STORY TYPE: one named product, model, or incident from the last few years.
Explain the surprising behavior in plain speech. No singularity speeches and no neon megacity unless the story is literally about a city.`;
  }

  if (n.includes("motivat") || n.includes("ambition") || n.includes("discipline")) {
    return `STORY TYPE: one person's turning point.
Include a date or a number. The lesson has to come out of that story. No "wake up and grind", no shouting, no telling the viewer they are destined for greatness.`;
  }

  if (n.includes("fact")) {
    return `STORY TYPE: one surprising true mechanism.
Open with the counterintuitive fact, then why it happens, then the part people get wrong. Do not list unrelated facts.`;
  }

  return `STORY TYPE: one specific story tied to the series name.
Put a person, a place, and a concrete detail in the first sentence. Stay on that story until the last line.`;
}

/**
 * Dynamically queries Groq for active chat models available to the provided API key,
 * sorted from highest capability (70B+) down to high-speed models (8B).
 */
async function getSortedAvailableGroqModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const rawIds: string[] = (data.data || []).map((m: { id: string }) => m.id);

      // Filter out non-chat, audio, guard, and embedding models
      const chatModels = rawIds.filter((id) => {
        const lower = id.toLowerCase();
        return (
          !lower.includes("whisper") &&
          !lower.includes("guard") &&
          !lower.includes("distil") &&
          !lower.includes("embedding") &&
          !lower.includes("moderation") &&
          !lower.includes("orpheus") &&
          !lower.includes("tts") &&
          !lower.includes("allam")
        );
      });

      chatModels.sort((a, b) => {
        const score = (name: string) => {
          const n = name.toLowerCase();
          if (n.includes("gpt-oss-120b")) return 110;
          if (n.includes("llama-3.3-70b")) return 100;
          if (n.includes("3.3") && n.includes("70b")) return 95;
          if (n.includes("llama-3.1-70b")) return 90;
          if (n.includes("70b")) return 80;
          if (n.includes("qwen")) return 78;
          if (n.includes("gpt-oss")) return 75;
          if (n.includes("llama-3.1-8b")) return 70;
          if (n.includes("llama-3-8b") || n.includes("8b-instant")) return 65;
          if (n.includes("llama-3")) return 60;
          if (n.includes("mixtral")) return 50;
          if (n.includes("gemma")) return 40;
          return 10;
        };
        return score(b) - score(a);
      });

      if (chatModels.length > 0) {
        console.log("[GROQ_DISCOVERED_MODELS]", chatModels);
        return chatModels;
      }
    }
  } catch (err) {
    console.warn("[GROQ_MODEL_DISCOVERY_WARN]", err);
  }

  // Fallback list of known Groq production model IDs
  return [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ];
}

/**
 * Invokes Groq's ultra-fast OpenAI-compatible chat completion endpoint.
 */
type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callGroqChat(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_completion_tokens: 4096,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Received empty completion from Groq API");
  }
  return content;
}

type ParsedScript = {
  data: {
    videoTitle?: string;
    visualAnchor?: string;
    fullScript?: string;
    scenes?: Array<{ sceneNumber?: number; spokenText?: string; imagePrompt?: string }>;
  };
  scenes: SceneItem[];
  narration: string;
};

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function parseScript(rawText: string): ParsedScript {
  const cleanJson = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let data: ParsedScript["data"];
  try {
    data = JSON.parse(cleanJson);
  } catch (parseError) {
    console.error("[GROQ_JSON_PARSE_ERROR] Raw output:", rawText);
    throw new Error(`Failed to parse Groq output as JSON: ${(parseError as Error).message}`);
  }

  const scenes: SceneItem[] = (data.scenes || []).map((s, index) => ({
    sceneNumber: s.sceneNumber || index + 1,
    spokenText: (s.spokenText || "").trim(),
    imagePrompt: (s.imagePrompt || "").trim(),
  }));

  const sceneText = scenes.map((s) => s.spokenText).filter(Boolean).join(" ");
  const fullScript = (data.fullScript || "").trim();
  const narration = countWords(fullScript) > countWords(sceneText) * 1.3 ? fullScript : sceneText;

  if (narration === fullScript && fullScript && scenes.length > 0) {
    const beats = splitNarration(fullScript, scenes.length);
    return {
      data,
      scenes: beats.map((spokenText, index) => ({
        sceneNumber: index + 1,
        spokenText,
        imagePrompt: scenes[index]?.imagePrompt || spokenText,
      })),
      narration,
    };
  }
  return { data, scenes, narration };
}

function splitNarration(text: string, count: number): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length < count) return sentences;

  const beats: string[] = [];
  const size = sentences.length / count;
  for (let i = 0; i < count; i += 1) {
    const start = Math.floor(i * size);
    const end = i === count - 1 ? sentences.length : Math.floor((i + 1) * size);
    beats.push(sentences.slice(start, end).join(" "));
  }
  return beats;
}

/**
 * Ensures a script has at least the minimum required number of scenes (5 for 30-50s, 7 for 60-70s).
 * If the AI returned fewer scenes, automatically slices the script into distinct sequential beats
 * and builds tailored visual prompts for each scene.
 */
function ensureMinimumScenes(
  existingScenes: SceneItem[],
  fullScript: string,
  minRequired: number,
  seriesName: string,
): SceneItem[] {
  if (existingScenes.length >= minRequired) {
    return existingScenes;
  }

  console.warn(
    `[SCENE_EXPANDER] AI only provided ${existingScenes.length} scenes for "${seriesName}". Splitting the script into ${minRequired} beats...`
  );

  // Split script into sentences
  const rawSentences = fullScript
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const sentences: string[] = [];
  if (rawSentences.length >= minRequired) {
    const bucketSize = rawSentences.length / minRequired;
    for (let i = 0; i < minRequired; i++) {
      const start = Math.floor(i * bucketSize);
      const end = i === minRequired - 1 ? rawSentences.length : Math.floor((i + 1) * bucketSize);
      sentences.push(rawSentences.slice(start, end).join(" "));
    }
  } else {
    // Break by words into minRequired roughly equal chunks
    const words = fullScript.split(/\s+/).filter(Boolean);
    const wordsPerScene = Math.max(10, Math.ceil(words.length / minRequired));
    for (let i = 0; i < minRequired; i++) {
      const chunk = words.slice(i * wordsPerScene, (i + 1) * wordsPerScene).join(" ");
      if (chunk) {
        sentences.push(chunk);
      }
    }
  }

  const expandedScenes: SceneItem[] = sentences.slice(0, minRequired).map((text, idx) => ({
    sceneNumber: idx + 1,
    spokenText: text,
    imagePrompt: existingScenes[idx]?.imagePrompt || text,
  }));

  return expandedScenes;
}

/**
 * Generates an engaging short-form video script and matching scene image prompts
 * using Groq with dynamic active model discovery and automatic cascading fallback.
 */
export async function generateVideoScript(
  params: GenerateScriptParams
): Promise<VideoScriptOutput> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "your_groq_api_key_here") {
    throw new Error(
      "GROQ_API_KEY is missing. Please add your free GROQ_API_KEY to your .env.local file (get one for free at https://console.groq.com/keys) to enable script generation."
    );
  }

  // Resolve target duration & scene count
  // 5-6 image prompts for 30-40s (or 30-50s), 7-9 image prompts for 60-70s
  const duration = params.duration || "30-50";
  const isLonger = duration.includes("60") || duration.includes("70");
  const targetSceneCount = isLonger ? "7-9" : "5-6";
  const targetWords = isLonger ? "170 to 210 words" : "110 to 140 words";
  const minWords = isLonger ? 150 : 95;
  const wordsPerScene = isLonger ? "22 to 28" : "20 to 26";

  // Resolve niche & visual style description
  const nicheLabel =
    params.customNicheTitle ||
    params.niche ||
    params.seriesName ||
    "General Interest";

  const selectedStyle = VIDEO_STYLES.find((s) => s.id === params.visualStyle);
  const stylePromptModifier = shortStyleCue(
    selectedStyle?.promptModifier || "photorealistic still, natural light",
  );

  // Niche-specific storytelling master directives
  const nicheDirectives = getNicheStorytellingDirectives(params.niche || params.customNicheTitle);

  const systemInstruction = `You write short-form stories for TikTok, YouTube Shorts, and Reels. Sound like a sharp creator in 2026, not a movie trailer and not a textbook.

${nicheDirectives}

STORY RULES:
- Tell ONE story. Every scene continues the previous scene. Do not reset the topic.
- The story must be about "${params.seriesName}" in the "${nicheLabel}" niche. Do not drift to a generic adjacent topic.
- Scene 1 states a specific fact: a name, place, year, number, or object. Never open with "Have you ever", "Did you know", "What if", "In this video", "Buckle up", or "You won't believe".
- Later scenes add the next concrete beat of THAT story in the order it happened: what happened, what was found, what it cost, what is still unexplained.
- Only state names, dates, and numbers you are sure are true. If you are unsure of a detail, describe it without a number instead of guessing.
- Every sentence ends cleanly. Never pad a line with extra words to hit a count.
- Write for speech. Contractions are good. Sentences can be 8 to 18 words. No emojis, no stage directions, no "Narrator:".
- Each scene's spokenText is 2 or 3 full sentences, ${wordsPerScene} words. Never a fragment or a single short line.
- Total spoken length across all scenes: ${targetWords}, which is about ${duration} seconds of narration. Under ${minWords} words is a failed script.
- Banned filler: "little did they know", "here's the twist", "in a world", "let that sink in", "the truth will shock you", "ignited", "shattered", "devoured", "calcified".
- Use ${targetSceneCount} scenes. At least ${isLonger ? "7" : "5"} scenes. Never return one scene.

IMAGE RULES:
- visualAnchor is one sentence reused in every picture: who the subject is, what they wear or look like, and where the story happens. Keep that subject identical in every scene.
- Each imagePrompt describes only what is happening in that scene's spokenText. Name the same person, object, and place.
- imagePrompt is a plain visual description under 30 words. Do not mention cameras, lenses, film stock, 8k, lighting jargon, or "cinematic masterpiece".
- Do not put readable words, captions, or logos in the picture.
- Style hint, applied lightly: "${stylePromptModifier}".

Return only JSON:
{
  "videoTitle": "Specific 4-8 word title about this story",
  "visualAnchor": "Same subject and place in every scene, described once",
  "scenes": [
    {
      "sceneNumber": 1,
      "spokenText": "Two or three spoken sentences, ${wordsPerScene} words, opening on the specific fact",
      "imagePrompt": "The same subject, in that place, doing the action from spokenText"
    }
  ]
}
Every scene object has the same shape. The voiceover reads the spokenText fields in order, so they must contain the whole story.`;

  const userPrompt = `Write one trendy, specific short story with these settings:
- Series name: "${params.seriesName}"
- Niche: "${nicheLabel}"
${params.customNicheDescription ? `- Extra context: "${params.customNicheDescription}"` : ""}
- Look: "${params.visualStyle || "cinematic"}" (${stylePromptModifier})
- Length: ${duration} seconds, ${targetSceneCount} scenes, ${targetWords}
- Language: "${params.language || "English"}"

The series name is the subject, not a vibe. If the niche is history, tech, business, or true crime, use a real public event or product when you know it. Otherwise make the fiction specific enough to picture. Return only JSON.`;

  // Dynamically find all models available to the current API key
  const configuredModel = process.env.GROQ_MODEL?.trim();
  const availableModels = await getSortedAvailableGroqModels(apiKey);

  const modelQueue = configuredModel
    ? [configuredModel, ...availableModels.filter((m) => m !== configuredModel)]
    : availableModels;

  let best: ParsedScript | null = null;
  let lastError: Error | null = null;

  for (const model of modelQueue) {
    try {
      console.log(`[GROQ_SCRIPT_GEN] Attempting model: ${model}`);
      const messages: ChatMessage[] = [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ];

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const rawText = await callGroqChat(apiKey, model, messages);
        const parsed = parseScript(rawText);
        const words = countWords(parsed.narration);
        console.log(`[GROQ_SCRIPT_GEN] ${model} attempt ${attempt + 1}: ${words} spoken words`);

        if (!best || words > countWords(best.narration)) best = parsed;
        if (words >= minWords) break;

        messages.push(
          { role: "assistant", content: rawText },
          {
            role: "user",
            content: `That script is only ${words} spoken words, which is about ${Math.round(words / 2.6)} seconds. It must be ${targetWords}. Keep the same story and visualAnchor, keep ${targetSceneCount} scenes, and rewrite every spokenText to ${wordsPerScene} words by adding true, concrete details of what happened. Do not pad sentences with filler. Return the full JSON again.`,
          },
        );
      }

      if (best && countWords(best.narration) >= minWords) break;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[GROQ_MODEL_WARN] Model ${model} failed: ${lastError.message}`);
    }
  }

  if (!best) {
    throw new Error(
      `Groq script generation failed across available models (${modelQueue.join(", ")}): ${lastError?.message || "Unknown error"}`
    );
  }

  const spokenWords = countWords(best.narration);
  if (spokenWords < Math.round(minWords * 0.6)) {
    throw new Error(
      `Script generation returned only ${spokenWords} spoken words (needs ${targetWords}). Try generating again.`,
    );
  }

  const parsedData = best.data;
  const minRequiredScenes = isLonger ? 7 : 5;
  const expandedScenes = ensureMinimumScenes(
    best.scenes,
    best.narration,
    minRequiredScenes,
    params.seriesName,
  ).filter((scene) => scene.spokenText);
  const fullScript = expandedScenes.map((scene) => scene.spokenText).join(" ");

  const visualAnchor =
    parsedData.visualAnchor?.trim() ||
    `The same main subject from "${params.seriesName}", in the same place, in every scene`;

  const scenes = expandedScenes.map((scene, index) => ({
    sceneNumber: index + 1,
    spokenText: scene.spokenText,
    imagePrompt: composeSceneImagePrompt({
      spokenText: scene.spokenText,
      imagePrompt: scene.imagePrompt,
      visualAnchor,
      styleModifier: stylePromptModifier,
    }),
  }));

  const imagePrompts = scenes.map((scene) => scene.imagePrompt);

  console.log(
    `[SCRIPT_GEN_COMPLETE] "${parsedData.videoTitle || params.seriesName}" generated with ${scenes.length} scenes, ${countWords(fullScript)} spoken words.`
  );

  return {
    videoTitle: parsedData.videoTitle || params.seriesName || "Untitled Video",
    niche: nicheLabel,
    visualStyle: params.visualStyle || "cinematic",
    visualAnchor,
    targetDuration: duration,
    totalScenes: scenes.length,
    fullScript,
    scenes,
    imagePrompts,
  };
}
