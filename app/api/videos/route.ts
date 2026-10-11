import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, hasSupabaseSecretKey } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  getVideoState,
  updateVideoProgress,
  completedVideosStore,
  videoProgressStore,
} from "@/lib/video/video-store";

async function getSupabase() {
  if (hasSupabaseSecretKey()) {
    return createAdminClient();
  }
  return await createClient();
}

/**
 * GET /api/videos?seriesId=xxx
 * Retrieves video generation state and completed video records.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get("seriesId");

    const supabase = hasSupabaseEnv() ? await getSupabase() : null;

    if (seriesId) {
      const state = await getVideoState(seriesId, supabase);
      return NextResponse.json({ ok: true, state });
    }

    // If no seriesId provided, return list of all available videos
    const completedList = Array.from(completedVideosStore.values());
    const progressList = Array.from(videoProgressStore.values());

    return NextResponse.json({
      ok: true,
      videos: completedList,
      activeJobs: progressList.filter((p) => p.status === "generating"),
    });
  } catch (err: unknown) {
    console.error("[VIDEOS_API_GET_ERROR]", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/videos
 * Manually initialize or mark video progress state (used by UI or test drivers).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seriesId, seriesName, status = "generating", currentStep = 1, progressPercent = 10 } = body;

    if (!seriesId) {
      return NextResponse.json({ ok: false, error: "Missing seriesId" }, { status: 400 });
    }

    const supabase = hasSupabaseEnv() ? await getSupabase() : null;
    const state = await updateVideoProgress({
      seriesId,
      seriesName,
      status,
      currentStep,
      progressPercent,
      supabase,
    });

    return NextResponse.json({ ok: true, state });
  } catch (err: unknown) {
    console.error("[VIDEOS_API_POST_ERROR]", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
