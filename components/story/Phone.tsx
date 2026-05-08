"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useScroll } from "@react-three/drei";
import * as THREE from "three";
import ModelAsset from "./ModelAsset";
import { sampleNumber, sampleTriple } from "./timeline";

const PHONE_URL = "/models/story/phone.glb";

const POSITIONS = [
  { at: 0, value: [1.22, 0.02, 0] },
  { at: 0.72, value: [1.22, 0.02, 0] },
  { at: 1.15, value: [-1.3, -0.48, 0.06] },
  { at: 2.12, value: [1.18, -0.02, 0.05] },
  { at: 3.1, value: [1.2, 0.02, 0.05] },
  { at: 4.25, value: [-1.23, 0, 0.04] },
  { at: 5.35, value: [1.17, 0, 0.04] },
  { at: 6.35, value: [-1.05, 0.05, 0.02] },
  { at: 7, value: [1.95, 0.06, -0.05] },
] as const;

const ROTATIONS = [
  { at: 0, value: [-0.03, -0.42, 0.04] },
  { at: 1.15, value: [0.02, 0.18, -0.04] },
  { at: 2.12, value: [0.02, -0.96, 0] },
  { at: 3.1, value: [0, -0.34, 0] },
  { at: 4.25, value: [0, -0.16, 0] },
  { at: 5.35, value: [0, -0.28, 0] },
  { at: 6.35, value: [-0.02, 0.24, 0] },
  { at: 7, value: [-0.02, -0.42, 0] },
] as const;

const SCALES = [
  { at: 0, value: 0.76 },
  { at: 1.15, value: 0.48 },
  { at: 2.12, value: 0.58 },
  { at: 3.1, value: 0.6 },
  { at: 4.25, value: 0.6 },
  { at: 5.35, value: 0.6 },
  { at: 6.35, value: 0.64 },
  { at: 7, value: 0.62 },
] as const;

export default function Phone() {
  const root = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const position = useMemo(() => new THREE.Vector3(), []);
  const rotation = useMemo(() => new THREE.Euler(), []);

  useFrame((state) => {
    if (!root.current) return;

    const story = scroll.offset * 7;
    const [x, y, z] = sampleTriple(story, POSITIONS);
    const [rx, ry, rz] = sampleTriple(story, ROTATIONS);
    const scale = sampleNumber(story, SCALES);
    const float = Math.sin(state.clock.elapsedTime * 0.78) * 0.035;

    position.set(x, y + float, z);
    rotation.set(rx + float * 0.04, ry + float * 0.12, rz);

    root.current.position.lerp(position, 0.12);
    root.current.rotation.x += (rotation.x - root.current.rotation.x) * 0.1;
    root.current.rotation.y += (rotation.y - root.current.rotation.y) * 0.1;
    root.current.rotation.z += (rotation.z - root.current.rotation.z) * 0.1;
    root.current.scale.setScalar(scale);
  });

  return (
    <group ref={root}>
      <ModelAsset
        url={PHONE_URL}
        fit={2.45}
        variant="phone"
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload(PHONE_URL);
