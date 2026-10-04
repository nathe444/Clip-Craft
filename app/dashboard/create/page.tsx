import type { Metadata } from "next";
import { MultistepCreateSeries } from "@/components/dashboard/create/multistep-create-series";

export const metadata: Metadata = {
  title: "Create New Series — ClipCraft",
  description: "Create a new automated short video series with AI.",
};

export default function CreateSeriesPage() {
  return <MultistepCreateSeries />;
}
