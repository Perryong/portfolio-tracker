
import { TimeSeriesDataPoint } from "@/services/alphaVantageService";

export interface FairValueGap {
  id: string;
  type: "bullish" | "bearish";
  startIndex: number;
  startDate: string;
  upperBound: number;
  lowerBound: number;
  filled: boolean;
  filledDate?: string;
  indicatorId?: string; // Added to track which indicator created this gap
  color?: string; // Added to store indicator color
}

/**
 * Detects Fair Value Gaps (FVGs) in the provided price data
 * FVGs are identified by a three-candle pattern:
 * - For bullish FVG: High(C1) < Low(C3)
 * - For bearish FVG: Low(C1) > High(C3)
 */
export function detectFairValueGaps(
  data: TimeSeriesDataPoint[],
  minGapSize: number = 0.1, // Minimum gap size as percentage of price
  minCandleSize: number = 0.2 // Minimum size of middle candle as percentage
): FairValueGap[] {
  if (!data || data.length < 3) return [];
  
  console.log(`Detecting FVGs with minGapSize: ${minGapSize}%, minCandleSize: ${minCandleSize}%`);
  
  // We need to reverse the data as it typically comes in descending date order
  // but we want to process it in chronological order
  const chronologicalData = [...data].reverse();
  const gaps: FairValueGap[] = [];
  
  // Loop through the data to find gaps (skip first and last candle)
  for (let i = 1; i < chronologicalData.length - 1; i++) {
    const c1 = chronologicalData[i - 1]; // Previous candle
    const c2 = chronologicalData[i];     // Current candle
    const c3 = chronologicalData[i + 1]; // Next candle
    
    // Calculate candle ranges
    const c1Range = c1.high - c1.low;
    const c2Range = c2.high - c2.low;
    const c2BodySize = Math.abs(c2.close - c2.open);
    const avgPrice = (c1.close + c3.close) / 2; // Use average price for percentage calculation
    
    // Check if middle candle is significant enough (large body or range)
    const isC2Significant = c2Range >= (avgPrice * minCandleSize / 100) || 
                           c2BodySize >= (avgPrice * minCandleSize / 100);
    
    // Skip if middle candle isn't significant
    if (!isC2Significant) continue;
    
    // Check for bullish FVG: High of C1 < Low of C3
    if (c1.high < c3.low) {
      const gapSize = c3.low - c1.high;
      const gapPercentage = (gapSize / avgPrice) * 100;
      
      // Check if gap is significant enough
      if (gapPercentage >= minGapSize) {
        gaps.push({
          id: `bullish-${chronologicalData.length - 1 - i}`,
          type: "bullish",
          startIndex: chronologicalData.length - 1 - i, // Convert back to original index
          startDate: c2.date,
          upperBound: c3.low,
          lowerBound: c1.high,
          filled: false
        });
      }
    }
    
    // Check for bearish FVG: Low of C1 > High of C3
    if (c1.low > c3.high) {
      const gapSize = c1.low - c3.high;
      const gapPercentage = (gapSize / avgPrice) * 100;
      
      // Check if gap is significant enough
      if (gapPercentage >= minGapSize) {
        gaps.push({
          id: `bearish-${chronologicalData.length - 1 - i}`,
          type: "bearish",
          startIndex: chronologicalData.length - 1 - i, // Convert back to original index
          startDate: c2.date,
          upperBound: c1.low,
          lowerBound: c3.high,
          filled: false
        });
      }
    }
  }
  
  console.log(`Found ${gaps.length} gaps: ${gaps.filter(g => g.type === 'bullish').length} bullish, ${gaps.filter(g => g.type === 'bearish').length} bearish`);
  
  // Check which gaps have been filled by subsequent price action
  for (const gap of gaps) {
    for (let i = gap.startIndex - 1; i >= 0; i--) {
      const candle = data[i];
      
      if (gap.type === "bullish") {
        // Bullish gap is filled if price trades below the lower bound
        if (candle.low <= gap.lowerBound) {
          gap.filled = true;
          gap.filledDate = candle.date;
          break;
        }
      } else {
        // Bearish gap is filled if price trades above the upper bound
        if (candle.high >= gap.upperBound) {
          gap.filled = true;
          gap.filledDate = candle.date;
          break;
        }
      }
    }
  }
  
  return gaps;
}
