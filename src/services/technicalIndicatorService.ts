
// Map indicator types to TradingView study names
import { IndicatorParams, IndicatorType } from "@/hooks/useTechnicalIndicators";

/** Map our internal indicator types ➜ TradingView study IDs */
export const TradingViewIndicatorMap: Record<IndicatorType, string> = {
  sma: "MASimple@tv-basicstudies",
  ema: "MAExp@tv-basicstudies",
  rsi: "RSI@tv-basicstudies",
  macd: "MACD@tv-basicstudies",
  bbands: "BB@tv-basicstudies",
  stoch: "Stochastic@tv-basicstudies",
  ichimoku: "IchimokuCloud@tv-basicstudies",
  atr: "ATR@tv-basicstudies",
  psar: "PSAR@tv-basicstudies"
};

/**
 * Build the `studies_overrides` entry/entries for a single indicator
 * so that TradingView receives the correct default inputs (length, step…).
 */
export const IndicatorInputKey: Record<
  IndicatorType,
  (p: IndicatorParams) => Record<string, number>
> = {
  sma: p => ({ "moving average.length": p.timePeriod! }),
  
  ema: p => ({ "moving average exponential.length": p.timePeriod! }),
  
  rsi: p => ({ "relative strength index.length": p.timePeriod! }),
  
  macd: p => ({
    "macd.fast length": p.fastPeriod!,
    "macd.slow length": p.slowPeriod!,
    "macd.signal length": p.signalPeriod!,
  }),
  
  bbands: p => ({ "bollinger bands.length": p.timePeriod! }),
  
  stoch: p => ({ "stochastic.length": p.timePeriod! }),
  
  ichimoku: () => ({}), // default inputs are fine
  
  atr: p => ({ "average true range.length": p.timePeriod! }),
  
  psar: p => ({
    "parabolic sar.step": p.step!,
    "parabolic sar.maximum": p.maximum!,
  }),
};
