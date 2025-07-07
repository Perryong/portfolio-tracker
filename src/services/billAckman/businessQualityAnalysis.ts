
import { FinancialSnapshot } from '../financialDatasetsService';
import { BusinessQualityAnalysis } from '@/types/billAckmanAnalysis';

export const analyzeBusinessQuality = (data: FinancialSnapshot): BusinessQualityAnalysis => {
  const details: string[] = [];
  let score = 0;
  
  // Revenue growth analysis
  const revenueGrowth = data.revenue_growth;
  if (revenueGrowth !== null) {
    if (revenueGrowth > 0.15) {
      score += 3;
      details.push(`Strong revenue growth: ${(revenueGrowth * 100).toFixed(1)}%`);
    } else if (revenueGrowth > 0.08) {
      score += 2;
      details.push(`Moderate revenue growth: ${(revenueGrowth * 100).toFixed(1)}%`);
    } else if (revenueGrowth > 0) {
      score += 1;
      details.push(`Slow revenue growth: ${(revenueGrowth * 100).toFixed(1)}%`);
    } else {
      details.push(`Declining revenue: ${(revenueGrowth * 100).toFixed(1)}%`);
    }
  }
  
  // Operating margin analysis (Ackman targets >15%)
  const operatingMargin = data.operating_margin;
  let avgOperatingMargin = operatingMargin;
  if (operatingMargin !== null) {
    if (operatingMargin > 0.20) {
      score += 3;
      details.push(`Excellent operating margin: ${(operatingMargin * 100).toFixed(1)}%`);
    } else if (operatingMargin > 0.15) {
      score += 2;
      details.push(`Strong operating margin: ${(operatingMargin * 100).toFixed(1)}%`);
    } else if (operatingMargin > 0.10) {
      score += 1;
      details.push(`Decent operating margin: ${(operatingMargin * 100).toFixed(1)}%`);
    } else {
      details.push(`Weak operating margin: ${(operatingMargin * 100).toFixed(1)}%`);
    }
  }
  
  // Return on Equity (Ackman targets >15%)
  const returnOnEquity = data.return_on_equity;
  if (returnOnEquity !== null) {
    if (returnOnEquity > 0.20) {
      score += 2;
      details.push(`Exceptional ROE: ${(returnOnEquity * 100).toFixed(1)}%`);
    } else if (returnOnEquity > 0.15) {
      score += 1;
      details.push(`Strong ROE: ${(returnOnEquity * 100).toFixed(1)}%`);
    } else {
      details.push(`Below-target ROE: ${(returnOnEquity * 100).toFixed(1)}%`);
    }
  }
  
  // Free cash flow consistency
  const freeCashFlowYield = data.free_cash_flow_yield;
  const freeCashFlowConsistency = freeCashFlowYield !== null && freeCashFlowYield > 0.05;
  if (freeCashFlowConsistency) {
    score += 2;
    details.push(`Strong free cash flow yield: ${(freeCashFlowYield! * 100).toFixed(1)}%`);
  } else {
    details.push('Weak or inconsistent free cash flow generation');
  }
  
  // Competitive advantage assessment
  const competitiveAdvantage = assessCompetitiveAdvantage(data);
  if (competitiveAdvantage === 'strong') {
    score += 2;
    details.push('Strong competitive moat identified');
  } else if (competitiveAdvantage === 'moderate') {
    score += 1;
    details.push('Moderate competitive advantages');
  }
  
  return {
    revenueGrowth,
    avgOperatingMargin,
    returnOnEquity,
    freeCashFlowConsistency,
    competitiveAdvantage,
    score: Math.min(10, score),
    details
  };
};

const assessCompetitiveAdvantage = (data: FinancialSnapshot): 'strong' | 'moderate' | 'weak' => {
  const roe = data.return_on_equity || 0;
  const operatingMargin = data.operating_margin || 0;
  const grossMargin = data.gross_margin || 0;
  
  if (roe > 0.20 && operatingMargin > 0.15 && grossMargin > 0.40) return 'strong';
  if (roe > 0.15 && operatingMargin > 0.10 && grossMargin > 0.25) return 'moderate';
  return 'weak';
};
