"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { btnPrimary } from "@/components/landing/content";
import { Mark } from "@/components/landing/icons";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const workspace = String(data.get("workspace") || "").trim();
    const next: Record<string, string> = {};

    if (!email.includes("@") || !email.includes(".")) next.email = "Enter a valid email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (isRegister && workspace.length < 2) next.workspace = "Name your workspace.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("");
      return;
    }

    setStatus(
      isRegister
        ? `Workspace “${workspace}” is ready for ${email}. Sign-in opens from this same address.`
        : "No workspace is connected to that email yet.",
    );
  }

  return (
    <div className="landing flex min-h-full flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Mark className="size-6" />
          ClipCraft
        </Link>
        <h1 className="mt-8 text-3xl font-medium tracking-[-0.04em]">
          {isRegister ? "Start creating free" : "Log in"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {isRegister
            ? "Create a workspace for YouTube, Instagram, TikTok, and email."
            : "Open the workspace where your shorts and calendar live."}
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          {isRegister ? (
            <Field
              id="workspace"
              label="Workspace name"
              name="workspace"
              autoComplete="organization"
              error={errors.workspace}
            />
          ) : null}
          <Field
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            error={errors.email}
          />
          <Field
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            error={errors.password}
          />
          <button type="submit" className={`${btnPrimary} h-11 w-full`}>
            {isRegister ? "Create workspace" : "Log in"}
          </button>
          {status ? (
            <p role="status" className="text-sm leading-6 text-[var(--muted)]">
              {status}{" "}
              {isRegister ? null : (
                <Link href="/register" className="text-white underline underline-offset-4">
                  Get started
                </Link>
              )}
            </p>
          ) : null}
        </form>
        <p className="mt-6 text-sm text-[var(--muted)]">
          {isRegister ? "Already have a workspace?" : "New to ClipCraft?"}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="text-white underline underline-offset-4"
          >
            {isRegister ? "Log in" : "Get started"}
          </Link>
        </p>
        {isRegister ? <p className="mt-3 text-sm text-[var(--muted)]">No credit card required</p> : null}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5 h-11 w-full rounded-lg border border-[var(--line)] bg-white/5 px-3 text-sm outline-none transition focus:border-white/40"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
