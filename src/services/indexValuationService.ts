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

// Mock data for different ETFs - each with unique characteristics
const ETF_METRICS = {
  // S&P 500 ETFs (SPY, VOO, IVV)
  SPY: {
    currentPE: 21.5,
    historicalPERange: { min: 10.2, max: 32.1, percentile25: 16.8, percentile75: 24.2 },
    cape: 28.3,
    earningsYield: 4.65,
    treasuryYield: 4.35,
    marketCapToGDP: 1.85,
    sectorBreakdown: [
      { sector: 'Technology', weight: 28.5 },
      { sector: 'Healthcare', weight: 13.2 },
      { sector: 'Financials', weight: 11.8 },
      { sector: 'Consumer Discretionary', weight: 10.4 },
      { sector: 'Communication Services', weight: 8.9 },
      { sector: 'Industrials', weight: 8.1 },
      { sector: 'Consumer Staples', weight: 6.2 },
      { sector: 'Energy', weight: 4.1 },
      { sector: 'Utilities', weight: 2.8 },
      { sector: 'Real Estate', weight: 2.5 },
      { sector: 'Materials', weight: 2.4 }
    ],
    sentiment: { vixLevel: 18.2, putCallRatio: 0.85, fearGreedIndex: 65 }
  },
  VOO: {
    currentPE: 21.3,
    historicalPERange: { min: 10.1, max: 32.3, percentile25: 16.5, percentile75: 24.5 },
    cape: 28.1,
    earningsYield: 4.69,
    treasuryYield: 4.35,
    marketCapToGDP: 1.84,
    sectorBreakdown: [
      { sector: 'Technology', weight: 28.7 },
      { sector: 'Healthcare', weight: 13.1 },
      { sector: 'Financials', weight: 11.9 },
      { sector: 'Consumer Discretionary', weight: 10.3 },
      { sector: 'Communication Services', weight: 8.8 },
      { sector: 'Industrials', weight: 8.2 },
      { sector: 'Consumer Staples', weight: 6.1 },
      { sector: 'Energy', weight: 4.2 },
      { sector: 'Utilities', weight: 2.9 },
      { sector: 'Real Estate', weight: 2.6 },
      { sector: 'Materials', weight: 2.2 }
    ],
    sentiment: { vixLevel: 17.8, putCallRatio: 0.83, fearGreedIndex: 67 }
  },
  IVV: {
    currentPE: 21.7,
    historicalPERange: { min: 10.3, max: 31.9, percentile25: 16.9, percentile75: 24.0 },
    cape: 28.5,
    earningsYield: 4.62,
    treasuryYield: 4.35,
    marketCapToGDP: 1.86,
    sectorBreakdown: [
      { sector: 'Technology', weight: 28.3 },
      { sector: 'Healthcare', weight: 13.3 },
      { sector: 'Financials', weight: 11.7 },
      { sector: 'Consumer Discretionary', weight: 10.5 },
      { sector: 'Communication Services', weight: 9.0 },
      { sector: 'Industrials', weight: 8.0 },
      { sector: 'Consumer Staples', weight: 6.3 },
      { sector: 'Energy', weight: 4.0 },
      { sector: 'Utilities', weight: 2.7 },
      { sector: 'Real Estate', weight: 2.4 },
      { sector: 'Materials', weight: 2.8 }
    ],
    sentiment: { vixLevel: 18.5, putCallRatio: 0.87, fearGreedIndex: 63 }
  },
  // Total Market ETF (VTI)
  VTI: {
    currentPE: 20.8,
    historicalPERange: { min: 9.8, max: 30.5, percentile25: 15.9, percentile75: 23.1 },
    cape: 27.1,
    earningsYield: 4.81,
    treasuryYield: 4.35,
    marketCapToGDP: 1.92,
    sectorBreakdown: [
      { sector: 'Technology', weight: 26.2 },
      { sector: 'Healthcare', weight: 12.8 },
      { sector: 'Financials', weight: 12.5 },
      { sector: 'Consumer Discretionary', weight: 10.1 },
      { sector: 'Communication Services', weight: 8.3 },
      { sector: 'Industrials', weight: 8.7 },
      { sector: 'Consumer Staples', weight: 6.0 },
      { sector: 'Energy', weight: 4.3 },
      { sector: 'Utilities', weight: 3.1 },
      { sector: 'Real Estate', weight: 3.2 },
      { sector: 'Materials', weight: 2.8 }
    ],
    sentiment: { vixLevel: 17.5, putCallRatio: 0.82, fearGreedIndex: 68 }
  },
  // International Developed Markets (VEA, EFA, IEFA)
  VEA: {
    currentPE: 14.2,
    historicalPERange: { min: 8.5, max: 22.8, percentile25: 11.2, percentile75: 17.5 },
    cape: 19.7,
    earningsYield: 7.04,
    treasuryYield: 4.35,
    marketCapToGDP: 0.78,
    sectorBreakdown: [
      { sector: 'Technology', weight: 12.8 },
      { sector: 'Healthcare', weight: 14.2 },
      { sector: 'Financials', weight: 18.5 },
      { sector: 'Consumer Discretionary', weight: 11.3 },
      { sector: 'Industrials', weight: 14.1 },
      { sector: 'Consumer Staples', weight: 9.8 },
      { sector: 'Communication Services', weight: 4.2 },
      { sector: 'Energy', weight: 5.1 },
      { sector: 'Utilities', weight: 4.3 },
      { sector: 'Materials', weight: 3.9 },
      { sector: 'Real Estate', weight: 1.8 }
    ],
    sentiment: { vixLevel: 22.1, putCallRatio: 0.95, fearGreedIndex: 45 }
  },
  EFA: {
    currentPE: 14.5,
    historicalPERange: { min: 8.2, max: 23.1, percentile25: 11.5, percentile75: 17.8 },
    cape: 20.1,
    earningsYield: 6.90,
    treasuryYield: 4.35,
    marketCapToGDP: 0.81,
    sectorBreakdown: [
      { sector: 'Technology', weight: 13.2 },
      { sector: 'Healthcare', weight: 14.8 },
      { sector: 'Financials', weight: 17.9 },
      { sector: 'Consumer Discretionary', weight: 11.7 },
      { sector: 'Industrials', weight: 13.8 },
      { sector: 'Consumer Staples', weight: 9.5 },
      { sector: 'Communication Services', weight: 4.5 },
      { sector: 'Energy', weight: 4.8 },
      { sector: 'Utilities', weight: 4.1 },
      { sector: 'Materials', weight: 4.2 },
      { sector: 'Real Estate', weight: 1.5 }
    ],
    sentiment: { vixLevel: 21.8, putCallRatio: 0.93, fearGreedIndex: 47 }
  },
  IEFA: {
    currentPE: 14.0,
    historicalPERange: { min: 8.1, max: 22.5, percentile25: 11.0, percentile75: 17.2 },
    cape: 19.4,
    earningsYield: 7.14,
    treasuryYield: 4.35,
    marketCapToGDP: 0.76,
    sectorBreakdown: [
      { sector: 'Technology', weight: 12.5 },
      { sector: 'Healthcare', weight: 13.9 },
      { sector: 'Financials', weight: 18.8 },
      { sector: 'Consumer Discretionary', weight: 11.0 },
      { sector: 'Industrials', weight: 14.4 },
      { sector: 'Consumer Staples', weight: 10.1 },
      { sector: 'Communication Services', weight: 4.0 },
      { sector: 'Energy', weight: 5.4 },
      { sector: 'Utilities', weight: 4.5 },
      { sector: 'Materials', weight: 3.8 },
      { sector: 'Real Estate', weight: 1.6 }
    ],
    sentiment: { vixLevel: 22.5, putCallRatio: 0.97, fearGreedIndex: 43 }
  },
  // Emerging Markets (VWO)
  VWO: {
    currentPE: 11.8,
    historicalPERange: { min: 7.2, max: 18.9, percentile25: 9.1, percentile75: 14.5 },
    cape: 15.2,
    earningsYield: 8.47,
    treasuryYield: 4.35,
    marketCapToGDP: 0.52,
    sectorBreakdown: [
      { sector: 'Technology', weight: 22.1 },
      { sector: 'Financials', weight: 19.8 },
      { sector: 'Consumer Discretionary', weight: 15.2 },
      { sector: 'Communication Services', weight: 8.9 },
      { sector: 'Materials', weight: 7.5 },
      { sector: 'Energy', weight: 6.8 },
      { sector: 'Healthcare', weight: 5.2 },
      { sector: 'Industrials', weight: 4.9 },
      { sector: 'Consumer Staples', weight: 4.8 },
      { sector: 'Utilities', weight: 2.9 },
      { sector: 'Real Estate', weight: 1.9 }
    ],
    sentiment: { vixLevel: 28.3, putCallRatio: 1.15, fearGreedIndex: 35 }
  },
  // Small Cap (IWM)
  IWM: {
    currentPE: 24.8,
    historicalPERange: { min: 12.5, max: 45.2, percentile25: 18.9, percentile75: 32.1 },
    cape: 31.5,
    earningsYield: 4.03,
    treasuryYield: 4.35,
    marketCapToGDP: 0.45,
    sectorBreakdown: [
      { sector: 'Technology', weight: 16.2 },
      { sector: 'Healthcare', weight: 15.8 },
      { sector: 'Financials', weight: 14.5 },
      { sector: 'Industrials', weight: 13.9 },
      { sector: 'Consumer Discretionary', weight: 12.8 },
      { sector: 'Real Estate', weight: 7.2 },
      { sector: 'Materials', weight: 4.8 },
      { sector: 'Energy', weight: 4.3 },
      { sector: 'Consumer Staples', weight: 3.9 },
      { sector: 'Utilities', weight: 3.8 },
      { sector: 'Communication Services', weight: 2.8 }
    ],
    sentiment: { vixLevel: 25.1, putCallRatio: 1.05, fearGreedIndex: 52 }
  },
  // NASDAQ Tech (QQQ)
  QQQ: {
    currentPE: 26.8,
    historicalPERange: { min: 12.5, max: 45.2, percentile25: 20.1, percentile75: 32.4 },
    cape: 35.1,
    earningsYield: 3.73,
    treasuryYield: 4.35,
    marketCapToGDP: 0.95,
    sectorBreakdown: [
      { sector: 'Technology', weight: 52.3 },
      { sector: 'Consumer Discretionary', weight: 15.2 },
      { sector: 'Communication Services', weight: 12.8 },
      { sector: 'Healthcare', weight: 8.4 },
      { sector: 'Industrials', weight: 4.1 },
      { sector: 'Consumer Staples', weight: 3.2 },
      { sector: 'Financials', weight: 2.1 },
      { sector: 'Utilities', weight: 1.9 }
    ],
    sentiment: { vixLevel: 20.5, putCallRatio: 0.92, fearGreedIndex: 58 }
  }
};

export const analyzeIndexValuation = async (symbol: string): Promise<IndexValuationResults> => {
  console.log(`Analyzing index valuation for: ${symbol}`);
  
  // Fetch current price data
  const historicalData = await fetchHistoricalStockData(symbol);
  const currentPrice = historicalData[0]?.close || 0;
  
  // Get ETF-specific data based on symbol
  let metrics: IndexMetrics;
  let name: string;
  
  const upperSymbol = symbol.toUpperCase();
  
  if (ETF_METRICS[upperSymbol]) {
    metrics = ETF_METRICS[upperSymbol];
    name = getETFName(upperSymbol);
  } else {
    // Fallback for unknown symbols - use S&P 500 data
    switch (upperSymbol) {
      case '^GSPC':
        metrics = ETF_METRICS.SPY;
        name = 'S&P 500';
        break;
      case '^IXIC':
        metrics = ETF_METRICS.QQQ;
        name = 'NASDAQ';
        break;
      default:
        metrics = ETF_METRICS.SPY;
        name = `${symbol} Index`;
    }
  }
  
  // Calculate valuation assessment
  const valuation = assessIndexValuation(metrics);
  
  // Calculate historical percentiles
  const pePercentile = calculatePercentile(metrics.currentPE, metrics.historicalPERange);
  const capePercentile = calculateCAPEPercentile(metrics.cape);
  const earningsYieldRank = compareEarningsYieldToTreasury(metrics.earningsYield, metrics.treasuryYield);
  
  return {
    symbol,
    name,
    currentPrice,
    metrics,
    valuation,
    historicalContext: {
      pePercentile,
      capePercentile,
      earningsYieldRank
    }
  };
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
  return nameMap[symbol] || `${symbol} ETF`;
};

const assessIndexValuation = (metrics: IndexMetrics) => {
  const reasoning: string[] = [];
  let score = 0;
  
  // P/E ratio assessment
  const peScore = calculatePEScore(metrics.currentPE, metrics.historicalPERange);
  score += peScore;
  if (peScore > 0) {
    reasoning.push(`P/E ratio of ${metrics.currentPE} is below historical average`);
  } else if (peScore < 0) {
    reasoning.push(`P/E ratio of ${metrics.currentPE} is above historical average`);
  }
  
  // CAPE assessment
  const capeScore = calculateCAPEScore(metrics.cape);
  score += capeScore;
  if (capeScore > 0) {
    reasoning.push(`CAPE ratio of ${metrics.cape} suggests reasonable valuations`);
  } else {
    reasoning.push(`CAPE ratio of ${metrics.cape} suggests elevated valuations`);
  }
  
  // Earnings yield vs Treasury comparison
  const yieldSpread = metrics.earningsYield - metrics.treasuryYield;
  if (yieldSpread > 1) {
    score += 1;
    reasoning.push(`Earnings yield premium of ${yieldSpread.toFixed(2)}% over Treasuries is attractive`);
  } else if (yieldSpread < 0) {
    score -= 1;
    reasoning.push(`Earnings yield is below Treasury yields by ${Math.abs(yieldSpread).toFixed(2)}%`);
  }
  
  // Market sentiment assessment
  if (metrics.sentiment.vixLevel < 20) {
    reasoning.push('Low volatility environment suggests complacency');
    score -= 0.5;
  } else if (metrics.sentiment.vixLevel > 30) {
    reasoning.push('High volatility suggests potential buying opportunity');
    score += 0.5;
  }
  
  // Determine overall assessment
  let currentLevel: 'Undervalued' | 'Fair Value' | 'Overvalued';
  let confidence: number;
  
  if (score > 1) {
    currentLevel = 'Undervalued';
    confidence = Math.min(85, 60 + Math.abs(score) * 10);
  } else if (score < -1) {
    currentLevel = 'Overvalued';
    confidence = Math.min(85, 60 + Math.abs(score) * 10);
  } else {
    currentLevel = 'Fair Value';
    confidence = 70;
  }
  
  return {
    currentLevel,
    confidence,
    reasoning
  };
};

const calculatePercentile = (current: number, range: { min: number; max: number; percentile25: number; percentile75: number }): number => {
  if (current <= range.percentile25) return 25;
  if (current <= range.percentile75) return 50;
  return 75;
};

const calculatePEScore = (currentPE: number, range: { min: number; max: number; percentile25: number; percentile75: number }): number => {
  const midpoint = (range.percentile25 + range.percentile75) / 2;
  if (currentPE < midpoint) return 1;
  if (currentPE > range.percentile75) return -1;
  return 0;
};

const calculateCAPEScore = (cape: number): number => {
  // Historical CAPE averages around 16-17, anything above 25 is considered elevated
  if (cape < 20) return 1;
  if (cape > 30) return -1;
  return 0;
};

const calculateCAPEPercentile = (cape: number): number => {
  // Simplified CAPE percentile calculation
  if (cape < 15) return 10;
  if (cape < 20) return 25;
  if (cape < 25) return 50;
  if (cape < 30) return 75;
  return 90;
};

const compareEarningsYieldToTreasury = (earningsYield: number, treasuryYield: number): string => {
  const spread = earningsYield - treasuryYield;
  if (spread > 2) return 'Very Attractive';
  if (spread > 0) return 'Attractive';
  if (spread > -1) return 'Neutral';
  return 'Unattractive';
};