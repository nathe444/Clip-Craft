import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient, hasSupabaseSecretKey } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

async function getSupabase() {
  if (hasSupabaseSecretKey()) {
    return createAdminClient();
  }
  return await createClient();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.seriesName && !body.name) {
      return NextResponse.json(
        { ok: false, error: "Series name is required" },
        { status: 400 }
      );
    }

    if (!hasSupabaseEnv()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing Supabase credentials. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
        },
        { status: 503 }
      );
    }

    // Attempt to get current authenticated user via Clerk
    let userId: string | null = null;
    try {
      const user = await currentUser();
      userId = user?.id ?? null;
    } catch {
      userId = body.userId ?? null;
    }

    const payload = {
      user_id: userId,
      series_name: (body.seriesName || body.name || "Untitled Series").trim(),
      niche_type: body.nicheType || "available",
      selected_niche_id: body.selectedNicheId || null,
      custom_niche_title: body.customNicheTitle || null,
      custom_niche_description: body.customNicheDescription || null,
      language: body.language || "en-us",
      voice_model: body.voiceModel || "aura-2-zeus-en",
      background_music_id: body.backgroundMusicId || "horror-suspense",
      music_volume: typeof body.musicVolume === "number" ? body.musicVolume : 18,
      visual_style: body.visualStyle || "cinematic",
      caption_style: body.captionStyle || "hormozi-pop",
      caption_density: body.captionDensity || "1-2-words",
      caption_position: body.captionPosition || "middle",
      caption_color: body.captionColor || "#FACC15",
      duration: body.duration || "30-50",
      platforms: Array.isArray(body.platforms) ? body.platforms : [],
      publish_time: body.publishTime || "12:00 AM",
      status: "active",
    };

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("series")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[SUPABASE_SERIES_INSERT_ERROR]", error);
      return NextResponse.json(
        { ok: false, error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Series scheduled and saved successfully", series: data },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[SERIES_API_POST_ERROR]", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ ok: true, series: [] });
    }

    const supabase = await getSupabase();
    let query = supabase
      .from("series")
      .select("*")
      .order("created_at", { ascending: false });

    try {
      const user = await currentUser();
      if (user?.id) {
        query = query.eq("user_id", user.id);
      }
    } catch {
      // Unauthenticated or dev mode
    }

    const { data, error } = await query;

    if (error) {
      console.error("[SUPABASE_SERIES_FETCH_ERROR]", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, series: data ?? [] });
  } catch (err: unknown) {
    console.error("[SERIES_API_GET_ERROR]", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Series ID is required" }, { status: 400 });
    }

    if (!hasSupabaseEnv()) {
      return NextResponse.json({ ok: true });
    }

    const supabase = await getSupabase();
    const { error } = await supabase.from("series").delete().eq("id", id);

    if (error) {
      console.error("[SUPABASE_SERIES_DELETE_ERROR]", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Series deleted successfully" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Series ID is required" }, { status: 400 });
    }

    if (!hasSupabaseEnv()) {
      return NextResponse.json({ ok: true, series: updates });
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("series")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[SUPABASE_SERIES_UPDATE_ERROR]", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, series: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
