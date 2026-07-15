import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Search, MessageSquare, ArrowRight, Lock, Zap, Activity, CheckCircle2, ChevronRight, BarChart3, Database } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Reusable Bento Box Feature Card
const BentoCard = ({ icon: Icon, title, description, className = "", delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className={`glass-panel border-white/10 p-8 rounded-3xl flex flex-col hover:border-cyan-500/30 hover:bg-white/[0.08] transition-all duration-300 relative overflow-hidden group ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-all duration-300">
      <Icon className="w-6 h-6 text-zinc-300 group-hover:text-cyan-400 transition-colors" />
    </div>
    <h3 className="text-xl font-bold mb-3 tracking-tight text-white">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed flex-1">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#080B12] text-zinc-100 selection:bg-cyan-500/30 font-sans selection:text-white">
      
      {/* Premium Dark Mesh Background Gradients */}
      <div className="fixed top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="border-b border-white/[0.04] bg-[#080B12]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LegalEye</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <Button className="h-9 px-4 text-sm font-medium bg-white text-black hover:bg-zinc-200 border-0 shadow-none transition-colors rounded-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="pt-32 pb-24 px-6 relative flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-300 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Introducing LegalEye Enterprise
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.05] text-white">
              Contract intelligence, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-cyan-100 to-zinc-400">
                engineered for scale.
              </span>
            </h1>
            
            <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Instantly parse NDAs, surface critical liabilities, and query your entire legal repository using private, advanced AI semantic search.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="h-12 px-8 text-base font-semibold bg-white text-black hover:bg-zinc-200 border-0 rounded-xl transition-all hover:scale-105 active:scale-95">
                  Start Building Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium border-white/10 text-white hover:bg-white/5 rounded-xl transition-all">
                  Read Documentation
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* MOCK UI DASHBOARD */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 w-full max-w-6xl mx-auto"
          >
            <div className="relative rounded-3xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
              {/* Fake Window Header */}
              <div className="h-12 border-b border-white/[0.04] bg-white/[0.02] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                <div className="ml-4 flex-1 text-center text-[11px] font-mono text-zinc-500">LegalEye Analysis Engine v2.0</div>
              </div>
              
              {/* Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 h-[400px]">
                {/* Left side: Document preview */}
                <div className="col-span-2 border-r border-white/[0.04] p-8 flex flex-col relative overflow-hidden bg-white/[0.01]">
                  <div className="w-32 h-4 bg-white/10 rounded mb-8"></div>
                  <div className="w-3/4 h-3 bg-white/5 rounded mb-4"></div>
                  <div className="w-5/6 h-3 bg-white/5 rounded mb-4"></div>
                  <div className="w-2/3 h-3 bg-white/5 rounded mb-12"></div>
                  
                  {/* Highlighted scanned clause */}
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-l-xl"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Liability Detected</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded mb-3"></div>
                    <div className="w-4/5 h-3 bg-white/10 rounded"></div>
                  </div>
                </div>
                
                {/* Right side: AI Sidebar */}
                <div className="col-span-1 p-6 flex flex-col bg-[#080B12]/50">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">AI Assistant</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="self-end bg-white/10 text-xs px-3 py-2 rounded-xl rounded-tr-sm text-zinc-300">
                      What is the max penalty?
                    </div>
                    <div className="self-start bg-cyan-500/10 border border-cyan-500/20 text-xs px-4 py-3 rounded-xl rounded-tl-sm text-zinc-300 leading-relaxed">
                      According to <span className="text-cyan-400">Section 4</span>, the maximum liquidated damages are capped at $500,000 for standard breaches.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-24 px-6 border-y border-white/[0.04] bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">The Analysis Pipeline</h2>
              <p className="text-zinc-400 text-lg">A highly optimized data ingestion architecture designed to secure and index your documents instantly.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
              
              {[
                { step: "01", title: "Secure Ingestion", desc: "Upload PDFs/DOCX. Files are chunked and encrypted via AES-256." },
                { step: "02", title: "Vector Embedding", desc: "Text is processed through high-dimensional ML models for semantic meaning." },
                { step: "03", title: "Instant Query", desc: "Use natural language to extract clauses and risks instantly." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative z-10 pt-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#080B12] border border-white/10 text-white font-mono font-bold flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/50">
                    {item.step}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* BENTO GRID FEATURES SECTION */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">Everything you need.</h2>
              <p className="text-zinc-400 text-lg max-w-xl">Enterprise-grade capabilities out of the box, combining semantic AI search with strict data governance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BentoCard 
                icon={Search}
                title="Semantic Search"
                description="Query thousands of pages using natural language, finding concepts and meanings instead of relying solely on exact keyword matches."
                className="md:col-span-2"
                delay={0}
              />
              <BentoCard 
                icon={Lock}
                title="SOC2 Ready Security"
                description="Data is isolated per tenant. We never train public models on your proprietary agreements."
                className="md:col-span-1"
                delay={0.1}
              />
              <BentoCard 
                icon={Database}
                title="Vector Database"
                description="Built on high-performance vector stores for sub-second retrieval times across millions of document chunks."
                className="md:col-span-1"
                delay={0.2}
              />
              <BentoCard 
                icon={MessageSquare}
                title="Context-Aware Chat"
                description="Interface directly with your documents. The AI cites exact sections and pages when answering compliance and risk queries."
                className="md:col-span-2"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 px-6 relative border-t border-white/[0.04] bg-[#0A0E17]">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Ready to streamline your legal flow?</h2>
            <p className="text-lg text-zinc-400 mb-10">Join forward-thinking teams using LegalEye to automate contract analysis securely.</p>
            
            <Link to="/register">
              <Button size="lg" className="h-12 px-8 text-base font-bold bg-white text-black hover:bg-zinc-200 border-0 rounded-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-6 bg-[#080B12]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-zinc-600" />
            <span className="text-zinc-500 font-semibold text-sm tracking-tight">LegalEye Inc. © 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500 font-medium">
            <a href="#" className="hover:text-zinc-300 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
