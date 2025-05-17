
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency, formatPercent, isPositive, isNegative } from "@/lib/utils";

interface AssetCardProps {
  title: string;
  value: number | undefined;
  change?: number;
  changePercent?: number;
  isLoading?: boolean;
}

export function AssetCard({
  title,
  value = 0,
  change,
  changePercent,
  isLoading = false,
}: AssetCardProps) {
  // Determine colors based on change direction
  const changeColor = 
    change === undefined ? "" :
    isPositive(change) ? "text-profit" :
    isNegative(change) ? "text-loss" : "";
  
  const changeIcon = 
    change === undefined ? null :
    isPositive(change) ? <ArrowUp className="h-4 w-4" /> :
    isNegative(change) ? <ArrowDown className="h-4 w-4" /> : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-36 mb-1" />
            <Skeleton className="h-4 w-20" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {formatCurrency(value)}
            </div>
            
            {change !== undefined && changePercent !== undefined && (
              <div className={`text-xs flex items-center mt-1 ${changeColor}`}>
                {changeIcon}
                <span className="ml-1">
                  {formatCurrency(change)} ({formatPercent(changePercent)})
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
