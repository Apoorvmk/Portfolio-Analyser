import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFunds, getStocks } from '../services/api';

const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  const [stocks, setStocks] = useState([
    { stock_name: '', amount_invested: '', sector: '' }
  ]);
  const [report, setReport] = useState(null);
  const [narrative, setNarrative] = useState('');
  const [availableFunds, setAvailableFunds] = useState([]);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [selectedFund, setSelectedFund] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundsData, stocksData] = await Promise.all([getFunds(), getStocks()]);
        setAvailableFunds(fundsData.funds);
        if (fundsData.funds.length > 0) setSelectedFund(fundsData.funds[0]);
        
        const stockOptions = stocksData.stocks.map(s => ({
          label: s.stock,
          value: s.stock,
          sector: s.sector
        }));
        setAvailableStocks(stockOptions);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    fetchData();
  }, []);

  const value = {
    stocks,
    setStocks,
    report,
    setReport,
    narrative,
    setNarrative,
    availableFunds,
    availableStocks,
    selectedFund,
    setSelectedFund,
    chatHistory,
    setChatHistory
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
