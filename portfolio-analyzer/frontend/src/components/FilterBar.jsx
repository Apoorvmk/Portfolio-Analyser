import React from 'react';
import { Calendar, Filter, ChevronDown } from 'lucide-react';

const FilterBar = () => {
  const filters = [
    { name: 'Asset Class', options: ['All', 'Equity', 'Debt', 'Gold', 'Cash'] },
    { name: 'Sector', options: ['All', 'IT', 'Banking', 'Pharma', 'Energy'] },
    { name: 'Period', options: ['1M', '3M', '6M', '1Y', 'All'] },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        {filters.map((filter) => (
          <div key={filter.name} className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-fintech-slate-900 border border-fintech-slate-800 rounded-xl text-sm font-medium text-fintech-slate-300 hover:border-brand-primary transition-all">
              {filter.name}: <span className="text-white">{filter.options[0]}</span>
              <ChevronDown size={14} className="text-fintech-slate-500" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-medium hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
          <Calendar size={16} />
          Custom Range
        </button>
        <button className="p-2 bg-fintech-slate-900 border border-fintech-slate-800 rounded-xl text-fintech-slate-400 hover:text-white transition-all">
          <Filter size={18} />
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
