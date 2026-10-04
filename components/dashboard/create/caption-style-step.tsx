"use client";

import { useState, useEffect } from "react";
import { Check, ArrowLeft, ArrowRight, Sparkles, SlidersHorizontal } from "lucide-react";
import {
  CAPTION_STYLES,
  CAPTION_ACCENT_COLORS,
  type CaptionStyleOption,
} from "./caption-styles";

interface CaptionStyleStepProps {
  selectedNicheId: string;
  captionStyle: string;
  captionDensity: "1-2-words" | "3-5-words";
  captionPosition: "middle" | "bottom";
  captionColor: string;
  onChangeCaptionStyle: (styleId: string) => void;
  onChangeCaptionDensity: (density: "1-2-words" | "3-5-words") => void;
  onChangeCaptionPosition: (pos: "middle" | "bottom") => void;
  onChangeCaptionColor: (color: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function CaptionStyleStep({
  selectedNicheId,
  captionStyle,
  captionDensity,
  captionPosition,
  captionColor,
  onChangeCaptionStyle,
  onChangeCaptionDensity,
  onChangeCaptionPosition,
  onChangeCaptionColor,
  onBack,
  onContinue,
}: CaptionStyleStepProps) {
  // Active animated word index for real-time live preview cycling
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % 4);
    }, 650);
    return () => clearInterval(timer);
  }, []);

  const activeStyle = CAPTION_STYLES.find((s) => s.id === captionStyle) ?? CAPTION_STYLES[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--dash-ink)]">
          Caption Style
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-[var(--dash-muted)]">
          Choose animated subtitle templates to maximize viewer retention.
        </p>
      </div>

      {/* 3-Column Grid of Live Animated Caption Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="radiogroup"
        aria-label="Caption templates"
      >
        {CAPTION_STYLES.map((style) => {
          const isSelected = captionStyle === style.id;
          const isRecommended = style.recommendedNiches.includes(selectedNicheId);
          const currentColor = isSelected ? captionColor : style.defaultColor;

          return (
            <div
              key={style.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => {
                onChangeCaptionStyle(style.id);
                // Also default to this template's color if none chosen
                if (!isSelected) {
                  onChangeCaptionColor(style.defaultColor);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onChangeCaptionStyle(style.id);
                }
              }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-200 cursor-pointer outline-none select-none ${
                isSelected
                  ? "border-[var(--dash-ink)] ring-2 ring-[var(--dash-ink)] shadow-md bg-white"
                  : "border-[var(--dash-line)] hover:border-black/30 hover:shadow-sm bg-white"
              }`}
            >
              {/* 16:9 Live Animated Preview Canvas */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 flex items-center justify-center p-4">
                {/* Background subtle mesh/glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/60 to-black/80" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

                {/* Top overlay badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                  {isRecommended ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--dash-ink)] shadow-sm">
                      <Sparkles className="size-3 text-amber-500" />
                      Recommended
                    </span>
                  ) : style.tag ? (
                    <span className="rounded-full bg-white/10 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white/90">
                      {style.tag}
                    </span>
                  ) : (
                    <span />
                  )}

                  {/* Radio check pill */}
                  <div
                    className={`flex size-7 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "bg-[var(--dash-ink)] border-white text-white"
                        : "bg-black/50 border-white/40 text-transparent group-hover:border-white"
                    }`}
                  >
                    <Check className="size-4 stroke-[3]" />
                  </div>
                </div>

                {/* Animated Subtitle Text Preview */}
                <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 text-center max-w-[90%]">
                  {style.previewWords.map((word, idx) => {
                    const isCurrent = idx === activeWordIndex % style.previewWords.length;

                    return (
                      <span
                        key={idx}
                        style={{
                          color: isCurrent ? currentColor : "#FFFFFF",
                          transform: isCurrent ? "scale(1.12)" : "scale(1)",
                          opacity: isCurrent ? 1 : 0.65,
                          transition: "all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                        className={`inline-block ${style.fontClass} ${style.shadowClass} ${
                          style.textTransform === "uppercase" ? "uppercase" : ""
                        } ${
                          style.bgPill
                            ? "bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm"
                            : ""
                        } text-lg sm:text-xl font-bold`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-2">
                <div className="space-y-0.5">
                  <h3 className="text-base font-semibold text-[var(--dash-ink)] tracking-tight">
                    {style.title}
                  </h3>
                  <p className="text-xs text-[var(--dash-muted)] line-clamp-1">
                    {style.tagline}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtitle Customizer Bar */}
      <div className="rounded-3xl border border-[var(--dash-line)] bg-zinc-50/70 p-6 space-y-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-[var(--dash-ink)]" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--dash-ink)]">
            Subtitle Fine-Tuning
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Word Density */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider">
              Display Density
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeCaptionDensity("1-2-words")}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  captionDensity === "1-2-words"
                    ? "bg-[var(--dash-ink)] text-white border-[var(--dash-ink)]"
                    : "bg-white text-[var(--dash-muted)] border-[var(--dash-line)] hover:border-black/30"
                }`}
              >
                1–2 Words
                <span className="block text-[10px] opacity-70">High Retention</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeCaptionDensity("3-5-words")}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  captionDensity === "3-5-words"
                    ? "bg-[var(--dash-ink)] text-white border-[var(--dash-ink)]"
                    : "bg-white text-[var(--dash-muted)] border-[var(--dash-line)] hover:border-black/30"
                }`}
              >
                3–5 Words
                <span className="block text-[10px] opacity-70">Short Phrase</span>
              </button>
            </div>
          </div>

          {/* Screen Position */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider">
              Screen Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeCaptionPosition("middle")}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  captionPosition === "middle"
                    ? "bg-[var(--dash-ink)] text-white border-[var(--dash-ink)]"
                    : "bg-white text-[var(--dash-muted)] border-[var(--dash-line)] hover:border-black/30"
                }`}
              >
                Middle (Center)
                <span className="block text-[10px] opacity-70">Safe Zone</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeCaptionPosition("bottom")}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  captionPosition === "bottom"
                    ? "bg-[var(--dash-ink)] text-white border-[var(--dash-ink)]"
                    : "bg-white text-[var(--dash-muted)] border-[var(--dash-line)] hover:border-black/30"
                }`}
              >
                Lower Third
                <span className="block text-[10px] opacity-70">Classic Subtitle</span>
              </button>
            </div>
          </div>

          {/* Highlight Accent Color */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider">
              Highlight Accent
            </label>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {CAPTION_ACCENT_COLORS.map((c) => {
                const isCurrent = captionColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => onChangeCaptionColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`size-8 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? "ring-2 ring-offset-2 ring-[var(--dash-ink)] scale-110 shadow-sm"
                        : "border-black/20 hover:scale-105"
                    }`}
                  >
                    {isCurrent && (
                      <Check
                        className={`size-4 stroke-[3] ${
                          c.hex === "#FFFFFF" || c.hex === "#FACC15"
                            ? "text-black"
                            : "text-white"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--dash-line)]">
        <div className="text-sm text-[var(--dash-muted)]">
          <span>
            Selected: <strong className="text-[var(--dash-ink)]">{activeStyle.title}</strong>
            {" · "}
            <span className="font-mono text-xs">{captionDensity}</span>
            {" · "}
            <span className="capitalize text-xs">{captionPosition}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
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
    </div>
  );
}
