"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const editId = searchParams.get("id") || searchParams.get("edit");
  const isEditing = Boolean(editId);

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

  // Load existing series data when in edit mode
  useEffect(() => {
    if (!editId) return;

    let isMounted = true;

    async function loadSeriesData() {
      // 1. Check local store first
      const local = readSeries();
      const foundLocal = local.find((s) => s.id === editId);

      if (foundLocal && isMounted) {
        setFormData((prev) => ({
          ...prev,
          seriesName: foundLocal.name,
          duration: foundLocal.duration || "30-50",
          platforms: foundLocal.platforms || ["tiktok", "instagram", "youtube"],
          publishTime: foundLocal.publishTime || "12:00 AM",
        }));
      }

      // 2. Fetch full data from Supabase API
      try {
        const res = await fetch(`/api/series?id=${encodeURIComponent(editId!)}`);
        const json = await res.json().catch(() => null);

        if (json?.ok && json.series && isMounted) {
          const s = json.series;
          setFormData({
            nicheType: s.niche_type || "available",
            selectedNicheId: s.selected_niche_id || "scary-stories",
            customNicheTitle: s.custom_niche_title || "",
            customNicheDescription: s.custom_niche_description || "",
            language: s.language || "en-us",
            voiceModel: s.voice_model || "aura-2-zeus-en",
            backgroundMusicId: s.background_music_id || "horror-suspense",
            musicVolume: typeof s.music_volume === "number" ? s.music_volume : 18,
            visualStyle: s.visual_style || "cinematic",
            captionStyle: s.caption_style || "hormozi-pop",
            captionDensity: s.caption_density || "1-2-words",
            captionPosition: s.caption_position || "middle",
            captionColor: s.caption_color || "#FACC15",
            seriesName: s.series_name || "",
            duration: s.duration || "30-50",
            platforms: Array.isArray(s.platforms) ? s.platforms : ["tiktok", "instagram", "youtube"],
            publishTime: s.publish_time || "12:00 AM",
          });
        }
      } catch (err) {
        console.error("Could not load series for editing:", err);
      }
    }

    loadSeriesData();

    return () => {
      isMounted = false;
    };
  }, [editId]);

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

      if (isEditing) {
        // 1. PATCH updates to Supabase database
        await fetch("/api/series", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editId,
            ...formData,
            seriesName: finalSeriesName,
          }),
        });

        // 2. Synchronize local store
        const existing = readSeries();
        const updated = existing.map((item) =>
          item.id === editId
            ? {
                ...item,
                name: finalSeriesName,
                duration: formData.duration,
                platforms: formData.platforms,
                publishTime: formData.publishTime,
                niche: activeNicheName,
                voice: activeVoiceTitle,
                music: activeMusicTitle,
                visualStyle: activeVideoStyleTitle,
                captionStyle: activeCaptionStyleTitle,
              }
            : item
        );
        saveSeries(updated);
      } else {
        // 1. POST new series to Supabase database
        const res = await fetch("/api/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            seriesName: finalSeriesName,
          }),
        });

        const json = await res.json().catch(() => null);

        // 2. Synchronize local store
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
      }

      // 3. Redirect back to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("[SCHEDULE_ERROR]", err);
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
        <div className="flex items-center gap-2.5">
          {isEditing && (
            <span className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-0.5 text-xs font-semibold text-zinc-800">
              Editing Series
            </span>
          )}
          <span className="text-xs text-[var(--dash-muted)]">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>
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
            isEditing={isEditing}
          />
        )}
      </div>
    </div>
  );
}
