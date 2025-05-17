
import { useState, useEffect } from "react";
import { TimeSeriesDataPoint } from "@/services/alphaVantageService";
import { detectFairValueGaps, FairValueGap } from "@/services/fvgDetectionService";
import { TechnicalIndicator } from "@/hooks/useTechnicalIndicators";

export function useFvgDetection(
  data: TimeSeriesDataPoint[],
  fvgIndicators: TechnicalIndicator[]
) {
  const [fvgGaps, setFvgGaps] = useState<FairValueGap[]>([]);
  
  useEffect(() => {
    if (!data?.length || !fvgIndicators?.length) {
      setFvgGaps([]);
      return;
    }
    
    // Skip if no indicators are enabled
    const enabledIndicators = fvgIndicators.filter(ind => ind.enabled);
    if (enabledIndicators.length === 0) {
      setFvgGaps([]);
      return;
    }
    
    console.log(`Processing ${enabledIndicators.length} enabled FVG indicators`);
    
    const allGaps: FairValueGap[] = [];
    
    // Process each active FVG indicator
    enabledIndicators.forEach(indicator => {
      // Use optional chaining and default values for the potentially missing properties
      const minGapSize = indicator.params.minGapSize ?? 0.1;
      const minCandleSize = indicator.params.minCandleSize ?? 0.2;
      const showBullish = indicator.params.showBullish ?? true;
      const showBearish = indicator.params.showBearish ?? true;
      
      console.log(`Detecting gaps for ${indicator.name}:`, {
        minGapSize, 
        minCandleSize, 
        showBullish, 
        showBearish
      });
      
      // Detect gaps with parameters from the indicator
      const gaps = detectFairValueGaps(data, minGapSize, minCandleSize);
      console.log(`Found ${gaps.length} gaps before filtering`);
      
      // Filter by type based on indicator settings
      const filteredGaps = gaps.filter(gap => 
        (showBullish && gap.type === "bullish") || 
        (showBearish && gap.type === "bearish")
      );
      
      console.log(`After filtering: ${filteredGaps.length} gaps match criteria`);
      
      // Add color and metadata from the indicator
      const enhancedGaps = filteredGaps.map(gap => ({
        ...gap,
        indicatorId: indicator.id,
        color: indicator.color
      }));
      
      allGaps.push(...enhancedGaps);
    });
    
    setFvgGaps(allGaps);
    console.log(`Total FVG gaps detected: ${allGaps.length}`);
  }, [data, fvgIndicators]);
  
  return { fvgGaps };
}
