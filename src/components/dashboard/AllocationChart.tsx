
import { AssetWithPrice } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

interface AllocationChartProps {
  assets: AssetWithPrice[];
  isLoading: boolean;
}

// Generate a deterministic color based on ticker
const getColor = (ticker: string): string => {
  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#6366F1", // Indigo
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#8B5CF6", // Violet
    "#14B8A6", // Teal
    "#F43F5E", // Rose
    "#84CC16", // Lime
    "#06B6D4", // Cyan
    "#D946EF", // Fuchsia
    "#F97316", // Orange
    "#0EA5E9", // Sky
    "#4F46E5", // Indigo
    "#22C55E", // Green
  ];
  
  // Hash the ticker to get a consistent index
  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function AllocationChart({ assets, isLoading }: AllocationChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    if (assets.length === 0) return [];
    
    // Group small allocations into "Other"
    const totalValue = assets.reduce((sum, asset) => sum + asset.marketValue, 0);
    const threshold = totalValue * 0.03; // Assets less than 3% will be grouped
    
    const significantAssets: { name: string; value: number }[] = [];
    let otherValue = 0;
    
    assets.forEach((asset) => {
      if (asset.marketValue >= threshold) {
        significantAssets.push({
          name: asset.ticker,
          value: asset.marketValue,
        });
      } else {
        otherValue += asset.marketValue;
      }
    });
    
    // Add "Other" category if needed
    if (otherValue > 0) {
      significantAssets.push({
        name: "Other",
        value: otherValue,
      });
    }
    
    return significantAssets;
  }, [assets]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const percentage = ((value / assets.reduce((sum, asset) => sum + asset.marketValue, 0)) * 100).toFixed(2);
      
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md">
          <p className="font-bold">{name}</p>
          <p>{formatCurrency(value)}</p>
          <p>{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Skeleton className="h-64 w-64 rounded-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No assets to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                dataKey="value"
                nameKey="name"
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === "Other" ? "#94a3b8" : getColor(entry.name)}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
