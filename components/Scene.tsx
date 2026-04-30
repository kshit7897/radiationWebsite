"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, ScrollControls, Scroll } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import Phone from "./Phone";
import Radiation from "./Radiation";
import Hero from "./Hero";
import Sections from "./Sections";

const PAGES = 5;

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{ position: [0, 0, 5.6], fov: 30 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ position: "fixed", inset: 0, background: "#070710" }}
    >
      <color attach="background" args={["#070710"]} />
      <fog attach="fog" args={["#070710", 8, 18]} />

      {/* Soft ambient so the dark phone body still reads */}
      <ambientLight intensity={0.55} />

      {/* Key light — warm-white, top-right */}
      <directionalLight
        position={[5, 6, 6]}
        intensity={2.0}
        color="#ffffff"
      />

      {/* Cool fill — bottom-left, gives a premium product-shot feel */}
      <directionalLight
        position={[-6, -2, 3]}
        intensity={1.0}
        color="#7af0ff"
      />

      {/* Rim light — behind the phone, makes silhouettes pop */}
      <directionalLight
        position={[0, 2, -6]}
        intensity={1.4}
        color="#ff8a9a"
      />

      {/* Subtle warm front kicker */}
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#ffffff" />

      <Suspense fallback={null}>
        <ScrollControls pages={PAGES} damping={0.22}>
          <Phone />
          <Radiation />
          <ContactShadows
            position={[0, -1.72, 0]}
            opacity={0.28}
            scale={4.2}
            blur={2.4}
            far={4}
            resolution={512}
            frames={1}
          />
          <Scroll html style={{ width: "100%" }}>
            <Hero />
            <Sections />
          </Scroll>
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}
