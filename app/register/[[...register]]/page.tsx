import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthScreen, ClerkSetupNotice } from "@/components/auth/auth-screen";
import { hasClerkPublishableKey } from "@/lib/clerk/env";

export const metadata: Metadata = {
  title: "Get started — ClipCraft",
  description: "Create a ClipCraft account and start scheduling short videos.",
};

export default function RegisterPage() {
  return (
    <AuthScreen>
      {hasClerkPublishableKey() ? (
        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          signInForceRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
        />
      ) : (
        <ClerkSetupNotice />
      )}
    </AuthScreen>
  );
}
