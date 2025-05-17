
import React, { useEffect, useRef, memo } from 'react';
import { getChartColors } from '@/utils/tradingViewUtils';
import { TimeSeriesDataPoint } from '@/services/alphaVantageService';

interface TradingViewWidgetProps {
  symbol: string;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  interval?: string;
  height?: number;
  studies?: string[];
  studyOverrides?: Record<string, number>;
  historicalData?: TimeSeriesDataPoint[];
}

// We use memo to prevent unnecessary re-renders
export const TradingViewWidget = memo(({
  symbol = 'AAPL',
  theme = 'light',
  autosize = true,
  interval = 'D',
  height = 400,
  studies = [],
  studyOverrides = {},
  historicalData = []
}: TradingViewWidgetProps) => {
  const container = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const colors = getChartColors(theme === 'dark');
  const chartContainerId = `tv-chart-container-${symbol.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const widgetRef = useRef<any>(null);

  // Use the symbol directly without adding NASDAQ: prefix
  const formattedSymbol = symbol;

  useEffect(() => {
    // Create the script if it doesn't exist
    if (!scriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
      scriptRef.current = script;
    } else {
      // If script already loaded, just initialize the widget
      initWidget();
    }

    function initWidget() {
      if (container.current && "TradingView" in window) {
        container.current.innerHTML = '';
        const tradingView = (window as any).TradingView;
        
        // Create TradingView widget
        widgetRef.current = new tradingView.widget({
          autosize,
          symbol: formattedSymbol,
          interval,
          theme,
          style: "1", // Default is candles
          locale: "en",
          toolbar_bg: colors.background,
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: chartContainerId,
          hide_side_toolbar: false,
          save_image: true,
          studies: studies.length > 0 ? studies : [],
          studies_overrides: studyOverrides,
          height: height,
          withdateranges: true,
          hide_volume: false,
          details: true,
          hotlist: true,
          calendar: true,          
          compareSymbols: [
            {
              "symbol": "MARKETSCOM:SPY",
              "position": "NewPriceScale"
            }
          ],
          drawings_access: { type: 'rectangle', tools: [{ name: "rectangle" }] },
          overrides: {
            "mainSeriesProperties.candleStyle.wickUpColor": colors.wickUpColor,
            "mainSeriesProperties.candleStyle.wickDownColor": colors.wickDownColor,
            "mainSeriesProperties.candleStyle.upColor": colors.upColor,
            "mainSeriesProperties.candleStyle.downColor": colors.downColor,
          }
        });

        // If we have a widget instance, try to get its chart
        const waitForChart = setInterval(() => {
          if (widgetRef.current && typeof widgetRef.current.chart === 'function') {
            try {
              const chart = widgetRef.current.chart();
              if (chart) {
                clearInterval(waitForChart);
                chart.onAutoSizeChanged();
              }
            } catch (e) {
              // Chart not ready yet
            }
          }
        }, 100);

        // Clean up interval
        return () => clearInterval(waitForChart);
      }
    }

    // Cleanup
    return () => {
      // Only clean the container HTML when unmounting
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [formattedSymbol, theme, autosize, interval, height, studies, studyOverrides, colors, chartContainerId]);

  return (
    <div className="relative">
      <div 
        id={chartContainerId} 
        ref={container} 
        style={{ height: `${height}px` }}
      />
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';
