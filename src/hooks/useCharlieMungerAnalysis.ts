
import { useQuery } from "@tanstack/react-query";
import { analyzeWithMungerPrinciples } from "@/services/charlieMungerService";
import { useFinancialData } from "./useFinancialData";
import { useHistoricalData } from "./useHistoricalData";
import { CharlieMungerAnalysis } from "@/types/charlieMungerAnalysis";

export function useCharlieMungerAnalysis(symbol: string) {
  const { financialData, isLoading: isFinancialLoading, error: financialError } = useFinancialData(symbol);
  const { historicalData, isLoading: isHistoricalLoading, error: historicalError } = useHistoricalData(symbol);

  const {
    data: mungerAnalysis,
    isLoading: isAnalysisLoading,
    error: analysisError
  } = useQuery({
    queryKey: ["charlie-munger-analysis", symbol, financialData?.ticker],
    queryFn: (): CharlieMungerAnalysis | null => {
      if (!financialData || !historicalData) {
        return null;
      }
      
      return analyzeWithMungerPrinciples(financialData, historicalData);
    },
    enabled: Boolean(financialData && historicalData && symbol),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    mungerAnalysis,
    isLoading: isFinancialLoading || isHistoricalLoading || isAnalysisLoading,
    error: financialError || historicalError || analysisError,
    hasData: Boolean(mungerAnalysis)
  };
}
