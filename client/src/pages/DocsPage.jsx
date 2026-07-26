import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  BookOpen, 
  FileText, 
  Search, 
  MessageSquare, 
  Key, 
  ArrowRight, 
  ChevronRight, 
  Menu, 
  X,
  ExternalLink,
  Info,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const sections = [
  {
    id: 'intro',
    title: 'Introduction',
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Introduction to LegalEye AI</h2>
          <p className="text-zinc-300 leading-relaxed">
            LegalEye AI is an advanced, enterprise-grade contract intelligence platform engineered to parse, analyze, and query legal agreements at scale. Utilizing private LLM architectures and high-performance vector retrieval, LegalEye flags hidden liabilities and summarizes key sections in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-cyan-400">
              <ZapIcon className="w-4 h-4" /> Real-time Analysis
            </h3>
            <p className="text-zinc-400 text-sm">
              Instantly parse complex NDAs and service agreements without manual review.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-cyan-400">
              <LockIcon className="w-4 h-4" /> Secure Sandbox
            </h3>
            <p className="text-zinc-400 text-sm">
              Uploaded files are isolated, fully encrypted, and never trained on public models.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="text-xl font-bold text-white mb-2">Core Value Proposition</h3>
          <ul className="list-disc pl-5 text-zinc-300 space-y-2">
            <li><strong>Reduced Review Time:</strong> Bring down standard NDA turnaround from 3 hours to 3 minutes.</li>
            <li><strong>Accuracy:</strong> Zero-shot classification targeting indemnification, liability caps, and jurisdiction.</li>
            <li><strong>Privacy First:</strong> Self-hosted, private AI infrastructure designed for legal standards.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'get-started',
    title: 'Getting Started',
    icon: Play,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Getting Started</h2>
          <p className="text-zinc-300">
            Follow this quick guide to configure your dashboard and run your first contract analysis pipeline.
          </p>
        </div>

        <div className="space-y-6 mt-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 shrink-0">1</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Create an Account</h3>
              <p className="text-zinc-400 text-sm">
                Click "Get Started" or "Sign In" on the landing page to register using your enterprise Google workspace account.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 shrink-0">2</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Upload a Contract</h3>
              <p className="text-zinc-400 text-sm">
                Head to the <strong>Upload</strong> tab in the sidebar. Drop a PDF or Word document into the secure ingestion box.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 shrink-0">3</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Interact and Query</h3>
              <p className="text-zinc-400 text-sm">
                Once the file is processed, use the **Chat Assistant** or the **Semantic Search** interface to surface key metrics, liabilities, or specific clauses.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Core Features',
    icon: Search,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Core Features</h2>
          <p className="text-zinc-300 mb-6">
            LegalEye AI is built around three pillars of modern document ingestion and retrieval.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Liability Extractor
            </h3>
            <p className="text-zinc-400 text-sm mb-3">
              Automatically parses agreements to locate risky language, liability caps, indemnification details, and non-standard governing laws.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Supports legal compliance templates for USA, UK, and EU jurisdictions.</span>
            </div>
          </div>

          <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Semantic Search
            </h3>
            <p className="text-zinc-400 text-sm">
              Instead of searching exact strings (like `CTRL+F`), semantic search understands intent. Searching for "early cancellation rules" will successfully flag clauses titled "Termination for Convenience."
            </p>
          </div>

          <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Contextual Assistant
            </h3>
            <p className="text-zinc-400 text-sm">
              An interactive conversational assistant tied to your documents. Every answer is citation-backed, detailing page and paragraph references to prevent hallucination.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: Shield,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Security & Privacy Standards</h2>
          <p className="text-zinc-300">
            Legal documents require the highest tier of confidentiality. LegalEye is built ground-up with strict data sovereignty in mind.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="p-4 rounded-xl border border-white/5 bg-[#0A0D14] flex gap-3">
            <Key className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">End-to-End Encryption</h4>
              <p className="text-zinc-400 text-xs mt-1">Files are encrypted in-transit using TLS 1.3 and at-rest using AES-256 standards.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-[#0A0D14] flex gap-3">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">Zero Model Training Data Retention</h4>
              <p className="text-zinc-400 text-xs mt-1">We utilize isolated enterprise AI models. Your proprietary legal data is never stored, indexed, or used to train public models.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/10 text-zinc-300 text-sm leading-relaxed">
          For companies requiring air-gapped on-premise infrastructure, LegalEye offers local deployable modules via Docker with support for private self-hosted vector indexing.
        </div>
      </div>
    )
  }
];

// Reusable icons to avoid duplicate imports/missing icon errors
function ZapIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46L12.2 9h6a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46L11.8 15H4Z" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

const DocsPage = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeSection = sections.find(s => s.id === activeTab) || sections[0];

  return (
    <div className="min-h-screen bg-[#080B12] text-zinc-100 selection:bg-cyan-500/30 font-sans selection:text-white relative">
      
      {/* Background Gradients */}
      <div className="fixed top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-900/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header Navigation */}
      <nav className="border-b border-white/[0.04] bg-[#080B12]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">LegalEye</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-medium">Docs</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" className="hidden sm:flex h-9 text-xs border-white/10 text-zinc-300 hover:bg-white/5 rounded-lg transition-colors">
                Back to Home
              </Button>
            </Link>
            <Link to="/login">
              <Button className="h-9 px-4 text-xs font-medium bg-white text-black hover:bg-zinc-200 border-0 rounded-lg shadow-none transition-colors">
                Sign In
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-28 space-y-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-3">Documentation</div>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = sec.id === activeTab;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all group ${
                    isActive 
                      ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-4' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  {sec.title}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden glass-panel border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl mb-4"
            >
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Sections</div>
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = sec.id === activeTab;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveTab(sec.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-cyan-500/10 text-cyan-400' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {sec.title}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="glass-panel border-white/5 p-6 sm:p-10 rounded-3xl min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {activeSection.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
  );
};

export default DocsPage;
