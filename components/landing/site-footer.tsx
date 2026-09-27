import { Mark, SocialIcon } from "./icons";

const columns = [
  {
    title: "Product",
    links: [
      ["AI Video Generator", "#features"],
      ["AI Scripts", "#features"],
      ["Video Editor", "#how-it-works"],
      ["Content Calendar", "#product"],
      ["Auto Scheduling", "#how-it-works"],
      ["Analytics", "#product"],
    ],
  },
  {
    title: "Platforms",
    links: [
      ["YouTube", "#platforms"],
      ["Instagram", "#platforms"],
      ["TikTok", "#platforms"],
      ["Email", "#platforms"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "#product"],
      ["Blog", "#resources"],
      ["Careers", "#resources"],
      ["Contact", "mailto:hello@clipcraft.app"],
      ["Changelog", "#resources"],
    ],
  },
  {
    title: "Resources",
    id: "resources",
    links: [
      ["Documentation", "#how-it-works"],
      ["Help Center", "#faq"],
      ["Tutorials", "#how-it-works"],
      ["API", "#resources"],
      ["Community", "#resources"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "#privacy"],
      ["Terms of Service", "#terms"],
      ["Cookie Policy", "#cookies"],
    ],
  },
] as const;

const social = [
  { name: "x" as const, label: "X", href: "https://x.com" },
  { name: "instagram" as const, label: "Instagram", href: "https://www.instagram.com" },
  { name: "youtube" as const, label: "YouTube", href: "https://www.youtube.com" },
  { name: "linkedin" as const, label: "LinkedIn", href: "https://www.linkedin.com" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[#090a0d]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <div>
            <a href="#top" className="inline-flex items-center gap-2 font-semibold tracking-tight">
              <Mark className="size-6" />
              ClipCraft
            </a>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--muted)]">
              AI-powered video creation and scheduling for modern content teams.
            </p>
            <ul className="mt-5 flex gap-2">
              {social.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    aria-label={item.label}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] transition hover:text-white"
                  >
                    <SocialIcon name={item.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {columns.map((column) => (
              <div key={column.title} id={"id" in column ? column.id : undefined} className="scroll-mt-24">
                <p className="text-xs font-medium tracking-[0.12em] text-[var(--faint)] uppercase">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {column.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-[var(--muted)] transition hover:text-white">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-[var(--line)] pt-8 md:grid-cols-3">
          <section id="privacy" className="scroll-mt-24">
            <h2 className="text-sm font-medium">Privacy Policy</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              ClipCraft stores the prompts, videos, and schedule you create. Channel connections stay
              encrypted. We do not sell your footage or your list.
            </p>
          </section>
          <section id="terms" className="scroll-mt-24">
            <h2 className="text-sm font-medium">Terms of Service</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              You own your prompts. You are responsible for the rights to what you upload and for what
              you publish. A video stays in the workspace until you schedule it.
            </p>
          </section>
          <section id="cookies" className="scroll-mt-24">
            <h2 className="text-sm font-medium">Cookie Policy</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              ClipCraft uses cookies to keep you signed in and to remember the workspace you last opened.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--line)] pt-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ClipCraft. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
