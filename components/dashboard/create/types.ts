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

  // Step 4: Script & Theme
  scriptTopic: string;
  pacing: string;

  // Step 5: Visuals
  visualStyle: string;

  // Step 6: Captions
  captionStyle: string;
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
    key: "script-story",
    title: "Script & Storyline",
    shortLabel: "Script & Story",
    description: "Configure storytelling duration, hooks, and narrative pace.",
  },
  {
    id: 5,
    key: "visual-style",
    title: "Media & Visual Style",
    shortLabel: "Visuals",
    description: "Pick AI image generation aesthetic and clip transitions.",
  },
  {
    id: 6,
    key: "captions-review",
    title: "Captions & Review",
    shortLabel: "Review",
    description: "Customize dynamic caption animations and start generation.",
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
