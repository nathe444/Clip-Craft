"use client";

import { STEPS } from "./types";

interface StepperProgressProps {
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
}

export function StepperProgress({ currentStep, onStepClick }: StepperProgressProps) {
  return (
    <div className="w-full space-y-3">
      {/* Pills row */}
      <div
        className="grid grid-cols-6 gap-2 sm:gap-3"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label={`Step ${currentStep} of ${STEPS.length}`}
      >
        {STEPS.map((step) => {
          const isFilled = step.id <= currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = step.id < currentStep && Boolean(onStepClick);

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step.id)}
              title={`Step ${step.id}: ${step.title}`}
              className={`h-2 w-full rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-ink)] ${
                isClickable ? "cursor-pointer" : "cursor-default"
              } ${
                isFilled
                  ? isCurrent
                    ? "bg-[var(--dash-ink)]"
                    : "bg-[var(--dash-ink)]/40"
                  : "bg-[var(--dash-line)]"
              }`}
            />
          );
        })}
      </div>

      {/* Labels row */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3 text-center">
        {STEPS.map((step) => {
          const isCurrent = step.id === currentStep;
          const isFilled = step.id <= currentStep;
          return (
            <div key={step.id} className="truncate">
              <span
                className={`hidden md:block text-[11px] font-medium tracking-tight truncate transition-colors ${
                  isCurrent
                    ? "text-[var(--dash-ink)] font-semibold"
                    : isFilled
                    ? "text-[var(--dash-muted)]"
                    : "text-[var(--dash-line)]"
                }`}
              >
                {step.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
