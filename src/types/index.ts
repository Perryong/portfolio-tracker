export type AssetType = 'stock' | 'crypto';

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  quantity: number;
  avgCost?: number;
}

export interface AssetWithPrice extends Asset {
  currentPrice: number;
  previousPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  marketValue: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface PortfolioSummary {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  totalPnL?: number;
  totalPnLPercent?: number;
}

export interface StockQuote {
  c?: number;
  d?: number;
  dp?: number;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
  marketCap?: number;
  peRatio?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  volume?: number;
}

export interface CryptoQuote {
  price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap?: number;
  volume_24h?: number;
}

export interface APIResponse<T> {
  data?: T;
  loading: boolean;
  error: Error | null;
}