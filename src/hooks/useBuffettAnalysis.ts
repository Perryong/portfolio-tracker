
import { useQuery } from '@tanstack/react-query';
import { useFinancialData } from './useFinancialData';
import { calculateBuffettMetrics, BuffettMetrics } from '@/services/buffettMetricsService';

export const useBuffettAnalysis = (ticker: string) => {
  const { financialData, isLoading: isLoadingFinancial, error: financialError } = useFinancialData(ticker);

  const {
    data: buffettMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useQuery({
    queryKey: ['buffett-analysis', ticker, financialData?.ticker],
    queryFn: () => {
      if (!financialData) return null;
      return calculateBuffettMetrics(financialData);
    },
    enabled: !!financialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    buffettMetrics,
    financialData,
    isLoading: isLoadingFinancial || isLoadingMetrics,
    error: financialError || metricsError
  };
};
