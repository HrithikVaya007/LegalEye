import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Download, 
  Trash2, 
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Calendar,
  Layers,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const variants = {
    Indexed: "bg-green-500/10 text-green-500 border-green-500/20",
    Processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Error: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", variants[status] || variants.Indexed)}>
      {status}
    </span>
  );
};

const LibraryPage = () => {
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8001/api/v1';

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/documents/`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Fetch documents error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const deleteDoc = async (id) => {
    if (!confirm('Are you sure you want to delete this document? This will also remove all its indexed vectors.')) return;
    try {
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });
      if (!response.ok) throw new Error('Delete failed');
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document');
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Document Library</h1>
          <p className="text-zinc-400 mt-1">Manage and organize your legal document collections.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
          <Button 
            variant={view === 'grid' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setView('grid')}
            className={cn("h-8 w-8 p-0", view === 'grid' && "bg-zinc-800")}
          >
            <LayoutGrid size={16} />
          </Button>
          <Button 
            variant={view === 'list' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setView('list')}
            className={cn("h-8 w-8 p-0", view === 'list' && "bg-zinc-800")}
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search filenames, tags, or content..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter size={16} className="mr-2" />
          Filters
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-24 glass-panel rounded-2xl flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-zinc-400 text-sm">Loading your document library...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/20 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4">
          <FileText className="w-12 h-12 text-zinc-700" />
          <div>
            <h3 className="text-lg font-medium text-white mb-1">No documents found</h3>
            <p className="text-zinc-500 text-sm">Upload PDF documents to see them indexed in your library.</p>
          </div>
          <Button onClick={() => navigate('/dashboard/upload')}>Upload Documents</Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="glass-panel group hover:border-primary/30 transition-all duration-300">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={doc.status} />
                  </div>
                </div>
                
                <h3 className="font-semibold text-white truncate mb-1 group-hover:text-primary transition-colors" title={doc.name}>
                  {doc.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {doc.date}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {(doc.tags || []).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-md text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteDoc(doc.id)} 
                    className="flex-1 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => navigate('/dashboard/chat')} 
                    className="flex-1 text-xs"
                  >
                    <MessageSquare size={14} className="mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Document Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date Uploaded</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chunks</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{doc.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                        <Layers size={14} className="text-primary" />
                        {doc.chunks}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{doc.size}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate('/dashboard/chat')}
                          className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                          title="Chat with Document"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          onClick={() => deleteDoc(doc.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500/50 hover:text-red-500 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LibraryPage;
