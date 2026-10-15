const BANNED_PROMPT_WORDS =
  /\b(8k|4k|anamorphic|volumetric|chiaroscuro|masterpiece|masterwork|watermark|watermarks|kodak|arri|alexa|octane|unreal engine|photorealistic|hyper-realistic|hyperrealistic|cinematic masterpiece|film grain|god rays)\b/gi;

const STOP_WORDS = new Set([
  "this",
  "that",
  "with",
  "from",
  "they",
  "their",
  "there",
  "have",
  "been",
  "were",
  "what",
  "when",
  "your",
  "into",
  "about",
  "after",
  "before",
  "would",
  "could",
  "should",
  "just",
  "only",
  "then",
  "than",
  "them",
  "some",
  "very",
  "story",
  "scene",
  "video",
]);

function words(text: string, max: number) {
  return text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).slice(0, max).join(" ");
}

function contentWords(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
}

function sharesSubject(prompt: string, spoken: string) {
  const spokenWords = contentWords(spoken);
  if (spokenWords.length === 0) return false;
  const haystack = prompt.toLowerCase();
  const hits = spokenWords.filter((word) => haystack.includes(word));
  return hits.length >= 2 || (spokenWords.length < 4 && hits.length >= 1);
}

export function shortStyleCue(styleModifier?: string | null) {
  const cue = (styleModifier || "photorealistic still")
    .replace(BANNED_PROMPT_WORDS, "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");
  return cue || "photorealistic still";
}

/**
 * Builds one image prompt that leads with the recurring subject, then the exact
 * spoken moment. Style words stay at the end so they cannot replace the story.
 */
export function composeSceneImagePrompt({
  spokenText,
  imagePrompt,
  visualAnchor,
  styleModifier,
}: {
  spokenText: string;
  imagePrompt?: string;
  visualAnchor: string;
  styleModifier?: string | null;
}) {
  const anchor = words(
    visualAnchor || "the same main subject and location in every scene",
    22,
  ).replace(/[.]+$/g, "");
  const spoken = words(spokenText, 32).replace(/[.]+$/g, "");
  const cleanedModelPrompt = words((imagePrompt || "").replace(BANNED_PROMPT_WORDS, " "), 36).replace(
    /[.]+$/g,
    "",
  );
  const moment =
    spoken && sharesSubject(cleanedModelPrompt, spoken)
      ? cleanedModelPrompt
      : `showing only this moment: ${spoken || cleanedModelPrompt || anchor}`;
  const style = shortStyleCue(styleModifier);

  return `${anchor}. ${moment}. ${style}. vertical portrait 9:16, no text, no logos.`
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
}

export function stableImageSeed(seriesId: string, sceneNumber: number) {
  let hash = 2166136261;
  const key = `${seriesId}:${sceneNumber}`;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 2000000000;
}
