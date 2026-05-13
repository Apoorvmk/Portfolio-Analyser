import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  BarChart, 
  Info,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import { api } from '../services/mockData';

const RiskAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metrics, radar, scatter] = await Promise.all([
          api.getRiskMetrics(),
          api.getDiversificationRadar(),
          api.getRiskReturnScatter()
        ]);
        setData({ metrics, radar, scatter });
      } catch (error) {
        console.error("Error fetching risk data:", error);
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

  return (
    <div className="p-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Risk & Diversification</h1>
        <p className="text-fintech-slate-500">Analyze your portfolio's sensitivity and distribution metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard 
          title="Volatility (Std Dev)" 
          value={data.metrics.volatility} 
          suffix="%" 
          trend="down" 
          trendValue={1.2} 
          icon={Activity}
          decimals={1}
        />
        <KPICard 
          title="Beta" 
          value={data.metrics.beta} 
          trend="up" 
          trendValue={0.05} 
          icon={Compass}
          decimals={2}
        />
        <KPICard 
          title="Sharpe Ratio" 
          value={data.metrics.sharpeRatio} 
          icon={ShieldAlert}
          decimals={2}
        />
      </div>

      {data.metrics.concentrationWarning && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="text-amber-500 font-semibold mb-1">Concentration Alert</h4>
            <p className="text-amber-200/80 text-sm leading-relaxed">{data.metrics.concentrationWarning}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard 
          title="Diversification Radar" 
          subtitle="Score across multiple dimensions"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
              <Radar
                name="Portfolio"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Risk vs Return" 
          subtitle="Comparison with major benchmarks"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                type="number" 
                dataKey="risk" 
                name="Risk" 
                unit="%" 
                stroke="#64748b" 
                fontSize={12}
                label={{ value: 'Risk (Volatility)', position: 'bottom', fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                type="number" 
                dataKey="return" 
                name="Return" 
                unit="%" 
                stroke="#64748b" 
                fontSize={12}
                label={{ value: 'Return (CAGR)', angle: -90, position: 'left', fill: '#64748b', fontSize: 12 }}
              />
              <ZAxis type="number" range={[100, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Assets" data={data.scatter} fill="#3b82f6">
                {data.scatter.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Your Portfolio' ? '#10b981' : '#3b82f6'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="premium-card p-8">
        <div className="flex items-center gap-2 mb-6">
          <Info className="text-brand-primary" size={20} />
          <h3 className="text-xl font-bold text-white">Risk Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0"></div>
              <p className="text-fintech-slate-400 text-sm">
                Your <span className="text-white font-medium">Beta of {data.metrics.beta}</span> suggests your portfolio is slightly more volatile than the market.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
              <p className="text-fintech-slate-400 text-sm">
                A <span className="text-white font-medium">Sharpe Ratio of {data.metrics.sharpeRatio}</span> is considered good, indicating healthy risk-adjusted returns.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
              <p className="text-fintech-slate-400 text-sm">
                Concentration in <span className="text-white font-medium">Technology sector</span> is above the recommended 25% threshold.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary mt-2 shrink-0"></div>
              <p className="text-fintech-slate-400 text-sm">
                Geographic diversification is low ({data.radar.find(r => r.subject === 'Geography').A}%). Consider international funds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
