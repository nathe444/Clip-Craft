import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Get started — ClipCraft",
  description: "Create a ClipCraft workspace and start scheduling short videos.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}