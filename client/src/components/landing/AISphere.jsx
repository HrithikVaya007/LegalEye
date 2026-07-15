import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function AISphere() {
  const sphereRef = useRef();
  const wireframeRef = useRef();
  const wave1Ref = useRef();
  const wave2Ref = useRef();
  const wave3Ref = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Rotate the outer wireframe shell
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = elapsed * 0.3;
      wireframeRef.current.rotation.x = elapsed * 0.15;
    }

    // Pulse the main sphere scale and glowing intensity
    if (sphereRef.current) {
      const scale = 1 + Math.sin(elapsed * 2.5) * 0.04;
      sphereRef.current.scale.set(scale, scale, scale);
      sphereRef.current.material.emissiveIntensity = 1.2 + Math.sin(elapsed * 4) * 0.3;
    }

    // Animate energy waves
    const animateWave = (wave, delayOffset) => {
      if (wave) {
        const time = (elapsed + delayOffset) % 3; // 3-second cycle
        const progress = time / 3;
        const scale = 1 + progress * 2.5; // grows from 1 to 3.5
        wave.scale.set(scale, scale, scale);
        wave.material.opacity = Math.max(0, (1 - progress) * 0.7);
      }
    };

    animateWave(wave1Ref.current, 0);
    animateWave(wave2Ref.current, 1);
    animateWave(wave3Ref.current, 2);
  });

  return (
    <group>
      {/* Inner Glowing AI Core */}
      <mesh ref={sphereRef} castShadow>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial
          color="#1E40AF"
          emissive="#38BDF8"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.2}
          transmission={0.8}
          thickness={1.2}
          ior={1.45}
        />
      </mesh>

      {/* Orbiting Wireframe Outer Layer */}
      <mesh ref={wireframeRef}>
        <sphereGeometry args={[0.75, 18, 18]} />
        <meshBasicMaterial
          color="#38BDF8"
          wireframe={true}
          transparent={true}
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glowing Outer Halo */}
      <mesh>
        <sphereGeometry args={[0.58, 32, 32]} />
        <meshBasicMaterial
          color="#2563EB"
          transparent={true}
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Expanding Energy Waves (Rings parallel to the document plane) */}
      <mesh ref={wave1Ref} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.6, 0.63, 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent={true}
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={wave2Ref} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.6, 0.63, 64]} />
        <meshBasicMaterial
          color="#2563EB"
          transparent={true}
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={wave3Ref} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.6, 0.63, 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent={true}
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
