
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Brain, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { useCharlieMungerAnalysis } from "@/hooks/useCharlieMungerAnalysis";
import { popularStocks } from "@/services/stockService";

const CharlieMungerAnalysis = () => {
  const [symbol, setSymbol] = useState<string>("AAPL");
  const [inputSymbol, setInputSymbol] = useState<string>("AAPL");

  const { mungerAnalysis, isLoading, error } = useCharlieMungerAnalysis(symbol);

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

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "bullish":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "bearish":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "bullish":
        return "text-green-600 bg-green-50 border-green-200";
      case "bearish":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return "text-green-600";
    if (score <= 4.5) return "text-red-600";
    return "text-yellow-600";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 7.5) return "bg-green-500";
    if (score <= 4.5) return "bg-red-500";
    return "bg-yellow-500";
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Charlie Munger Analysis
          </CardTitle>
          <CardDescription>
            Analyze stocks using Charlie Munger's mental models and investment principles
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
                Analyze
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
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
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Applying Munger's mental models...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-2">Unable to perform Munger analysis</p>
            <p className="text-sm text-gray-600">
              {error instanceof Error ? error.message : "Please try again later"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {mungerAnalysis && !isLoading && (
        <div className="space-y-6">
          {/* Overall Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Munger Assessment: {mungerAnalysis.ticker}</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getSignalColor(mungerAnalysis.signal)}`}>
                  {getSignalIcon(mungerAnalysis.signal)}
                  <span className="font-semibold capitalize">{mungerAnalysis.signal}</span>
                  <span className="text-sm">({mungerAnalysis.confidence.toFixed(0)}%)</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Munger Score</span>
                    <span className={`font-bold ${getScoreColor(mungerAnalysis.overallScore)}`}>
                      {mungerAnalysis.overallScore.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getScoreBarColor(mungerAnalysis.overallScore)}`}
                      style={{ width: `${mungerAnalysis.overallScore * 10}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Munger's Reasoning:</h4>
                  <p className="text-sm text-gray-700">{mungerAnalysis.reasoning}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Four Pillars Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Moat Strength */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Moat Strength
                  <span className={`font-bold ${getScoreColor(mungerAnalysis.moatAnalysis.score)}`}>
                    {mungerAnalysis.moatAnalysis.score.toFixed(1)}/10
                  </span>
                </CardTitle>
                <CardDescription>
                  Competitive advantages and pricing power
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBarColor(mungerAnalysis.moatAnalysis.score)}`}
                      style={{ width: `${mungerAnalysis.moatAnalysis.score * 10}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>ROIC: {mungerAnalysis.moatAnalysis.roicConsistency.toFixed(1)}/10</div>
                    <div>Pricing: {mungerAnalysis.moatAnalysis.pricingPower.toFixed(1)}/10</div>
                    <div>Capital: {mungerAnalysis.moatAnalysis.capitalIntensity.toFixed(1)}/10</div>
                    <div>Assets: {mungerAnalysis.moatAnalysis.intangibleAssets.toFixed(1)}/10</div>
                  </div>
                  <p className="text-sm text-gray-600">{mungerAnalysis.moatAnalysis.details}</p>
                </div>
              </CardContent>
            </Card>

            {/* Management Quality */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Management Quality
                  <span className={`font-bold ${getScoreColor(mungerAnalysis.managementQuality.score)}`}>
                    {mungerAnalysis.managementQuality.score.toFixed(1)}/10
                  </span>
                </CardTitle>
                <CardDescription>
                  Capital allocation and financial stewardship
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBarColor(mungerAnalysis.managementQuality.score)}`}
                      style={{ width: `${mungerAnalysis.managementQuality.score * 10}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Capital: {mungerAnalysis.managementQuality.capitalAllocation.toFixed(1)}/10</div>
                    <div>Debt: {mungerAnalysis.managementQuality.debtManagement.toFixed(1)}/10</div>
                    <div>Cash: {mungerAnalysis.managementQuality.cashManagement.toFixed(1)}/10</div>
                    <div>Insider: {mungerAnalysis.managementQuality.insiderActivity.toFixed(1)}/10</div>
                  </div>
                  <p className="text-sm text-gray-600">{mungerAnalysis.managementQuality.details}</p>
                </div>
              </CardContent>
            </Card>

            {/* Business Predictability */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Business Predictability
                  <span className={`font-bold ${getScoreColor(mungerAnalysis.businessPredictability.score)}`}>
                    {mungerAnalysis.businessPredictability.score.toFixed(1)}/10
                  </span>
                </CardTitle>
                <CardDescription>
                  Consistency and reliability of operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBarColor(mungerAnalysis.businessPredictability.score)}`}
                      style={{ width: `${mungerAnalysis.businessPredictability.score * 10}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Revenue: {mungerAnalysis.businessPredictability.revenueStability.toFixed(1)}/10</div>
                    <div>Operating: {mungerAnalysis.businessPredictability.operatingIncomeConsistency.toFixed(1)}/10</div>
                    <div>Margins: {mungerAnalysis.businessPredictability.marginConsistency.toFixed(1)}/10</div>
                    <div>Cash: {mungerAnalysis.businessPredictability.cashGenerationReliability.toFixed(1)}/10</div>
                  </div>
                  <p className="text-sm text-gray-600">{mungerAnalysis.businessPredictability.details}</p>
                </div>
              </CardContent>
            </Card>

            {/* Munger Valuation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Munger Valuation
                  <span className={`font-bold ${getScoreColor(mungerAnalysis.valuation.score)}`}>
                    {mungerAnalysis.valuation.score.toFixed(1)}/10
                  </span>
                </CardTitle>
                <CardDescription>
                  Owner earnings and margin of safety
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBarColor(mungerAnalysis.valuation.score)}`}
                      style={{ width: `${mungerAnalysis.valuation.score * 10}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>FCF Yield: {(mungerAnalysis.valuation.fcfYield * 100).toFixed(1)}%</div>
                    <div>Margin: {mungerAnalysis.valuation.marginOfSafety.toFixed(0)}%</div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div>Conservative: ${mungerAnalysis.valuation.intrinsicValueRange.conservative.toFixed(2)}</div>
                    <div>Reasonable: ${mungerAnalysis.valuation.intrinsicValueRange.reasonable.toFixed(2)}</div>
                    <div>Optimistic: ${mungerAnalysis.valuation.intrinsicValueRange.optimistic.toFixed(2)}</div>
                  </div>
                  <p className="text-sm text-gray-600">{mungerAnalysis.valuation.details}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights and Mental Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Insights</CardTitle>
                <CardDescription>
                  Critical observations from Munger's perspective
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mungerAnalysis.keyInsights.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applicable Mental Models</CardTitle>
                <CardDescription>
                  Munger's frameworks for this investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mungerAnalysis.mentalModels.map((model, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      {model}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Educational Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Understanding Munger's Approach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Moat Strength (35% weight)</h4>
                  <p className="text-gray-600">
                    Munger seeks businesses with durable competitive advantages that can maintain high returns on capital over time.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Predictability (25% weight)</h4>
                  <p className="text-gray-600">
                    Consistent, predictable businesses allow for more confident long-term projections of owner earnings.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-purple-600">Management (25% weight)</h4>
                  <p className="text-gray-600">
                    Rational capital allocation and shareholder-friendly management are crucial for long-term wealth creation.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Valuation (15% weight)</h4>
                  <p className="text-gray-600">
                    While quality matters most, Munger still demands a margin of safety and reasonable price for future returns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CharlieMungerAnalysis;
