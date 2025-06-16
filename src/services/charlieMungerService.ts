
import { FinancialSnapshot } from './financialDatasetsService';
import { TimeSeriesDataPoint } from '@/services/alphaVantageService';
import { 
  CharlieMungerAnalysis, 
  MoatAnalysis, 
  ManagementQuality, 
  BusinessPredictability, 
  MungerValuation 
} from '@/types/charlieMungerAnalysis';

export const analyzeWithMungerPrinciples = (
  financialData: FinancialSnapshot,
  historicalData: TimeSeriesDataPoint[]
): CharlieMungerAnalysis => {
  console.log('Analyzing with Charlie Munger principles:', financialData.ticker);

  const moatAnalysis = analyzeMoatStrength(financialData);
  const managementQuality = analyzeManagementQuality(financialData);
  const businessPredictability = analyzePredictability(financialData);
  const valuation = calculateMungerValuation(financialData);

  // Munger's weighted scoring: Quality > Predictability > Management > Valuation
  const overallScore = (
    moatAnalysis.score * 0.35 +
    businessPredictability.score * 0.25 +
    managementQuality.score * 0.25 +
    valuation.score * 0.15
  );

  const { signal, confidence } = generateMungerSignal(overallScore, financialData);
  const reasoning = generateMungerReasoning(moatAnalysis, managementQuality, businessPredictability, valuation, signal);
  const keyInsights = extractKeyInsights(financialData, overallScore);
  const mentalModels = getApplicableMentalModels(financialData);

  return {
    ticker: financialData.ticker,
    signal,
    confidence,
    overallScore,
    reasoning,
    moatAnalysis,
    managementQuality,
    businessPredictability,
    valuation,
    keyInsights,
    mentalModels
  };
};

const analyzeMoatStrength = (data: FinancialSnapshot): MoatAnalysis => {
  let score = 0;
  const details: string[] = [];

  // 1. ROIC Consistency (Munger's favorite metric)
  const roic = data.return_on_invested_capital || 0;
  let roicScore = 0;
  if (roic >= 0.15) {
    roicScore = 10;
    details.push(`Excellent ROIC of ${(roic * 100).toFixed(1)}% demonstrates strong competitive advantage`);
  } else if (roic >= 0.10) {
    roicScore = 7;
    details.push(`Good ROIC of ${(roic * 100).toFixed(1)}% shows decent capital efficiency`);
  } else if (roic >= 0.05) {
    roicScore = 4;
    details.push(`Moderate ROIC of ${(roic * 100).toFixed(1)}% suggests limited moat`);
  } else {
    details.push(`Poor ROIC of ${(roic * 100).toFixed(1)}% indicates weak competitive position`);
  }

  // 2. Pricing Power (Gross Margin Analysis)
  const grossMargin = data.gross_margin || 0;
  let pricingScore = 0;
  if (grossMargin >= 0.40) {
    pricingScore = 10;
    details.push(`Strong pricing power with ${(grossMargin * 100).toFixed(1)}% gross margin`);
  } else if (grossMargin >= 0.25) {
    pricingScore = 7;
    details.push(`Good pricing power with ${(grossMargin * 100).toFixed(1)}% gross margin`);
  } else if (grossMargin >= 0.15) {
    pricingScore = 4;
    details.push(`Limited pricing power with ${(grossMargin * 100).toFixed(1)}% gross margin`);
  } else {
    details.push(`Weak pricing power with ${(grossMargin * 100).toFixed(1)}% gross margin`);
  }

  // 3. Capital Intensity (Asset Turnover)
  const assetTurnover = data.asset_turnover || 0;
  let capitalScore = 0;
  if (assetTurnover >= 1.5) {
    capitalScore = 10;
    details.push(`Excellent capital efficiency with ${assetTurnover.toFixed(1)}x asset turnover`);
  } else if (assetTurnover >= 1.0) {
    capitalScore = 7;
    details.push(`Good capital efficiency with ${assetTurnover.toFixed(1)}x asset turnover`);
  } else if (assetTurnover >= 0.5) {
    capitalScore = 4;
    details.push(`Moderate capital requirements with ${assetTurnover.toFixed(1)}x asset turnover`);
  } else {
    details.push(`High capital intensity with ${assetTurnover.toFixed(1)}x asset turnover`);
  }

  // 4. Intangible Assets (Brand value, IP)
  let intangibleScore = 5; // Default neutral score
  if (data.price_to_book_ratio && data.price_to_book_ratio > 3) {
    intangibleScore = 8;
    details.push(`Strong intangible assets suggested by P/B ratio of ${data.price_to_book_ratio.toFixed(1)}x`);
  } else if (data.price_to_book_ratio && data.price_to_book_ratio > 1.5) {
    intangibleScore = 6;
    details.push(`Some intangible value with P/B ratio of ${data.price_to_book_ratio.toFixed(1)}x`);
  }

  score = (roicScore + pricingScore + capitalScore + intangibleScore) / 4;

  return {
    score,
    details: details.join('; '),
    roicConsistency: roicScore,
    pricingPower: pricingScore,
    capitalIntensity: capitalScore,
    intangibleAssets: intangibleScore
  };
};

const analyzeManagementQuality = (data: FinancialSnapshot): ManagementQuality => {
  let score = 0;
  const details: string[] = [];

  // 1. Capital Allocation (ROE vs ROA spread)
  const roe = data.return_on_equity || 0;
  const roa = data.return_on_assets || 0;
  let allocationScore = 0;
  if (roe >= 0.15 && roa >= 0.08) {
    allocationScore = 10;
    details.push(`Excellent capital allocation: ROE ${(roe * 100).toFixed(1)}%, ROA ${(roa * 100).toFixed(1)}%`);
  } else if (roe >= 0.10 && roa >= 0.05) {
    allocationScore = 7;
    details.push(`Good capital allocation: ROE ${(roe * 100).toFixed(1)}%, ROA ${(roa * 100).toFixed(1)}%`);
  } else {
    allocationScore = 4;
    details.push(`Mixed capital allocation: ROE ${(roe * 100).toFixed(1)}%, ROA ${(roa * 100).toFixed(1)}%`);
  }

  // 2. Debt Management
  const debtToEquity = data.debt_to_equity || 0;
  let debtScore = 0;
  if (debtToEquity <= 0.3) {
    debtScore = 10;
    details.push(`Conservative debt management with D/E ratio of ${(debtToEquity * 100).toFixed(1)}%`);
  } else if (debtToEquity <= 0.7) {
    debtScore = 7;
    details.push(`Prudent debt management with D/E ratio of ${(debtToEquity * 100).toFixed(1)}%`);
  } else {
    debtScore = 3;
    details.push(`High leverage with D/E ratio of ${(debtToEquity * 100).toFixed(1)}%`);
  }

  // 3. Cash Management (Current Ratio)
  const currentRatio = data.current_ratio || 0;
  let cashScore = 0;
  if (currentRatio >= 1.5 && currentRatio <= 3.0) {
    cashScore = 10;
    details.push(`Prudent cash management with current ratio of ${currentRatio.toFixed(1)}x`);
  } else if (currentRatio >= 1.0) {
    cashScore = 6;
    details.push(`Adequate liquidity with current ratio of ${currentRatio.toFixed(1)}x`);
  } else {
    cashScore = 2;
    details.push(`Liquidity concerns with current ratio of ${currentRatio.toFixed(1)}x`);
  }

  // 4. Insider Activity (Proxy using payout ratio)
  const payoutRatio = data.payout_ratio || 0;
  let insiderScore = 0;
  if (payoutRatio > 0 && payoutRatio <= 0.6) {
    insiderScore = 8;
    details.push(`Balanced shareholder returns with ${(payoutRatio * 100).toFixed(1)}% payout ratio`);
  } else if (payoutRatio > 0.6) {
    insiderScore = 5;
    details.push(`High dividend payout at ${(payoutRatio * 100).toFixed(1)}%`);
  } else {
    insiderScore = 6;
    details.push('Retaining earnings for growth opportunities');
  }

  // 5. Share Count Stability (approximated)
  let shareScore = 6; // Default neutral since we don't have historical share count
  details.push('Share count stability assessment requires historical data');

  score = (allocationScore + debtScore + cashScore + insiderScore + shareScore) / 5;

  return {
    score,
    details: details.join('; '),
    capitalAllocation: allocationScore,
    debtManagement: debtScore,
    cashManagement: cashScore,
    insiderActivity: insiderScore,
    shareCountStability: shareScore
  };
};

const analyzePredictability = (data: FinancialSnapshot): BusinessPredictability => {
  let score = 0;
  const details: string[] = [];

  // 1. Revenue Stability (using growth rate variability)
  const revenueGrowth = data.revenue_growth || 0;
  let revenueScore = 0;
  if (revenueGrowth >= 0.05 && revenueGrowth <= 0.15) {
    revenueScore = 10;
    details.push(`Predictable revenue growth of ${(revenueGrowth * 100).toFixed(1)}%`);
  } else if (revenueGrowth >= 0) {
    revenueScore = 7;
    details.push(`Positive revenue growth of ${(revenueGrowth * 100).toFixed(1)}%`);
  } else {
    revenueScore = 3;
    details.push(`Declining revenue: ${(revenueGrowth * 100).toFixed(1)}%`);
  }

  // 2. Operating Income Consistency
  const operatingMargin = data.operating_margin || 0;
  let operatingScore = 0;
  if (operatingMargin >= 0.15) {
    operatingScore = 10;
    details.push(`Strong operating predictability with ${(operatingMargin * 100).toFixed(1)}% margin`);
  } else if (operatingMargin >= 0.08) {
    operatingScore = 7;
    details.push(`Good operating consistency with ${(operatingMargin * 100).toFixed(1)}% margin`);
  } else if (operatingMargin > 0) {
    operatingScore = 4;
    details.push(`Modest operating margin of ${(operatingMargin * 100).toFixed(1)}%`);
  } else {
    operatingScore = 1;
    details.push('Operating losses indicate unpredictable business');
  }

  // 3. Margin Consistency (Net Margin)
  const netMargin = data.net_margin || 0;
  let marginScore = 0;
  if (netMargin >= 0.10) {
    marginScore = 10;
    details.push(`Excellent profit predictability with ${(netMargin * 100).toFixed(1)}% net margin`);
  } else if (netMargin >= 0.05) {
    marginScore = 7;
    details.push(`Good profitability with ${(netMargin * 100).toFixed(1)}% net margin`);
  } else if (netMargin > 0) {
    marginScore = 4;
    details.push(`Low but positive margins at ${(netMargin * 100).toFixed(1)}%`);
  } else {
    marginScore = 1;
    details.push('Negative margins indicate unpredictable earnings');
  }

  // 4. Cash Generation Reliability
  const fcfYield = data.free_cash_flow_yield || 0;
  let cashScore = 0;
  if (fcfYield >= 0.08) {
    cashScore = 10;
    details.push(`Strong cash generation with ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  } else if (fcfYield >= 0.04) {
    cashScore = 7;
    details.push(`Good cash generation with ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  } else if (fcfYield > 0) {
    cashScore = 4;
    details.push(`Modest cash generation at ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  } else {
    cashScore = 1;
    details.push('Poor cash generation raises predictability concerns');
  }

  score = (revenueScore + operatingScore + marginScore + cashScore) / 4;

  return {
    score,
    details: details.join('; '),
    revenueStability: revenueScore,
    operatingIncomeConsistency: operatingScore,
    marginConsistency: marginScore,
    cashGenerationReliability: cashScore
  };
};

const calculateMungerValuation = (data: FinancialSnapshot): MungerValuation => {
  let score = 0;
  const details: string[] = [];

  const fcfYield = data.free_cash_flow_yield || 0;
  const fcfPerShare = data.free_cash_flow_per_share || 0;
  
  // Munger's simple valuation approach
  if (fcfYield >= 0.08) {
    score = 10;
    details.push(`Excellent value: ${(fcfYield * 100).toFixed(1)}% FCF yield provides strong margin of safety`);
  } else if (fcfYield >= 0.05) {
    score = 7;
    details.push(`Good value: ${(fcfYield * 100).toFixed(1)}% FCF yield offers reasonable returns`);
  } else if (fcfYield >= 0.03) {
    score = 4;
    details.push(`Fair value: ${(fcfYield * 100).toFixed(1)}% FCF yield is acceptable for quality business`);
  } else {
    score = 1;
    details.push(`Expensive: ${(fcfYield * 100).toFixed(1)}% FCF yield offers poor value`);
  }

  // Calculate intrinsic value using Munger's multiples
  const normalizedFcf = fcfPerShare;
  const intrinsicValueRange = {
    conservative: normalizedFcf * 10, // 10x FCF = 10% yield
    reasonable: normalizedFcf * 15,   // 15x FCF ≈ 6.7% yield
    optimistic: normalizedFcf * 20    // 20x FCF = 5% yield
  };

  // Estimate current price from market metrics
  const estimatedPrice = fcfPerShare / (fcfYield || 0.01);
  const marginOfSafety = ((intrinsicValueRange.reasonable - estimatedPrice) / estimatedPrice) * 100;

  if (marginOfSafety > 30) {
    details.push(`Large margin of safety: ${marginOfSafety.toFixed(0)}% upside to reasonable value`);
  } else if (marginOfSafety > 10) {
    details.push(`Moderate margin of safety: ${marginOfSafety.toFixed(0)}% upside`);
  } else if (marginOfSafety > -10) {
    details.push(`Fair pricing: Within 10% of reasonable value`);
  } else {
    details.push(`Premium valuation: ${Math.abs(marginOfSafety).toFixed(0)}% above reasonable value`);
  }

  return {
    score,
    details: details.join('; '),
    fcfYield,
    normalizedFcf,
    intrinsicValueRange,
    marginOfSafety
  };
};

const generateMungerSignal = (overallScore: number, data: FinancialSnapshot) => {
  let signal: "bullish" | "bearish" | "neutral";
  let confidence: number;

  if (overallScore >= 7.5) {
    signal = "bullish";
    confidence = Math.min(95, 60 + (overallScore - 7.5) * 14);
  } else if (overallScore <= 4.5) {
    signal = "bearish";
    confidence = Math.min(95, 60 + (4.5 - overallScore) * 14);
  } else {
    signal = "neutral";
    confidence = 50 + Math.abs(overallScore - 6) * 5;
  }

  return { signal, confidence };
};

const generateMungerReasoning = (
  moat: MoatAnalysis,
  management: ManagementQuality,
  predictability: BusinessPredictability,
  valuation: MungerValuation,
  signal: string
): string => {
  const reasoning = [
    `Moat Analysis (${moat.score.toFixed(1)}/10): ${moat.details}`,
    `Management Quality (${management.score.toFixed(1)}/10): ${management.details}`,
    `Business Predictability (${predictability.score.toFixed(1)}/10): ${predictability.details}`,
    `Valuation Assessment (${valuation.score.toFixed(1)}/10): ${valuation.details}`
  ];

  const conclusion = signal === "bullish" 
    ? "This business meets Munger's criteria for a quality investment with predictable economics and reasonable valuation."
    : signal === "bearish"
    ? "This investment fails to meet Munger's standards for business quality, predictability, or valuation."
    : "While this business has some attractive qualities, it falls short of Munger's high standards in key areas.";

  return reasoning.join(' ') + ' ' + conclusion;
};

const extractKeyInsights = (data: FinancialSnapshot, score: number): string[] => {
  const insights: string[] = [];

  if (data.return_on_invested_capital && data.return_on_invested_capital >= 0.15) {
    insights.push(`Exceptional ROIC of ${(data.return_on_invested_capital * 100).toFixed(1)}% indicates strong competitive moat`);
  }

  if (data.debt_to_equity && data.debt_to_equity <= 0.3) {
    insights.push("Conservative balance sheet with minimal debt provides financial fortress");
  }

  if (data.free_cash_flow_yield && data.free_cash_flow_yield >= 0.08) {
    insights.push("High free cash flow yield offers excellent owner earnings");
  }

  if (score >= 8) {
    insights.push("Meets Munger's criteria for a 'wonderful business at a fair price'");
  } else if (score <= 4) {
    insights.push("Significant business quality or valuation concerns present");
  }

  return insights.length > 0 ? insights : ["Requires deeper analysis to identify compelling investment characteristics"];
};

const getApplicableMentalModels = (data: FinancialSnapshot): string[] => {
  const models: string[] = [];

  models.push("Circle of Competence: Assess whether this business operates within your understanding");
  models.push("Inversion: What could go wrong with this investment?");
  
  if (data.return_on_invested_capital && data.return_on_invested_capital >= 0.15) {
    models.push("Competitive Advantage: High ROIC suggests strong economic moat");
  }

  if (data.gross_margin && data.gross_margin >= 0.40) {
    models.push("Pricing Power: High margins indicate ability to charge premium prices");
  }

  models.push("Opportunity Cost: Compare returns to other high-quality alternatives");
  models.push("Margin of Safety: Only invest with significant downside protection");

  return models;
};
