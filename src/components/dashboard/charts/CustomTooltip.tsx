
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TechnicalIndicator } from "@/hooks/useTechnicalIndicators";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  indicators?: TechnicalIndicator[];
}

export function CustomTooltip({ active, payload, label, indicators = [] }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Get active indicators that should be shown on OHLC chart
    const activeIndicators = indicators.filter(i => i.enabled && (i.type === "sma" || i.type === "ema" || i.type === "bbands"));
    
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
