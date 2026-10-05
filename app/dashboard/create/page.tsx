import type { Metadata } from "next";
import { Suspense } from "react";
import { MultistepCreateSeries } from "@/components/dashboard/create/multistep-create-series";

export const metadata: Metadata = {
  title: "Create / Edit Series — ClipCraft",
  description: "Create or edit your automated short video series with AI.",
};

export default function CreateSeriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center text-sm text-zinc-500">
          Loading series editor...
        </div>
      }
    >
      <MultistepCreateSeries />
    </Suspense>
  );
}
