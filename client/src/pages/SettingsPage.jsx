import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Cpu, 
  Bell
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';


const SettingsSection = ({ icon: Icon, title, description, children }) => (
  <Card className="glass-panel overflow-hidden">
    <CardHeader className="border-b border-white/5 bg-white/[0.01]">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5">
          <Icon size={20} className="text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-6">
      {children}
    </CardContent>
  </Card>
);

const Toggle = ({ active, onToggle }) => (
  <button 
    onClick={onToggle}
    className={cn(
      "w-10 h-5 rounded-full transition-colors relative",
      active ? "bg-primary" : "bg-zinc-800"
    )}
  >
    <div className={cn(
      "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
      active ? "left-6" : "left-1"
    )} />
  </button>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoIndex, setAutoIndex] = useState(true);
  const [maskPii, setMaskPii] = useState(false);


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account, API configurations, and AI preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <SettingsSection 
          icon={User} 
          title="Profile Information" 
          description="Update your personal details and public profile."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Full Name</label>
              <Input defaultValue={user?.name || "User Name"} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Email Address</label>
              <Input defaultValue={user?.email || "user@example.com"} />
            </div>

          </div>
          <div className="mt-6 flex justify-end">
            <Button size="sm">Save Changes</Button>
          </div>
        </SettingsSection>

        {/* AI & Model Preferences */}
        <SettingsSection 
          icon={Cpu} 
          title="AI & Model Preferences" 
          description="Configure how the AI assistant interacts with your documents."
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Default AI Model</h4>
                <p className="text-xs text-zinc-500">Select the model used for analysis and chat.</p>
              </div>
              <select className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:ring-1 focus:ring-primary outline-none">
                <option>LegalGPT-4 (Ultra Precise)</option>
                <option>LegalGPT-3.5 (Fast)</option>
                <option>Claude-3 Opus (Reasoning)</option>
              </select>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Automatic Indexing</h4>
                <p className="text-xs text-zinc-500">Automatically index documents for search upon upload.</p>
              </div>
              <Toggle active={autoIndex} onToggle={() => setAutoIndex(!autoIndex)} />
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">PII Masking</h4>
                <p className="text-xs text-zinc-500">Mask sensitive personal information in AI prompts.</p>
              </div>
              <Toggle active={maskPii} onToggle={() => setMaskPii(!maskPii)} />
            </div>
          </div>
        </SettingsSection>



        <div className="pt-8 flex justify-between items-center text-zinc-600 border-t border-white/5">
          <p className="text-xs italic">Version 1.2.4-stable (Build 4920)</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
