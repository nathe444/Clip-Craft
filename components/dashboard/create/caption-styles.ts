export interface CaptionStyleOption {
  id: string;
  title: string;
  tagline: string;
  tag?: string;
  previewWords: string[];
  defaultColor: string;
  textTransform: "uppercase" | "none";
  fontClass: string;
  shadowClass: string;
  bgPill?: boolean;
  recommendedNiches: string[];
}

export const CAPTION_ACCENT_COLORS = [
  { id: "#FACC15", name: "Volt Yellow", hex: "#FACC15" },
  { id: "#22C55E", name: "Emerald Green", hex: "#22C55E" },
  { id: "#38BDF8", name: "Electric Cyan", hex: "#38BDF8" },
  { id: "#DC2626", name: "Crimson Red", hex: "#DC2626" },
  { id: "#A855F7", name: "Cyber Purple", hex: "#A855F7" },
  { id: "#FFFFFF", name: "Pure White", hex: "#FFFFFF" },
] as const;

export const CAPTION_STYLES: CaptionStyleOption[] = [
  {
    id: "hormozi-pop",
    title: "Hormozi Pop",
    tagline: "High-retention word bounce with glowing accent",
    tag: "Viral Standard",
    previewWords: ["BUILD", "YOUR", "EMPIRE", "NOW"],
    defaultColor: "#FACC15",
    textTransform: "uppercase",
    fontClass: "font-black tracking-tight",
    shadowClass: "drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]",
    recommendedNiches: ["motivational", "wealth-business", "stoicism"],
  },
  {
    id: "karaoke-glow",
    title: "Karaoke Glow",
    tagline: "Smooth progressive lighting on active spoken words",
    tag: "Storytelling",
    previewWords: ["In", "the", "darkest", "shadows"],
    defaultColor: "#38BDF8",
    textTransform: "none",
    fontClass: "font-bold tracking-normal",
    shadowClass: "drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]",
    recommendedNiches: ["scary-stories", "true-crime", "history"],
  },
  {
    id: "beast-bounce",
    title: "Beast Bold",
    tagline: "Dynamic comic pop with solid drop border",
    tag: "High Energy",
    previewWords: ["WAIT", "TILL", "THE", "END!"],
    defaultColor: "#22C55E",
    textTransform: "uppercase",
    fontClass: "font-extrabold italic tracking-tight",
    shadowClass: "drop-shadow-[0_4px_0px_#000]",
    recommendedNiches: ["fun-facts", "tech-ai"],
  },
  {
    id: "cinematic-pill",
    title: "Cinematic Pill",
    tagline: "Understated frosted glass backdrop for documentaries",
    tag: "Clean Minimal",
    previewWords: ["The", "untold", "story", "revealed"],
    defaultColor: "#FFFFFF",
    textTransform: "none",
    fontClass: "font-medium tracking-wide",
    shadowClass: "drop-shadow-sm",
    bgPill: true,
    recommendedNiches: ["history", "wealth-business", "stoicism"],
  },
  {
    id: "crime-thriller",
    title: "Crime Thriller",
    tagline: "Stark white text with intense crimson keyword punch",
    tag: "High Tension",
    previewWords: ["NO", "ONE", "HEARD", "A", "SOUND"],
    defaultColor: "#DC2626",
    textTransform: "uppercase",
    fontClass: "font-black tracking-wider",
    shadowClass: "drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]",
    recommendedNiches: ["scary-stories", "true-crime"],
  },
  {
    id: "cyber-neon",
    title: "Cyber Neon",
    tagline: "Futuristic digital monospace with dual-tone glow",
    tag: "Futuristic",
    previewWords: ["SYSTEM", "OVERRIDE", "ACTIVE"],
    defaultColor: "#A855F7",
    textTransform: "uppercase",
    fontClass: "font-mono font-bold tracking-widest",
    shadowClass: "drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]",
    recommendedNiches: ["tech-ai"],
  },
];
