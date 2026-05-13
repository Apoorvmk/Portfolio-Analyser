import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'My Portfolio', path: '/', icon: Briefcase },
    { name: 'Analysis', path: '/analysis', icon: LayoutDashboard },
    { name: 'MF Comparison', path: '/comparison', icon: ArrowLeftRight },
    { name: 'AI Assistant', path: '/chatbot', icon: MessageSquare },
  ];

  return (
    <div className={`h-screen sticky top-0 bg-[#0f172a] border-r border-[#334155] flex flex-col transition-all duration-200 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center justify-between border-b border-[#334155]">
        {isOpen && <h1 className="text-xl font-bold text-white truncate">Nexus Finance</h1>}
        <button onClick={toggleSidebar} className="p-2 bg-[#1e293b] rounded-lg text-white">
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#1e293b] hover:text-white'}`}
          >
            <item.icon size={20} />
            {isOpen && <span className="font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
