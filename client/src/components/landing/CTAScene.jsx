import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ExtrudeGeometry, Shape } from 'three';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Link } from 'react-router-dom';

function MorphingLogo() {
  const sphereRef = useRef();
  const shieldRef = useRef();
  const ringRef = useRef();
  
  const [hovered, setHovered] = useState(false);

  // Extrude options to create shield depth
  const extrudeSettings = useMemo(() => ({
    depth: 0.15,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04
  }), []);

  // 2D Shape definition for the LegalEye Shield
  const shieldShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.8);
    // Draw top curved edge
    s.quadraticCurveTo(0.6, 0.8, 0.6, 0.2);
    // Draw side curve to bottom point
    s.quadraticCurveTo(0.6, -0.3, 0, -0.9);
    s.quadraticCurveTo(-0.6, -0.3, -0.6, 0.2);
    s.quadraticCurveTo(-0.6, 0.8, 0, 0.8);
    return s;
  }, []);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    
    // Smooth transition factors
    const targetScaleSphere = hovered ? 0.0 : 1.0;
    const targetScaleShield = hovered ? 1.05 : 0.0;
    const targetScaleRing = hovered ? 1.3 : 0.9;

    if (sphereRef.current) {
      const s = THREE.MathUtils.lerp(sphereRef.current.scale.x, targetScaleSphere, 6 * delta);
      sphereRef.current.scale.set(s, s, s);
      sphereRef.current.rotation.y = elapsed * 1.5;
    }

    if (shieldRef.current) {
      const s = THREE.MathUtils.lerp(shieldRef.current.scale.x, targetScaleShield, 6 * delta);
      shieldRef.current.scale.set(s, s, s);
      // Gentle floating/rotating on shield logo
      shieldRef.current.rotation.y = elapsed * 0.4 + Math.sin(elapsed * 1.5) * 0.1;
      shieldRef.current.rotation.x = Math.cos(elapsed * 0.5) * 0.08;
    }

    if (ringRef.current) {
      const s = THREE.MathUtils.lerp(ringRef.current.scale.x, targetScaleRing, 5 * delta);
      ringRef.current.scale.set(s, s, s);
      ringRef.current.rotation.z = -elapsed * 0.5;
      ringRef.current.material.opacity = hovered ? 0.9 : 0.4;
    }
  });

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[0, 0.1, 0]}
    >
      {/* 1. Normal State AI Sphere (Active when NOT hovered) */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial
          color="#1e3a8a"
          emissive="#38bdf8"
          emissiveIntensity={1.5}
          roughness={0.1}
          transmission={0.8}
          thickness={0.5}
        />
      </mesh>

      {/* 2. Hover State LegalEye Shield Logo (Morphs in when hovered) */}
      <mesh ref={shieldRef} scale={[0, 0, 0]}>
        <extrudeGeometry args={[shieldShape, extrudeSettings]} />
        <meshPhysicalMaterial
          color="#08111F"
          emissive="#2563EB"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.3}
          transmission={0.6}
          thickness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          ior={1.6}
        />
      </mesh>

      {/* Glowing inner Eye core for the Shield */}
      {hovered && (
        <mesh position={[0, 0, 0.12]} scale={[0.15, 0.15, 0.15]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      )}

      {/* 3. Outer Glowing Data Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, 0, -0.05]}>
        <torusGeometry args={[0.7, 0.02, 16, 100]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Expanded ambient light bleed on hover */}
      <pointLight
        position={[0, 0, 1]}
        intensity={hovered ? 3.0 : 1.2}
        color={hovered ? "#38BDF8" : "#2563EB"}
      />
    </group>
  );
}

export function CTAScene() {
  const [clickScale, setClickScale] = useState(1);

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto text-center relative px-6">
      
      {/* 3D Morphing Canvas */}
      <div className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] cursor-pointer pointer-events-auto relative z-10 select-none">
        <Canvas camera={{ position: [0, 0, 2.2], fov: 50 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 2, 2]} intensity={1.5} color="#38BDF8" />
          <directionalLight position={[-3, 3, -1]} intensity={0.8} color="#2563EB" />
          
          <MorphingLogo />
          
          <EffectComposer>
            <Bloom intensity={0.8} luminanceThreshold={0.2} mipmapBlur />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Heading */}
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 -mt-4 relative z-10">
        Ready to modernize your legal workflow?
      </h2>
      <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mb-8 relative z-10 leading-relaxed">
        Hover above to interface with our analysis node. Click below to begin extracting insights and summaries from your compliance files.
      </p>

      {/* Floating Glass Button with Satisfying Click Scale */}
      <Link
        to="/register"
        className="relative group pointer-events-auto z-10"
        onMouseDown={() => setClickScale(0.96)}
        onMouseUp={() => setClickScale(1)}
        onMouseLeave={() => setClickScale(1)}
        style={{
          transform: `scale(${clickScale})`,
          transition: 'transform 0.1s ease'
        }}
      >
        {/* Soft Background Glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 opacity-70 blur-lg group-hover:opacity-100 group-hover:blur-xl transition-all duration-300 pointer-events-none" />
        
        {/* Button body */}
        <button className="relative px-8 py-4 rounded-full border border-white/20 bg-black/60 backdrop-blur-xl text-white font-semibold text-sm tracking-wide transition-all duration-300 group-hover:border-cyan-400/40 group-hover:bg-black/40 shadow-2xl flex items-center gap-3 select-none">
          <span>Start Understanding Your Legal Documents</span>
          <span className="group-hover:translate-x-1 transition-transform">➡️</span>
        </button>
      </Link>
    </div>
  );
}
