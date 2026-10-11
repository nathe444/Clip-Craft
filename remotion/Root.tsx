import React from "react";
import { Composition } from "remotion";
import { VideoComposition } from "./VideoComposition";
import { COMPOSITION_CONFIG, type VideoCompositionProps } from "./types";

const defaultProps: VideoCompositionProps = {
  title: "Ancient Mysteries",
  durationInSeconds: 30,
  voiceoverAudioUrl: "https://placeholder.audio/sample.mp3",
  backgroundMusicUrl: null,
  musicVolume: 18,
  scenes: [
    {
      sceneNumber: 1,
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&q=80",
      prompt: "A cinematic vertical view of ancient Roman ruins",
      spokenText: "Did you know that in ancient Rome...",
    },
  ],
  subtitles: [
    {
      id: 1,
      start: 0.2,
      end: 1.5,
      text: "DID YOU KNOW",
      words: [
        { word: "DID", start: 0.2, end: 0.6 },
        { word: "YOU", start: 0.6, end: 0.9 },
        { word: "KNOW", start: 0.9, end: 1.5 },
      ],
    },
  ],
  captionStyle: "hormozi-pop",
  captionColor: "#FACC15",
  captionPosition: "middle",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoShort"
        component={VideoComposition as React.ComponentType<VideoCompositionProps>}
        durationInFrames={COMPOSITION_CONFIG.defaultDurationInSeconds * COMPOSITION_CONFIG.fps}
        fps={COMPOSITION_CONFIG.fps}
        width={COMPOSITION_CONFIG.width}
        height={COMPOSITION_CONFIG.height}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => {
          const durationSec = Math.max(
            3,
            props.durationInSeconds || COMPOSITION_CONFIG.defaultDurationInSeconds
          );
          return {
            durationInFrames: Math.round(durationSec * COMPOSITION_CONFIG.fps),
            props,
          };
        }}
      />
    </>
  );
};
