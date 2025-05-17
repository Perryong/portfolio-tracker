
import { useState } from "react";
import {
  TradingViewIndicatorMap,
  IndicatorInputKey,
} from "@/services/technicalIndicatorService";

export type IndicatorType =
  | "sma" | "ema" | "rsi" | "macd" | "bbands"
  | "stoch" | "ichimoku" | "atr" | "psar";

export interface IndicatorParams {
  timePeriod?: number;
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
  step?: number;
  maximum?: number;
  minGapSize?: number;
  minCandleSize?: number;
  showBullish?: boolean;
  showBearish?: boolean;
}

export interface TechnicalIndicator {
  id: string;
  type: IndicatorType;
  name: string;
  color: string;
  enabled: boolean;
  params: IndicatorParams;
}

export function useTechnicalIndicators() {
  // Default indicators setup for TradingView widget configuration
  const defaultIndicators: TechnicalIndicator[] = [
    {
      id: "sma-20",
      type: "sma",
      name: "SMA (20)",
      color: "#0EA5E9",
      enabled: false,
      params: { timePeriod: 20 }
    },
    {
      id: "sma-50",
      type: "sma",
      name: "SMA (50)",
      color: "#8B5CF6",
      enabled: false,
      params: { timePeriod: 50 }
    },
    {
      id: "ema-20",
      type: "ema",
      name: "EMA (20)",
      color: "#F97316",
      enabled: false,
      params: { timePeriod: 20 }
    },
    {
      id: "ema-50",
      type: "ema",
      name: "EMA (50)",
      color: "#14B8A6",
      enabled: false,
      params: { timePeriod: 50 }
    },
    {
      id: "rsi-14",
      type: "rsi",
      name: "RSI (14)",
      color: "#10B981",
      enabled: false,
      params: { timePeriod: 14 }
    },
    {
      id: "macd",
      type: "macd",
      name: "MACD",
      color: "#EC4899",
      enabled: false,
      params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }
    },
    {
      id: "bbands-20",
      type: "bbands",
      name: "Bollinger Bands (20)",
      color: "#6366F1",
      enabled: false,
      params: { timePeriod: 20 }
    },
    {
      id: "stoch-14",
      type: "stoch",
      name: "Stochastic (14)",
      color: "#7C3AED",
      enabled: false,
      params: { timePeriod: 14 }
    },
    {
      id: "ichimoku",
      type: "ichimoku",
      name: "Ichimoku Cloud",
      color: "#0891B2",
      enabled: false,
      params: {}
    },
    {
      id: "atr-14",
      type: "atr",
      name: "ATR (14)",
      color: "#DC2626",
      enabled: false,
      params: { timePeriod: 14 }
    },
    {
      id: "psar",
      type: "psar",
      name: "Parabolic SAR",
      color: "#9333EA",
      enabled: false,
      params: { step: 0.02, maximum: 0.2 }
    }
  ];
  
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>(defaultIndicators);
  
  // Function to toggle indicator visibility
  const toggleIndicator = (id: string) => {
    setIndicators(prev => 
      prev.map(indicator => 
        indicator.id === id 
          ? { ...indicator, enabled: !indicator.enabled } 
          : indicator
      )
    );
  };
  
  // Function to update indicator parameters
  const updateIndicatorParams = (id: string, params: IndicatorParams) => {
    setIndicators(prev => 
      prev.map(indicator => 
        indicator.id === id 
          ? { ...indicator, params: { ...indicator.params, ...params } } 
          : indicator
      )
    );
  };

  /**
   * Build BOTH arrays TradingView expects:
   *   • `studies`            – list of study IDs
   *   • `studies_overrides`  – default input overrides
   */
  const getWidgetConfig = () => {
    const studies: string[] = [];
    const studyOverrides: Record<string, number> = {};

    indicators.filter(i => i.enabled).forEach(i => {
      const tvId = TradingViewIndicatorMap[i.type];
      if (tvId) studies.push(tvId);
      Object.assign(studyOverrides, IndicatorInputKey[i.type](i.params));
    });

    return { studies, studyOverrides };
  };
  
  return {
    indicators,
    toggleIndicator,
    updateIndicatorParams,
    getWidgetConfig
  };
}
