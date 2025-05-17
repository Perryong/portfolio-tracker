
import { useQuery } from "@tanstack/react-query";
import { Asset, AssetWithPrice, AssetType, StockQuote, CryptoQuote } from "@/types";
import { fetchStockBatch } from "@/services/stockService";
import { fetchCryptoBatch } from "@/services/cryptoService";

export const useMarketPrices = (assets: Asset[], type: AssetType) => {
  const tickers = assets.map((asset) => asset.ticker);

  const { data: quotes, isLoading, error } = useQuery({
    queryKey: [`${type}-prices`, tickers],
    queryFn: async () => {
      if (tickers.length === 0) return {};
      
      if (type === "stock") {
        return await fetchStockBatch(tickers);
      } else {
        return await fetchCryptoBatch(tickers);
      }
    },
    enabled: tickers.length > 0,
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Transform the assets with the fetched market prices
  const assetsWithPrices: AssetWithPrice[] = assets.map((asset) => {
    let currentPrice = 0;
    let previousPrice = 0;
    let priceChange = 0;
    let priceChangePercent = 0;

    if (quotes && quotes[asset.ticker]) {
      if (type === "stock") {
        const quote = quotes[asset.ticker] as StockQuote;
        currentPrice = quote.c || 0;
        previousPrice = quote.pc || 0;
        priceChange = quote.d || 0;
        priceChangePercent = quote.dp || 0;
      } else {
        const quote = quotes[asset.ticker] as CryptoQuote;
        currentPrice = quote.price;
        priceChange = quote.price_change_24h;
        priceChangePercent = quote.price_change_percentage_24h;
        previousPrice = currentPrice - priceChange;
      }
    }

    const marketValue = asset.quantity * currentPrice;
    
    // Calculate P&L if avg cost is available
    let pnl: number | undefined;
    let pnlPercent: number | undefined;
    
    if (asset.avgCost !== undefined && asset.avgCost > 0) {
      pnl = marketValue - (asset.quantity * asset.avgCost);
      pnlPercent = (pnl / (asset.quantity * asset.avgCost)) * 100;
    }

    return {
      ...asset,
      currentPrice,
      previousPrice,
      priceChange,
      priceChangePercent,
      marketValue,
      pnl,
      pnlPercent,
    };
  });

  // Calculate portfolio summary
  const totalValue = assetsWithPrices.reduce((sum, asset) => sum + asset.marketValue, 0);
  
  const totalPreviousValue = assetsWithPrices.reduce(
    (sum, asset) => sum + (asset.previousPrice || asset.currentPrice) * asset.quantity, 
    0
  );
  
  const dailyChange = totalValue - totalPreviousValue;
  const dailyChangePercent = totalPreviousValue ? (dailyChange / totalPreviousValue) * 100 : 0;
  
  // Total P&L can only be calculated if all assets have avgCost
  const hasAllCostBasis = assetsWithPrices.every((asset) => asset.avgCost !== undefined);
  
  let totalPnL: number | undefined;
  let totalPnLPercent: number | undefined;
  
  if (hasAllCostBasis) {
    const totalCost = assetsWithPrices.reduce(
      (sum, asset) => sum + (asset.avgCost || 0) * asset.quantity, 
      0
    );
    
    totalPnL = totalValue - totalCost;
    totalPnLPercent = totalCost ? (totalPnL / totalCost) * 100 : 0;
  }

  return {
    assets: assetsWithPrices,
    isLoading,
    error,
    summary: {
      totalValue,
      dailyChange,
      dailyChangePercent,
      totalPnL,
      totalPnLPercent,
    },
  };
};
