import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { syncClerkUser } from "@/lib/users";

export const metadata: Metadata = {
  title: "Dashboard — ClipCraft",
  description: "Your ClipCraft workspace.",
};

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await currentUser();
  if (!user) redirect("/login");

  await syncClerkUser(user);

  return <DashboardShell>{children}</DashboardShell>;
}
