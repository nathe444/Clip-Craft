"use client";

import { Check, Mic2, Globe, ArrowLeft, ArrowRight } from "lucide-react";

interface LanguageVoiceStepProps {
  language: string;
  voiceStyle: string;
  onChangeLanguage: (lang: string) => void;
  onChangeVoiceStyle: (voice: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", label: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr-FR", label: "French (Français)", flag: "🇫🇷" },
  { code: "de-DE", label: "German (Deutsch)", flag: "🇩🇪" },
  { code: "pt-BR", label: "Portuguese (Brasil)", flag: "🇧🇷" },
  { code: "ja-JP", label: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "hi-IN", label: "Hindi (हिन्दी)", flag: "🇮🇳" },
];

const VOICE_STYLES = [
  {
    id: "deep-dramatic",
    name: "Deep & Dramatic",
    description: "Deep baritone, slow intensity. Ideal for horror, mystery, and crime.",
    gender: "Male",
    tone: "Intense",
  },
  {
    id: "energetic-upbeat",
    name: "Energetic & Punchy",
    description: "High energy, sharp delivery. Best for motivation and tech breakdowns.",
    gender: "Male",
    tone: "Dynamic",
  },
  {
    id: "calm-storyteller",
    name: "Calm Narrator",
    description: "Measured, articulate pace. Works well for history and philosophy.",
    gender: "Female",
    tone: "Warm",
  },
  {
    id: "documentary-narrator",
    name: "Documentary Style",
    description: "Authoritative, BBC-grade narration with clear diction.",
    gender: "Male",
    tone: "Editorial",
  },
  {
    id: "eerie-whisper",
    name: "Eerie Whisper",
    description: "Soft-spoken, suspenseful delivery with a chilling undertone.",
    gender: "Female",
    tone: "Creepy",
  },
];

export function LanguageVoiceStep({
  language,
  voiceStyle,
  onChangeLanguage,
  onChangeVoiceStyle,
  onBack,
  onContinue,
}: LanguageVoiceStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--dash-ink)]">
          Language & Voice
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-[var(--dash-muted)]">
          Choose the narration language and voice style for your series.
        </p>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label
          htmlFor="language-select"
          className="flex items-center gap-2 text-sm font-semibold text-[var(--dash-ink)]"
        >
          <Globe className="size-4 text-[var(--dash-muted)]" />
          Language
        </label>
        <div className="relative max-w-sm">
          <select
            id="language-select"
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[var(--dash-line)] bg-white px-4 py-3 text-sm text-[var(--dash-ink)] font-medium focus:outline-none focus:border-[var(--dash-ink)] cursor-pointer transition"
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.flag}  {item.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[var(--dash-muted)]">
            ▼
          </div>
        </div>
      </div>

      {/* Voice Style */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--dash-ink)]">
          <Mic2 className="size-4 text-[var(--dash-muted)]" />
          Voice style
        </label>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          role="radiogroup"
          aria-label="Voice styles"
        >
          {VOICE_STYLES.map((voice) => {
            const isSelected = voiceStyle === voice.id;
            return (
              <div
                key={voice.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onChangeVoiceStyle(voice.id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onChangeVoiceStyle(voice.id);
                  }
                }}
                className={`group flex flex-col gap-2 rounded-2xl border p-4 cursor-pointer transition-all duration-150 select-none outline-none ${
                  isSelected
                    ? "border-[var(--dash-ink)] bg-[var(--dash-ink)] text-white"
                    : "border-[var(--dash-line)] bg-white hover:border-black/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm font-semibold leading-tight ${isSelected ? "text-white" : "text-[var(--dash-ink)]"}`}>
                    {voice.name}
                  </span>
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "bg-white border-white text-[var(--dash-ink)]"
                        : "border-[var(--dash-line)] group-hover:border-black/40"
                    }`}
                  >
                    {isSelected && <Check className="size-3 stroke-[3]" />}
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${isSelected ? "text-white/70" : "text-[var(--dash-muted)]"}`}>
                  {voice.description}
                </p>

                <span className={`text-[11px] uppercase tracking-widest font-medium ${isSelected ? "text-white/50" : "text-[var(--dash-muted)]"}`}>
                  {voice.tone}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--dash-line)]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--dash-line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg)] transition cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--dash-ink)] hover:bg-zinc-800 text-white px-7 py-3 text-sm font-semibold transition cursor-pointer"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
