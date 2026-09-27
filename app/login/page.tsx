import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Log in — ClipCraft",
  description: "Log in to your ClipCraft workspace.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
