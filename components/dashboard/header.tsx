"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { dashboardTitle } from "./nav";

export function DashboardHeader({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--dash-line)] bg-[var(--dash-panel)] px-4 md:h-16 md:px-6">
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium md:hidden"
        aria-label="Open menu"
        onClick={onMenu}
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <p className="text-sm font-medium tracking-tight">{dashboardTitle(pathname)}</p>
      <div className="ml-auto">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-9",
            },
          }}
        />
      </div>
    </header>
  );
}
