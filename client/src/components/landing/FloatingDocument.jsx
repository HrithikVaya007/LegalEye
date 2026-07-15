import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_PARTICLES = 120;
const CANVAS_W = 512;
const CANVAS_H = 768;

export function FloatingDocument({ spherePosition = [2.2, 0.5, 0] }) {
  const documentRef = useRef();
  const scanBeamRef = useRef();
  const canvasRef = useRef(null);
  const textureRef = useRef();

  // Pre-allocated particles to avoid garbage collection overhead
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      arr.push({
        active: false,
        pos: new THREE.Vector3(),
        start: new THREE.Vector3(),
        progress: 0,
        speed: 1,
        curve: new THREE.Vector3(),
      });
    }
    return arr;
  }, []);

  const particlePositions = useMemo(() => new Float32Array(MAX_PARTICLES * 3), []);
  const particleSizes = useMemo(() => new Float32Array(MAX_PARTICLES), []);
  const particlesRef = useRef();

  // Render static document canvas lines
  const textLines = useMemo(() => [
    { type: 'title', text: 'MUTUAL NON-DISCLOSURE AGREEMENT', y: 80 },
    { type: 'subtitle', text: 'Section 1. Confidential Information', y: 150 },
    { type: 'body', text: 'This Agreement governs the sharing of proprietary technology,', y: 190 },
    { type: 'body', text: 'including software architectures, algorithmic designs, and databases.', y: 220 },
    { type: 'highlight', text: '>>> CRITICAL CLAUSE: AI IP ownership rights are fully retained.', y: 250, key: 'ip' },
    
    { type: 'subtitle', text: 'Section 2. Non-Disclosure Obligations', y: 310 },
    { type: 'body', text: 'The receiving party shall protect all confidential items with at least', y: 350 },
    { type: 'body', text: 'a reasonable standard of care, preventing unauthorized extraction.', y: 380 },
    { type: 'highlight', text: '>>> SECURITY STANDARD: AES-256 encryption required at rest.', y: 410, key: 'sec' },

    { type: 'subtitle', text: 'Section 3. Governing Law & Redress', y: 470 },
    { type: 'body', text: 'This agreement is governed by the state laws of Delaware.', y: 510 },
    { type: 'highlight', text: '>>> LIQUIDATED DAMAGES: Automatic $500,000 breach liability.', y: 540, key: 'breach' },
    
    { type: 'subtitle', text: 'Section 4. Term and Destruction', y: 600 },
    { type: 'body', text: 'Upon written notice, all electronic media containing confidential data', y: 640 },
    { type: 'highlight', text: '>>> RETENTION LIMIT: Complete data scrub within 48 hours.', y: 670, key: 'scrub' }
  ], []);

  // Initialize Canvas
  useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    canvasRef.current = canvas;
  }, []);

  // Spawn a particle
  const spawnParticle = (x, y, z) => {
    const p = particles.find((p) => !p.active);
    if (!p) return;

    p.active = true;
    p.start.set(x, y, z);
    p.pos.set(x, y, z);
    p.progress = 0;
    p.speed = 0.5 + Math.random() * 0.7; // Speed of travel
    
    // Add random arch offset for Bezier feel
    p.curve.set(
      (Math.random() - 0.5) * 1.5,
      1.5 + Math.random() * 1.5,
      1.0 + Math.random() * 2.0
    );
  };

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    
    // 1. Natural slow hover/tilt animations
    if (documentRef.current) {
      documentRef.current.position.y = Math.sin(elapsed * 1.2) * 0.08;
      documentRef.current.rotation.y = Math.sin(elapsed * 0.8) * 0.05;
      documentRef.current.rotation.x = Math.cos(elapsed * 0.5) * 0.03;
    }

    // 2. Scan progress (6 second loop: 3.5s scan, 2.5s pause)
    const scanPeriod = 6;
    const scanDuration = 3.5;
    const t = elapsed % scanPeriod;
    let scanVal = 0; // 0 = top, 1 = bottom
    let isScanning = false;

    if (t < scanDuration) {
      isScanning = true;
      scanVal = t / scanDuration;
    }

    const scan3DY = 2.0 - scanVal * 4.0; // Map [0,1] to 3D coords [+2.0, -2.0]

    // Position scan beam mesh
    if (scanBeamRef.current) {
      if (isScanning) {
        scanBeamRef.current.visible = true;
        scanBeamRef.current.position.y = scan3DY;
      } else {
        scanBeamRef.current.visible = false;
      }
    }

    // 3. Render dynamic texture
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      grad.addColorStop(0, '#0a1221');
      grad.addColorStop(1, '#050a12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Glass panel border
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, CANVAS_W - 6, CANVAS_H - 6);

      // Draw all text lines
      textLines.forEach((line) => {
        // Calculate if this text line has been scanned
        const line3DY = 2.0 - (line.y / CANVAS_H) * 4.0;
        const dist = scan3DY - line3DY;
        
        // Glow if scanned or scanning passes over it
        const isHighlighted = line.type === 'highlight';
        const isPassed = isScanning && dist < 0; // scan has passed this Y position
        const isNear = isScanning && Math.abs(dist) < 0.2;

        if (isHighlighted) {
          if (isNear) {
            // Actively scanning this highlighted clause
            ctx.fillStyle = '#38BDF8'; // Glowing cyan
            ctx.shadowColor = '#38BDF8';
            ctx.shadowBlur = 15;
            
            // Spawn particles along this horizontal line
            if (Math.random() < 0.3) {
              const spawnX = (Math.random() - 0.5) * 2.4;
              spawnParticle(spawnX, line3DY, 0.05);
            }
          } else if (isPassed) {
            // Already scanned highlight
            ctx.fillStyle = '#60A5FA'; // Calm blue
            ctx.shadowColor = '#2563EB';
            ctx.shadowBlur = 8;
          } else {
            // Not yet scanned highlight
            ctx.fillStyle = '#1E3A8A'; // Dim navy
            ctx.shadowBlur = 0;
          }
          ctx.font = 'bold 16px monospace';
        } else {
          // Standard text
          if (isPassed) {
            ctx.fillStyle = '#F1F5F9';
          } else {
            ctx.fillStyle = '#475569';
          }
          ctx.shadowBlur = 0;
          ctx.font = line.type === 'title' ? 'bold 18px sans-serif' : 
                     line.type === 'subtitle' ? 'bold 15px sans-serif' : '13px sans-serif';
        }

        ctx.fillText(line.text, 35, line.y);
        ctx.shadowBlur = 0; // Reset shadow
      });

      // Notify Three.js to re-upload texture
      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }
    }

    // 4. Update Particle positions
    const posAttr = particlesRef.current?.geometry.attributes.position;
    const sizeAttr = particlesRef.current?.geometry.attributes.aSize;

    if (posAttr && sizeAttr) {
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particles[i];
        if (p.active) {
          p.progress += delta * p.speed;
          
          if (p.progress >= 1.0) {
            p.active = false;
            particleSizes[i] = 0;
          } else {
            // Cubic bezier/arc interpolation from start to target (sphere position)
            const targetVec = new THREE.Vector3(...spherePosition);
            
            // Direct LERP path
            const currentPos = new THREE.Vector3().lerpVectors(p.start, targetVec, p.progress);
            
            // Add arc curve offset
            const arcFactor = Math.sin(p.progress * Math.PI);
            currentPos.y += p.curve.y * arcFactor;
            currentPos.z += p.curve.z * arcFactor;
            currentPos.x += p.curve.x * arcFactor;

            p.pos.copy(currentPos);
            particleSizes[i] = (1.0 - p.progress) * 8.0; // Shrink as they approach sphere
          }
        } else {
          particleSizes[i] = 0;
        }

        particlePositions[i * 3] = p.pos.x;
        particlePositions[i * 3 + 1] = p.pos.y;
        particlePositions[i * 3 + 2] = p.pos.z;
      }

      posAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={documentRef} castShadow receiveShadow>
      {/* 3D Glass Document Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 4.2, 0.08]} />
        <meshPhysicalMaterial
          color="#08111F"
          roughness={0.15}
          metalness={0.1}
          transmission={0.5}
          thickness={1.2}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          ior={1.5}
        />
      </mesh>

      {/* Front Face Text Layer */}
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[2.92, 4.12]} />
        {canvasRef.current && (
          <meshBasicMaterial transparent={true} opacity={0.95}>
            <canvasTexture
              ref={textureRef}
              attach="map"
              args={[canvasRef.current]}
              encoding={THREE.SRGBColorSpace}
            />
          </meshBasicMaterial>
        )}
      </mesh>

      {/* Glowing Scan Line Beam */}
      <mesh ref={scanBeamRef} position={[0, 0, 0.045]}>
        <planeGeometry args={[2.92, 0.04]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Tiny Scanning energy particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-aSize"
            args={[particleSizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#38BDF8"
          size={0.06}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
