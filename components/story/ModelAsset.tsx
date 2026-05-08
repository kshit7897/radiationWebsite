"use client";

import { forwardRef, useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type ModelVariant = "phone" | "human" | "case" | "arrow";

type ModelAssetProps = {
  url: string;
  fit: number;
  variant: ModelVariant;
  tint?: string;
  opacity?: number;
  rotation?: [number, number, number];
};

type MaterialTune = THREE.Material & {
  envMapIntensity?: number;
  roughness?: number;
  metalness?: number;
  color?: THREE.Color;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
  wireframe?: boolean;
};

function cloneMaterial(material: THREE.Material | THREE.Material[]) {
  return Array.isArray(material)
    ? material.map((item) => item.clone())
    : material.clone();
}

function tuneMaterial(
  material: THREE.Material,
  variant: ModelVariant,
  tint?: string,
  opacity = 1,
  materialIndex = 0
) {
  const tuned = material as MaterialTune;
  tuned.envMapIntensity = variant === "phone" ? 1.5 : 1.15;

  if (material instanceof THREE.MeshStandardMaterial) {
    if (variant === "phone") {
      material.roughness = Math.min(material.roughness, 0.42);
      material.metalness = Math.max(material.metalness, 0.55);
    }

    if (variant === "human") {
      material.color.set("#2d4150");
      material.emissive.set("#1fa2b0");
      material.emissiveIntensity = 0.22;
      material.roughness = 0.78;
      material.metalness = 0.05;
      material.wireframe = true;
      material.transparent = true;
      material.opacity = opacity;
      material.depthWrite = false;
      material.side = THREE.DoubleSide;
    }

    if (variant === "case") {
      const isInner = materialIndex > 0 || material.name.toLowerCase().includes("1");
      material.color.set(isInner ? "#0f6e7a" : "#0a1620");
      material.emissive.set(isInner ? "#1fa2b0" : "#33454f");
      material.emissiveIntensity = isInner ? 0.22 : 0.04;
      material.roughness = isInner ? 0.32 : 0.26;
      material.metalness = isInner ? 0.5 : 0.78;
    }

    if (variant === "arrow") {
      material.color.set(tint ?? "#1fa2b0");
      material.emissive.set(tint ?? "#1fa2b0");
      material.emissiveIntensity = 0.95;
      material.roughness = 0.32;
      material.metalness = 0.25;
      material.transparent = true;
      material.opacity = opacity;
      material.depthWrite = false;
    }
  }

  material.needsUpdate = true;
}

const ModelAsset = forwardRef<THREE.Group, ModelAssetProps>(function ModelAsset(
  { url, fit, variant, tint, opacity, rotation },
  ref
) {
  const gltf = useGLTF(url);

  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.castShadow = true;
      object.receiveShadow = true;
      object.material = cloneMaterial(object.material);

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material, index) =>
        tuneMaterial(material, variant, tint, opacity, index)
      );
    });

    scene.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = fit / maxDimension;

    scene.scale.setScalar(scale);
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [fit, opacity, scene, tint, variant]);

  return (
    <group ref={ref} rotation={rotation}>
      <primitive object={scene} />
    </group>
  );
});

export default ModelAsset;
