import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Advisor from './pages/Advisor';
import { PortfolioProvider } from './context/PortfolioContext';

function App() {
  return (
    <PortfolioProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analyzer" element={<Analyzer />} />
          <Route path="advisor" element={<Advisor />} />
          <Route path="insights" element={<div className="p-20 text-white">Insights Page Coming Soon</div>} />
        </Route>
      </Routes>
    </PortfolioProvider>
  );
}

export default App;
