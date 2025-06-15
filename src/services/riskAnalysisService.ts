import { TimeSeriesDataPoint } from "./alphaVantageService";

export interface RiskMetrics {
  beta: number | null;
  historicalVolatility: number;
  var95: number;
  var99: number;
  sharpeRatio: number | null;
  maxDrawdown: number;
  volatilityAnnualized: number;
}

export interface TechnicalIndicators {
  rsi: number | null;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  } | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema20: number | null;
  ema50: number | null;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  } | null;
  volumeSma20: number;
  priceChange: number;
  priceChangePercent: number;
}

export interface TechnicalSignals {
  priceVsMovingAverages: {
    aboveSma20: boolean;
    aboveSma50: boolean;
    aboveSma200: boolean;
    aboveEma20: boolean;
    aboveEma50: boolean;
  };
  momentum: {
    rsiOverbought: boolean;
    rsiOversold: boolean;
    macdBullish: boolean;
    macdBearish: boolean;
  };
  volatility: {
    nearUpperBand: boolean;
    nearLowerBand: boolean;
    highVolatility: boolean;
  };
  volume: {
    aboveAverage: boolean;
  };
}

export interface FundamentalSignals {
  valuation: {
    pegOvervalued: boolean;
    peOvervalued: boolean;
    pbOvervalued: boolean;
  };
  growth: {
    hasGrowth: boolean;
    strongGrowth: boolean;
  };
  liquidity: {
    liquidityRisk: boolean;
    debtConcern: boolean;
  };
  profitability: {
    strongMargins: boolean;
    goodRoe: boolean;
  };
}

export interface QuantitativeRecommendation {
  technicalScore: number;
  fundamentalScore: number;
  riskAdjustedScore: number;
  recommendation: "BUY" | "HOLD" | "SELL" | "WEAK_BUY" | "WEAK_SELL";
  technicalVerdict: string;
  fundamentalVerdict: string;
  rationale: string[];
  alternativeStrategy: string;
  portfolioAllocation: string;
}

/**
 * Calculate daily returns from price data
 */
export const calculateReturns = (prices: TimeSeriesDataPoint[]): number[] => {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i].close;
    const previousPrice = prices[i - 1].close;
    const dailyReturn = (currentPrice - previousPrice) / previousPrice;
    returns.push(dailyReturn);
  }
  return returns;
};

/**
 * Calculate historical volatility (annualized)
 */
export const calculateHistoricalVolatility = (returns: number[]): number => {
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
  const dailyVolatility = Math.sqrt(variance);
  
  // Annualize assuming 252 trading days
  return dailyVolatility * Math.sqrt(252);
};

/**
 * Calculate Value at Risk (VaR)
 */
export const calculateVaR = (returns: number[], confidenceLevel: number): number => {
  if (returns.length === 0) return 0;
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  return Math.abs(sortedReturns[index] || 0);
};

/**
 * Calculate Sharpe Ratio (assuming risk-free rate of 2%)
 */
export const calculateSharpeRatio = (returns: number[]): number | null => {
  if (returns.length === 0) return null;
  
  const riskFreeRate = 0.02; // 2% annual risk-free rate
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const annualizedReturn = meanReturn * 252; // Annualize
  const volatility = calculateHistoricalVolatility(returns);
  
  if (volatility === 0) return null;
  return (annualizedReturn - riskFreeRate) / volatility;
};

/**
 * Calculate Maximum Drawdown
 */
export const calculateMaxDrawdown = (prices: TimeSeriesDataPoint[]): number => {
  if (prices.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = prices[0].close;
  
  for (const price of prices) {
    if (price.close > peak) {
      peak = price.close;
    }
    const drawdown = (peak - price.close) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  return maxDrawdown;
};

/**
 * Calculate RSI with configurable period (default 21 for less noise)
 */
export const calculateRSI = (prices: TimeSeriesDataPoint[], period: number = 21): number | null => {
  if (prices.length < period + 1) return null;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i].close - prices[i - 1].close);
  }
  
  let avgGain = 0;
  let avgLoss = 0;
  
  // Initial calculation
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export const calculateMACD = (prices: TimeSeriesDataPoint[]): { macd: number; signal: number; histogram: number } | null => {
  if (prices.length < 26) return null;
  
  const closePrices = prices.map(p => p.close);
  
  // Calculate EMAs
  const ema12 = calculateEMA(closePrices, 12);
  const ema26 = calculateEMA(closePrices, 26);
  
  if (!ema12 || !ema26) return null;
  
  const macd = ema12 - ema26;
  
  // Calculate signal line (9-period EMA of MACD)
  const macdValues = [macd]; // In a real implementation, you'd need more MACD values
  const signal = macd; // Simplified for this example
  
  return {
    macd,
    signal,
    histogram: macd - signal
  };
};

/**
 * Calculate Simple Moving Average with configurable period
 */
export const calculateSMA = (prices: TimeSeriesDataPoint[], period: number): number | null => {
  if (prices.length < period) return null;
  
  const sum = prices.slice(0, period).reduce((acc, price) => acc + price.close, 0);
  return sum / period;
};

/**
 * Calculate Bollinger Bands (20 period, 2 standard deviations)
 */
export const calculateBollingerBands = (prices: TimeSeriesDataPoint[], period: number = 20, stdDev: number = 2) => {
  if (prices.length < period) return null;
  
  const sma = calculateSMA(prices, period);
  if (!sma) return null;
  
  const squaredDiffs = prices.slice(0, period).map(p => Math.pow(p.close - sma, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev)
  };
};

/**
 * Calculate Volume SMA
 */
export const calculateVolumeSMA = (prices: TimeSeriesDataPoint[], period: number = 20): number => {
  if (prices.length < period) return 0;
  
  const sum = prices.slice(0, period).reduce((acc, price) => acc + price.volume, 0);
  return sum / period;
};

/**
 * Calculate Exponential Moving Average
 */
export const calculateEMA = (prices: number[], period: number): number | null => {
  if (prices.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
  for (let i = period; i < Math.min(prices.length, period + 10); i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
};

/**
 * Calculate Beta using market correlation (simplified using SPY proxy)
 */
export const calculateBeta = (prices: TimeSeriesDataPoint[]): number | null => {
  if (prices.length < 50) return null;
  
  const returns = calculateReturns(prices);
  // Simplified beta calculation - in production, you'd correlate with actual market data
  const marketVolatility = 0.16; // Approximate S&P 500 annual volatility
  const stockVolatility = calculateHistoricalVolatility(returns);
  
  // Simplified beta approximation
  return stockVolatility / marketVolatility;
};

/**
 * Analyze technical signals
 */
export const analyzeTechnicalSignals = (prices: TimeSeriesDataPoint[], indicators: TechnicalIndicators): TechnicalSignals => {
  const currentPrice = prices[0]?.close || 0;
  const currentVolume = prices[0]?.volume || 0;
  
  return {
    priceVsMovingAverages: {
      aboveSma20: indicators.sma20 ? currentPrice > indicators.sma20 : false,
      aboveSma50: indicators.sma50 ? currentPrice > indicators.sma50 : false,
      aboveSma200: indicators.sma200 ? currentPrice > indicators.sma200 : false,
      aboveEma20: indicators.ema20 ? currentPrice > indicators.ema20 : false,
      aboveEma50: indicators.ema50 ? currentPrice > indicators.ema50 : false,
    },
    momentum: {
      rsiOverbought: indicators.rsi ? indicators.rsi > 70 : false,
      rsiOversold: indicators.rsi ? indicators.rsi < 30 : false,
      macdBullish: indicators.macd ? indicators.macd.histogram > 0 : false,
      macdBearish: indicators.macd ? indicators.macd.histogram < 0 : false,
    },
    volatility: {
      nearUpperBand: indicators.bollingerBands ? currentPrice > indicators.bollingerBands.upper * 0.98 : false,
      nearLowerBand: indicators.bollingerBands ? currentPrice < indicators.bollingerBands.lower * 1.02 : false,
      highVolatility: indicators.bollingerBands ? 
        (indicators.bollingerBands.upper - indicators.bollingerBands.lower) / indicators.bollingerBands.middle > 0.1 : false,
    },
    volume: {
      aboveAverage: currentVolume > indicators.volumeSma20,
    }
  };
};

/**
 * Calculate all risk metrics
 */
export const calculateRiskMetrics = (prices: TimeSeriesDataPoint[]): RiskMetrics => {
  const returns = calculateReturns(prices);
  const volatility = calculateHistoricalVolatility(returns);
  
  return {
    beta: calculateBeta(prices),
    historicalVolatility: volatility,
    var95: calculateVaR(returns, 0.95),
    var99: calculateVaR(returns, 0.99),
    sharpeRatio: calculateSharpeRatio(returns),
    maxDrawdown: calculateMaxDrawdown(prices),
    volatilityAnnualized: volatility
  };
};

/**
 * Calculate all technical indicators with enhanced parameters
 */
export const calculateTechnicalIndicators = (prices: TimeSeriesDataPoint[]): TechnicalIndicators => {
  const avgVolume = prices.reduce((sum, p) => sum + p.volume, 0) / prices.length;
  const latestPrice = prices[0]?.close || 0;
  const previousPrice = prices[1]?.close || 0;
  const priceChange = latestPrice - previousPrice;
  
  return {
    rsi: calculateRSI(prices, 21), // Changed to 21 periods
    macd: calculateMACD(prices),
    sma20: calculateSMA(prices, 20),
    sma50: calculateSMA(prices, 50),
    sma200: calculateSMA(prices, 200), // Added SMA 200
    ema20: prices.length > 0 ? calculateEMA(prices.map(p => p.close), 20) : null,
    ema50: prices.length > 0 ? calculateEMA(prices.map(p => p.close), 50) : null,
    bollingerBands: calculateBollingerBands(prices), // Added Bollinger Bands
    volumeSma20: calculateVolumeSMA(prices), // Added Volume SMA
    priceChange,
    priceChangePercent: previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0
  };
};