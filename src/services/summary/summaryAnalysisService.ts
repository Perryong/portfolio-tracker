
import { SummaryAnalysis, WeightedAnalysis } from '@/types/summaryAnalysis';
import { QuantitativeRecommendation } from '@/types/quantitativeAnalysis';
import { BuffettMetrics } from '../buffettMetricsService';
import { CharlieMungerAnalysis } from '@/types/charlieMungerAnalysis';
import { PeterLynchAnalysis } from '@/types/peterLynchAnalysis';
import { BillAckmanAnalysis } from '@/types/billAckmanAnalysis';
import { DEFAULT_WEIGHTS } from './types';
import {
  calculateWarrenBuffettScore,
  calculateCharlieMungerScore,
  calculatePeterLynchScore,
  calculateBillAckmanScore,
  calculateQuantitativeScore
} from './methodScoreCalculator';
import { calculateFinalRecommendation } from './recommendationCalculator';

export const generateSummaryAnalysis = (
  ticker: string,
  quantitativeRecommendation?: QuantitativeRecommendation,
  buffettMetrics?: BuffettMetrics,
  mungerAnalysis?: CharlieMungerAnalysis,
  lynchAnalysis?: PeterLynchAnalysis,
  ackmanAnalysis?: BillAckmanAnalysis,
  weights: WeightedAnalysis = DEFAULT_WEIGHTS
): SummaryAnalysis => {
  console.log('Generating summary analysis for:', ticker);

  const methodScores = [
    calculateWarrenBuffettScore(buffettMetrics),
    calculateCharlieMungerScore(mungerAnalysis),
    calculatePeterLynchScore(lynchAnalysis),
    calculateBillAckmanScore(ackmanAnalysis),
    calculateQuantitativeScore(quantitativeRecommendation)
  ].filter(Boolean);

  const finalRecommendation = calculateFinalRecommendation(methodScores, weights);

  return {
    ticker,
    methodScores,
    weights,
    finalRecommendation,
    analysisDate: new Date(),
    availableAnalyses: methodScores.filter(m => m.available).length
  };
};
