import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const STEPS = [
  {
    num: 1,
    title: 'Upload Document',
    desc: 'Securely upload PDFs, contracts, or agreements in one click.',
    icon: '📤'
  },
  {
    num: 2,
    title: 'AI Processing',
    desc: 'Intelligent engines chunk, clean, and structure text structures.',
    icon: '⚙️'
  },
  {
    num: 3,
    title: 'RAG Retrieval',
    desc: 'Contextual references matched using semantic embedding databases.',
    icon: '🔍'
  },
  {
    num: 4,
    title: 'LLM Analysis',
    desc: 'Deep inspection of clauses, risks, and compliance points.',
    icon: '🧠'
  },
  {
    num: 5,
    title: 'Simple Explanation',
    desc: 'Clear summaries translating complex jargon to plain English.',
    icon: '💡'
  }
];

function ConnectionLine({ points }) {
  const lineRef = useRef();
  const pulseRef = useRef();

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  }, [points]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    // Animate glowing pulse along the path
    if (pulseRef.current) {
      const progress = (elapsed * 0.15) % 1.0;
      const pos = curve.getPointAt(progress);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* Curved connecting line */}
      <mesh ref={lineRef}>
        <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
        <meshBasicMaterial
          color="#2563EB"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Light pulse traveling along the line */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial
          color="#38BDF8"
          emissive="#38BDF8"
          emissiveIntensity={2.0}
        />
      </mesh>
    </group>
  );
}

function TimelineCard({ step, position, index }) {
  const cardRef = useRef();
  const [hovered, setHovered] = useState(false);
  const targetScale = hovered ? 1.12 : 1.0;

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    if (cardRef.current) {
      // Slow idle float/rotation
      cardRef.current.position.y = position[1] + Math.sin(elapsed * 1.5 + index) * 0.08;
      cardRef.current.rotation.y = Math.sin(elapsed * 0.6 + index) * 0.05;
      cardRef.current.rotation.x = Math.cos(elapsed * 0.4 + index) * 0.03;

      // Smooth hover scaling
      const scale = THREE.MathUtils.lerp(cardRef.current.scale.x, targetScale, 6 * delta);
      cardRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={cardRef} position={position}>
      {/* 3D Glass card backing */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.8, 1.2, 0.05]} />
        <meshPhysicalMaterial
          color={hovered ? "#0f2347" : "#08111F"}
          roughness={0.2}
          metalness={0.1}
          transmission={0.6}
          thickness={0.5}
          clearcoat={0.8}
          ior={1.4}
        />
      </mesh>

      {/* Glow highlight on hover */}
      {hovered && (
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[1.85, 1.25, 0.04]} />
          <meshBasicMaterial
            color="#38BDF8"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* HTML Content Overlay */}
      <Html
        transform
        distanceFactor={2.5}
        position={[0, 0, 0.03]}
        pointerEvents="none"
      >
        <div className={`w-[260px] p-5 select-none rounded-xl border border-white/5 bg-black/40 backdrop-blur-md transition-all duration-300 ${hovered ? 'border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">{step.icon}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full uppercase">Step 0{step.num}</span>
            </div>
          </div>
          <h4 className="text-base font-bold text-white mb-1 tracking-tight">{step.title}</h4>
          <p className="text-xs text-zinc-400 leading-normal">{step.desc}</p>
        </div>
      </Html>
    </group>
  );
}

function TimelineContent() {
  const { width } = useThree((state) => state.viewport);
  const isMobile = width < 7;

  // Compute card positions depending on screen width
  const cardPositions = useMemo(() => {
    if (isMobile) {
      // Vertical layout
      return STEPS.map((_, i) => [0, 2.2 - i * 1.1, 0]);
    } else {
      // Horizontal zig-zag layout
      return [
        [-3.6, 0.6, 0],
        [-1.8, -0.6, 0],
        [0, 0.6, 0],
        [1.8, -0.6, 0],
        [3.6, 0.6, 0]
      ];
    }
  }, [isMobile]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 2]} intensity={1.5} color="#38BDF8" />
      
      {/* Connection Line */}
      <ConnectionLine points={cardPositions} />

      {/* Cards */}
      {STEPS.map((step, idx) => (
        <TimelineCard
          key={step.num}
          step={step}
          position={cardPositions[idx]}
          index={idx}
        />
      ))}

      {/* Bloom Effect */}
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.2} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export function TimelineScene() {
  return (
    <div className="w-full h-[380px] md:h-[450px] relative pointer-events-none">
      {/* Ambient background glows specifically for this scene */}
      <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(37,99,235,0.05) 0%, transparent 70%) pointer-events-none" />
      
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'auto' }}
      >
        <TimelineContent />
      </Canvas>
    </div>
  );
}
