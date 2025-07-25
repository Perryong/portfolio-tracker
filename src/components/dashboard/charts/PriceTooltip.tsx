
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TechnicalIndicator } from "@/hooks/useTechnicalIndicators";

interface PriceTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  indicators?: TechnicalIndicator[];
}

export function PriceTooltip({ active, payload, label, indicators = [] }: PriceTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Get active indicators
    const activeIndicators = indicators.filter(i => i.enabled);
    
    return (
      <div className="bg-background border border-border/50 p-2 rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        <div className="mb-2">
          <p>Open: {formatCurrency(data.open)}</p>
          <p>High: {formatCurrency(data.high)}</p>
          <p>Low: {formatCurrency(data.low)}</p>
          <p>Close: {formatCurrency(data.close)}</p>
          <p>Volume: {formatNumber(data.volume)}</p>
        </div>
        
        {activeIndicators.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <p className="font-medium mb-1">Indicators:</p>
            {activeIndicators.map(indicator => {
              if (indicator.type === "bbands") {
                return (
                  <div key={indicator.id} className="flex flex-col gap-1">
                    <p style={{ color: indicator.color }}>
                      {indicator.name} Upper: {formatCurrency(data[`${indicator.id}-upper`] || 0)}
                    </p>
                    <p style={{ color: indicator.color }}>
                      {indicator.name} Middle: {formatCurrency(data[`${indicator.id}-middle`] || 0)}
                    </p>
                    <p style={{ color: indicator.color }}>
                      {indicator.name} Lower: {formatCurrency(data[`${indicator.id}-lower`] || 0)}
                    </p>
                  </div>
                );
              } else if (indicator.type === "macd") {
                return (
                  <div key={indicator.id} className="flex flex-col gap-1">
                    <p style={{ color: indicator.color }}>
                      {indicator.name}: {formatCurrency(data[`${indicator.id}-value`] || 0)}
                    </p>
                    <p style={{ color: "#FF9500" }}>
                      Signal: {formatCurrency(data[`${indicator.id}-signal`] || 0)}
                    </p>
                    <p style={{ color: data[`${indicator.id}-histogram`] > 0 ? "#4CAF50" : "#FF5252" }}>
                      Histogram: {formatCurrency(data[`${indicator.id}-histogram`] || 0)}
                    </p>
                  </div>
                );
              } else if (indicator.type === "rsi") {
                const rsiValue = data[indicator.id];
                let rsiStatus = "";
                if (rsiValue > 70) rsiStatus = " (Overbought)";
                else if (rsiValue < 30) rsiStatus = " (Oversold)";
                
                return (
                  <p key={indicator.id} style={{ color: indicator.color }}>
                    {indicator.name}: {rsiValue?.toFixed(2) || "N/A"}
                    <span className={rsiValue > 70 ? "text-red-500" : rsiValue < 30 ? "text-green-500" : ""}>
                      {rsiStatus}
                    </span>
                  </p>
                );
              } else {
                return (
                  <p key={indicator.id} style={{ color: indicator.color }}>
                    {indicator.name}: {formatCurrency(data[indicator.id] || 0)}
                  </p>
                );
              }
            })}
          </div>
        )}
      </div>
    );
  }
  
  return null;
}
