export const dashboardNav = [
  { href: "/dashboard", label: "Series", icon: "series" },
  { href: "/dashboard/video", label: "Video", icon: "video" },
  { href: "/dashboard/guides", label: "Guides", icon: "guides" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
  { href: "/dashboard/billing", label: "Billing", icon: "billing" },
] as const;

export type DashboardNavIcon = (typeof dashboardNav)[number]["icon"];

export function dashboardTitle(pathname: string) {
  if (pathname === "/dashboard/create" || pathname.startsWith("/dashboard/create")) {
    return "Create Series";
  }
  const match = dashboardNav.find((item) =>
    item.href === "/dashboard" ? pathname === "/dashboard" : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.label ?? "Series";
}

export function isDashboardNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
