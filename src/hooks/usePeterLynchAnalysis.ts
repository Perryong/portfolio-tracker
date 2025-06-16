
import { useState, useEffect } from 'react';
import { useFinancialData } from './useFinancialData';
import { useHistoricalData } from './useHistoricalData';
import { analyzeWithLynchPrinciples } from '@/services/peterLynchService';
import { PeterLynchAnalysis } from '@/types/peterLynchAnalysis';

export const usePeterLynchAnalysis = (symbol: string) => {
  const [analysis, setAnalysis] = useState<PeterLynchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const { financialData, isLoading: isLoadingFinancial, error: financialError } = useFinancialData(symbol);
  const { historicalData, isLoading: isLoadingHistorical, error: historicalError } = useHistoricalData(symbol);

  useEffect(() => {
    const performAnalysis = async () => {
      if (!symbol || !financialData || isLoadingFinancial || isLoadingHistorical) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Performing Peter Lynch analysis for:', symbol);
        const lynchAnalysis = analyzeWithLynchPrinciples(financialData, historicalData);
        setAnalysis(lynchAnalysis);
      } catch (err) {
        console.error('Error in Peter Lynch analysis:', err);
        setError(err instanceof Error ? err : new Error('Unknown error in Peter Lynch analysis'));
        setAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, [symbol, financialData, historicalData, isLoadingFinancial, isLoadingHistorical]);

  return {
    analysis,
    isLoading: isLoading || isLoadingFinancial || isLoadingHistorical,
    error: error || financialError || historicalError,
    refetch: () => {
      if (symbol && financialData) {
        const lynchAnalysis = analyzeWithLynchPrinciples(financialData, historicalData);
        setAnalysis(lynchAnalysis);
      }
    }
  };
};
