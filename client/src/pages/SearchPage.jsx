import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Search as SearchIcon, 
  Filter, 
  Sparkles, 
  FileText, 
  ExternalLink, 
  ArrowRight,
  TrendingUp,
  History
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';

const SearchResult = ({ title, excerpt, score, document, page }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel p-5 rounded-2xl group hover:border-primary/30 transition-all duration-300 mb-4"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-[10px] text-zinc-500">{document} • Page {page}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Relevance Score</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${score}%` }} />
          </div>
          <span className="text-xs font-bold text-primary">{score}%</span>
        </div>
      </div>
    </div>
    <div className="prose prose-sm max-w-none text-zinc-300 leading-relaxed italic">
      "{excerpt}"
    </div>
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
      <div className="flex gap-2">
        {['Liability', 'Compliance', 'Clauses'].map(tag => (
          <span key={tag} className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
      <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase tracking-widest font-bold">
        View Context
        <ArrowRight size={12} className="ml-2" />
      </Button>
    </div>
  </motion.div>
);

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);

  const { user } = useAuth();
  const API_URL = 'http://localhost:8001/api/v1';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`${API_URL}/search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results.map((res, index) => ({
        id: index,
        title: res.document,
        document: res.document,
        page: res.page,
        score: Math.min(100, Math.max(0, Math.round(res.score * 100))),
        excerpt: res.text
      })));
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">Semantic Search</h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Search across your entire legal library using natural language. 
          Our AI understands concepts, not just keywords.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-2xl group-focus-within:bg-primary/20 transition-all opacity-50" />
        <div className="relative glass-panel rounded-2xl p-2 flex items-center gap-2 border-white/10 shadow-2xl">
          <div className="pl-4">
            <SearchIcon className="text-zinc-500" size={24} />
          </div>
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for clauses, definitions, or legal concepts..." 
            className="flex-1 bg-transparent border-0 text-lg h-14 focus-visible:ring-0"
          />
          <Button type="submit" size="lg" className="rounded-xl px-8" disabled={isSearching}>
            {isSearching ? <span className="animate-spin">◌</span> : 'Search'}
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold text-zinc-400">
              {results.length > 0 ? `Found ${results.length} highly relevant results` : 'Recent Searches'}
            </h2>
            <Button variant="ghost" size="sm" className="text-xs">
              <Filter size={14} className="mr-2" />
              Refine Results
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {results.length > 0 ? (
              results.map((res) => <SearchResult key={res.id} {...res} />)
            ) : (
              <div className="space-y-3">
                {[
                  "Standard of care in medical malpractice",
                  "Intellectual property assignment in M&A",
                  "Force Majeure exceptions for pandemics"
                ].map((q, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setQuery(q); }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-800/60 cursor-pointer transition-colors"
                  >
                    <History size={16} className="text-zinc-600" />
                    <span className="text-sm text-zinc-400">{q}</span>
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-white">Trending Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['GDPR', 'Non-Compete', 'Equity', 'Liability', 'AI Policy'].map(topic => (
                  <button key={topic} className="px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-xs text-zinc-400 hover:text-white hover:border-primary/50 transition-all">
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="glass-panel border-primary/20 bg-primary/5">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-white">AI Search Tip</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Try asking questions like "What are the notice requirements for termination?" or "Compare the liability caps across my NDAs."
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
