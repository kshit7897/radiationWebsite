"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { fadeBetween, segment } from "./timeline";

function makeLineGeometry(points: [number, number, number][]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  return geometry;
}

export default function Human() {
  const root = useRef<THREE.Group>(null);
  const spineObjectRef = useRef<THREE.Line>(null);
  const hipObjectRef = useRef<THREE.Line>(null);
  const bodyMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const pocketMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const heatMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const scroll = useScroll();

  const spineLine = useMemo(
    () =>
      makeLineGeometry([
        [0, 1.05, 0.08],
        [0.04, 0.55, 0.12],
        [-0.02, 0.08, 0.13],
        [-0.08, -0.52, 0.1],
      ]),
    []
  );

  const hipLine = useMemo(
    () =>
      makeLineGeometry([
        [-0.38, -0.58, 0.12],
        [-0.04, -0.68, 0.14],
        [0.34, -0.6, 0.1],
      ]),
    []
  );
  const spineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#287f91",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );
  const hipMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#287f91",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );
  const spineObject = useMemo(
    () => new THREE.Line(spineLine, spineMaterial),
    [spineLine, spineMaterial]
  );
  const hipObject = useMemo(
    () => new THREE.Line(hipLine, hipMaterial),
    [hipLine, hipMaterial]
  );

  useFrame((state) => {
    const story = scroll.offset * 7;
    const problem = fadeBetween(story, 0.72, 1.08, 2.04, 2.36);
    const how = fadeBetween(story, 3.82, 4.16, 5.12, 5.42);
    const calm = fadeBetween(story, 5.78, 6.18, 6.8, 7.1);
    const presence = Math.max(problem, how * 0.78, calm * 0.42);
    const heat = segment(story, 0.88, 1.22) * (1 - segment(story, 1.78, 2.15));
    const shielded = segment(story, 4.08, 4.78) * (1 - segment(story, 5.0, 5.38));

    if (root.current) {
      root.current.visible = presence > 0.01;
      root.current.position.set(-1.72, -0.1, -0.42);
      root.current.rotation.set(0.02, 0.34 + Math.sin(state.clock.elapsedTime * 0.35) * 0.025, 0);
      root.current.scale.setScalar(0.82);
    }

    if (bodyMaterial.current) {
      bodyMaterial.current.opacity = 0.09 + presence * 0.18;
      bodyMaterial.current.transmission = 0.25 + presence * 0.2;
    }

    if (pocketMaterial.current) {
      pocketMaterial.current.opacity = 0.12 + problem * 0.28 + how * 0.18;
      pocketMaterial.current.emissiveIntensity = 0.04 + shielded * 0.12;
    }

    const currentSpineMaterial = spineObjectRef.current?.material as
      | THREE.LineBasicMaterial
      | undefined;
    const currentHipMaterial = hipObjectRef.current?.material as
      | THREE.LineBasicMaterial
      | undefined;

    if (currentSpineMaterial) currentSpineMaterial.opacity = presence * 0.42;
    if (currentHipMaterial) currentHipMaterial.opacity = presence * 0.3;

    if (heatMaterial.current) {
      heatMaterial.current.opacity = Math.max(heat * 0.28, shielded * 0.11);
    }
  });

  return (
    <group ref={root} visible={false}>
      <RoundedBox args={[0.72, 2.35, 0.2]} radius={0.34} smoothness={18}>
        <meshPhysicalMaterial
          ref={bodyMaterial}
          color="#8fd8e3"
          roughness={0.2}
          metalness={0}
          transmission={0.35}
          thickness={0.75}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </RoundedBox>

      <group position={[0.04, -0.48, 0.14]} rotation={[0, 0, -0.04]}>
        <RoundedBox args={[0.64, 0.78, 0.045]} radius={0.08} smoothness={10}>
          <meshStandardMaterial
            ref={pocketMaterial}
            color="#d7eef2"
            emissive="#8fe0d3"
            emissiveIntensity={0.05}
            roughness={0.62}
            metalness={0}
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </RoundedBox>
      </group>

      <mesh position={[0.15, -0.44, 0.19]}>
        <sphereGeometry args={[0.25, 32, 18]} />
        <meshBasicMaterial
          ref={heatMaterial}
          color="#d85262"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <primitive ref={spineObjectRef} object={spineObject} />
      <primitive ref={hipObjectRef} object={hipObject} />

      <mesh position={[-0.42, -0.42, 0.13]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.08, 0.8, 8, 18]} />
        <meshBasicMaterial color="#6abed0" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}
