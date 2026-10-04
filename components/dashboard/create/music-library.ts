export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  mood: string;
  category: string;
  bpm: string;
  duration: string;
  audioUrl: string;
  recommendedNiches: string[];
  description: string;
  tag?: string;
}

export const MUSIC_CATEGORIES = [
  "All",
  "Suspense & Crime",
  "Motivational & Philosophy",
  "Tech & Fast Paced",
  "Chill & Trivia",
  "Wealth & Business",
] as const;

export const BACKGROUND_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "horror-suspense",
    title: "Horror Suspense",
    artist: "Rafael Krux",
    mood: "Dark · Chilling · Tense",
    category: "Suspense & Crime",
    bpm: "74 BPM",
    duration: "2:20",
    audioUrl: "/music/horror-suspense.mp3",
    recommendedNiches: ["scary-stories", "true-crime"],
    description: "Low ominous drones and heart-stopping string accents. Builds instant dread.",
    tag: "High Tension",
  },
  {
    id: "cinematic-strings",
    title: "Long Trail (Cinematic Strings)",
    artist: "Kevin MacLeod",
    mood: "Inspiring · Emotional · Deep",
    category: "Motivational & Philosophy",
    bpm: "85 BPM",
    duration: "3:49",
    audioUrl: "/music/cinematic-strings.mp3",
    recommendedNiches: ["motivational", "stoicism"],
    description: "Inspiring cinematic strings with a steady reflective build. Maximizes emotional resonance.",
    tag: "Viral Retention",
  },
  {
    id: "cyber-pulse",
    title: "Limit 70 (Cyber Pulse)",
    artist: "Kevin MacLeod",
    mood: "Driving · Cyber · High Energy",
    category: "Tech & Fast Paced",
    bpm: "128 BPM",
    duration: "5:02",
    audioUrl: "/music/cyber-pulse.mp3",
    recommendedNiches: ["tech-ai"],
    description: "Futuristic arpeggio synths and punchy rhythms. Keeps viewers glued to fast-paced tech edits.",
    tag: "Trending",
  },
  {
    id: "late-night-lofi",
    title: "3 AM West End (Late Night Lo-Fi)",
    artist: "Statusq",
    mood: "Chill · Relaxed · Nostalgic",
    category: "Chill & Trivia",
    bpm: "80 BPM",
    duration: "4:51",
    audioUrl: "/music/late-night-lofi.mp3",
    recommendedNiches: ["fun-facts", "history"],
    description: "Warm vinyl crackle, gentle chords, and laid-back beat. Perfect for curiosity and storytelling.",
    tag: "High Shares",
  },
  {
    id: "space-atmosphere",
    title: "Alien Spaceship Atmosphere",
    artist: "Kevin MacLeod",
    mood: "Mysterious · Cosmic · Eerie",
    category: "Suspense & Crime",
    bpm: "60 BPM",
    duration: "2:04",
    audioUrl: "/music/space-atmosphere.mp3",
    recommendedNiches: ["fun-facts", "tech-ai"],
    description: "Deep interstellar resonance and hypnotic sci-fi textures.",
  },
  {
    id: "alien-invasion",
    title: "Alien Invasion",
    artist: "Rafael Krux",
    mood: "Action · Intense · Dramatic",
    category: "Suspense & Crime",
    bpm: "110 BPM",
    duration: "3:05",
    audioUrl: "/music/alien-invasion.mp3",
    recommendedNiches: ["history", "true-crime"],
    description: "Heavy percussion and orchestral brass tension for thrilling true crime or historical wars.",
  },
  {
    id: "electronic-beat",
    title: "Trance D Base (Luxury Groove)",
    artist: "Frank Nora",
    mood: "Upbeat · Luxury · Sleek",
    category: "Wealth & Business",
    bpm: "120 BPM",
    duration: "5:30",
    audioUrl: "/music/electronic-beat.mp3",
    recommendedNiches: ["wealth-business"],
    description: "Punchy, modern electronic groove suitable for high CPM business breakdowns.",
    tag: "High CPM",
  },
  {
    id: "none",
    title: "No Background Music",
    artist: "Voiceover Only",
    mood: "Silent · Raw · Focused",
    category: "All",
    bpm: "—",
    duration: "—",
    audioUrl: "",
    recommendedNiches: [],
    description: "Deliver pure voiceover with zero musical background. Ideal for raw documentary realism.",
  },
];
