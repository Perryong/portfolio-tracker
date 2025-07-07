
import { MethodScore } from '@/types/summaryAnalysis';
import { QuantitativeRecommendation } from '@/types/quantitativeAnalysis';
import { BuffettMetrics } from '../buffettMetricsService';
import { CharlieMungerAnalysis } from '@/types/charlieMungerAnalysis';
import { PeterLynchAnalysis } from '@/types/peterLynchAnalysis';
import { BillAckmanAnalysis } from '@/types/billAckmanAnalysis';

export const calculateWarrenBuffettScore = (buffettMetrics?: BuffettMetrics): MethodScore => {
  if (buffettMetrics !== undefined) {
    if (buffettMetrics) {
      const signal = buffettMetrics.isCompoundingMachine ? 'BUY' : 
                     buffettMetrics.compoundingScore >= 60 ? 'HOLD' : 'SELL';
      return {
        method: 'Warren Buffett',
        signal,
        score: buffettMetrics.compoundingScore,
        confidence: buffettMetrics.isCompoundingMachine ? 90 : 
                    buffettMetrics.compoundingScore >= 60 ? 70 : 85,
        reasoning: buffettMetrics.investmentThesis,
        available: true
      };
    } else {
      return {
        method: 'Warren Buffett',
        signal: 'HOLD',
        score: 0,
        confidence: 0,
        reasoning: 'Analysis not available',
        available: false
      };
    }
  }
  return null as any; // Will be filtered out
};

export const calculateCharlieMungerScore = (mungerAnalysis?: CharlieMungerAnalysis): MethodScore => {
  if (mungerAnalysis !== undefined) {
    if (mungerAnalysis) {
      const signal = mungerAnalysis.signal === 'bullish' ? 'BUY' :
                     mungerAnalysis.signal === 'bearish' ? 'SELL' : 'HOLD';
      return {
        method: 'Charlie Munger',
        signal,
        score: mungerAnalysis.overallScore * 10, // Convert to 0-100 scale
        confidence: mungerAnalysis.confidence,
        reasoning: mungerAnalysis.reasoning,
        available: true
      };
    } else {
      return {
        method: 'Charlie Munger',
        signal: 'HOLD',
        score: 0,
        confidence: 0,
        reasoning: 'Analysis not available',
        available: false
      };
    }
  }
  return null as any; // Will be filtered out
};

export const calculatePeterLynchScore = (lynchAnalysis?: PeterLynchAnalysis): MethodScore => {
  if (lynchAnalysis !== undefined) {
    if (lynchAnalysis) {
      const signal = lynchAnalysis.signal === 'bullish' ? 'BUY' :
                     lynchAnalysis.signal === 'bearish' ? 'SELL' : 'HOLD';
      return {
        method: 'Peter Lynch',
        signal,
        score: lynchAnalysis.confidence,
        confidence: lynchAnalysis.confidence,
        reasoning: lynchAnalysis.reasoning,
        available: true
      };
    } else {
      return {
        method: 'Peter Lynch',
        signal: 'HOLD',
        score: 0,
        confidence: 0,
        reasoning: 'Analysis not available',
        available: false
      };
    }
  }
  return null as any; // Will be filtered out
};

export const calculateBillAckmanScore = (ackmanAnalysis?: BillAckmanAnalysis): MethodScore => {
  if (ackmanAnalysis !== undefined) {
    if (ackmanAnalysis) {
      const signal = ackmanAnalysis.signal === 'bullish' ? 'BUY' :
                     ackmanAnalysis.signal === 'bearish' ? 'SELL' : 'HOLD';
      return {
        method: 'Bill Ackman',
        signal,
        score: ackmanAnalysis.confidence,
        confidence: ackmanAnalysis.confidence,
        reasoning: ackmanAnalysis.reasoning,
        available: true
      };
    } else {
      return {
        method: 'Bill Ackman',
        signal: 'HOLD',
        score: 0,
        confidence: 0,
        reasoning: 'Analysis not available',
        available: false
      };
    }
  }
  return null as any; // Will be filtered out
};

export const calculateQuantitativeScore = (quantitativeRecommendation?: QuantitativeRecommendation): MethodScore => {
  if (quantitativeRecommendation !== undefined) {
    if (quantitativeRecommendation) {
      const signal = quantitativeRecommendation.recommendation === 'BUY' || 
                     quantitativeRecommendation.recommendation === 'WEAK_BUY' ? 'BUY' :
                     quantitativeRecommendation.recommendation === 'SELL' || 
                     quantitativeRecommendation.recommendation === 'WEAK_SELL' ? 'SELL' : 'HOLD';
      const score = (quantitativeRecommendation.technicalScore + quantitativeRecommendation.fundamentalScore + quantitativeRecommendation.riskAdjustedScore) / 3;
      return {
        method: 'Quantitative',
        signal,
        score,
        confidence: Math.min(90, score + 10), // Estimate confidence based on score
        reasoning: `Technical: ${quantitativeRecommendation.technicalVerdict}, Fundamental: ${quantitativeRecommendation.fundamentalVerdict}`,
        available: true
      };
    } else {
      return {
        method: 'Quantitative',
        signal: 'HOLD',
        score: 0,
        confidence: 0,
        reasoning: 'Analysis not available',
        available: false
      };
    }
  }
  return null as any; // Will be filtered out
};
