import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SubtitleCue } from "@/lib/ai/generate-captions";

interface CaptionsOverlayProps {
  subtitles: SubtitleCue[];
  captionStyle?: string;
  captionColor?: string;
  captionPosition?: "middle" | "bottom";
}

export const CaptionsOverlay: React.FC<CaptionsOverlayProps> = ({
  subtitles = [],
  captionStyle = "hormozi-pop",
  captionColor = "#FACC15",
  captionPosition = "middle",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTime = frame / fps;

  // Find active cue
  const activeCueIndex = subtitles.findIndex(
    (cue) => currentTime >= cue.start && currentTime <= cue.end + 0.05
  );

  if (activeCueIndex === -1) {
    return null;
  }

  const activeCue = subtitles[activeCueIndex];

  // Pop-in spring animation when cue begins
  const cueStartFrame = Math.round(activeCue.start * fps);
  const frameSinceCueStart = Math.max(0, frame - cueStartFrame);

  const popScale = spring({
    frame: frameSinceCueStart,
    fps,
    config: {
      damping: 12,
      stiffness: 220,
      mass: 0.5,
    },
  });

  const clampedScale = interpolate(popScale, [0, 1], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isUppercase =
    captionStyle === "hormozi-pop" ||
    captionStyle === "beast-bounce" ||
    captionStyle === "crime-thriller" ||
    captionStyle === "cyber-neon";

  const isBottom = captionPosition === "bottom";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: isBottom ? 260 : undefined,
        top: isBottom ? undefined : "50%",
        transform: isBottom ? undefined : "translateY(-50%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 40px",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <div
        style={{
          transform: `scale(${clampedScale})`,
          textAlign: "center",
          maxWidth: "90%",
          padding: captionStyle === "cinematic-pill" ? "16px 36px" : "8px 16px",
          borderRadius: 24,
          backgroundColor:
            captionStyle === "cinematic-pill" ? "rgba(0,0,0,0.65)" : "transparent",
          backdropFilter:
            captionStyle === "cinematic-pill" ? "blur(12px)" : undefined,
        }}
      >
        <div
          style={{
            fontSize: 68,
            lineHeight: 1.15,
            fontWeight: 900,
            fontFamily:
              captionStyle === "cyber-neon"
                ? "Courier New, monospace"
                : "system-ui, -apple-system, sans-serif",
            textTransform: isUppercase ? "uppercase" : "none",
            letterSpacing: isUppercase ? "0.02em" : "normal",
            textShadow:
              captionStyle === "cyber-neon"
                ? `0 0 20px ${captionColor}, 0 0 40px ${captionColor}`
                : "0 4px 16px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)",
          }}
        >
          {activeCue.words && activeCue.words.length > 0 ? (
            activeCue.words.map((w, idx) => {
              const isWordActive =
                currentTime >= w.start && currentTime <= w.end + 0.12;

              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    margin: "0 10px",
                    color: isWordActive ? captionColor : "#FFFFFF",
                    transform: isWordActive ? "scale(1.12)" : "scale(1)",
                    transition: "color 0.1s ease, transform 0.1s ease",
                  }}
                >
                  {isUppercase ? w.word.toUpperCase() : w.word}
                </span>
              );
            })
          ) : (
            <span style={{ color: "#FFFFFF" }}>
              {isUppercase ? activeCue.text.toUpperCase() : activeCue.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
