import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mark } from "@/components/landing/icons";
import { clerkDisplayName, clerkEmail, syncClerkUser } from "@/lib/users";

export const metadata: Metadata = {
  title: "Dashboard — ClipCraft",
  description: "Your ClipCraft workspace.",
};

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const email = clerkEmail(user);
  const name = email ? clerkDisplayName(user, email) : user.username || "there";
  const saved = await syncClerkUser(user);

  return (
    <div className="landing min-h-full">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Mark className="size-6" />
            ClipCraft
          </Link>
          <div className="ml-auto">
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-sm text-[var(--muted)]">Workspace</p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em] text-balance">
          {name}
        </h1>
        {email ? <p className="mt-3 text-base text-[var(--muted)]">{email}</p> : null}
        {saved.ok ? (
          <p className="mt-8 text-sm text-[var(--muted)]">Name and email are saved to your account.</p>
        ) : (
          <p className="mt-8 max-w-xl rounded-xl border border-[var(--line)] bg-[#101114] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
            {saved.error}
          </p>
        )}
      </main>
    </div>
  );
}
