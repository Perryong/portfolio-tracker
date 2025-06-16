import { FinancialSnapshot } from './financialDatasetsService';
import { TimeSeriesDataPoint } from '@/services/alphaVantageService';
import { 
  PeterLynchAnalysis, 
  GARPAnalysis, 
  GrowthAnalysis, 
  BusinessQuality, 
  TenBaggerPotential 
} from '@/types/peterLynchAnalysis';

export const analyzeWithLynchPrinciples = (
  financialData: FinancialSnapshot,
  historicalData: TimeSeriesDataPoint[]
): PeterLynchAnalysis => {
  console.log('Analyzing with Peter Lynch principles:', financialData.ticker);
  
  const garpAnalysis = analyzeGARP(financialData);
  const growthAnalysis = analyzeGrowth(financialData);
  const businessQuality = analyzeBusinessQuality(financialData);
  const tenBaggerPotential = analyzeTenBaggerPotential(financialData, growthAnalysis);
  
  // Calculate overall score (weighted)
  const overallScore = (
    garpAnalysis.score * 0.35 +        // GARP is core to Lynch's strategy
    growthAnalysis.score * 0.30 +      // Growth is essential
    businessQuality.score * 0.25 +     // Quality matters for sustainability
    tenBaggerPotential.score * 0.10    // Upside potential
  );
  
  const signal = determineSignal(overallScore);
  const confidence = calculateConfidence(overallScore, garpAnalysis, growthAnalysis);
  const reasoning = generateLynchReasoning(
    financialData.ticker,
    signal,
    garpAnalysis,
    growthAnalysis,
    businessQuality,
    tenBaggerPotential
  );
  
  return {
    ticker: financialData.ticker,
    signal,
    confidence,
    garpAnalysis,
    growthAnalysis,
    businessQuality,
    tenBaggerPotential,
    reasoning
  };
};

const analyzeGARP = (data: FinancialSnapshot): GARPAnalysis => {
  const details: string[] = [];
  let score = 0;
  
  // Calculate P/E ratio
  const peRatio = data.price_to_earnings_ratio;
  
  // Estimate growth rate from available data
  const earningsGrowth = data.earnings_growth;
  const revenueGrowth = data.revenue_growth;
  const avgGrowthRate = earningsGrowth && revenueGrowth 
    ? (earningsGrowth + revenueGrowth) / 2 
    : earningsGrowth || revenueGrowth;
  
  // Calculate PEG ratio
  const pegRatio = peRatio && avgGrowthRate && avgGrowthRate > 0 
    ? peRatio / (avgGrowthRate * 100) 
    : null;
  
  // Lynch's GARP scoring
  if (pegRatio !== null) {
    if (pegRatio < 0.5) {
      score = 10;
      details.push(`Excellent PEG ratio: ${pegRatio.toFixed(2)} (potential bargain)`);
    } else if (pegRatio < 1.0) {
      score = 8;
      details.push(`Good PEG ratio: ${pegRatio.toFixed(2)} (growth at reasonable price)`);
    } else if (pegRatio < 1.5) {
      score = 6;
      details.push(`Fair PEG ratio: ${pegRatio.toFixed(2)} (borderline attractive)`);
    } else if (pegRatio < 2.0) {
      score = 4;
      details.push(`High PEG ratio: ${pegRatio.toFixed(2)} (expensive relative to growth)`);
    } else {
      score = 2;
      details.push(`Very high PEG ratio: ${pegRatio.toFixed(2)} (overvalued)`);
    }
  } else {
    score = 3;
    details.push('Cannot calculate PEG ratio due to insufficient data');
  }
  
  // P/E context
  if (peRatio) {
    if (peRatio < 15) {
      details.push(`Low P/E ratio: ${peRatio.toFixed(1)} (value opportunity)`);
    } else if (peRatio < 25) {
      details.push(`Moderate P/E ratio: ${peRatio.toFixed(1)} (reasonable valuation)`);
    } else {
      details.push(`High P/E ratio: ${peRatio.toFixed(1)} (premium valuation)`);
    }
  }
  
  const interpretation = pegRatio !== null 
    ? getLynchPEGInterpretation(pegRatio)
    : 'Insufficient data for GARP analysis';
  
  return {
    pegRatio,
    peRatio,
    growthRate: avgGrowthRate,
    score,
    interpretation,
    details
  };
};

const analyzeGrowth = (data: FinancialSnapshot): GrowthAnalysis => {
  const details: string[] = [];
  let score = 0;
  
  const revenueGrowth = data.revenue_growth;
  const earningsGrowth = data.earnings_growth;
  
  // Revenue growth scoring
  if (revenueGrowth !== null) {
    if (revenueGrowth > 0.20) {
      score += 3;
      details.push(`Strong revenue growth: ${(revenueGrowth * 100).toFixed(1)}%`);
    } else if (revenueGrowth > 0.10) {
      score += 2;
      details.push(`Good revenue growth: ${(revenueGrowth * 100).toFixed(1)}%`);
    } else if (revenueGrowth > 0.05) {
      score += 1;
      details.push(`Moderate revenue growth: ${(revenueGrowth * 100).toFixed(1)}%`);
    } else {
      details.push(`Slow revenue growth: ${(revenueGrowth * 100).toFixed(1)}%`);
    }
  }
  
  // Earnings growth scoring
  if (earningsGrowth !== null) {
    if (earningsGrowth > 0.25) {
      score += 4;
      details.push(`Excellent earnings growth: ${(earningsGrowth * 100).toFixed(1)}%`);
    } else if (earningsGrowth > 0.15) {
      score += 3;
      details.push(`Strong earnings growth: ${(earningsGrowth * 100).toFixed(1)}%`);
    } else if (earningsGrowth > 0.10) {
      score += 2;
      details.push(`Good earnings growth: ${(earningsGrowth * 100).toFixed(1)}%`);
    } else if (earningsGrowth > 0.05) {
      score += 1;
      details.push(`Moderate earnings growth: ${(earningsGrowth * 100).toFixed(1)}%`);
    } else {
      details.push(`Weak earnings growth: ${(earningsGrowth * 100).toFixed(1)}%`);
    }
  }
  
  // Consistency check (simplified)
  const consistentGrowth = (revenueGrowth || 0) > 0.05 && (earningsGrowth || 0) > 0.05;
  if (consistentGrowth) {
    score += 1;
    details.push('Growth appears consistent across metrics');
  }
  
  // Growth trend assessment
  const growthTrend = determineGrowthTrend(revenueGrowth, earningsGrowth);
  
  return {
    revenueGrowth,
    earningsGrowth,
    consistentGrowth,
    growthTrend,
    score: Math.min(10, score),
    details
  };
};

const analyzeBusinessQuality = (data: FinancialSnapshot): BusinessQuality => {
  const details: string[] = [];
  let score = 0;
  
  const profitMargins = {
    gross: data.gross_margin,
    operating: data.operating_margin,
    net: data.net_margin
  };
  
  // Margin analysis
  if (profitMargins.gross !== null) {
    if (profitMargins.gross > 0.40) {
      score += 2;
      details.push(`Excellent gross margin: ${(profitMargins.gross * 100).toFixed(1)}%`);
    } else if (profitMargins.gross > 0.25) {
      score += 1;
      details.push(`Good gross margin: ${(profitMargins.gross * 100).toFixed(1)}%`);
    } else {
      details.push(`Low gross margin: ${(profitMargins.gross * 100).toFixed(1)}%`);
    }
  }
  
  if (profitMargins.operating !== null) {
    if (profitMargins.operating > 0.20) {
      score += 2;
      details.push(`Strong operating margin: ${(profitMargins.operating * 100).toFixed(1)}%`);
    } else if (profitMargins.operating > 0.10) {
      score += 1;
      details.push(`Decent operating margin: ${(profitMargins.operating * 100).toFixed(1)}%`);
    } else {
      details.push(`Weak operating margin: ${(profitMargins.operating * 100).toFixed(1)}%`);
    }
  }
  
  // Debt analysis
  const debtToEquity = data.debt_to_equity;
  if (debtToEquity !== null) {
    if (debtToEquity < 0.3) {
      score += 3;
      details.push(`Low debt-to-equity: ${debtToEquity.toFixed(2)} (financially strong)`);
    } else if (debtToEquity < 0.6) {
      score += 2;
      details.push(`Moderate debt-to-equity: ${debtToEquity.toFixed(2)} (manageable debt)`);
    } else if (debtToEquity < 1.0) {
      score += 1;
      details.push(`High debt-to-equity: ${debtToEquity.toFixed(2)} (debt concerns)`);
    } else {
      details.push(`Very high debt-to-equity: ${debtToEquity.toFixed(2)} (risky debt levels)`);
    }
  }
  
  // ROE analysis
  const returnOnEquity = data.return_on_equity;
  if (returnOnEquity !== null) {
    if (returnOnEquity > 0.20) {
      score += 2;
      details.push(`Excellent ROE: ${(returnOnEquity * 100).toFixed(1)}%`);
    } else if (returnOnEquity > 0.15) {
      score += 1;
      details.push(`Good ROE: ${(returnOnEquity * 100).toFixed(1)}%`);
    } else {
      details.push(`Low ROE: ${(returnOnEquity * 100).toFixed(1)}%`);
    }
  }
  
  // Business model assessment (simplified)
  const businessModel = assessBusinessModel(data);
  const competitivePosition = assessCompetitivePosition(data);
  
  return {
    profitMargins,
    debtToEquity,
    returnOnEquity,
    businessModel,
    competitivePosition,
    score: Math.min(10, score),
    details
  };
};

const analyzeTenBaggerPotential = (
  data: FinancialSnapshot,
  growthAnalysis: GrowthAnalysis
): TenBaggerPotential => {
  const details: string[] = [];
  let score = 0;
  
  // Market opportunity assessment
  const marketCap = data.market_cap;
  let marketOpportunity: 'large' | 'medium' | 'small' = 'medium';
  
  if (marketCap < 2e9) { // Less than $2B
    marketOpportunity = 'large';
    score += 3;
    details.push('Small-cap with significant growth potential');
  } else if (marketCap < 10e9) { // Less than $10B
    marketOpportunity = 'medium';
    score += 2;
    details.push('Mid-cap with moderate growth potential');
  } else {
    marketOpportunity = 'small';
    score += 1;
    details.push('Large-cap with limited growth potential');
  }
  
  // Growth runway estimation
  const growthRate = Math.max(growthAnalysis.revenueGrowth || 0, growthAnalysis.earningsGrowth || 0);
  const growthRunway = estimateGrowthRunway(growthRate);
  
  if (growthRunway > 7) {
    score += 2;
    details.push(`Long growth runway: ${growthRunway} years`);
  } else if (growthRunway > 4) {
    score += 1;
    details.push(`Moderate growth runway: ${growthRunway} years`);
  }
  
  // Competitive advantages (simplified assessment)
  const competitiveAdvantages = identifyCompetitiveAdvantages(data);
  const riskFactors = identifyRiskFactors(data);
  
  const probability = Math.min(score * 10, 80); // Max 80% probability
  const timeHorizon = growthRunway > 5 ? '5-10 years' : '3-5 years';
  
  return {
    marketOpportunity,
    growthRunway,
    competitiveAdvantages,
    riskFactors,
    probability,
    timeHorizon,
    score: Math.min(10, score),
    details
  };
};

// Helper functions
const getLynchPEGInterpretation = (pegRatio: number): string => {
  if (pegRatio < 0.5) return "Exceptional value - potential 'fast grower' at bargain price";
  if (pegRatio < 1.0) return "Good value - growth at reasonable price (Lynch's sweet spot)";
  if (pegRatio < 1.5) return "Fair value - growth premium justified";
  if (pegRatio < 2.0) return "Expensive - growth not adequately reflected in price";
  return "Overvalued - avoid unless extraordinary circumstances";
};

const determineGrowthTrend = (
  revenueGrowth: number | null, 
  earningsGrowth: number | null
): 'accelerating' | 'steady' | 'decelerating' | 'volatile' => {
  // Simplified trend analysis
  if (!revenueGrowth && !earningsGrowth) return 'volatile';
  
  const avgGrowth = ((revenueGrowth || 0) + (earningsGrowth || 0)) / 2;
  if (avgGrowth > 0.15) return 'accelerating';
  if (avgGrowth > 0.08) return 'steady';
  return 'decelerating';
};

const assessBusinessModel = (data: FinancialSnapshot): 'simple' | 'complex' | 'cyclical' => {
  // Simplified assessment based on margins and volatility
  const operatingMargin = data.operating_margin || 0;
  
  if (operatingMargin > 0.15) return 'simple'; // High margins suggest pricing power
  if (operatingMargin < 0.05) return 'cyclical'; // Low margins suggest commodity business
  return 'complex';
};

const assessCompetitivePosition = (data: FinancialSnapshot): 'strong' | 'moderate' | 'weak' => {
  const roe = data.return_on_equity || 0;
  const operatingMargin = data.operating_margin || 0;
  
  if (roe > 0.20 && operatingMargin > 0.15) return 'strong';
  if (roe > 0.10 && operatingMargin > 0.08) return 'moderate';
  return 'weak';
};

const estimateGrowthRunway = (growthRate: number): number => {
  if (growthRate > 0.25) return 8;
  if (growthRate > 0.15) return 6;
  if (growthRate > 0.10) return 4;
  return 2;
};

const identifyCompetitiveAdvantages = (data: FinancialSnapshot): string[] => {
  const advantages: string[] = [];
  
  if ((data.gross_margin || 0) > 0.40) advantages.push('High gross margins');
  if ((data.return_on_equity || 0) > 0.20) advantages.push('Strong ROE');
  if ((data.debt_to_equity || 1) < 0.3) advantages.push('Strong balance sheet');
  if ((data.free_cash_flow_yield || 0) > 0.05) advantages.push('Strong cash generation');
  
  return advantages;
};

const identifyRiskFactors = (data: FinancialSnapshot): string[] => {
  const risks: string[] = [];
  
  if ((data.debt_to_equity || 0) > 0.6) risks.push('High debt levels');
  if ((data.operating_margin || 0) < 0.05) risks.push('Low operating margins');
  if (data.peg_ratio && data.peg_ratio > 2) risks.push('High valuation risk');
  
  return risks;
};

const determineSignal = (score: number): 'bullish' | 'bearish' | 'neutral' => {
  if (score >= 7.5) return 'bullish';
  if (score <= 4.5) return 'bearish';
  return 'neutral';
};

const calculateConfidence = (
  overallScore: number,
  garpAnalysis: GARPAnalysis,
  growthAnalysis: GrowthAnalysis
): number => {
  let confidence = overallScore * 10; // Base confidence from score
  
  // Adjust based on data quality
  if (garpAnalysis.pegRatio !== null) confidence += 5;
  if (growthAnalysis.consistentGrowth) confidence += 5;
  
  return Math.round(Math.min(95, Math.max(5, confidence)));
};

const generateLynchReasoning = (
  ticker: string,
  signal: string,
  garp: GARPAnalysis,
  growth: GrowthAnalysis,
  quality: BusinessQuality,
  tenBagger: TenBaggerPotential
): string => {
  const reasoning: string[] = [];
  
  reasoning.push(`Peter Lynch Analysis for ${ticker}:`);
  
  // GARP assessment
  if (garp.pegRatio !== null) {
    reasoning.push(`\n• PEG Ratio: ${garp.pegRatio.toFixed(2)} - ${garp.interpretation}`);
  }
  
  // Growth commentary
  if (growth.earningsGrowth) {
    reasoning.push(`• Earnings Growth: ${(growth.earningsGrowth * 100).toFixed(1)}% - ${
      growth.earningsGrowth > 0.15 ? "Strong growth story" : 
      growth.earningsGrowth > 0.08 ? "Moderate growth" : "Slow growth"
    }`);
  }
  
  // Business quality
  reasoning.push(`• Business Quality: ${quality.competitivePosition} competitive position`);
  
  // Ten-bagger potential
  reasoning.push(`• Ten-Bagger Potential: ${tenBagger.probability}% probability over ${tenBagger.timeHorizon}`);
  
  // Lynch-style conclusion
  const conclusion = signal === 'bullish' 
    ? "This stock fits Lynch's 'growth at a reasonable price' criteria and could be a potential winner."
    : signal === 'bearish'
    ? "This stock doesn't meet Lynch's standards - either too expensive or growth prospects are weak."
    : "This stock is borderline - needs more research or better entry point.";
  
  reasoning.push(`\n${conclusion}`);
  
  return reasoning.join('\n');
};
