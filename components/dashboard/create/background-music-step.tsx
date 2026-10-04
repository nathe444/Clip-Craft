"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Play, Square, ArrowLeft, ArrowRight, Volume2, Sparkles } from "lucide-react";
import {
  BACKGROUND_MUSIC_TRACKS,
  MUSIC_CATEGORIES,
  type MusicTrack,
} from "./music-library";

interface BackgroundMusicStepProps {
  selectedNicheId: string;
  backgroundMusicId: string;
  musicVolume: number;
  onChangeBackgroundMusic: (id: string) => void;
  onChangeMusicVolume: (volume: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function BackgroundMusicStep({
  selectedNicheId,
  backgroundMusicId,
  musicVolume,
  onChangeBackgroundMusic,
  onChangeMusicVolume,
  onBack,
  onContinue,
}: BackgroundMusicStepProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-recommend a track based on the selected niche if none selected yet
  useEffect(() => {
    if (!backgroundMusicId) {
      const match = BACKGROUND_MUSIC_TRACKS.find((t) =>
        t.recommendedNiches.includes(selectedNicheId)
      );
      if (match) {
        onChangeBackgroundMusic(match.id);
      } else {
        onChangeBackgroundMusic(BACKGROUND_MUSIC_TRACKS[0].id);
      }
    }
  }, [selectedNicheId, backgroundMusicId, onChangeBackgroundMusic]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPlayingId(null);
  }

  function handleTogglePreview(track: MusicTrack) {
    if (!track.audioUrl) {
      stopAudio();
      return;
    }

    if (playingId === track.id) {
      stopAudio();
      return;
    }

    stopAudio();

    const audio = new Audio(track.audioUrl);
    audio.volume = Math.max(0.05, Math.min(1, musicVolume / 100));
    audioRef.current = audio;
    setPlayingId(track.id);

    audio.addEventListener("ended", () => {
      setPlayingId(null);
      audioRef.current = null;
    });

    audio.addEventListener("error", () => {
      setPlayingId(null);
      audioRef.current = null;
    });

    audio.play().catch(() => {
      setPlayingId(null);
      audioRef.current = null;
    });
  }

  // Sync volume dynamically if user moves slider while playing
  function handleVolumeChange(val: number) {
    onChangeMusicVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0.05, Math.min(1, val / 100));
    }
  }

  // Filtered tracks
  const filteredTracks =
    selectedCategory === "All"
      ? BACKGROUND_MUSIC_TRACKS
      : BACKGROUND_MUSIC_TRACKS.filter(
          (t) => t.category === selectedCategory || t.id === "none"
        );

  const currentTrack = BACKGROUND_MUSIC_TRACKS.find(
    (t) => t.id === backgroundMusicId
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--dash-ink)]">
          Background Music
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-[var(--dash-muted)]">
          Pick an ambient soundtrack to set the tone for your short-form series.
        </p>
      </div>

      {/* Category Pills */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--dash-muted)]">
          Mood / Genre
        </label>
        <div className="flex flex-wrap gap-2">
          {MUSIC_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
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
      </div>

      {/* Track List Container */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--dash-muted)]">
            Curated Royalty-Free Library
            <span className="ml-2 font-normal normal-case text-[var(--dash-muted)]">
              — 100% Commercial & Monetization Safe
            </span>
          </label>
        </div>

        <div
          className="h-[400px] overflow-y-auto rounded-2xl border border-[var(--dash-line)] custom-scrollbar divide-y divide-[var(--dash-line)]"
          role="radiogroup"
          aria-label="Background music tracks"
        >
          {filteredTracks.map((track) => {
            const isSelected = backgroundMusicId === track.id;
            const isPlaying = playingId === track.id;
            const isRecommended = track.recommendedNiches.includes(selectedNicheId);

            return (
              <div
                key={track.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onChangeBackgroundMusic(track.id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onChangeBackgroundMusic(track.id);
                  }
                }}
                className={`group flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors select-none outline-none ${
                  isSelected
                    ? "bg-[var(--dash-ink)]"
                    : "bg-white hover:bg-[var(--dash-bg)]"
                }`}
              >
                {/* Radio indicator */}
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

                {/* Track Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold tracking-tight ${
                        isSelected ? "text-white" : "text-[var(--dash-ink)]"
                      }`}
                    >
                      {track.title}
                    </span>
                    {isRecommended && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        <Sparkles className="size-2.5" />
                        Recommended
                      </span>
                    )}
                    {track.tag && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                          isSelected
                            ? "bg-white/10 text-white/70"
                            : "bg-[var(--dash-bg)] text-[var(--dash-muted)]"
                        }`}
                      >
                        {track.tag}
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-0.5 text-xs line-clamp-1 ${
                      isSelected ? "text-white/60" : "text-[var(--dash-muted)]"
                    }`}
                  >
                    {track.description}
                  </p>

                  <div
                    className={`mt-1.5 flex items-center gap-2.5 text-[11px] ${
                      isSelected ? "text-white/70" : "text-[var(--dash-muted)]"
                    }`}
                  >
                    <span className="font-medium">{track.mood}</span>
                    <span className="opacity-40">·</span>
                    <span>{track.bpm}</span>
                    <span className="opacity-40">·</span>
                    <span>{track.duration}</span>
                  </div>
                </div>

                {/* Preview Button */}
                {track.audioUrl ? (
                  <button
                    type="button"
                    aria-label={isPlaying ? `Stop ${track.title}` : `Preview ${track.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePreview(track);
                    }}
                    className={`shrink-0 flex size-9 items-center justify-center rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? isPlaying
                          ? "bg-white/20 border-white/20 text-white"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        : isPlaying
                        ? "bg-[var(--dash-ink)] border-[var(--dash-ink)] text-white"
                        : "bg-white border-[var(--dash-line)] text-[var(--dash-muted)] hover:border-[var(--dash-ink)] hover:text-[var(--dash-ink)]"
                    }`}
                  >
                    {isPlaying ? (
                      <Square className="size-3.5 fill-current" />
                    ) : (
                      <Play className="size-3.5 fill-current translate-x-px" />
                    )}
                  </button>
                ) : (
                  <span
                    className={`text-xs italic shrink-0 px-2 ${
                      isSelected ? "text-white/40" : "text-[var(--dash-muted)]"
                    }`}
                  >
                    Silent
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Volume Balance Control */}
      {backgroundMusicId !== "none" && (
        <div className="rounded-2xl border border-[var(--dash-line)] bg-[var(--dash-bg)]/50 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="size-4 text-[var(--dash-ink)]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--dash-ink)]">
                Background Music Volume
              </span>
            </div>
            <span className="font-mono text-sm font-bold text-[var(--dash-ink)]">
              {musicVolume}%
            </span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={musicVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-[var(--dash-ink)] cursor-pointer"
            />
          </div>

          <p className="text-xs text-[var(--dash-muted)]">
            Recommended setting: <strong>12% – 20%</strong>. Keeps the Deepgram AI voiceover crisp, audible, and easily understandable above the music.
          </p>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--dash-line)]">
        <div className="text-sm text-[var(--dash-muted)]">
          {currentTrack ? (
            <span>
              Selected: <strong className="text-[var(--dash-ink)]">{currentTrack.title}</strong>
              {currentTrack.id !== "none" && (
                <>
                  {" · "}
                  <span>{musicVolume}% volume</span>
                </>
              )}
            </span>
          ) : (
            <span>Select a track</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              stopAudio();
              onBack();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--dash-line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg)] transition cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          <button
            type="button"
            onClick={() => {
              stopAudio();
              onContinue();
            }}
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
