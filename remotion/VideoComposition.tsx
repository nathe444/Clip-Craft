import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoCompositionProps, SceneVisual } from "./types";
import { CaptionsOverlay } from "./CaptionsOverlay";

interface AnimatedSceneProps {
  scene: SceneVisual;
  index: number;
  durationInFrames: number;
}

const AnimatedScene: React.FC<AnimatedSceneProps> = ({
  scene,
  index,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Pick animated motion pattern per scene
  const animType = index % 4;

  // Fade In transition over first 12 frames
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  let scale = 1.0;
  let translateY = 0;
  let translateX = 0;

  if (animType === 0) {
    // Zoom In
    scale = interpolate(frame, [0, durationInFrames], [1.0, 1.15], {
      extrapolateRight: "clamp",
    });
  } else if (animType === 1) {
    // Slide Up + Gentle Zoom
    scale = interpolate(frame, [0, durationInFrames], [1.04, 1.16], {
      extrapolateRight: "clamp",
    });
    translateY = interpolate(frame, [0, 20], [60, 0], {
      extrapolateRight: "clamp",
    });
  } else if (animType === 2) {
    // Zoom Out + Subtle Pan
    scale = interpolate(frame, [0, durationInFrames], [1.18, 1.03], {
      extrapolateRight: "clamp",
    });
    translateX = interpolate(frame, [0, durationInFrames], [-20, 20], {
      extrapolateRight: "clamp",
    });
  } else {
    // Slide Down + Soft Zoom
    scale = interpolate(frame, [0, durationInFrames], [1.02, 1.14], {
      extrapolateRight: "clamp",
    });
    translateY = interpolate(frame, [0, 20], [-60, 0], {
      extrapolateRight: "clamp",
    });
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      <Img
        src={scene.imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px) translateX(${translateX}px)`,
          willChange: "transform, opacity",
        }}
      />
    </AbsoluteFill>
  );
};

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  scenes = [],
  durationInSeconds = 30,
  voiceoverAudioUrl,
  backgroundMusicUrl,
  musicVolume = 18,
  subtitles = [],
  captionStyle = "hormozi-pop",
  captionColor = "#FACC15",
  captionPosition = "middle",
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const totalScenes = Math.max(1, scenes.length);
  const framesPerScene = Math.floor(durationInFrames / totalScenes);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 1. Sequential Animated Scene Images */}
      {scenes.map((scene, i) => {
        const fromFrame = i * framesPerScene;
        const isLast = i === totalScenes - 1;
        // The last scene extends to the end of the composition
        const sceneDuration = isLast
          ? durationInFrames - fromFrame
          : framesPerScene;

        return (
          <Sequence
            key={i}
            from={fromFrame}
            durationInFrames={sceneDuration}
            name={`Scene ${i + 1}`}
          >
            <AnimatedScene
              scene={scene}
              index={i}
              durationInFrames={sceneDuration}
            />
          </Sequence>
        );
      })}

      {/* 2. Top & Bottom Vignettes (enhances vertical short readability) */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* 3. Audio Tracks (Voiceover + Ambient Music) */}
      {voiceoverAudioUrl && (
        <Audio
          src={voiceoverAudioUrl}
          volume={1.0}
        />
      )}

      {backgroundMusicUrl && (
        <Audio
          src={backgroundMusicUrl}
          volume={(musicVolume / 100) * 0.22}
          loop
        />
      )}

      {/* 4. Styled Animated Captions Overlay */}
      <CaptionsOverlay
        subtitles={subtitles}
        captionStyle={captionStyle}
        captionColor={captionColor}
        captionPosition={captionPosition}
      />
    </AbsoluteFill>
  );
};
