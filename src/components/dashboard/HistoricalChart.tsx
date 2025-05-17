
import React from "react";
import { TimeSeriesDataPoint } from "@/services/alphaVantageService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TradingViewWidget } from "./charts/TradingViewWidget";
import { useTheme } from "next-themes";

interface HistoricalChartProps {
  data: TimeSeriesDataPoint[];
  symbol: string;
  isLoading: boolean;
  studies?: string[];
  studyOverrides?: Record<string, number>;
}

export function HistoricalChart({ 
  symbol, 
  isLoading, 
  data = [],
  studies = [],
  studyOverrides = {}
}: HistoricalChartProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Historical Price Data: {symbol}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[400px]">
          <TradingViewWidget 
            symbol={symbol} 
            theme={theme === 'dark' ? 'dark' : 'light'}
            height={400}
            studies={studies}
            studyOverrides={studyOverrides}
            historicalData={data}
          />
        </div>
      </CardContent>
    </Card>
  );
}
