
import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalStockData } from "@/services/alphaVantageService";
import { calculateRiskMetrics, calculateTechnicalIndicators } from "@/services/riskAnalysisService";
import { RiskMetrics, TechnicalIndicators } from "@/types/technicalAnalysis";
import { generateQuantitativeRecommendation } from "@/services/quantAnalysisService";
import { QuantitativeRecommendation } from "@/types/quantitativeAnalysis";
import { FinancialSnapshot } from "@/services/financialDatasetsService";

export function useRiskAnalysis(symbol: string, financialData?: FinancialSnapshot) {
  const {
    data: historicalData = [],
    isLoading: isLoadingData,
    error: dataError
  } = useQuery({
    queryKey: ["historical-stock-data", symbol],
    queryFn: () => fetchHistoricalStockData(symbol),
    enabled: Boolean(symbol),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const {
    data: analysisData,
    isLoading: isLoadingAnalysis,
    error: analysisError
  } = useQuery({
    queryKey: ["risk-analysis", symbol, historicalData.length, financialData?.ticker],
    queryFn: () => {
      if (historicalData.length === 0) {
        return { riskMetrics: null, technicalIndicators: null, quantitativeRecommendation: null };
      }
      
      const riskMetrics = calculateRiskMetrics(historicalData);
      const technicalIndicators = calculateTechnicalIndicators(historicalData);
      
      let quantitativeRecommendation = null;
      if (financialData) {
        quantitativeRecommendation = generateQuantitativeRecommendation(
          historicalData,
          technicalIndicators,
          financialData,
          riskMetrics
        );
      }
      
      return { riskMetrics, technicalIndicators, quantitativeRecommendation };
    },
    enabled: historicalData.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    historicalData,
    riskMetrics: analysisData?.riskMetrics || null,
    technicalIndicators: analysisData?.technicalIndicators || null,
    quantitativeRecommendation: analysisData?.quantitativeRecommendation || null,
    isLoading: isLoadingData || isLoadingAnalysis,
    error: dataError || analysisError
  };
}
