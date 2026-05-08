"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { fadeBetween, segment } from "./timeline";

const SHIELD_URL = "/models/story/shieldProtection.glb";
const TARGET_HEIGHT = 2.1;

type MaterialWithEnv = THREE.Material & {
  envMapIntensity?: number;
};

function cloneMaterial(material: THREE.Material | THREE.Material[]) {
  return Array.isArray(material)
    ? material.map((item) => item.clone())
    : material.clone();
}

export default function HeroShield() {
  const root = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const standardMaterials = useRef<THREE.MeshStandardMaterial[]>([]);

  const scroll = useScroll();
  const gltf = useGLTF(SHIELD_URL);
  const shieldScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useLayoutEffect(() => {
    standardMaterials.current = [];

    shieldScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = false;
      object.receiveShadow = false;

      const cloned = cloneMaterial(object.material);
      object.material = cloned;

      const list = Array.isArray(cloned) ? cloned : [cloned];
      list.forEach((mat) => {
        const tuned = mat as MaterialWithEnv;
        tuned.envMapIntensity = 1.6;

        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.color.set("#0f6e7a");
          mat.emissive.set("#1fa2b0");
          mat.emissiveIntensity = 0.32;
          mat.roughness = 0.28;
          mat.metalness = 0.55;
          mat.transparent = true;
          mat.opacity = 0;
          mat.depthWrite = false;
          mat.side = THREE.DoubleSide;
          standardMaterials.current.push(mat);
        }
      });
    });

    shieldScene.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(shieldScene);
    const sizeBox = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const tallest = Math.max(sizeBox.x, sizeBox.y, sizeBox.z) || 1;
    const scale = TARGET_HEIGHT / tallest;

    shieldScene.scale.setScalar(scale);
    shieldScene.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale
    );
  }, [shieldScene]);

  useFrame((state) => {
    const story = scroll.offset * 7;
    const time = state.clock.elapsedTime;

    const reveal = fadeBetween(story, 3.45, 4.0, 5.25, 5.65);
    const lock = segment(story, 4.05, 4.55);

    if (root.current) {
      root.current.visible = reveal > 0.005;

      const targetX = -1.18 + lock * 0.04;
      const targetY = 0;
      const targetZ = 0.35 - lock * 0.18;

      root.current.position.set(targetX, targetY, targetZ);
      root.current.rotation.set(
        Math.sin(time * 0.32) * 0.04,
        -0.18 + lock * 0.18 + Math.sin(time * 0.28) * 0.05,
        0
      );
      root.current.scale.setScalar(0.85 + reveal * 0.18);
    }

    if (inner.current) {
      const breath = 1 + Math.sin(time * 0.9) * 0.008;
      inner.current.scale.setScalar(breath);
    }

    standardMaterials.current.forEach((mat) => {
      mat.opacity = reveal * (0.18 + lock * 0.32);
      mat.emissiveIntensity = 0.18 + reveal * 0.35 + lock * 0.25;
    });
  });

  return (
    <group ref={root} visible={false}>
      <group ref={inner}>
        <primitive object={shieldScene} />
      </group>
    </group>
  );
}

useGLTF.preload(SHIELD_URL);
