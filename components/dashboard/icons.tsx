import type { DashboardNavIcon } from "./nav";

export function NavIcon({ name, className }: { name: DashboardNavIcon; className?: string }) {
  if (name === "series") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="4" y="6" width="14" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 6V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (name === "video") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="3.2" y="5.2" width="17.6" height="13.6" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10.4 9.2v5.6l5-2.8-5-2.8z" fill="currentColor" />
      </svg>
    );
  }

  if (name === "guides") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M7 4.5h8.2A2.8 2.8 0 0 1 18 7.3v12.2H8.6A2.6 2.6 0 0 0 6 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M6 4.5A2.5 2.5 0 0 0 3.5 7v12.4A2.6 2.6 0 0 1 6.1 22H18" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 8.5h6M9 12h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 3.6v2.2M12 18.2v2.2M3.6 12h2.2M18.2 12h2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M17.9 6.1l-1.6 1.6M7.7 16.3l-1.6 1.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3.2" y="6.2" width="17.6" height="11.6" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.2 10h17.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 15.2h3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
