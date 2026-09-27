export const btnPrimary =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#f4f4f5] px-3 text-sm font-medium whitespace-nowrap text-[#09090b] transition duration-200 hover:bg-white sm:px-4";

export const btnGhost =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-medium whitespace-nowrap text-[#f4f4f5] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] transition duration-200 hover:bg-white/10 sm:px-4";

export const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#resources", label: "Resources" },
] as const;

export const queue = [
  { day: "Monday", time: "10:00 AM", channel: "Instagram Reel", status: "Scheduled" },
  { day: "Tuesday", time: "2:30 PM", channel: "TikTok", status: "Scheduled" },
  { day: "Wednesday", time: "6:00 PM", channel: "YouTube Short", status: "Scheduled" },
  { day: "Friday", time: "9:00 AM", channel: "Email Campaign", status: "Scheduled" },
] as const;

export const week = [
  { id: "mon", label: "Mon", slot: "10:00 AM · Instagram Reel", open: false },
  { id: "tue", label: "Tue", slot: "2:30 PM · TikTok", open: false },
  { id: "wed", label: "Wed", slot: "6:00 PM · YouTube Short", open: false },
  { id: "thu", label: "Thu", slot: "Open", open: true },
  { id: "fri", label: "Fri", slot: "9:00 AM · Email Campaign", open: false },
  { id: "sat", label: "Sat", slot: "Open", open: true },
  { id: "sun", label: "Sun", slot: "Open", open: true },
] as const;

export const features = [
  {
    title: "AI Video Generator",
    body: "Turn a simple idea, prompt, script, or piece of content into a short-form video.",
  },
  {
    title: "AI Scripts & Captions",
    body: "Generate scripts, hooks, descriptions, captions, and hashtags automatically.",
  },
  {
    title: "Multi-Platform Publishing",
    body: "Prepare content for YouTube Shorts, Instagram Reels, TikTok, and email.",
  },
  {
    title: "Auto Scheduling",
    body: "Choose the date and time once and let ClipCraft handle publishing automatically.",
  },
  {
    title: "Content Calendar",
    body: "See your upcoming videos and campaigns in one organized calendar.",
  },
  {
    title: "Brand Templates",
    body: "Keep fonts, colors, logos, layouts, and visual style consistent across your content.",
  },
] as const;

export const workflow = [
  {
    n: "01",
    title: "Give ClipCraft an idea",
    body: "Enter a topic, prompt, script, URL, or content concept.",
  },
  {
    n: "02",
    title: "Generate",
    body: "ClipCraft creates the video, script, visuals, captions, and other content elements.",
  },
  {
    n: "03",
    title: "Customize",
    body: "Review the generated video and adjust the content, branding, captions, and format.",
  },
  {
    n: "04",
    title: "Schedule",
    body: "Select your platforms, choose a publishing time, and let ClipCraft automatically publish.",
  },
] as const;

export const platforms = [
  {
    name: "YouTube Shorts",
    detail: "Title, description, and a 9:16 cut for the channel you connect.",
  },
  {
    name: "Instagram Reels",
    detail: "A Reel, a caption, and a cover frame from the same video.",
  },
  {
    name: "TikTok",
    detail: "A tighter cut with an on-screen caption, ready for the For You feed.",
  },
  {
    name: "Email",
    detail: "A still, a link, and a short note for the campaign you already send.",
  },
] as const;

export const plans = [
  {
    name: "Free",
    price: "$0",
    audience: "For exploring ClipCraft.",
    points: ["Generate sample shorts", "Preview every channel", "One scheduled post"],
    cta: "Start Creating Free",
    href: "/register",
  },
  {
    name: "Creator",
    price: "$24",
    audience: "For individuals creating content consistently.",
    points: ["YouTube, Instagram, TikTok, and email", "Auto scheduling", "Content calendar"],
    cta: "Get Started",
    href: "/register",
    featured: true,
  },
  {
    name: "Business",
    price: "$79",
    audience: "For brands and teams running larger content operations.",
    points: ["Shared calendar", "Brand templates", "Seats for the team"],
    cta: "Get Started",
    href: "/register",
  },
] as const;

export const faqs = [
  {
    q: "What is ClipCraft?",
    a: "ClipCraft is a workspace for short-form video. You generate a video with AI, then schedule it to YouTube, Instagram, TikTok, and email from the same calendar.",
  },
  {
    q: "How does the AI video generator work?",
    a: "Give ClipCraft a topic, script, or link. It writes the hook and captions, builds a vertical cut, and hands the video back for review before anything is scheduled.",
  },
  {
    q: "Which platforms can I publish to?",
    a: "YouTube Shorts, Instagram Reels, TikTok, and email campaigns.",
  },
  {
    q: "Can I schedule videos automatically?",
    a: "Yes. Pick the date and time once. ClipCraft publishes when that time arrives, after the post is on your calendar.",
  },
  {
    q: "Can I customize generated videos?",
    a: "Yes. Adjust the cut, captions, branding, and format before you schedule it.",
  },
  {
    q: "Do I need video editing experience?",
    a: "No. You can schedule the generated cut as it is, or change it if you want a different version.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan lets you generate a short and try scheduling before you move to Creator or Business.",
  },
  {
    q: "Can teams use ClipCraft?",
    a: "Yes. Business includes a shared calendar, brand templates, and seats so a team can run one content operation.",
  },
] as const;
