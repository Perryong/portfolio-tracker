
import { toast } from "sonner";

// Alpha Vantage API key from environment variables
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "UU6UF3QUHV2OJ2DJ";

// Seeking Alpha API configuration
const SEEKING_ALPHA_API_KEY = "301a4fb04emshc3a8951e1a63c4ep19ba19jsn20a9ad345bb7";

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
 * Fetch historical data from Seeking Alpha API as fallback
 */
const fetchFromSeekingAlpha = async (symbol: string): Promise<TimeSeriesDataPoint[]> => {
  const currentDate = new Date().toISOString().split('T')[0];
  const url = `https://seeking-alpha.p.rapidapi.com/symbols/get-historical-prices?symbol=${symbol}&show_by=day&start=2025-01-01&end=${currentDate}&sort=as_of_date`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': SEEKING_ALPHA_API_KEY,
      'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com'
    }
  };

  console.log(`Fetching from Seeking Alpha API for ${symbol}`);
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`Seeking Alpha API request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Seeking Alpha API response:', data);
  
  // Check if we have data array
  if (!data || !data.data || !Array.isArray(data.data)) {
    console.error('Invalid Seeking Alpha response structure:', data);
    throw new Error("Invalid response format from Seeking Alpha API");
  }
  
  // Transform Seeking Alpha data to our format
  const transformedData = data.data
    .filter((item: any) => item && item.attributes)
    .map((item: any) => {
      const attrs = item.attributes;
      return {
        date: attrs.as_of_date,
        open: parseFloat(attrs.open) || 0,
        high: parseFloat(attrs.high) || 0,
        low: parseFloat(attrs.low) || 0,
        close: parseFloat(attrs.close) || 0,
        volume: parseInt(attrs.volume) || 0,
      };
    })
    .filter((point: TimeSeriesDataPoint) => 
      point.date && 
      !isNaN(point.open) && 
      !isNaN(point.high) && 
      !isNaN(point.low) && 
      !isNaN(point.close)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  console.log(`Processed ${transformedData.length} data points from Seeking Alpha`);
  return transformedData;
};

/**
 * Fetch historical daily stock data from Alpha Vantage with Seeking Alpha fallback
 */
export const fetchHistoricalStockData = async (
  symbol: string
): Promise<TimeSeriesDataPoint[]> => {
  try {
    // First, try Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    console.log(`Attempting to fetch from Alpha Vantage for ${symbol}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API request failed with status ${response.status}`);
    }
    
    const data: AlphaVantageTimeSeriesResponse = await response.json();
    
    // Check if we have an error message from Alpha Vantage
    if ("Error Message" in data) {
      throw new Error(data["Error Message" as keyof typeof data] as string);
    }
    
    // Check if we hit API call limit
    if ("Note" in data || "Information" in data) {
      console.log("Alpha Vantage API limit reached, falling back to Seeking Alpha");
      toast.warning("Alpha Vantage API limit reached. Switching to Seeking Alpha data.");
      return await fetchFromSeekingAlpha(symbol);
    }
    
    // If we have valid data, process it
    if ("Time Series (Daily)" in data) {
      const timeSeriesData = data["Time Series (Daily)"];
      
      const processedData = Object.entries(timeSeriesData)
        .map(([date, values]) => ({
          date,
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
          volume: parseInt(values["5. volume"], 10),
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log(`Successfully fetched ${processedData.length} data points from Alpha Vantage`);
      return processedData;
    }
    
    throw new Error("Invalid response format from Alpha Vantage API");
  } catch (error) {
    console.warn(`Alpha Vantage failed for ${symbol}:`, error);
    toast.warning(`Alpha Vantage failed. Trying Seeking Alpha for ${symbol}...`);
    
    try {
      // Fallback to Seeking Alpha
      const seekingAlphaData = await fetchFromSeekingAlpha(symbol);
      console.log(`Successfully fetched ${seekingAlphaData.length} data points from Seeking Alpha`);
      toast.success(`Successfully loaded data from Seeking Alpha for ${symbol}`);
      return seekingAlphaData;
    } catch (seekingAlphaError) {
      console.error(`Both APIs failed for ${symbol}:`, seekingAlphaError);
      toast.error(`Failed to fetch data from both Alpha Vantage and Seeking Alpha for ${symbol}`);
      throw new Error(`All data sources failed for ${symbol}`);
    }
  }
};

/**
 * Generate mock historical data for testing purposes (kept for extreme fallback)
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