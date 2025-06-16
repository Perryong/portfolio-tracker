
import { TimeSeriesDataPoint } from "./alphaVantageService";
import { calculateAdvancedTechnicalSignals } from "./advancedTechnicalAnalysis";
import { calculateRiskMetrics } from "./riskCalculations";
import { 
  calculateRSI, 
  calculateMACD, 
  calculateSMA, 
  calculateBollingerBands, 
  calculateVolumeSMA, 
  calculateEMA,
  calculateVWMA
} from "./technicalIndicatorCalculations";
import { analyzeTechnicalSignals } from "./technicalSignalAnalysis";
import { 
  RiskMetrics, 
  TechnicalIndicators, 
  TechnicalSignals, 
  FundamentalSignals, 
  QuantitativeRecommendation 
} from "@/types/technicalAnalysis";

// Re-export functions for backward compatibility
export { calculateReturns } from "./riskCalculations";
export { calculateRiskMetrics } from "./riskCalculations";
export { analyzeTechnicalSignals } from "./technicalSignalAnalysis";

// Re-export types
export type {
  RiskMetrics,
  TechnicalIndicators,
  TechnicalSignals,
  FundamentalSignals,
  QuantitativeRecommendation
};

/**
 * Calculate all technical indicators with enhanced parameters
 */
export const calculateTechnicalIndicators = (prices: TimeSeriesDataPoint[]): TechnicalIndicators => {
  const latestPrice = prices[0]?.close || 0;
  const previousPrice = prices[1]?.close || 0;
  const priceChange = latestPrice - previousPrice;
  
  // Calculate advanced technical signals
  const advancedSignals = calculateAdvancedTechnicalSignals(prices);
  
  const baseIndicators = {
    rsi: calculateRSI(prices, 21), // Changed to 21 periods
    macd: calculateMACD(prices), // Now properly calculates signal line and histogram
    sma20: calculateSMA(prices, 20),
    sma50: calculateSMA(prices, 50),
    sma200: calculateSMA(prices, 200), // Added SMA 200
    ema20: prices.length > 0 ? calculateEMA(prices.map(p => p.close), 20) : null,
    ema50: prices.length > 0 ? calculateEMA(prices.map(p => p.close), 50) : null,
    vwma20: calculateVWMA(prices, 20), // Added VWMA
    bollingerBands: calculateBollingerBands(prices), // Added Bollinger Bands
    volumeSma20: calculateVolumeSMA(prices), // Added Volume SMA
    priceChange,
    priceChangePercent: previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0,
    // Advanced indicators
    advancedSignals,
    adx: advancedSignals.strategies.trend_following.metrics.adx,
    hurstExponent: advancedSignals.strategies.statistical_arbitrage.metrics.hurst_exponent,
    volatilityRegime: advancedSignals.strategies.volatility.metrics.volatility_regime,
    momentumScore: advancedSignals.strategies.momentum.metrics.momentum_1m,
    trendStrength: advancedSignals.strategies.trend_following.metrics.trend_strength
  };
  
  return baseIndicators;
};
