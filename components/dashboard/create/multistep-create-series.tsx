"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { StepperProgress } from "./stepper-progress";
import { NicheSelectionStep } from "./niche-selection-step";
import { LanguageVoiceStep } from "./language-voice-step";
import { BackgroundMusicStep } from "./background-music-step";
import { AVAILABLE_NICHES, STEPS, type CreateSeriesFormData } from "./types";

export function MultistepCreateSeries() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateSeriesFormData>({
    nicheType: "available",
    selectedNicheId: "scary-stories",
    customNicheTitle: "",
    customNicheDescription: "",
    language: "en-us",
    voiceModel: "aura-2-zeus-en",
    backgroundMusicId: "horror-suspense",
    musicVolume: 18,
    scriptTopic: "",
    pacing: "Fast-Paced",
    visualStyle: "cinematic",
    captionStyle: "karaoke-glow",
  });

  const activeNicheName =
    formData.nicheType === "available"
      ? AVAILABLE_NICHES.find((n) => n.id === formData.selectedNicheId)?.title ?? "—"
      : formData.customNicheTitle || "Custom";

  function handleNext() {
    if (currentStep < STEPS.length) setCurrentStep((p) => p + 1);
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep((p) => p - 1);
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

        {/* Steps 4–6: placeholder */}
        {currentStep >= 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--dash-ink)]">
                {STEPS[currentStep - 1]?.title}
              </h2>
              <p className="mt-1.5 text-sm text-[var(--dash-muted)]">
                {STEPS[currentStep - 1]?.description}
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-[var(--dash-line)] p-10 text-center">
              <p className="text-sm text-[var(--dash-muted)]">
                Niche: <strong className="text-[var(--dash-ink)]">{activeNicheName}</strong>
                {" · "}
                Language: <strong className="text-[var(--dash-ink)]">{formData.language}</strong>
                {" · "}
                Music: <strong className="text-[var(--dash-ink)]">{formData.backgroundMusicId}</strong>
              </p>
              <p className="mt-2 text-xs text-[var(--dash-muted)]">
                This step will be implemented next.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--dash-line)]">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--dash-line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg)] transition cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--dash-ink)] hover:bg-zinc-800 text-white px-7 py-3 text-sm font-semibold transition cursor-pointer"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--dash-ink)] hover:bg-zinc-800 text-white px-7 py-3 text-sm font-semibold transition"
                >
                  <Check className="size-4" />
                  Finish setup
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
