import { AdvancedTechnicalSignals } from "@/services/advancedTechnicalAnalysis";

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
  vwma20: number | null; // Added VWMA
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  } | null;
  volumeSma20: number;
  priceChange: number;
  priceChangePercent: number;
  // Advanced indicators
  advancedSignals?: AdvancedTechnicalSignals;
  adx?: number;
  hurstExponent?: number;
  volatilityRegime?: number;
  momentumScore?: number;
  trendStrength?: number;
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
