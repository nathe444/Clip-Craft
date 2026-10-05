"use client";

import { useState } from "react";
import {
  Clock,
  Check,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Calendar,
  Info,
  Layers,
  Radio,
  Share2,
} from "lucide-react";
import {
  PLATFORM_OPTIONS,
  DURATION_OPTIONS,
  POPULAR_PUBLISH_TIMES,
  type PlatformOption,
} from "./series-details";

interface SeriesDetailsStepProps {
  seriesName: string;
  duration: "30-50" | "60-70";
  platforms: string[];
  publishTime: string;
  selectedNicheTitle: string;
  selectedVoiceTitle?: string;
  selectedMusicTitle?: string;
  selectedVisualStyleTitle?: string;
  selectedCaptionStyleTitle?: string;
  onChangeSeriesName: (name: string) => void;
  onChangeDuration: (duration: "30-50" | "60-70") => void;
  onTogglePlatform: (platformId: string) => void;
  onChangePublishTime: (time: string) => void;
  onBack: () => void;
  onSchedule: () => void;
  isSubmitting?: boolean;
}

// Inline SVGs for brand platform icons matching the wireframe
function TikTokIcon({ className = "size-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.95-4.46V8.1a8.21 8.21 0 0 0 4.82 1.56V6.69h-.02v-.002z" />
    </svg>
  );
}

function InstagramIcon({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ className = "size-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function EmailIcon({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function SeriesDetailsStep({
  seriesName,
  duration,
  platforms,
  publishTime,
  selectedNicheTitle,
  selectedVoiceTitle,
  selectedMusicTitle,
  selectedVisualStyleTitle,
  selectedCaptionStyleTitle,
  onChangeSeriesName,
  onChangeDuration,
  onTogglePlatform,
  onChangePublishTime,
  onBack,
  onSchedule,
  isSubmitting = false,
}: SeriesDetailsStepProps) {
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedDurationObj =
    DURATION_OPTIONS.find((d) => d.id === duration) || DURATION_OPTIONS[0];

  function handleSubmit() {
    if (!seriesName.trim()) {
      setValidationError("Please enter a series name.");
      return;
    }
    if (platforms.length === 0) {
      setValidationError("Please select at least one publishing platform.");
      return;
    }
    setValidationError(null);
    onSchedule();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--dash-ink)]">
          Series Details
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-[var(--dash-muted)]">
          Finalize your series details, target platforms, and daily automated schedule.
        </p>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-7 bg-white">
        {/* 1. Series Name */}
        <div className="space-y-2">
          <label
            htmlFor="series-name"
            className="block text-sm font-semibold text-[var(--dash-ink)]"
          >
            Name
          </label>
          <div className="relative">
            <input
              id="series-name"
              type="text"
              value={seriesName}
              onChange={(e) => {
                onChangeSeriesName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Name"
              className="w-full rounded-2xl border border-[var(--dash-line)] bg-white px-4 py-3.5 text-sm sm:text-base text-[var(--dash-ink)] placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-400 focus:border-[var(--dash-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-ink)]/10"
            />
          </div>
          {!seriesName && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-[var(--dash-muted)]">Suggestion:</span>
              <button
                type="button"
                onClick={() =>
                  onChangeSeriesName(
                    `${selectedNicheTitle || "Viral"} Stories Daily`
                  )
                }
                className="text-xs font-medium text-[var(--dash-ink)] underline hover:text-black cursor-pointer"
              >
                &ldquo;{selectedNicheTitle || "Viral"} Stories Daily&rdquo;
              </button>
            </div>
          )}
        </div>

        {/* 2. Duration Dropdown */}
        <div className="space-y-2 relative">
          <label
            htmlFor="series-duration"
            className="block text-sm font-semibold text-[var(--dash-ink)]"
          >
            Duration
          </label>

          <div className="relative">
            <button
              id="series-duration"
              type="button"
              onClick={() => setIsDurationDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between rounded-2xl border border-[var(--dash-line)] bg-white px-4 py-3.5 text-sm sm:text-base font-medium text-[var(--dash-ink)] transition-all duration-200 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--dash-ink)]/10 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Clock className="size-4 text-[var(--dash-muted)]" />
                <span>{selectedDurationObj.label}</span>
                <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-normal">
                  {selectedDurationObj.badge}
                </span>
              </div>
              <ChevronDown
                className={`size-4 text-[var(--dash-muted)] transition-transform duration-200 ${
                  isDurationDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDurationDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsDurationDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 z-30 overflow-hidden rounded-2xl border border-[var(--dash-line)] bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  {DURATION_OPTIONS.map((opt) => {
                    const isSelected = opt.id === duration;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onChangeDuration(opt.id);
                          setIsDurationDropdownOpen(false);
                        }}
                        className={`w-full flex items-start justify-between rounded-xl p-3 text-left transition cursor-pointer ${
                          isSelected
                            ? "bg-zinc-100 text-[var(--dash-ink)] font-semibold"
                            : "hover:bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{opt.label}</span>
                            <span className="text-[11px] px-2 py-0.2 rounded-full bg-zinc-200/70 text-zinc-700 font-medium">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--dash-muted)]">{opt.description}</p>
                        </div>
                        {isSelected && (
                          <div className="size-5 rounded-full bg-[var(--dash-ink)] text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="size-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Publish On Platform Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[var(--dash-ink)]">
              Publish On
            </label>
            <span className="text-xs text-[var(--dash-muted)]">
              {platforms.length} platform{platforms.length === 1 ? "" : "s"} selected
            </span>
          </div>

          {/* 4 Cards Grid - TikTok, Instagram, YouTube, Email */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {PLATFORM_OPTIONS.map((plat) => {
              const isSelected = platforms.includes(plat.id);

              return (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => {
                    onTogglePlatform(plat.id);
                    if (validationError) setValidationError(null);
                  }}
                  className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 sm:p-6 transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? "border-[var(--dash-ink)] bg-white ring-2 ring-[var(--dash-ink)] shadow-sm"
                      : "border-[var(--dash-line)] bg-white hover:border-zinc-400 hover:shadow-xs text-zinc-700"
                  }`}
                  aria-pressed={isSelected}
                  title={`Toggle ${plat.name}`}
                >
                  {/* Selection indicator pill */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 size-5 rounded-full bg-[var(--dash-ink)] text-white flex items-center justify-center shadow-xs">
                      <Check className="size-3" />
                    </div>
                  )}

                  {/* Platform Icon */}
                  <div
                    className={`transition-transform duration-200 group-hover:scale-105 ${
                      isSelected
                        ? "text-[var(--dash-ink)]"
                        : "text-zinc-600 group-hover:text-[var(--dash-ink)]"
                    }`}
                  >
                    {plat.id === "tiktok" && <TikTokIcon className="size-8" />}
                    {plat.id === "instagram" && <InstagramIcon className="size-8" />}
                    {plat.id === "youtube" && <YouTubeIcon className="size-8" />}
                    {plat.id === "email" && <EmailIcon className="size-8" />}
                  </div>

                  {/* Platform Name */}
                  <span
                    className={`text-sm font-semibold tracking-tight transition-colors ${
                      isSelected ? "text-[var(--dash-ink)]" : "text-zinc-800"
                    }`}
                  >
                    {plat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Publish Time & Note */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <label
              htmlFor="publish-time-button"
              className="text-sm font-semibold text-[var(--dash-ink)] shrink-0 sm:min-w-28"
            >
              Publish Time
            </label>

            {/* Time Display Button / Picker Input */}
            <div className="relative inline-block">
              <button
                id="publish-time-button"
                type="button"
                onClick={() => setIsTimeDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-3 rounded-2xl border border-[var(--dash-line)] bg-white px-5 py-3 text-sm sm:text-base font-semibold text-[var(--dash-ink)] transition-all duration-200 hover:border-zinc-400 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[var(--dash-ink)]/10 cursor-pointer"
              >
                <Clock className="size-4 text-[var(--dash-muted)]" />
                <span className="tracking-wide">{publishTime || "12:00 AM"}</span>
                <ChevronDown
                  className={`size-3.5 text-[var(--dash-muted)] transition-transform duration-200 ${
                    isTimeDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Time Selection Dropdown */}
              {isTimeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsTimeDropdownOpen(false)}
                  />
                  <div className="absolute left-0 sm:left-auto top-full mt-2 z-30 w-72 rounded-2xl border border-[var(--dash-line)] bg-white p-3 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1.5 text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider">
                      Popular Publish Times
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {POPULAR_PUBLISH_TIMES.map((time) => {
                        const isCurrent = publishTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              onChangePublishTime(time);
                              setIsTimeDropdownOpen(false);
                            }}
                            className={`rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer text-center ${
                              isCurrent
                                ? "bg-[var(--dash-ink)] text-white"
                                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Time Option */}
                    <div className="mt-3 pt-2.5 border-t border-[var(--dash-line)] px-1">
                      <div className="flex items-center justify-between text-xs text-[var(--dash-muted)] mb-1.5">
                        <span>Custom time</span>
                      </div>
                      <input
                        type="time"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [hoursStr, minsStr] = e.target.value.split(":");
                            let hours = parseInt(hoursStr, 10);
                            const ampm = hours >= 12 ? "PM" : "AM";
                            hours = hours % 12 || 12;
                            const formatted = `${hours.toString().padStart(2, "0")}:${minsStr} ${ampm}`;
                            onChangePublishTime(formatted);
                            setIsTimeDropdownOpen(false);
                          }
                        }}
                        className="w-full rounded-xl border border-[var(--dash-line)] px-3 py-1.5 text-xs text-[var(--dash-ink)] focus:outline-none focus:border-[var(--dash-ink)]"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Note below time selection */}
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-[var(--dash-line)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--dash-muted)]">
            <Info className="size-4 shrink-0 text-zinc-500" />
            <span>
              video will generate <strong className="text-[var(--dash-ink)] font-medium">3-6 hours</strong> before video publish
            </span>
          </div>
        </div>

        {/* Validation error message if any */}
        {validationError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs sm:text-sm font-medium text-red-700 animate-in fade-in">
            {validationError}
          </div>
        )}

        {/* Series Overview Summary Pill */}
        <div className="rounded-2xl border border-[var(--dash-line)] bg-zinc-50/60 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] mb-3">
            <Sparkles className="size-3.5 text-[var(--dash-ink)]" />
            Configured Series Summary
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[var(--dash-muted)] block">Format & Niche</span>
              <strong className="text-[var(--dash-ink)] font-medium truncate block">
                {selectedNicheTitle || "Selected Niche"}
              </strong>
            </div>
            <div>
              <span className="text-[var(--dash-muted)] block">Narration Voice</span>
              <strong className="text-[var(--dash-ink)] font-medium truncate block">
                {selectedVoiceTitle || "AI Voice"}
              </strong>
            </div>
            <div>
              <span className="text-[var(--dash-muted)] block">Visual Style</span>
              <strong className="text-[var(--dash-ink)] font-medium truncate block">
                {selectedVisualStyleTitle || "Cinematic"}
              </strong>
            </div>
            <div>
              <span className="text-[var(--dash-muted)] block">Captions</span>
              <strong className="text-[var(--dash-ink)] font-medium truncate block">
                {selectedCaptionStyleTitle || "Dynamic"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--dash-line)]">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--dash-line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg)] transition cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--dash-ink)] hover:bg-zinc-800 text-white px-8 py-3 text-sm font-semibold transition shadow-sm cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Scheduling...
            </>
          ) : (
            <>
              <Calendar className="size-4" />
              Schedule
            </>
          )}
        </button>
      </div>
    </div>
  );
}
