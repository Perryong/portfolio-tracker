
import { useQuery } from "@tanstack/react-query";
import { analyzeWithAckmanPrinciples } from "@/services/billAckmanService";
import { useFinancialData } from "./useFinancialData";
import { useHistoricalData } from "./useHistoricalData";
import { BillAckmanAnalysis } from "@/types/billAckmanAnalysis";

export function useBillAckmanAnalysis(symbol: string) {
  const { financialData, isLoading: isFinancialLoading, error: financialError } = useFinancialData(symbol);
  const { historicalData, isLoading: isHistoricalLoading, error: historicalError } = useHistoricalData(symbol);

  const {
    data: ackmanAnalysis,
    isLoading: isAnalysisLoading,
    error: analysisError
  } = useQuery({
    queryKey: ["bill-ackman-analysis", symbol, financialData?.ticker],
    queryFn: (): BillAckmanAnalysis | null => {
      if (!financialData || !historicalData) {
        return null;
      }
      
      return analyzeWithAckmanPrinciples(financialData, historicalData);
    },
    enabled: Boolean(financialData && historicalData && symbol),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    ackmanAnalysis,
    isLoading: isFinancialLoading || isHistoricalLoading || isAnalysisLoading,
    error: financialError || historicalError || analysisError,
    hasData: Boolean(ackmanAnalysis)
  };
}
