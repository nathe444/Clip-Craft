"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { btnGhost, btnPrimary } from "./content";

const redirectUrl = "/dashboard";

export function HeroActions() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <>
        <Link href="/register" className={`${btnPrimary} h-11 px-5`}>
          Start Creating Free
        </Link>
        <Link href="/login" className={`${btnGhost} h-11 px-5`}>
          See How It Works
        </Link>
      </>
    );
  }

  return <ClerkHeroActions />;
}

function ClerkHeroActions() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return (
      <>
        <Link href={redirectUrl} className={`${btnPrimary} h-11 px-5`}>
          Start Creating Free
        </Link>
        <Link href={redirectUrl} className={`${btnGhost} h-11 px-5`}>
          See How It Works
        </Link>
      </>
    );
  }

  return (
    <>
      <SignInButton
        mode="modal"
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
        signUpForceRedirectUrl={redirectUrl}
        signUpFallbackRedirectUrl={redirectUrl}
      >
        <button type="button" className={`${btnPrimary} h-11 px-5`}>
          Start Creating Free
        </button>
      </SignInButton>
      <SignInButton
        mode="modal"
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
        signUpForceRedirectUrl={redirectUrl}
        signUpFallbackRedirectUrl={redirectUrl}
      >
        <button type="button" className={`${btnGhost} h-11 px-5`}>
          See How It Works
        </button>
      </SignInButton>
    </>
  );
}
