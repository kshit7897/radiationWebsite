"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useGLTF, useScroll } from "@react-three/drei";
import * as THREE from "three";
import ModelAsset from "./ModelAsset";
import { sampleNumber, sampleTriple, segment } from "./timeline";

const CASE_URL = "/models/story/phone_case.glb";

const POSITIONS = [
  { at: 0, value: [0, 4, 0] },
  { at: 2.72, value: [1.2, 0.02, 0.04] },
  { at: 3.35, value: [1.2, 0.02, 0.04] },
  { at: 4.35, value: [-1.23, 0, 0.03] },
  { at: 5.35, value: [1.17, 0, 0.03] },
  { at: 6.35, value: [-1.05, 0.05, 0.02] },
  { at: 7, value: [1.95, 0.06, 0.0] },
] as const;

const SCALES = [
  { at: 2.72, value: 0.52 },
  { at: 3.35, value: 0.74 },
  { at: 4.35, value: 0.68 },
  { at: 5.35, value: 0.68 },
  { at: 6.35, value: 0.74 },
  { at: 7, value: 0.62 },
] as const;

export default function Case() {
  const root = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Group>(null);
  const shield = useRef<THREE.Group>(null);
  const shieldMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const edgeMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const scroll = useScroll();

  useFrame((state) => {
    const story = scroll.offset * 7;
    const reveal = segment(story, 2.62, 3.18);
    const assemble = segment(story, 3.42, 4.12);
    const [x, y, z] = sampleTriple(story, POSITIONS);
    const scale = sampleNumber(story, SCALES) * reveal;

    if (root.current) {
      root.current.visible = reveal > 0.01;
      root.current.position.set(x, y, z);
      root.current.scale.setScalar(scale);
      root.current.rotation.y = -0.22 + Math.sin(state.clock.elapsedTime * 0.34) * 0.035;
      root.current.rotation.x = -0.03;
    }

    if (outer.current) {
      outer.current.position.set(0, 0, 0.32 - assemble * 0.3);
      outer.current.rotation.y = (1 - assemble) * 0.34;
      outer.current.rotation.z = (1 - assemble) * -0.08;
    }

    if (shield.current) {
      shield.current.position.set(0.3 - assemble * 0.3, 0, -0.22 + assemble * 0.24);
      shield.current.rotation.y = (1 - assemble) * -0.42;
    }

    if (shieldMaterial.current && edgeMaterial.current) {
      const glow = reveal * (0.28 + assemble * 0.4);
      shieldMaterial.current.emissiveIntensity = glow;
      edgeMaterial.current.opacity = reveal * (0.2 + assemble * 0.28);
    }
  });

  return (
    <group ref={root} visible={false}>
      <group ref={outer}>
        <ModelAsset url={CASE_URL} fit={2.35} variant="case" />
      </group>

      <group ref={shield}>
        <RoundedBox args={[1.13, 2.38, 0.045]} radius={0.12} smoothness={10}>
          <meshStandardMaterial
            ref={shieldMaterial}
            color="#0f6e7a"
            emissive="#1fa2b0"
            emissiveIntensity={0}
            metalness={0.52}
            roughness={0.32}
            transparent
            opacity={0.74}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.028]}>
          <planeGeometry args={[1.02, 2.22]} />
          <meshBasicMaterial
            ref={edgeMaterial}
            color="#1fa2b0"
            transparent
            opacity={0}
            blending={THREE.NormalBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload(CASE_URL);
