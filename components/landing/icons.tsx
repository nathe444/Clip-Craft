export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect
        x="2.2"
        y="3.2"
        width="19.6"
        height="17.6"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M10 8.4v7.2l6.2-3.6L10 8.4z" fill="currentColor" />
    </svg>
  );
}

export function PlatformIcon({ name, className }: { name: string; className?: string }) {
  if (name.startsWith("YouTube")) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10.5 9.2v5.6l5-2.8-5-2.8z" fill="currentColor" />
      </svg>
    );
  }
  if (name.startsWith("Instagram")) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" />
      </svg>
    );
  }
  if (name.startsWith("TikTok")) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M14 4v9.2a3.2 3.2 0 1 1-2.2-3.05V8.2A6.8 6.8 0 0 0 14 9.2c.7-1.7 2.1-3 4.2-3.4V4h-4.2z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function SocialIcon({ name }: { name: "x" | "instagram" | "youtube" | "linkedin" }) {
  const className = "size-4";
  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          fill="currentColor"
          d="M14.7 10.4 21.4 3h-1.6l-5.8 6.4L9.3 3H3.2l7 10.1L3.2 21h1.6l6.2-6.8 4.9 6.8h6.1l-7.3-10.6Zm-2.2 2.4-.7-1-5.7-8h2.4l4.6 6.5.7 1 6 8.4h-2.4l-4.9-6.9Z"
        />
      </svg>
    );
  }
  if (name === "instagram") return <PlatformIcon name="Instagram" className={className} />;
  if (name === "youtube") return <PlatformIcon name="YouTube" className={className} />;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.5 9H4V20h2.5V9ZM5.2 3.8A1.6 1.6 0 1 0 5.2 7a1.6 1.6 0 0 0 0-3.2ZM20 20h-2.5v-5.6c0-1.6-.6-2.6-2-2.6-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20H11V9h2.4v1.5c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.8V20Z"
      />
    </svg>
  );
}
