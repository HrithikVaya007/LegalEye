import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';


const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const { user } = useAuth();


  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const filesWithStatus = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading',
      progress: 0,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    }));
    
    setFiles(prev => [...filesWithStatus, ...prev]);
    
    // Perform real upload
    filesWithStatus.forEach(f => uploadFile(f));
  };

  const uploadFile = async (fileObj) => {
    const formData = new FormData();
    formData.append('file', fileObj.file);

    try {
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, progress: 100, status: 'completed' } : f
      ));
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'error', error: error.message } : f
      ));
    }
  };


  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Upload Documents</h1>
        <p className="text-zinc-400 mt-1">Add legal documents to your library for AI indexing and analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-300 group",
              isDragging 
                ? "border-primary bg-primary/5 scale-[1.01]" 
                : "border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 transition-transform duration-300",
              isDragging && "scale-110 rotate-3"
            )}>
              <Upload className={cn(
                "w-8 h-8 transition-colors",
                isDragging ? "text-primary" : "text-zinc-500"
              )} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Drag and drop PDFs</h3>
            <p className="text-zinc-500 text-sm mb-6 text-center max-w-xs">
              Upload legal contracts, case files, or regulatory documents (Max 50MB per file)
            </p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button asChild onClick={() => document.getElementById('file-upload').click()}>
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>

          {/* Upload List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-400 px-1">Recent Uploads</h4>
            <AnimatePresence initial={false}>
              {files.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/20 rounded-2xl border border-white/5">
                  <Info className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No files uploaded yet.</p>
                </div>
              ) : (
                files.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-panel p-4 rounded-xl flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-white truncate">{f.file.name}</p>
                        <p className="text-xs text-zinc-500">{f.size}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${f.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0 min-w-[100px] justify-end">
                          {f.status === 'uploading' && (
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                              <Loader2 size={10} className="animate-spin" />
                              Uploading...
                            </span>
                          )}
                          {f.status === 'processing' && (
                            <span className="text-[10px] text-blue-400 flex items-center gap-1">
                              <Zap size={10} className="animate-pulse" />
                              AI Indexing...
                            </span>
                          )}
                          {f.status === 'error' && (
                            <span className="text-[10px] text-red-500 flex items-center gap-1">
                              <AlertCircle size={10} />
                              Failed
                            </span>
                          )}
                          {f.status === 'completed' && (
                            <span className="text-[10px] text-green-500 flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              Ready
                            </span>
                          )}

                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(f.id)}
                      className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg text-white">Enterprise Security</CardTitle>
              <CardDescription>
                Your documents are encrypted at rest and in transit. AI training on your data is disabled by default.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "PDF documents only",
                "Max 50MB per file",
                "OCR enabled for scanned docs",
                "Supported languages: 50+",
                "Automated PII masking available"
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-zinc-400">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
