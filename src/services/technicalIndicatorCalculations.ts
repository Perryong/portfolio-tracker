
import { TimeSeriesDataPoint } from "./alphaVantageService";

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
 * Calculate MACD (Moving Average Convergence Divergence) - FIXED VERSION
 */
export const calculateMACD = (prices: TimeSeriesDataPoint[]): { macd: number; signal: number; histogram: number } | null => {
  if (prices.length < 34) return null; // Need at least 34 periods for proper MACD calculation
  
  const closePrices = prices.map(p => p.close).reverse(); // Reverse to get chronological order
  
  // Calculate EMAs for all periods
  const ema12Array = calculateEMAArray(closePrices, 12);
  const ema26Array = calculateEMAArray(closePrices, 26);
  
  if (!ema12Array || !ema26Array) return null;
  
  // Calculate MACD values for all periods where both EMAs exist
  const macdArray = [];
  const startIndex = Math.max(ema12Array.length - ema26Array.length, 0);
  
  for (let i = startIndex; i < ema12Array.length; i++) {
    const ema12Index = i;
    const ema26Index = i - startIndex;
    if (ema26Index >= 0 && ema26Index < ema26Array.length) {
      macdArray.push(ema12Array[ema12Index] - ema26Array[ema26Index]);
    }
  }
  
  if (macdArray.length < 9) return null;
  
  // Calculate signal line (9-period EMA of MACD values)
  const signalArray = calculateEMAArray(macdArray, 9);
  if (!signalArray) return null;
  
  // Get the most recent values
  const currentMacd = macdArray[macdArray.length - 1];
  const currentSignal = signalArray[signalArray.length - 1];
  
  return {
    macd: currentMacd,
    signal: currentSignal,
    histogram: currentMacd - currentSignal
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
 * Enhanced Exponential Moving Average - FIXED VERSION
 * Now processes ALL available data points instead of limiting to period + 10
 */
export const calculateEMA = (prices: number[], period: number): number | null => {
  if (prices.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
  // Process ALL remaining data points, not just period + 10
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
};

/**
 * Calculate EMA Array - returns all EMA values for time series analysis
 */
export const calculateEMAArray = (prices: number[], period: number): number[] | null => {
  if (prices.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  const emaArray: number[] = [];
  
  // Initial SMA for the first EMA value
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  emaArray.push(ema);
  
  // Calculate EMA for all remaining periods
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    emaArray.push(ema);
  }
  
  return emaArray;
};

/**
 * Calculate VWMA (Volume Weighted Moving Average)
 * Formula: Sum(Price × Volume) / Sum(Volume)
 */
export const calculateVWMA = (prices: TimeSeriesDataPoint[], period: number = 20): number | null => {
  if (prices.length < period) return null;
  
  let weightedSum = 0;
  let volumeSum = 0;
  
  for (let i = 0; i < period; i++) {
    const price = prices[i].close;
    const volume = prices[i].volume;
    weightedSum += price * volume;
    volumeSum += volume;
  }
  
  return volumeSum > 0 ? weightedSum / volumeSum : null;
};
