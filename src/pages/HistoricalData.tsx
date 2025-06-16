import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HistoricalDataTable } from "@/components/dashboard/HistoricalDataTable";
import { TradingViewWidget } from "@/components/dashboard/charts/TradingViewWidget";
import StockValuations from "@/components/dashboard/StockValuations";
import WarrenBuffettAnalysis from "@/components/dashboard/WarrenBuffettAnalysis";
import CharlieMungerAnalysis from "@/components/dashboard/CharlieMungerAnalysis";
import PeterLynchAnalysis from "@/components/dashboard/PeterLynchAnalysis";
import BillAckmanAnalysis from "@/components/dashboard/BillAckmanAnalysis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { useTechnicalIndicators } from "@/hooks/useTechnicalIndicators";
import { popularStocks } from "@/services/stockService";
import { RefreshCw, Search, ChevronDown, ChevronUp, Calculator, Target, Brain, TrendingUp, Building } from "lucide-react";
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
  const [isPriceHistoryExpanded, setIsPriceHistoryExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("charts");
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
          <h2 className="text-2xl font-bold">Stock Analysis & Valuations</h2>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        
        <Tabs
          defaultValue="charts"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="charts">Charts & Technical</TabsTrigger>
            <TabsTrigger value="valuations">
              <Calculator className="h-4 w-4 mr-2" />
              Valuations
            </TabsTrigger>
            <TabsTrigger value="warren-buffett">
              <Target className="h-4 w-4 mr-2" />
              Warren Buffett
            </TabsTrigger>
            <TabsTrigger value="charlie-munger">
              <Brain className="h-4 w-4 mr-2" />
              Charlie Munger
            </TabsTrigger>
            <TabsTrigger value="peter-lynch">
              <TrendingUp className="h-4 w-4 mr-2" />
              Peter Lynch
            </TabsTrigger>
            <TabsTrigger value="bill-ackman">
              <Building className="h-4 w-4 mr-2" />
              Bill Ackman
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-6">
            {/* Search Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Search Stock</CardTitle>
                <CardDescription>
                  Enter a stock symbol to view historical data and technical analysis
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
            <div>
              <TechnicalIndicatorSelector 
                indicators={indicators} 
                onToggleIndicator={toggleIndicator}
                onUpdateParams={updateIndicatorParams}
              />
            </div>
            
            {/* TradingView Widget */}
            <div>
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
            
            {/* Expandable Data Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Price History</h3>
                <Button 
                  variant="outline"
                  onClick={() => setIsPriceHistoryExpanded(!isPriceHistoryExpanded)}
                  className="flex items-center gap-2"
                >
                  {isPriceHistoryExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Expand
                    </>
                  )}
                </Button>
              </div>
              
              {isPriceHistoryExpanded && (
                <div className="animate-fade-in">
                  <HistoricalDataTable 
                    data={historicalData}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="valuations">
            <StockValuations />
          </TabsContent>
          
          <TabsContent value="warren-buffett">
            <WarrenBuffettAnalysis />
          </TabsContent>
          
          <TabsContent value="charlie-munger">
            <CharlieMungerAnalysis />
          </TabsContent>
          
          <TabsContent value="peter-lynch">
            <PeterLynchAnalysis />
          </TabsContent>
          
          <TabsContent value="bill-ackman">
            <BillAckmanAnalysis />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HistoricalData;
