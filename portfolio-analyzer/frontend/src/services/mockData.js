export const mockPortfolioSummary = {
  totalValue: 1245678.50,
  investedAmount: 1000000.00,
  returns: 245678.50,
  returnsPercentage: 24.57,
  riskScore: 68,
  diversificationScore: 82,
  cagr: 18.4,
  topSector: "Technology",
  topHolding: "HDFC Bank",
};

export const mockSectorAllocation = [
  { name: 'Technology', value: 35 },
  { name: 'Financials', value: 25 },
  { name: 'Healthcare', value: 15 },
  { name: 'Consumer Goods', value: 15 },
  { name: 'Energy', value: 10 },
];

export const mockAssetDistribution = [
  { name: 'Equity', value: 70 },
  { name: 'Debt', value: 20 },
  { name: 'Gold', value: 5 },
  { name: 'Cash', value: 5 },
];

export const mockGrowthTrend = [
  { date: '2023-01', value: 1000000 },
  { date: '2023-03', value: 1050000 },
  { date: '2023-06', value: 1120000 },
  { date: '2023-09', value: 1080000 },
  { date: '2023-12', value: 1180000 },
  { date: '2024-03', value: 1245678 },
];

export const mockTopHoldings = [
  { name: 'Reliance Industries', value: 125000, percentage: 10 },
  { name: 'HDFC Bank', value: 110000, percentage: 8.8 },
  { name: 'TCS', value: 95000, percentage: 7.6 },
  { name: 'Infosys', value: 80000, percentage: 6.4 },
  { name: 'ICICI Bank', value: 75000, percentage: 6.0 },
];

export const mockRiskMetrics = {
  volatility: 12.5,
  beta: 1.15,
  sharpeRatio: 1.8,
  concentrationWarning: "Your portfolio is highly concentrated in Technology (35%). Consider diversifying into Healthcare or Energy.",
  riskClassification: "Moderate-High",
};

export const mockDiversificationRadar = [
  { subject: 'Sector', A: 80, fullMark: 100 },
  { subject: 'Market Cap', A: 90, fullMark: 100 },
  { subject: 'Asset Class', A: 70, fullMark: 100 },
  { subject: 'Geography', A: 50, fullMark: 100 },
  { subject: 'Strategy', A: 85, fullMark: 100 },
];

export const mockRiskReturnScatter = [
  { name: 'Your Portfolio', risk: 12.5, return: 18.4 },
  { name: 'Nifty 50', risk: 15.2, return: 14.5 },
  { name: 'S&P 500', risk: 14.8, return: 12.2 },
  { name: 'Conservative Fund', risk: 6.5, return: 8.5 },
];

export const mockFundComparison = {
  funds: [
    {
      id: 1,
      name: 'Axis Bluechip Fund',
      returns1Y: 15.2,
      returns3Y: 12.5,
      cagr: 14.8,
      expenseRatio: 0.75,
      risk: 'Low-Moderate',
      overlap: 45,
      performance: [
        { month: 'Jan', val: 100 },
        { month: 'Feb', val: 102 },
        { month: 'Mar', val: 101 },
        { month: 'Apr', val: 105 },
        { month: 'May', val: 108 },
      ]
    },
    {
      id: 2,
      name: 'SBI Bluechip Fund',
      returns1Y: 14.8,
      returns3Y: 13.2,
      cagr: 15.1,
      expenseRatio: 0.82,
      risk: 'Moderate',
      overlap: 45,
      performance: [
        { month: 'Jan', val: 100 },
        { month: 'Feb', val: 101 },
        { month: 'Mar', val: 103 },
        { month: 'Apr', val: 104 },
        { month: 'May', val: 106 },
      ]
    }
  ]
};

export const api = {
  getPortfolioSummary: () => Promise.resolve(mockPortfolioSummary),
  getSectorAllocation: () => Promise.resolve(mockSectorAllocation),
  getAssetDistribution: () => Promise.resolve(mockAssetDistribution),
  getGrowthTrend: () => Promise.resolve(mockGrowthTrend),
  getTopHoldings: () => Promise.resolve(mockTopHoldings),
  getRiskMetrics: () => Promise.resolve(mockRiskMetrics),
  getDiversificationRadar: () => Promise.resolve(mockDiversificationRadar),
  getRiskReturnScatter: () => Promise.resolve(mockRiskReturnScatter),
  getFundComparison: () => Promise.resolve(mockFundComparison),
};
