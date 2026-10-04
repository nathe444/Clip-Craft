// Deepgram Aura-2 voice catalog — sourced from https://developers.deepgram.com/docs/tts-models
// Format: aura-2-[voicename]-[language]

export interface DeepgramVoice {
  model: string;       // full model id, e.g. "aura-2-thalia-en"
  name: string;        // display name, e.g. "Thalia"
  gender: "Feminine" | "Masculine";
  age: "Young Adult" | "Adult" | "Mature";
  accent: string;
  lang: string;        // language code, e.g. "en-us"
  traits: string[];
  useCases: string;
}

export interface DeepgramLanguage {
  code: string;        // e.g. "en"
  locale: string;      // e.g. "en-us"
  label: string;       // e.g. "English (US)"
  flag: string;
  voices: DeepgramVoice[];
}

// ─── CURATED voice list per language (best picks for content creators) ───────

const EN_VOICES: DeepgramVoice[] = [
  {
    model: "aura-2-zeus-en",
    name: "Zeus",
    gender: "Masculine",
    age: "Adult",
    accent: "American",
    lang: "en-us",
    traits: ["Deep", "Trustworthy", "Smooth"],
    useCases: "IVR · Narration",
  },
  {
    model: "aura-2-jupiter-en",
    name: "Jupiter",
    gender: "Masculine",
    age: "Adult",
    accent: "American",
    lang: "en-us",
    traits: ["Expressive", "Knowledgeable", "Baritone"],
    useCases: "Informative · Storytelling",
  },
  {
    model: "aura-2-draco-en",
    name: "Draco",
    gender: "Masculine",
    age: "Adult",
    accent: "British",
    lang: "en-gb",
    traits: ["Warm", "Trustworthy", "Baritone"],
    useCases: "Storytelling · Narration",
  },
  {
    model: "aura-2-pluto-en",
    name: "Pluto",
    gender: "Masculine",
    age: "Adult",
    accent: "American",
    lang: "en-us",
    traits: ["Smooth", "Calm", "Empathetic", "Baritone"],
    useCases: "Storytelling · Interview",
  },
  {
    model: "aura-2-orpheus-en",
    name: "Orpheus",
    gender: "Masculine",
    age: "Adult",
    accent: "American",
    lang: "en-us",
    traits: ["Professional", "Clear", "Trustworthy"],
    useCases: "Customer Service · Storytelling",
  },
  {
    model: "aura-2-atlas-en",
    name: "Atlas",
    gender: "Masculine",
    age: "Mature",
    accent: "American",
    lang: "en-us",
    traits: ["Enthusiastic", "Confident", "Approachable"],
    useCases: "Advertising · Motivation",
  },
  {
    model: "aura-2-thalia-en",
    name: "Thalia",
    gender: "Feminine",
    age: "Adult",
    accent: "American",
    lang: "en-us",
    traits: ["Clear", "Confident", "Energetic"],
    useCases: "Casual Chat · IVR",
  },
  {
    model: "aura-2-athena-en",
    name: "Athena",
    gender: "Feminine",
    age: "Mature",
    accent: "American",
    lang: "en-us",
    traits: ["Calm", "Smooth", "Professional"],
    useCases: "Storytelling · Narration",
  },
  {
    model: "aura-2-pandora-en",
    name: "Pandora",
    gender: "Feminine",
    age: "Adult",
    accent: "British",
    lang: "en-gb",
    traits: ["Smooth", "Calm", "Melodic"],
    useCases: "IVR · Informative",
  },
  {
    model: "aura-2-cora-en",
    name: "Cora",
    gender: "Feminine",
    age: "Adult",
    accent: "American",
    lang: "en-us",
    traits: ["Smooth", "Melodic", "Caring"],
    useCases: "Storytelling",
  },
  {
    model: "aura-2-hyperion-en",
    name: "Hyperion",
    gender: "Masculine",
    age: "Adult",
    accent: "Australian",
    lang: "en-au",
    traits: ["Caring", "Warm", "Empathetic"],
    useCases: "Interview · Narration",
  },
  {
    model: "aura-2-vesta-en",
    name: "Vesta",
    gender: "Feminine",
    age: "Adult",
    accent: "American",
    lang: "en-us",
    traits: ["Natural", "Expressive", "Patient"],
    useCases: "Storytelling · Interview",
  },
];

const ES_VOICES: DeepgramVoice[] = [
  {
    model: "aura-2-sirio-es",
    name: "Sirio",
    gender: "Masculine",
    age: "Adult",
    accent: "Mexican",
    lang: "es-mx",
    traits: ["Calm", "Professional", "Baritone"],
    useCases: "Interview · Casual Chat",
  },
  {
    model: "aura-2-nestor-es",
    name: "Nestor",
    gender: "Masculine",
    age: "Adult",
    accent: "Peninsular",
    lang: "es-es",
    traits: ["Calm", "Professional", "Clear"],
    useCases: "Customer Service",
  },
  {
    model: "aura-2-celeste-es",
    name: "Celeste",
    gender: "Feminine",
    age: "Young Adult",
    accent: "Colombian",
    lang: "es-co",
    traits: ["Clear", "Energetic", "Friendly"],
    useCases: "Advertising · IVR",
  },
  {
    model: "aura-2-estrella-es",
    name: "Estrella",
    gender: "Feminine",
    age: "Mature",
    accent: "Mexican",
    lang: "es-mx",
    traits: ["Natural", "Calm", "Expressive"],
    useCases: "Casual Chat · Interview",
  },
  {
    model: "aura-2-diana-es",
    name: "Diana",
    gender: "Feminine",
    age: "Adult",
    accent: "Peninsular",
    lang: "es-es",
    traits: ["Professional", "Confident", "Expressive"],
    useCases: "Storytelling · Advertising",
  },
  {
    model: "aura-2-aquila-es",
    name: "Aquila",
    gender: "Masculine",
    age: "Adult",
    accent: "Latin American",
    lang: "es-419",
    traits: ["Expressive", "Enthusiastic", "Casual"],
    useCases: "Informative",
  },
];

const DE_VOICES: DeepgramVoice[] = [
  {
    model: "aura-2-julius-de",
    name: "Julius",
    gender: "Masculine",
    age: "Adult",
    accent: "German",
    lang: "de-de",
    traits: ["Casual", "Cheerful", "Expressive"],
    useCases: "Customer Service",
  },
  {
    model: "aura-2-fabian-de",
    name: "Fabian",
    gender: "Masculine",
    age: "Mature",
    accent: "German",
    lang: "de-de",
    traits: ["Confident", "Knowledgeable", "Professional"],
    useCases: "Healthcare · Finance",
  },
  {
    model: "aura-2-viktoria-de",
    name: "Viktoria",
    gender: "Feminine",
    age: "Adult",
    accent: "German",
    lang: "de-de",
    traits: ["Charismatic", "Cheerful", "Warm"],
    useCases: "Customer Service",
  },
  {
    model: "aura-2-elara-de",
    name: "Elara",
    gender: "Feminine",
    age: "Adult",
    accent: "German",
    lang: "de-de",
    traits: ["Calm", "Clear", "Trustworthy"],
    useCases: "Healthcare · Sales",
  },
];

const FR_VOICES: DeepgramVoice[] = [
  {
    model: "aura-2-hector-fr",
    name: "Hector",
    gender: "Masculine",
    age: "Adult",
    accent: "French",
    lang: "fr-fr",
    traits: ["Confident", "Empathetic", "Patient"],
    useCases: "Customer Service",
  },
  {
    model: "aura-2-agathe-fr",
    name: "Agathe",
    gender: "Feminine",
    age: "Adult",
    accent: "French",
    lang: "fr-fr",
    traits: ["Charismatic", "Cheerful", "Natural"],
    useCases: "Customer Service",
  },
];

const NL_VOICES: DeepgramVoice[] = [
  {
    model: "aura-2-sander-nl",
    name: "Sander",
    gender: "Masculine",
    age: "Adult",
    accent: "Dutch",
    lang: "nl-nl",
    traits: ["Calm", "Clear", "Deep", "Professional"],
    useCases: "Customer Service",
  },
  {
    model: "aura-2-rhea-nl",
    name: "Rhea",
    gender: "Feminine",
    age: "Adult",
    accent: "Dutch",
    lang: "nl-nl",
    traits: ["Caring", "Knowledgeable", "Warm"],
    useCases: "Customer Service",
  },
  {
    model: "aura-2-daphne-nl",
    name: "Daphne",
    gender: "Feminine",
    age: "Adult",
    accent: "Dutch",
    lang: "nl-nl",
    traits: ["Calm", "Confident", "Professional"],
    useCases: "Healthcare · Audiobook",
  },
];

const IT_VOICES: DeepgramVoice[] = [
  {
    model: "aura-2-flavio-it",
    name: "Flavio",
    gender: "Masculine",
    age: "Adult",
    accent: "Italian",
    lang: "it-it",
    traits: ["Confident", "Deep", "Trustworthy"],
    useCases: "Narration · Interview",
  },
  {
    model: "aura-2-dionisio-it",
    name: "Dionisio",
    gender: "Masculine",
    age: "Adult",
    accent: "Italian",
    lang: "it-it",
    traits: ["Engaging", "Friendly", "Melodic"],
    useCases: "Sales · Casual Chat",
  },
  {
    model: "aura-2-livia-it",
    name: "Livia",
    gender: "Feminine",
    age: "Adult",
    accent: "Italian",
    lang: "it-it",
    traits: ["Approachable", "Cheerful", "Expressive"],
    useCases: "Customer Service · Audiobook",
  },
  {
    model: "aura-2-cinzia-it",
    name: "Cinzia",
    gender: "Feminine",
    age: "Mature",
    accent: "Italian",
    lang: "it-it",
    traits: ["Friendly", "Smooth", "Trustworthy"],
    useCases: "Narration · Interview",
  },
];

const JA_VOICES: DeepgramVoice[] = [
  {
    model: "aura-2-fujin-ja",
    name: "Fujin",
    gender: "Masculine",
    age: "Adult",
    accent: "Japanese",
    lang: "ja-jp",
    traits: ["Calm", "Confident", "Professional"],
    useCases: "Interview · IVR",
  },
  {
    model: "aura-2-izanami-ja",
    name: "Izanami",
    gender: "Feminine",
    age: "Adult",
    accent: "Japanese",
    lang: "ja-jp",
    traits: ["Approachable", "Polite", "Professional"],
    useCases: "Customer Service · IVR",
  },
  {
    model: "aura-2-uzume-ja",
    name: "Uzume",
    gender: "Feminine",
    age: "Young Adult",
    accent: "Japanese",
    lang: "ja-jp",
    traits: ["Clear", "Polite", "Trustworthy"],
    useCases: "Commercial · IVR",
  },
  {
    model: "aura-2-ebisu-ja",
    name: "Ebisu",
    gender: "Masculine",
    age: "Young Adult",
    accent: "Japanese",
    lang: "ja-jp",
    traits: ["Calm", "Deep", "Sincere"],
    useCases: "Customer Service",
  },
];

export const DEEPGRAM_LANGUAGES: DeepgramLanguage[] = [
  { code: "en", locale: "en-us", label: "English", flag: "🇺🇸", voices: EN_VOICES },
  { code: "es", locale: "es-mx", label: "Spanish", flag: "🇪🇸", voices: ES_VOICES },
  { code: "de", locale: "de-de", label: "German", flag: "🇩🇪", voices: DE_VOICES },
  { code: "fr", locale: "fr-fr", label: "French", flag: "🇫🇷", voices: FR_VOICES },
  { code: "nl", locale: "nl-nl", label: "Dutch", flag: "🇳🇱", voices: NL_VOICES },
  { code: "it", locale: "it-it", label: "Italian", flag: "🇮🇹", voices: IT_VOICES },
  { code: "ja", locale: "ja-jp", label: "Japanese", flag: "🇯🇵", voices: JA_VOICES },
];
