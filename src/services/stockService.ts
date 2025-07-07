import { StockQuote } from "@/types";

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || "d0flj01r01qr6dbsrc00d0flj01r01qr6dbsrc0g";

export const fetchStockPrice = async (symbol: string): Promise<StockQuote> => {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return {
      c: data.c, // Current price
      d: data.d, // Change
      dp: data.dp, // Percent change
      h: data.h, // High price of the day
      l: data.l, // Low price of the day
      o: data.o, // Open price of the day
      pc: data.pc, // Previous close price
    };
  } catch (error) {
    console.warn(`Error fetching ${symbol} stock data, using mock data instead:`, error);
    return mockStockData(symbol);
  }
};

export const fetchStockBatch = async (symbols: string[]): Promise<Record<string, StockQuote>> => {
  try {
    const promises = symbols.map(async (symbol) => {
      const quote = await fetchStockPrice(symbol);
      return { symbol, quote };
    });
    
    const results = await Promise.all(promises);
    
    const resultMap: Record<string, StockQuote> = {};
    results.forEach(({ symbol, quote }) => {
      resultMap[symbol] = quote;
    });
    
    return resultMap;
  } catch (error) {
    console.warn("Error fetching batch stock data, using mock data instead:", error);
    const resultMap: Record<string, StockQuote> = {};
    symbols.forEach((symbol) => {
      resultMap[symbol] = mockStockData(symbol);
    });
    return resultMap;
  }
};

export interface StockSearchResult {
  ticker: string;
  name: string;
  type: string;
  exchange: string;
}

export const searchStockSymbols = async (query: string): Promise<StockSearchResult[]> => {
  if (!query || query.length < 1) {
    return [];
  }
  
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.result.map((item: any) => ({
      ticker: item.symbol,
      name: item.description,
      type: "stock",
      exchange: item.type
    })).filter((item: StockSearchResult) => 
      // Filter out non-stock items or weird symbols
      item.type === "stock" && 
      item.ticker && 
      !item.ticker.includes('.') && 
      item.name
    ).slice(0, 20); // Limit to 20 results
    
  } catch (error) {
    console.warn("Error searching for stock symbols:", error);
    return [];
  }
};

export const validateStockSymbol = async (symbol: string): Promise<{valid: boolean, name?: string}> => {
  try {
    // First, try to fetch the stock price - if it returns valid data, the symbol exists
    const price = await fetchStockPrice(symbol);
    if (price && price.c > 0) {
      // Try to get the company name via search
      const searchResults = await searchStockSymbols(symbol);
      const exactMatch = searchResults.find(result => 
        result.ticker.toUpperCase() === symbol.toUpperCase()
      );
      
      return { 
        valid: true, 
        name: exactMatch ? exactMatch.name : `${symbol} Stock`
      };
    }
    return { valid: false };
  } catch (error) {
    console.warn(`Error validating stock symbol ${symbol}:`, error);
    return { valid: false };
  }
};

const mockStockData = (symbol: string): StockQuote => {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const basePrice = (hash % 1000) + 10;
  const changePercent = ((hash % 21) - 10) / 10;
  const change = basePrice * changePercent / 100;
  
  return {
    c: basePrice,
    d: change,
    dp: changePercent,
    h: basePrice * 1.02,
    l: basePrice * 0.98,
    o: basePrice * 0.99,
    pc: basePrice - change,
  };
};

export const popularStocks = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corporation" },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "AMZN", name: "Amazon.com, Inc." },
  { ticker: "META", name: "Meta Platforms, Inc." },
  { ticker: "TSLA", name: "Tesla, Inc." },
  { ticker: "NVDA", name: "NVIDIA Corporation" },
  { ticker: "NFLX", name: "Netflix, Inc." },
  { ticker: "AMD", name: "Advanced Micro Devices, Inc." }
];

export const popularIndicesAndETFs = [
  // Major Indices
  { ticker: "^GSPC", name: "S&P 500 Index", type: "index" },
  { ticker: "^IXIC", name: "NASDAQ Composite", type: "index" },
  { ticker: "^DJI", name: "Dow Jones Industrial Average", type: "index" },
  
  // Popular ETFs
  { ticker: "SPY", name: "SPDR S&P 500 ETF Trust", type: "etf" },
  { ticker: "VOO", name: "Vanguard S&P 500 ETF", type: "etf" },
  { ticker: "QQQ", name: "Invesco QQQ ETF", type: "etf" },
  { ticker: "VTI", name: "Vanguard Total Stock Market ETF", type: "etf" },
  { ticker: "VEA", name: "Vanguard Developed Markets ETF", type: "etf" },
  
  // Specialty Funds
  { ticker: "FUNDSMITH", name: "Fundsmith Equity Fund", type: "fund" }
];
