export interface VideoStyleOption {
  id: string;
  title: string;
  tagline: string;
  image: string;
  category: "All" | "Realistic" | "Artistic" | "Anime & Manga" | "Futuristic";
  tag?: string;
  recommendedFor: string[];
  promptModifier: string;
}

export const STYLE_CATEGORIES = [
  "All",
  "Realistic",
  "Artistic",
  "Anime & Manga",
  "Futuristic",
] as const;

export const VIDEO_STYLES: VideoStyleOption[] = [
  {
    id: "cinematic",
    title: "Cinematic Film",
    tagline: "35mm anamorphic Hollywood movie look",
    image: "/styles/cinematic.jpg",
    category: "Realistic",
    tag: "Popular",
    recommendedFor: ["true-crime", "history", "wealth-business"],
    promptModifier: "cinematic film still, 35mm photograph, anamorphic lens, moody volumetric lighting, highly detailed 8k",
  },
  {
    id: "dark-fantasy",
    title: "Dark Fantasy",
    tagline: "Gothic fortresses, blood moon & cursed fog",
    image: "/styles/dark-fantasy.jpg",
    category: "Artistic",
    tag: "Horror",
    recommendedFor: ["scary-stories", "true-crime"],
    promptModifier: "dark fantasy, gothic atmosphere, ominous chiaroscuro lighting, deep shadows, dark souls aesthetic, 8k",
  },
  {
    id: "anime-seinen",
    title: "Seinen Anime",
    tagline: "Moody hand-drawn Tokyo dusk aesthetic",
    image: "/styles/anime.jpg",
    category: "Anime & Manga",
    tag: "High Engagement",
    recommendedFor: ["motivational", "scary-stories", "tech-ai"],
    promptModifier: "dark seinen anime movie still, detailed lineart, dramatic lighting, Makoto Shinkai aesthetic, cinematic anime masterpiece",
  },
  {
    id: "cyberpunk",
    title: "Cyberpunk",
    tagline: "Rainy neon dystopian megacity reflections",
    image: "/styles/cyberpunk.jpg",
    category: "Futuristic",
    tag: "Trending",
    recommendedFor: ["tech-ai", "wealth-business"],
    promptModifier: "cyberpunk aesthetic, rainy neon city, holographic billboards, synthwave atmosphere, futuristic concept art",
  },
  {
    id: "graphic-novel",
    title: "Noir Graphic Novel",
    tagline: "Gritty comic crosshatching & bold ink",
    image: "/styles/graphic-novel.jpg",
    category: "Artistic",
    tag: "Comic",
    recommendedFor: ["true-crime", "scary-stories", "history"],
    promptModifier: "graphic novel comic art style, ink crosshatching, bold outlines, noir lighting, Frank Miller style",
  },
  {
    id: "oil-painting",
    title: "Classical Oil",
    tagline: "Renaissance museum chiaroscuro texture",
    image: "/styles/oil-painting.jpg",
    category: "Artistic",
    tag: "Stoic",
    recommendedFor: ["stoicism", "history"],
    promptModifier: "classical oil painting, textured brushwork, dramatic museum chiaroscuro lighting, renaissance masterpiece",
  },
  {
    id: "sci-fi-space",
    title: "Cosmic Sci-Fi",
    tagline: "Deep space nebulae & glowing starfields",
    image: "/styles/sci-fi-space.jpg",
    category: "Futuristic",
    tag: "Cosmic",
    recommendedFor: ["fun-facts", "tech-ai"],
    promptModifier: "deep space cosmic sci-fi, glowing colorful nebula, hyper-detailed astronomical photography, cinematic galaxy",
  },
  {
    id: "hyper-luxury",
    title: "Hyper Luxury",
    tagline: "Penthouse gold & billionaire skyline",
    image: "/styles/hyper-luxury.jpg",
    category: "Realistic",
    tag: "High CPM",
    recommendedFor: ["wealth-business", "motivational"],
    promptModifier: "luxury architectural photography, modern billionaire penthouse, golden hour sunset reflections, sleek minimalist interior",
  },
];
