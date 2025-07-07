import { FinancialSnapshot } from './financialDatasetsService';
import { TimeSeriesDataPoint } from './alphaVantageService';

export interface DCFAssumptions {
  projectionYears: number;
  terminalGrowthRate: number;
  riskFreeRate: number;
  marketRiskPremium: number;
  beta: number;
  costOfDebt: number;
  taxRate: number;
  revenueGrowthRates: number[];
  fcfMarginTarget: number;
}

export interface DCFResults {
  ticker: string;
  currentPrice: number;
  intrinsicValue: number;
  academicIntrinsicValue?: number; // For comparison with academic DCF method
  upside: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
  projectedCashFlows: number[];
  presentValueCashFlows: number[];
  terminalValue: number;
  presentValueTerminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  wacc: number;
  assumptions: DCFAssumptions;
  scenarioAnalysis: {
    bull: number;
    base: number;
    bear: number;
  };
  sensitivityMatrix: {
    waccRange: number[];
    growthRange: number[];
    values: number[][];
  };
}

export const DEFAULT_DCF_ASSUMPTIONS: DCFAssumptions = {
  projectionYears: 5,
  terminalGrowthRate: 0.025, // 2.5%
  riskFreeRate: 0.045, // 4.5%
  marketRiskPremium: 0.06, // 6%
  beta: 1.0,
  costOfDebt: 0.05, // 5%
  taxRate: 0.21, // 21%
  revenueGrowthRates: [0.08, 0.07, 0.06, 0.05, 0.04], // Declining growth
  fcfMarginTarget: 0.15 // 15% FCF margin
};

export const calculateWACC = (
  assumptions: DCFAssumptions,
  debtToEquity: number
): number => {
  const { riskFreeRate, marketRiskPremium, beta, costOfDebt, taxRate } = assumptions;
  
  // Calculate cost of equity using CAPM
  const costOfEquity = riskFreeRate + (beta * marketRiskPremium);
  
  // Calculate weights
  const debtWeight = debtToEquity / (1 + debtToEquity);
  const equityWeight = 1 / (1 + debtToEquity);
  
  // Calculate WACC
  const wacc = (equityWeight * costOfEquity) + (debtWeight * costOfDebt * (1 - taxRate));
  
  return wacc;
};

export const performDCFAnalysis = (
  financialData: FinancialSnapshot,
  historicalData: TimeSeriesDataPoint[],
  customAssumptions?: Partial<DCFAssumptions>
): DCFResults => {
  const assumptions = { ...DEFAULT_DCF_ASSUMPTIONS, ...customAssumptions };
  const currentPrice = historicalData[0]?.close || 0;
  
  // Calculate base metrics
  const currentRevenue = financialData.market_cap / (financialData.price_to_sales_ratio || 1);
  const currentFCF = financialData.free_cash_flow_per_share * 
    (financialData.market_cap / (currentPrice || 1));
  
  // Calculate WACC
  const wacc = calculateWACC(assumptions, financialData.debt_to_equity);
  
  // Project cash flows
  const projectedCashFlows: number[] = [];
  const presentValueCashFlows: number[] = [];
  
  for (let year = 1; year <= assumptions.projectionYears; year++) {
    const growthRate = assumptions.revenueGrowthRates[year - 1] || assumptions.revenueGrowthRates[assumptions.revenueGrowthRates.length - 1];
    const projectedRevenue = currentRevenue * Math.pow(1 + growthRate, year);
    const projectedFCF = projectedRevenue * assumptions.fcfMarginTarget;
    
    projectedCashFlows.push(projectedFCF);
    
    const presentValue = projectedFCF / Math.pow(1 + wacc, year);
    presentValueCashFlows.push(presentValue);
  }
  
  // Calculate terminal value
  const finalYearFCF = projectedCashFlows[projectedCashFlows.length - 1];
  const terminalCashFlow = finalYearFCF * (1 + assumptions.terminalGrowthRate);
  const terminalValue = terminalCashFlow / (wacc - assumptions.terminalGrowthRate);
  const presentValueTerminalValue = terminalValue / Math.pow(1 + wacc, assumptions.projectionYears);
  
  // Calculate enterprise and equity value
  const enterpriseValue = presentValueCashFlows.reduce((sum, pv) => sum + pv, 0) + presentValueTerminalValue;
  const netDebt = financialData.market_cap * (financialData.debt_to_equity / (1 + financialData.debt_to_equity));
  const equityValue = enterpriseValue - netDebt;
  
  // Calculate per-share value
  const sharesOutstanding = financialData.market_cap / currentPrice;
  const intrinsicValue = equityValue / sharesOutstanding;
  
  // Calculate upside and recommendation
  const upside = ((intrinsicValue - currentPrice) / currentPrice) * 100;
  let recommendation: 'BUY' | 'HOLD' | 'SELL';
  let confidence: number;
  
  if (upside > 20) {
    recommendation = 'BUY';
    confidence = Math.min(90, 60 + Math.abs(upside) / 2);
  } else if (upside > -10) {
    recommendation = 'HOLD';
    confidence = 70;
  } else {
    recommendation = 'SELL';
    confidence = Math.min(90, 60 + Math.abs(upside) / 2);
  }
  
  // Scenario analysis
  const scenarioAnalysis = {
    bull: performScenarioCalculation(financialData, { ...assumptions, terminalGrowthRate: 0.035, revenueGrowthRates: assumptions.revenueGrowthRates.map(r => r + 0.02) }),
    base: intrinsicValue,
    bear: performScenarioCalculation(financialData, { ...assumptions, terminalGrowthRate: 0.015, revenueGrowthRates: assumptions.revenueGrowthRates.map(r => Math.max(0, r - 0.03)) })
  };
  
  // Sensitivity analysis
  const waccRange = [-0.01, -0.005, 0, 0.005, 0.01].map(delta => wacc + delta);
  const growthRange = [-0.005, -0.0025, 0, 0.0025, 0.005].map(delta => assumptions.terminalGrowthRate + delta);
  const sensitivityMatrix = calculateSensitivityMatrix(financialData, assumptions, waccRange, growthRange);
  
  return {
    ticker: financialData.ticker,
    currentPrice,
    intrinsicValue,
    upside,
    recommendation,
    confidence,
    projectedCashFlows,
    presentValueCashFlows,
    terminalValue,
    presentValueTerminalValue,
    enterpriseValue,
    equityValue,
    wacc,
    assumptions,
    scenarioAnalysis,
    sensitivityMatrix: {
      waccRange,
      growthRange,
      values: sensitivityMatrix
    }
  };
};

const performScenarioCalculation = (
  financialData: FinancialSnapshot,
  assumptions: DCFAssumptions
): number => {
  const currentRevenue = financialData.market_cap / (financialData.price_to_sales_ratio || 1);
  const wacc = calculateWACC(assumptions, financialData.debt_to_equity);
  
  let presentValueCashFlows = 0;
  for (let year = 1; year <= assumptions.projectionYears; year++) {
    const growthRate = assumptions.revenueGrowthRates[year - 1] || assumptions.revenueGrowthRates[assumptions.revenueGrowthRates.length - 1];
    const projectedRevenue = currentRevenue * Math.pow(1 + growthRate, year);
    const projectedFCF = projectedRevenue * assumptions.fcfMarginTarget;
    const presentValue = projectedFCF / Math.pow(1 + wacc, year);
    presentValueCashFlows += presentValue;
  }
  
  const finalYearRevenue = currentRevenue * Math.pow(1 + assumptions.revenueGrowthRates[assumptions.revenueGrowthRates.length - 1], assumptions.projectionYears);
  const finalYearFCF = finalYearRevenue * assumptions.fcfMarginTarget;
  const terminalCashFlow = finalYearFCF * (1 + assumptions.terminalGrowthRate);
  const terminalValue = terminalCashFlow / (wacc - assumptions.terminalGrowthRate);
  const presentValueTerminalValue = terminalValue / Math.pow(1 + wacc, assumptions.projectionYears);
  
  const enterpriseValue = presentValueCashFlows + presentValueTerminalValue;
  const netDebt = financialData.market_cap * (financialData.debt_to_equity / (1 + financialData.debt_to_equity));
  const equityValue = enterpriseValue - netDebt;
  const sharesOutstanding = financialData.market_cap / (financialData.free_cash_flow_per_share * financialData.price_to_earnings_ratio || 1);
  
  return equityValue / sharesOutstanding;
};

const calculateSensitivityMatrix = (
  financialData: FinancialSnapshot,
  baseAssumptions: DCFAssumptions,
  waccRange: number[],
  growthRange: number[]
): number[][] => {
  const matrix: number[][] = [];
  
  for (const waccValue of waccRange) {
    const row: number[] = [];
    for (const growthValue of growthRange) {
      const modifiedAssumptions = {
        ...baseAssumptions,
        terminalGrowthRate: growthValue
      };
      
      // Simplified calculation for sensitivity
      const currentRevenue = financialData.market_cap / (financialData.price_to_sales_ratio || 1);
      let presentValueCashFlows = 0;
      
      for (let year = 1; year <= modifiedAssumptions.projectionYears; year++) {
        const growthRate = modifiedAssumptions.revenueGrowthRates[year - 1] || modifiedAssumptions.revenueGrowthRates[modifiedAssumptions.revenueGrowthRates.length - 1];
        const projectedRevenue = currentRevenue * Math.pow(1 + growthRate, year);
        const projectedFCF = projectedRevenue * modifiedAssumptions.fcfMarginTarget;
        const presentValue = projectedFCF / Math.pow(1 + waccValue, year);
        presentValueCashFlows += presentValue;
      }
      
      const finalYearRevenue = currentRevenue * Math.pow(1 + modifiedAssumptions.revenueGrowthRates[modifiedAssumptions.revenueGrowthRates.length - 1], modifiedAssumptions.projectionYears);
      const finalYearFCF = finalYearRevenue * modifiedAssumptions.fcfMarginTarget;
      const terminalCashFlow = finalYearFCF * (1 + growthValue);
      const terminalValue = terminalCashFlow / (waccValue - growthValue);
      const presentValueTerminalValue = terminalValue / Math.pow(1 + waccValue, modifiedAssumptions.projectionYears);
      
      const enterpriseValue = presentValueCashFlows + presentValueTerminalValue;
      const netDebt = financialData.market_cap * (financialData.debt_to_equity / (1 + financialData.debt_to_equity));
      const equityValue = enterpriseValue - netDebt;
      const sharesOutstanding = financialData.market_cap / (financialData.free_cash_flow_per_share * financialData.price_to_earnings_ratio || 1);
      const intrinsicValue = equityValue / sharesOutstanding;
      
      row.push(intrinsicValue);
    }
    matrix.push(row);
  }
  
  return matrix;
};
