
import { TimeSeriesDataPoint } from "./alphaVantageService";
import { TechnicalIndicators, TechnicalSignals } from "@/types/technicalAnalysis";

/**
 * Analyze technical signals
 */
export const analyzeTechnicalSignals = (prices: TimeSeriesDataPoint[], indicators: TechnicalIndicators): TechnicalSignals => {
  const currentPrice = prices[0]?.close || 0;
  const currentVolume = prices[0]?.volume || 0;
  
  return {
    priceVsMovingAverages: {
      aboveSma20: indicators.sma20 ? currentPrice > indicators.sma20 : false,
      aboveSma50: indicators.sma50 ? currentPrice > indicators.sma50 : false,
      aboveSma200: indicators.sma200 ? currentPrice > indicators.sma200 : false,
      aboveEma20: indicators.ema20 ? currentPrice > indicators.ema20 : false,
      aboveEma50: indicators.ema50 ? currentPrice > indicators.ema50 : false,
    },
    momentum: {
      rsiOverbought: indicators.rsi ? indicators.rsi > 70 : false,
      rsiOversold: indicators.rsi ? indicators.rsi < 30 : false,
      macdBullish: indicators.macd ? indicators.macd.histogram > 0 : false,
      macdBearish: indicators.macd ? indicators.macd.histogram < 0 : false,
    },
    volatility: {
      nearUpperBand: indicators.bollingerBands ? currentPrice > indicators.bollingerBands.upper * 0.98 : false,
      nearLowerBand: indicators.bollingerBands ? currentPrice < indicators.bollingerBands.lower * 1.02 : false,
      highVolatility: indicators.bollingerBands ? 
        (indicators.bollingerBands.upper - indicators.bollingerBands.lower) / indicators.bollingerBands.middle > 0.1 : false,
    },
    volume: {
      aboveAverage: currentVolume > indicators.volumeSma20,
    }
  };
};
