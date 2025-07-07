
import { FundMetrics } from '@/types';
import { fetchHistoricalStockData } from './alphaVantageService';
import { fetchSeekingAlphaFundData, transformSeekingAlphaToFundMetrics } from './seekingAlphaFundService';

export interface FundValuationResults {
  symbol: string;
  name: string;
  currentPrice: number;
  nav: number;
  metrics: FundMetrics;
  valuation: {
    recommendation: 'BUY' | 'HOLD' | 'SELL';
    confidence: number;
    reasoning: string[];
  };
  comparison: {
    vsIndex: number;
    vsCategory: number;
    expenseImpact: number;
  };
}

// Mock data for popular ETFs only - FUNDSMITH removed
const MOCK_FUND_DATA = {
  'SPY': {
    name: 'SPDR S&P 500 ETF',
    nav: 485.20,
    expenseRatio: 0.0945,
    topHoldings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 7.2 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 6.8 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.4 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 3.1 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 2.9 }
    ],
    sectorBreakdown: [
      { sector: 'Technology', weight: 28.5 },
      { sector: 'Healthcare', weight: 13.2 },
      { sector: 'Financials', weight: 11.8 },
      { sector: 'Consumer Discretionary', weight: 10.4 },
      { sector: 'Communication Services', weight: 8.9 }
    ],
    geographicExposure: [
      { region: 'United States', weight: 100.0 }
    ],
    performanceVsBenchmark: { oneYear: 0.02, threeYear: -0.01, fiveYear: 0.03 },
    riskMetrics: { beta: 1.0, sharpeRatio: 0.65, maxDrawdown: -23.9 }
  },
  'QQQ': {
    name: 'Invesco QQQ Trust',
    nav: 402.15,
    expenseRatio: 0.20,
    topHoldings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.9 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 8.1 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.2 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 4.8 },
      { symbol: 'META', name: 'Meta Platforms Inc.', weight: 4.1 }
    ],
    sectorBreakdown: [
      { sector: 'Technology', weight: 52.3 },
      { sector: 'Consumer Discretionary', weight: 15.2 },
      { sector: 'Communication Services', weight: 12.8 },
      { sector: 'Healthcare', weight: 8.4 }
    ],
    geographicExposure: [
      { region: 'United States', weight: 100.0 }
    ],
    performanceVsBenchmark: { oneYear: 0.15, threeYear: 0.08, fiveYear: 0.12 },
    riskMetrics: { beta: 1.15, sharpeRatio: 0.72, maxDrawdown: -32.4 }
  }
};

export const analyzeFundValuation = async (symbol: string): Promise<FundValuationResults> => {
  console.log(`Analyzing fund valuation for: ${symbol}`);
  
  // Fetch current price data
  const historicalData = await fetchHistoricalStockData(symbol);
  const currentPrice = historicalData[0]?.close || 0;
  
  let fundData;
  let fundName = `${symbol} Fund`;
  let nav = currentPrice;
  let metrics: FundMetrics;
  
  // Check if it's a known ETF with mock data
  if (MOCK_FUND_DATA[symbol.toUpperCase()]) {
    fundData = MOCK_FUND_DATA[symbol.toUpperCase()];
    fundName = fundData.name;
    nav = fundData.nav;
    
    // Calculate NAV premium/discount
    const navPremiumDiscount = ((currentPrice - nav) / nav) * 100;
    
    metrics = {
      navPremiumDiscount,
      expenseRatio: fundData.expenseRatio,
      topHoldings: fundData.topHoldings,
      sectorBreakdown: fundData.sectorBreakdown,
      geographicExposure: fundData.geographicExposure,
      performanceVsBenchmark: fundData.performanceVsBenchmark,
      riskMetrics: fundData.riskMetrics
    };
  } else {
    // Try to fetch from Seeking Alpha API for mutual funds
    console.log(`Fetching dynamic fund data for: ${symbol}`);
    const seekingAlphaData = await fetchSeekingAlphaFundData(symbol);
    
    if (seekingAlphaData) {
      fundName = seekingAlphaData.name;
      nav = seekingAlphaData.nav || currentPrice;
      metrics = transformSeekingAlphaToFundMetrics(seekingAlphaData, currentPrice);
    } else {
      // Fallback to generic fund data
      console.log(`Using fallback data for: ${symbol}`);
      const navPremiumDiscount = 0; // Assume trading at NAV
      
      metrics = {
        navPremiumDiscount,
        expenseRatio: 0.75, // Typical mutual fund expense ratio
        topHoldings: [
          { symbol: 'N/A', name: 'Fund holdings not available', weight: 0 }
        ],
        sectorBreakdown: [
          { sector: 'Mixed Assets', weight: 100 }
        ],
        geographicExposure: [
          { region: 'United States', weight: 100 }
        ],
        performanceVsBenchmark: { oneYear: 0, threeYear: 0, fiveYear: 0 },
        riskMetrics: { beta: 1.0, sharpeRatio: 0.5, maxDrawdown: -20.0 }
      };
    }
  }
  
  // Calculate valuation assessment
  const valuation = assessFundValuation(metrics, metrics.navPremiumDiscount);
  
  // Calculate comparisons
  const comparison = {
    vsIndex: metrics.performanceVsBenchmark.fiveYear * 100,
    vsCategory: 2.1, // Mock category outperformance
    expenseImpact: calculateExpenseImpact(metrics.expenseRatio)
  };
  
  return {
    symbol,
    name: fundName,
    currentPrice,
    nav,
    metrics,
    valuation,
    comparison
  };
};

const assessFundValuation = (metrics: FundMetrics, navPremiumDiscount: number) => {
  const reasoning: string[] = [];
  let score = 0;
  
  // NAV premium/discount assessment
  if (Math.abs(navPremiumDiscount) < 0.1) {
    reasoning.push('Trading near NAV with minimal premium/discount');
    score += 0.5;
  } else if (navPremiumDiscount > 0.5) {
    reasoning.push(`Trading at ${navPremiumDiscount.toFixed(2)}% premium to NAV`);
    score -= 1;
  } else if (navPremiumDiscount < -0.5) {
    reasoning.push(`Trading at ${Math.abs(navPremiumDiscount).toFixed(2)}% discount to NAV`);
    score += 1;
  }
  
  // Expense ratio assessment
  if (metrics.expenseRatio < 0.2) {
    reasoning.push(`Low expense ratio of ${metrics.expenseRatio}% is cost-effective`);
    score += 0.5;
  } else if (metrics.expenseRatio > 1.0) {
    reasoning.push(`High expense ratio of ${metrics.expenseRatio}% may impact returns`);
    score -= 0.5;
  }
  
  // Performance assessment
  if (metrics.performanceVsBenchmark.fiveYear > 0.05) {
    reasoning.push('Strong long-term outperformance vs benchmark');
    score += 1;
  } else if (metrics.performanceVsBenchmark.fiveYear < -0.05) {
    reasoning.push('Underperformance vs benchmark over 5 years');
    score -= 1;
  }
  
  // Risk-adjusted returns
  if (metrics.riskMetrics.sharpeRatio > 0.8) {
    reasoning.push(`Excellent risk-adjusted returns (Sharpe: ${metrics.riskMetrics.sharpeRatio})`);
    score += 0.5;
  } else if (metrics.riskMetrics.sharpeRatio < 0.4) {
    reasoning.push(`Poor risk-adjusted returns (Sharpe: ${metrics.riskMetrics.sharpeRatio})`);
    score -= 0.5;
  }
  
  // Determine recommendation
  let recommendation: 'BUY' | 'HOLD' | 'SELL';
  let confidence: number;
  
  if (score > 1) {
    recommendation = 'BUY';
    confidence = Math.min(85, 65 + Math.abs(score) * 8);
  } else if (score < -1) {
    recommendation = 'SELL';
    confidence = Math.min(85, 65 + Math.abs(score) * 8);
  } else {
    recommendation = 'HOLD';
    confidence = 70;
  }
  
  return {
    recommendation,
    confidence,
    reasoning
  };
};

const calculateExpenseImpact = (expenseRatio: number): number => {
  // Calculate the impact of expenses on a $10,000 investment over 10 years
  const investment = 10000;
  const years = 10;
  const assumedReturn = 0.07; // 7% annual return
  
  const withoutExpenses = investment * Math.pow(1 + assumedReturn, years);
  const withExpenses = investment * Math.pow(1 + assumedReturn - expenseRatio/100, years);
  
  return withoutExpenses - withExpenses;
};
