
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { analyzeIndexValuation, IndexValuationResults } from "@/services/indexValuationService";
import { classifyAsset, getPopularAssetsByType } from "@/services/assetClassificationService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, TrendingUp, TrendingDown, AlertTriangle, Info, Target } from 'lucide-react';

const IndexValuations = () => {
  const [symbol, setSymbol] = useState<string>("SPY");
  const [inputSymbol, setInputSymbol] = useState<string>("SPY");

  const {
    data: indexAnalysis,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['index-valuation', symbol],
    queryFn: () => analyzeIndexValuation(symbol),
    enabled: Boolean(symbol),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSearch = () => {
    if (inputSymbol.trim()) {
      const classification = classifyAsset(inputSymbol.trim());
      if (classification.type === 'index' || classification.type === 'fund') {
        setSymbol(inputSymbol.trim().toUpperCase());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const popularETFs = getPopularAssetsByType('fund').slice(0, 5);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

  const getValuationColor = (level: string) => {
    switch (level) {
      case 'Undervalued': return 'text-green-600 bg-green-100';
      case 'Overvalued': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Index & ETF Valuation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input 
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Enter index or ETF symbol (e.g. SPY, QQQ, ^GSPC)"
              className="max-w-sm"
              onKeyDown={handleKeyDown}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !inputSymbol.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Popular ETFs:</p>
            <div className="flex flex-wrap gap-2">
              {popularETFs.map((etf) => (
                <Button
                  key={etf.ticker}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInputSymbol(etf.ticker);
                    setSymbol(etf.ticker);
                  }}
                >
                  {etf.ticker}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading data for {symbol}: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {!symbol && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Enter an index or ETF symbol above to begin comprehensive valuation analysis including historical P/E ratios, CAPE analysis, and market sentiment indicators.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {indexAnalysis && !isLoading && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{indexAnalysis.name} ({symbol})</span>
                <Badge className={getValuationColor(indexAnalysis.valuation.currentLevel)}>
                  {indexAnalysis.valuation.currentLevel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-2xl font-bold">${indexAnalysis.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">P/E Ratio</p>
                  <p className="text-2xl font-bold">{indexAnalysis.metrics.currentPE}</p>
                  <p className="text-xs text-gray-500">
                    {indexAnalysis.historicalContext.pePercentile}th percentile
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CAPE Ratio</p>
                  <p className="text-2xl font-bold">{indexAnalysis.metrics.cape}</p>
                  <p className="text-xs text-gray-500">
                    {indexAnalysis.historicalContext.capePercentile}th percentile
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="text-2xl font-bold">{indexAnalysis.valuation.confidence}%</p>
                  <Progress value={indexAnalysis.valuation.confidence} className="mt-1" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Key Insights:</h4>
                {indexAnalysis.valuation.reasoning.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Valuation Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Yield vs Treasury</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Earnings Yield</span>
                    <span className="font-bold">{indexAnalysis.metrics.earningsYield.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>10Y Treasury</span>
                    <span className="font-bold">{indexAnalysis.metrics.treasuryYield.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span>Spread</span>
                    <span className={`font-bold ${(indexAnalysis.metrics.earningsYield - indexAnalysis.metrics.treasuryYield) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(indexAnalysis.metrics.earningsYield - indexAnalysis.metrics.treasuryYield).toFixed(2)}%
                    </span>
                  </div>
                  <Badge variant="outline" className="w-full justify-center">
                    {indexAnalysis.historicalContext.earningsYieldRank}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>VIX Level</span>
                    <span className="font-bold">{indexAnalysis.metrics.sentiment.vixLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Put/Call Ratio</span>
                    <span className="font-bold">{indexAnalysis.metrics.sentiment.putCallRatio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fear & Greed Index</span>
                    <span className="font-bold">{indexAnalysis.metrics.sentiment.fearGreedIndex}</span>
                  </div>
                  <Progress 
                    value={indexAnalysis.metrics.sentiment.fearGreedIndex} 
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    0 = Extreme Fear, 100 = Extreme Greed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sector Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Sector Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={indexAnalysis.metrics.sectorBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ sector, weight }) => `${sector}: ${weight}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="weight"
                      >
                        {indexAnalysis.metrics.sectorBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  {indexAnalysis.metrics.sectorBreakdown.map((sector, index) => (
                    <div key={sector.sector} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm">{sector.sector}</span>
                      </div>
                      <span className="text-sm font-medium">{sector.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IndexValuations;
