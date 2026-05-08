"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { motion } from "framer-motion";
import { clamp01, mix, segment, smooth } from "./timeline";

const PANEL_COUNT = 8;

const CHAPTERS = [
  "Curiosity",
  "Problem",
  "Insight",
  "Solution",
  "Signal",
  "Proof",
  "Everyday",
  "Action",
];

type PanelProps = {
  index: string;
  storyIndex: number;
  kicker: string;
  title: string;
  body: string;
  side?: "left" | "right" | "center";
  interactive?: boolean;
  framed?: boolean;
  children?: React.ReactNode;
};

function panelPresence(story: number, storyIndex: number) {
  const local = story - storyIndex;
  const fadeIn = smooth(clamp01((local + 0.55) / 0.55));
  const fadeOut = smooth(clamp01((local - 0.62) / 0.42));
  return fadeIn * (1 - fadeOut);
}

function Panel({
  index,
  storyIndex,
  kicker,
  title,
  body,
  side = "left",
  interactive = false,
  framed = false,
  children,
}: PanelProps) {
  const root = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<HTMLSpanElement[]>([]);
  const lineRefs = useRef<HTMLSpanElement[]>([]);
  const kickerRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const bodyParts = useMemo(() => splitBodyIntoLines(body), [body]);
  const titleWords = useMemo(() => title.split(/(\s+)/), [title]);
  const scroll = useScroll();

  useFrame((state) => {
    if (!root.current) return;

    const story = scroll.offset * 7;
    const presence = panelPresence(story, storyIndex);
    const breathing = Math.sin(state.clock.elapsedTime * 0.55) * 0.4 + 0.6;

    root.current.style.setProperty("--p", String(presence));
    root.current.style.opacity = String(0.05 + presence * 0.95);
    root.current.style.transform = `translateY(${(1 - presence) * 18}px)`;

    if (kickerRef.current) {
      kickerRef.current.style.opacity = String(presence);
      kickerRef.current.style.transform = `translateX(${(1 - presence) * 18 * (side === "right" ? 1 : -1)}px)`;
    }

    if (ruleRef.current) {
      ruleRef.current.style.transform = `scaleY(${presence})`;
      ruleRef.current.style.opacity = String(0.55 + presence * 0.45 * breathing);
    }

    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      const wordPresence = clamp01((presence - i * 0.022) * 4.2);
      const eased = smooth(wordPresence);
      el.style.opacity = String(eased);
      el.style.transform = `translateY(${(1 - eased) * 22}px)`;
      el.style.filter = `blur(${(1 - eased) * 6}px)`;
    });

    lineRefs.current.forEach((el, i) => {
      if (!el) return;
      const linePresence = clamp01((presence - 0.18 - i * 0.08) * 3.4);
      const eased = smooth(linePresence);
      el.style.opacity = String(eased * 0.92);
      el.style.transform = `translateY(${(1 - eased) * 14}px)`;
    });
  });

  const align =
    side === "center"
      ? "mx-auto items-center text-center"
      : side === "right"
        ? "ml-auto items-end text-right"
        : "mr-auto items-start text-left";

  const ruleSide =
    side === "right"
      ? "right-0 -translate-x-0"
      : side === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0";

  const inner = (
    <>
      {!framed && (
        <span
          ref={ruleRef}
          aria-hidden
          className={`absolute top-0 ${ruleSide} h-full w-px origin-top bg-gradient-to-b from-transparent via-[var(--accent)]/45 to-transparent`}
          style={{ transform: "scaleY(0)" }}
        />
      )}

      <div
        ref={kickerRef}
        className={`kicker flex items-center gap-3 text-[10.5px] font-medium uppercase ${
          framed
            ? "justify-center text-[color:var(--accent-soft)]"
            : "text-[color:var(--accent-deep)]"
        }`}
        style={{ opacity: 0 }}
      >
        <span
          className={`font-mono ${
            framed
              ? "text-[color:var(--accent-soft)]"
              : "text-[color:var(--accent-soft)]"
          }`}
        >
          {index}
        </span>
        <span
          className={`h-px w-6 ${
            framed ? "bg-white/30" : "bg-[var(--accent-deep)]/45"
          }`}
        />
        <span>{kicker}</span>
      </div>

      <h2
        className={`headline font-semibold text-[color:var(--foreground)] ${
          framed
            ? "text-[clamp(1.5rem,2.6vw,2.2rem)]"
            : "text-[clamp(2.1rem,4.6vw,4.6rem)]"
        }`}
      >
        {titleWords.map((segment, i) => {
          if (/^\s+$/.test(segment)) return <span key={i}> </span>;
          return (
            <span
              key={i}
              ref={(el) => {
                if (el) wordRefs.current[Math.floor(i / 2)] = el;
              }}
              className="word-reveal"
            >
              {segment}
            </span>
          );
        })}
      </h2>

      <p
        className={`leading-[1.55] text-[color:var(--foreground-soft)] ${
          framed ? "max-w-[280px] text-[13px]" : "max-w-[36rem] text-[15px] sm:text-base"
        }`}
      >
        {bodyParts.map((line, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) lineRefs.current[i] = el;
            }}
            className="line-reveal"
          >
            {line}
          </span>
        ))}
      </p>

      {children}
    </>
  );

  return (
    <section
      className="relative flex h-screen w-full flex-col justify-center px-5 py-20 sm:px-10 lg:px-[7vw]"
      style={{ pointerEvents: interactive ? "auto" : "none" }}
    >
      <div
        ref={root}
        className={`relative flex w-full flex-col gap-5 ${align} ${
          framed ? "max-w-[360px]" : "max-w-[480px]"
        }`}
        style={{ opacity: 0, transform: "translateY(18px)" }}
      >
        {framed ? (
          <div className="shield-frame w-full">
            <div className="shield-inner flex flex-col items-center gap-3 text-center">
              <span aria-hidden className="shield-corner shield-corner-tl" />
              <span aria-hidden className="shield-corner shield-corner-tr" />
              <span aria-hidden className="shield-corner shield-corner-bl" />
              <span aria-hidden className="shield-corner shield-corner-br" />
              {inner}
            </div>
          </div>
        ) : (
          inner
        )}
      </div>
    </section>
  );
}

function splitBodyIntoLines(body: string) {
  const sentences = body
    .split(/([.!?]\s+)/)
    .reduce<string[]>((accumulator, part, i, all) => {
      if (i % 2 === 0) {
        const punctuation = all[i + 1] ?? "";
        const merged = (part + punctuation).trim();
        if (merged) accumulator.push(merged);
      }
      return accumulator;
    }, []);
  return sentences.length > 0 ? sentences : [body];
}

function ProofMeter() {
  const value = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    const story = scroll.offset * 7;
    const drop = segment(story, 4.95, 5.42);
    const reveal = segment(story, 4.85, 5.05);
    const reading = Math.round(mix(84, 12, drop));

    if (value.current) value.current.textContent = String(reading);

    if (bar.current) {
      bar.current.style.transform = `scaleX(${0.04 + (reading / 84) * 0.96})`;
    }

    if (halo.current) {
      halo.current.style.opacity = String(0.6 - drop * 0.4);
      halo.current.style.transform = `scaleX(${0.6 + drop * 0.4})`;
    }

    if (block.current) {
      block.current.style.opacity = String(reveal * 0.9);
      block.current.style.transform = `translateX(${(1 - reveal) * -8}px)`;
    }
  });

  return (
    <motion.div
      ref={block}
      className="glass mt-9 w-full max-w-sm rounded-2xl px-6 py-5"
      style={{ opacity: 0 }}
    >
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="kicker text-[10px] font-medium uppercase text-[color:var(--muted)]">
            Body-side EMF
          </span>
          <span className="mt-2 font-mono text-[2.6rem] leading-none tracking-tight text-[color:var(--foreground)]">
            <span ref={value}>84</span>
            <span className="ml-2 align-baseline text-xs text-[color:var(--muted)]">
              uW/m²
            </span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--accent-soft)]">
            Shielded
          </span>
          <span className="text-[10px] font-mono text-[color:var(--muted)]">
            -86%
          </span>
        </div>
      </div>
      <div className="relative mt-5 h-[3px] overflow-hidden rounded-full bg-[color:var(--accent)]/15">
        <div
          ref={halo}
          className="absolute inset-0 origin-left rounded-full bg-[color:var(--accent-warm)]/55 blur-md"
        />
        <div
          ref={bar}
          className="relative h-full origin-left rounded-full bg-gradient-to-r from-[color:var(--accent-warm)] via-[color:var(--accent)] to-[color:var(--accent-soft)]"
        />
      </div>
    </motion.div>
  );
}

function StoryChrome() {
  const progress = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<HTMLDivElement[]>([]);
  const labelRef = useRef<HTMLSpanElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    const offset = scroll.offset;
    const story = offset * 7;
    const activeIndex = Math.min(
      PANEL_COUNT - 1,
      Math.max(0, Math.round(story))
    );

    if (progress.current) {
      progress.current.style.transform = `scaleX(${offset})`;
    }

    if (tip.current) {
      tip.current.style.left = `${offset * 100}%`;
      tip.current.style.opacity = String(0.6 + Math.sin(story * 6) * 0.05);
    }

    if (cue.current) {
      cue.current.style.opacity = String(Math.max(0, 1 - offset * 6));
    }

    if (labelRef.current && labelRef.current.dataset.active !== String(activeIndex)) {
      labelRef.current.dataset.active = String(activeIndex);
      labelRef.current.textContent = CHAPTERS[activeIndex];
    }

    dotRefs.current.forEach((dot, i) => {
      if (!dot) return;
      dot.dataset.active = i === activeIndex ? "true" : "false";
    });
  });

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-20 px-5 pt-5 sm:px-8">
        <div className="kicker flex items-center justify-between text-[10.5px] font-medium uppercase text-[color:var(--muted)]">
          <span className="flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--accent-glow)] shadow-[0_0_10px_rgba(31,162,176,0.75)]" />
            Aegis · Directional Shield
          </span>
          <span
            ref={labelRef}
            className="hidden text-[color:var(--foreground)] sm:inline"
          >
            {CHAPTERS[0]}
          </span>
        </div>

        <div className="relative mt-4 h-[2px] w-full overflow-visible bg-[color:var(--accent)]/12">
          <div
            ref={progress}
            className="h-full origin-left bg-gradient-to-r from-[color:var(--accent-warm)] via-[color:var(--accent)] to-[color:var(--accent-soft)]"
            style={{ transform: "scaleX(0)" }}
          />
          <div
            ref={tip}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-[color:var(--accent-glow)] shadow-[0_0_18px_rgba(31,162,176,0.85)]"
            style={{ left: "0%" }}
          />
        </div>

        <div className="mt-3 hidden items-center justify-between sm:flex">
          {CHAPTERS.map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) dotRefs.current[i] = el;
              }}
              data-active="false"
              className="chapter-dot h-1 w-1 rounded-full bg-[color:var(--accent)]/30"
            />
          ))}
        </div>
      </div>

      <div
        ref={cue}
        className="scroll-cue pointer-events-none fixed bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[color:var(--muted)]"
      >
        <span>Scroll</span>
        <span className="block h-7 w-px bg-gradient-to-b from-[color:var(--accent)]/60 to-transparent" />
      </div>
    </>
  );
}

export default function StoryPanels() {
  return (
    <>
      <StoryChrome />

      <Panel
        index="01"
        storyIndex={0}
        kicker="Curiosity"
        title="You cannot see it, but proximity matters."
        body="Your phone is always communicating. The invisible part becomes important when the device sits close to your body for hours."
        side="left"
      />

      <Panel
        index="02"
        storyIndex={1}
        kicker="Problem"
        title="The body-facing side gets the highest exposure."
        body="Pocket. Waist. Lap. Bedside. The closest side is where radiation paths become concentrated and easiest to understand visually."
        side="right"
      />

      <Panel
        index="03"
        storyIndex={2}
        kicker="Insight"
        title="The smarter question is direction."
        body="Signals travel outward in every direction. Protection should guide the field away from the body side instead of surrounding the whole device."
        side="left"
      />

      <Panel
        index="04"
        storyIndex={3}
        kicker="Solution"
        title="A shielding layer placed only where it matters."
        body="The case separates the outer shell from an inner directional shield, so the blocked side and open side stay visually clear."
        side="left"
      />

      <Panel
        index="05"
        storyIndex={4}
        kicker="Signal"
        title="Blocks toward you. Leaves the network side open."
        body="The body side is guarded. The outside path stays open so the phone can keep communicating without feeling sealed off."
        side="right"
      />

      <Panel
        index="06"
        storyIndex={5}
        kicker="Proof"
        title="Measured reduction, shown simply."
        body="The meter drops as the shield moves into place. The product claim becomes easy to read without visual noise."
        side="left"
      >
        <ProofMeter />
      </Panel>

      <Panel
        index="07"
        storyIndex={6}
        kicker="Everyday"
        title="Quiet protection for normal use."
        body="No aggressive effects here. Just a clean product moment that feels calm, reliable, and easy to live with."
        side="right"
      />

      <Panel
        index="08"
        storyIndex={7}
        kicker="Action"
        title="Protect your body. Not just your phone."
        body="A premium case built around the side that actually faces you."
        side="center"
        interactive
        framed
      >
        <motion.a
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          href="mailto:hello@aegisshield.com?subject=Get%20Your%20Shield"
          className="cta-glow group mt-6 inline-flex h-[50px] items-center justify-center gap-3 rounded-full bg-white px-7 text-sm font-medium tracking-[0.02em] text-[color:#0a1620] shadow-[0_18px_50px_rgba(0,0,0,0.32)] focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <span>Get Your Shield</span>
          <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
            →
          </span>
        </motion.a>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="kicker mt-2 text-[9.5px] uppercase tracking-[0.32em] text-white/60"
        >
          Ships globally · 30-day returns
        </motion.span>
      </Panel>
    </>
  );
}
