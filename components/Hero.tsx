"use client";

import { motion } from "framer-motion";
import { useScroll } from "@react-three/drei";

export default function Hero() {
  const scroll = useScroll();

  const handleExplore = () => {
    if (!scroll?.el) return;
    const target = scroll.el.scrollHeight * (1 / 5);
    scroll.el.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      className="relative h-screen w-full flex items-center justify-center px-6"
      style={{ pointerEvents: "none" }}
    >
      <div className="grain" />
      <div className="relative z-10 max-w-4xl w-full text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.22em] text-accent border border-white/10 bg-white/[0.03] backdrop-blur-sm"
        >
          Aegis · Anti-Radiation Series
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-5xl sm:text-7xl md:text-8xl font-semibold tracking-tight leading-[0.95] glow-text"
        >
          Reduce Your Daily
          <br />
          <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
            Radiation Exposure
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-xl mx-auto text-base sm:text-lg text-muted leading-relaxed"
        >
          Engineered shielding for the side that matters — your body. Full
          signal kept, body-side RF cut.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex items-center justify-center gap-4"
          style={{ pointerEvents: "auto" }}
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExplore}
            className="h-12 px-7 rounded-full bg-white text-black text-sm font-medium tracking-tight shadow-[0_8px_30px_rgba(110,231,255,0.15)] hover:shadow-[0_8px_36px_rgba(110,231,255,0.35)] transition-shadow"
          >
            See how it works
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.03 }}
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              if (scroll?.el)
                scroll.el.scrollTo({
                  top: scroll.el.scrollHeight,
                  behavior: "smooth",
                });
            }}
            className="h-12 px-6 rounded-full border border-white/15 text-sm font-medium text-white/85 hover:bg-white/[0.04] flex items-center transition-colors"
          >
            Reserve a case →
          </motion.a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-muted"
      >
        <span>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
