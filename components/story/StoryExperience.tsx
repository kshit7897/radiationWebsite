"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  PerspectiveCamera,
  Preload,
  Scroll,
  ScrollControls,
  useScroll,
} from "@react-three/drei";
import * as THREE from "three";
import Arrows from "./Arrows";
import Case from "./Case";
import Human from "./Human";
import Phone from "./Phone";
import RadiationField from "./RadiationField";
import StoryPanels from "./StoryPanels";
import { segment } from "./timeline";

const PAGES = 8;

function StoryCamera() {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!camera.current) return;

    const story = scroll.offset * 7;
    const sideFocus = Math.sin(story * Math.PI * 0.45) * 0.18;
    const productFocus = segment(story, 2.7, 4.9);
    const calmEnd = segment(story, 6.1, 7);

    camera.current.position.x =
      sideFocus * (1 - calmEnd) + Math.sin(state.clock.elapsedTime * 0.18) * 0.025;
    camera.current.position.y = 0.04 + productFocus * 0.05 + calmEnd * 0.08;
    camera.current.position.z = 8.35 - productFocus * 0.45 + calmEnd * 0.35;
    camera.current.lookAt(0, 0.03, 0);
  });

  return <PerspectiveCamera ref={camera} makeDefault position={[0, 0.04, 8.35]} fov={29} />;
}

function Atmosphere() {
  const scroll = useScroll();
  const background = useRef<THREE.Color>(null);
  const fog = useRef<THREE.Fog>(null);
  const base = useMemo(() => new THREE.Color("#f0f3f5"), []);
  const cool = useMemo(() => new THREE.Color("#e6edef"), []);
  const calm = useMemo(() => new THREE.Color("#edf2ef"), []);
  const final = useMemo(() => new THREE.Color("#ffffff"), []);
  const working = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const story = scroll.offset * 7;
    const insight = segment(story, 1.8, 2.8);
    const relief = segment(story, 5.7, 6.7);
    const cleanEnd = segment(story, 6.3, 7);

    working.copy(base).lerp(cool, insight * 0.7).lerp(calm, relief * 0.45).lerp(final, cleanEnd * 0.5);

    background.current?.copy(working);

    if (fog.current) {
      fog.current.color.copy(working);
      fog.current.near = 9;
      fog.current.far = 24;
    }
  });

  return (
    <>
      <color ref={background} attach="background" args={["#f0f3f5"]} />
      <fog ref={fog} attach="fog" args={["#f0f3f5", 9, 24]} />
    </>
  );
}

function StoryLights() {
  const ambient = useRef<THREE.AmbientLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const scroll = useScroll();

  useFrame(() => {
    const story = scroll.offset * 7;
    const lightStage = segment(story, 5.6, 7);

    if (ambient.current) ambient.current.intensity = 1.15 + lightStage * 0.2;
    if (key.current) key.current.intensity = 2.6 + lightStage * 0.2;
    if (rim.current) rim.current.intensity = 0.8 * (1 - lightStage * 0.2);
    if (fill.current) fill.current.intensity = 1.35 + lightStage * 0.15;
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={1.15} />
      <directionalLight ref={key} position={[4, 5.5, 6]} intensity={2.6} color="#ffffff" castShadow />
      <directionalLight ref={fill} position={[-5, -1, 4]} intensity={1.35} color="#c2dfe2" />
      <directionalLight ref={rim} position={[0, 2.8, -5]} intensity={0.8} color="#b7cec0" />
      <pointLight position={[0, 0.6, 3]} intensity={0.3} color="#ffffff" />
    </>
  );
}

function StageSurface() {
  const stage = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!stage.current) return;

    const story = scroll.offset * 7;
    const product = segment(story, 2.45, 4.65);

    stage.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.22) * 0.018 + product * 0.035;
    stage.current.position.y = -0.02 + product * 0.04;
  });

  return (
    <group ref={stage}>
      <mesh position={[0, -1.58, -0.35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7.4, 5.2]} />
        <meshStandardMaterial
          color="#e5eaec"
          roughness={0.78}
          metalness={0}
          transparent
          opacity={0.82}
        />
      </mesh>

      <mesh position={[0, -1.575, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.17, 120]} />
        <meshBasicMaterial color="#0f6e7a" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      <mesh position={[0, -1.57, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.72, 1.735, 140]} />
        <meshBasicMaterial color="#7fa98b" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

function StoryWorld() {
  return (
    <>
      <Atmosphere />
      <StoryCamera />
      <StoryLights />
      <StageSurface />
      <Phone />
      <Human />
      <Case />
      <RadiationField />
      <Arrows />
      <ContactShadows
        position={[0, -1.54, 0]}
        opacity={0.16}
        scale={4.6}
        blur={2.2}
        far={4}
        resolution={512}
        frames={1}
      />
      <Preload all />
    </>
  );
}

export default function StoryExperience() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      shadows
      camera={{ position: [0, 0.04, 8.35], fov: 29 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ position: "fixed", inset: 0, background: "#f6fbfc" }}
    >
      <Suspense fallback={null}>
        <ScrollControls pages={PAGES} damping={0.18} distance={1}>
          <StoryWorld />
          <Scroll html style={{ width: "100%" }}>
            <StoryPanels />
          </Scroll>
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}
