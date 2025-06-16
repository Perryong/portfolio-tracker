import { FinancialSnapshot } from './financialDatasetsService';

export interface BuffettMetrics {
  roic: number; // Return on Invested Capital
  reinvestmentRate: number; // Reinvestment Rate
  roiic: number; // Return on Incremental Invested Capital
  isCompoundingMachine: boolean;
  compoundingScore: number;
  investmentThesis: string;
  strengths: string[];
  concerns: string[];
}

export const calculateBuffettMetrics = (financialData: FinancialSnapshot): BuffettMetrics => {
  console.log('Calculating Buffett metrics for:', financialData);

  // Calculate ROIC (Return on Invested Capital)
  // ROIC = (Net Income - Dividends) / (Total Debt + Shareholders Equity)
  // We'll use Return on Invested Capital from the data if available, otherwise calculate
  const roic = financialData.return_on_invested_capital || 0;

  // Calculate Reinvestment Rate
  // Approximation: (Revenue Growth Rate * Asset Turnover) or use available growth metrics
  const reinvestmentRate = Math.max(
    financialData.revenue_growth || 0,
    (financialData.earnings_growth || 0) * 0.7 // Conservative estimate
  );

  // Calculate ROIIC (Return on Incremental Invested Capital)
  // Approximation using available growth and efficiency metrics
  const roiic = calculateROIIC(financialData);

  // Determine if it's a "Compounding Machine"
  const roicThreshold = 0.15; // 15%
  const reinvestmentThreshold = 0.20; // 20%
  const roiicThreshold = 0.15; // 15%

  const meetsROIC = roic >= roicThreshold;
  const meetsReinvestment = reinvestmentRate >= reinvestmentThreshold;
  const meetsROIIC = roiic >= roiicThreshold;

  const isCompoundingMachine = meetsROIC && meetsReinvestment && meetsROIIC;

  // Calculate compounding score (0-100)
  const compoundingScore = calculateCompoundingScore(roic, reinvestmentRate, roiic);

  // Generate investment thesis
  const { thesis, strengths, concerns } = generateInvestmentThesis(
    financialData,
    roic,
    reinvestmentRate,
    roiic,
    isCompoundingMachine
  );

  return {
    roic,
    reinvestmentRate,
    roiic,
    isCompoundingMachine,
    compoundingScore,
    investmentThesis: thesis,
    strengths,
    concerns
  };
};

const calculateROIIC = (data: FinancialSnapshot): number => {
  // ROIIC approximation using available metrics
  // Use the efficiency of new investments based on growth rates and margins
  const operatingMargin = data.operating_margin || 0;
  const revenueGrowth = data.revenue_growth || 0;
  const assetTurnover = data.asset_turnover || 1;

  // Estimate ROIIC as (Operating Margin * Asset Turnover) adjusted for growth
  const roiic = operatingMargin * assetTurnover * (1 + revenueGrowth);
  
  return Math.max(0, Math.min(1, roiic)); // Cap between 0-100%
};

const calculateCompoundingScore = (roic: number, reinvestmentRate: number, roiic: number): number => {
  // Weighted scoring: ROIC (40%), Reinvestment Rate (30%), ROIIC (30%)
  const roicScore = Math.min(100, (roic / 0.15) * 40);
  const reinvestmentScore = Math.min(100, (reinvestmentRate / 0.20) * 30);
  const roiicScore = Math.min(100, (roiic / 0.15) * 30);

  // Cap the final total at 100
  return Math.round(Math.min(100, roicScore + reinvestmentScore + roiicScore));
};

const generateInvestmentThesis = (
  data: FinancialSnapshot,
  roic: number,
  reinvestmentRate: number,
  roiic: number,
  isCompoundingMachine: boolean
): { thesis: string; strengths: string[]; concerns: string[] } => {
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Analyze strengths
  if (roic >= 0.15) {
    strengths.push(`Excellent capital efficiency with ${(roic * 100).toFixed(1)}% ROIC`);
  }
  if (reinvestmentRate >= 0.20) {
    strengths.push(`Strong growth potential with ${(reinvestmentRate * 100).toFixed(1)}% reinvestment rate`);
  }
  if (roiic >= 0.15) {
    strengths.push(`Profitable growth with ${(roiic * 100).toFixed(1)}% returns on new investments`);
  }
  if (data.operating_margin >= 0.20) {
    strengths.push(`High profitability with ${(data.operating_margin * 100).toFixed(1)}% operating margin`);
  }
  if (data.debt_to_equity < 0.5) {
    strengths.push(`Conservative debt management with ${(data.debt_to_equity * 100).toFixed(1)}% debt-to-equity`);
  }

  // Analyze concerns
  if (roic < 0.10) {
    concerns.push(`Low capital efficiency with ${(roic * 100).toFixed(1)}% ROIC below 10%`);
  }
  if (reinvestmentRate < 0.10) {
    concerns.push(`Limited growth reinvestment at ${(reinvestmentRate * 100).toFixed(1)}%`);
  }
  if (data.debt_to_equity > 1.0) {
    concerns.push(`High leverage with ${(data.debt_to_equity * 100).toFixed(1)}% debt-to-equity`);
  }
  if (data.operating_margin < 0.10) {
    concerns.push(`Low profitability with ${(data.operating_margin * 100).toFixed(1)}% operating margin`);
  }

  // Generate thesis
  let thesis: string;
  
  if (isCompoundingMachine) {
    thesis = `${data.ticker} qualifies as a "Compounding Machine" under Warren Buffett's criteria. ` +
             `The company demonstrates exceptional capital allocation with strong returns on invested capital ` +
             `and profitable reinvestment opportunities. This combination should drive sustainable long-term wealth creation.`;
  } else if (roic >= 0.12 && reinvestmentRate >= 0.15) {
    thesis = `${data.ticker} shows promising characteristics but falls short of Buffett's strict criteria. ` +
             `The company has decent capital efficiency and growth prospects, making it a potential watch-list candidate ` +
             `if metrics improve or valuation becomes more attractive.`;
  } else {
    thesis = `${data.ticker} does not currently meet Warren Buffett's investment criteria. ` +
             `The company may face challenges in capital allocation or growth efficiency. ` +
             `Consider waiting for improved fundamentals or a significant margin of safety before investing.`;
  }

  return { thesis, strengths, concerns };
};
