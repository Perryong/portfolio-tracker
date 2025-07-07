
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

// Mock data for demonstration - in production, this would come from financial APIs
const MOCK_SP500_DATA = {
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
  sentiment: {
    vixLevel: 18.2,
    putCallRatio: 0.85,
    fearGreedIndex: 65
  }
};

const MOCK_NASDAQ_DATA = {
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
  sentiment: {
    vixLevel: 20.5,
    putCallRatio: 0.92,
    fearGreedIndex: 58
  }
};

export const analyzeIndexValuation = async (symbol: string): Promise<IndexValuationResults> => {
  console.log(`Analyzing index valuation for: ${symbol}`);
  
  // Fetch current price data
  const historicalData = await fetchHistoricalStockData(symbol);
  const currentPrice = historicalData[0]?.close || 0;
  
  // Get index-specific data based on symbol
  let metrics: IndexMetrics;
  let name: string;
  
  switch (symbol.toUpperCase()) {
    case 'SPY':
    case '^GSPC':
      metrics = MOCK_SP500_DATA;
      name = 'S&P 500';
      break;
    case 'QQQ':
    case '^IXIC':
      metrics = MOCK_NASDAQ_DATA;
      name = 'NASDAQ';
      break;
    default:
      // Default to S&P 500 data for unknown indices
      metrics = MOCK_SP500_DATA;
      name = `${symbol} Index`;
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
