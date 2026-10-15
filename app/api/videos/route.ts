import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, hasSupabaseSecretKey } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { currentUser } from "@clerk/nextjs/server";
import {
  getVideoById,
  getVideoState,
  listVideoCatalog,
  updateVideoProgress,
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
    const videoId = searchParams.get("videoId");

    const supabase = hasSupabaseEnv() ? await getSupabase() : null;

    if (videoId) {
      const video = await getVideoById(videoId, supabase);
      if (!video) {
        return NextResponse.json({ ok: false, error: "Video not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, video });
    }

    if (seriesId) {
      const state = await getVideoState(seriesId, supabase);
      return NextResponse.json({ ok: true, state });
    }

    let seriesRows: Array<{
      id: string;
      series_name: string;
      selected_niche_id?: string | null;
      user_id?: string | null;
    }> = [];

    if (supabase) {
      let query = supabase
        .from("series")
        .select("id, series_name, selected_niche_id, user_id")
        .order("created_at", { ascending: false });
      try {
        const user = await currentUser();
        if (user?.id) query = query.eq("user_id", user.id);
      } catch {
        // Dev requests without a Clerk session still list the saved series.
      }
      const { data } = await query;
      seriesRows = data ?? [];
    }

    const ownedIds = new Set(seriesRows.map((series) => series.id));
    const catalog = (await listVideoCatalog(supabase)).filter(
      (item) => ownedIds.size === 0 || ownedIds.has(item.seriesId),
    );
    const generating = Array.from(videoProgressStore.values()).filter(
      (job) => job.status === "generating" && (ownedIds.size === 0 || ownedIds.has(job.seriesId)),
    );

    const groups = seriesRows.map((series) => ({
      seriesId: series.id,
      seriesName: series.series_name,
      niche: series.selected_niche_id,
      videos: catalog.filter((item) => item.seriesId === series.id),
      progress: generating.find((job) => job.seriesId === series.id) ?? null,
    }));

    const groupedIds = new Set(groups.map((group) => group.seriesId));
    for (const item of catalog) {
      if (groupedIds.has(item.seriesId)) continue;
      groupedIds.add(item.seriesId);
      groups.push({
        seriesId: item.seriesId,
        seriesName: item.seriesName,
        niche: null,
        videos: catalog.filter((video) => video.seriesId === item.seriesId),
        progress: generating.find((job) => job.seriesId === item.seriesId) ?? null,
      });
    }

    return NextResponse.json({ ok: true, groups });
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
