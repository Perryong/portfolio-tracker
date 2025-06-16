
export interface BillAckmanAnalysis {
  ticker: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  businessQuality: BusinessQualityAnalysis;
  financialDiscipline: FinancialDisciplineAnalysis;
  activismPotential: ActivismPotentialAnalysis;
  valuation: ValuationAnalysis;
  reasoning: string;
}

export interface BusinessQualityAnalysis {
  revenueGrowth: number | null;
  avgOperatingMargin: number | null;
  returnOnEquity: number | null;
  freeCashFlowConsistency: boolean;
  competitiveAdvantage: 'strong' | 'moderate' | 'weak';
  score: number;
  details: string[];
}

export interface FinancialDisciplineAnalysis {
  avgDebtToEquity: number | null;
  capitalReturns: boolean;
  shareCountTrend: 'decreasing' | 'stable' | 'increasing';
  leverageManagement: 'excellent' | 'good' | 'poor';
  score: number;
  details: string[];
}

export interface ActivismPotentialAnalysis {
  operationalGaps: boolean;
  marginImprovement: number | null;
  managementEfficiency: 'high' | 'medium' | 'low';
  valueCreationOpportunity: 'high' | 'medium' | 'low';
  score: number;
  details: string[];
}

export interface ValuationAnalysis {
  intrinsicValue: number | null;
  marginOfSafety: number | null;
  currentPrice: number | null;
  dcfAssumptions: {
    growthRate: number;
    discountRate: number;
    terminalMultiple: number;
  };
  score: number;
  details: string[];
}
