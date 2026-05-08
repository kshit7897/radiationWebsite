"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { motion } from "framer-motion";
import { mix, segment } from "./timeline";

const textMotion = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.5 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

type PanelProps = {
  index: string;
  kicker: string;
  title: string;
  body: string;
  side?: "left" | "right" | "center";
  interactive?: boolean;
  children?: React.ReactNode;
};

function Panel({
  index,
  kicker,
  title,
  body,
  side = "left",
  interactive = false,
  children,
}: PanelProps) {
  const shell =
    side === "center"
      ? "mx-auto items-center text-center"
      : side === "right"
        ? "ml-auto items-end text-right"
        : "mr-auto items-start text-left";
  const rule =
    side === "right"
      ? "border-r pr-5 md:pr-7"
      : side === "center"
        ? "border-t pt-6"
        : "border-l pl-5 md:pl-7";

  return (
    <section
      className="flex h-screen w-full flex-col justify-center px-5 py-20 sm:px-10 lg:px-[7vw]"
      style={{ pointerEvents: interactive ? "auto" : "none" }}
    >
      <motion.div
        {...textMotion}
        className={`flex w-full max-w-[455px] flex-col ${shell} ${rule} border-[#32a6b8]/35`}
      >
        <div className="mb-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-[#218596]">
          <span className="font-mono text-[#67b99a]">{index}</span>
          <span>{kicker}</span>
        </div>
        <h2 className="text-[clamp(2rem,4.6vw,4.4rem)] font-semibold leading-[1.04] tracking-normal text-[#102d3a]">
          {title}
        </h2>
        <p className="mt-5 max-w-[36rem] text-[15px] leading-7 text-[#526c76] sm:text-base">
          {body}
        </p>
        {children}
      </motion.div>
    </section>
  );
}

function ProofMeter() {
  const value = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    const story = scroll.offset * 7;
    const drop = segment(story, 4.95, 5.42);
    const reading = Math.round(mix(84, 12, drop));

    if (value.current) value.current.textContent = String(reading);
    if (bar.current) bar.current.style.transform = `scaleX(${reading / 84})`;
  });

  return (
    <motion.div
      {...textMotion}
      className="mt-8 w-full max-w-sm border-y border-[#b9d8de] py-5 text-left"
    >
      <div className="flex items-end justify-between">
        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b8791]">
          EMF
        </span>
        <span className="font-mono text-4xl text-[#102d3a]">
          <span ref={value}>84</span>
          <span className="ml-2 text-sm text-[#6b8791]">uW/m2</span>
        </span>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#d7e9ed]">
        <div
          ref={bar}
          className="h-full origin-left rounded-full bg-[#27a5b8] transition-transform duration-75"
          style={{ transform: "scaleX(1)" }}
        />
      </div>
    </motion.div>
  );
}

function StoryChrome() {
  const progress = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (progress.current) {
      progress.current.style.transform = `scaleX(${scroll.offset})`;
    }
  });

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-20 px-5 pt-5 sm:px-8">
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-[#55727d]">
        <span>Directional Shield Case</span>
        <span className="hidden sm:inline">RF body-side protection</span>
      </div>
      <div className="mt-4 h-px w-full overflow-hidden bg-[#d4e8ed]">
        <div
          ref={progress}
          className="h-full origin-left bg-[#27a5b8]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}

export default function StoryPanels() {
  return (
    <>
      <StoryChrome />
      <Panel
        index="01"
        kicker="Curiosity"
        title="You cannot see it, but proximity matters."
        body="Your phone is always communicating. The invisible part becomes important when the device sits close to your body for hours."
        side="left"
      />

      <Panel
        index="02"
        kicker="Problem"
        title="The body-facing side gets the highest exposure."
        body="Pocket, waist, lap, bedside. The closest side is where radiation paths become concentrated and easiest to understand visually."
        side="right"
      />

      <Panel
        index="03"
        kicker="Insight"
        title="The smarter question is direction."
        body="Signals travel outward. Protection should guide the field away from the body side instead of surrounding the whole device."
        side="left"
      />

      <Panel
        index="04"
        kicker="Solution"
        title="A shielding layer placed only where it matters."
        body="The case separates the outer shell from an inner directional shield, so the blocked side and open side stay visually clear."
        side="left"
      />

      <Panel
        index="05"
        kicker="Signal"
        title="Blocks toward you. Leaves the network side open."
        body="The body side is guarded. The outside path stays open so the phone can keep communicating without feeling sealed off."
        side="right"
      />

      <Panel
        index="06"
        kicker="Proof"
        title="Measured reduction, shown simply."
        body="The meter drops as the shield moves into place, making the product claim easy to read without visual noise."
        side="left"
      >
        <ProofMeter />
      </Panel>

      <Panel
        index="07"
        kicker="Everyday"
        title="Quiet protection for normal use."
        body="No aggressive effects here. Just a clean product moment that feels calm, reliable, and easy to live with."
        side="right"
      />

      <Panel
        index="08"
        kicker="Action"
        title="Protect your body. Not just your phone."
        body="A premium case built around the side that actually faces you."
        side="center"
        interactive
      >
        <motion.a
          {...textMotion}
          href="mailto:hello@aegisshield.com?subject=Get%20Your%20Shield"
          className="mt-9 inline-flex h-12 items-center justify-center rounded-full bg-[#102d3a] px-7 text-sm font-medium tracking-normal text-white shadow-[0_20px_60px_rgba(16,45,58,0.18)] transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#27a5b8]/30"
        >
          Get Your Shield
        </motion.a>
      </Panel>
    </>
  );
}
