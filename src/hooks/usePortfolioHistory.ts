
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePortfolioSummary } from './usePortfolioSummary';

export type TimeframeOption = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export type PortfolioHistoryData = {
  date: string;
  value: number;
};

export const usePortfolioHistory = (timeframe: TimeframeOption = '1M') => {
  const { assets } = usePortfolioStore();
  const { totalValue } = usePortfolioSummary(assets);
  const queryClient = useQueryClient();
  
  // Function to get date range based on timeframe
  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '1W':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        startDate.setFullYear(now.getFullYear() - 5); // Get up to 5 years of data
        break;
    }
    
    return { startDate, endDate: now };
  };
  
  // Function to fetch portfolio history from Supabase
  const fetchPortfolioHistory = async () => {
    const { startDate } = getDateRange();
    
    const { data, error } = await supabase
      .from('portfolio_history')
      .select('date, value')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching portfolio history:', error);
      throw error;
    }
    
    return data as PortfolioHistoryData[];
  };
  
  // Record today's portfolio value
  const recordTodayValue = async () => {
    if (!totalValue) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if we already have an entry for today
    const { data } = await supabase
      .from('portfolio_history')
      .select('id')
      .eq('date', today.toISOString());
    
    if (data && data.length > 0) {
      // Update existing record for today
      await supabase
        .from('portfolio_history')
        .update({ value: totalValue })
        .eq('id', data[0].id);
    } else {
      // Insert new record for today
      await supabase
        .from('portfolio_history')
        .insert({ date: today.toISOString(), value: totalValue });
    }
    
    // Invalidate query to refetch data
    queryClient.invalidateQueries({
      queryKey: ['portfolio-history', timeframe],
    });
  };
  
  // Fetch history data using TanStack Query
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['portfolio-history', timeframe],
    queryFn: fetchPortfolioHistory,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Record today's value when totalValue changes
  useEffect(() => {
    if (totalValue > 0) {
      recordTodayValue();
    }
  }, [totalValue]);
  
  // Generate chart data in the format needed for ApexCharts
  const generateChartData = () => {
    if (!historyData || historyData.length === 0) {
      // If no history data, return today's value as the only data point
      if (totalValue) {
        return [{
          x: new Date().toISOString().split('T')[0],
          y: totalValue
        }];
      }
      return [];
    }
    
    // Calculate the close prices for each date
    return historyData.map((item) => ({
      x: item.date.split('T')[0], // Remove time part
      y: item.value
    }));
  };
  
  const chartData = generateChartData();
  
  // Calculate overall PnL if we have history
  let pnlAmount = 0;
  let pnlPercent = 0;
  
  if (chartData.length > 1) {
    const firstValue = Number(chartData[0].y);
    const lastValue = Number(chartData[chartData.length - 1].y);
    
    if (firstValue > 0) {
      pnlAmount = lastValue - firstValue;
      pnlPercent = (pnlAmount / firstValue) * 100;
    }
  }
  
  return {
    chartData,
    timeframe,
    isLoading,
    error,
    refetch,
    pnlAmount,
    pnlPercent,
  };
};
