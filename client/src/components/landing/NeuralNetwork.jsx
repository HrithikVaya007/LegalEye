import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function NetworkNodes() {
  const pointsRef = useRef();
  const linesRef = useRef();
  const coreRef = useRef();

  const nodeCount = 100;
  const maxDistance = 1.6;
  const maxDistanceSq = maxDistance * maxDistance;

  // Initialize random velocity/position vectors for the nodes
  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < nodeCount; i++) {
      // Spherical distribution around the core
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.0 + Math.random() * 2.2; // radius between 1 and 3.2

      arr.push({
        pos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        // Orbit speed & axis
        speed: 0.1 + Math.random() * 0.2,
        axis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
        phase: Math.random() * Math.PI * 2
      });
    }
    return arr;
  }, []);

  const pointPositions = useMemo(() => new Float32Array(nodeCount * 3), []);
  const linePositions = useMemo(() => new Float32Array(nodeCount * nodeCount * 6), []);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    // 1. Rotate & pulse core
    if (coreRef.current) {
      coreRef.current.rotation.y = elapsed * 0.4;
      const scale = 1.0 + Math.sin(elapsed * 3) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }

    // 2. Animate nodes orbiting around center
    nodes.forEach((node, i) => {
      // Rotate node positions slowly around their custom axes
      node.pos.applyAxisAngle(node.axis, node.speed * delta);
      
      // Add a subtle breathing drift
      const drift = 1 + Math.sin(elapsed * 1.5 + node.phase) * 0.001;
      node.pos.multiplyScalar(drift);

      pointPositions[i * 3] = node.pos.x;
      pointPositions[i * 3 + 1] = node.pos.y;
      pointPositions[i * 3 + 2] = node.pos.z;
    });

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Compute dynamic connections based on distance
    let lineIdx = 0;
    for (let i = 0; i < nodeCount; i++) {
      const n1 = nodes[i];
      for (let j = i + 1; j < nodeCount; j++) {
        const n2 = nodes[j];
        const distSq = n1.pos.distanceToSquared(n2.pos);

        if (distSq < maxDistanceSq) {
          linePositions[lineIdx * 6] = n1.pos.x;
          linePositions[lineIdx * 6 + 1] = n1.pos.y;
          linePositions[lineIdx * 6 + 2] = n1.pos.z;
          linePositions[lineIdx * 6 + 3] = n2.pos.x;
          linePositions[lineIdx * 6 + 4] = n2.pos.y;
          linePositions[lineIdx * 6 + 5] = n2.pos.z;
          lineIdx++;
        }
      }
    }

    if (linesRef.current) {
      linesRef.current.geometry.attributes.position.needsUpdate = true;
      // Set draw range to only render active lines
      linesRef.current.geometry.setDrawRange(0, lineIdx * 2);
    }
  });

  return (
    <group>
      {/* Central Pulsing AI Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshPhysicalMaterial
          color="#1E3A8A"
          emissive="#06B6D4"
          emissiveIntensity={1.8}
          roughness={0.1}
          transmission={0.8}
          thickness={0.5}
        />
      </mesh>

      {/* Network Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#38BDF8"
          size={0.07}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connection Lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#2563EB"
          transparent={true}
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export function NeuralNetwork() {
  return (
    <div className="w-full h-full min-h-[350px] relative pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'auto' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 4]} intensity={1.5} color="#38BDF8" />
        
        <NetworkNodes />

        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.1} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
