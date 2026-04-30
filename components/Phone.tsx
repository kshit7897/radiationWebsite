"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useGLTF, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { lerp, range, smoothstep } from "./animation";

const MODEL_URL = "/models/phone.glb";
const MODEL_SCALE = 0.018;

type MaterialWithEnv = THREE.Material & {
  envMapIntensity?: number;
  roughness?: number;
  metalness?: number;
};

function cloneMaterial(material: THREE.Material | THREE.Material[]) {
  return Array.isArray(material)
    ? material.map((item) => item.clone())
    : material.clone();
}

export default function Phone() {
  const root = useRef<THREE.Group>(null!);
  const cover = useRef<THREE.Group>(null!);
  const coverShell = useRef<THREE.MeshStandardMaterial>(null!);
  const shieldPanel = useRef<THREE.MeshStandardMaterial>(null!);
  const shieldGlow = useRef<THREE.MeshBasicMaterial>(null!);
  const coverLight = useRef<THREE.PointLight>(null!);

  const scroll = useScroll();
  const { size } = useThree();
  const gltf = useGLTF(MODEL_URL);

  const phoneScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const responsiveScale = size.width < 720 ? 0.82 : 1;
  const heroOffsetX = size.width < 820 ? 0 : 0.72;

  useLayoutEffect(() => {
    phoneScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.castShadow = true;
      object.receiveShadow = true;
      object.material = cloneMaterial(object.material);

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        const tuned = material as MaterialWithEnv;
        tuned.envMapIntensity = 1.35;

        if (material instanceof THREE.MeshStandardMaterial) {
          const name = material.name.toLowerCase();

          if (name.includes("lense") || name.includes("bezel")) {
            material.roughness = 0.08;
            material.metalness = Math.max(material.metalness, 0.15);
          }

          if (name.includes("alu") || name.includes("material_1")) {
            material.roughness = Math.min(material.roughness, 0.38);
            material.metalness = Math.max(material.metalness, 0.85);
          }
        }

        material.needsUpdate = true;
      });
    });
  }, [phoneScene]);

  useFrame((state) => {
    const t = scroll.offset;
    const time = state.clock.elapsedTime;

    const tIntro = range(t, 0.0, 0.2);
    const tEmission = range(t, 0.22, 0.48);
    const tBodySide = range(t, 0.42, 0.62);
    const tCover = range(t, 0.58, 0.78);
    const tShield = range(t, 0.78, 1.0);

    const intro = smoothstep(tIntro);
    const emission = smoothstep(tEmission);
    const bodySide = smoothstep(tBodySide);
    const coverIn = smoothstep(tCover);
    const shielded = smoothstep(tShield);

    const heroY = -0.5;
    const emissionY = -0.18;
    const sideY = -Math.PI / 2.35;
    const coverY = 0.66;
    const finalY = 0.38;

    let targetY = lerp(heroY, emissionY, intro);
    if (t > 0.22) targetY = lerp(emissionY, sideY, emission);
    if (t > 0.42) targetY = lerp(sideY, coverY, bodySide);
    if (t > 0.78) targetY = lerp(coverY, finalY, shielded);

    const calm = 1 - Math.max(emission * 0.45, shielded * 0.35);
    root.current.rotation.y =
      targetY + Math.sin(time * 0.42) * 0.045 * calm;
    root.current.rotation.x = Math.sin(time * 0.55) * 0.035 * calm;
    root.current.position.x = lerp(heroOffsetX, 0, intro);
    root.current.position.y = Math.sin(time * 0.65) * 0.07 * calm - 0.02;

    cover.current.position.z = lerp(-3.2, -0.12, coverIn);
    cover.current.position.y = lerp(1.55, 0, coverIn);
    cover.current.rotation.z = lerp(-0.35, 0, coverIn);
    cover.current.rotation.x = lerp(0.28, 0, coverIn);

    coverShell.current.emissiveIntensity = 0.05 + shielded * 0.18;
    shieldPanel.current.emissiveIntensity =
      0.16 + coverIn * 0.35 + shielded * 0.5;
    shieldGlow.current.opacity = 0.2 + coverIn * 0.28 + shielded * 0.24;
    coverLight.current.intensity = coverIn * 1.2 + shielded * 1.8;
  });

  return (
    <group ref={root} scale={responsiveScale}>
      <primitive
        object={phoneScene}
        rotation={[Math.PI / 2, 0, 0]}
        scale={MODEL_SCALE}
      />

      <group ref={cover} position={[0, 1.55, -3.2]}>
        <RoundedBox args={[1.56, 2.88, 0.08]} radius={0.24} smoothness={8}>
          <meshStandardMaterial
            ref={coverShell}
            color="#171a23"
            emissive="#102a36"
            emissiveIntensity={0.05}
            metalness={0.72}
            roughness={0.36}
          />
        </RoundedBox>

        <mesh position={[0, 0, 0.043]}>
          <planeGeometry args={[1.36, 2.54]} />
          <meshStandardMaterial
            ref={shieldPanel}
            color="#081017"
            emissive="#27d7ff"
            emissiveIntensity={0.16}
            metalness={0.45}
            roughness={0.52}
            transparent
            opacity={0.82}
          />
        </mesh>

        <mesh position={[0, 0, 0.047]}>
          <ringGeometry args={[0.22, 0.34, 80]} />
          <meshBasicMaterial
            ref={shieldGlow}
            color="#6ee7ff"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[-0.42, 0.95, 0.049]}>
          <boxGeometry args={[0.56, 0.56, 0.01]} />
          <meshStandardMaterial color="#05070c" roughness={0.72} />
        </mesh>

        <pointLight
          ref={coverLight}
          position={[0, 0, 0.28]}
          color="#6ee7ff"
          intensity={0}
          distance={2.8}
        />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
