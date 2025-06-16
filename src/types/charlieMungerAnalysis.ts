
export interface MoatAnalysis {
  score: number;
  details: string;
  roicConsistency: number;
  pricingPower: number;
  capitalIntensity: number;
  intangibleAssets: number;
}

export interface ManagementQuality {
  score: number;
  details: string;
  capitalAllocation: number;
  debtManagement: number;
  cashManagement: number;
  insiderActivity: number;
  shareCountStability: number;
}

export interface BusinessPredictability {
  score: number;
  details: string;
  revenueStability: number;
  operatingIncomeConsistency: number;
  marginConsistency: number;
  cashGenerationReliability: number;
}

export interface MungerValuation {
  score: number;
  details: string;
  fcfYield: number;
  normalizedFcf: number;
  intrinsicValueRange: {
    conservative: number;
    reasonable: number;
    optimistic: number;
  };
  marginOfSafety: number;
}

export interface CharlieMungerAnalysis {
  ticker: string;
  signal: "bullish" | "bearish" | "neutral";
  confidence: number;
  overallScore: number;
  reasoning: string;
  moatAnalysis: MoatAnalysis;
  managementQuality: ManagementQuality;
  businessPredictability: BusinessPredictability;
  valuation: MungerValuation;
  keyInsights: string[];
  mentalModels: string[];
}
