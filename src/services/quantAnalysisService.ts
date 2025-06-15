import { TechnicalIndicators, TechnicalSignals, FundamentalSignals, analyzeTechnicalSignals } from "./riskAnalysisService";
import { TimeSeriesDataPoint } from "./alphaVantageService";
import { FinancialSnapshot } from "./financialDatasetsService";

export interface QuantitativeRecommendation {
  technicalScore: number;
  fundamentalScore: number;
  riskAdjustedScore: number;
  recommendation: "BUY" | "HOLD" | "SELL" | "WEAK_BUY" | "WEAK_SELL";
  technicalVerdict: "BULLISH" | "NEUTRAL" | "BEARISH";
  fundamentalVerdict: "BUY" | "HOLD" | "SELL/AVOID";
  rationale: string[];
  alternativeStrategy: string;
  portfolioAllocation: string;
}

/**
 * Analyze fundamental signals based on financial data
 */
export const analyzeFundamentalSignals = (financialData: FinancialSnapshot): FundamentalSignals => {
  return {
    valuation: {
      pegOvervalued: financialData.peg_ratio > 2.0,
      peOvervalued: financialData.price_to_earnings_ratio > 25,
      pbOvervalued: financialData.price_to_book_ratio > 5,
    },
    growth: {
      hasGrowth: financialData.revenue_growth > 0.02, // 2% growth threshold
      strongGrowth: financialData.revenue_growth > 0.10, // 10% strong growth
    },
    liquidity: {
      liquidityRisk: financialData.current_ratio < 1.0,
      debtConcern: financialData.debt_to_equity > 0.5,
    },
    profitability: {
      strongMargins: financialData.gross_margin > 0.4 && financialData.operating_margin > 0.2,
      goodRoe: financialData.return_on_equity > 0.15,
    }
  };
};

/**
 * Calculate technical analysis score (0-100)
 */
export const calculateTechnicalScore = (signals: TechnicalSignals): number => {
  let score = 50; // Neutral starting point
  
  // Moving Average Signals (30 points)
  const maSignals = signals.priceVsMovingAverages;
  if (maSignals.aboveSma200) score += 10;
  if (maSignals.aboveSma50) score += 8;
  if (maSignals.aboveSma20) score += 7;
  if (maSignals.aboveEma50) score += 3;
  if (maSignals.aboveEma20) score += 2;
  
  // Momentum Signals (25 points)
  if (signals.momentum.rsiOversold) score += 15;
  if (signals.momentum.rsiOverbought) score -= 15;
  if (signals.momentum.macdBullish) score += 10;
  if (signals.momentum.macdBearish) score -= 10;
  
  // Volume Confirmation (10 points)
  if (signals.volume.aboveAverage) score += 10;
  
  // Volatility Context (15 points)
  if (signals.volatility.nearLowerBand && signals.momentum.rsiOversold) score += 15;
  if (signals.volatility.nearUpperBand && signals.momentum.rsiOverbought) score -= 15;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate fundamental analysis score (0-100)
 */
export const calculateFundamentalScore = (signals: FundamentalSignals): number => {
  let score = 50; // Neutral starting point
  
  // Valuation (30 points)
  if (signals.valuation.pegOvervalued) score -= 20;
  if (signals.valuation.peOvervalued) score -= 10;
  if (signals.valuation.pbOvervalued) score -= 5;
  
  // Growth (25 points)
  if (signals.growth.strongGrowth) score += 25;
  else if (signals.growth.hasGrowth) score += 10;
  else score -= 15; // No growth penalty
  
  // Liquidity & Financial Health (25 points)
  if (signals.liquidity.liquidityRisk) score -= 15;
  if (signals.liquidity.debtConcern) score -= 10;
  
  // Profitability (20 points)
  if (signals.profitability.strongMargins) score += 15;
  if (signals.profitability.goodRoe) score += 10;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Generate quantitative recommendation
 */
export const generateQuantitativeRecommendation = (
  prices: TimeSeriesDataPoint[],
  technicalIndicators: TechnicalIndicators,
  financialData: FinancialSnapshot,
  riskMetrics: any
): QuantitativeRecommendation => {
  const technicalSignals = analyzeTechnicalSignals(prices, technicalIndicators);
  const fundamentalSignals = analyzeFundamentalSignals(financialData);
  
  const technicalScore = calculateTechnicalScore(technicalSignals);
  const fundamentalScore = calculateFundamentalScore(fundamentalSignals);
  
  // Risk-adjusted score (weighted: 40% technical, 50% fundamental, 10% risk)
  const riskAdjustment = riskMetrics.sharpeRatio > 1 ? 5 : (riskMetrics.maxDrawdown > 0.3 ? -5 : 0);
  const riskAdjustedScore = (technicalScore * 0.4) + (fundamentalScore * 0.5) + riskAdjustment;
  
  // Determine recommendation
  let recommendation: "BUY" | "HOLD" | "SELL" | "WEAK_BUY" | "WEAK_SELL";
  if (riskAdjustedScore >= 75) recommendation = "BUY";
  else if (riskAdjustedScore >= 60) recommendation = "WEAK_BUY";
  else if (riskAdjustedScore >= 40) recommendation = "HOLD";
  else if (riskAdjustedScore >= 25) recommendation = "WEAK_SELL";
  else recommendation = "SELL";
  
  // Generate verdicts and rationale
  const technicalVerdict = technicalScore >= 60 ? "BULLISH" : technicalScore >= 40 ? "NEUTRAL" : "BEARISH";
  const fundamentalVerdict = fundamentalScore >= 60 ? "BUY" : fundamentalScore >= 40 ? "HOLD" : "SELL/AVOID";
  
  const rationale: string[] = [];
  
  // Technical rationale
  if (!technicalSignals.priceVsMovingAverages.aboveSma20) rationale.push("❌ Price below key moving averages");
  if (technicalSignals.momentum.macdBearish) rationale.push("❌ MACD showing bearish momentum");
  if (technicalIndicators.ema50 && technicalIndicators.ema20 && technicalIndicators.ema50 > technicalIndicators.ema20) {
    rationale.push("❌ EMA(50) > EMA(20) - bearish crossover setup");
  }
  
  // Fundamental rationale
  if (fundamentalSignals.valuation.pegOvervalued) rationale.push("🚨 PEG Ratio severely overvalued (>2.0)");
  if (!fundamentalSignals.growth.hasGrowth) rationale.push("🚨 Zero/minimal growth metrics");
  if (fundamentalSignals.liquidity.liquidityRisk) rationale.push("🚨 Current ratio below 1.0 - liquidity risk");
  if (fundamentalSignals.profitability.strongMargins) rationale.push("✅ Strong profit margins");
  if (riskMetrics.sharpeRatio > 1) rationale.push("✅ Excellent Sharpe ratio");
  
  // Generate alternative strategy
  let alternativeStrategy = "";
  if (recommendation === "SELL" || recommendation === "WEAK_SELL") {
    alternativeStrategy = `Wait for RSI < 30 (oversold) for potential bounce trade. Target entry below key support levels.`;
  } else if (recommendation === "HOLD") {
    alternativeStrategy = `Monitor for breakout above resistance or improved fundamentals.`;
  }
  
  // Portfolio allocation
  let portfolioAllocation = "";
  if (recommendation === "BUY") portfolioAllocation = "5-10% allocation recommended";
  else if (recommendation === "WEAK_BUY") portfolioAllocation = "2-5% allocation, small position";
  else if (recommendation === "HOLD") portfolioAllocation = "Maintain current position";
  else if (recommendation === "WEAK_SELL") portfolioAllocation = "Reduce position size by 25-50%";
  else portfolioAllocation = "0% new money, consider reducing existing positions";
  
  return {
    technicalScore,
    fundamentalScore,
    riskAdjustedScore,
    recommendation,
    technicalVerdict,
    fundamentalVerdict,
    rationale,
    alternativeStrategy,
    portfolioAllocation
  };
};