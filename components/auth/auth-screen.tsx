import Link from "next/link";
import type { ReactNode } from "react";
import { Mark } from "@/components/landing/icons";

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className="landing flex min-h-full flex-1 flex-col items-center px-5 py-16">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Mark className="size-6" />
        ClipCraft
      </Link>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function ClerkSetupNotice() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[#101114] p-6">
      <h1 className="text-2xl font-medium tracking-tight">Add your Clerk keys</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Sign-in and sign-up are wired up. Paste <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
        <code>CLERK_SECRET_KEY</code> into <code>.env.local</code>, then restart the dev server.
      </p>
    </div>
  );
}
