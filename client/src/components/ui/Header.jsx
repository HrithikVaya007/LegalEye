import React from 'react';
import { Search, Bell, Moon, Sun, Command, Menu } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const Header = ({ onMenuClick }) => {
  return (
    <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center flex-1 max-w-xl mr-4">
        {/* Hamburger Menu Toggle for Mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-zinc-400 hover:text-white mr-2 shrink-0"
          onClick={onMenuClick}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </Button>

        {/* Search Bar Container */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search documents or ask AI..." 
            className="pl-10 bg-zinc-900/40 border-white/5 h-10 text-sm focus-visible:ring-primary/30 w-full"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-zinc-800/50 text-[10px] text-zinc-500 font-medium">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-black" />
        </Button>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hidden sm:flex">
          <Moon size={20} />
        </Button>
        <div className="flex items-center gap-3 pl-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
