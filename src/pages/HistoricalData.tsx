
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HistoricalDataTable } from "@/components/dashboard/HistoricalDataTable";
import { TradingViewWidget } from "@/components/dashboard/charts/TradingViewWidget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { useTechnicalIndicators } from "@/hooks/useTechnicalIndicators";
import { popularStocks } from "@/services/stockService";
import { RefreshCw, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { TechnicalIndicatorSelector } from "@/components/dashboard/TechnicalIndicatorSelector";

const HistoricalData = () => {
  const [symbol, setSymbol] = useState<string>("AAPL");
  const [inputSymbol, setInputSymbol] = useState<string>("AAPL");
  const { theme } = useTheme();
  
  const { 
    historicalData, 
    isLoading, 
    refetch, 
    dateRange, 
    setDateRange 
  } = useHistoricalData(symbol);

  const {
    indicators,
    toggleIndicator,
    updateIndicatorParams,
    getWidgetConfig
  } = useTechnicalIndicators();

  // Get widget configuration
  const { studies, studyOverrides } = getWidgetConfig();

  const handleSearch = () => {
    if (inputSymbol.trim()) {
      setSymbol(inputSymbol.trim().toUpperCase());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Historical Stock Data</h2>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        
        {/* Search Controls */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Search Stock</CardTitle>
            <CardDescription>
              Enter a stock symbol to view historical data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-1 gap-2">
                <Input 
                  value={inputSymbol}
                  onChange={(e) => setInputSymbol(e.target.value)}
                  placeholder="Enter stock symbol (e.g. AAPL)"
                  className="max-w-sm"
                  onKeyDown={handleKeyDown}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              <div className="flex flex-col md:items-center gap-2 md:flex-row">
                <span className="text-sm font-medium mr-2 whitespace-nowrap">
                  Days to Display: {dateRange}
                </span>
                <Slider 
                  className="w-[180px]"
                  defaultValue={[dateRange]}
                  max={30}
                  min={7}
                  step={1}
                  onValueChange={(values) => setDateRange(values[0])}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm mb-2">Popular Stocks:</p>
              <div className="flex flex-wrap gap-2">
                {popularStocks.map((stock) => (
                  <Button
                    key={stock.ticker}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputSymbol(stock.ticker);
                      setSymbol(stock.ticker);
                    }}
                  >
                    {stock.ticker}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Technical Indicator Selector */}
        <div className="mb-6">
          <TechnicalIndicatorSelector 
            indicators={indicators} 
            onToggleIndicator={toggleIndicator}
            onUpdateParams={updateIndicatorParams}
          />
        </div>
        
        {/* TradingView Widget */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>TradingView Chart: {symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <TradingViewWidget 
                  symbol={symbol} 
                  theme={theme === 'dark' ? 'dark' : 'light'} 
                  height={500}
                  studies={studies}
                  studyOverrides={studyOverrides}
                  historicalData={historicalData}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Data Table */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Price History</h3>
          <HistoricalDataTable 
            data={historicalData}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default HistoricalData;
