
import { FinancialSnapshot } from './financialDatasetsService';
import { TimeSeriesDataPoint } from '@/services/alphaVantageService';
import { BillAckmanAnalysis } from '@/types/billAckmanAnalysis';
import { analyzeBusinessQuality } from './billAckman/businessQualityAnalysis';
import { analyzeFinancialDiscipline } from './billAckman/financialDisciplineAnalysis';
import { analyzeActivismPotential } from './billAckman/activismAnalysis';
import { analyzeValuation } from './billAckman/valuationAnalysis';
import { determineAckmanSignal, calculateAckmanConfidence, generateAckmanReasoning } from './billAckman/analysisHelpers';

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
