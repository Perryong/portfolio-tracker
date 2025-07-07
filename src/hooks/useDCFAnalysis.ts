import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFinancialData } from './useFinancialData';
import { useHistoricalData } from './useHistoricalData';
import { performDCFAnalysis, DCFResults, DCFAssumptions, DEFAULT_DCF_ASSUMPTIONS } from '@/services/dcfAnalysisService';
import { calculateIntrinsicValue } from '@/services/financialDatasetsService';

export const useDCFAnalysis = (symbol: string) => {
  const [customAssumptions, setCustomAssumptions] = useState<Partial<DCFAssumptions>>({});
  
  const { financialData, isLoading: isFinancialLoading, error: financialError } = useFinancialData(symbol);
  const { historicalData, isLoading: isHistoricalLoading, error: historicalError } = useHistoricalData(symbol);

  const {
    data: dcfResults,
    isLoading: isDCFLoading,
    error: dcfError,
    refetch
  } = useQuery({
    queryKey: ['dcf-analysis', symbol, financialData?.ticker, customAssumptions],
    queryFn: (): DCFResults | null => {
      if (!financialData || !historicalData || historicalData.length === 0) {
        return null;
      }
      
      console.log('Performing DCF analysis for:', symbol);
      
      // Calculate the accurate intrinsic value using the Valuations method
      const accurateIntrinsicValue = calculateIntrinsicValue(financialData);
      
      // Get the academic DCF results for educational purposes
      const academicDCF = performDCFAnalysis(financialData, historicalData, customAssumptions);
      
      // Use the accurate intrinsic value but keep the academic DCF structure
      const enhancedResults: DCFResults = {
        ...academicDCF,
        intrinsicValue: accurateIntrinsicValue, // Use the accurate calculation
        currentPrice: historicalData[0]?.close || 0,
        upside: accurateIntrinsicValue > 0 ? ((accurateIntrinsicValue - (historicalData[0]?.close || 0)) / (historicalData[0]?.close || 1)) * 100 : 0,
        recommendation: (() => {
          const upside = accurateIntrinsicValue > 0 ? ((accurateIntrinsicValue - (historicalData[0]?.close || 0)) / (historicalData[0]?.close || 1)) * 100 : 0;
          if (upside > 20) return 'BUY' as const;
          if (upside > -10) return 'HOLD' as const;
          return 'SELL' as const;
        })(),
        confidence: (() => {
          const upside = accurateIntrinsicValue > 0 ? ((accurateIntrinsicValue - (historicalData[0]?.close || 0)) / (historicalData[0]?.close || 1)) * 100 : 0;
          if (Math.abs(upside) > 20) return Math.min(90, 60 + Math.abs(upside) / 2);
          return 70;
        })(),
        // Keep academic DCF for comparison
        academicIntrinsicValue: academicDCF.intrinsicValue,
        // Update scenario analysis with the accurate method
        scenarioAnalysis: {
          bull: accurateIntrinsicValue * 1.2, // 20% premium for bull case
          base: accurateIntrinsicValue,
          bear: accurateIntrinsicValue * 0.8  // 20% discount for bear case
        }
      };
      
      return enhancedResults;
    },
    enabled: Boolean(financialData && historicalData && historicalData.length > 0 && symbol),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateAssumptions = (newAssumptions: Partial<DCFAssumptions>) => {
    setCustomAssumptions(prev => ({ ...prev, ...newAssumptions }));
  };

  const resetAssumptions = () => {
    setCustomAssumptions({});
  };

  const isLoading = isFinancialLoading || isHistoricalLoading || isDCFLoading;
  const error = financialError || historicalError || dcfError;

  return {
    dcfResults,
    isLoading,
    error,
    customAssumptions: { ...DEFAULT_DCF_ASSUMPTIONS, ...customAssumptions },
    updateAssumptions,
    resetAssumptions,
    refetch,
    hasData: Boolean(dcfResults)
  };
};
