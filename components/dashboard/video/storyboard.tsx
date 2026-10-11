"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Copy, Check, Eye, Sparkles } from "lucide-react";
import type { GeneratedVideoRecord } from "@/lib/video/video-store";

interface StoryboardProps {
  video: GeneratedVideoRecord;
}

export function Storyboard({ video }: StoryboardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const images = video.metadata.images || [];
  const scenes = video.metadata.script.scenes || [];

  const handleCopyPrompt = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Sparkles className="size-4.5 text-amber-500" />
            <span>Scene Storyboard & Artwork ({images.length} Scenes)</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Individual scene image prompts and synchronized voiceover text.
          </p>
        </div>
      </div>

      {/* Grid of Scene Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {images.map((img, idx) => {
          const sceneMeta = scenes[idx];
          const spokenText = sceneMeta?.spokenText || "";

          return (
            <div
              key={idx}
              className="group relative flex flex-col rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
            >
              {/* Scene Thumbnail (9:16 Aspect ratio container) */}
              <div className="relative aspect-[9/14] w-full overflow-hidden bg-zinc-950">
                <Image
                  src={img.imageUrl}
                  alt={`Scene ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white border border-white/10">
                  <span>Scene {idx + 1}</span>
                </div>

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={img.imageUrl}
                    download={`scene-${idx + 1}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex size-9 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg hover:scale-110 transition-transform"
                    title="Download Scene Image"
                  >
                    <Download className="size-4" />
                  </a>
                </div>
              </div>

              {/* Text Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {/* Spoken Text */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Spoken Narration
                  </div>
                  <p className="mt-1 text-xs text-zinc-800 font-medium leading-relaxed italic">
                    "{spokenText || img.prompt.slice(0, 100)}..."
                  </p>
                </div>

                {/* Visual Prompt */}
                <div className="pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Visual Prompt
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(img.prompt, idx)}
                      className="text-zinc-400 hover:text-zinc-800 transition cursor-pointer p-1"
                      title="Copy Prompt"
                    >
                      {copiedIndex === idx ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2">
                    {img.prompt}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
