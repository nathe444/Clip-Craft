import Link from "next/link";
import { btnGhost, btnPrimary, features, plans, platforms, workflow } from "./content";
import { FaqList } from "./faq-list";
import { HeroActions } from "./hero-actions";
import { PlatformIcon } from "./icons";
import { Navbar } from "./navbar";
import { OverviewFrame } from "./overview-frame";
import { Reveal } from "./reveal";
import { SiteFooter } from "./site-footer";
import { StudioFrame } from "./studio-frame";

const withoutSteps = ["Create", "Edit", "Download", "Upload", "Schedule", "Repeat"];
const withSteps = ["Create", "Customize", "Schedule", "Done"];
const flow = ["Idea", "AI Script", "AI Video", "Caption", "Schedule", "Publish"];
const statusCards = [
  "Video generated",
  "TikTok scheduled",
  "Instagram scheduled",
  "YouTube published",
];

export function LandingPage() {
  return (
    <div id="top" className="landing">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <section className="hero-glow px-5 pt-16 pb-8 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="hero-rise inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/5 px-3 py-1 text-xs text-[var(--muted)]">
              <span className="size-1.5 rounded-full bg-white" />
              AI Video Creation + Scheduling
            </p>
            <h1 className="hero-rise mt-5 text-4xl leading-[1.05] font-medium tracking-[-0.045em] text-balance sm:text-6xl">
              Create short videos. Schedule them everywhere.
            </h1>
            <p className="hero-rise-late mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Generate engaging short-form videos with AI and automatically schedule them across
              YouTube, Instagram, TikTok, and email — all from one place.
            </p>
            <div className="hero-rise-late mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <HeroActions />
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">No credit card required</p>
          </div>
          <div className="hero-rise-late relative mx-auto mt-12 max-w-5xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 -top-6 bottom-8 -z-10 rounded-full bg-white/10 blur-3xl"
            />
            <StudioFrame />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-10">
          <p className="text-center text-sm text-[var(--muted)]">
            Built for creators, marketers, and growing brands
          </p>
          <dl className="mt-5 grid grid-cols-1 divide-y divide-[var(--line)] border-y border-[var(--line)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              ["10K+", "videos created"],
              ["4K+", "creators"],
              ["50K+", "posts scheduled"],
            ].map(([value, label]) => (
              <div key={label} className="px-4 py-4 text-center">
                <dt className="text-2xl font-medium tracking-tight">{value}</dt>
                <dd className="mt-1 text-sm text-[var(--muted)]">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <Reveal>
            <h2 className="max-w-xl text-3xl font-medium tracking-[-0.04em] text-balance sm:text-4xl">
              Stop creating content one platform at a time.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              A short usually means making the video, cutting another version, downloading it, opening
              each app, writing the caption, scheduling the post, and checking what already went out.
              ClipCraft keeps that sequence in one workspace.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--line)] bg-white/[0.02] p-5">
                <h3 className="text-sm font-medium text-[var(--muted)]">Without ClipCraft</h3>
                <ol className="mt-4 flex flex-wrap gap-2">
                  {withoutSteps.map((step) => (
                    <li
                      key={step}
                      className="rounded-md border border-[var(--line)] px-2.5 py-1 text-sm text-[var(--muted)]"
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/[0.05] p-5">
                <h3 className="text-sm font-medium">With ClipCraft</h3>
                <ol className="mt-4 flex flex-wrap gap-2">
                  {withSteps.map((step) => (
                    <li key={step} className="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-[#09090b]">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="scroll-mt-24 border-y border-[var(--line)] bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <Reveal>
              <h2 className="max-w-xl text-3xl font-medium tracking-[-0.04em] text-balance sm:text-4xl">
                Everything you need to turn ideas into content.
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {features.map((feature, index) => (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-[var(--line)] bg-[#0c0d11] p-4 transition duration-200 hover:border-white/20"
                  >
                    <FeaturePreview index={index} />
                    <h3 className="mt-4 text-base font-medium">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{feature.body}</p>
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-16 md:py-20">
          <Reveal>
            <h2 className="max-w-xl text-3xl font-medium tracking-[-0.04em] text-balance sm:text-4xl">
              From idea to published video in minutes.
            </h2>
            <ol className="mt-8 md:grid md:grid-cols-4 md:gap-4">
              {workflow.map((step, index) => (
                <li
                  key={step.n}
                  className={`relative border-l border-white/15 pb-8 pl-6 md:rounded-2xl md:border md:border-[var(--line)] md:p-5 ${
                    index === workflow.length - 1 ? "pb-0 md:pb-5" : ""
                  }`}
                >
                  <span className="absolute top-1 -left-[5px] size-2.5 rounded-full bg-white md:hidden" />
                  <span className="font-mono text-xs text-[var(--faint)]">{step.n}</span>
                  <h3 className="mt-3 text-lg font-medium tracking-tight md:mt-4">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section id="platforms" className="scroll-mt-24 border-y border-[var(--line)]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <Reveal>
              <p className="text-sm text-[var(--muted)]">Create once. Schedule everywhere.</p>
              <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                One workflow. Every channel.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                Create your content once and distribute it across the channels where your audience
                already lives.
              </p>
              <ul className="mt-8 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
                {platforms.map((platform, index) => (
                  <li
                    key={platform.name}
                    className="cc-float min-w-[240px] rounded-2xl border border-[var(--line)] bg-white/[0.03] p-5 md:min-w-0"
                    style={{ animationDelay: `${index * 0.4}s` }}
                  >
                    <PlatformIcon name={platform.name} className="size-6" />
                    <h3 className="mt-4 text-base font-medium">{platform.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{platform.detail}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section id="product" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-16 md:py-20">
          <Reveal>
            <h2 className="max-w-xl text-3xl font-medium tracking-[-0.04em] text-balance sm:text-4xl">
              Your entire content operation in one workspace.
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-2 xl:hidden">
              {statusCards.map((card) => (
                <li key={card} className="rounded-xl border border-[var(--line)] bg-[#101114] px-3 py-2 text-sm">
                  {card} <span className="text-emerald-300">✓</span>
                </li>
              ))}
            </ul>
            <div className="relative mt-6 xl:mt-10">
              <ul className="pointer-events-none absolute top-10 -left-2 hidden w-44 space-y-3 xl:block">
                {statusCards.slice(0, 2).map((card) => (
                  <li key={card}>
                    <StatusCard label={card} />
                  </li>
                ))}
              </ul>
              <ul className="pointer-events-none absolute top-24 -right-2 hidden w-48 space-y-3 xl:block">
                {statusCards.slice(2).map((card) => (
                  <li key={card}>
                    <StatusCard label={card} />
                  </li>
                ))}
              </ul>
              <div className="xl:px-40">
                <OverviewFrame />
              </div>
            </div>
          </Reveal>
        </section>

        <section className="border-y border-[var(--line)] bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <Reveal>
              <h2 className="max-w-xl text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                Your content engine, running automatically.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                ClipCraft takes the repeatable parts of the workflow: the script, the cut, the caption,
                and the time the post goes out.
              </p>
              <ol className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
                {flow.map((step, index) => (
                  <li key={step} className="flex flex-col items-start gap-3 md:contents">
                    <span className="rounded-xl border border-[var(--line)] bg-[#101114] px-4 py-3 text-sm font-medium">
                      {step}
                    </span>
                    {index < flow.length - 1 ? (
                      <>
                        <span className="block h-5 w-px bg-white/25 md:hidden" aria-hidden="true" />
                        <span className="cc-flow hidden h-px w-6 md:block" aria-hidden="true" />
                      </>
                    ) : null}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <Reveal>
            <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Who it&apos;s for</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                [
                  "Creators",
                  "Create and schedule consistent short-form content without spending hours managing every platform.",
                ],
                [
                  "Businesses",
                  "Turn products, services, and ideas into consistent social content.",
                ],
                [
                  "Marketing Teams",
                  "Create campaigns, maintain a content calendar, and distribute content across multiple channels.",
                ],
              ].map(([title, body]) => (
                <article
                  key={title}
                  className="rounded-2xl border border-[var(--line)] p-5 transition duration-200 hover:border-white/20"
                >
                  <h3 className="text-lg font-medium">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{body}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="pricing" className="scroll-mt-24 border-t border-[var(--line)]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                <h2 className="max-w-xl text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                  Start creating without the complexity.
                </h2>
                <a href="#pricing" className={btnGhost}>
                  View Pricing
                </a>
              </div>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {plans.map((plan) => (
                  <article
                    key={plan.name}
                    className={`flex flex-col rounded-2xl border p-5 ${
                      "featured" in plan && plan.featured
                        ? "border-white/30 bg-white/[0.05]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{plan.name}</h3>
                      {"featured" in plan && plan.featured ? (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#09090b]">
                          Creator plan
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-4 text-3xl font-medium tracking-tight">
                      {plan.price}
                      <span className="text-sm font-normal text-[var(--muted)]">
                        {plan.price === "$0" ? "" : "/mo"}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{plan.audience}</p>
                    <ul className="mt-5 space-y-2 text-sm">
                      {plan.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <Link href={plan.href} className={`${btnPrimary} mt-6`}>
                      {plan.cta}
                    </Link>
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 mx-auto max-w-3xl px-5 py-16 md:py-20">
          <Reveal>
            <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Questions</h2>
            <div className="mt-8">
              <FaqList />
            </div>
          </Reveal>
        </section>

        <section className="px-5 pb-20">
          <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--line)] bg-[#101114] px-6 py-12 text-center md:px-12">
            <h2 className="text-3xl font-medium tracking-[-0.04em] text-balance sm:text-5xl">
              Create less manually. Publish more consistently.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Let ClipCraft handle the repetitive work behind your short-form content workflow.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className={`${btnPrimary} h-11 px-5`}>
                Start Creating Free
              </Link>
              <Link href="/login" className={`${btnGhost} h-11 px-5`}>
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function StatusCard({ label }: { label: string }) {
  return (
    <p className="rounded-xl border border-[var(--line)] bg-[#101114]/95 px-3 py-2 text-sm shadow-lg backdrop-blur">
      {label} <span className="text-emerald-300">✓</span>
    </p>
  );
}

function FeaturePreview({ index }: { index: number }) {
  return (
    <div className="h-28 overflow-hidden rounded-xl border border-[var(--line)] bg-black/40 p-3">
      {index === 0 ? <GeneratorPreview /> : null}
      {index === 1 ? <ScriptPreview /> : null}
      {index === 2 ? <ChannelPreview /> : null}
      {index === 3 ? <SchedulePreview /> : null}
      {index === 4 ? <CalendarPreview /> : null}
      {index === 5 ? <BrandPreview /> : null}
    </div>
  );
}

function GeneratorPreview() {
  return (
    <div className="flex h-full gap-3">
      <div className="w-12 rounded-md bg-[#1a2433]" />
      <div className="flex flex-1 flex-col justify-between">
        <p className="text-xs text-[var(--muted)]">Prompt · product hook</p>
        <div className="h-1.5 rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-white/70" />
        </div>
        <p className="font-mono text-[10px] text-[var(--faint)]">9:16 · 00:15</p>
      </div>
    </div>
  );
}

function ScriptPreview() {
  return (
    <div className="space-y-1.5 text-xs">
      <p className="text-[var(--faint)]">Hook</p>
      <p>The first frame has to be the product.</p>
      <p className="text-[var(--muted)]">#launch #shorts</p>
    </div>
  );
}

function ChannelPreview() {
  return (
    <ul className="flex h-full flex-wrap content-center gap-1.5">
      {["YT", "IG", "TT", "Mail"].map((item) => (
        <li key={item} className="rounded-md border border-[var(--line)] px-2 py-1 text-xs">
          {item}
        </li>
      ))}
    </ul>
  );
}

function SchedulePreview() {
  return (
    <div className="flex h-full items-center justify-between rounded-lg border border-[var(--line)] px-3">
      <div>
        <p className="text-xs">Tue · 2:30 PM</p>
        <p className="text-[11px] text-[var(--muted)]">TikTok</p>
      </div>
      <p className="text-xs text-emerald-300">Scheduled</p>
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="grid h-full grid-cols-7 gap-1">
      {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
        <div
          key={`${day}-${index}`}
          className={`rounded-sm ${index === 0 || index === 2 || index === 4 ? "bg-white/80" : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}

function BrandPreview() {
  return (
    <div className="flex h-full items-end justify-between">
      <div className="flex gap-1.5">
        <span className="size-6 rounded-md bg-[#f4f4f5]" />
        <span className="size-6 rounded-md bg-[#8ea2ff]" />
        <span className="size-6 rounded-md bg-[#e4c7a2]" />
      </div>
      <p className="text-sm font-medium tracking-tight">Aeon Sans</p>
    </div>
  );
}
