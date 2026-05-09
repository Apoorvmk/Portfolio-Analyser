import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PieChart, 
  MessageSquare, 
  Home, 
  TrendingUp,
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: TrendingUp, label: 'Analyzer', path: '/analyzer' },
  { icon: MessageSquare, label: 'AI Advisor', path: '/advisor' },
];

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-['Inter'] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl fixed h-full z-50">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Wallet className="text-blue-500" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight font-['Outfit'] text-white">Nexus Finance</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn("transition-transform group-hover:scale-110")} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.path === '/advisor' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Pro Feature</p>
            <p className="text-xs text-gray-400 leading-relaxed">Upgrade for deeper insights and custom reports.</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="text-blue-500" size={20} />
          <span className="font-bold font-['Outfit'] text-white">Nexus</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? { x: 0 } : { x: '-100%' }}
        className="lg:hidden fixed inset-0 z-40 bg-[#0a0a0a] pt-24 px-6"
      >
        <nav className="space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-6 py-5 rounded-2xl text-lg font-semibold transition-all",
                isActive ? "bg-blue-500/10 text-blue-500" : "text-gray-400"
              )}
            >
              <item.icon size={24} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </motion.div>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pt-20 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
