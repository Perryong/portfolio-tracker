
import { BusinessQualityAnalysis, FinancialDisciplineAnalysis, ActivismPotentialAnalysis, ValuationAnalysis } from '@/types/billAckmanAnalysis';

export const determineAckmanSignal = (score: number): 'bullish' | 'bearish' | 'neutral' => {
  if (score >= 7.5) return 'bullish';   // High conviction threshold
  if (score <= 4.0) return 'bearish';   // Clear avoid
  return 'neutral';
};

export const calculateAckmanConfidence = (
  overallScore: number,
  businessQuality: BusinessQualityAnalysis,
  valuation: ValuationAnalysis
): number => {
  let confidence = overallScore * 9; // Base confidence from score (0-90)
  
  // Adjust based on key factors
  if (businessQuality.competitiveAdvantage === 'strong') confidence += 5;
  if (valuation.marginOfSafety !== null && valuation.marginOfSafety > 0.20) confidence += 5;
  if (businessQuality.returnOnEquity !== null && businessQuality.returnOnEquity > 0.20) confidence += 5;
  
  return Math.round(Math.min(95, Math.max(5, confidence)));
};

export const generateAckmanReasoning = (
  ticker: string,
  signal: string,
  businessQuality: BusinessQualityAnalysis,
  financialDiscipline: FinancialDisciplineAnalysis,
  activismPotential: ActivismPotentialAnalysis,
  valuation: ValuationAnalysis
): string => {
  const reasoning: string[] = [];
  
  reasoning.push(`Bill Ackman Analysis for ${ticker}:`);
  
  // Business Quality Assessment
  reasoning.push(`\n• Business Quality (${businessQuality.score}/10): ${businessQuality.competitiveAdvantage} competitive position`);
  if (businessQuality.returnOnEquity !== null) {
    reasoning.push(`  - ROE: ${(businessQuality.returnOnEquity * 100).toFixed(1)}% ${businessQuality.returnOnEquity > 0.15 ? '(Strong)' : '(Below target)'}`);
  }
  if (businessQuality.avgOperatingMargin !== null) {
    reasoning.push(`  - Operating Margin: ${(businessQuality.avgOperatingMargin * 100).toFixed(1)}% ${businessQuality.avgOperatingMargin > 0.15 ? '(Excellent)' : '(Needs improvement)'}`);
  }
  
  // Financial Discipline
  reasoning.push(`\n• Financial Discipline (${financialDiscipline.score}/10): ${financialDiscipline.leverageManagement} leverage management`);
  if (financialDiscipline.avgDebtToEquity !== null) {
    reasoning.push(`  - Debt-to-Equity: ${financialDiscipline.avgDebtToEquity.toFixed(2)}`);
  }
  reasoning.push(`  - Capital Returns: ${financialDiscipline.capitalReturns ? 'Yes' : 'No'}`);
  
  // Activism Potential
  reasoning.push(`\n• Activism Potential (${activismPotential.score}/10): ${activismPotential.valueCreationOpportunity} value creation opportunity`);
  if (activismPotential.marginImprovement !== null) {
    reasoning.push(`  - Margin Expansion Potential: ${(activismPotential.marginImprovement * 100).toFixed(1)}pp`);
  }
  
  // Valuation
  reasoning.push(`\n• Valuation (${valuation.score}/10):`);
  if (valuation.marginOfSafety !== null) {
    reasoning.push(`  - Margin of Safety: ${(valuation.marginOfSafety * 100).toFixed(1)}% (with conservative adjustment)`);
  }
  if (valuation.intrinsicValue && valuation.currentPrice) {
    reasoning.push(`  - Ackman Adjusted Value: $${valuation.intrinsicValue.toFixed(2)} vs Current: $${valuation.currentPrice.toFixed(2)}`);
  }
  
  // Note about methodology alignment
  reasoning.push(`\n• Methodology: Uses the same base DCF model as Stock Valuation tab with Ackman's conservative 20% haircut`);
  
  // Ackman-style conclusion
  const conclusion = signal === 'bullish' 
    ? "This represents a high-quality business trading at an attractive valuation with potential for concentrated investment and value creation through operational improvements."
    : signal === 'bearish'
    ? "This investment does not meet Ackman's rigorous standards for business quality, financial discipline, or valuation criteria."
    : "This requires further analysis or a better entry point before meeting Ackman's concentrated investment criteria.";
  
  reasoning.push(`\n${conclusion}`);
  
  return reasoning.join('\n');
};
