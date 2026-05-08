"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { fadeBetween, segment } from "./timeline";

const vertexShader = `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uLength;
  uniform float uSpread;
  uniform float uPointSize;
  uniform float uBlocked;
  attribute float aPhase;
  attribute float aSize;
  varying float vAlpha;

  void main() {
    float phase = fract(aPhase + uTime);
    float x = (phase - 0.5) * uLength;
    float block = smoothstep(0.08, 0.28, x) * uBlocked;
    x = mix(x, 0.06 - (x - 0.06) * 0.28, block);

    vec3 transformed = position;
    transformed.x += x;
    transformed.y *= uSpread;
    transformed.z *= uSpread;
    transformed.y += sin((phase + aPhase) * 6.28318) * 0.018 * uSpread;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPointSize * aSize * (1.0 / max(0.2, -mvPosition.z));

    float life = sin(phase * 3.14159);
    vAlpha = life * uOpacity * (1.0 - block * 0.28);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float disc = smoothstep(0.5, 0.0, length(uv));
    gl_FragColor = vec4(uColor, disc * vAlpha);
  }
`;

type BeamProps = {
  color: string;
  length: number;
  spread: number;
  pointSize?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  blocked?: boolean;
  opacity: (story: number) => number;
};

type FlowPathProps = {
  color: string;
  points: [number, number, number][];
  opacity: (story: number) => number;
  pulseScale?: number;
};

function createBeamGeometry(count: number) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const sizes = new Float32Array(count);

  for (let index = 0; index < count; index++) {
    const i3 = index * 3;
    positions[i3] = 0;
    positions[i3 + 1] = (Math.random() - 0.5) * 0.55;
    positions[i3 + 2] = (Math.random() - 0.5) * 0.26;
    phases[index] = Math.random();
    sizes[index] = 0.65 + Math.random() * 1.2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  return geometry;
}

function ParticleBeam({
  color,
  length,
  spread,
  pointSize = 6.5,
  position,
  rotation = [0, 0, 0],
  blocked = false,
  opacity,
}: BeamProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const points = useRef<THREE.Points>(null);
  const scroll = useScroll();
  const geometry = useMemo(() => createBeamGeometry(120), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uLength: { value: length },
      uSpread: { value: spread },
      uPointSize: { value: pointSize },
      uBlocked: { value: blocked ? 1 : 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [blocked, color, length, pointSize, spread]
  );

  useFrame((state) => {
    if (!material.current || !points.current) return;

    const story = scroll.offset * 7;
    const alpha = opacity(story);

    material.current.uniforms.uTime.value = state.clock.elapsedTime * 0.18;
    material.current.uniforms.uOpacity.value = alpha;
    points.current.visible = alpha > 0.01;
  });

  return (
    <points ref={points} geometry={geometry} position={position} rotation={rotation} visible={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
        toneMapped={false}
      />
    </points>
  );
}

function FlowPath({
  color,
  points,
  opacity,
  pulseScale = 1,
}: FlowPathProps) {
  const line = useRef<THREE.Mesh>(null);
  const lineMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const pulses = useRef<THREE.Mesh[]>([]);
  const scroll = useScroll();

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
      ),
    [points]
  );

  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 72, 0.01, 8, false), [curve]);

  useFrame((state) => {
    const story = scroll.offset * 7;
    const alpha = opacity(story);

    if (line.current && lineMaterial.current) {
      line.current.visible = alpha > 0.01;
      lineMaterial.current.opacity = alpha * 0.55;
    }

    pulses.current.forEach((pulse, index) => {
      const phase = (state.clock.elapsedTime * 0.34 + index * 0.33) % 1;
      const point = curve.getPointAt(phase);
      const material = pulse.material as THREE.MeshBasicMaterial;

      pulse.visible = alpha > 0.02;
      pulse.position.copy(point);
      pulse.scale.setScalar((0.045 + Math.sin(phase * Math.PI) * 0.025) * pulseScale);
      material.opacity = alpha * Math.sin(phase * Math.PI);
    });
  });

  return (
    <group>
      <mesh ref={line} geometry={geometry} visible={false}>
        <meshBasicMaterial
          ref={lineMaterial}
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {Array.from({ length: 3 }).map((_, index) => (
        <mesh
          key={index}
          ref={(element) => {
            if (element) pulses.current[index] = element;
          }}
          visible={false}
        >
          <sphereGeometry args={[1, 18, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function PulseRings() {
  const rings = useRef<THREE.Mesh[]>([]);
  const scroll = useScroll();

  useFrame((state) => {
    const story = scroll.offset * 7;
    const hook = fadeBetween(story, 0, 0.18, 0.88, 1.18);
    const problem = fadeBetween(story, 0.78, 1.12, 1.75, 2.08);
    const proof = fadeBetween(story, 4.85, 5.12, 5.7, 5.95) * 0.5;
    const alpha = Math.max(hook, problem * 0.7, proof);
    const weight = hook + problem + proof || 1;
    const x = (hook * 1.22 + problem * -1.32 + proof * 1.17) / weight;
    const y = (hook * 0.02 + problem * -0.35 + proof * 0) / weight;

    rings.current.forEach((ring, index) => {
      const phase = (state.clock.elapsedTime * 0.22 + index / rings.current.length) % 1;
      const scale = 0.26 + phase * 1.05;
      const material = ring.material as THREE.MeshBasicMaterial;

      ring.visible = alpha > 0.01;
      ring.position.set(x, y, -0.02);
      ring.scale.setScalar(scale);
      material.opacity = Math.sin(phase * Math.PI) * alpha * 0.075;
    });
  });

  return (
    <group>
      {Array.from({ length: 5 }).map((_, index) => (
        <mesh
          key={index}
          ref={(element) => {
            if (element) rings.current[index] = element;
          }}
          visible={false}
        >
          <torusGeometry args={[1, 0.006, 10, 96]} />
          <meshBasicMaterial
            color="#238a9a"
            transparent
            opacity={0}
            blending={THREE.NormalBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function ShieldSheet() {
  const root = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const scroll = useScroll();

  useFrame((state) => {
    const story = scroll.offset * 7;
    const insight = fadeBetween(story, 2.02, 2.35, 3.1, 3.35);
    const how = fadeBetween(story, 3.95, 4.2, 5.02, 5.28);
    const alpha = Math.max(insight * 0.28, how * 0.26);
    const x = how > insight ? -1.25 : 1.2;

    if (root.current && material.current) {
      root.current.visible = alpha > 0.01;
      root.current.position.set(x, 0.02, 0.11);
      root.current.rotation.y = 0;
      root.current.scale.set(0.72, 0.86 + Math.sin(state.clock.elapsedTime * 1.2) * 0.012, 1);
      material.current.opacity = alpha;
    }
  });

  return (
    <mesh ref={root} visible={false}>
      <boxGeometry args={[0.035, 2.55, 1.05]} />
      <meshBasicMaterial
        ref={material}
        color="#27a5b8"
        transparent
        opacity={0}
        blending={THREE.NormalBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function RadiationField() {
  return (
    <group>
      <PulseRings />
      <ShieldSheet />

      <FlowPath
        color="#d85262"
        points={[
          [-1.18, -0.45, 0.18],
          [-1.38, -0.38, 0.42],
          [-1.62, -0.28, 0.28],
        ]}
        opacity={(story) => fadeBetween(story, 0.85, 1.14, 1.78, 2.08) * 0.72}
        pulseScale={0.85}
      />

      <FlowPath
        color="#d85262"
        points={[
          [-1.08, 0.02, 0.18],
          [-1.34, 0.02, 0.36],
          [-1.54, 0.02, 0.18],
        ]}
        opacity={(story) => fadeBetween(story, 3.92, 4.18, 5.0, 5.28) * 0.68}
        pulseScale={0.8}
      />

      <FlowPath
        color="#51b887"
        points={[
          [-1.02, -0.12, 0.1],
          [-0.72, -0.04, 0.34],
          [-0.36, 0.05, 0.12],
        ]}
        opacity={(story) => fadeBetween(story, 3.98, 4.22, 5.08, 5.34) * 0.68}
        pulseScale={0.82}
      />

      <ParticleBeam
        color="#d85262"
        length={1.05}
        spread={0.28}
        pointSize={6.8}
        position={[-1.36, -0.42, 0.18]}
        opacity={(story) => fadeBetween(story, 0.78, 1.12, 1.92, 2.22) * 0.18}
      />

      <ParticleBeam
        color="#238a9a"
        length={1.25}
        spread={0.26}
        position={[1.2, 0.02, 0.12]}
        opacity={(story) => fadeBetween(story, 1.92, 2.32, 3.05, 3.32) * 0.22}
      />
      <ParticleBeam
        color="#238a9a"
        length={1.2}
        spread={0.24}
        position={[1.2, 0.02, 0.12]}
        rotation={[0, 0, Math.PI / 2]}
        opacity={(story) => fadeBetween(story, 1.95, 2.35, 3.08, 3.34) * 0.16}
      />
      <ParticleBeam
        color="#d85262"
        length={1.02}
        spread={0.2}
        position={[-1.48, 0.02, 0.15]}
        rotation={[0, Math.PI, 0]}
        blocked
        opacity={(story) => fadeBetween(story, 3.92, 4.18, 5.0, 5.32) * 0.14}
      />
      <ParticleBeam
        color="#51b887"
        length={1.18}
        spread={0.22}
        position={[-0.86, 0.02, 0.1]}
        opacity={(story) => fadeBetween(story, 4.02, 4.25, 5.08, 5.34) * 0.12}
      />
      <ParticleBeam
        color="#238a9a"
        length={0.92}
        spread={0.16}
        pointSize={5.8}
        position={[1.17, 0, 0.12]}
        opacity={(story) => segment(story, 5.0, 5.34) * (1 - segment(story, 5.54, 5.86)) * 0.16}
      />
    </group>
  );
}
