
export interface QuantitativeRecommendation {
  technicalScore: number;
  fundamentalScore: number;
  riskAdjustedScore: number;
  recommendation: "BUY" | "HOLD" | "SELL" | "WEAK_BUY" | "WEAK_SELL";
  technicalVerdict: "BULLISH" | "NEUTRAL" | "BEARISH";
  fundamentalVerdict: "BUY" | "HOLD" | "SELL/AVOID";
  
  // Separated analysis rationales
  technicalRationale: string[];
  fundamentalRationale: string[];
  
  // Specific insights for each analysis type
  technicalInsights: {
    trendDirection: string;
    momentumStrength: string;
    volumeConfirmation: string;
    volatilityContext: string;
  };
  fundamentalInsights: {
    valuation: string;
    growth: string;
    profitability: string;
    financialHealth: string;
  };
  
  alternativeStrategy: string;
  portfolioAllocation: string;
}
