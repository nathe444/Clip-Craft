import type { SubtitleCue } from "@/lib/ai/generate-captions";

export interface SceneVisual {
  sceneNumber: number;
  imageUrl: string;
  prompt: string;
  spokenText?: string;
}

export interface VideoCompositionProps extends Record<string, unknown> {
  title: string;
  durationInSeconds: number;
  voiceoverAudioUrl: string;
  backgroundMusicUrl?: string | null;
  musicVolume?: number; // 0 to 100
  scenes: SceneVisual[];
  subtitles: SubtitleCue[];
  captionStyle?: string;
  captionColor?: string;
  captionPosition?: "middle" | "bottom";
  captionDensity?: "1-2-words" | "3-5-words";
}

export const COMPOSITION_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  defaultDurationInSeconds: 30,
};
