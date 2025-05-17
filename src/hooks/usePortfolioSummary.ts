
import { useState } from "react";
import { AssetType, Asset, AssetWithPrice } from "@/types";
import { useMarketPrices } from "@/hooks/useMarketPrices";

export function usePortfolioSummary(assets: Asset[]) {
  const [activeTab, setActiveTab] = useState<AssetType>("stock");
  
  // Get assets of the current type
  const currentAssets = assets.filter(asset => asset.type === activeTab);
  
  // Fetch market data for the current asset type
  const { assets: assetsWithPrices, isLoading, summary } = useMarketPrices(
    currentAssets,
    activeTab
  );
  
  // Get all assets for the pie chart
  const stockAssets = useMarketPrices(assets.filter(a => a.type === "stock"), "stock").assets;
  const cryptoAssets = useMarketPrices(assets.filter(a => a.type === "crypto"), "crypto").assets;
  const allAssetsWithPrices = [...stockAssets, ...cryptoAssets];
  
  // Calculate portfolio summary
  const totalValue = allAssetsWithPrices.reduce((sum, asset) => sum + asset.marketValue, 0);
  const totalDailyChange = allAssetsWithPrices.reduce((sum, asset) => {
    const prevValue = (asset.previousPrice || asset.currentPrice) * asset.quantity;
    const currentValue = asset.currentPrice * asset.quantity;
    return sum + (currentValue - prevValue);
  }, 0);
  
  const totalDailyChangePercent = 
    totalValue - totalDailyChange !== 0 
      ? (totalDailyChange / (totalValue - totalDailyChange)) * 100 
      : 0;
      
  // Calculate total P/L if all assets have cost basis
  const hasAllCostBasis = allAssetsWithPrices.every((asset) => asset.avgCost !== undefined);
  
  let totalPnL: number | undefined;
  let totalPnLPercent: number | undefined;
  
  if (hasAllCostBasis) {
    const totalCost = allAssetsWithPrices.reduce(
      (sum, asset) => sum + (asset.avgCost || 0) * asset.quantity, 
      0
    );
    
    totalPnL = totalValue - totalCost;
    totalPnLPercent = totalCost ? (totalPnL / totalCost) * 100 : 0;
  }

  return {
    activeTab,
    setActiveTab,
    assetsWithPrices,
    allAssetsWithPrices,
    isLoading,
    summary,
    totalValue,
    totalDailyChange,
    totalDailyChangePercent,
    hasAllCostBasis,
    totalPnL,
    totalPnLPercent
  };
}
