
import { useState } from "react";
import { TechnicalIndicator, IndicatorParams } from "@/hooks/useTechnicalIndicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, SlidersVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface TechnicalIndicatorSelectorProps {
  indicators: TechnicalIndicator[];
  onToggleIndicator: (id: string) => void;
  onUpdateParams: (id: string, params: IndicatorParams) => void;
}

export function TechnicalIndicatorSelector({ 
  indicators, 
  onToggleIndicator, 
  onUpdateParams 
}: TechnicalIndicatorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group indicators by type for better organization
  const movingAverages = indicators.filter(i => i.type === "sma" || i.type === "ema");
  const oscillators = indicators.filter(i => i.type === "rsi" || i.type === "stoch" || i.type === "macd");
  const volatilityIndicators = indicators.filter(i => i.type === "bbands" || i.type === "atr" || i.type === "psar");
  const otherIndicators = indicators.filter(
    i => !["sma", "ema", "rsi", "stoch", "macd", "bbands", "atr", "psar"].includes(i.type)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Technical Indicators</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <SlidersVertical className="h-4 w-4" />
                  <span className="hidden sm:inline">Select Indicators</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Moving Averages</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {movingAverages.map((indicator) => (
                    <DropdownMenuCheckboxItem
                      key={indicator.id}
                      checked={indicator.enabled}
                      onCheckedChange={() => onToggleIndicator(indicator.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: indicator.color }} 
                        />
                        {indicator.name}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Oscillators</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {oscillators.map((indicator) => (
                    <DropdownMenuCheckboxItem
                      key={indicator.id}
                      checked={indicator.enabled}
                      onCheckedChange={() => onToggleIndicator(indicator.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: indicator.color }} 
                        />
                        {indicator.name}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Volatility</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {volatilityIndicators.map((indicator) => (
                    <DropdownMenuCheckboxItem
                      key={indicator.id}
                      checked={indicator.enabled}
                      onCheckedChange={() => onToggleIndicator(indicator.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: indicator.color }} 
                        />
                        {indicator.name}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                
                {otherIndicators.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Other Indicators</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {otherIndicators.map((indicator) => (
                        <DropdownMenuCheckboxItem
                          key={indicator.id}
                          checked={indicator.enabled}
                          onCheckedChange={() => onToggleIndicator(indicator.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: indicator.color }} 
                            />
                            {indicator.name}
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indicators.map((indicator) => (
                <div 
                  key={indicator.id} 
                  className="flex p-3 border rounded-md"
                  style={{ borderLeftColor: indicator.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: indicator.color }} 
                      />
                      <Label htmlFor={`indicator-${indicator.id}`} className="font-medium">
                        {indicator.name}
                      </Label>
                    </div>
                    <Switch 
                      id={`indicator-${indicator.id}`} 
                      checked={indicator.enabled}
                      onCheckedChange={() => onToggleIndicator(indicator.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
