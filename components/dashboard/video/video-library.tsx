"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Loader2, Plus } from "lucide-react";
import type { VideoCatalogItem, VideoProgressState } from "@/lib/video/video-store";

export interface VideoSeriesGroup {
  seriesId: string;
  seriesName: string;
  niche?: string | null;
  videos: VideoCatalogItem[];
  progress: VideoProgressState | null;
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VideoLibrary({ groups }: { groups: VideoSeriesGroup[] }) {
  const router = useRouter();
  const total = groups.reduce((sum, group) => sum + group.videos.length, 0);

  if (groups.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-2xl font-medium tracking-[-0.03em]">No series yet</h1>
        <p className="mt-2 text-sm text-[var(--dash-muted)]">
          Create a series first. Finished videos will show up here, grouped under that series.
        </p>
        <Link
          href="/dashboard/create"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-[var(--dash-ink)] px-4 text-sm font-medium text-white"
        >
          Create a series
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-[-0.03em]">Videos</h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            {total === 0 ? "Nothing generated yet." : `${total} video${total === 1 ? "" : "s"} across ${groups.length} series.`}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {groups.map((group) => (
          <section key={group.seriesId}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-medium tracking-tight">{group.seriesName}</h2>
              <p className="text-xs text-[var(--dash-muted)]">
                {group.videos.length} {group.videos.length === 1 ? "video" : "videos"}
              </p>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {group.progress ? (
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/video?seriesId=${encodeURIComponent(group.seriesId)}`)}
                  className="w-[132px] shrink-0 text-left"
                >
                  <div className="flex aspect-[9/16] items-center justify-center rounded-2xl border border-[var(--dash-line)] bg-[var(--dash-bg)]">
                    <div className="text-center">
                      <Loader2 className="mx-auto size-5 animate-spin" />
                      <p className="mt-2 text-xs font-medium">{group.progress.progressPercent}%</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium">Generating</p>
                </button>
              ) : null}

              {group.videos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/video?seriesId=${encodeURIComponent(video.seriesId)}&videoId=${encodeURIComponent(video.id)}`,
                    )
                  }
                  className="w-[132px] shrink-0 text-left"
                >
                  <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-[var(--dash-line)] bg-zinc-900">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-white/70">
                        <Film className="size-5" />
                      </div>
                    )}
                    {video.durationSeconds > 0 ? (
                      <span className="absolute right-2 bottom-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {video.durationSeconds}s
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-5">{video.videoTitle}</p>
                  <p className="mt-0.5 text-xs text-[var(--dash-muted)]">{formatWhen(video.createdAt)}</p>
                </button>
              ))}

              {group.videos.length === 0 && !group.progress ? (
                <Link
                  href={`/dashboard/video?seriesId=${encodeURIComponent(group.seriesId)}`}
                  className="flex aspect-[9/16] w-[132px] shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--dash-line)] text-center"
                >
                  <Plus className="size-4" />
                  <span className="mt-2 px-3 text-xs text-[var(--dash-muted)]">Generate a video</span>
                </Link>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
