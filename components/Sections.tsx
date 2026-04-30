"use client";

import { motion } from "framer-motion";
import ContactForm from "./ContactForm";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.45 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

function StoryPanel({
  eyebrow,
  title,
  body,
  align = "right",
  accent,
}: {
  eyebrow: string;
  title: string;
  body: string;
  align?: "left" | "right";
  accent?: "warm" | "cool";
}) {
  const alignment =
    align === "right"
      ? "md:items-end md:text-right md:pr-[8vw]"
      : "md:items-start md:text-left md:pl-[8vw]";
  const accentColor =
    accent === "warm" ? "text-accent-warm" : "text-accent";

  return (
    <section
      className={`relative h-screen w-full flex flex-col justify-center px-6 ${alignment}`}
      style={{ pointerEvents: "none" }}
    >
      <motion.div
        {...fadeUp}
        className="max-w-md flex flex-col gap-5"
      >
        <span
          className={`text-[11px] uppercase tracking-[0.32em] ${accentColor}`}
        >
          {eyebrow}
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          {title}
        </h2>
        <p className="text-base sm:text-lg text-muted leading-relaxed">
          {body}
        </p>
      </motion.div>
    </section>
  );
}

function ProductHighlight() {
  return (
    <section
      className="relative h-screen w-full flex flex-col justify-center px-6 md:items-end md:text-right md:pr-[8vw]"
      style={{ pointerEvents: "none" }}
    >
      <motion.div {...fadeUp} className="max-w-md flex flex-col gap-5">
        <span className="text-[11px] uppercase tracking-[0.32em] text-accent">
          The Aegis Cover
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          Our case blocks it.
        </h2>
        <p className="text-base sm:text-lg text-muted leading-relaxed">
          A laminated shielding layer mounts on the body-side of your phone —
          attenuating SAR exposure while leaving the antenna side untouched.
          Signal stays. Radiation drops.
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/80">
          <li className="flex items-baseline gap-2">
            <span className="text-accent">·</span> Aerospace-grade shielding
          </li>
          <li className="flex items-baseline gap-2">
            <span className="text-accent">·</span> 0g signal loss
          </li>
          <li className="flex items-baseline gap-2">
            <span className="text-accent">·</span> Drop-tested aluminum frame
          </li>
          <li className="flex items-baseline gap-2">
            <span className="text-accent">·</span> Wireless charging safe
          </li>
        </ul>
      </motion.div>
    </section>
  );
}

function TrustAndContact() {
  return (
    <section
      id="contact"
      className="relative min-h-screen w-full flex flex-col justify-between px-6 py-20"
      style={{ pointerEvents: "none" }}
    >
      <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center mt-10">
        <span className="text-[11px] uppercase tracking-[0.32em] text-accent">
          Tested Shielding Technology
        </span>
        <h2 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          Independently lab-verified.
        </h2>
        <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed">
          Every Aegis case is tested in third-party RF labs to a documented
          attenuation spec. We publish the numbers — not slogans.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto">
          {[
            { v: "92%", k: "Body-side attenuation" },
            { v: "0%", k: "Signal degradation" },
            { v: "FCC", k: "SAR compliant" },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm py-5 px-3"
            >
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {s.v}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
                {s.k}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        {...fadeUp}
        className="max-w-xl w-full mx-auto mt-16"
        style={{ pointerEvents: "auto" }}
      >
        <ContactForm />
      </motion.div>

      <div className="mt-16 text-center text-[11px] uppercase tracking-[0.28em] text-muted">
        Aegis · Ship the calm
      </div>
    </section>
  );
}

export default function Sections() {
  return (
    <>
      <StoryPanel
        eyebrow="Phase 01 · Emission"
        title="Your phone emits radiation."
        body="Every active phone is a small RF transmitter. While the signal travels in every direction, exposure is highest where the device sits closest to your body."
        align="right"
        accent="cool"
      />
      <StoryPanel
        eyebrow="Phase 02 · Body-side"
        title="Exposure happens on the body side."
        body="Pockets. Bras. Lap. The side facing you absorbs the most — exactly where shielding matters."
        align="left"
        accent="warm"
      />
      <ProductHighlight />
      <TrustAndContact />
    </>
  );
}
