import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDCFAnalysis } from '@/hooks/useDCFAnalysis';
import { popularStocks } from '@/services/stockService';
import { 
  Search, 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Settings,
  RefreshCw,
  DollarSign,
  Target,
  Activity,
  Info
} from 'lucide-react';

const DCFAnalysis = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [inputSymbol, setInputSymbol] = useState<string>("");

  const { 
    dcfResults, 
    isLoading, 
    error, 
    customAssumptions, 
    updateAssumptions, 
    resetAssumptions,
    refetch 
  } = useDCFAnalysis(symbol);

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

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return 'bg-green-500';
      case 'SELL':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getUpsideColor = (upside: number) => {
    if (upside > 20) return 'text-green-600';
    if (upside > 0) return 'text-green-500';
    if (upside > -10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Discounted Cash Flow (DCF) Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input 
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g. AAPL, TSLA, MSFT)"
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
            {dcfResults && (
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-sm mb-2">Popular Stocks:</p>
            <div className="flex flex-wrap gap-2">
              {popularStocks.slice(0, 8).map((stock) => (
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

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This DCF analysis uses proven financial data calculations for accurate intrinsic value, combined with educational DCF methodology for learning.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {error && symbol && (
        <Alert variant="destructive">
          <AlertDescription>
            Error in DCF analysis: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && symbol && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Performing DCF analysis for {symbol}...</div>
          </CardContent>
        </Card>
      )}

      {dcfResults && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">
              <Target className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="projections">
              <TrendingUp className="h-4 w-4 mr-2" />
              Cash Flow Projections
            </TabsTrigger>
            <TabsTrigger value="sensitivity">
              <BarChart3 className="h-4 w-4 mr-2" />
              Sensitivity Analysis
            </TabsTrigger>
            <TabsTrigger value="assumptions">
              <Settings className="h-4 w-4 mr-2" />
              Assumptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            {/* Valuation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>DCF Valuation: {dcfResults.ticker}</span>
                  <Badge className={`${getRecommendationColor(dcfResults.recommendation)} text-white text-lg px-4 py-2`}>
                    {dcfResults.recommendation}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Market-Based Intrinsic Value:</strong> Uses proven financial data calculations from the Valuations tab for accuracy.
                    {dcfResults.academicIntrinsicValue && (
                      <span className="block mt-1">
                        <strong>Academic DCF Value:</strong> ${dcfResults.academicIntrinsicValue.toFixed(2)} (for educational comparison)
                      </span>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Current Price</span>
                      <span className="font-bold">{formatCurrency(dcfResults.currentPrice)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Intrinsic Value</span>
                      <span className="font-bold text-blue-600">{formatCurrency(dcfResults.intrinsicValue)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Upside/Downside</span>
                      <span className={`font-bold ${getUpsideColor(dcfResults.upside)}`}>
                        {dcfResults.upside > 0 ? '+' : ''}{dcfResults.upside.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Confidence</span>
                      <span className="font-bold">{dcfResults.confidence.toFixed(0)}%</span>
                    </div>
                    <Progress value={dcfResults.confidence} className="h-2" />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Enterprise Value</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(dcfResults.enterpriseValue)}</p>
                    <p className="text-sm text-gray-600">Academic DCF calculation</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="font-medium">WACC</span>
                    </div>
                    <p className="text-2xl font-bold">{formatPercentage(dcfResults.wacc)}</p>
                    <p className="text-sm text-gray-600">Weighted Average Cost of Capital</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Terminal Value</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(dcfResults.terminalValue)}</p>
                    <p className="text-sm text-gray-600">Long-term cash flow value</p>
                  </div>
                </div>

                {/* Scenario Analysis */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Scenario Analysis (Market-Based)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 border rounded-lg bg-red-50">
                      <p className="text-sm text-gray-600">Bear Case</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(dcfResults.scenarioAnalysis.bear)}</p>
                      <p className="text-xs text-gray-500">-20% from base</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg bg-blue-50">
                      <p className="text-sm text-gray-600">Base Case</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(dcfResults.scenarioAnalysis.base)}</p>
                      <p className="text-xs text-gray-500">Market-based calculation</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg bg-green-50">
                      <p className="text-sm text-gray-600">Bull Case</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(dcfResults.scenarioAnalysis.bull)}</p>
                      <p className="text-xs text-gray-500">+20% from base</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Projections (Academic DCF)</CardTitle>
                <p className="text-sm text-gray-600">Educational DCF methodology - for learning purposes</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Year</th>
                        <th className="text-right py-2">Projected FCF</th>
                        <th className="text-right py-2">Present Value</th>
                        <th className="text-right py-2">Discount Factor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dcfResults.projectedCashFlows.map((fcf, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">Year {index + 1}</td>
                          <td className="text-right py-2">{formatCurrency(fcf)}</td>
                          <td className="text-right py-2">{formatCurrency(dcfResults.presentValueCashFlows[index])}</td>
                          <td className="text-right py-2">{(1 / Math.pow(1 + dcfResults.wacc, index + 1)).toFixed(3)}</td>
                        </tr>
                      ))}
                      <tr className="border-b font-semibold">
                        <td className="py-2">Terminal</td>
                        <td className="text-right py-2">{formatCurrency(dcfResults.terminalValue)}</td>
                        <td className="text-right py-2">{formatCurrency(dcfResults.presentValueTerminalValue)}</td>
                        <td className="text-right py-2">{(1 / Math.pow(1 + dcfResults.wacc, dcfResults.assumptions.projectionYears)).toFixed(3)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensitivity">
            <Card>
              <CardHeader>
                <CardTitle>Sensitivity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    How intrinsic value changes with different WACC and Terminal Growth Rate assumptions
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="p-2 border">WACC \ Growth</th>
                        {dcfResults.sensitivityMatrix.growthRange.map((growth, i) => (
                          <th key={i} className="p-2 border">{formatPercentage(growth)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dcfResults.sensitivityMatrix.values.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2 border font-medium">
                            {formatPercentage(dcfResults.sensitivityMatrix.waccRange[i])}
                          </td>
                          {row.map((value, j) => (
                            <td key={j} className="p-2 border text-center">
                              {formatCurrency(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assumptions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Model Assumptions</CardTitle>
                <Button variant="outline" size="sm" onClick={resetAssumptions}>
                  Reset to Defaults
                </Button>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    These assumptions affect the academic DCF calculation. The main intrinsic value uses market-based calculations for accuracy.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Risk-Free Rate</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">{formatPercentage(customAssumptions.riskFreeRate)}</span>
                        <Slider
                          value={[customAssumptions.riskFreeRate * 100]}
                          onValueChange={(values) => updateAssumptions({ riskFreeRate: values[0] / 100 })}
                          max={8}
                          min={2}
                          step={0.1}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Market Risk Premium</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">{formatPercentage(customAssumptions.marketRiskPremium)}</span>
                        <Slider
                          value={[customAssumptions.marketRiskPremium * 100]}
                          onValueChange={(values) => updateAssumptions({ marketRiskPremium: values[0] / 100 })}
                          max={10}
                          min={4}
                          step={0.1}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Beta</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">{customAssumptions.beta.toFixed(2)}</span>
                        <Slider
                          value={[customAssumptions.beta]}
                          onValueChange={(values) => updateAssumptions({ beta: values[0] })}
                          max={2.5}
                          min={0.5}
                          step={0.1}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Terminal Growth Rate</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">{formatPercentage(customAssumptions.terminalGrowthRate)}</span>
                        <Slider
                          value={[customAssumptions.terminalGrowthRate * 100]}
                          onValueChange={(values) => updateAssumptions({ terminalGrowthRate: values[0] / 100 })}
                          max={5}
                          min={1}
                          step={0.1}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cost of Debt</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">{formatPercentage(customAssumptions.costOfDebt)}</span>
                        <Slider
                          value={[customAssumptions.costOfDebt * 100]}
                          onValueChange={(values) => updateAssumptions({ costOfDebt: values[0] / 100 })}
                          max={10}
                          min={2}
                          step={0.1}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tax Rate</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">{formatPercentage(customAssumptions.taxRate)}</span>
                        <Slider
                          value={[customAssumptions.taxRate * 100]}
                          onValueChange={(values) => updateAssumptions({ taxRate: values[0] / 100 })}
                          max={35}
                          min={15}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">FCF Margin Target</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">{formatPercentage(customAssumptions.fcfMarginTarget)}</span>
                        <Slider
                          value={[customAssumptions.fcfMarginTarget * 100]}
                          onValueChange={(values) => updateAssumptions({ fcfMarginTarget: values[0] / 100 })}
                          max={30}
                          min={5}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Projection Years</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">{customAssumptions.projectionYears}</span>
                        <Slider
                          value={[customAssumptions.projectionYears]}
                          onValueChange={(values) => updateAssumptions({ projectionYears: values[0] })}
                          max={10}
                          min={3}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Assumptions Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">WACC:</span>
                      <span className="ml-2 font-medium">{formatPercentage(dcfResults.wacc)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Projection Years:</span>
                      <span className="ml-2 font-medium">{customAssumptions.projectionYears}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Terminal Growth:</span>
                      <span className="ml-2 font-medium">{formatPercentage(customAssumptions.terminalGrowthRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">FCF Margin:</span>
                      <span className="ml-2 font-medium">{formatPercentage(customAssumptions.fcfMarginTarget)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!symbol && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Enter a stock symbol above to perform a comprehensive DCF analysis
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DCFAnalysis;
