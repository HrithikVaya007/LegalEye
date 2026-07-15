import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { FloatingDocument } from './FloatingDocument';
import { AISphere } from './AISphere';
import { ParticleField } from './ParticleField';

function SceneContent({ scrollY = 0 }) {
  const docGroup = useRef();
  const sphereGroup = useRef();
  const lightRef = useRef();

  useFrame((state, delta) => {
    // 1. Mouse Interaction (Pointer values range from -1 to 1)
    const px = state.pointer.x;
    const py = state.pointer.y;

    // Tilt the document based on cursor
    if (docGroup.current) {
      docGroup.current.rotation.y = THREE.MathUtils.lerp(docGroup.current.rotation.y, px * 0.15, 4 * delta);
      docGroup.current.rotation.x = THREE.MathUtils.lerp(docGroup.current.rotation.x, -py * 0.15, 4 * delta);
    }

    // AI sphere tracks cursor
    if (sphereGroup.current) {
      sphereGroup.current.position.x = THREE.MathUtils.lerp(sphereGroup.current.position.x, 2.2 + px * 0.25, 4 * delta);
      sphereGroup.current.position.y = THREE.MathUtils.lerp(sphereGroup.current.position.y, 0.3 + py * 0.25, 4 * delta);
    }

    // Shift point light based on pointer
    if (lightRef.current) {
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, px * 5, 2 * delta);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, py * 5 + 2, 2 * delta);
    }

    // 2. Scroll Animation integration (as scroll increases, camera zooms out/down)
    // Map scrollY [0, 800] to camera animations
    const scrollFactor = Math.min(1.0, scrollY / 800); // normalized scroll progress
    
    // Animate camera position
    state.camera.position.z = THREE.MathUtils.lerp(5.5, 8.0, scrollFactor);
    state.camera.position.y = THREE.MathUtils.lerp(0.0, -3.5, scrollFactor);
    state.camera.lookAt(0, -3.5 * scrollFactor, 0);

    // Shrink and fade document slightly on scroll
    if (docGroup.current) {
      const scale = THREE.MathUtils.lerp(1.0, 0.6, scrollFactor);
      docGroup.current.scale.set(scale, scale, scale);
      
      // Move slightly to the background
      docGroup.current.position.z = THREE.MathUtils.lerp(0, -3.0, scrollFactor);
    }

    if (sphereGroup.current) {
      const scale = THREE.MathUtils.lerp(1.0, 0.6, scrollFactor);
      sphereGroup.current.scale.set(scale, scale, scale);
      sphereGroup.current.position.z = THREE.MathUtils.lerp(0, -3.0, scrollFactor);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      
      {/* Dynamic Cursor Reacting Light */}
      <pointLight
        ref={lightRef}
        position={[0, 2, 3]}
        intensity={3.5}
        color="#38BDF8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rim Light for depth */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={1.5}
        color="#2563EB"
      />

      {/* Drifting Ambient Particle Field */}
      <ParticleField count={300} color="#38BDF8" />

      {/* Floating Scene Items */}
      <group position={[-0.8, 0, 0]}>
        {/* Document */}
        <group ref={docGroup}>
          <FloatingDocument spherePosition={[3.0, 0.3, 0]} />
        </group>

        {/* AI Sphere */}
        <group ref={sphereGroup} position={[2.2, 0.3, 0]}>
          <AISphere />
        </group>
      </group>

      {/* Postprocessing Bloom */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function HeroScene({ scrollY = 0 }) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'auto' }}
      >
        <Suspense fallback={null}>
          <SceneContent scrollY={scrollY} />
        </Suspense>
      </Canvas>
    </div>
  );
}
