"use client";

import { useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useScroll } from "@react-three/drei";
import * as THREE from "three";
import ModelAsset from "./ModelAsset";
import { fadeBetween, segment } from "./timeline";

const ARROW_URL = "/models/story/direction_arrow.glb";

function ArrowModel({
  refObject,
  color,
}: {
  refObject: RefObject<THREE.Group | null>;
  color: string;
}) {
  return <ModelAsset ref={refObject} url={ARROW_URL} fit={0.34} variant="arrow" tint={color} opacity={0.82} />;
}

export default function Arrows() {
  const insightTop = useRef<THREE.Group>(null);
  const insightBottom = useRef<THREE.Group>(null);
  const insightRight = useRef<THREE.Group>(null);
  const insightLeft = useRef<THREE.Group>(null);
  const bodyPrimary = useRef<THREE.Group>(null);
  const bodySecondary = useRef<THREE.Group>(null);
  const signalPrimary = useRef<THREE.Group>(null);
  const signalSecondary = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame((state) => {
    const story = scroll.offset * 7;
    const insight = fadeBetween(story, 1.92, 2.35, 3.04, 3.35);
    const how = fadeBetween(story, 3.86, 4.2, 5.05, 5.42);
    const time = state.clock.elapsedTime;

    const insightLayout = [
      { position: [1.2, 0.56, 0.08], rotation: [0, 0, Math.PI / 2], phase: 0 },
      { position: [1.2, -0.56, 0.08], rotation: [0, 0, -Math.PI / 2], phase: 1.2 },
      { position: [1.68, 0.02, 0.08], rotation: [0, 0, 0], phase: 2.4 },
      { position: [0.72, 0.02, 0.08], rotation: [0, Math.PI, 0], phase: 3.6 },
    ] as const;

    const animateInsight = (
      ref: RefObject<THREE.Group | null>,
      index: number
    ) => {
      const item = ref.current;
      if (!item) return;

      const layout = insightLayout[index];
      const travel = Math.sin(time * 1.2 + layout.phase) * 0.12;

      item.visible = insight > 0.02;
      item.position.set(
        layout.position[0] + Math.cos(layout.phase) * travel,
        layout.position[1] + Math.sin(layout.phase) * travel,
        layout.position[2]
      );
      item.rotation.set(
        layout.rotation[0],
        layout.rotation[1],
        layout.rotation[2]
      );
      item.scale.setScalar(insight * (0.68 + Math.sin(time * 2 + index) * 0.035));
    };

    const animateBody = (ref: RefObject<THREE.Group | null>, index: number) => {
      const item = ref.current;
      if (!item) return;

      const pulse = (Math.sin(time * 2.8 + index * 1.1) + 1) * 0.5;
      item.visible = how > 0.02;
      item.position.set(-1.58 - index * 0.32 + pulse * 0.06, 0.16 - index * 0.3, 0.1);
      item.rotation.set(0, Math.PI, 0);
      item.scale.setScalar(how * (0.58 - index * 0.06));
    };

    const animateSignal = (
      ref: RefObject<THREE.Group | null>,
      index: number
    ) => {
      const item = ref.current;
      if (!item) return;

      const pass = segment(story, 4.18, 4.78);
      item.visible = how > 0.02;
      item.position.set(-0.9 + index * 0.34 + pass * 0.14, -0.16 + index * 0.28, 0.1);
      item.rotation.set(0, 0, 0);
      item.scale.setScalar(how * (0.62 - index * 0.05));
    };

    animateInsight(insightTop, 0);
    animateInsight(insightBottom, 1);
    animateInsight(insightRight, 2);
    animateInsight(insightLeft, 3);
    animateBody(bodyPrimary, 0);
    animateBody(bodySecondary, 1);
    animateSignal(signalPrimary, 0);
    animateSignal(signalSecondary, 1);
  });

  return (
    <group>
      <ArrowModel refObject={insightTop} color="#238a9a" />
      <ArrowModel refObject={insightBottom} color="#238a9a" />
      <ArrowModel refObject={insightRight} color="#238a9a" />
      <ArrowModel refObject={insightLeft} color="#238a9a" />
      <ArrowModel refObject={bodyPrimary} color="#d85262" />
      <ArrowModel refObject={bodySecondary} color="#d85262" />
      <ArrowModel refObject={signalPrimary} color="#51b887" />
      <ArrowModel refObject={signalSecondary} color="#51b887" />
    </group>
  );
}

useGLTF.preload(ARROW_URL);
