"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Sparkles,
  Volume2,
  FileText,
  Captions,
  Image as ImageIcon,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { type VideoProgressState, STEP_LABELS } from "@/lib/video/video-store";

interface LiveProgressProps {
  state: VideoProgressState;
  seriesName?: string;
}

const STEPS = [
  { id: 1, title: "Series Setup", desc: "Audio & Preferences", icon: Volume2 },
  { id: 2, title: "Script Writing", desc: "Story Hook & Scenes", icon: FileText },
  { id: 3, title: "Voiceover Narration", desc: "Natural Audio Voice", icon: Sparkles },
  { id: 4, title: "Caption Alignment", desc: "Timed Word Synchronization", icon: Captions },
  { id: 5, title: "Scene Artwork", desc: "Visual Scene Illustrations", icon: ImageIcon },
  { id: 6, title: "Final Video", desc: "Assembly & Rendering", icon: CheckCircle2 },
];

export function LiveProgress({ state, seriesName }: LiveProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStep = state.currentStep || 1;
  const progressPercent = state.progressPercent || 15;
  const activeLabel = state.stepLabel || STEP_LABELS[currentStep] || "Processing...";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 py-6">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 sm:p-8 text-white shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 size-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-64 rounded-full bg-amber-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              Generating Short Video
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {seriesName || state.seriesName || "Video Series"}
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-emerald-400 shrink-0" />
              <span>{activeLabel}</span>
            </p>
          </div>

          {/* Stats Badge */}
          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 shrink-0 gap-1">
            <div className="text-xs text-zinc-400 font-medium">Time Elapsed</div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
              {Math.floor(elapsedSeconds / 60)}:
              {(elapsedSeconds % 60).toString().padStart(2, "0")}
            </div>
            <div className="text-xs text-emerald-400/80 font-mono">
              {progressPercent}% Complete
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="relative mt-8 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 6-Step Stepper Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`relative flex items-start gap-4 rounded-2xl border p-4.5 transition-all duration-200 ${
                isCurrent
                  ? "border-zinc-900 bg-white ring-2 ring-zinc-900 shadow-md"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
                  : "border-zinc-200/80 bg-zinc-50/50 opacity-60"
              }`}
            >
              {/* Step Status Badge / Icon */}
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isDone
                    ? "bg-emerald-500 text-white shadow-xs"
                    : isCurrent
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {isDone ? (
                  <Check className="size-5 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Step {step.id}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Active
                    </span>
                  )}
                  {isDone && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Done
                    </span>
                  )}
                </div>
                <h4
                  className={`mt-0.5 text-sm font-semibold truncate ${
                    isCurrent ? "text-zinc-900 font-bold" : "text-zinc-800"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
