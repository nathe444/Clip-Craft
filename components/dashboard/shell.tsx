"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CreateSeriesDialog } from "./create-series-dialog";
import { DashboardHeader } from "./header";
import { DashboardSidebar } from "./sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="dashboard flex h-dvh min-h-0 overflow-hidden">
      <a href="#workspace" className="skip-link">
        Skip to workspace
      </a>
      <aside className="hidden w-[240px] shrink-0 border-r border-[var(--dash-line)] bg-[var(--dash-panel)] md:flex md:flex-col">
        <DashboardSidebar onCreate={() => setCreateOpen(true)} />
      </aside>
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/20"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[240px] flex-col border-r border-[var(--dash-line)] bg-[var(--dash-panel)] shadow-xl">
            <DashboardSidebar
              onCreate={() => {
                setMenuOpen(false);
                setCreateOpen(true);
              }}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col bg-[var(--dash-panel)]">
        <DashboardHeader onMenu={() => setMenuOpen(true)} />
        <main id="workspace" className="min-h-0 flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <CreateSeriesDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
