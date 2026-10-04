"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ArrowRight, Search, X } from "lucide-react";
import { AVAILABLE_NICHES } from "./types";

interface NicheSelectionStepProps {
  nicheType: "available" | "custom";
  selectedNicheId: string;
  customNicheTitle: string;
  customNicheDescription: string;
  onChangeNicheType: (type: "available" | "custom") => void;
  onSelectNiche: (nicheId: string) => void;
  onChangeCustomTitle: (title: string) => void;
  onChangeCustomDescription: (desc: string) => void;
  onContinue: () => void;
}

const SUGGESTION_TOPICS = [
  "Cosmic Mysteries",
  "Deep Sea Abyss",
  "Mythology & Folklore",
  "Psychology Tricks",
  "Urban Legends",
  "Silicon Valley Scandals",
  "Ancient Civilizations",
  "Extreme Sports",
];

export function NicheSelectionStep({
  nicheType,
  selectedNicheId,
  customNicheTitle,
  customNicheDescription,
  onChangeNicheType,
  onSelectNiche,
  onChangeCustomTitle,
  onChangeCustomDescription,
  onContinue,
}: NicheSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNiches = AVAILABLE_NICHES.filter(
    (niche) =>
      niche.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      niche.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedNicheObj = AVAILABLE_NICHES.find((n) => n.id === selectedNicheId);

  const isFormValid =
    nicheType === "available"
      ? Boolean(selectedNicheId)
      : customNicheTitle.trim().length >= 2;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--dash-ink)]">
            Choose your niche
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-[var(--dash-muted)]">
            Pick a proven video format or describe your own concept.
          </p>
        </div>

        {/* Tab Switcher — plain pill */}
        <div className="inline-flex rounded-xl p-1 bg-[var(--dash-bg)] border border-[var(--dash-line)] shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => onChangeNicheType("available")}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              nicheType === "available"
                ? "bg-white text-[var(--dash-ink)] shadow-sm border border-[var(--dash-line)]"
                : "text-[var(--dash-muted)] hover:text-[var(--dash-ink)]"
            }`}
          >
            Available ({AVAILABLE_NICHES.length})
          </button>
          <button
            type="button"
            onClick={() => onChangeNicheType("custom")}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              nicheType === "custom"
                ? "bg-white text-[var(--dash-ink)] shadow-sm border border-[var(--dash-line)]"
                : "text-[var(--dash-muted)] hover:text-[var(--dash-ink)]"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* ─── AVAILABLE NICHES ─── */}
      {nicheType === "available" && (
        <div className="space-y-5">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--dash-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search niches..."
              className="w-full rounded-xl border border-[var(--dash-line)] bg-white pl-9 pr-8 py-2.5 text-sm text-[var(--dash-ink)] placeholder-[var(--dash-muted)] focus:outline-none focus:border-[var(--dash-ink)] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] hover:text-[var(--dash-ink)]"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Grid */}
          {filteredNiches.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-[var(--dash-line)]">
              <p className="text-base font-semibold text-[var(--dash-ink)]">
                Nothing found for &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-sm text-[var(--dash-muted)] mt-1">
                Try a different term or use Custom.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 text-sm font-semibold text-[var(--dash-ink)] underline underline-offset-2"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              role="radiogroup"
              aria-label="Available niches"
            >
              {filteredNiches.map((niche) => {
                const isSelected = selectedNicheId === niche.id;

                return (
                  <div
                    key={niche.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => onSelectNiche(niche.id)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        onSelectNiche(niche.id);
                      }
                    }}
                    className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 select-none outline-none ${
                      isSelected
                        ? "ring-2 ring-[var(--dash-ink)] shadow-lg -translate-y-0.5"
                        : "ring-1 ring-[var(--dash-line)] hover:ring-black/30 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-zinc-100">
                      <Image
                        src={niche.image}
                        alt={niche.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      {/* Tag — top left */}
                      {niche.tag && (
                        <span className="absolute top-3 left-3 rounded-md bg-white/15 backdrop-blur-sm border border-white/20 px-2 py-0.5 text-[11px] font-medium text-white tracking-wide">
                          {niche.tag}
                        </span>
                      )}

                      {/* Check indicator — top right */}
                      <div
                        className={`absolute top-3 right-3 flex size-6 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? "bg-white border-white text-[var(--dash-ink)]"
                            : "border-white/40 bg-black/30 text-transparent group-hover:border-white/70"
                        }`}
                      >
                        <Check className="size-3.5 stroke-[2.5]" />
                      </div>

                      {/* Title over image bottom */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-semibold text-sm sm:text-base leading-snug drop-shadow">
                          {niche.title}
                        </p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className={`p-4 transition-colors ${isSelected ? "bg-[var(--dash-ink)] text-white" : "bg-white"}`}>
                      <p className={`text-xs sm:text-[13px] leading-relaxed line-clamp-2 ${isSelected ? "text-white/80" : "text-[var(--dash-muted)]"}`}>
                        {niche.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── CUSTOM NICHE ─── */}
      {nicheType === "custom" && (
        <div className="max-w-2xl space-y-7">
          {/* Inputs */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="custom-niche-title"
                className="block text-sm font-semibold text-[var(--dash-ink)]"
              >
                Series topic
                <span className="text-[var(--dash-muted)] font-normal ml-1">(required)</span>
              </label>
              <input
                id="custom-niche-title"
                type="text"
                value={customNicheTitle}
                onChange={(e) => onChangeCustomTitle(e.target.value)}
                placeholder="e.g. Deep Ocean Secrets"
                className="w-full rounded-xl border border-[var(--dash-line)] bg-white px-4 py-3 text-sm text-[var(--dash-ink)] placeholder-[var(--dash-muted)] focus:outline-none focus:border-[var(--dash-ink)] transition"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="custom-niche-desc"
                className="block text-sm font-semibold text-[var(--dash-ink)]"
              >
                Core angle
                <span className="text-[var(--dash-muted)] font-normal ml-1">(optional)</span>
              </label>
              <textarea
                id="custom-niche-desc"
                rows={3}
                value={customNicheDescription}
                onChange={(e) => onChangeCustomDescription(e.target.value)}
                placeholder="Describe what makes your series unique — the angle, hook, or tone."
                className="w-full rounded-xl border border-[var(--dash-line)] bg-white px-4 py-3 text-sm text-[var(--dash-ink)] placeholder-[var(--dash-muted)] focus:outline-none focus:border-[var(--dash-ink)] transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--dash-muted)]">
              Trending topics
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onChangeCustomTitle(topic)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                    customNicheTitle === topic
                      ? "border-[var(--dash-ink)] bg-[var(--dash-ink)] text-white"
                      : "border-[var(--dash-line)] text-[var(--dash-muted)] hover:border-[var(--dash-ink)] hover:text-[var(--dash-ink)]"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── BOTTOM BAR ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--dash-line)]">
        {/* Status */}
        <div className="text-sm text-[var(--dash-muted)]">
          {nicheType === "available" && selectedNicheObj ? (
            <span className="font-medium text-[var(--dash-ink)]">
              {selectedNicheObj.title}
            </span>
          ) : nicheType === "custom" && customNicheTitle.trim() ? (
            <span className="font-medium text-[var(--dash-ink)]">
              {customNicheTitle}
            </span>
          ) : (
            <span>Select a niche to continue</span>
          )}
        </div>

        {/* Continue */}
        <button
          type="button"
          disabled={!isFormValid}
          onClick={onContinue}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-150 cursor-pointer ${
            isFormValid
              ? "bg-[var(--dash-ink)] hover:bg-zinc-800 text-white"
              : "bg-[var(--dash-line)] text-[var(--dash-muted)] cursor-not-allowed"
          }`}
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
