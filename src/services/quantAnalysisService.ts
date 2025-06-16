import { TechnicalIndicators, TechnicalSignals, FundamentalSignals, analyzeTechnicalSignals } from "./riskAnalysisService";
import { TimeSeriesDataPoint } from "./alphaVantageService";
import { FinancialSnapshot } from "./financialDatasetsService";
import { QuantitativeRecommendation } from "@/types/quantitativeAnalysis";

export interface QuantitativeRecommendationOld {
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
 * Generate technical analysis insights and rationale
 */
const generateTechnicalAnalysis = (technicalSignals: TechnicalSignals, technicalIndicators: TechnicalIndicators) => {
  const rationale: string[] = [];
  const insights = {
    trendDirection: "",
    momentumStrength: "",
    volumeConfirmation: "",
    volatilityContext: ""
  };

  // Advanced technical rationale
  if (technicalIndicators.advancedSignals) {
    const advSig = technicalIndicators.advancedSignals;
    
    if (advSig.signal === "bullish") {
      rationale.push(`✅ Multi-strategy analysis shows ${Math.round(advSig.confidence * 100)}% bullish confidence`);
      insights.trendDirection = `Strong bullish trend with ${Math.round(advSig.confidence * 100)}% confidence`;
    } else if (advSig.signal === "bearish") {
      rationale.push(`❌ Multi-strategy analysis shows ${Math.round(advSig.confidence * 100)}% bearish confidence`);
      insights.trendDirection = `Bearish trend with ${Math.round(advSig.confidence * 100)}% confidence`;
    } else {
      insights.trendDirection = "Neutral/sideways trend";
    }
    
    // Strategy-specific insights
    if (advSig.strategies.trend_following.signal === "bullish" && advSig.strategies.trend_following.confidence > 0.7) {
      rationale.push("✅ Strong trend following signals with ADX confirmation");
    }
    
    if (advSig.strategies.mean_reversion.signal === "bullish" && advSig.strategies.mean_reversion.confidence > 0.6) {
      rationale.push("✅ Mean reversion opportunity detected - price oversold");
    }
    
    if (advSig.strategies.momentum.signal === "bearish" && advSig.strategies.momentum.confidence > 0.6) {
      rationale.push("❌ Negative momentum across multiple timeframes");
      insights.momentumStrength = "Weak momentum with bearish confirmation";
    } else if (advSig.strategies.momentum.signal === "bullish") {
      insights.momentumStrength = "Strong bullish momentum";
    } else {
      insights.momentumStrength = "Neutral momentum";
    }
    
    if (technicalIndicators.hurstExponent && technicalIndicators.hurstExponent < 0.4) {
      rationale.push("✅ Hurst exponent indicates mean-reverting behavior");
    }
  } else {
    // Fallback traditional rationale
    if (!technicalSignals.priceVsMovingAverages.aboveSma20) {
      rationale.push("❌ Price below 20-day moving average - short-term bearish");
    }
    if (!technicalSignals.priceVsMovingAverages.aboveSma50) {
      rationale.push("❌ Price below 50-day moving average - medium-term bearish");
    }
    if (technicalSignals.momentum.macdBearish) {
      rationale.push("❌ MACD showing bearish momentum divergence");
    }
    if (technicalSignals.momentum.rsiOverbought) {
      rationale.push("❌ RSI overbought (>70) - potential reversal");
    }
    if (technicalSignals.momentum.rsiOversold) {
      rationale.push("✅ RSI oversold (<30) - potential bounce");
    }
  }

  // Volume analysis
  if (technicalSignals.volume.aboveAverage) {
    rationale.push("✅ Above-average volume confirming price movement");
    insights.volumeConfirmation = "Strong volume confirmation";
  } else {
    insights.volumeConfirmation = "Limited volume confirmation";
  }

  // Volatility context
  if (technicalSignals.volatility.nearUpperBand) {
    rationale.push("❌ Price near Bollinger Band upper limit - potential resistance");
    insights.volatilityContext = "High volatility zone - near resistance";
  } else if (technicalSignals.volatility.nearLowerBand) {
    rationale.push("✅ Price near Bollinger Band lower limit - potential support");
    insights.volatilityContext = "High volatility zone - near support";
  } else {
    insights.volatilityContext = "Normal volatility range";
  }

  return { rationale, insights };
};

/**
 * Generate fundamental analysis insights and rationale
 */
const generateFundamentalAnalysis = (fundamentalSignals: FundamentalSignals, financialData: FinancialSnapshot) => {
  const rationale: string[] = [];
  const insights = {
    valuation: "",
    growth: "",
    profitability: "",
    financialHealth: ""
  };

  // Valuation analysis
  if (fundamentalSignals.valuation.pegOvervalued) {
    rationale.push("🚨 PEG Ratio severely overvalued (>2.0) - growth not justifying price");
    insights.valuation = "Significantly overvalued based on growth metrics";
  } else if (fundamentalSignals.valuation.peOvervalued) {
    rationale.push("⚠️ P/E Ratio elevated (>25) - premium valuation");
    insights.valuation = "Premium valuation with elevated P/E ratio";
  } else {
    insights.valuation = "Reasonable valuation metrics";
  }

  if (fundamentalSignals.valuation.pbOvervalued) {
    rationale.push("⚠️ Price-to-Book ratio high (>5) - asset premium");
  }

  // Growth analysis
  if (!fundamentalSignals.growth.hasGrowth) {
    rationale.push("🚨 Zero or negative revenue growth - business stagnation");
    insights.growth = "No growth or declining business metrics";
  } else if (fundamentalSignals.growth.strongGrowth) {
    rationale.push("✅ Strong revenue growth (>10%) - expanding business");
    insights.growth = "Strong growth trajectory across key metrics";
  } else {
    rationale.push("✅ Positive revenue growth (>2%) - steady expansion");
    insights.growth = "Moderate but consistent growth";
  }

  // Profitability analysis
  if (fundamentalSignals.profitability.strongMargins) {
    rationale.push("✅ Excellent profit margins - efficient operations");
    insights.profitability = "Strong operational efficiency and pricing power";
  } else {
    insights.profitability = "Moderate profitability with room for improvement";
  }

  if (fundamentalSignals.profitability.goodRoe) {
    rationale.push("✅ Strong Return on Equity (>15%) - effective capital use");
  } else {
    rationale.push("⚠️ Below-average Return on Equity - capital efficiency concerns");
  }

  // Financial health analysis
  if (fundamentalSignals.liquidity.liquidityRisk) {
    rationale.push("🚨 Current ratio below 1.0 - short-term liquidity risk");
    insights.financialHealth = "Potential liquidity constraints and financial stress";
  } else {
    insights.financialHealth = "Adequate liquidity and financial stability";
  }

  if (fundamentalSignals.liquidity.debtConcern) {
    rationale.push("⚠️ High debt-to-equity ratio (>0.5) - leverage concerns");
  } else {
    rationale.push("✅ Conservative debt levels - financial flexibility");
  }

  // Add specific financial metrics context
  if (financialData.gross_margin > 0.6) {
    rationale.push("✅ Exceptional gross margins (>60%) - strong pricing power");
  }

  if (financialData.operating_margin > 0.25) {
    rationale.push("✅ Superior operating margins (>25%) - operational excellence");
  }

  return { rationale, insights };
};

/**
 * Calculate enhanced technical analysis score using advanced signals
 */
export const calculateTechnicalScore = (signals: TechnicalSignals, technicalIndicators: TechnicalIndicators): number => {
  let score = 50; // Neutral starting point
  
  // Advanced signals weight (40 points)
  if (technicalIndicators.advancedSignals) {
    const advancedSignal = technicalIndicators.advancedSignals;
    const confidence = advancedSignal.confidence;
    
    if (advancedSignal.signal === "bullish") {
      score += confidence * 40;
    } else if (advancedSignal.signal === "bearish") {
      score -= confidence * 40;
    }
    
    // Strategy-specific bonuses
    const strategies = advancedSignal.strategies;
    
    // Trend following strength
    if (strategies.trend_following.signal === "bullish" && strategies.trend_following.confidence > 0.7) {
      score += 10;
    } else if (strategies.trend_following.signal === "bearish" && strategies.trend_following.confidence > 0.7) {
      score -= 10;
    }
    
    // Momentum confirmation
    if (strategies.momentum.signal === "bullish" && strategies.momentum.confidence > 0.6) {
      score += 8;
    } else if (strategies.momentum.signal === "bearish" && strategies.momentum.confidence > 0.6) {
      score -= 8;
    }
    
    // Mean reversion opportunities
    if (strategies.mean_reversion.signal === "bullish" && strategies.mean_reversion.confidence > 0.6) {
      score += 7;
    } else if (strategies.mean_reversion.signal === "bearish" && strategies.mean_reversion.confidence > 0.6) {
      score -= 7;
    }
  } else {
    // Fallback to traditional signals if advanced signals are not available
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
  }
  
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
 * Generate enhanced quantitative recommendation with separated analysis
 */
export const generateQuantitativeRecommendation = (
  prices: TimeSeriesDataPoint[],
  technicalIndicators: TechnicalIndicators,
  financialData: FinancialSnapshot,
  riskMetrics: any
): QuantitativeRecommendation => {
  const technicalSignals = analyzeTechnicalSignals(prices, technicalIndicators);
  const fundamentalSignals = analyzeFundamentalSignals(financialData);
  
  const technicalScore = calculateTechnicalScore(technicalSignals, technicalIndicators);
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
  
  // Generate verdicts
  const technicalVerdict = technicalScore >= 60 ? "BULLISH" : technicalScore >= 40 ? "NEUTRAL" : "BEARISH";
  const fundamentalVerdict = fundamentalScore >= 60 ? "BUY" : fundamentalScore >= 40 ? "HOLD" : "SELL/AVOID";
  
  // Generate separated analysis
  const technicalAnalysis = generateTechnicalAnalysis(technicalSignals, technicalIndicators);
  const fundamentalAnalysis = generateFundamentalAnalysis(fundamentalSignals, financialData);
  
  // Add risk context
  if (riskMetrics.sharpeRatio > 1) {
    technicalAnalysis.rationale.push("✅ Excellent risk-adjusted returns (Sharpe > 1)");
  }
  
  // Generate alternative strategy based on advanced signals
  let alternativeStrategy = "";
  if (technicalIndicators.advancedSignals) {
    const advSig = technicalIndicators.advancedSignals;
    
    if (recommendation === "SELL" || recommendation === "WEAK_SELL") {
      if (advSig.strategies.mean_reversion.confidence > 0.6) {
        alternativeStrategy = `Consider mean reversion trade: Wait for RSI < 30 for potential bounce entry.`;
      } else {
        alternativeStrategy = `Trend following approach: Wait for trend reversal confirmation before entry.`;
      }
    } else if (recommendation === "HOLD") {
      alternativeStrategy = `Monitor volatility regime and momentum shifts for improved entry/exit timing.`;
    } else {
      alternativeStrategy = `Consider scaling into position based on momentum and volatility signals.`;
    }
  } else {
    if (recommendation === "SELL" || recommendation === "WEAK_SELL") {
      alternativeStrategy = `Wait for oversold conditions (RSI < 30) for potential bounce trade.`;
    } else if (recommendation === "HOLD") {
      alternativeStrategy = `Monitor for breakout above resistance or improved fundamentals.`;
    }
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
    technicalRationale: technicalAnalysis.rationale,
    fundamentalRationale: fundamentalAnalysis.rationale,
    technicalInsights: technicalAnalysis.insights,
    fundamentalInsights: fundamentalAnalysis.insights,
    alternativeStrategy,
    portfolioAllocation
  };
};
