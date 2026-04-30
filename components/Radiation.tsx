"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { range, smoothstep } from "./animation";

const RING_COUNT = 4;
const CYCLE = 1.6;
const MAX_RADIUS = 1.6;
const TUBE = 0.008;
const MAX_OPACITY = 0.55;

type EmitterProps = {
  direction: 1 | -1;
  color: string;
};

function Emitter({ direction, color }: EmitterProps) {
  const meshes = useRef<THREE.Mesh[]>([]);
  const offsets = useMemo(
    () => Array.from({ length: RING_COUNT }, (_, i) => i / RING_COUNT),
    []
  );
  const scroll = useScroll();

  useFrame((state) => {
    const t = scroll.offset;
    const tEmit = range(t, 0.4, 0.55);
    const tShield = range(t, 0.85, 1.0);
    const ringsOn = smoothstep(tEmit);
    const directional = direction === -1 ? 1 - smoothstep(tShield) : 1;
    const overall = ringsOn * directional;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < RING_COUNT; i++) {
      const mesh = meshes.current[i];
      if (!mesh) continue;

      const phase = (((time / CYCLE) + offsets[i]) % 1 + 1) % 1;
      const radius = 0.28 + phase * MAX_RADIUS;
      mesh.scale.set(radius, radius, 1);
      mesh.position.z = direction * (0.18 + phase * 1.6);
      mesh.position.y = Math.sin(time * 0.5 + i * 1.7) * 0.025;

      const material = mesh.material as THREE.MeshBasicMaterial;
      const lifeFade = Math.sin(phase * Math.PI);
      material.opacity = lifeFade * MAX_OPACITY * overall;
      mesh.visible = material.opacity > 0.005;
    }
  });

  return (
    <group>
      {offsets.map((_, i) => (
        <mesh
          key={i}
          ref={(element) => {
            if (element) meshes.current[i] = element;
          }}
          visible={false}
        >
          <torusGeometry args={[1, TUBE, 12, 96]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Radiation() {
  return (
    <group>
      <Emitter direction={1} color="#6ee7ff" />
      <Emitter direction={-1} color="#ff7a85" />
    </group>
  );
}
