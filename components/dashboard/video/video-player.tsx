"use client";

import React, { useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { VideoComposition } from "@/remotion/VideoComposition";
import type { VideoCompositionProps } from "@/remotion/types";
import type { GeneratedVideoRecord } from "@/lib/video/video-store";
import { Sparkles, Download, Film, Eye } from "lucide-react";

interface VideoPlayerProps {
  video: GeneratedVideoRecord;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const [useRawVideo, setUseRawVideo] = useState(false);

  const images = video.metadata.images || [];
  const voice = video.metadata.voice;
  const captionsMeta = video.metadata.captions;
  const script = video.metadata.script;

  const durationSec = Math.max(3, Math.round(voice?.durationSeconds || 30));
  const totalFrames = durationSec * 30;

  // Prepare input props for Remotion composition
  const compositionProps: VideoCompositionProps = useMemo(() => {
    return {
      title: video.videoTitle,
      durationInSeconds: durationSec,
      voiceoverAudioUrl: voice?.audioUrl || "",
      backgroundMusicUrl: null,
      musicVolume: 18,
      scenes: images.map((img, idx) => ({
        sceneNumber: img.sceneNumber,
        imageUrl: img.imageUrl,
        prompt: img.prompt,
        spokenText: script.scenes[idx]?.spokenText || "",
      })),
      subtitles: captionsMeta?.subtitles || [],
      captionStyle: captionsMeta?.captionStyle || "hormozi-pop",
      captionColor: captionsMeta?.accentColor || "#FACC15",
      captionPosition: captionsMeta?.captionPosition || "middle",
      captionDensity: captionsMeta?.captionDensity || "1-2-words",
    };
  }, [video, durationSec, voice, captionsMeta, script, images]);

  const hasMp4Url =
    Boolean(video.videoUrl && (video.videoUrl.endsWith(".mp4") || video.videoUrl.includes("amazonaws.com") || video.videoUrl.includes("supabase.co")));

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-4">
      {/* 9:16 Vertical Video Frame */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl border border-zinc-800 flex items-center justify-center">
        {hasMp4Url && useRawVideo ? (
          <video
            src={video.videoUrl!}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <Player
            component={VideoComposition as React.ComponentType<VideoCompositionProps>}
            inputProps={compositionProps}
            durationInFrames={totalFrames}
            fps={30}
            compositionWidth={1080}
            compositionHeight={1920}
            style={{
              width: "100%",
              height: "100%",
            }}
            controls
            autoPlay={false}
            loop
            showVolumeControls
          />
        )}
      </div>

      {/* Video Mode Bar & Download */}
      <div className="flex items-center justify-between w-full max-w-[340px] sm:max-w-[360px] text-xs">
        <div className="flex items-center gap-2">
          {hasMp4Url && (
            <button
              type="button"
              onClick={() => setUseRawVideo(!useRawVideo)}
              className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition font-medium cursor-pointer"
            >
              <Film className="size-3.5" />
              <span>{useRawVideo ? "Show Remotion Player" : "Show Rendered MP4"}</span>
            </button>
          )}
        </div>

        {video.videoUrl && (
          <a
            href={video.videoUrl}
            download={`${video.videoTitle.replace(/[^a-zA-Z0-9]/g, "_")}.mp4`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Download Video</span>
          </a>
        )}
      </div>
    </div>
  );
}
