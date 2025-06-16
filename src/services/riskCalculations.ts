
import { TimeSeriesDataPoint } from "./alphaVantageService";
import { RiskMetrics } from "@/types/technicalAnalysis";

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
