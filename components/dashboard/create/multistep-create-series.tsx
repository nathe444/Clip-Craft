"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { StepperProgress } from "./stepper-progress";
import { NicheSelectionStep } from "./niche-selection-step";
import { LanguageVoiceStep } from "./language-voice-step";
import { BackgroundMusicStep } from "./background-music-step";
import { VideoStyleStep } from "./video-style-step";
import { CaptionStyleStep } from "./caption-style-step";
import { SeriesDetailsStep } from "./series-details-step";
import { AVAILABLE_NICHES, STEPS, type CreateSeriesFormData } from "./types";
import { DEEPGRAM_LANGUAGES } from "./deepgram-voices";
import { BACKGROUND_MUSIC_TRACKS } from "./music-library";
import { VIDEO_STYLES } from "./video-styles";
import { CAPTION_STYLES } from "./caption-styles";
import { type ClipSeries, readSeries, saveSeries } from "@/components/dashboard/series-store";

export function MultistepCreateSeries() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateSeriesFormData>({
    nicheType: "available",
    selectedNicheId: "scary-stories",
    customNicheTitle: "",
    customNicheDescription: "",
    language: "en-us",
    voiceModel: "aura-2-zeus-en",
    backgroundMusicId: "horror-suspense",
    musicVolume: 18,
    visualStyle: "cinematic",
    captionStyle: "hormozi-pop",
    captionDensity: "1-2-words",
    captionPosition: "middle",
    captionColor: "#FACC15",
    seriesName: "",
    duration: "30-50",
    platforms: ["tiktok", "instagram", "youtube"],
    publishTime: "12:00 AM",
  });

  const activeNicheName =
    formData.nicheType === "available"
      ? AVAILABLE_NICHES.find((n) => n.id === formData.selectedNicheId)?.title ?? "—"
      : formData.customNicheTitle || "Custom";

  const activeVoiceTitle =
    DEEPGRAM_LANGUAGES.flatMap((l) => l.voices).find((v) => v.model === formData.voiceModel)?.name ??
    "AI Voice";

  const activeMusicTitle =
    BACKGROUND_MUSIC_TRACKS.find((m) => m.id === formData.backgroundMusicId)?.title ?? "Soundtrack";

  const activeVideoStyleTitle =
    VIDEO_STYLES.find((v) => v.id === formData.visualStyle)?.title ?? "Cinematic";

  const activeCaptionStyleTitle =
    CAPTION_STYLES.find((c) => c.id === formData.captionStyle)?.name ?? "Dynamic";

  function handleNext() {
    if (currentStep < STEPS.length) setCurrentStep((p) => p + 1);
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep((p) => p - 1);
  }

  function handleTogglePlatform(platformId: string) {
    setFormData((prev) => {
      const exists = prev.platforms.includes(platformId);
      const updated = exists
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId];
      return { ...prev, platforms: updated };
    });
  }

  async function handleSchedule() {
    setIsSubmitting(true);
    try {
      const finalSeriesName = formData.seriesName.trim() || `${activeNicheName} Daily`;
      
      // 1. Post to Supabase database API endpoint
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          seriesName: finalSeriesName,
        }),
      });

      const json = await res.json().catch(() => null);

      // 2. Synchronize local store for instant optimistic render
      const newSeries: ClipSeries = {
        id: json?.series?.id || `series-${Date.now()}`,
        name: finalSeriesName,
        createdAt: Date.now(),
        duration: formData.duration,
        platforms: formData.platforms,
        publishTime: formData.publishTime,
        niche: activeNicheName,
        voice: activeVoiceTitle,
        music: activeMusicTitle,
        visualStyle: activeVideoStyleTitle,
        captionStyle: activeCaptionStyleTitle,
      };

      const existing = readSeries();
      saveSeries([newSeries, ...existing]);

      // 3. Redirect user directly to dashboard page
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("[SCHEDULE_ERROR]", err);
      // Fallback: save to local store and redirect
      const newSeries: ClipSeries = {
        id: `series-${Date.now()}`,
        name: formData.seriesName.trim() || `${activeNicheName} Daily`,
        createdAt: Date.now(),
        duration: formData.duration,
        platforms: formData.platforms,
        publishTime: formData.publishTime,
        niche: activeNicheName,
      };
      saveSeries([newSeries, ...readSeries()]);
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-10 py-6 sm:py-8">
      {/* Top nav */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--dash-muted)] hover:text-[var(--dash-ink)] transition"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <span className="text-xs text-[var(--dash-muted)]">
          Step {currentStep} of {STEPS.length}
        </span>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-[var(--dash-line)] bg-white p-6 sm:p-10">
        {/* Stepper */}
        <div className="mb-10 max-w-3xl">
          <StepperProgress
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />
        </div>

        {/* Step 1 */}
        {currentStep === 1 && (
          <NicheSelectionStep
            nicheType={formData.nicheType}
            selectedNicheId={formData.selectedNicheId}
            customNicheTitle={formData.customNicheTitle}
            customNicheDescription={formData.customNicheDescription}
            onChangeNicheType={(type) => setFormData((p) => ({ ...p, nicheType: type }))}
            onSelectNiche={(id) => setFormData((p) => ({ ...p, selectedNicheId: id }))}
            onChangeCustomTitle={(title) => setFormData((p) => ({ ...p, customNicheTitle: title }))}
            onChangeCustomDescription={(desc) => setFormData((p) => ({ ...p, customNicheDescription: desc }))}
            onContinue={handleNext}
          />
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <LanguageVoiceStep
            language={formData.language}
            voiceModel={formData.voiceModel}
            onChangeLanguage={(lang) => setFormData((p) => ({ ...p, language: lang }))}
            onChangeVoiceModel={(model) => setFormData((p) => ({ ...p, voiceModel: model }))}
            onBack={handleBack}
            onContinue={handleNext}
          />
        )}

        {/* Step 3: Background Music */}
        {currentStep === 3 && (
          <BackgroundMusicStep
            selectedNicheId={formData.selectedNicheId}
            backgroundMusicId={formData.backgroundMusicId}
            musicVolume={formData.musicVolume}
            onChangeBackgroundMusic={(id) =>
              setFormData((p) => ({ ...p, backgroundMusicId: id }))
            }
            onChangeMusicVolume={(vol) =>
              setFormData((p) => ({ ...p, musicVolume: vol }))
            }
            onBack={handleBack}
            onContinue={handleNext}
          />
        )}

        {/* Step 4: Video Visual Style */}
        {currentStep === 4 && (
          <VideoStyleStep
            selectedNicheId={formData.selectedNicheId}
            visualStyle={formData.visualStyle}
            onChangeVisualStyle={(styleId) =>
              setFormData((p) => ({ ...p, visualStyle: styleId }))
            }
            onBack={handleBack}
            onContinue={handleNext}
          />
        )}

        {/* Step 5: Dynamic Caption Style */}
        {currentStep === 5 && (
          <CaptionStyleStep
            selectedNicheId={formData.selectedNicheId}
            captionStyle={formData.captionStyle}
            captionDensity={formData.captionDensity}
            captionPosition={formData.captionPosition}
            captionColor={formData.captionColor}
            onChangeCaptionStyle={(styleId) =>
              setFormData((p) => ({ ...p, captionStyle: styleId }))
            }
            onChangeCaptionDensity={(density) =>
              setFormData((p) => ({ ...p, captionDensity: density }))
            }
            onChangeCaptionPosition={(pos) =>
              setFormData((p) => ({ ...p, captionPosition: pos }))
            }
            onChangeCaptionColor={(color) =>
              setFormData((p) => ({ ...p, captionColor: color }))
            }
            onBack={handleBack}
            onContinue={handleNext}
          />
        )}

        {/* Step 6: Series Details & Scheduling */}
        {currentStep === 6 && (
          <SeriesDetailsStep
            seriesName={formData.seriesName}
            duration={formData.duration}
            platforms={formData.platforms}
            publishTime={formData.publishTime}
            selectedNicheTitle={activeNicheName}
            selectedVoiceTitle={activeVoiceTitle}
            selectedMusicTitle={activeMusicTitle}
            selectedVisualStyleTitle={activeVideoStyleTitle}
            selectedCaptionStyleTitle={activeCaptionStyleTitle}
            onChangeSeriesName={(name) => setFormData((p) => ({ ...p, seriesName: name }))}
            onChangeDuration={(dur) => setFormData((p) => ({ ...p, duration: dur }))}
            onTogglePlatform={handleTogglePlatform}
            onChangePublishTime={(time) => setFormData((p) => ({ ...p, publishTime: time }))}
            onBack={handleBack}
            onSchedule={handleSchedule}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
