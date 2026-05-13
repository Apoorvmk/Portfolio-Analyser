import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Overview from './pages/Overview';
import CompareGrow from './pages/CompareGrow';
import Portfolio from './pages/Portfolio';
import Chatbot from './pages/Chatbot';
import { PortfolioProvider } from './context/PortfolioContext';

function App() {
  return (
    <PortfolioProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Portfolio />} />
          <Route path="/analysis" element={<Overview />} />
          <Route path="/comparison" element={<CompareGrow />} />
          <Route path="/chatbot" element={<Chatbot />} />
          {/* Fallback routes */}
          <Route path="*" element={<Portfolio />} />
        </Route>
      </Routes>
    </PortfolioProvider>
  );
}

export default App;

