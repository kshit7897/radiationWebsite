"use client";

import { useRef } from "react";
import { Html, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { fadeBetween } from "./timeline";

type LabelProps = {
  title: string;
  detail: string;
  tone: "risk" | "shield" | "signal" | "neutral";
  position: [number, number, number];
  opacity: (story: number) => number;
};

const toneClass = {
  risk: "border-[#e9a2aa] text-[#a53d4c]",
  shield: "border-[#8fd8e3] text-[#19798a]",
  signal: "border-[#9eddbd] text-[#23875c]",
  neutral: "border-[#b9d8de] text-[#365865]",
};

function StoryLabel({ title, detail, tone, position, opacity }: LabelProps) {
  const root = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!root.current) return;

    const alpha = opacity(scroll.offset * 7);
    root.current.style.opacity = `${alpha}`;
    root.current.style.transform = `translateY(${(1 - alpha) * 8}px)`;
  });

  return (
    <Html position={position} center distanceFactor={7.5} style={{ pointerEvents: "none" }}>
      <div
        ref={root}
        className={`min-w-[142px] rounded-full border bg-white/80 px-3 py-2 text-left shadow-[0_14px_40px_rgba(45,90,105,0.12)] backdrop-blur-md transition-transform ${toneClass[tone]}`}
        style={{ opacity: 0 }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em]">
          {title}
        </div>
        <div className="mt-0.5 text-[11px] leading-4 text-[#526c76]">
          {detail}
        </div>
      </div>
    </Html>
  );
}

export default function StoryLabels() {
  return (
    <>
      <StoryLabel
        title="Body side"
        detail="closest exposure zone"
        tone="risk"
        position={[-1.92, 0.88, 0.1]}
        opacity={(story) => fadeBetween(story, 0.82, 1.08, 1.86, 2.2)}
      />
      <StoryLabel
        title="Shield layer"
        detail="directional barrier"
        tone="shield"
        position={[1.28, 0.96, 0.1]}
        opacity={(story) => fadeBetween(story, 2.9, 3.24, 4.2, 4.55)}
      />
      <StoryLabel
        title="Blocked"
        detail="towards your body"
        tone="risk"
        position={[-1.64, 0.66, 0.12]}
        opacity={(story) => fadeBetween(story, 4.0, 4.24, 5.0, 5.34)}
      />
      <StoryLabel
        title="Signal side"
        detail="keeps connection open"
        tone="signal"
        position={[-0.48, 0.56, 0.1]}
        opacity={(story) => fadeBetween(story, 4.1, 4.34, 5.08, 5.4)}
      />
      <StoryLabel
        title="Daily carry"
        detail="calm, thin, familiar"
        tone="neutral"
        position={[-0.74, 1.02, 0.1]}
        opacity={(story) => fadeBetween(story, 5.92, 6.18, 6.78, 7.05)}
      />
    </>
  );
}
