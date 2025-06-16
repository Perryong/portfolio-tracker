
import { FinancialSnapshot } from './financialDatasetsService';
import { TimeSeriesDataPoint } from '@/services/alphaVantageService';
import { 
  BillAckmanAnalysis, 
  BusinessQualityAnalysis, 
  FinancialDisciplineAnalysis,
  ActivismPotentialAnalysis,
  ValuationAnalysis
} from '@/types/billAckmanAnalysis';

export const analyzeWithAckmanPrinciples = (
  financialData: FinancialSnapshot,
  historicalData: TimeSeriesDataPoint[]
): BillAckmanAnalysis => {
  console.log('Analyzing with Bill Ackman principles:', financialData.ticker);
  
  const businessQuality = analyzeBusinessQuality(financialData);
  const financialDiscipline = analyzeFinancialDiscipline(financialData);
  const activismPotential = analyzeActivismPotential(financialData);
  const valuation = analyzeValuation(financialData, historicalData);
  
  // Calculate overall score (weighted according to Ackman's priorities)
  const overallScore = (
    businessQuality.score * 0.30 +        // Quality is paramount
    financialDiscipline.score * 0.25 +    // Financial strength matters
    valuation.score * 0.30 +              // Valuation discipline is key
    activismPotential.score * 0.15        // Activism upside
  );
  
  const signal = determineAckmanSignal(overallScore);
  const confidence = calculateAckmanConfidence(overallScore, businessQuality, valuation);
  const reasoning = generateAckmanReasoning(
    financialData.ticker,
    signal,
    businessQuality,
    financialDiscipline,
    activismPotential,
    valuation
  );
  
  return {
    ticker: financialData.ticker,
    signal,
    confidence,
    businessQuality,
    financialDiscipline,
    activismPotential,
    valuation,
    reasoning
  };
};

const analyzeBusinessQuality = (data: FinancialSnapshot): BusinessQualityAnalysis => {
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

const analyzeFinancialDiscipline = (data: FinancialSnapshot): FinancialDisciplineAnalysis => {
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

const analyzeActivismPotential = (data: FinancialSnapshot): ActivismPotentialAnalysis => {
  const details: string[] = [];
  let score = 0;
  
  // Look for operational gaps (good revenue but poor margins)
  const revenueGrowth = data.revenue_growth || 0;
  const operatingMargin = data.operating_margin || 0;
  
  const operationalGaps = revenueGrowth > 0.05 && operatingMargin < 0.15;
  if (operationalGaps) {
    score += 3;
    details.push('Revenue growth with subpar margins suggests operational improvement opportunity');
  }
  
  // Margin improvement potential
  let marginImprovement: number | null = null;
  if (operatingMargin < 0.15 && operatingMargin > 0) {
    marginImprovement = 0.15 - operatingMargin;
    score += 2;
    details.push(`Potential margin expansion: ${(marginImprovement * 100).toFixed(1)}pp to reach 15% target`);
  }
  
  // Management efficiency assessment
  const returnOnAssets = data.return_on_assets;
  let managementEfficiency: 'high' | 'medium' | 'low' = 'low';
  
  if (returnOnAssets !== null) {
    if (returnOnAssets > 0.10) {
      managementEfficiency = 'high';
      details.push(`Efficient asset utilization: ${(returnOnAssets * 100).toFixed(1)}% ROA`);
    } else if (returnOnAssets > 0.05) {
      managementEfficiency = 'medium';
      score += 1;
      details.push(`Moderate asset efficiency: ${(returnOnAssets * 100).toFixed(1)}% ROA`);
    } else {
      score += 2;
      details.push(`Low asset efficiency suggests management improvement opportunity`);
    }
  }
  
  // Value creation opportunity
  const valueCreationOpportunity = operationalGaps && marginImprovement !== null && marginImprovement > 0.05 
    ? 'high' 
    : operationalGaps || (marginImprovement !== null && marginImprovement > 0.02)
    ? 'medium'
    : 'low';
  
  if (valueCreationOpportunity === 'high') {
    score += 2;
    details.push('High potential for activist value creation');
  } else if (valueCreationOpportunity === 'medium') {
    score += 1;
    details.push('Moderate activist opportunity identified');
  }
  
  return {
    operationalGaps,
    marginImprovement,
    managementEfficiency,
    valueCreationOpportunity,
    score: Math.min(10, score),
    details
  };
};

const analyzeValuation = (data: FinancialSnapshot, historicalData: TimeSeriesDataPoint[]): ValuationAnalysis => {
  const details: string[] = [];
  let score = 0;
  
  // DCF assumptions (Ackman's conservative approach)
  const dcfAssumptions = {
    growthRate: 0.06,      // 6% long-term growth
    discountRate: 0.10,    // 10% required return
    terminalMultiple: 15   // Conservative terminal multiple
  };
  
  // Get current price from historical data
  const currentPrice = historicalData.length > 0 ? historicalData[0].close : null;
  
  // Calculate intrinsic value using simplified DCF
  const freeCashFlow = data.free_cash_flow_per_share;
  let intrinsicValue: number | null = null;
  let marginOfSafety: number | null = null;
  
  if (freeCashFlow && freeCashFlow > 0) {
    // 5-year DCF projection
    let presentValue = 0;
    for (let year = 1; year <= 5; year++) {
      const futureFCF = freeCashFlow * Math.pow(1 + dcfAssumptions.growthRate, year);
      const pv = futureFCF / Math.pow(1 + dcfAssumptions.discountRate, year);
      presentValue += pv;
    }
    
    // Terminal value
    const terminalFCF = freeCashFlow * Math.pow(1 + dcfAssumptions.growthRate, 5);
    const terminalValue = (terminalFCF * dcfAssumptions.terminalMultiple) / 
                         Math.pow(1 + dcfAssumptions.discountRate, 5);
    
    intrinsicValue = presentValue + terminalValue;
    
    if (currentPrice) {
      marginOfSafety = (intrinsicValue - currentPrice) / currentPrice;
      
      // Ackman's margin of safety scoring
      if (marginOfSafety > 0.30) {
        score = 5;
        details.push(`Excellent margin of safety: ${(marginOfSafety * 100).toFixed(1)}%`);
      } else if (marginOfSafety > 0.15) {
        score = 3;
        details.push(`Good margin of safety: ${(marginOfSafety * 100).toFixed(1)}%`);
      } else if (marginOfSafety > 0) {
        score = 1;
        details.push(`Small margin of safety: ${(marginOfSafety * 100).toFixed(1)}%`);
      } else {
        details.push(`No margin of safety: ${(marginOfSafety * 100).toFixed(1)}%`);
      }
      
      details.push(`Intrinsic value: $${intrinsicValue.toFixed(2)} vs current price: $${currentPrice.toFixed(2)}`);
    }
  } else {
    details.push('Insufficient free cash flow data for DCF analysis');
  }
  
  // P/E ratio check
  const peRatio = data.price_to_earnings_ratio;
  if (peRatio !== null) {
    if (peRatio < 15) {
      score += 2;
      details.push(`Attractive P/E ratio: ${peRatio.toFixed(1)}`);
    } else if (peRatio < 25) {
      score += 1;
      details.push(`Reasonable P/E ratio: ${peRatio.toFixed(1)}`);
    } else {
      details.push(`High P/E ratio: ${peRatio.toFixed(1)}`);
    }
  }
  
  return {
    intrinsicValue,
    marginOfSafety,
    currentPrice,
    dcfAssumptions,
    score: Math.min(10, score),
    details
  };
};

// Helper functions
const assessCompetitiveAdvantage = (data: FinancialSnapshot): 'strong' | 'moderate' | 'weak' => {
  const roe = data.return_on_equity || 0;
  const operatingMargin = data.operating_margin || 0;
  const grossMargin = data.gross_margin || 0;
  
  if (roe > 0.20 && operatingMargin > 0.15 && grossMargin > 0.40) return 'strong';
  if (roe > 0.15 && operatingMargin > 0.10 && grossMargin > 0.25) return 'moderate';
  return 'weak';
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

const determineAckmanSignal = (score: number): 'bullish' | 'bearish' | 'neutral' => {
  if (score >= 7.5) return 'bullish';   // High conviction threshold
  if (score <= 4.0) return 'bearish';   // Clear avoid
  return 'neutral';
};

const calculateAckmanConfidence = (
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

const generateAckmanReasoning = (
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
    reasoning.push(`  - Margin of Safety: ${(valuation.marginOfSafety * 100).toFixed(1)}%`);
  }
  if (valuation.intrinsicValue && valuation.currentPrice) {
    reasoning.push(`  - Intrinsic Value: $${valuation.intrinsicValue.toFixed(2)} vs Current: $${valuation.currentPrice.toFixed(2)}`);
  }
  
  // Ackman-style conclusion
  const conclusion = signal === 'bullish' 
    ? "This represents a high-quality business trading at an attractive valuation with potential for concentrated investment and value creation through operational improvements."
    : signal === 'bearish'
    ? "This investment does not meet Ackman's rigorous standards for business quality, financial discipline, or valuation criteria."
    : "This requires further analysis or a better entry point before meeting Ackman's concentrated investment criteria.";
  
  reasoning.push(`\n${conclusion}`);
  
  return reasoning.join('\n');
};
