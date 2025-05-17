import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetWithPrice } from '@/types';
import { formatCurrency, isPositive, getChangeColor } from '@/lib/utils';
import { usePortfolioHistory, TimeframeOption  } from '@/hooks/usePortfolioHistory';
import { Button } from '@/components/ui/button';

interface PnLChartProps {
  assetsWithPrices: AssetWithPrice[];
  totalPnL?: number;
  totalPnLPercent?: number;
  hasAllCostBasis: boolean;
  isLoading: boolean;
}

export function PnLChart({
  assetsWithPrices,
  totalPnL,
  totalPnLPercent,
  hasAllCostBasis,
  isLoading: assetLoading
}: PnLChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeOption>('1M');
  
  const {
    chartData,
    isLoading: historyLoading,
    error,
    pnlAmount,
    pnlPercent
  } = usePortfolioHistory(activeTimeframe);
  
  const isLoading = assetLoading || historyLoading;
  
  // Use component props for PnL if we have cost basis data
  // Otherwise use calculated PnL from historical data
  const displayPnL = hasAllCostBasis ? totalPnL : pnlAmount;
  const displayPnLPercent = hasAllCostBasis ? totalPnLPercent : pnlPercent;
  
  const timeframeOptions: TimeframeOption[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];
  
  const chartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    title: {
      text: 'Portfolio Value History',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xaxis: {
      type: 'datetime' as const,
      labels: {
        formatter: function(val: string) {
          return new Date(val).toLocaleDateString();
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(val: number) {
          return formatCurrency(val);
        }
      }
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: function(val: number) {
          return formatCurrency(val);
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    },
    colors: [displayPnL && displayPnL >= 0 ? '#22c55e' : '#ef4444']
  };
  
  if (!hasAllCostBasis && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>P&L History</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {hasAllCostBasis 
              ? 'No portfolio history data available yet.'
              : 'Cost basis information is required for all assets to display P&L history.'}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>P&L History</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>P&L History</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-destructive">Failed to load portfolio history</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          P&L History
          {displayPnL !== undefined && displayPnLPercent !== undefined && (
            <span className={`ml-2 text-sm font-normal ${getChangeColor(displayPnL)}`}>
              {formatCurrency(displayPnL)} ({displayPnLPercent > 0 ? '+' : ''}{displayPnLPercent.toFixed(2)}%)
            </span>
          )}
        </CardTitle>
        <div className="flex space-x-1">
          {timeframeOptions.map((tf) => (
            <Button 
              key={tf}
              variant={activeTimeframe === tf ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTimeframe(tf)}
              className="px-2 py-1 h-8"
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          {chartData && chartData.length > 0 && (
            <ReactApexChart
              options={chartOptions}
              series={[{ 
                name: 'Portfolio Value', 
                data: chartData
              }]}
              type="area"
              height={350}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
