import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  X,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import ChartCard from '../components/ChartCard';
import { api } from '../services/mockData';

const FundComparison = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const comparison = await api.getFundComparison();
        setData(comparison);
      } catch (error) {
        console.error("Error fetching comparison data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-120px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  );

  const performanceData = data.funds[0].performance.map((p, i) => ({
    month: p.month,
    [data.funds[0].name]: p.val,
    [data.funds[1].name]: data.funds[1].performance[i].val,
  }));

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Fund Comparison</h1>
          <p className="text-fintech-slate-500">Side-by-side analysis of potential holdings.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
          <Plus size={18} />
          Add Fund
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <ChartCard 
            title="Performance Comparison" 
            subtitle="Relative growth over 12 months"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={data.funds[0].name} 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6' }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey={data.funds[1].name} 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-fintech-slate-400 uppercase tracking-wider px-1">Selected Funds</h4>
          {data.funds.map((fund, index) => (
            <div key={fund.id} className="premium-card p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${index === 0 ? 'bg-brand-primary' : 'bg-brand-secondary'}`}></div>
                <div>
                  <p className="text-sm font-bold text-white line-clamp-1">{fund.name}</p>
                  <p className="text-xs text-fintech-slate-500">CAGR: {fund.cagr}%</p>
                </div>
              </div>
              <button className="p-1.5 text-fintech-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="border-2 border-dashed border-fintech-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-fintech-slate-900/50 transition-all">
            <Search size={24} className="text-fintech-slate-600" />
            <p className="text-xs font-medium text-fintech-slate-500">Find another fund</p>
          </div>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-6 border-b border-fintech-slate-800 flex items-center justify-between bg-fintech-slate-900/30">
          <h3 className="font-bold text-white">Metrics Comparison</h3>
          <div className="flex items-center gap-2 text-xs text-fintech-slate-500">
            <Info size={14} />
            Values are as of last quarter
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-fintech-slate-500 text-xs uppercase tracking-wider bg-fintech-slate-900/50">
                <th className="px-6 py-4 font-medium">Metric</th>
                {data.funds.map(fund => (
                  <th key={fund.id} className="px-6 py-4 font-medium">{fund.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { label: 'Returns (1Y)', key: 'returns1Y', suffix: '%' },
                { label: 'Returns (3Y)', key: 'returns3Y', suffix: '%' },
                { label: 'CAGR', key: 'cagr', suffix: '%' },
                { label: 'Expense Ratio', key: 'expenseRatio', suffix: '%' },
                { label: 'Risk Grade', key: 'risk', suffix: '' },
                { label: 'Portfolio Overlap', key: 'overlap', suffix: '%' },
              ].map((row, i) => (
                <tr key={row.key} className={`border-t border-fintech-slate-800/50 ${i % 2 === 0 ? 'bg-transparent' : 'bg-fintech-slate-900/10'}`}>
                  <td className="px-6 py-4 text-fintech-slate-400 font-medium">{row.label}</td>
                  {data.funds.map(fund => (
                    <td key={fund.id} className="px-6 py-4">
                      <span className={`font-semibold ${
                        typeof fund[row.key] === 'number' && fund[row.key] > 10 ? 'text-emerald-500' : 'text-white'
                      }`}>
                        {fund[row.key]}{row.suffix}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FundComparison;
