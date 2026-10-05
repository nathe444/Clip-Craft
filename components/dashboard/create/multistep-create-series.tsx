"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Calendar, CheckCircle2, LayoutDashboard, PlusCircle } from "lucide-react";
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
  const [isScheduledSuccess, setIsScheduledSuccess] = useState(false);
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

  function handleSchedule() {
    setIsSubmitting(true);
    setTimeout(() => {
      const newSeries: ClipSeries = {
        id: `series-${Date.now()}`,
        name: formData.seriesName.trim() || `${activeNicheName} Daily`,
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
      setIsSubmitting(false);
      setIsScheduledSuccess(true);
    }, 700);
  }

  function handleReset() {
    setFormData({
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
    setIsScheduledSuccess(false);
    setCurrentStep(1);
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

      {/* Success Modal / Confirmation Dialog */}
      {isScheduledSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[var(--dash-line)] text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--dash-ink)]">
                Series Successfully Scheduled!
              </h3>
              <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
                <strong className="text-[var(--dash-ink)] font-semibold">
                  {formData.seriesName || `${activeNicheName} Daily`}
                </strong>{" "}
                is now active. Your automated pipeline will generate high-quality video clips 3-6 hours prior to your daily publish time at{" "}
                <span className="font-semibold text-[var(--dash-ink)]">{formData.publishTime}</span>.
              </p>
            </div>

            {/* Quick summary chips */}
            <div className="rounded-2xl bg-zinc-50 border border-[var(--dash-line)] p-4 text-xs flex flex-wrap items-center justify-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 font-medium text-zinc-700">
                Duration: {formData.duration} sec
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 font-medium text-zinc-700">
                Platforms: {formData.platforms.join(", ")}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 font-medium text-zinc-700">
                Time: {formData.publishTime}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--dash-ink)] hover:bg-zinc-800 text-white px-6 py-3 text-sm font-semibold transition cursor-pointer"
              >
                <LayoutDashboard className="size-4" />
                Go to Dashboard
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--dash-line)] bg-white hover:bg-zinc-50 text-[var(--dash-ink)] px-5 py-3 text-sm font-medium transition cursor-pointer"
              >
                <PlusCircle className="size-4" />
                Create Another Series
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
