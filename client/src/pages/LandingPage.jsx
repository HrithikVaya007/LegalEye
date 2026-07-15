import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Search, MessageSquare, ArrowRight, Lock, Zap, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';

// 3D Components
import { HeroScene } from '../components/landing/HeroScene';
import { TimelineScene } from '../components/landing/TimelineScene';
import { NeuralNetwork } from '../components/landing/NeuralNetwork';
import { UploadDemoScene } from '../components/landing/UploadDemoScene';
import { CTAScene } from '../components/landing/CTAScene';

// Helper to check WebGL support for low-end fallbacks
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="glass-panel border-white/10 p-6 rounded-2xl flex flex-col h-full hover:border-cyan-500/20 hover:bg-white/10 transition-all duration-300 shadow-2xl relative overflow-hidden group"
  >
    {/* Inner glow element */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    
    <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-all duration-300">
      <Icon className="w-6 h-6 text-blue-400 group-hover:text-cyan-400 transition-colors" />
    </div>
    <h3 className="text-xl font-bold mb-2 tracking-tight">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed flex-1">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [webglAvailable, setWebglAvailable] = useState(true);

  // Monitor scroll for camera adjustments
  useEffect(() => {
    setWebglAvailable(checkWebGLSupport());
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30 relative overflow-hidden flex flex-col font-sans">
      
      {/* Global Background Layered Gradients */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/15 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-950/10 rounded-full blur-[160px] pointer-events-none z-0" />
      
      {/* Moving Ambient Fog background (CSS driven parallax) */}
      <div 
        className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(8,17,31,0.5)_0%,rgba(2,6,23,0.9)_100%)] pointer-events-none z-0"
        style={{
          transform: `translateY(${scrollY * 0.15}px)`,
        }}
      />

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#020617]/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600/15 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">LegalEye</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              Sign In
            </Link>
            <Link to="/register">
              <Button className="font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 shadow-lg shadow-blue-500/20 px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col z-10">
        {/* Hero Section */}
        <section className="min-h-screen pt-32 pb-20 px-6 relative flex items-center">
          
          {/* Render 3D Canvas only if WebGL is available, otherwise render static fallback */}
          {webglAvailable ? (
            <HeroScene scrollY={scrollY} />
          ) : (
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.06)_0%,transparent_60%)] pointer-events-none" />
          )}

          <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero text overlay (Left side on desktop to align beautifully with the floating 3D document on the right) */}
            <div className="lg:col-span-7 text-left max-w-3xl pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  Next-Gen Legal AI Intelligence
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white">
                  Understand your contracts <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-white">
                    with semantic precision.
                  </span>
                </h1>
                <p className="text-base md:text-lg text-zinc-400 mb-10 leading-relaxed max-w-xl">
                  Empower your compliance and legal operations. Securely parse NDA documents, inspect risk patterns instantly, and chat with private databases using premium RAG search.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full text-base h-14 px-8 font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-xl shadow-blue-500/10 group border-0">
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full text-base h-14 px-8 border-white/10 hover:bg-white/5 font-semibold text-zinc-300 hover:text-white">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
            
            {/* Visual spacing for 3D elements in desktop */}
            <div className="hidden lg:block lg:col-span-5 h-[500px]" />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 relative border-y border-white/5 bg-[#020617]/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">How LegalEye works</h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Our parsing framework automates secure uploads, structures file sections, indexes embeddings, and executes analysis in seconds.
              </p>
            </div>
            
            {/* Timeline scene */}
            {webglAvailable ? (
              <TimelineScene />
            ) : (
              /* Fallback static timeline */
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {['Upload Document', 'AI Processing', 'RAG Retrieval', 'LLM Analysis', 'Simple Explanation'].map((title, i) => (
                  <div key={i} className="glass-panel border-white/10 p-5 rounded-2xl text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                      {i + 1}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">Pipeline step executing advanced structured file audits.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Feature grid & Neural visualization Section */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Enterprise capabilities, built for legal</h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Save hours of manual contract audits. Securely analyze clauses, extract warnings, and draft briefs in plain English.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Feature Cards Grid (Left side) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 order-2 lg:order-1">
                <FeatureCard 
                  icon={Search}
                  index={0}
                  title="Semantic Search"
                  description="Query thousands of pages using natural language, finding concepts and meanings instead of just keywords."
                />
                <FeatureCard 
                  icon={MessageSquare}
                  index={1}
                  title="Interactive AI Chat"
                  description="Interface directly with documents. Ask risk compliance queries and fetch context citations immediately."
                />
                <FeatureCard 
                  icon={FileText}
                  index={2}
                  title="AI Document Analysis"
                  description="Extract summaries, classify agreements, and structure outline segments preserving layout elements."
                />
                <FeatureCard 
                  icon={Lock}
                  index={3}
                  title="Secure Processing"
                  description="Enterprise-grade TLS and AES-256 safeguards. Data is isolated; we never train models on your private agreements."
                />
                <FeatureCard 
                  icon={Zap}
                  index={4}
                  title="Fast Analysis"
                  description="Complete structured processing and extraction of multi-page agreements in under 5 seconds."
                />
                <FeatureCard 
                  icon={Activity}
                  index={5}
                  title="Clause Detection"
                  description="Automated scanning detects indemnity caps, liquidated damages, data scrubs, and forum locations."
                />
              </div>

              {/* Neural Net Visualization (Right side) */}
              <div className="lg:col-span-5 h-[350px] lg:h-[450px] flex items-center justify-center order-1 lg:order-2">
                {webglAvailable ? (
                  <div className="w-full h-full relative border border-white/5 bg-[#020617]/30 rounded-3xl overflow-hidden glass-panel shadow-2xl">
                    <div className="absolute top-4 left-6 z-10">
                      <p className="text-[10px] tracking-wider text-zinc-500 font-bold uppercase">NETWORK VISUALIZER</p>
                      <p className="text-xs text-cyan-400 font-mono">Status: Connected to LLM nodes</p>
                    </div>
                    <NeuralNetwork />
                  </div>
                ) : (
                  <div className="w-full h-full border border-white/10 bg-white/5 rounded-3xl flex items-center justify-center p-6 text-center text-zinc-400">
                    <div>
                      <p className="text-xl font-bold mb-2 text-white">Neural Net Active</p>
                      <p className="text-sm">Semantic nodes mapped across vector datasets.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Upload Demo Section */}
        <section className="py-24 px-6 relative border-t border-white/5 bg-[#020617]/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full">Interactive Demo</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 tracking-tight">Interactive contract scanning</h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Watch how LegalEye processes a standard ND agreement, extracts liability details, and replies to user questions instantly.
              </p>
            </div>

            <UploadDemoScene />
          </div>
        </section>
        
        {/* Bottom CTA */}
        <section className="py-28 px-6 relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-[#020617] to-[#040d21]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)] pointer-events-none" />
          <CTAScene />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 relative z-10 bg-[#020617]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-zinc-500" />
            <span className="text-zinc-500 font-bold">LegalEye © 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500 font-medium">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
