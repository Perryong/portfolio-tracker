
import { AssetType } from '@/types';

export interface AssetClassification {
  type: AssetType;
  name: string;
  category: string;
  description: string;
}

// Popular index symbols and their mappings
const INDEX_SYMBOLS = {
  '^GSPC': { name: 'S&P 500', category: 'US Large Cap' },
  '^IXIC': { name: 'NASDAQ Composite', category: 'US Technology' },
  '^DJI': { name: 'Dow Jones Industrial Average', category: 'US Large Cap' },
  '^RUT': { name: 'Russell 2000', category: 'US Small Cap' },
  'SPY': { name: 'SPDR S&P 500 ETF', category: 'US Large Cap ETF' },
  'QQQ': { name: 'Invesco QQQ ETF', category: 'US Technology ETF' },
  'VTI': { name: 'Vanguard Total Stock Market ETF', category: 'US Total Market ETF' },
  'VOO': { name: 'Vanguard S&P 500 ETF', category: 'US Large Cap ETF' },
  'IVV': { name: 'iShares Core S&P 500 ETF', category: 'US Large Cap ETF' },
  'VEA': { name: 'Vanguard Developed Markets ETF', category: 'International Developed ETF' },
  'VWO': { name: 'Vanguard Emerging Markets ETF', category: 'Emerging Markets ETF' },
  'IWM': { name: 'iShares Russell 2000 ETF', category: 'US Small Cap ETF' },
  'EFA': { name: 'iShares MSCI EAFE ETF', category: 'International Developed ETF' },
  'IEFA': { name: 'iShares Core MSCI EAFE IMI Index ETF', category: 'International Developed ETF' },
  'AGG': { name: 'iShares Core US Aggregate Bond ETF', category: 'Bond ETF' },
  'BND': { name: 'Vanguard Total Bond Market ETF', category: 'Bond ETF' },
  'GLD': { name: 'SPDR Gold Shares', category: 'Commodity ETF' },
  'TLT': { name: 'iShares 20+ Year Treasury Bond ETF', category: 'Bond ETF' }
};

// Fund symbols (ETFs and mutual funds) - FUNDSMITH removed
const FUND_SYMBOLS = {
  'VTIAX': { name: 'Vanguard Total International Stock Index', category: 'International Index Fund' },
  'VTSAX': { name: 'Vanguard Total Stock Market Index', category: 'US Total Market Fund' },
  'FXNAX': { name: 'Fidelity US Sustainability Index', category: 'ESG Fund' },
  'BRK.B': { name: 'Berkshire Hathaway Class B', category: 'Conglomerate' }
};

// Common ETF and mutual fund patterns
const FUND_PATTERNS = [
  /^[A-Z]{2,4}$/,  // Most ETFs are 2-4 letter symbols
  /^[A-Z]{4,5}X$/,  // Many mutual funds end in X (like PONCX, VTIAX)
  /ETF$/i,
  /FUND$/i
];

export const classifyAsset = (symbol: string): AssetClassification => {
  const upperSymbol = symbol.toUpperCase();
  
  console.log(`Classifying asset: ${symbol}`);
  
  // Check if it's a known index
  if (INDEX_SYMBOLS[upperSymbol]) {
    const indexInfo = INDEX_SYMBOLS[upperSymbol];
    return {
      type: upperSymbol.startsWith('^') ? 'index' : 'fund',
      name: indexInfo.name,
      category: indexInfo.category,
      description: `${indexInfo.name} - ${indexInfo.category}`
    };
  }
  
  // Check if it's a known fund
  if (FUND_SYMBOLS[upperSymbol]) {
    const fundInfo = FUND_SYMBOLS[upperSymbol];
    return {
      type: 'fund',
      name: fundInfo.name,
      category: fundInfo.category,
      description: `${fundInfo.name} - ${fundInfo.category}`
    };
  }
  
  // Check for crypto patterns
  if (upperSymbol.includes('USD') || upperSymbol.includes('BTC') || upperSymbol.includes('ETH')) {
    return {
      type: 'crypto',
      name: `${symbol} Cryptocurrency`,
      category: 'Cryptocurrency',
      description: `${symbol} digital currency`
    };
  }
  
  // Check for index patterns (starts with ^)
  if (symbol.startsWith('^')) {
    return {
      type: 'index',
      name: `${symbol} Index`,
      category: 'Market Index',
      description: `${symbol} market index`
    };
  }
  
  // Enhanced fund pattern matching for mutual funds
  if (FUND_PATTERNS.some(pattern => pattern.test(upperSymbol))) {
    return {
      type: 'fund',
      name: `${symbol} Fund`,
      category: 'Investment Fund',
      description: `${symbol} investment fund`
    };
  }
  
  // Default to stock
  return {
    type: 'stock',
    name: `${symbol} Stock`,
    category: 'Individual Stock',
    description: `${symbol} individual company stock`
  };
};

export const getPopularAssetsByType = (type: AssetType) => {
  switch (type) {
    case 'index':
      return Object.entries(INDEX_SYMBOLS)
        .filter(([symbol]) => symbol.startsWith('^'))
        .map(([symbol, info]) => ({ ticker: symbol, name: info.name, category: info.category }));
    
    case 'fund':
      return [
        ...Object.entries(INDEX_SYMBOLS)
          .filter(([symbol]) => !symbol.startsWith('^'))
          .map(([symbol, info]) => ({ ticker: symbol, name: info.name, category: info.category })),
        ...Object.entries(FUND_SYMBOLS)
          .map(([symbol, info]) => ({ ticker: symbol, name: info.name, category: info.category }))
      ];
    
    case 'stock':
      return [
        { ticker: "AAPL", name: "Apple Inc.", category: "Technology" },
        { ticker: "MSFT", name: "Microsoft Corporation", category: "Technology" },
        { ticker: "GOOGL", name: "Alphabet Inc.", category: "Technology" },
        { ticker: "AMZN", name: "Amazon.com, Inc.", category: "Consumer Discretionary" },
        { ticker: "META", name: "Meta Platforms, Inc.", category: "Technology" },
        { ticker: "TSLA", name: "Tesla, Inc.", category: "Consumer Discretionary" },
        { ticker: "NVDA", name: "NVIDIA Corporation", category: "Technology" }
      ];
    
    default:
      return [];
  }
};

export const isValidAssetSymbol = (symbol: string, type: AssetType): boolean => {
  const classification = classifyAsset(symbol);
  return classification.type === type;
};