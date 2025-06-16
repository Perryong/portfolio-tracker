
export interface PeterLynchAnalysis {
  ticker: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  garpAnalysis: GARPAnalysis;
  growthAnalysis: GrowthAnalysis;
  businessQuality: BusinessQuality;
  tenBaggerPotential: TenBaggerPotential;
  reasoning: string;
}

export interface GARPAnalysis {
  pegRatio: number | null;
  peRatio: number | null;
  growthRate: number | null;
  score: number;
  interpretation: string;
  details: string[];
}

export interface GrowthAnalysis {
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  consistentGrowth: boolean;
  growthTrend: 'accelerating' | 'steady' | 'decelerating' | 'volatile';
  score: number;
  details: string[];
}

export interface BusinessQuality {
  profitMargins: {
    gross: number | null;
    operating: number | null;
    net: number | null;
  };
  debtToEquity: number | null;
  returnOnEquity: number | null;
  businessModel: 'simple' | 'complex' | 'cyclical';
  competitivePosition: 'strong' | 'moderate' | 'weak';
  score: number;
  details: string[];
}

export interface TenBaggerPotential {
  marketOpportunity: 'large' | 'medium' | 'small';
  growthRunway: number; // years of potential growth
  competitiveAdvantages: string[];
  riskFactors: string[];
  probability: number; // 0-100
  timeHorizon: string;
  score: number;
  details: string[];
}
