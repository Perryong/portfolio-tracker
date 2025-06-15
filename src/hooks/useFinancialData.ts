
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFinancialData, calculateIntrinsicValue, FinancialSnapshot } from '@/services/financialDatasetsService';

export const useFinancialData = (ticker: string) => {
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    data: financialData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['financialData', ticker],
    queryFn: () => fetchFinancialData(ticker),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const calculateValuation = async (): Promise<number> => {
    if (!financialData) return 0;
    
    setIsCalculating(true);
    try {
      const intrinsicValue = calculateIntrinsicValue(financialData);
      return intrinsicValue;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    financialData,
    isLoading,
    error,
    isCalculating,
    refetch,
    calculateValuation
  };
};