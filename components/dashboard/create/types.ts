export interface NicheOption {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  tag?: string;
  popular?: boolean;
}

export interface CreateSeriesFormData {
  // Step 1: Niche
  nicheType: "available" | "custom";
  selectedNicheId: string;
  customNicheTitle: string;
  customNicheDescription: string;

  // Step 2: Language & Voice
  language: string;     // locale, e.g. "en-us"
  voiceModel: string;   // deepgram model id, e.g. "aura-2-zeus-en"

  // Step 3: Background Music
  backgroundMusicId: string;
  musicVolume: number; // 0 to 100

  // Step 4: Visual Style
  visualStyle: string;

  // Step 5: Captions
  captionStyle: string;
  captionDensity: "1-2-words" | "3-5-words";
  captionPosition: "middle" | "bottom";
  captionColor: string;

  // Step 6: Series Details & Scheduling
  seriesName: string;
  duration: "30-50" | "60-70";
  platforms: string[]; // "tiktok" | "youtube" | "instagram" | "email"
  publishTime: string; // e.g. "12:00 AM"

  // Legacy/optional
  scriptTopic?: string;
  pacing?: string;
}

export interface StepConfig {
  id: number;
  key: string;
  title: string;
  shortLabel: string;
  description: string;
}

export const STEPS: StepConfig[] = [
  {
    id: 1,
    key: "niche",
    title: "Choose format & Niche",
    shortLabel: "Format & Niche",
    description: "Select a high-performing niche or define your custom concept.",
  },
  {
    id: 2,
    key: "language-voice",
    title: "Language & Voice",
    shortLabel: "Language & Voice",
    description: "Choose your video narration language and AI voice style.",
  },
  {
    id: 3,
    key: "background-music",
    title: "Background Music",
    shortLabel: "Music & Audio",
    description: "Pick ambient soundtrack and configure audio volume mix.",
  },
  {
    id: 4,
    key: "video-style",
    title: "Video Visual Style",
    shortLabel: "Video Style",
    description: "Select the AI visual generation aesthetic and cinematic mood for your clips.",
  },
  {
    id: 5,
    key: "caption-style",
    title: "Dynamic Caption Style",
    shortLabel: "Captions",
    description: "Choose dynamic animated subtitle templates and customize colors and positioning.",
  },
  {
    id: 6,
    key: "series-details",
    title: "Series Details",
    shortLabel: "Details",
    description: "Configure series name, duration, platforms, and publishing schedule.",
  },
];

export const AVAILABLE_NICHES: NicheOption[] = [
  {
    id: "scary-stories",
    title: "Scary Stories",
    description: "Scary stories that gives you goosebumps",
    image: "/niches/scary_stories.jpg",
    icon: "ghost",
    popular: true,
    tag: "High Retention",
  },
  {
    id: "history",
    title: "History",
    description: "Forgotten historical mysteries, legendary battles, and ancient secrets",
    image: "/niches/history.jpg",
    icon: "history",
    tag: "Trending",
  },
  {
    id: "true-crime",
    title: "True Crime",
    description: "Gripping real-world cases, detective investigations, and unsolved puzzles",
    image: "/niches/true_crime.jpg",
    icon: "true-crime",
    popular: true,
    tag: "Viral",
  },
  {
    id: "motivational",
    title: "Motivational",
    description: "High-impact mindset shifts, discipline lessons, and ambition catalysts",
    image: "/niches/motivational.jpg",
    icon: "motivational",
    popular: true,
    tag: "Evergreen",
  },
  {
    id: "tech-ai",
    title: "Tech & AI",
    description: "Futuristic breakthroughs, mind-blowing AI advancements, and tech lore",
    image: "/niches/tech_ai.jpg",
    icon: "tech",
    tag: "Fast Growing",
  },
  {
    id: "fun-facts",
    title: "Mind-Blowing Facts",
    description: "Weird science trivia, optical illusions, and unexpected everyday curiosities",
    image: "/niches/facts.jpg",
    icon: "facts",
    tag: "High Shares",
  },
  {
    id: "stoicism",
    title: "Stoicism & Philosophy",
    description: "Timeless life principles from Marcus Aurelius and profound mental frameworks",
    image: "/niches/stoicism.jpg",
    icon: "philosophy",
    tag: "Deep Engagement",
  },
  {
    id: "wealth-business",
    title: "Wealth & Business",
    description: "Case studies of billionaire tycoons, startup breakdowns, and money psychology",
    image: "/niches/wealth.jpg",
    icon: "wealth",
    tag: "High CPM",
  },
];
