import React from 'react';
import { Maximize2, MoreHorizontal } from 'lucide-react';

const ChartCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`premium-card p-6 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-fintech-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-fintech-slate-500 hover:text-white hover:bg-fintech-slate-800 rounded-lg transition-colors">
            <Maximize2 size={16} />
          </button>
          <button className="p-2 text-fintech-slate-500 hover:text-white hover:bg-fintech-slate-800 rounded-lg transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
