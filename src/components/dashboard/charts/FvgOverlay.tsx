
import React, { useEffect, useState, useRef } from "react";
import { TechnicalIndicator } from "@/hooks/useTechnicalIndicators";
import { TimeSeriesDataPoint } from "@/services/alphaVantageService";
import { useFvgDetection } from "@/hooks/useFvgDetection";

interface FvgOverlayProps {
  data: TimeSeriesDataPoint[];
  fvgIndicators: TechnicalIndicator[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export const FvgOverlay: React.FC<FvgOverlayProps> = ({ 
  data, 
  fvgIndicators,
  containerRef 
}) => {
  const { fvgGaps } = useFvgDetection(data, fvgIndicators);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [visibleBarCount, setVisibleBarCount] = useState(0);
  const [candleWidth, setCandleWidth] = useState(5);
  const [dataLength, setDataLength] = useState(0);
  
  // Debug
  useEffect(() => {
    console.log(`FVG Overlay: ${fvgGaps.length} gaps detected, ${fvgIndicators.length} indicators, ${fvgIndicators.filter(i => i.enabled).length} enabled`);
    if (fvgGaps.length > 0) {
      console.log("Sample FVG:", fvgGaps[0]);
    }
  }, [fvgGaps, fvgIndicators]);

  // Set data length for calculations
  useEffect(() => {
    if (data && data.length) {
      setDataLength(data.length);
    }
  }, [data]);
  
  // Update dimensions when container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        // Get the actual chart area, not just the container
        const chartElement = containerRef.current.querySelector('div[class^="chart-markup-table"]') || 
                             containerRef.current.querySelector('div[class^="chart-container"]') ||
                             containerRef.current.querySelector('div[class^="chart-wrapper"]');
                               
        if (chartElement) {
          const { width, height } = chartElement.getBoundingClientRect();
          setDimensions({ width, height });
          
          // Calculate approximate candle width based on chart width and data length
          const estimatedCandleWidth = Math.max(width / (dataLength * 1.5), 5);
          setCandleWidth(estimatedCandleWidth);
          
          // Calculate visible bars
          const visibleBars = Math.floor(width / estimatedCandleWidth);
          setVisibleBarCount(visibleBars);
          
          // Set initialized to true only when we've found the chart element
          if (!isInitialized) setIsInitialized(true);
          
          console.log(`FVG Overlay dimensions updated: ${width}x${height}, candleWidth: ${estimatedCandleWidth}, visibleBars: ${visibleBars}`);
        } else if (containerRef.current) {
          // Fallback to container dimensions
          const { width, height } = containerRef.current.getBoundingClientRect();
          setDimensions({ width, height });
          console.log(`FVG Overlay using fallback dimensions: ${width}x${height}`);
        }
      }
    };
    
    // Run initial update
    updateDimensions();
    
    // Setup observer for resize events
    const resizeObserver = new ResizeObserver(() => {
      console.log("Resize observed in FVG Overlay");
      updateDimensions();
    });
    
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    // Setup a MutationObserver to watch for when the chart actually renders
    const mutationObserver = new MutationObserver(() => {
      console.log("DOM mutation observed in FVG Overlay");
      updateDimensions();
    });
    
    if (containerRef.current) {
      mutationObserver.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }
    
    // Also update when the window resizes
    window.addEventListener('resize', updateDimensions);
    
    // Calculate price range on initial load and when data changes
    if (data.length > 0) {
      const prices = data.flatMap(d => [d.high, d.low]);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange({
        min: minPrice,
        max: maxPrice
      });
      console.log(`FVG Overlay price range: ${minPrice} - ${maxPrice}`);
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
        mutationObserver.disconnect();
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [containerRef, data, isInitialized, dataLength]);

  // Calculate position for a gap
  const calculatePosition = (gap) => {
    const { width, height } = dimensions;
    const { min, max } = priceRange;
    const priceRange1 = max - min;
    
    if (width <= 0 || height <= 0 || priceRange1 <= 0) return null;
    
    // Find the candle corresponding to this gap
    const candleIndex = data.findIndex(d => d.date === gap.startDate);
    if (candleIndex === -1) return null;
    
    // Calculate x position - initially in the middle of the candle
    let x = width - ((data.length - candleIndex) * candleWidth);
    
    // Adjust x position if we know the visible bar count
    if (visibleBarCount > 0) {
      // Calculate visible data window (most recent X candles)
      const dataOffset = Math.max(0, data.length - visibleBarCount);
      
      // Check if this gap is in the visible range
      if (candleIndex < dataOffset) {
        return null; // Gap is out of view
      }
      
      // Calculate x position based on visible range
      // This positions the gap at the center of the candle
      x = (candleIndex - dataOffset) * (width / visibleBarCount);
    }
    
    // Calculate y positions for upper and lower bounds (price coordinates)
    // Map price to y-coordinate (reversed, as y-axis is inverted in charts)
    const upperY = height - ((gap.upperBound - min) / priceRange1) * height;
    const lowerY = height - ((gap.lowerBound - min) / priceRange1) * height;
    
    // Make the height at least 2px to ensure visibility
    const rectHeight = Math.max(Math.abs(upperY - lowerY), 2);
    
    // Adjust width to ensure visibility
    const rectWidth = Math.max(candleWidth * 2, 10);
    
    return {
      x: x - (rectWidth / 2), // Center on candle
      y: Math.min(upperY, lowerY),
      width: rectWidth,
      height: rectHeight
    };
  };
  
  // Position the overlay to match TradingView chart
  useEffect(() => {
    if (overlayRef.current && containerRef.current && isInitialized) {
      // Find the chart area within the TradingView widget
      const chartArea = containerRef.current.querySelector('div[class^="chart-markup-table"]') || 
                        containerRef.current.querySelector('div[class^="chart-container"]') ||
                        containerRef.current.querySelector('div[class^="chart-wrapper"]');
      
      if (chartArea) {
        const chartRect = chartArea.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Position the overlay exactly on top of the chart area
        overlayRef.current.style.position = 'absolute';
        overlayRef.current.style.top = `${chartRect.top - containerRect.top}px`;
        overlayRef.current.style.left = `${chartRect.left - containerRect.left}px`;
        overlayRef.current.style.width = `${chartRect.width}px`;
        overlayRef.current.style.height = `${chartRect.height}px`;
        overlayRef.current.style.pointerEvents = 'none';
        overlayRef.current.style.zIndex = '10'; // Ensure it's above the chart
        console.log('FVG Overlay positioned on chart area');
      } else {
        // Fallback to cover the entire container
        overlayRef.current.style.position = 'absolute';
        overlayRef.current.style.top = '0';
        overlayRef.current.style.left = '0';
        overlayRef.current.style.width = '100%';
        overlayRef.current.style.height = '100%';
        overlayRef.current.style.pointerEvents = 'none';
        overlayRef.current.style.zIndex = '10';
        console.log('FVG Overlay using fallback positioning');
      }
    }
  }, [containerRef, dimensions, isInitialized]);

  // If no gaps or container, don't render anything
  if (!fvgGaps.length || !containerRef.current) {
    return null;
  }

  return (
    <div ref={overlayRef} className="fvg-overlay">
      <svg width="100%" height="100%">
        {fvgGaps.map((gap, index) => {
          const position = calculatePosition(gap);
          if (!position) return null;
          
          const { x, y, width, height } = position;
          const opacity = gap.filled ? 0.2 : 0.45;
          const color = gap.color || (gap.type === "bullish" ? "#22C55E" : "#EF4444");
          
          return (
            <rect
              key={gap.id}
              x={x}
              y={y}
              width={width}
              height={height}
              fill={color}
              fillOpacity={opacity}
              stroke={color}
              strokeOpacity={0.6}
              strokeWidth={1}
              strokeDasharray={gap.filled ? "5,5" : "none"}
            />
          );
        })}
      </svg>
    </div>
  );
};
