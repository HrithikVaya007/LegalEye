import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  User, 
  Bot, 
  ExternalLink, 
  FileText, 
  RotateCcw,
  Sparkles,
  Search,
  MessageSquarePlus,
  Clock,
  ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';

// Map BCP-47 codes to human-readable short labels
const LANG_LABELS = {
  en: 'EN', hi: 'HI', gu: 'GU', ar: 'AR', fr: 'FR', de: 'DE',
  es: 'ES', pt: 'PT', ru: 'RU', zh: 'ZH', ja: 'JA', ko: 'KO',
  'zh-cn': 'ZH', 'zh-tw': 'ZH', ur: 'UR', bn: 'BN', ta: 'TA',
  te: 'TE', mr: 'MR', pa: 'PA', ml: 'ML', kn: 'KN',
};

const CitationCard = ({ docName, page, excerpt, language }) => {
  const langLabel = language ? (LANG_LABELS[language] ?? language.toUpperCase().slice(0, 3)) : null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900/60 border border-white/5 rounded-lg p-3 mt-3 flex gap-3 hover:bg-zinc-800/60 transition-colors cursor-pointer group"
    >
      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
        <FileText className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Source Reference</span>
            {langLabel && langLabel !== 'UNKNOWN' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 tracking-widest">
                {langLabel}
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-500">Page {page}</span>
        </div>
        <p className="text-xs font-semibold text-zinc-200 truncate">{docName}</p>
        <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed italic">"{excerpt}"</p>
      </div>
      <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-primary transition-colors" />
    </motion.div>
  );
};

const Message = ({ role, content, citations, isStreaming }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "flex gap-4 mb-8",
      role === 'user' ? "flex-row-reverse" : "flex-row"
    )}
  >
    <div className={cn(
      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
      role === 'user' ? "bg-zinc-800 border-white/10" : "bg-primary/20 border-primary/30"
    )}>
      {role === 'user' ? <User className="w-4 h-4 text-zinc-300" /> : <Bot className="w-4 h-4 text-primary" />}
    </div>
    
    <div className={cn(
      "max-w-[85%] sm:max-w-[70%]",
      role === 'user' ? "text-right" : "text-left"
    )}>
      <div className={cn(
        "px-4 py-3 rounded-2xl inline-block",
        role === 'user' 
          ? "bg-primary text-white" 
          : "bg-zinc-900/80 border border-white/5 backdrop-blur-sm"
      )}>
        {role === 'ai' ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{content}</p>
        )}
      </div>
      
      {citations && citations.length > 0 && (
        <div className="space-y-2 mt-2">
          {citations.map((c, i) => <CitationCard key={i} {...c} />)}
        </div>
      )}
    </div>
  </motion.div>
);

const ChatPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: 'Hello! I am your **multilingual** Legal AI assistant. I can read and analyze legal documents in **any language** — English, Hindi (हिंदी), Gujarati (ગુજરાતી), Arabic (عربي), French, German, Chinese, and 50+ more.\n\nAsk your question in any language and I will answer in the same language. What would you like to discuss today?',
      citations: []
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const { user } = useAuth();

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const questionText = input;
    const userMsg = { role: 'user', content: questionText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify({ question: questionText })
      });

      if (!response.ok) {
        throw new Error('Chat failed');
      }

      const data = await response.json();
      
      const aiResponse = {
        role: 'ai',
        content: data.answer,
        citations: data.citations || []
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Error: Failed to fetch response from the server. Please try again.',
        citations: []
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col max-w-5xl mx-auto relative">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <Message key={i} {...msg} isStreaming={isStreaming && i === messages.length - 1} />
          ))}
        </AnimatePresence>
        {isStreaming && messages[messages.length-1].role === 'user' && (
          <div className="flex gap-4 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex gap-1 items-center mt-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      {messages.length === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 mb-4">
          {[
            "Summarize the termination clause in my contract",
            "इस अनुबंध में मुख्य शर्तें क्या हैं?",
            "List all key dates in the acquisition agreement",
            "આ દસ્તાવેજમાં કઈ ચુકવણી શરતો છે?"
          ].map((prompt, i) => (
            <button 
              key={i}
              onClick={() => setInput(prompt)}
              className="text-left p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-white/10 transition-all text-xs text-zinc-400"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-transparent">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-focus-within:bg-primary/10 transition-colors" />
          <div className="relative glass-panel bg-zinc-900/80 border-white/10 rounded-2xl p-2 flex items-end gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-zinc-400">
              <Paperclip size={20} />
            </Button>
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask anything about your documents..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-3 px-2 resize-none max-h-40 scrollbar-none"
              style={{ minHeight: '44px' }}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="h-10 w-10 shrink-0 rounded-xl p-0"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-center text-zinc-600 mt-3 flex items-center justify-center gap-1">
          <Sparkles size={10} />
          AI-generated responses can be inaccurate. Always verify with original documents.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
