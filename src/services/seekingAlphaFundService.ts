
import { FundMetrics } from '@/types';

const RAPIDAPI_KEY = '301a4fb04emshc3a8951e1a63c4ep19ba19jsn20a9ad345bb7';

export interface SeekingAlphaFundData {
  symbol: string;
  name: string;
  nav?: number;
  expenseRatio?: number;
  data?: {
    id: string;
    type: string;
    attributes: {
      name: string;
      price?: number;
      expense_ratio?: number;
      nav?: number;
      top_holdings?: Array<{
        symbol: string;
        name: string;
        weight: number;
      }>;
      sector_breakdown?: Array<{
        sector: string;
        weight: number;
      }>;
      geographic_exposure?: Array<{
        region: string;
        weight: number;
      }>;
      performance?: {
        one_year?: number;
        three_year?: number;
        five_year?: number;
      };
      risk_metrics?: {
        beta?: number;
        sharpe_ratio?: number;
        max_drawdown?: number;
      };
    };
  };
}

export const fetchSeekingAlphaFundData = async (symbol: string): Promise<SeekingAlphaFundData | null> => {
  console.log(`Fetching fund data from Seeking Alpha for: ${symbol}`);
  
  try {
    const response = await fetch(`https://seeking-alpha.p.rapidapi.com/symbols/get-summary?symbols=${symbol}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Seeking Alpha fund data response:', data);
    
    if (data.data && data.data.length > 0) {
      const fundData = data.data[0];
      return {
        symbol,
        name: fundData.attributes?.name || `${symbol} Fund`,
        nav: fundData.attributes?.nav || fundData.attributes?.price,
        expenseRatio: fundData.attributes?.expense_ratio,
        data: fundData
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching Seeking Alpha fund data for ${symbol}:`, error);
    return null;
  }
};

export const transformSeekingAlphaToFundMetrics = (
  seekingAlphaData: SeekingAlphaFundData,
  currentPrice: number
): FundMetrics => {
  const attributes = seekingAlphaData.data?.attributes;
  const nav = seekingAlphaData.nav || currentPrice;
  
  // Calculate NAV premium/discount
  const navPremiumDiscount = nav ? ((currentPrice - nav) / nav) * 100 : 0;
  
  return {
    navPremiumDiscount,
    expenseRatio: attributes?.expense_ratio || seekingAlphaData.expenseRatio || 0.75, // Default for mutual funds
    topHoldings: attributes?.top_holdings || [
      { symbol: 'N/A', name: 'Holdings data not available', weight: 0 }
    ],
    sectorBreakdown: attributes?.sector_breakdown || [
      { sector: 'Mixed Assets', weight: 100 }
    ],
    geographicExposure: attributes?.geographic_exposure || [
      { region: 'United States', weight: 100 }
    ],
    performanceVsBenchmark: {
      oneYear: attributes?.performance?.one_year || 0,
      threeYear: attributes?.performance?.three_year || 0,
      fiveYear: attributes?.performance?.five_year || 0
    },
    riskMetrics: {
      beta: attributes?.risk_metrics?.beta || 1.0,
      sharpeRatio: attributes?.risk_metrics?.sharpe_ratio || 0.5,
      maxDrawdown: attributes?.risk_metrics?.max_drawdown || -20.0
    }
  };
};
