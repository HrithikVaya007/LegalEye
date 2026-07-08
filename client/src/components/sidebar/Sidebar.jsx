import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Upload, 
  Files, 
  Search, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  User
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
        isActive 
          ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(10,132,255,0.1)]" 
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", collapsed && "mx-auto")} />
      {!collapsed && (
        <span className="font-medium text-sm overflow-hidden whitespace-nowrap">{label}</span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-white/5 shadow-xl">
          {label}
        </div>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: MessageSquare, label: 'Chat', to: '/dashboard/chat' },
    { icon: Upload, label: 'Upload', to: '/dashboard/upload' },
    { icon: Files, label: 'Library', to: '/dashboard/library' },
    { icon: Search, label: 'Search', to: '/dashboard/search' },
    { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-black/40 backdrop-blur-xl border-r border-white/5 z-40 flex flex-col transition-all duration-300",
        collapsed ? "items-center" : "items-stretch"
      )}
    >
      {/* Logo Section */}
      <div className={cn("p-6 mb-4 flex items-center gap-3", collapsed ? "justify-center" : "justify-between")}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30 shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-bold text-xl tracking-tight text-white">LegalEye</span>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <SidebarItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/5 mt-auto">
        {!collapsed ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-zinc-800 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} alt={user?.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-zinc-800 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} alt={user?.name} className="w-full h-full object-cover" />
                )}
              </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-400/10 text-red-400 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
