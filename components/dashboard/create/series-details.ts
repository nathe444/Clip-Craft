export interface PlatformOption {
  id: "tiktok" | "youtube" | "instagram" | "email";
  name: string;
  tagline: string;
  badge: string;
  recommendedTime: string;
}

export interface DurationOption {
  id: "30-50" | "60-70";
  label: string;
  sublabel: string;
  description: string;
  badge: string;
}

export const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    id: "tiktok",
    name: "TikTok",
    tagline: "Short-form vertical feed",
    badge: "Viral Growth",
    recommendedTime: "12:00 AM",
  },
  {
    id: "instagram",
    name: "Instagram",
    tagline: "Reels & Stories audience",
    badge: "Engagement",
    recommendedTime: "12:00 AM",
  },
  {
    id: "youtube",
    name: "YouTube",
    tagline: "Shorts & Subscriber funnel",
    badge: "Monetization",
    recommendedTime: "12:00 AM",
  },
  {
    id: "email",
    name: "Email",
    tagline: "Subscriber digest & clips",
    badge: "Owned Audience",
    recommendedTime: "12:00 AM",
  },
];

export const DURATION_OPTIONS: DurationOption[] = [
  {
    id: "30-50",
    label: "30-50 sec video",
    sublabel: "Ultra-high retention",
    description: "Ideal for fast hooks, virality, and 100%+ completion rates across short feeds.",
    badge: "Recommended",
  },
  {
    id: "60-70",
    label: "60-70 sec video",
    sublabel: "Deep narrative & lore",
    description: "Perfect for immersive storytelling, mysteries, and long-term audience building.",
    badge: "High Engagement",
  },
];

export const POPULAR_PUBLISH_TIMES = [
  "12:00 AM",
  "06:00 AM",
  "09:00 AM",
  "12:00 PM",
  "03:00 PM",
  "06:00 PM",
  "08:00 PM",
  "10:00 PM",
];
