"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import {
  VIDEO_STYLES,
  STYLE_CATEGORIES,
  type VideoStyleOption,
} from "./video-styles";

interface VideoStyleStepProps {
  selectedNicheId: string;
  visualStyle: string;
  onChangeVisualStyle: (styleId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function VideoStyleStep({
  selectedNicheId,
  visualStyle,
  onChangeVisualStyle,
  onBack,
  onContinue,
}: VideoStyleStepProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredStyles =
    selectedCategory === "All"
      ? VIDEO_STYLES
      : VIDEO_STYLES.filter((s) => s.category === selectedCategory);

  const activeStyle = VIDEO_STYLES.find((s) => s.id === visualStyle);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--dash-ink)]">
          Video Visual Style
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-[var(--dash-muted)]">
          Select an AI visual aesthetic for your series.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {STYLE_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`inline-flex items-center rounded-xl border px-4 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "border-[var(--dash-ink)] bg-[var(--dash-ink)] text-white"
                  : "border-[var(--dash-line)] text-[var(--dash-muted)] hover:border-[var(--dash-ink)] hover:text-[var(--dash-ink)]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3-Column Grid of Large 16:9 Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="radiogroup"
        aria-label="Video styles"
      >
        {filteredStyles.map((style) => {
          const isSelected = visualStyle === style.id;
          const isRecommended = style.recommendedFor.includes(selectedNicheId);

          return (
            <div
              key={style.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onChangeVisualStyle(style.id)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onChangeVisualStyle(style.id);
                }
              }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-200 cursor-pointer outline-none select-none ${
                isSelected
                  ? "border-[var(--dash-ink)] ring-2 ring-[var(--dash-ink)] shadow-md bg-white"
                  : "border-[var(--dash-line)] hover:border-black/30 hover:shadow-sm bg-white"
              }`}
            >
              {/* Large 16:9 Image Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                <Image
                  src={style.image}
                  alt={style.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Subtle vignette scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                {/* Top overlay badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                  {isRecommended ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--dash-ink)] shadow-sm">
                      <Sparkles className="size-3 text-amber-500" />
                      Recommended
                    </span>
                  ) : style.tag ? (
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white/90">
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
                        : "bg-black/40 border-white/50 text-transparent group-hover:border-white"
                    }`}
                  >
                    <Check className="size-4 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Elongated Card Footer with Minimal Punchy Content */}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[var(--dash-ink)] tracking-tight">
                      {style.title}
                    </h3>
                    <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                      {style.category}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--dash-muted)] line-clamp-1">
                    {style.tagline}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--dash-line)]">
        <div className="text-sm text-[var(--dash-muted)]">
          {activeStyle ? (
            <span>
              Selected Style:{" "}
              <strong className="text-[var(--dash-ink)]">{activeStyle.title}</strong>
              {" · "}
              <span className="text-xs">{activeStyle.tagline}</span>
            </span>
          ) : (
            <span>Select a visual style</span>
          )}
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
