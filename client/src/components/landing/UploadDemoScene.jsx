import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function UnfoldingPages({ animState }) {
  const page1Ref = useRef();
  const page2Ref = useRef();
  const page3Ref = useRef();
  const scanBeamRef = useRef();

  // Create page texture canvas helper
  const pageTextures = useMemo(() => {
    const createTextTexture = (title, lines, hasHighlight, isScanned) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 384;
      const ctx = canvas.getContext('2d');

      // Page background (dark slate/navy paper)
      ctx.fillStyle = '#0b1329';
      ctx.fillRect(0, 0, 256, 384);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 252, 380);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(title, 20, 30);

      // Draw text lines
      lines.forEach((line, idx) => {
        const y = 60 + idx * 25;
        const isLineHighlight = hasHighlight && idx === 3;
        
        if (isLineHighlight) {
          if (isScanned) {
            ctx.fillStyle = '#38BDF8';
            ctx.shadowColor = '#38BDF8';
            ctx.shadowBlur = 8;
          } else {
            ctx.fillStyle = '#1e293b';
            ctx.shadowBlur = 0;
          }
          ctx.font = 'bold 9px monospace';
        } else {
          ctx.fillStyle = '#475569';
          ctx.shadowBlur = 0;
          ctx.font = '8px sans-serif';
        }
        ctx.fillText(line, 20, y);
        ctx.shadowBlur = 0;
      });

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    return {
      p1: createTextTexture('CONTRACT AGREEMENT', [
        'MEMORANDUM OF UNDERSTANDING',
        'Effective Date: July 15, 2026',
        'Between LegalEye Corp and Clients',
        '>>> SCAN OBJECT: INTELLECTUAL PROPERTY',
        'All designs, algorithms, code structures',
        'and system designs are fully owned by...'
      ], true, animState >= 3), // Scanned when scan starts
      p2: createTextTexture('PAGE 2 - LIMITS', [
        'SECTION 4. REMEDIES & FINES',
        'In the event of disclosure of records,',
        'liquidated damages apply instantly.',
        '>>> SCAN OBJECT: $500,000 LIABILITY',
        'Subject to maximum enforcement penalties',
        'allowed by federal and state courts.'
      ], true, animState >= 4),
      p3: createTextTexture('PAGE 3 - JURISDICTION', [
        'SECTION 9. GOVERNING STATUTES',
        'This agreement is governed by the',
        'laws and provisions of Delaware, USA.',
        '>>> SCAN OBJECT: DELAWARE LAW',
        'Both parties consent to personal jurisdiction',
        'and venue in state and federal courts.'
      ], true, animState >= 5)
    };
  }, [animState]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    // 1. Position pages based on animState
    // animState 0: Hidden/Upload (stacked together)
    // animState 1: Unfolding (separating)
    // animState 2+: Fully Unfolded & Floating
    let unfoldProgress = 0;
    if (animState === 1) {
      unfoldProgress = 0.5; // mid separate
    } else if (animState >= 2) {
      unfoldProgress = 1.0; // fully separate
    }

    const floatOffset = Math.sin(elapsed * 2) * 0.05;

    if (page1Ref.current && page2Ref.current && page3Ref.current) {
      // Left Page (folds left)
      page1Ref.current.position.x = THREE.MathUtils.lerp(page1Ref.current.position.x, -1.15 * unfoldProgress, 4 * delta);
      page1Ref.current.position.z = THREE.MathUtils.lerp(page1Ref.current.position.z, 0.1 * unfoldProgress, 4 * delta);
      page1Ref.current.rotation.y = THREE.MathUtils.lerp(page1Ref.current.rotation.y, 0.25 * unfoldProgress, 4 * delta);
      page1Ref.current.position.y = floatOffset * 0.5;

      // Center Page (stays center, lifts slightly)
      page2Ref.current.position.y = floatOffset;
      page2Ref.current.position.z = THREE.MathUtils.lerp(page2Ref.current.position.z, 0, 4 * delta);

      // Right Page (folds right)
      page3Ref.current.position.x = THREE.MathUtils.lerp(page3Ref.current.position.x, 1.15 * unfoldProgress, 4 * delta);
      page3Ref.current.position.z = THREE.MathUtils.lerp(page3Ref.current.position.z, 0.1 * unfoldProgress, 4 * delta);
      page3Ref.current.rotation.y = THREE.MathUtils.lerp(page3Ref.current.rotation.y, -0.25 * unfoldProgress, 4 * delta);
      page3Ref.current.position.y = floatOffset * -0.3;
    }

    // 2. Scan laser sweep (animState 3)
    if (scanBeamRef.current) {
      if (animState === 3) {
        scanBeamRef.current.visible = true;
        // Sweep laser down
        const sweepProgress = (elapsed % 3) / 3;
        scanBeamRef.current.position.y = 1.4 - sweepProgress * 2.8;
      } else {
        scanBeamRef.current.visible = false;
      }
    }
  });

  return (
    <group position={[0, -0.1, 0]}>
      {/* Laser Scan Beam */}
      <mesh ref={scanBeamRef} position={[0, 0, 0.15]}>
        <planeGeometry args={[3.2, 0.05]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Page 1 (Left) */}
      <mesh ref={page1Ref}>
        <planeGeometry args={[1.0, 1.5]} />
        <meshBasicMaterial map={pageTextures.p1} side={THREE.DoubleSide} />
      </mesh>

      {/* Page 2 (Center) */}
      <mesh ref={page2Ref}>
        <planeGeometry args={[1.0, 1.5]} />
        <meshBasicMaterial map={pageTextures.p2} side={THREE.DoubleSide} />
      </mesh>

      {/* Page 3 (Right) */}
      <mesh ref={page3Ref}>
        <planeGeometry args={[1.0, 1.5]} />
        <meshBasicMaterial map={pageTextures.p3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function UploadDemoScene() {
  const [animState, setAnimState] = useState(0); // 0: upload, 1: unfold, 2: scan-wait, 3: scan-beam, 4: summaries, 5: chat-bubble, 6: reset
  const [chatStep, setChatStep] = useState(0);

  // Animation timeline triggers
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimState(1), 2000);  // Unfold pages after 2s
    const timer2 = setTimeout(() => setAnimState(2), 4000);  // Complete unfold
    const timer3 = setTimeout(() => setAnimState(3), 5500);  // Sweep scan laser
    const timer4 = setTimeout(() => setAnimState(4), 8500);  // Slide in summary cards
    const timer5 = setTimeout(() => {
      setAnimState(5);
      setChatStep(1); // User chat bubble
    }, 11000);
    const timer6 = setTimeout(() => setChatStep(2), 13000); // AI chat response bubble
    
    const loopDuration = 16000;
    const interval = setInterval(() => {
      // Reset loop
      setAnimState(0);
      setChatStep(0);
      setTimeout(() => setAnimState(1), 2000);
      setTimeout(() => setAnimState(2), 4000);
      setTimeout(() => setAnimState(3), 5500);
      setTimeout(() => setAnimState(4), 8500);
      setTimeout(() => {
        setAnimState(5);
        setChatStep(1);
      }, 11000);
      setTimeout(() => setChatStep(2), 13000);
    }, loopDuration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto px-6 py-12">
      {/* Left side: R3F Canvas Unfolding Pages */}
      <div className="w-full h-[400px] border border-white/5 bg-navy/20 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-2xl glass-panel">
        
        {/* Upload overlay initially */}
        {animState === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-500">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 animate-bounce">
              <span className="text-2xl text-cyan-400">📄</span>
            </div>
            <p className="text-zinc-200 font-semibold text-lg">Drop NDA contract here</p>
            <p className="text-zinc-500 text-xs mt-1">PDF, DOCX up to 25MB</p>
          </div>
        )}

        <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 3, 2]} intensity={1.5} color="#38BDF8" />
          
          {animState > 0 && <UnfoldingPages animState={animState} />}

          <EffectComposer>
            <Bloom intensity={0.8} luminanceThreshold={0.15} mipmapBlur />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Right side: Interactive Summary & Chat feed */}
      <div className="h-[400px] flex flex-col justify-between p-6 rounded-3xl border border-white/5 bg-black/30 backdrop-blur-md relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-sm font-semibold tracking-wider text-zinc-300">ANALYSIS ENGINE</span>
          </div>
          <span className="text-xs text-zinc-500">NDA_Agreement_Final.pdf</span>
        </div>

        {/* Dynamic Center Panel */}
        <div className="flex-1 my-4 flex flex-col gap-4 overflow-y-auto scrollbar-none justify-center">
          {animState <= 1 && (
            <div className="text-center text-zinc-500 py-10">
              <span className="inline-block animate-spin text-2xl mb-2">🔄</span>
              <p className="text-sm">Queueing document for parsing...</p>
            </div>
          )}

          {animState >= 2 && animState < 4 && (
            <div className="text-center text-cyan-400 py-10 animate-pulse">
              <span className="inline-block text-2xl mb-2">⚡</span>
              <p className="text-sm font-mono">Running security and liability scanners...</p>
            </div>
          )}

          {/* Scanned Summary Cards */}
          {animState >= 4 && (
            <div className="grid grid-cols-2 gap-3 transition-all duration-500 transform translate-y-0 opacity-100">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">LIABILITY</span>
                <span className="text-sm font-semibold text-white block">$500,000 Penalty</span>
                <span className="text-[10px] text-zinc-500">Section 4 Breach Clause</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">JURISDICTION</span>
                <span className="text-sm font-semibold text-white block">Delaware, USA</span>
                <span className="text-[10px] text-zinc-500">Section 9 State Forums</span>
              </div>
            </div>
          )}

          {/* Chat bubbles */}
          {chatStep >= 1 && (
            <div className="flex flex-col gap-3">
              {/* User question */}
              <div className="self-end max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-xs shadow-md transition-all duration-300 transform translate-x-0">
                <p className="font-semibold text-[10px] opacity-75 mb-1">User Query</p>
                What is the liability penalty in case of NDA breaches?
              </div>

              {/* AI Answer */}
              {chatStep >= 2 && (
                <div className="self-start max-w-[85%] bg-white/5 border border-white/10 text-zinc-100 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs shadow-md transition-all duration-300 transform translate-x-0">
                  <p className="font-bold text-[10px] text-cyan-400 mb-1">LegalEye AI</p>
                  According to <strong className="text-white">Section 4 (Remedies & Fines)</strong> of the uploaded document, there is an automatic <strong className="text-cyan-300">$500,000 breach liability</strong> limit for liquidated damages.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions Feed */}
        <div className="border-t border-white/5 pt-4 text-center">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">
            {animState === 0 && 'Awaiting File'}
            {animState === 1 && 'Ingesting file...'}
            {animState === 2 && 'Structuring text nodes...'}
            {animState === 3 && 'Scanning legal obligations...'}
            {animState >= 4 && 'Scanning Complete - Interactive Mode Enabled'}
          </p>
        </div>
      </div>
    </div>
  );
}
