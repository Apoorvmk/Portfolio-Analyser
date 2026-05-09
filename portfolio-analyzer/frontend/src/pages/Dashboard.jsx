import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  PieChart as PieChartIcon,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { report } = usePortfolio();
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-[#050505]">
        <div className="p-12 rounded-[48px] bg-white/[0.02] border border-white/5 mb-8">
           <LayoutDashboard size={64} className="text-gray-800" />
        </div>
        <h2 className="text-3xl font-bold font-['Outfit'] text-white mb-4">No Portfolio Active</h2>
        <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
          Your dashboard is empty. Launch the analyzer to build your portfolio and unlock these insights.
        </p>
        <button 
          onClick={() => navigate('/analyzer')}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center gap-2 transition-all"
        >
          Go to Analyzer <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold font-['Outfit'] text-white">Portfolio Overview</h1>
            <p className="text-gray-500 mt-2">Benchmark: {report.selected_fund_name}</p>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Health Status</p>
                <div className="flex items-center gap-2">
                   <ShieldCheck size={18} className="text-emerald-500" />
                   <span className="text-xl font-bold text-white">Optimal</span>
                </div>
             </div>
             <div className="px-6 py-4 rounded-3xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Score</p>
                <div className="flex items-center gap-2">
                   <Zap size={18} className="text-blue-500" />
                   <span className="text-xl font-bold text-white">{report.diversification_score}/10</span>
                </div>
             </div>
          </div>
        </div>

        {/* Global Flags */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Overexposed */}
           <div className="p-8 rounded-[32px] bg-[#0d0d0d] border border-white/5 space-y-6">
              <div className="flex items-center gap-3 text-amber-500">
                 <AlertTriangle size={20} />
                 <h3 className="font-bold font-['Outfit'] uppercase tracking-tight text-white">Concentration Risks</h3>
              </div>
              <div className="space-y-3">
                 {report.over_exposed_sectors.map(s => (
                   <div key={s} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-500 uppercase">{s}</span>
                      <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded font-black">HIGH</span>
                   </div>
                 ))}
                 {report.over_exposed_sectors.length === 0 && <p className="text-gray-600 text-sm italic">No major over-exposure.</p>}
              </div>
           </div>

           {/* Underrepresented */}
           <div className="p-8 rounded-[32px] bg-[#0d0d0d] border border-white/5 space-y-6">
              <div className="flex items-center gap-3 text-blue-500">
                 <TrendingUp size={20} />
                 <h3 className="font-bold font-['Outfit'] uppercase tracking-tight text-white">Growth Opportunities</h3>
              </div>
              <div className="space-y-3">
                 {report.missing_sectors.map(s => (
                   <div key={s} className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                      <span className="text-xs font-bold text-blue-400 uppercase">{s}</span>
                   </div>
                 ))}
                 {report.missing_sectors.length === 0 && <p className="text-gray-600 text-sm italic">Coverage is excellent.</p>}
              </div>
           </div>

           {/* Quick Actions */}
           <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold font-['Outfit'] text-white text-lg">Advisor Insights</h3>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">I have identified {Object.keys(report.severity_flags).length} critical points in your portfolio that require immediate attention.</p>
              </div>
              <button 
                onClick={() => navigate('/advisor')}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                Consult Advisor <ArrowRight size={18} />
              </button>
           </div>
        </section>

        {/* Detailed Flags */}
        <section className="space-y-6">
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em]">Critical Exposure Matrix</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(report.severity_flags).map(([sector, level]) => (
                <div key={sector} className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        level === 'HIGH' ? "bg-red-500" : "bg-amber-500"
                      )} />
                      <span className="text-sm font-bold text-gray-200 uppercase">{sector}</span>
                   </div>
                   <div className={cn(
                     "px-3 py-1 rounded-lg text-[9px] font-black tracking-tighter",
                     level === 'HIGH' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                   )}>
                     {level} RISK
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
}
