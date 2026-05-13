import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowLeftRight, 
  Zap,
  Loader2,
  PieChart as PieChartIcon,
  Scaling,
  Dna
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis
} from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import { recommendFunds, analyzePortfolio } from '../services/api';
import Select from 'react-select';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: '#1e293b',
    borderColor: state.isFocused ? '#3b82f6' : '#334155',
    borderRadius: '8px',
    color: '#fff'
  }),
  menu: (base) => ({
    ...base,
    background: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155'
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? '#334155' : 'transparent',
    color: '#f1f5f9'
  }),
  singleValue: (base) => ({
    ...base,
    color: '#f1f5f9'
  })
};

export default function MFComparison() {
  const { stocks, availableFunds, report: currentReport, setReport, selectedFund, setSelectedFund } = usePortfolio();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    if (stocks?.length > 0 && stocks.some(s => s.stock_name && s.amount_invested)) {
      fetchRecommendation();
    }
  }, [stocks]);

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      const payload = {
        portfolio: {
          stocks: stocks.map(s => ({
            ...s,
            amount_invested: parseFloat(s.amount_invested) || 0
          })).filter(s => s.stock_name && s.amount_invested > 0)
        }
      };
      const data = await recommendFunds(payload);
      setRecommendation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFundChange = async (fundName) => {
    setSelectedFund(fundName);
    setCompareLoading(true);
    try {
      const payload = {
        portfolio: {
          stocks: stocks.map(s => ({
            ...s,
            amount_invested: parseFloat(s.amount_invested) || 0
          })).filter(s => s.stock_name && s.amount_invested > 0)
        },
        selected_fund: fundName
      };
      const data = await analyzePortfolio(payload);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCompareLoading(false);
    }
  };

  if (!currentReport) {
    return (
      <div className="p-8 text-center bg-[#0f172a] min-h-screen text-white flex flex-col items-center justify-center">
        <div className="bg-[#1e293b] p-8 rounded-xl border border-[#334155] max-w-md">
          <Scaling size={48} className="mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl font-bold mb-2">Comparison Ready</h2>
          <p className="text-gray-400 mb-6">Run a portfolio analysis in the first tab to unlock benchmark matching.</p>
          <Link to="/" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold">Go to Portfolio</Link>
        </div>
      </div>
    );
  }

  const comparisonData = Object.entries(currentReport?.sector_allocation || {}).map(([sector, userAlloc]) => {
    const gap = currentReport.gap_analysis[sector] || 0;
    return {
      sector,
      "You": userAlloc,
      "Benchmark": Math.max(0, userAlloc - gap)
    };
  }).sort((a, b) => b["You"] - a["You"]).slice(0, 8);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-[#0f172a] min-h-screen text-white">
      <header className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[#334155] pb-6">
        <div>
          <h1 className="text-3xl font-bold">MF Comparison</h1>
          <p className="text-gray-400">Benchmark vs Mutual Funds</p>
        </div>
        <div className="w-64">
          <Select
            styles={selectStyles}
            options={availableFunds?.map(f => ({ label: f, value: f })) || []}
            value={{ label: selectedFund, value: selectedFund }}
            onChange={(opt) => handleFundChange(opt.value)}
          />
        </div>
      </header>

      {recommendation?.top_match && (
        <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Zap className="text-blue-500" size={32} />
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Top Match Similarity</p>
              <h3 className="text-2xl font-bold">{(recommendation.top_match.similarity * 100).toFixed(1)}% Match</h3>
            </div>
          </div>
          <div className="bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-500/50">
             <span className="text-blue-400 font-bold">{recommendation.top_match.fund_name}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
          <h2 className="text-xl font-bold mb-6">Correlation Matrix</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={comparisonData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="sector" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="You" dataKey="You" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Benchmark" dataKey="Benchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
          <h2 className="text-xl font-bold mb-6">Side-by-Side Allocation</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="sector" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar dataKey="You" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Benchmark" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
