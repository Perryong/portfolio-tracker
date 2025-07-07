
// Export the types that are imported from types file
export type { SummaryAnalysis, WeightedAnalysis, MethodScore, SummaryRecommendation } from '@/types/summaryAnalysis';
export type { QuantitativeRecommendation } from '@/types/quantitativeAnalysis';
export type { BuffettMetrics } from '../buffettMetricsService';
export type { CharlieMungerAnalysis } from '@/types/charlieMungerAnalysis';
export type { PeterLynchAnalysis } from '@/types/peterLynchAnalysis';
export type { BillAckmanAnalysis } from '@/types/billAckmanAnalysis';

// Import the WeightedAnalysis type to use it in the constant
import { WeightedAnalysis } from '@/types/summaryAnalysis';

export const DEFAULT_WEIGHTS: WeightedAnalysis = {
  warrenBuffett: 25,
  charlieMunger: 20,
  peterLynch: 20,
  billAckman: 15,
  quantitative: 20
};
