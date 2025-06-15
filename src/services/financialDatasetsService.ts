
export interface FinancialSnapshot {
  ticker: string;
  market_cap: number;
  enterprise_value: number;
  price_to_earnings_ratio: number;
  price_to_book_ratio: number;
  price_to_sales_ratio: number;
  enterprise_value_to_ebitda_ratio: number;
  enterprise_value_to_revenue_ratio: number;
  free_cash_flow_yield: number;
  peg_ratio: number;
  gross_margin: number;
  operating_margin: number;
  net_margin: number;
  return_on_equity: number;
  return_on_assets: number;
  return_on_invested_capital: number;
  asset_turnover: number;
  inventory_turnover: number;
  receivables_turnover: number;
  days_sales_outstanding: number;
  operating_cycle: number;
  working_capital_turnover: number;
  current_ratio: number;
  quick_ratio: number;
  cash_ratio: number;
  operating_cash_flow_ratio: number;
  debt_to_equity: number;
  debt_to_assets: number;
  interest_coverage: number | null;
  revenue_growth: number;
  earnings_growth: number;
  book_value_growth: number;
  earnings_per_share_growth: number;
  free_cash_flow_growth: number;
  operating_income_growth: number;
  ebitda_growth: number;
  payout_ratio: number;
  earnings_per_share: number;
  book_value_per_share: number;
  free_cash_flow_per_share: number;
}

export const fetchFinancialData = async (ticker: string): Promise<FinancialSnapshot> => {
  console.log(`Attempting to fetch financial data for ${ticker}`);
  
  try {
    // Use the Supabase Edge Function with proper authorization
    const functionUrl = `https://omkhpyvxcgsyuiuhnxom.supabase.co/functions/v1/financial-data?ticker=${ticker}`;
    console.log('Edge Function URL:', functionUrl);
    
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      }
    };
    
    console.log('Request options:', options);

    const response = await fetch(functionUrl, options);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      console.error(`Edge Function request failed with status ${response.status}: ${response.statusText}`);
      
      // Try to get more error details
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      
      throw new Error(`Edge Function request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data: FinancialSnapshot = await response.json();
    console.log('Received financial data:', data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching financial data for ${ticker}:`, error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('This appears to be a network error.');
      throw new Error('Unable to fetch financial data due to network issues. Please check your connection and try again.');
    }
    
    throw error;
  }
};

// Calculate intrinsic value using DCF model with the new snapshot data
export const calculateIntrinsicValue = (snapshot: FinancialSnapshot): number => {
  console.log('Calculating intrinsic value with snapshot:', snapshot);
  
  if (!snapshot.free_cash_flow_per_share || !snapshot.market_cap) {
    console.log('Missing required data for intrinsic value calculation:', {
      free_cash_flow_per_share: snapshot.free_cash_flow_per_share,
      market_cap: snapshot.market_cap
    });
    return 0;
  }
  
  // Estimate shares outstanding from market cap and book value per share
  const estimatedShares = snapshot.book_value_per_share > 0 
    ? snapshot.market_cap / (snapshot.book_value_per_share * snapshot.price_to_book_ratio || 1)
    : 1000000; // Default fallback
  
  console.log('Estimated shares outstanding:', estimatedShares);
  
  const freeCashFlow = snapshot.free_cash_flow_per_share * estimatedShares;
  console.log('Free cash flow:', freeCashFlow);
  
  if (!freeCashFlow || freeCashFlow <= 0) {
    console.log('Invalid free cash flow:', freeCashFlow);
    return 0;
  }
  
  // Use actual growth rates from the data (convert from decimal to percentage)
  const revenueGrowthRate = Math.max(0, Math.min(0.15, snapshot.revenue_growth)); // Already in decimal
  const fcfGrowthRate = Math.max(0, Math.min(0.15, snapshot.free_cash_flow_growth)); // Already in decimal
  const avgGrowthRate = (revenueGrowthRate + fcfGrowthRate) / 2;
  
  console.log('Growth rates:', {
    revenueGrowthRate,
    fcfGrowthRate,
    avgGrowthRate
  });
  
  // Use market-based discount rate
  const riskFreeRate = 0.04; // 4% risk-free rate
  const marketRiskPremium = 0.06; // 6% market risk premium
  const beta = Math.max(0.5, Math.min(2.0, snapshot.debt_to_equity || 1)); // Use D/E as proxy for beta
  const discountRate = riskFreeRate + (beta * marketRiskPremium);
  
  console.log('Discount rate components:', {
    riskFreeRate,
    marketRiskPremium,
    beta,
    discountRate
  });
  
  const terminalGrowthRate = 0.025; // 2.5% terminal growth rate
  const years = 5;
  
  let presentValue = 0;
  
  // Calculate present value of projected cash flows
  for (let i = 1; i <= years; i++) {
    const projectedCashFlow = freeCashFlow * Math.pow(1 + avgGrowthRate, i);
    const discountedCashFlow = projectedCashFlow / Math.pow(1 + discountRate, i);
    presentValue += discountedCashFlow;
    console.log(`Year ${i}: Projected CF: ${projectedCashFlow}, Discounted: ${discountedCashFlow}`);
  }
  
  console.log('Present value of projected cash flows:', presentValue);
  
  // Calculate terminal value
  const terminalCashFlow = freeCashFlow * Math.pow(1 + avgGrowthRate, years + 1);
  const terminalValue = terminalCashFlow / (discountRate - terminalGrowthRate);
  const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, years);
  
  console.log('Terminal value components:', {
    terminalCashFlow,
    terminalValue,
    discountedTerminalValue
  });
  
  const totalValue = presentValue + discountedTerminalValue;
  const intrinsicValuePerShare = totalValue / estimatedShares;
  
  console.log('Final calculation:', {
    totalValue,
    estimatedShares,
    intrinsicValuePerShare
  });
  
  return intrinsicValuePerShare;
};