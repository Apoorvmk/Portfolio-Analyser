import React from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-20 bg-fintech-slate-950/80 backdrop-blur-lg border-b border-fintech-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fintech-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search assets, funds or insights..."
            className="w-full bg-fintech-slate-900 border border-fintech-slate-800 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-fintech-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full border-2 border-fintech-slate-950"></span>
        </button>
        
        <div className="h-8 w-px bg-fintech-slate-800 mx-2"></div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:scale-105 transition-transform">
            <User size={20} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white">Apoorv Saxena</p>
            <p className="text-xs text-fintech-slate-500">Premium Plan</p>
          </div>
          <ChevronDown size={14} className="text-fintech-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
