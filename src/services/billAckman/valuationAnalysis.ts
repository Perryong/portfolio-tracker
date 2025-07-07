
import { FinancialSnapshot, calculateIntrinsicValue } from '../financialDatasetsService';
import { TimeSeriesDataPoint } from '@/services/alphaVantageService';
import { ValuationAnalysis } from '@/types/billAckmanAnalysis';

export const analyzeValuation = (data: FinancialSnapshot, historicalData: TimeSeriesDataPoint[]): ValuationAnalysis => {
  const details: string[] = [];
  let score = 0;
  
  // Use the same DCF calculation as the Stock Valuation tab
  console.log('Using consistent DCF calculation for Ackman analysis');
  const baseIntrinsicValue = calculateIntrinsicValue(data);
  
  // Apply Ackman's conservative adjustments (20% haircut for margin of safety)
  const ackmanConservatismFactor = 0.80;
  const intrinsicValue = baseIntrinsicValue * ackmanConservatismFactor;
  
  // Get current price from historical data
  const currentPrice = historicalData.length > 0 ? historicalData[0].close : null;
  
  let marginOfSafety: number | null = null;
  
  if (intrinsicValue > 0 && currentPrice) {
    marginOfSafety = (intrinsicValue - currentPrice) / currentPrice;
    
    // Ackman's margin of safety scoring (more conservative thresholds)
    if (marginOfSafety > 0.40) {
      score = 5;
      details.push(`Excellent margin of safety: ${(marginOfSafety * 100).toFixed(1)}% (after conservative adjustment)`);
    } else if (marginOfSafety > 0.25) {
      score = 4;
      details.push(`Strong margin of safety: ${(marginOfSafety * 100).toFixed(1)}% (after conservative adjustment)`);
    } else if (marginOfSafety > 0.10) {
      score = 2;
      details.push(`Moderate margin of safety: ${(marginOfSafety * 100).toFixed(1)}% (after conservative adjustment)`);
    } else if (marginOfSafety > 0) {
      score = 1;
      details.push(`Small margin of safety: ${(marginOfSafety * 100).toFixed(1)}% (after conservative adjustment)`);
    } else {
      details.push(`No margin of safety: ${(marginOfSafety * 100).toFixed(1)}% (overvalued)`);
    }
    
    details.push(`Base DCF value: $${baseIntrinsicValue.toFixed(2)}, Ackman adjusted: $${intrinsicValue.toFixed(2)}, Current: $${currentPrice.toFixed(2)}`);
    details.push(`Conservative adjustment: 20% haircut applied for risk management`);
  } else if (baseIntrinsicValue <= 0) {
    details.push('DCF analysis not feasible - insufficient or negative free cash flow');
  } else {
    details.push('Current price not available for margin of safety calculation');
  }
  
  // P/E ratio check (Ackman's standards)
  const peRatio = data.price_to_earnings_ratio;
  if (peRatio !== null) {
    if (peRatio < 12) {
      score += 2;
      details.push(`Very attractive P/E ratio: ${peRatio.toFixed(1)}x (Ackman threshold)`);
    } else if (peRatio < 18) {
      score += 1;
      details.push(`Reasonable P/E ratio: ${peRatio.toFixed(1)}x`);
    } else {
      details.push(`High P/E ratio: ${peRatio.toFixed(1)}x (above Ackman comfort zone)`);
    }
  }
  
  // Free cash flow yield check
  const fcfYield = data.free_cash_flow_yield;
  if (fcfYield !== null) {
    if (fcfYield > 0.08) {
      score += 1;
      details.push(`Strong free cash flow yield: ${(fcfYield * 100).toFixed(1)}%`);
    } else if (fcfYield > 0.05) {
      details.push(`Decent free cash flow yield: ${(fcfYield * 100).toFixed(1)}%`);
    } else {
      details.push(`Low free cash flow yield: ${(fcfYield * 100).toFixed(1)}%`);
    }
  }
  
  // Ackman's DCF assumptions (more conservative than base model)
  const dcfAssumptions = {
    growthRate: 0.05,      // Conservative 5% long-term growth
    discountRate: 0.12,    // Higher 12% required return (vs 10% in base model)
    terminalMultiple: 12   // Conservative terminal multiple (vs 15 in base model)
  };
  
  return {
    intrinsicValue: intrinsicValue > 0 ? intrinsicValue : null,
    marginOfSafety,
    currentPrice,
    dcfAssumptions,
    score: Math.min(10, score),
    details
  };
};
