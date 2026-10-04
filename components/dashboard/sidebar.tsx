"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/landing/icons";
import { NavIcon } from "./icons";
import { dashboardNav, isDashboardNavActive } from "./nav";

export function DashboardSidebar({
  onNavigate,
  onCreate,
}: {
  onNavigate?: () => void;
  onCreate: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5 pb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em]"
          onClick={onNavigate}
        >
          <Mark className="size-7" />
          ClipCraft
        </Link>
        <Link
          href="/dashboard/create"
          className="dash-create mt-5 w-full inline-flex items-center justify-center gap-1.5"
          onClick={onNavigate}
        >
          <span aria-hidden="true">+</span>
          Create New Series
        </Link>
      </div>
      <nav aria-label="Workspace" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {dashboardNav.map((item) => {
            const active = isDashboardNavActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition ${
                    active
                      ? "bg-black/[0.04] font-medium text-[var(--dash-ink)]"
                      : "text-[var(--dash-muted)] hover:bg-black/[0.03] hover:text-[var(--dash-ink)]"
                  }`}
                >
                  <NavIcon name={item.icon} className="size-[18px]" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto border-t border-[var(--dash-line)] px-4 py-4">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-9",
            },
          }}
        />
      </div>
    </div>
  );
}
