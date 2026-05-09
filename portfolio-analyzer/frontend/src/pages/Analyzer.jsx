import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { 
  Plus, 
  Trash2, 
  PieChart as PieChartIcon, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Loader2,
  BarChart3,
  Sparkles,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { analyzePortfolio, getReportNarrative } from '../services/api';
import { usePortfolio } from '../context/PortfolioContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: 'rgba(255, 255, 255, 0.03)',
    borderColor: state.isFocused ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '4px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    }
  }),
  menu: (base) => ({
    ...base,
    background: '#0a0a0a',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    zIndex: 50
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    color: state.isSelected ? '#3b82f6' : '#9ca3af',
    fontSize: '13px',
    padding: '12px 16px',
    '&:active': {
      background: 'rgba(59, 130, 246, 0.2)',
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: '#f3f4f6',
    fontSize: '13px'
  }),
  input: (base) => ({
    ...base,
    color: '#f3f4f6'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#4b5563',
    fontSize: '13px'
  })
};

export default function Analyzer() {
  const { 
    stocks, setStocks, 
    report, setReport, 
    narrative, setNarrative,
    availableFunds, availableStocks,
    selectedFund, setSelectedFund
  } = usePortfolio();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addStock = () => {
    setStocks([...stocks, { stock_name: '', amount_invested: '', sector: '' }]);
  };

  const removeStock = (index) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const updateStockField = (index, field, value) => {
    const newStocks = [...stocks];
    newStocks[index][field] = value;
    setStocks(newStocks);
  };

  const handleStockSelect = (index, option) => {
    const newStocks = [...stocks];
    newStocks[index].stock_name = option.value;
    newStocks[index].sector = option.sector;
    setStocks(newStocks);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        portfolio: {
          stocks: stocks.map(s => ({
            ...s,
            amount_invested: parseFloat(s.amount_invested) || 0
          })).filter(s => s.stock_name && s.amount_invested > 0)
        },
        selected_fund: selectedFund
      };
      
      const data = await analyzePortfolio(payload);
      setReport(data);
      
      try {
        const narrativeData = await getReportNarrative(data);
        setNarrative(narrativeData.narrative);
      } catch (narrativeErr) {
        console.error("Failed to fetch narrative:", narrativeErr);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Analysis failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Input Sidebar */}
      <aside className="w-full lg:w-[450px] border-r border-white/5 flex flex-col bg-[#080808]">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-2xl font-bold font-['Outfit'] text-white">Portfolio</h2>
             <button 
                onClick={addStock}
                className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20"
              >
                <Plus size={18} />
              </button>
          </div>
          <p className="text-xs text-gray-500">Configure your holdings for deep analysis</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <AnimatePresence>
            {stocks.map((stock, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 block">Asset</label>
                    <Select
                      styles={selectStyles}
                      options={availableStocks}
                      value={availableStocks.find(s => s.value === stock.stock_name)}
                      onChange={(opt) => handleStockSelect(index, opt)}
                      placeholder="Select security..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 block">Value (₹)</label>
                      <input
                        type="number"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white"
                        value={stock.amount_invested}
                        onChange={(e) => updateStockField(index, 'amount_invested', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 block">Sector</label>
                      <div className="px-4 py-3 bg-white/[0.01] border border-white/5 rounded-xl text-sm text-gray-500 truncate">
                        {stock.sector || 'Auto-detected'}
                      </div>
                    </div>
                  </div>
                </div>

                {stocks.length > 1 && (
                  <button 
                    onClick={() => removeStock(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-[#0a0a0a] border-t border-white/5 space-y-4">
          <div>
             <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 block">Benchmark Target</label>
             <Select
                styles={selectStyles}
                options={availableFunds.map(f => ({ label: f, value: f }))}
                value={{ label: selectedFund, value: selectedFund }}
                onChange={(opt) => setSelectedFund(opt.value)}
              />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 text-white shadow-lg shadow-blue-600/10"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {loading ? "Analyzing..." : "Run Intelligence"}
          </button>
        </div>
      </aside>

      {/* Results View */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#050505] to-[#0a0a0a] p-8 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-400">
              <AlertCircle size={24} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {!report && !loading && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="relative mb-8">
                 <div className="w-32 h-32 bg-blue-500/5 rounded-[40px] border border-blue-500/10 flex items-center justify-center">
                    <Activity size={48} className="text-blue-500/20" />
                 </div>
                 <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-500 blur-3xl rounded-full -z-10"
                 />
              </div>
              <h2 className="text-3xl font-bold font-['Outfit'] text-white mb-4">Ready for Analysis</h2>
              <p className="text-gray-500 max-w-sm">Enter your portfolio holdings to generate institutional-grade diversification reports.</p>
            </div>
          )}

          {report && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Narrative Section */}
              {narrative && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[36px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                  <section className="relative p-8 rounded-[32px] bg-[#0d0d0d] border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Sparkles size={20} />
                      </div>
                      <h3 className="text-lg font-bold font-['Outfit'] text-white uppercase tracking-tight">Executive Narrative</h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                      {narrative}
                    </p>
                  </section>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                  { label: 'Health Score', value: `${report.diversification_score}/10`, icon: Activity, color: 'text-blue-400' },
                  { label: 'HHI Intensity', value: report.hhi, icon: PieChartIcon, color: 'text-purple-400' },
                  { label: 'Entropy Level', value: report.entropy, icon: TrendingUp, color: 'text-emerald-400' },
                  { label: 'Sector Count', value: report.coverage, icon: BarChart3, color: 'text-amber-400' },
                ].map((m, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                    <div className={cn("p-2 rounded-xl bg-white/[0.03] w-fit mb-4", m.color)}>
                      <m.icon size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{m.label}</p>
                    <p className="text-3xl font-bold text-white font-['Outfit']">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="p-8 rounded-[32px] bg-[#0d0d0d] border border-white/5">
                  <h3 className="text-lg font-bold font-['Outfit'] mb-8 text-white flex items-center gap-2">
                    <PieChartIcon className="text-blue-500" size={20} /> Composition
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={Object.entries(report.sector_allocation).map(([name, value]) => ({ name, value }))}
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {Object.entries(report.sector_allocation).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-8 rounded-[32px] bg-[#0d0d0d] border border-white/5">
                   <h3 className="text-lg font-bold font-['Outfit'] mb-8 text-white flex items-center gap-2">
                    <BarChart3 className="text-purple-500" size={20} /> Benchmark Gap
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(report.gap_analysis).map(([name, value]) => ({ name, value })).slice(0, 6)}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563' }} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }} />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                           {Object.entries(report.gap_analysis).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry[1] >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
