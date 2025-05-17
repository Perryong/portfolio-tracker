import { toast } from "sonner";

// Alpha Vantage API key from environment variables
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "UU6UF3QUHV2OJ2DJ";

export interface TimeSeriesDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AlphaVantageTimeSeriesResponse {
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Output Size": string;
    "5. Time Zone": string;
  };
  "Time Series (Daily)": Record<
    string,
    {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    }
  >;
}

/**
 * Fetch historical daily stock data from Alpha Vantage
 */
export const fetchHistoricalStockData = async (
  symbol: string
): Promise<TimeSeriesDataPoint[]> => {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: AlphaVantageTimeSeriesResponse = await response.json();
    
    // Check if we have an error message from Alpha Vantage
    if ("Error Message" in data) {
      throw new Error(data["Error Message" as keyof typeof data] as string);
    }
    
    // Check if we hit API call limit
    if ("Note" in data) {
      toast.warning("API call frequency limit reached. Using mock data.");
      return mockHistoricalData(symbol);
    }
    
    // If we have valid data, process it
    if ("Time Series (Daily)" in data) {
      const timeSeriesData = data["Time Series (Daily)"];
      
      return Object.entries(timeSeriesData)
        .map(([date, values]) => ({
          date,
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
          volume: parseInt(values["5. volume"], 10),
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    throw new Error("Invalid response format from Alpha Vantage API");
  } catch (error) {
    console.warn(`Error fetching historical data for ${symbol}:`, error);
    toast.error(`Failed to fetch historical data for ${symbol}`);
    return mockHistoricalData(symbol);
  }
};

/**
 * Generate mock historical data for testing purposes
 */
const mockHistoricalData = (symbol: string): TimeSeriesDataPoint[] => {
  const basePrice = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000 + 50;
  const volatility = (symbol.length % 5) + 1;
  const data: TimeSeriesDataPoint[] = [];
  
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dayOffset = Math.sin(i / 5) * volatility;
    const open = basePrice + dayOffset + Math.random() * volatility;
    const close = open + (Math.random() - 0.5) * volatility * 2;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    
    data.push({
      date: dateString,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
  }
  
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
