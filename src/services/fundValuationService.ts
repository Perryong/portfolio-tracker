
import { FundMetrics } from '@/types';
import { fetchHistoricalStockData } from './alphaVantageService';
import { fetchSeekingAlphaFundData, transformSeekingAlphaToFundMetrics } from './seekingAlphaFundService';

export interface FundValuationResults {
  symbol: string;
  name: string;
  currentPrice: number;
  nav: number;
  metrics: FundMetrics;
  valuation: {
    recommendation: 'BUY' | 'HOLD' | 'SELL';
    confidence: number;
    reasoning: string[];
  };
  comparison: {
    vsIndex: number;
    vsCategory: number;
    expenseImpact: number;
  };
}

export const analyzeFundValuation = async (symbol: string): Promise<FundValuationResults> => {
  console.log(`Analyzing fund valuation for: ${symbol}`);
  
  // Fetch current price data
  const historicalData = await fetchHistoricalStockData(symbol);
  const currentPrice = historicalData[0]?.close || 0;
  
  if (!currentPrice) {
    throw new Error(`Unable to fetch price data for ${symbol}. Please try again later.`);
  }
  
  let fundName = `${symbol} Fund`;
  let nav = currentPrice;
  let metrics: FundMetrics;
  
  try {
    // Try to fetch from Seeking Alpha API for fund data
    console.log(`Fetching dynamic fund data for: ${symbol}`);
    const seekingAlphaData = await fetchSeekingAlphaFundData(symbol);
    
    if (seekingAlphaData) {
      fundName = seekingAlphaData.name;
      nav = seekingAlphaData.nav || currentPrice;
      metrics = transformSeekingAlphaToFundMetrics(seekingAlphaData, currentPrice);
    } else {
      throw new Error('Fund data not available from API');
    }
  } catch (error) {
    console.error(`Error fetching fund data for ${symbol}:`, error);
    throw new Error(`Unable to fetch detailed fund information for ${symbol}. This may be because the symbol is not supported or the data provider is temporarily unavailable.`);
  }
  
  // Calculate valuation assessment
  const valuation = assessFundValuation(metrics, metrics.navPremiumDiscount);
  
  // Calculate comparisons
  const comparison = {
    vsIndex: metrics.performanceVsBenchmark.fiveYear * 100,
    vsCategory: 0, // Would need category data from API
    expenseImpact: calculateExpenseImpact(metrics.expenseRatio)
  };
  
  return {
    symbol,
    name: fundName,
    currentPrice,
    nav,
    metrics,
    valuation,
    comparison
  };
};

const assessFundValuation = (metrics: FundMetrics, navPremiumDiscount: number) => {
  const reasoning: string[] = [];
  let score = 0;
  
  // NAV premium/discount assessment
  if (Math.abs(navPremiumDiscount) < 0.1) {
    reasoning.push('Trading near NAV with minimal premium/discount');
    score += 0.5;
  } else if (navPremiumDiscount > 0.5) {
    reasoning.push(`Trading at ${navPremiumDiscount.toFixed(2)}% premium to NAV`);
    score -= 1;
  } else if (navPremiumDiscount < -0.5) {
    reasoning.push(`Trading at ${Math.abs(navPremiumDiscount).toFixed(2)}% discount to NAV`);
    score += 1;
  }
  
  // Expense ratio assessment
  if (metrics.expenseRatio < 0.2) {
    reasoning.push(`Low expense ratio of ${metrics.expenseRatio}% is cost-effective`);
    score += 0.5;
  } else if (metrics.expenseRatio > 1.0) {
    reasoning.push(`High expense ratio of ${metrics.expenseRatio}% may impact returns`);
    score -= 0.5;
  }
  
  // Performance assessment
  if (metrics.performanceVsBenchmark.fiveYear > 0.05) {
    reasoning.push('Strong long-term outperformance vs benchmark');
    score += 1;
  } else if (metrics.performanceVsBenchmark.fiveYear < -0.05) {
    reasoning.push('Underperformance vs benchmark over 5 years');
    score -= 1;
  }
  
  // Risk-adjusted returns
  if (metrics.riskMetrics.sharpeRatio > 0.8) {
    reasoning.push(`Excellent risk-adjusted returns (Sharpe: ${metrics.riskMetrics.sharpeRatio})`);
    score += 0.5;
  } else if (metrics.riskMetrics.sharpeRatio < 0.4) {
    reasoning.push(`Poor risk-adjusted returns (Sharpe: ${metrics.riskMetrics.sharpeRatio})`);
    score -= 0.5;
  }
  
  // Determine recommendation
  let recommendation: 'BUY' | 'HOLD' | 'SELL';
  let confidence: number;
  
  if (score > 1) {
    recommendation = 'BUY';
    confidence = Math.min(85, 65 + Math.abs(score) * 8);
  } else if (score < -1) {
    recommendation = 'SELL';
    confidence = Math.min(85, 65 + Math.abs(score) * 8);
  } else {
    recommendation = 'HOLD';
    confidence = 70;
  }
  
  return {
    recommendation,
    confidence,
    reasoning
  };
};

const calculateExpenseImpact = (expenseRatio: number): number => {
  // Calculate the impact of expenses on a $10,000 investment over 10 years
  const investment = 10000;
  const years = 10;
  const assumedReturn = 0.07; // 7% annual return
  
  const withoutExpenses = investment * Math.pow(1 + assumedReturn, years);
  const withExpenses = investment * Math.pow(1 + assumedReturn - expenseRatio/100, years);
  
  return withoutExpenses - withExpenses;
};
