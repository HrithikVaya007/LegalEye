import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Search, MessageSquare, ArrowRight, CheckCircle2, Lock, Scale } from 'lucide-react';
import { Button } from '../components/ui/Button';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-panel border-white/10 p-6 rounded-2xl flex flex-col h-full"
  >
    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 border border-primary/30">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-zinc-400 flex-1">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden flex flex-col">
      {/* Global Background Effects */}
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">LegalEye</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Next-Gen Legal AI
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                Your Enterprise <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                  Legal AI Assistant
                </span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Empower your legal team with advanced AI. Instantly analyze contracts, search through massive document libraries, and extract key insights with semantic precision.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 group">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-white/10 hover:bg-white/5">
                    View Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 relative z-10 bg-black/40 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful capabilities, built for legal</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                Stop wasting hours manually reviewing documents. LegalEye brings state-of-the-art AI directly to your workflow.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={Search}
                title="Semantic Search"
                description="Find exactly what you're looking for across thousands of documents using natural language, not just keywords."
              />
              <FeatureCard 
                icon={MessageSquare}
                title="RAG Chat"
                description="Chat with your documents. Ask complex legal questions and get cited answers instantly from your uploaded files."
              />
              <FeatureCard 
                icon={FileText}
                title="Smart Chunking"
                description="Our proprietary pipeline intelligent chunks PDFs and documents while preserving layout, lists, and tables."
              />
              <FeatureCard 
                icon={Lock}
                title="Enterprise Security"
                description="Your data is encrypted in transit and at rest. We never use your confidential legal documents to train public models."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                Get up and running in minutes, not months.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center relative">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload Documents</h3>
                <p className="text-zinc-400">Securely upload PDFs, contracts, and case files to your encrypted private library.</p>
                <div className="hidden md:block absolute top-8 left-2/3 w-full h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
              </div>
              <div className="text-center relative">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30 text-2xl font-bold text-primary">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Processing</h3>
                <p className="text-zinc-400">Our engine automatically chunks, embeds, and indexes your documents for semantic retrieval.</p>
                <div className="hidden md:block absolute top-8 left-2/3 w-full h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Query & Analyze</h3>
                <p className="text-zinc-400">Start asking questions, finding precedents, and summarizing complex clauses instantly.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Bottom CTA */}
        <section className="py-24 px-6 relative z-10 bg-primary/5 border-t border-primary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to modernize your legal practice?</h2>
            <p className="text-xl text-zinc-400 mb-10">
              Join forward-thinking legal professionals who are saving 15+ hours a week with LegalEye.
            </p>
            <Link to="/register">
              <Button size="lg" className="h-14 px-10 text-lg">
                Create Your Account Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-zinc-500" />
            <span className="text-zinc-500 font-medium">LegalEye © 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
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
