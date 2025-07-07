
import { FinancialSnapshot } from '../financialDatasetsService';
import { FinancialDisciplineAnalysis } from '@/types/billAckmanAnalysis';

export const analyzeFinancialDiscipline = (data: FinancialSnapshot): FinancialDisciplineAnalysis => {
  const details: string[] = [];
  let score = 0;
  
  // Debt management (Ackman prefers conservative leverage)
  const debtToEquity = data.debt_to_equity;
  let leverageManagement: 'excellent' | 'good' | 'poor' = 'poor';
  
  if (debtToEquity !== null) {
    if (debtToEquity < 0.3) {
      score += 3;
      leverageManagement = 'excellent';
      details.push(`Conservative debt levels: ${debtToEquity.toFixed(2)} D/E ratio`);
    } else if (debtToEquity < 0.6) {
      score += 2;
      leverageManagement = 'good';
      details.push(`Reasonable debt levels: ${debtToEquity.toFixed(2)} D/E ratio`);
    } else if (debtToEquity < 1.0) {
      score += 1;
      details.push(`Elevated debt levels: ${debtToEquity.toFixed(2)} D/E ratio`);
    } else {
      details.push(`High debt levels: ${debtToEquity.toFixed(2)} D/E ratio`);
    }
  }
  
  // Capital allocation (using payout_ratio instead of dividend_yield)
  const payoutRatio = data.payout_ratio;
  const capitalReturns = payoutRatio !== null && payoutRatio > 0;
  
  if (capitalReturns) {
    score += 2;
    details.push(`Returning capital via dividends: ${(payoutRatio! * 100).toFixed(1)}% payout ratio`);
  } else {
    details.push('No consistent dividend policy identified');
  }
  
  // Share count trends (simplified assessment)
  const shareCountTrend = assessShareCountTrend(data);
  if (shareCountTrend === 'decreasing') {
    score += 2;
    details.push('Share count declining (active buyback program)');
  } else if (shareCountTrend === 'stable') {
    score += 1;
    details.push('Stable share count');
  } else {
    details.push('Share count increasing (dilution concern)');
  }
  
  // Working capital efficiency
  const currentRatio = data.current_ratio;
  if (currentRatio !== null) {
    if (currentRatio > 1.5 && currentRatio < 3.0) {
      score += 1;
      details.push(`Healthy liquidity: ${currentRatio.toFixed(1)} current ratio`);
    } else if (currentRatio < 1.0) {
      details.push(`Liquidity concerns: ${currentRatio.toFixed(1)} current ratio`);
    }
  }
  
  return {
    avgDebtToEquity: debtToEquity,
    capitalReturns,
    shareCountTrend,
    leverageManagement,
    score: Math.min(10, score),
    details
  };
};

const assessShareCountTrend = (data: FinancialSnapshot): 'decreasing' | 'stable' | 'increasing' => {
  // Simplified assessment based on available data
  const freeCashFlowYield = data.free_cash_flow_yield || 0;
  const payoutRatio = data.payout_ratio || 0;
  
  // If company has high FCF yield but low payout ratio, likely buying back shares
  if (freeCashFlowYield > 0.08 && payoutRatio < 0.3) return 'decreasing';
  if (freeCashFlowYield > 0.05) return 'stable';
  return 'increasing';
};
