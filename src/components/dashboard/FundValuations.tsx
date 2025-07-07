import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { analyzeFundValuation } from "@/services/fundValuationService";
import { classifyAsset, getPopularAssetsByType } from "@/services/assetClassificationService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, DollarSign, AlertTriangle, Info, Building } from 'lucide-react';

const FundValuations = () => {
  const [symbol, setSymbol] = useState<string>("SPY");
  const [inputSymbol, setInputSymbol] = useState<string>("SPY");

  const {
    data: fundAnalysis,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['fund-valuation', symbol],
    queryFn: () => analyzeFundValuation(symbol),
    enabled: Boolean(symbol),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSearch = () => {
    if (inputSymbol.trim()) {
      const classification = classifyAsset(inputSymbol.trim());
      if (classification.type === 'fund') {
        setSymbol(inputSymbol.trim().toUpperCase());
      } else {
        // Allow any symbol to be searched as a potential fund
        setSymbol(inputSymbol.trim().toUpperCase());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const popularFunds = getPopularAssetsByType('fund').filter(fund => fund.ticker !== 'FUNDSMITH');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-600 bg-green-100';
      case 'SELL': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Fund & ETF Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input 
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Enter fund or ETF symbol (e.g. SPY, QQQ, PONCX)"
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
            <p className="text-sm font-medium mb-2">Popular Funds & ETFs:</p>
            <div className="flex flex-wrap gap-2">
              {popularFunds.map((fund) => (
                <Button
                  key={fund.ticker}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInputSymbol(fund.ticker);
                    setSymbol(fund.ticker);
                  }}
                >
                  {fund.ticker}
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
            Error loading data for {symbol}: {error instanceof Error ? error.message : 'Unknown error'}. The fund may not be supported or data may be temporarily unavailable.
          </AlertDescription>
        </Alert>
      )}

      {!symbol && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Enter a fund or ETF symbol above to begin comprehensive analysis. Supports major ETFs (SPY, QQQ) and mutual funds (PONCX, VTSAX) with dynamic data fetching.
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

      {fundAnalysis && !isLoading && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{fundAnalysis.name} ({symbol})</span>
                <Badge className={getRecommendationColor(fundAnalysis.valuation.recommendation)}>
                  {fundAnalysis.valuation.recommendation}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-2xl font-bold">${fundAnalysis.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NAV</p>
                  <p className="text-2xl font-bold">${fundAnalysis.nav.toFixed(2)}</p>
                  <p className={`text-xs ${fundAnalysis.metrics.navPremiumDiscount >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {fundAnalysis.metrics.navPremiumDiscount >= 0 ? '+' : ''}{fundAnalysis.metrics.navPremiumDiscount.toFixed(2)}% vs NAV
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expense Ratio</p>
                  <p className="text-2xl font-bold">{fundAnalysis.metrics.expenseRatio}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="text-2xl font-bold">{fundAnalysis.valuation.confidence}%</p>
                  <Progress value={fundAnalysis.valuation.confidence} className="mt-1" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Key Insights:</h4>
                {fundAnalysis.valuation.reasoning.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance & Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Benchmark</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>1 Year</span>
                    <span className={`font-bold ${fundAnalysis.metrics.performanceVsBenchmark.oneYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fundAnalysis.metrics.performanceVsBenchmark.oneYear >= 0 ? '+' : ''}{(fundAnalysis.metrics.performanceVsBenchmark.oneYear * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>3 Year</span>
                    <span className={`font-bold ${fundAnalysis.metrics.performanceVsBenchmark.threeYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fundAnalysis.metrics.performanceVsBenchmark.threeYear >= 0 ? '+' : ''}{(fundAnalysis.metrics.performanceVsBenchmark.threeYear * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>5 Year</span>
                    <span className={`font-bold ${fundAnalysis.metrics.performanceVsBenchmark.fiveYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fundAnalysis.metrics.performanceVsBenchmark.fiveYear >= 0 ? '+' : ''}{(fundAnalysis.metrics.performanceVsBenchmark.fiveYear * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Expense Impact: -${fundAnalysis.comparison.expenseImpact.toLocaleString()} over 10 years
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Beta</span>
                    <span className="font-bold">{fundAnalysis.metrics.riskMetrics.beta}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sharpe Ratio</span>
                    <span className="font-bold">{fundAnalysis.metrics.riskMetrics.sharpeRatio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Max Drawdown</span>
                    <span className="font-bold text-red-600">{fundAnalysis.metrics.riskMetrics.maxDrawdown}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Holdings */}
          <Card>
            <CardHeader>
              <CardTitle>Top Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fundAnalysis.metrics.topHoldings.map((holding, index) => (
                  <div key={holding.symbol} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{holding.symbol}</p>
                      <p className="text-sm text-gray-600">{holding.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{holding.weight}%</p>
                      <Progress value={holding.weight} className="w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sector & Geographic Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sector Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fundAnalysis.metrics.sectorBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ sector, weight }) => `${sector}: ${weight}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="weight"
                      >
                        {fundAnalysis.metrics.sectorBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  {fundAnalysis.metrics.sectorBreakdown.slice(0, 5).map((sector, index) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Exposure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fundAnalysis.metrics.geographicExposure.map((region, index) => (
                    <div key={region.region} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{region.region}</span>
                        <span className="text-sm font-bold">{region.weight}%</span>
                      </div>
                      <Progress value={region.weight} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundValuations;
