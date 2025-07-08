import { IndexMetrics } from '@/types';
import { fetchHistoricalStockData } from './alphaVantageService';

export interface IndexValuationResults {
  symbol: string;
  name: string;
  currentPrice: number;
  metrics: IndexMetrics;
  valuation: {
    currentLevel: 'Undervalued' | 'Fair Value' | 'Overvalued';
    confidence: number;
    reasoning: string[];
  };
  historicalContext: {
    pePercentile: number;
    capePercentile: number;
    earningsYieldRank: string;
  };
}

export const analyzeIndexValuation = async (symbol: string): Promise<IndexValuationResults> => {
  console.log(`Analyzing index valuation for: ${symbol}`);
  
  // Fetch current price data
  const historicalData = await fetchHistoricalStockData(symbol);
  const currentPrice = historicalData[0]?.close || 0;
  
  if (!currentPrice) {
    throw new Error(`Unable to fetch price data for ${symbol}. Please try again later.`);
  }
  
  // Calculate basic metrics from historical price data
  const metrics = calculateBasicMetrics(historicalData, currentPrice, symbol);
  
  // Perform valuation assessment
  const valuation = assessIndexValuation(metrics, historicalData);
  
  // Calculate historical context percentiles
  const historicalContext = calculateHistoricalContext(historicalData);
  
  return {
    symbol,
    name: getETFName(symbol),
    currentPrice,
    metrics,
    valuation,
    historicalContext
  };
};

const calculateBasicMetrics = (historicalData: any[], currentPrice: number, symbol: string): IndexMetrics => {
  if (historicalData.length < 2) {
    // Return minimal metrics if insufficient data
    return {
      currentPE: 0,
      historicalPERange: { min: 0, max: 0, percentile25: 0, percentile75: 0 },
      cape: 0,
      earningsYield: 0,
      treasuryYield: 4.5, // Current approximate 10Y Treasury yield
      marketCapToGDP: 0,
      sectorBreakdown: getSectorBreakdown(symbol),
      sentiment: {
        vixLevel: 20, // Approximate current VIX
        putCallRatio: 1.0,
        fearGreedIndex: 50
      }
    };
  }

  // Calculate volatility from price data
  const returns = [];
  for (let i = 1; i < Math.min(historicalData.length, 252); i++) { // Use up to 1 year of data
    const dailyReturn = (historicalData[i-1].close - historicalData[i].close) / historicalData[i].close;
    returns.push(dailyReturn);
  }
  
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance * 252) * 100; // Annualized volatility
  
  // Calculate price-based metrics
  const prices = historicalData.slice(0, 252).map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  
  // Estimate P/E based on price position (simplified approach)
  const pricePercentile = (currentPrice - minPrice) / (maxPrice - minPrice);
  const estimatedPE = 10 + (pricePercentile * 20); // Range from 10-30 based on price position
  
  return {
    currentPE: parseFloat(estimatedPE.toFixed(2)),
    historicalPERange: { 
      min: 8, 
      max: 35, 
      percentile25: 15, 
      percentile75: 25 
    },
    cape: parseFloat((estimatedPE * 0.8).toFixed(2)), // CAPE typically lower than P/E
    earningsYield: parseFloat((100 / estimatedPE).toFixed(2)),
    treasuryYield: 4.5,
    marketCapToGDP: pricePercentile * 200, // Rough estimate
    sectorBreakdown: getSectorBreakdown(symbol),
    sentiment: {
      vixLevel: Math.max(12, Math.min(40, volatility)), // Use calculated volatility as VIX proxy
      putCallRatio: 0.8 + (pricePercentile * 0.4), // Varies with market position
      fearGreedIndex: Math.round(50 + ((avgReturn * 252) * 100)) // Based on annual return
    }
  };
};

const assessIndexValuation = (metrics: IndexMetrics, historicalData: any[]) => {
  const reasoning: string[] = [];
  let score = 0;
  
  // P/E ratio assessment
  if (metrics.currentPE < 15) {
    reasoning.push(`Low P/E ratio of ${metrics.currentPE} suggests potential undervaluation`);
    score += 1;
  } else if (metrics.currentPE > 25) {
    reasoning.push(`High P/E ratio of ${metrics.currentPE} suggests potential overvaluation`);
    score -= 1;
  } else {
    reasoning.push(`P/E ratio of ${metrics.currentPE} is within reasonable range`);
  }
  
  // Earnings yield vs Treasury yield
  if (metrics.earningsYield > metrics.treasuryYield + 2) {
    reasoning.push(`Earnings yield of ${metrics.earningsYield}% significantly exceeds Treasury yield`);
    score += 1;
  } else if (metrics.earningsYield < metrics.treasuryYield) {
    reasoning.push(`Earnings yield of ${metrics.earningsYield}% is below Treasury yield of ${metrics.treasuryYield}%`);
    score -= 1;
  }
  
  // Volatility assessment
  if (metrics.sentiment.vixLevel < 15) {
    reasoning.push('Low volatility suggests market complacency');
    score -= 0.5;
  } else if (metrics.sentiment.vixLevel > 30) {
    reasoning.push('High volatility may present buying opportunities');
    score += 0.5;
  }
  
  // Price momentum from recent data
  if (historicalData.length >= 20) {
    const recentPrice = historicalData[0].close;
    const priceWeeksAgo = historicalData[19].close;
    const momentum = (recentPrice - priceWeeksAgo) / priceWeeksAgo;
    
    if (momentum > 0.1) {
      reasoning.push('Strong recent momentum may indicate overheating');
      score -= 0.5;
    } else if (momentum < -0.1) {
      reasoning.push('Recent weakness may present value opportunity');
      score += 0.5;
    }
  }
  
  // Determine overall assessment
  let currentLevel: 'Undervalued' | 'Fair Value' | 'Overvalued';
  let confidence: number;
  
  if (score > 1) {
    currentLevel = 'Undervalued';
    confidence = Math.min(80, 60 + Math.abs(score) * 10);
  } else if (score < -1) {
    currentLevel = 'Overvalued';
    confidence = Math.min(80, 60 + Math.abs(score) * 10);
  } else {
    currentLevel = 'Fair Value';
    confidence = 65;
  }
  
  return {
    currentLevel,
    confidence,
    reasoning
  };
};

const calculateHistoricalContext = (historicalData: any[]) => {
  // Calculate percentiles based on price history
  const prices = historicalData.slice(0, 252).map(d => d.close); // Last year
  const currentPrice = historicalData[0]?.close || 0;
  
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const currentPercentile = (sortedPrices.findIndex(p => p >= currentPrice) / sortedPrices.length) * 100;
  
  return {
    pePercentile: Math.round(currentPercentile),
    capePercentile: Math.round(currentPercentile * 0.9), // Typically similar to P/E percentile
    earningsYieldRank: currentPercentile > 70 ? 'High' : currentPercentile > 30 ? 'Medium' : 'Low'
  };
};

const getSectorBreakdown = (symbol: string): { sector: string; weight: number }[] => {
  // Provide realistic sector breakdowns based on common ETF types
  const sectorMaps: Record<string, { sector: string; weight: number }[]> = {
    'SPY': [
      { sector: 'Technology', weight: 28.5 },
      { sector: 'Healthcare', weight: 13.2 },
      { sector: 'Financials', weight: 12.8 },
      { sector: 'Consumer Discretionary', weight: 10.9 },
      { sector: 'Communication Services', weight: 8.7 },
      { sector: 'Industrials', weight: 8.1 },
      { sector: 'Consumer Staples', weight: 6.1 },
      { sector: 'Energy', weight: 4.2 },
      { sector: 'Utilities', weight: 2.8 },
      { sector: 'Real Estate', weight: 2.4 },
      { sector: 'Materials', weight: 2.3 }
    ],
    'QQQ': [
      { sector: 'Technology', weight: 48.2 },
      { sector: 'Communication Services', weight: 17.1 },
      { sector: 'Consumer Discretionary', weight: 15.8 },
      { sector: 'Healthcare', weight: 6.2 },
      { sector: 'Industrials', weight: 4.9 },
      { sector: 'Consumer Staples', weight: 4.1 },
      { sector: 'Utilities', weight: 1.8 },
      { sector: 'Energy', weight: 1.2 },
      { sector: 'Materials', weight: 0.7 }
    ],
    'VTI': [
      { sector: 'Technology', weight: 25.1 },
      { sector: 'Healthcare', weight: 14.2 },
      { sector: 'Financials', weight: 13.1 },
      { sector: 'Consumer Discretionary', weight: 10.2 },
      { sector: 'Communication Services', weight: 8.9 },
      { sector: 'Industrials', weight: 8.8 },
      { sector: 'Consumer Staples', weight: 6.5 },
      { sector: 'Energy', weight: 4.1 },
      { sector: 'Utilities', weight: 3.2 },
      { sector: 'Real Estate', weight: 3.1 },
      { sector: 'Materials', weight: 2.8 }
    ]
  };
  
  return sectorMaps[symbol] || [
    { sector: 'Diversified Portfolio', weight: 100 }
  ];
};

const getETFName = (symbol: string): string => {
  const nameMap = {
    SPY: 'SPDR S&P 500 ETF',
    VOO: 'Vanguard S&P 500 ETF',
    IVV: 'iShares Core S&P 500 ETF',
    VTI: 'Vanguard Total Stock Market ETF',
    VEA: 'Vanguard Developed Markets ETF',
    VWO: 'Vanguard Emerging Markets ETF',
    EFA: 'iShares MSCI EAFE ETF',
    IEFA: 'iShares Core MSCI EAFE IMI Index ETF',
    IWM: 'iShares Russell 2000 ETF',
    QQQ: 'Invesco QQQ ETF',
    AGG: 'iShares Core US Aggregate Bond ETF',
    BND: 'Vanguard Total Bond Market ETF',
    GLD: 'SPDR Gold Shares',
    TLT: 'iShares 20+ Year Treasury Bond ETF'
  };
  return nameMap[symbol as keyof typeof nameMap] || `${symbol} ETF`;
};
