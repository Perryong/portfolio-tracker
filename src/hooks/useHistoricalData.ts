
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalStockData } from "@/services/alphaVantageService";

export function useHistoricalData(symbol: string) {
  const [dateRange, setDateRange] = useState<number>(30); // Default to 30 days

  const {
    data: historicalData = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["historical-stock-data", symbol],
    queryFn: () => fetchHistoricalStockData(symbol),
    enabled: Boolean(symbol),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Filter data based on the selected date range
  const filteredData = historicalData.slice(0, dateRange);

  return {
    historicalData: filteredData,
    isLoading,
    error,
    refetch,
    dateRange,
    setDateRange,
  };
}
