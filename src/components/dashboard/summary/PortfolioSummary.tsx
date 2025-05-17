
import { AssetCard } from "@/components/dashboard/AssetCard";
import { AssetType } from "@/types";

interface PortfolioSummaryProps {
  totalValue: number;
  totalDailyChange: number;
  totalDailyChangePercent: number;
  totalPnL?: number;
  totalPnLPercent?: number;
  activeTab: AssetType;
  summary: {
    totalValue: number;
    dailyChange: number;
    dailyChangePercent: number;
  };
  isLoading: boolean;
  hasAllCostBasis: boolean;
  hasAssets: boolean;
}

export function PortfolioSummary({
  totalValue,
  totalDailyChange,
  totalDailyChangePercent,
  totalPnL,
  totalPnLPercent,
  activeTab,
  summary,
  isLoading,
  hasAllCostBasis,
  hasAssets,
}: PortfolioSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <AssetCard
        title="Total Portfolio Value"
        value={totalValue}
        isLoading={isLoading && hasAssets}
      />
      
      <AssetCard
        title="24 Hour Change"
        value={totalDailyChange}
        changePercent={totalDailyChangePercent}
        isLoading={isLoading && hasAssets}
      />
      
      {hasAllCostBasis && (
        <AssetCard
          title="Total P/L"
          value={totalPnL}
          changePercent={totalPnLPercent}
          isLoading={isLoading && hasAssets}
        />
      )}
      
      <AssetCard
        title={activeTab === "stock" ? "Stock Holdings" : "Crypto Holdings"}
        value={summary.totalValue}
        change={summary.dailyChange}
        changePercent={summary.dailyChangePercent}
        isLoading={isLoading && hasAssets}
      />
    </div>
  );
}
