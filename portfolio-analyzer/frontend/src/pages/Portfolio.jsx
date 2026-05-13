import React, { useState } from 'react';
import Select from 'react-select';
import { 
  Plus, 
  Trash2, 
  Wallet,
  Sparkles,
  Loader2,
  AlertCircle,
  Briefcase,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import { analyzePortfolio, getReportNarrative } from '../services/api';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: '#1e293b',
    borderColor: state.isFocused ? '#3b82f6' : '#334155',
    borderRadius: '8px',
    padding: '2px',
    color: '#fff'
  }),
  menu: (base) => ({
    ...base,
    background: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155',
    zIndex: 50
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? '#334155' : 'transparent',
    color: '#f1f5f9',
    padding: '10px'
  }),
  singleValue: (base) => ({
    ...base,
    color: '#f1f5f9'
  }),
  input: (base) => ({
    ...base,
    color: '#f1f5f9'
  })
};

export default function Portfolio() {
  const { 
    stocks, setStocks, 
    setReport, 
    setNarrative,
    availableFunds, availableStocks,
    selectedFund, setSelectedFund
  } = usePortfolio();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    if (stocks.filter(s => s.stock_name && s.amount_invested > 0).length === 0) return;
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
        selected_fund: selectedFund || (availableFunds && availableFunds[0])
      };
      
      const data = await analyzePortfolio(payload);
      setReport(data);
      
      try {
        const narrativeData = await getReportNarrative(data);
        setNarrative(narrativeData.narrative);
      } catch (narrativeErr) {
        console.error("Failed to fetch narrative:", narrativeErr);
      }
      
      navigate('/analysis');
    } catch (err) {
      setError("Analysis failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const totalInvested = stocks.reduce((sum, s) => sum + (parseFloat(s.amount_invested) || 0), 0);
  
  const sectorData = stocks.reduce((acc, stock) => {
    if (stock.sector && stock.amount_invested) {
      acc[stock.sector] = (acc[stock.sector] || 0) + parseFloat(stock.amount_invested);
    }
    return acc;
  }, {});

  const chartData = Object.entries(sectorData).map(([name, value]) => ({
    name,
    value: totalInvested > 0 ? (value / totalInvested) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-[#0f172a] min-h-screen text-white">
      <header className="flex flex-col md:flex-row justify-between gap-4 border-b border-[#334155] pb-6">
        <div>
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <p className="text-gray-400">Manage your stock holdings</p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
          <p className="text-xs text-gray-400 uppercase font-bold">Total Portfolio Value</p>
          <p className="text-2xl font-bold">₹{totalInvested.toLocaleString('en-IN')}</p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Holdings</h2>
            <button onClick={addStock} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <Plus size={16} /> Add Stock
            </button>
          </div>
          
          <div className="space-y-4">
            {stocks.map((stock, index) => (
              <div key={index} className="bg-[#1e293b] p-4 rounded-xl border border-[#334155] flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Stock Name</label>
                  <Select
                    styles={selectStyles}
                    options={availableStocks}
                    value={availableStocks.find(s => s.value === stock.stock_name)}
                    onChange={(opt) => handleStockSelect(index, opt)}
                  />
                </div>
                <div className="w-32">
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Amount (₹)</label>
                  <input
                    type="number"
                    className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white"
                    value={stock.amount_invested}
                    onChange={(e) => updateStockField(index, 'amount_invested', e.target.value)}
                  />
                </div>
                <button onClick={() => removeStock(index)} className="p-2 text-gray-500 hover:text-red-500">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
            <h2 className="text-xl font-bold mb-4">Sector Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {chartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] space-y-4">
            <h2 className="text-xl font-bold">Benchmark</h2>
            <Select
              styles={selectStyles}
              options={availableFunds?.map(f => ({ label: f, value: f })) || []}
              value={selectedFund ? { label: selectedFund, value: selectedFund } : null}
              onChange={(opt) => setSelectedFund(opt.value)}
            />
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {loading ? "Analyzing..." : "Analyze Portfolio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
