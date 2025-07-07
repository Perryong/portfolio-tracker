
export interface MethodScore {
  method: string;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'bullish' | 'bearish' | 'neutral';
  score: number; // 0-100
  confidence: number; // 0-100
  reasoning: string;
  available: boolean;
}

export interface WeightedAnalysis {
  warrenBuffett: number;
  charlieMunger: number;
  peterLynch: number;
  billAckman: number;
  quantitative: number;
}

export interface SummaryRecommendation {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-100
  weightedScore: number; // 0-100
  reasoning: string;
  keyInsights: string[];
  strengths: string[];
  concerns: string[];
}

export interface SummaryAnalysis {
  ticker: string;
  methodScores: MethodScore[];
  weights: WeightedAnalysis;
  finalRecommendation: SummaryRecommendation;
  analysisDate: Date;
  availableAnalyses: number;
}
