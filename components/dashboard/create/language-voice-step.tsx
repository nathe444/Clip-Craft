"use client";

import { useState, useRef, useCallback } from "react";
import { Check, Play, Square, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { DEEPGRAM_LANGUAGES, type DeepgramVoice } from "./deepgram-voices";

interface LanguageVoiceStepProps {
  language: string;  // locale code, e.g. "en-us"
  voiceModel: string; // deepgram model id, e.g. "aura-2-thalia-en"
  onChangeLanguage: (locale: string) => void;
  onChangeVoiceModel: (model: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function LanguageVoiceStep({
  language,
  voiceModel,
  onChangeLanguage,
  onChangeVoiceModel,
  onBack,
  onContinue,
}: LanguageVoiceStepProps) {
  const [playingModel, setPlayingModel] = useState<string | null>(null);
  const [loadingModel, setLoadingModel] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<"All" | "Masculine" | "Feminine">("All");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Find selected language data
  const selectedLang =
    DEEPGRAM_LANGUAGES.find((l) => l.locale === language) ?? DEEPGRAM_LANGUAGES[0];

  // Filter voices
  const voices =
    genderFilter === "All"
      ? selectedLang.voices
      : selectedLang.voices.filter((v) => v.gender === genderFilter);

  // Auto-select first voice when language changes
  function handleLanguageChange(locale: string) {
    stopAudio();
    const lang = DEEPGRAM_LANGUAGES.find((l) => l.locale === locale);
    onChangeLanguage(locale);
    if (lang && lang.voices.length > 0) {
      onChangeVoiceModel(lang.voices[0].model);
    }
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPlayingModel(null);
    setLoadingModel(null);
  }

  const handlePreview = useCallback(async (voice: DeepgramVoice) => {
    // If already playing this voice, stop it
    if (playingModel === voice.model) {
      stopAudio();
      return;
    }

    stopAudio();
    setLoadingModel(voice.model);

    try {
      const url = `/api/voice-preview?model=${encodeURIComponent(voice.model)}&lang=${encodeURIComponent(voice.lang)}`;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener("canplay", () => {
        setLoadingModel(null);
        setPlayingModel(voice.model);
        audio.play().catch(() => {
          setLoadingModel(null);
          setPlayingModel(null);
        });
      });

      audio.addEventListener("ended", () => {
        setPlayingModel(null);
        audioRef.current = null;
      });

      audio.addEventListener("error", () => {
        setLoadingModel(null);
        setPlayingModel(null);
        audioRef.current = null;
      });

      audio.load();
    } catch {
      setLoadingModel(null);
      setPlayingModel(null);
    }
  }, [playingModel]);

  const selectedVoice = selectedLang.voices.find((v) => v.model === voiceModel);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--dash-ink)]">
          Language & Voice
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-[var(--dash-muted)]">
          Choose narration language then pick a Deepgram voice for your series.
        </p>
      </div>

      {/* Language selector — pill row */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--dash-muted)]">
          Language
        </label>
        <div className="flex flex-wrap gap-2">
          {DEEPGRAM_LANGUAGES.map((lang) => {
            const isActive = lang.locale === language;
            return (
              <button
                key={lang.locale}
                type="button"
                onClick={() => handleLanguageChange(lang.locale)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "border-[var(--dash-ink)] bg-[var(--dash-ink)] text-white"
                    : "border-[var(--dash-line)] text-[var(--dash-muted)] hover:border-[var(--dash-ink)] hover:text-[var(--dash-ink)]"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
                <span className={`text-[11px] ${isActive ? "text-white/60" : "text-[var(--dash-muted)]"}`}>
                  {lang.voices.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice list section */}
      <div className="space-y-3">
        {/* Section header with gender filter */}
        <div className="flex items-center justify-between gap-3">
          <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--dash-muted)]">
            Voice Models
            <span className="ml-2 font-normal normal-case text-[var(--dash-muted)]">
              — Powered by Deepgram Aura-2
            </span>
          </label>

          {/* Gender filter */}
          <div className="inline-flex rounded-lg border border-[var(--dash-line)] overflow-hidden shrink-0">
            {(["All", "Masculine", "Feminine"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1.5 text-xs font-medium border-r last:border-r-0 border-[var(--dash-line)] transition-colors cursor-pointer ${
                  genderFilter === g
                    ? "bg-[var(--dash-ink)] text-white"
                    : "bg-white text-[var(--dash-muted)] hover:text-[var(--dash-ink)]"
                }`}
              >
                {g === "All" ? "All" : g === "Masculine" ? "♂ Male" : "♀ Female"}
              </button>
            ))}
          </div>
        </div>

        {/* Voices list container — fixed height with scroll */}
        <div
          className="h-[420px] overflow-y-auto rounded-2xl border border-[var(--dash-line)] custom-scrollbar divide-y divide-[var(--dash-line)]"
          role="radiogroup"
          aria-label="Voice models"
        >
          {voices.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--dash-muted)]">
              No voices match this filter.
            </div>
          ) : (
            voices.map((voice) => {
              const isSelected = voiceModel === voice.model;
              const isPlaying = playingModel === voice.model;
              const isLoading = loadingModel === voice.model;

              return (
                <div
                  key={voice.model}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => onChangeVoiceModel(voice.model)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      onChangeVoiceModel(voice.model);
                    }
                  }}
                  className={`group flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors select-none outline-none ${
                    isSelected
                      ? "bg-[var(--dash-ink)]"
                      : "bg-white hover:bg-[var(--dash-bg)]"
                  }`}
                >
                  {/* Radio dot */}
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "bg-white border-white"
                        : "border-[var(--dash-line)] group-hover:border-black/40"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <Check
                        className="size-3 stroke-[3] text-[var(--dash-ink)]"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  {/* Main info */}
                  <div className="min-w-0 flex-1">
                    {/* Row 1: Name + model id */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold tracking-tight ${
                          isSelected ? "text-white" : "text-[var(--dash-ink)]"
                        }`}
                      >
                        {voice.name}
                      </span>
                      <code
                        className={`text-[11px] font-mono ${
                          isSelected ? "text-white/50" : "text-[var(--dash-muted)]"
                        }`}
                      >
                        {voice.model}
                      </code>
                    </div>

                    {/* Row 2: Gender · Accent · Use cases */}
                    <div
                      className={`mt-1 flex items-center gap-3 text-xs ${
                        isSelected ? "text-white/70" : "text-[var(--dash-muted)]"
                      }`}
                    >
                      <span className="font-medium">{voice.gender}</span>
                      <span className="opacity-40">·</span>
                      <span>{voice.accent}</span>
                      <span className="opacity-40">·</span>
                      <span>{voice.age}</span>
                    </div>

                    {/* Row 3: Trait pills */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {voice.traits.map((trait) => (
                        <span
                          key={trait}
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            isSelected
                              ? "bg-white/10 text-white/80"
                              : "bg-[var(--dash-bg)] text-[var(--dash-muted)]"
                          }`}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Use cases — hidden on small */}
                  <div className="hidden lg:block shrink-0 text-right">
                    <span
                      className={`text-[11px] ${
                        isSelected ? "text-white/50" : "text-[var(--dash-muted)]"
                      }`}
                    >
                      {voice.useCases}
                    </span>
                  </div>

                  {/* Preview button — stops event propagation */}
                  <button
                    type="button"
                    aria-label={isPlaying ? `Stop ${voice.name}` : `Preview ${voice.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(voice);
                    }}
                    className={`shrink-0 flex size-9 items-center justify-center rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? isPlaying || isLoading
                          ? "bg-white/20 border-white/20 text-white"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        : isPlaying || isLoading
                        ? "bg-[var(--dash-ink)] border-[var(--dash-ink)] text-white"
                        : "bg-white border-[var(--dash-line)] text-[var(--dash-muted)] hover:border-[var(--dash-ink)] hover:text-[var(--dash-ink)]"
                    }`}
                  >
                    {isLoading ? (
                      <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : isPlaying ? (
                      <Square className="size-3.5 fill-current" />
                    ) : (
                      <Play className="size-3.5 fill-current translate-x-px" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--dash-line)]">
        {/* Selected voice summary */}
        <div className="text-sm text-[var(--dash-muted)]">
          {selectedVoice ? (
            <span>
              <span className="font-semibold text-[var(--dash-ink)]">{selectedVoice.name}</span>
              {" · "}
              {selectedVoice.gender}
              {" · "}
              {selectedVoice.accent}
            </span>
          ) : (
            <span>Select a voice</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { stopAudio(); onBack(); }}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--dash-line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg)] transition cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          <button
            type="button"
            onClick={() => { stopAudio(); onContinue(); }}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--dash-ink)] hover:bg-zinc-800 text-white px-7 py-3 text-sm font-semibold transition cursor-pointer"
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
