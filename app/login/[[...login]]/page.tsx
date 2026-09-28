import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthScreen, ClerkSetupNotice } from "@/components/auth/auth-screen";
import { hasClerkPublishableKey } from "@/lib/clerk/env";

export const metadata: Metadata = {
  title: "Log in — ClipCraft",
  description: "Log in to your ClipCraft workspace.",
};

export default function LoginPage() {
  return (
    <AuthScreen>
      {hasClerkPublishableKey() ? (
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        />
      ) : (
        <ClerkSetupNotice />
      )}
    </AuthScreen>
  );
}
