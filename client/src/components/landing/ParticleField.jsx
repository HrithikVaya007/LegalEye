import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ParticleField({ count = 250, color = "#38BDF8" }) {
  const points = useRef();

  // Initialize random particle vectors
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 25;
      const y = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 15 - 5;
      const speed = 0.05 + Math.random() * 0.1;
      const angle = Math.random() * Math.PI * 2;
      temp.push({ x, y, z, speed, angle });
    }
    return temp;
  }, [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = particles[i].x;
      pos[i * 3 + 1] = particles[i].y;
      pos[i * 3 + 2] = particles[i].z;
    }
    return pos;
  }, [particles, count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    const geo = points.current.geometry;
    const array = geo.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.angle += delta * 0.05;
      
      // Update coordinates
      array[i * 3] += Math.cos(p.angle) * p.speed * delta;
      array[i * 3 + 1] += Math.sin(p.angle) * p.speed * delta * 0.5;

      // Boundary wraps
      if (Math.abs(array[i * 3]) > 15) {
        array[i * 3] = -Math.sign(array[i * 3]) * 14;
      }
      if (Math.abs(array[i * 3 + 1]) > 15) {
        array[i * 3 + 1] = -Math.sign(array[i * 3 + 1]) * 14;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={new THREE.Color(color)}
        size={0.06}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
