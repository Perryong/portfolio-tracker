
import { TimeSeriesDataPoint } from "./alphaVantageService";
import { calculateReturns } from "./riskAnalysisService";

export interface AdvancedTechnicalSignals {
  signal: "bullish" | "bearish" | "neutral";
  confidence: number;
  strategies: {
    trend_following: StrategyResult;
    mean_reversion: StrategyResult;
    momentum: StrategyResult;
    volatility: StrategyResult;
    statistical_arbitrage: StrategyResult;
  };
  combined_score: number;
}

export interface StrategyResult {
  signal: "bullish" | "bearish" | "neutral";
  confidence: number;
  metrics: Record<string, number>;
}

/**
 * Safely convert a value to float, handling NaN cases
 */
function safeFloat(value: any, defaultValue: number = 0.0): number {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue;
  }
  return Number(value);
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for first value
  let sum = 0;
  for (let i = 0; i < Math.min(period, prices.length); i++) {
    sum += prices[i];
  }
  ema[period - 1] = sum / period;
  
  // Calculate EMA for remaining values
  for (let i = period; i < prices.length; i++) {
    ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
  }
  
  return ema;
}

/**
 * Calculate Average Directional Index (ADX)
 */
export function calculateADX(prices: TimeSeriesDataPoint[], period: number = 14): { adx: number; plusDI: number; minusDI: number } {
  if (prices.length < period + 1) {
    return { adx: 0, plusDI: 0, minusDI: 0 };
  }

  const trueRanges: number[] = [];
  const plusDMs: number[] = [];
  const minusDMs: number[] = [];

  // Calculate True Range and Directional Movement
  for (let i = 1; i < prices.length; i++) {
    const high = prices[i].high;
    const low = prices[i].low;
    const prevClose = prices[i - 1].close;
    const prevHigh = prices[i - 1].high;
    const prevLow = prices[i - 1].low;

    // True Range
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);

    // Directional Movement
    const upMove = high - prevHigh;
    const downMove = prevLow - low;

    const plusDM = (upMove > downMove && upMove > 0) ? upMove : 0;
    const minusDM = (downMove > upMove && downMove > 0) ? downMove : 0;

    plusDMs.push(plusDM);
    minusDMs.push(minusDM);
  }

  // Calculate smoothed values
  const avgTR = trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgPlusDM = plusDMs.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgMinusDM = minusDMs.slice(-period).reduce((a, b) => a + b, 0) / period;

  const plusDI = (avgPlusDM / avgTR) * 100;
  const minusDI = (avgMinusDM / avgTR) * 100;

  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
  const adx = dx; // Simplified ADX calculation

  return {
    adx: safeFloat(adx),
    plusDI: safeFloat(plusDI),
    minusDI: safeFloat(minusDI)
  };
}

/**
 * Calculate Hurst Exponent
 */
export function calculateHurstExponent(prices: number[], maxLag: number = 20): number {
  if (prices.length < maxLag) return 0.5;

  const lags: number[] = [];
  const tau: number[] = [];

  for (let lag = 2; lag < Math.min(maxLag, prices.length); lag++) {
    const differences: number[] = [];
    for (let i = lag; i < prices.length; i++) {
      differences.push(prices[i] - prices[i - lag]);
    }
    
    const std = Math.sqrt(differences.reduce((sum, diff) => sum + diff * diff, 0) / differences.length);
    lags.push(Math.log(lag));
    tau.push(Math.log(Math.max(1e-8, std)));
  }

  // Linear regression to find slope (Hurst exponent)
  const n = lags.length;
  const sumX = lags.reduce((a, b) => a + b, 0);
  const sumY = tau.reduce((a, b) => a + b, 0);
  const sumXY = lags.reduce((sum, x, i) => sum + x * tau[i], 0);
  const sumXX = lags.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return safeFloat(slope, 0.5);
}

/**
 * Calculate skewness and kurtosis
 */
export function calculateStatistics(returns: number[]): { skewness: number; kurtosis: number } {
  const n = returns.length;
  const mean = returns.reduce((a, b) => a + b, 0) / n;
  
  let variance = 0;
  let skewSum = 0;
  let kurtSum = 0;

  for (const ret of returns) {
    const diff = ret - mean;
    variance += diff * diff;
    skewSum += diff * diff * diff;
    kurtSum += diff * diff * diff * diff;
  }

  variance /= n;
  const std = Math.sqrt(variance);
  const skewness = (skewSum / n) / Math.pow(std, 3);
  const kurtosis = (kurtSum / n) / Math.pow(std, 4) - 3;

  return {
    skewness: safeFloat(skewness),
    kurtosis: safeFloat(kurtosis)
  };
}

/**
 * Calculate trend following signals
 */
export function calculateTrendSignals(prices: TimeSeriesDataPoint[]): StrategyResult {
  const closePrices = prices.map(p => p.close);
  
  // Calculate EMAs
  const ema8 = calculateEMA(closePrices, 8);
  const ema21 = calculateEMA(closePrices, 21);
  const ema55 = calculateEMA(closePrices, 55);
  
  // Calculate ADX
  const adx = calculateADX(prices, 14);
  
  const currentEma8 = ema8[ema8.length - 1] || 0;
  const currentEma21 = ema21[ema21.length - 1] || 0;
  const currentEma55 = ema55[ema55.length - 1] || 0;
  
  const shortTrend = currentEma8 > currentEma21;
  const mediumTrend = currentEma21 > currentEma55;
  const trendStrength = adx.adx / 100;
  
  let signal: "bullish" | "bearish" | "neutral";
  let confidence: number;
  
  if (shortTrend && mediumTrend) {
    signal = "bullish";
    confidence = trendStrength;
  } else if (!shortTrend && !mediumTrend) {
    signal = "bearish";
    confidence = trendStrength;
  } else {
    signal = "neutral";
    confidence = 0.5;
  }
  
  return {
    signal,
    confidence,
    metrics: {
      ema8: currentEma8,
      ema21: currentEma21,
      ema55: currentEma55,
      adx: adx.adx,
      trend_strength: trendStrength
    }
  };
}

/**
 * Calculate mean reversion signals
 */
export function calculateMeanReversionSignals(prices: TimeSeriesDataPoint[]): StrategyResult {
  const closePrices = prices.map(p => p.close);
  
  // Calculate z-score
  const period = Math.min(50, prices.length);
  const recentPrices = closePrices.slice(-period);
  const mean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / recentPrices.length;
  const std = Math.sqrt(variance);
  const zScore = (closePrices[closePrices.length - 1] - mean) / std;
  
  // Calculate Bollinger Band position
  const currentPrice = closePrices[closePrices.length - 1];
  const bbUpper = mean + (2 * std);
  const bbLower = mean - (2 * std);
  const priceVsBB = (currentPrice - bbLower) / (bbUpper - bbLower);
  
  let signal: "bullish" | "bearish" | "neutral";
  let confidence: number;
  
  if (zScore < -2 && priceVsBB < 0.2) {
    signal = "bullish";
    confidence = Math.min(Math.abs(zScore) / 4, 1.0);
  } else if (zScore > 2 && priceVsBB > 0.8) {
    signal = "bearish";
    confidence = Math.min(Math.abs(zScore) / 4, 1.0);
  } else {
    signal = "neutral";
    confidence = 0.5;
  }
  
  return {
    signal,
    confidence,
    metrics: {
      z_score: zScore,
      price_vs_bb: priceVsBB,
      bb_upper: bbUpper,
      bb_lower: bbLower
    }
  };
}

/**
 * Calculate momentum signals
 */
export function calculateMomentumSignals(prices: TimeSeriesDataPoint[]): StrategyResult {
  const returns = calculateReturns(prices);
  
  // Calculate momentum periods
  const mom1m = returns.slice(-21).reduce((a, b) => a + b, 0);
  const mom3m = returns.slice(-63).reduce((a, b) => a + b, 0);
  const mom6m = returns.slice(-126).reduce((a, b) => a + b, 0);
  
  // Volume momentum
  const volumes = prices.map(p => p.volume);
  const volumeMa = volumes.slice(-21).reduce((a, b) => a + b, 0) / 21;
  const volumeMomentum = volumes[volumes.length - 1] / volumeMa;
  
  const momentumScore = 0.4 * mom1m + 0.3 * mom3m + 0.3 * mom6m;
  const volumeConfirmation = volumeMomentum > 1.0;
  
  let signal: "bullish" | "bearish" | "neutral";
  let confidence: number;
  
  if (momentumScore > 0.05 && volumeConfirmation) {
    signal = "bullish";
    confidence = Math.min(Math.abs(momentumScore) * 5, 1.0);
  } else if (momentumScore < -0.05 && volumeConfirmation) {
    signal = "bearish";
    confidence = Math.min(Math.abs(momentumScore) * 5, 1.0);
  } else {
    signal = "neutral";
    confidence = 0.5;
  }
  
  return {
    signal,
    confidence,
    metrics: {
      momentum_1m: mom1m,
      momentum_3m: mom3m,
      momentum_6m: mom6m,
      volume_momentum: volumeMomentum
    }
  };
}

/**
 * Calculate volatility signals
 */
export function calculateVolatilitySignals(prices: TimeSeriesDataPoint[]): StrategyResult {
  const returns = calculateReturns(prices);
  
  // Historical volatility
  const recentReturns = returns.slice(-21);
  const variance = recentReturns.reduce((sum, ret) => sum + ret * ret, 0) / recentReturns.length;
  const histVol = Math.sqrt(variance * 252);
  
  // Volatility regime
  const volHistory = returns.slice(-63);
  const volMean = Math.sqrt(volHistory.reduce((sum, ret) => sum + ret * ret, 0) / volHistory.length * 252);
  const volRegime = histVol / volMean;
  
  // Volatility z-score
  const volStd = Math.sqrt(volHistory.reduce((sum, ret) => sum + Math.pow(Math.abs(ret) - volMean/Math.sqrt(252), 2), 0) / volHistory.length);
  const volZScore = (histVol - volMean) / volStd;
  
  let signal: "bullish" | "bearish" | "neutral";
  let confidence: number;
  
  if (volRegime < 0.8 && volZScore < -1) {
    signal = "bullish";
    confidence = Math.min(Math.abs(volZScore) / 3, 1.0);
  } else if (volRegime > 1.2 && volZScore > 1) {
    signal = "bearish";
    confidence = Math.min(Math.abs(volZScore) / 3, 1.0);
  } else {
    signal = "neutral";
    confidence = 0.5;
  }
  
  return {
    signal,
    confidence,
    metrics: {
      historical_volatility: histVol,
      volatility_regime: volRegime,
      volatility_z_score: volZScore
    }
  };
}

/**
 * Calculate statistical arbitrage signals
 */
export function calculateStatArbitrageSignals(prices: TimeSeriesDataPoint[]): StrategyResult {
  const returns = calculateReturns(prices);
  const closePrices = prices.map(p => p.close);
  
  // Calculate statistics
  const recentReturns = returns.slice(-63);
  const stats = calculateStatistics(recentReturns);
  const hurst = calculateHurstExponent(closePrices);
  
  let signal: "bullish" | "bearish" | "neutral";
  let confidence: number;
  
  if (hurst < 0.4 && stats.skewness > 1) {
    signal = "bullish";
    confidence = (0.5 - hurst) * 2;
  } else if (hurst < 0.4 && stats.skewness < -1) {
    signal = "bearish";
    confidence = (0.5 - hurst) * 2;
  } else {
    signal = "neutral";
    confidence = 0.5;
  }
  
  return {
    signal,
    confidence,
    metrics: {
      hurst_exponent: hurst,
      skewness: stats.skewness,
      kurtosis: stats.kurtosis
    }
  };
}

/**
 * Combine signals using weighted approach
 */
export function weightedSignalCombination(strategies: Record<string, StrategyResult>): AdvancedTechnicalSignals {
  const weights = {
    trend_following: 0.25,
    mean_reversion: 0.20,
    momentum: 0.25,
    volatility: 0.15,
    statistical_arbitrage: 0.15
  };
  
  const signalValues = { bullish: 1, neutral: 0, bearish: -1 };
  
  let weightedSum = 0;
  let totalConfidence = 0;
  
  for (const [strategyName, strategy] of Object.entries(strategies)) {
    const numericSignal = signalValues[strategy.signal];
    const weight = weights[strategyName as keyof typeof weights] || 0;
    const confidence = strategy.confidence;
    
    weightedSum += numericSignal * weight * confidence;
    totalConfidence += weight * confidence;
  }
  
  const finalScore = totalConfidence > 0 ? weightedSum / totalConfidence : 0;
  
  let combinedSignal: "bullish" | "bearish" | "neutral";
  if (finalScore > 0.2) {
    combinedSignal = "bullish";
  } else if (finalScore < -0.2) {
    combinedSignal = "bearish";
  } else {
    combinedSignal = "neutral";
  }
  
  return {
    signal: combinedSignal,
    confidence: Math.abs(finalScore),
    strategies: strategies as any,
    combined_score: finalScore
  };
}

/**
 * Main function to calculate advanced technical signals
 */
export function calculateAdvancedTechnicalSignals(prices: TimeSeriesDataPoint[]): AdvancedTechnicalSignals {
  const strategies = {
    trend_following: calculateTrendSignals(prices),
    mean_reversion: calculateMeanReversionSignals(prices),
    momentum: calculateMomentumSignals(prices),
    volatility: calculateVolatilitySignals(prices),
    statistical_arbitrage: calculateStatArbitrageSignals(prices)
  };
  
  return weightedSignalCombination(strategies);
}
