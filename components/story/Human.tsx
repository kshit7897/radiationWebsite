"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { fadeBetween, sampleNumber, sampleTriple, segment } from "./timeline";

const HUMAN_URL = "/models/story/human.glb";
const TARGET_HEIGHT = 2.55;

const POSITIONS = [
  { at: 0, value: [-1.72, -1.42, -0.6] },
  { at: 1.15, value: [-1.7, -1.42, -0.5] },
  { at: 2.3, value: [-1.62, -1.42, -0.45] },
  { at: 4.25, value: [-1.55, -1.42, -0.4] },
  { at: 5.35, value: [-1.5, -1.42, -0.35] },
  { at: 6.4, value: [-1.42, -1.42, -0.3] },
  { at: 7, value: [-1.42, -1.42, -0.3] },
] as const;

const ROTATIONS = [
  { at: 0, value: 0.26 },
  { at: 1.15, value: 0.22 },
  { at: 4.25, value: 0.18 },
  { at: 6.4, value: 0.14 },
  { at: 7, value: 0.14 },
] as const;

type MaterialWithEnv = THREE.Material & {
  envMapIntensity?: number;
};

function cloneMaterial(material: THREE.Material | THREE.Material[]) {
  return Array.isArray(material)
    ? material.map((item) => item.clone())
    : material.clone();
}

export default function Human() {
  const root = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const heatRef = useRef<THREE.Mesh>(null);
  const heatMat = useRef<THREE.MeshBasicMaterial>(null);
  const standardMaterials = useRef<THREE.MeshStandardMaterial[]>([]);

  const scroll = useScroll();
  const gltf = useGLTF(HUMAN_URL);
  const humanScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useLayoutEffect(() => {
    standardMaterials.current = [];

    humanScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = false;
      object.receiveShadow = true;

      const cloned = cloneMaterial(object.material);
      object.material = cloned;

      const list = Array.isArray(cloned) ? cloned : [cloned];
      list.forEach((mat) => {
        const tuned = mat as MaterialWithEnv;
        tuned.envMapIntensity = 0.9;

        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.color.set("#2c8a9b");
          mat.emissive.set("#cbeef3");
          mat.emissiveIntensity = 0.18;
          mat.roughness = 0.78;
          mat.metalness = 0.05;
          mat.transparent = true;
          mat.opacity = 0;
          mat.depthWrite = false;
          mat.side = THREE.DoubleSide;
          standardMaterials.current.push(mat);
        }
      });
    });

    humanScene.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(humanScene);
    const sizeBox = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const tallest = sizeBox.y || 1;
    const scale = TARGET_HEIGHT / tallest;

    humanScene.scale.setScalar(scale);
    humanScene.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale
    );
  }, [humanScene]);

  useFrame((state) => {
    const story = scroll.offset * 7;
    const time = state.clock.elapsedTime;

    const problem = fadeBetween(story, 0.72, 1.08, 2.04, 2.36);
    const how = fadeBetween(story, 3.82, 4.16, 5.12, 5.42);
    const calm = fadeBetween(story, 5.78, 6.18, 6.85, 7.05);
    const presence = Math.max(problem, how * 0.85, calm * 0.5);

    const heat =
      segment(story, 0.92, 1.25) * (1 - segment(story, 1.78, 2.18));
    const shielded =
      segment(story, 4.1, 4.78) * (1 - segment(story, 5.0, 5.38));

    if (root.current) {
      root.current.visible = presence > 0.005;

      const [x, y, z] = sampleTriple(story, POSITIONS);
      const yaw = sampleNumber(story, ROTATIONS);
      const sway = Math.sin(time * 0.28) * 0.025;

      root.current.position.set(x, y, z);
      root.current.rotation.set(0.02, yaw + sway, 0);
    }

    if (inner.current) {
      const breath = 1 + Math.sin(time * 0.95) * 0.004;
      inner.current.scale.setScalar(breath);
    }

    standardMaterials.current.forEach((mat) => {
      mat.opacity = presence * (0.42 + problem * 0.4 + how * 0.25);
      mat.emissiveIntensity =
        0.16 + problem * 0.2 + how * 0.18 + shielded * 0.12;
    });

    if (heatRef.current && heatMat.current) {
      const pulse = 0.85 + Math.sin(time * 2.4) * 0.12;
      heatRef.current.scale.setScalar(pulse);
      heatMat.current.opacity =
        presence * Math.max(heat * 0.55, shielded * 0.18);
    }
  });

  return (
    <group ref={root} visible={false}>
      <group ref={inner}>
        <primitive object={humanScene} />
        <mesh ref={heatRef} position={[0.32, 0.95, 0.18]}>
          <sphereGeometry args={[0.22, 28, 22]} />
          <meshBasicMaterial
            ref={heatMat}
            color="#ff5f74"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload(HUMAN_URL);
