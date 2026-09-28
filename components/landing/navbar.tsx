"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { btnGhost, btnPrimary, navLinks } from "./content";
import { Mark } from "./icons";

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#07080b]/80 backdrop-blur-md">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <a href="#top" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Mark className="size-6" />
          ClipCraft
        </a>
        <ul className="ml-6 hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm text-[var(--muted)] transition hover:text-white">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <AccountActions />
          <button
            type="button"
            className="inline-flex h-10 items-center px-2 text-sm font-medium lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>
      {open ? (
        <div id="mobile-nav" className="border-t border-[var(--line)] bg-[#07080b] px-5 py-3 lg:hidden">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-lg px-2 py-3 text-sm"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <AccountActions menu onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </header>
  );
}

function AccountActions({
  menu = false,
  onNavigate,
}: {
  menu?: boolean;
  onNavigate?: () => void;
}) {
  const clerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (!clerkReady) {
    return <GuestActions menu={menu} onNavigate={onNavigate} />;
  }
  return <ClerkAccountActions menu={menu} onNavigate={onNavigate} />;
}

function ClerkAccountActions({
  menu = false,
  onNavigate,
}: {
  menu?: boolean;
  onNavigate?: () => void;
}) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <UserButton />;
  }

  return <GuestActions menu={menu} onNavigate={onNavigate} />;
}

function GuestActions({
  menu = false,
  onNavigate,
}: {
  menu?: boolean;
  onNavigate?: () => void;
}) {
  if (menu) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Link href="/login" className={btnGhost} onClick={onNavigate}>
          Log in
        </Link>
        <Link href="/register" className={btnPrimary} onClick={onNavigate}>
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/login" className="px-2 text-sm font-medium text-[var(--text)] hover:text-white">
        Log in
      </Link>
      <Link href="/register" className={btnPrimary}>
        Get Started
      </Link>
    </>
  );
}
