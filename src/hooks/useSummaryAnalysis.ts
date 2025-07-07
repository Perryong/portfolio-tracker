
import { useState, useEffect } from 'react';
import { SummaryAnalysis, WeightedAnalysis, DEFAULT_WEIGHTS } from '@/services/summary/types';
import { generateSummaryAnalysis } from '@/services/summary/summaryAnalysisService';
import { SelectedMethods } from '@/components/dashboard/AnalysisMethodSelector';
import { useRiskAnalysis } from './useRiskAnalysis';
import { useBuffettAnalysis } from './useBuffettAnalysis';
import { useCharlieMungerAnalysis } from './useCharlieMungerAnalysis';
import { usePeterLynchAnalysis } from './usePeterLynchAnalysis';
import { useBillAckmanAnalysis } from './useBillAckmanAnalysis';
import { useFinancialData } from './useFinancialData';

export const useSummaryAnalysis = (
  symbol: string, 
  customWeights?: WeightedAnalysis,
  selectedMethods?: SelectedMethods
) => {
  const [summaryAnalysis, setSummaryAnalysis] = useState<SummaryAnalysis | null>(null);
  const [weights, setWeights] = useState<WeightedAnalysis>(customWeights || DEFAULT_WEIGHTS);

  const { financialData } = useFinancialData(symbol);
  
  // Conditionally call hooks based on selected methods
  const shouldUseQuantitative = selectedMethods?.quantitative !== false;
  const shouldUseBuffett = selectedMethods?.warrenBuffett !== false;
  const shouldUseMunger = selectedMethods?.charlieMunger !== false;
  const shouldUseLynch = selectedMethods?.peterLynch !== false;
  const shouldUseAckman = selectedMethods?.billAckman !== false;

  const { 
    quantitativeRecommendation, 
    isLoading: isLoadingQuant, 
    error: quantError 
  } = useRiskAnalysis(shouldUseQuantitative ? symbol : '', shouldUseQuantitative ? financialData : null);

  const { 
    buffettMetrics, 
    isLoading: isLoadingBuffett, 
    error: buffettError 
  } = useBuffettAnalysis(shouldUseBuffett ? symbol : '');

  const { 
    mungerAnalysis, 
    isLoading: isLoadingMunger, 
    error: mungerError 
  } = useCharlieMungerAnalysis(shouldUseMunger ? symbol : '');

  const { 
    analysis: lynchAnalysis, 
    isLoading: isLoadingLynch, 
    error: lynchError 
  } = usePeterLynchAnalysis(shouldUseLynch ? symbol : '');

  const { 
    ackmanAnalysis, 
    isLoading: isLoadingAckman, 
    error: ackmanError 
  } = useBillAckmanAnalysis(shouldUseAckman ? symbol : '');

  const isLoading = (shouldUseQuantitative && isLoadingQuant) || 
                   (shouldUseBuffett && isLoadingBuffett) || 
                   (shouldUseMunger && isLoadingMunger) || 
                   (shouldUseLynch && isLoadingLynch) || 
                   (shouldUseAckman && isLoadingAckman);
                   
  const error = quantError || buffettError || mungerError || lynchError || ackmanError;

  useEffect(() => {
    if (!symbol || isLoading) {
      setSummaryAnalysis(null);
      return;
    }

    // Only proceed if at least one method is selected
    if (selectedMethods && !Object.values(selectedMethods).some(Boolean)) {
      setSummaryAnalysis(null);
      return;
    }

    console.log('Generating summary analysis for:', symbol, 'with selected methods:', selectedMethods);
    
    const summary = generateSummaryAnalysis(
      symbol,
      shouldUseQuantitative ? (quantitativeRecommendation || undefined) : undefined,
      shouldUseBuffett ? (buffettMetrics || undefined) : undefined,
      shouldUseMunger ? (mungerAnalysis || undefined) : undefined,
      shouldUseLynch ? (lynchAnalysis || undefined) : undefined,
      shouldUseAckman ? (ackmanAnalysis || undefined) : undefined,
      weights
    );

    setSummaryAnalysis(summary);
  }, [
    symbol,
    quantitativeRecommendation,
    buffettMetrics,
    mungerAnalysis,
    lynchAnalysis,
    ackmanAnalysis,
    weights,
    isLoading,
    selectedMethods,
    shouldUseQuantitative,
    shouldUseBuffett,
    shouldUseMunger,
    shouldUseLynch,
    shouldUseAckman
  ]);

  const updateWeights = (newWeights: WeightedAnalysis) => {
    setWeights(newWeights);
  };

  return {
    summaryAnalysis,
    isLoading,
    error,
    weights,
    updateWeights
  };
};
