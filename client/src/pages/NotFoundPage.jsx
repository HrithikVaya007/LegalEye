import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]" />

      <div className="text-center z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20"
        >
          <ShieldAlert size={48} className="text-red-500" />
        </motion.div>
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-300 mb-4">Case Not Found</h2>
        <p className="text-zinc-500 max-w-md mx-auto mb-10 text-lg">
          The legal document or page you are looking for does not exist in our records. 
          It may have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" size="lg" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </Button>
          <Button size="lg" onClick={() => navigate('/')} className="w-full sm:w-auto">
            <Home size={18} className="mr-2" />
            Return Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
