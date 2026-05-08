"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useScroll } from "@react-three/drei";
import { fadeBetween } from "./timeline";

type Side = "left" | "right";

type CalloutSpec = {
  id: string;
  position: [number, number, number];
  side: Side;
  visible: (story: number) => number;
  value: string;
  unit?: string;
  label: string;
  tone: "warn" | "tech" | "good";
};

const CALLOUTS: CalloutSpec[] = [
  {
    id: "body-exposure",
    position: [-1.18, 0.32, 0.05],
    side: "left",
    visible: (story) => fadeBetween(story, 0.9, 1.2, 2.0, 2.32),
    value: "92",
    unit: "%",
    label: "Body-side absorption",
    tone: "warn",
  },
  {
    id: "directional",
    position: [1.45, 0.4, 0.05],
    side: "right",
    visible: (story) => fadeBetween(story, 2.05, 2.4, 3.05, 3.35),
    value: "360",
    unit: "°",
    label: "Field travels outward",
    tone: "tech",
  },
  {
    id: "shield-coverage",
    position: [-1.4, -0.1, 0.05],
    side: "left",
    visible: (story) => fadeBetween(story, 3.55, 4.05, 5.0, 5.35),
    value: "1",
    unit: "side",
    label: "Directional shield",
    tone: "tech",
  },
  {
    id: "signal-loss",
    position: [1.5, -0.05, 0.05],
    side: "right",
    visible: (story) => fadeBetween(story, 4.15, 4.5, 5.2, 5.5),
    value: "0",
    unit: "%",
    label: "Signal loss",
    tone: "good",
  },
  {
    id: "proof-reading",
    position: [1.45, 0.4, 0.05],
    side: "right",
    visible: (story) => fadeBetween(story, 5.05, 5.4, 5.9, 6.18),
    value: "12",
    unit: "uW/m²",
    label: "Body-side EMF · shielded",
    tone: "good",
  },
];

const TONE_COLOR: Record<CalloutSpec["tone"], string> = {
  warn: "var(--accent-warm)",
  tech: "var(--accent)",
  good: "var(--accent-soft)",
};

function Callout({ spec }: { spec: CalloutSpec }) {
  const wrap = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const scroll = useScroll();
  const offsetX = spec.side === "right" ? 18 : -18;

  useFrame(() => {
    if (!wrap.current) return;
    const story = scroll.offset * 7;
    const presence = spec.visible(story);

    wrap.current.style.opacity = String(presence);
    wrap.current.style.transform = `translate3d(${(1 - presence) * offsetX}px, ${(1 - presence) * 6}px, 0)`;
    wrap.current.style.pointerEvents = presence > 0.5 ? "auto" : "none";
  });

  const align =
    spec.side === "right"
      ? "items-start text-left ml-3"
      : "items-end text-right -ml-[140px] mr-3";

  const accentVar = TONE_COLOR[spec.tone];

  return (
    <Html
      position={spec.position}
      center
      distanceFactor={6.5}
      zIndexRange={[18, 0]}
      occlude={false}
    >
      <div
        ref={wrap}
        className={`flex w-[140px] flex-col gap-[3px] ${align}`}
        style={{
          opacity: 0,
          transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
          willChange: "opacity, transform",
        }}
      >
        <div
          className="kicker text-[8.5px] font-medium uppercase"
          style={{ color: "var(--ink-500)" }}
        >
          {spec.label}
        </div>
        <div className="flex items-baseline gap-1">
          <span
            ref={valueRef}
            className="font-mono text-[22px] leading-none tracking-tight"
            style={{ color: accentVar }}
          >
            {spec.value}
          </span>
          {spec.unit ? (
            <span
              className="text-[10px]"
              style={{ color: "var(--ink-500)" }}
            >
              {spec.unit}
            </span>
          ) : null}
        </div>
        <div
          className="h-px w-12"
          style={{
            background: `linear-gradient(${
              spec.side === "right" ? "90deg" : "270deg"
            }, ${accentVar}, transparent)`,
            alignSelf: spec.side === "right" ? "flex-start" : "flex-end",
          }}
        />
      </div>
    </Html>
  );
}

export default function SpecCallouts() {
  const items = useMemo(() => CALLOUTS, []);
  return (
    <group>
      {items.map((spec) => (
        <Callout key={spec.id} spec={spec} />
      ))}
    </group>
  );
}
