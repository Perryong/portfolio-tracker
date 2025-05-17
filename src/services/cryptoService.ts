import { CryptoQuote } from "@/types";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Map of crypto tickers to CoinGecko IDs
const CRYPTO_ID_MAP: Record<string, string> = {
  "BTC": "bitcoin",
  "ETH": "ethereum",
  "BNB": "binancecoin",
  "SOL": "solana",
  "XRP": "ripple",
  "ADA": "cardano",
  "DOGE": "dogecoin",
  "DOT": "polkadot",
  "AVAX": "avalanche-2",
  "MATIC": "matic-network",
  "LINK": "chainlink",
  "UNI": "uniswap",
  "LTC": "litecoin",
  "ALGO": "algorand",
  "ATOM": "cosmos",
  "FIL": "filecoin",
  "XLM": "stellar",
  "VET": "vechain",
  "HBAR": "hedera-hashgraph",
  "NEAR": "near",
};

export const fetchCryptoPrice = async (ticker: string): Promise<CryptoQuote> => {
  try {
    const coinId = CRYPTO_ID_MAP[ticker];
    if (!coinId) {
      throw new Error(`Unknown crypto ticker: ${ticker}`);
    }

    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const coinData = data[coinId];

    return {
      price: coinData.usd,
      price_change_24h: (coinData.usd * coinData.usd_24h_change) / 100,
      price_change_percentage_24h: coinData.usd_24h_change,
      market_cap: coinData.usd_market_cap,
      volume_24h: coinData.usd_24h_vol,
    };
  } catch (error) {
    console.warn(`Error fetching ${ticker} crypto data, using mock data instead:`, error);
    return mockCryptoData(ticker);
  }
};

export const fetchCryptoBatch = async (tickers: string[]): Promise<Record<string, CryptoQuote>> => {
  try {
    const validTickers = tickers.filter(ticker => CRYPTO_ID_MAP[ticker]);
    const coinIds = validTickers.map(ticker => CRYPTO_ID_MAP[ticker]).join(',');

    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const resultMap: Record<string, CryptoQuote> = {};

    validTickers.forEach(ticker => {
      const coinId = CRYPTO_ID_MAP[ticker];
      const coinData = data[coinId];

      resultMap[ticker] = {
        price: coinData.usd,
        price_change_24h: (coinData.usd * coinData.usd_24h_change) / 100,
        price_change_percentage_24h: coinData.usd_24h_change,
        market_cap: coinData.usd_market_cap,
        volume_24h: coinData.usd_24h_vol,
      };
    });

    return resultMap;
  } catch (error) {
    console.warn("Error fetching batch crypto data, using mock data instead:", error);
    const resultMap: Record<string, CryptoQuote> = {};
    tickers.forEach((ticker) => {
      resultMap[ticker] = mockCryptoData(ticker);
    });
    return resultMap;
  }
};

const mockCryptoData = (symbol: string): CryptoQuote => {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let basePrice: number;
  
  switch (symbol.toLowerCase()) {
    case 'btc':
      basePrice = 30000 + (hash % 10000);
      break;
    case 'eth':
      basePrice = 2000 + (hash % 1000);
      break;
    case 'bnb':
      basePrice = 300 + (hash % 100);
      break;
    case 'sol':
      basePrice = 100 + (hash % 50);
      break;
    case 'xrp':
      basePrice = 0.5 + (hash % 100) / 100;
      break;
    case 'ada':
      basePrice = 0.3 + (hash % 50) / 100;
      break;
    case 'doge':
      basePrice = 0.05 + (hash % 10) / 100;
      break;
    default:
      basePrice = 0.1 + (hash % 10000) / 100;
  }
  
  const changePercent = ((hash % 41) - 20) / 2;
  const change = basePrice * changePercent / 100;
  
  return {
    price: basePrice,
    price_change_24h: change,
    price_change_percentage_24h: changePercent,
    market_cap: basePrice * 1000000000,
    volume_24h: basePrice * 10000000,
  };
};

export const popularCryptos = [
  { ticker: "BTC", name: "Bitcoin" },
  { ticker: "ETH", name: "Ethereum" },
  { ticker: "BNB", name: "Binance Coin" },
  { ticker: "SOL", name: "Solana" },
  { ticker: "XRP", name: "XRP" },
  { ticker: "ADA", name: "Cardano" },
  { ticker: "DOGE", name: "Dogecoin" },
  { ticker: "DOT", name: "Polkadot" },
  { ticker: "AVAX", name: "Avalanche" },
  { ticker: "MATIC", name: "Polygon" },
  { ticker: "LINK", name: "Chainlink" },
  { ticker: "UNI", name: "Uniswap" },
  { ticker: "LTC", name: "Litecoin" },
  { ticker: "ALGO", name: "Algorand" },
  { ticker: "ATOM", name: "Cosmos" },
  { ticker: "FIL", name: "Filecoin" },
  { ticker: "XLM", name: "Stellar" },
  { ticker: "VET", name: "VeChain" },
  { ticker: "HBAR", name: "Hedera" },
  { ticker: "NEAR", name: "NEAR Protocol" },
];
