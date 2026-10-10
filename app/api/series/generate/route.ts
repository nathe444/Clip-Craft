import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { inngest } from "@/lib/inngest/client";

/**
 * POST /api/series/generate
 * Triggers the Inngest video generation workflow for a specific series.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seriesId, seriesName } = body;

    if (!seriesId) {
      return NextResponse.json(
        { ok: false, error: "Missing seriesId" },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    try {
      const user = await currentUser();
      userId = user?.id ?? null;
    } catch {
      // Unauthenticated or dev mode
    }

    // Send the "video/generate" event to Inngest
    const { ids } = await inngest.send({
      name: "video/generate",
      data: {
        seriesId,
        seriesName: seriesName || "Untitled Series",
        userId,
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Video generation workflow queued for series "${seriesName || seriesId}"`,
      eventIds: ids,
    });
  } catch (error: unknown) {
    console.error("[SERIES_GENERATE_API_ERROR]", error);
    const message = error instanceof Error ? error.message : "Failed to queue video generation";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
