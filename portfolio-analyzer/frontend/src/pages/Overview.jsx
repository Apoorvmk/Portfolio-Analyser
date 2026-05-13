import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  BarChart3, 
  AlertCircle, 
  Zap, 
  ExternalLink,
  Target,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell
} from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import { Link } from 'react-router-dom';

const POWERBI_LINK_PLACEHOLDER = "https://app.powerbi.com/groups/me/reports/c4f88e3f-3737-448a-9907-9d4f3c3e6ed9/e854cd5cbe7754b65b9a?experience=power-bi";

export default function Overview() {
  const { report, narrative } = usePortfolio();

  if (!report) {
    return (
      <div className="p-8 text-center bg-[#0f172a] min-h-screen text-white flex flex-col items-center justify-center">
        <div className="bg-[#1e293b] p-8 rounded-xl border border-[#334155] max-w-md">
          <Activity size={48} className="mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-gray-400 mb-6">Please add stocks to your portfolio and run the analysis first.</p>
          <Link to="/" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold">Go to Portfolio</Link>
        </div>
      </div>
    );
  }

  const gapData = Object.entries(report.gap_analysis || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value) || 0
  })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-[#0f172a] min-h-screen text-white">
      <header className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[#334155] pb-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analysis</h1>
          <p className="text-gray-400">Benchmark: {report.selected_fund_name}</p>
        </div>
        <button 
          onClick={() => window.open(POWERBI_LINK_PLACEHOLDER, "_blank")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
        >
          <ExternalLink size={16} /> Power BI Dashboard
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Entropy', value: report.entropy, icon: Zap },
          { label: 'HHI', value: report.hhi, icon: Target },
          { label: 'Coverage', value: report.coverage, icon: BarChart3 },
          { label: 'Health Score', value: (report.diversification_score * 10).toFixed(1), icon: Activity }
        ].map((item, i) => (
          <div key={i} className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
            <item.icon size={20} className="text-blue-500 mb-2" />
            <p className="text-xs text-gray-400 uppercase font-bold">{item.label}</p>
            <p className="text-2xl font-bold">{typeof item.value === 'number' ? item.value.toFixed(3) : item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" /> Sector Gaps
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gapData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {gapData.map((entry, index) => (
                  <Cell key={index} fill={entry.value >= 0 ? '#3b82f6' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {narrative && (
        <div className="bg-[#1e293b] p-8 rounded-xl border border-[#334155] space-y-4">
          <div className="flex items-center gap-2 text-blue-500">
            <Sparkles size={24} />
            <h2 className="text-xl font-bold">AI Narrative</h2>
          </div>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{narrative}</p>
        </div>
      )}
    </div>
  );
}