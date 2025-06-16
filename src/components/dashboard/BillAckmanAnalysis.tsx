
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBillAckmanAnalysis } from "@/hooks/useBillAckmanAnalysis";
import { Search, Target, TrendingUp, Building, DollarSign } from "lucide-react";
import { popularStocks } from "@/services/stockService";

const BillAckmanAnalysis = () => {
  const [symbol, setSymbol] = useState<string>("AAPL");
  const [inputSymbol, setInputSymbol] = useState<string>("AAPL");

  const { ackmanAnalysis, isLoading, error } = useBillAckmanAnalysis(symbol);

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

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return 'bg-green-500';
      case 'bearish': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Bill Ackman Analysis</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Concentrated investing approach focusing on high-quality businesses with durable competitive advantages, 
          strong management, and potential for activist value creation.
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Stock Analysis
          </CardTitle>
          <CardDescription>
            Search for a stock to analyze using Bill Ackman's concentrated investment principles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g. AAPL)"
              onKeyDown={handleKeyDown}
              className="max-w-xs"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>
          
          <div>
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
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert>
          <AlertDescription>
            Error loading analysis: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {ackmanAnalysis && !isLoading && (
        <div className="space-y-6">
          {/* Overall Signal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Investment Signal: {ackmanAnalysis.ticker}</span>
                <Badge className={`${getSignalColor(ackmanAnalysis.signal)} text-white`}>
                  {ackmanAnalysis.signal.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl font-bold">
                  Confidence: {ackmanAnalysis.confidence}%
                </div>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded">
                  {ackmanAnalysis.reasoning}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Quality */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Business Quality
                  <span className={`text-sm font-normal ${getScoreColor(ackmanAnalysis.businessQuality.score, 10)}`}>
                    ({ackmanAnalysis.businessQuality.score}/10)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {ackmanAnalysis.businessQuality.revenueGrowth !== null && (
                    <div className="flex justify-between">
                      <span>Revenue Growth:</span>
                      <span className="font-medium">
                        {(ackmanAnalysis.businessQuality.revenueGrowth * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {ackmanAnalysis.businessQuality.avgOperatingMargin !== null && (
                    <div className="flex justify-between">
                      <span>Operating Margin:</span>
                      <span className="font-medium">
                        {(ackmanAnalysis.businessQuality.avgOperatingMargin * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {ackmanAnalysis.businessQuality.returnOnEquity !== null && (
                    <div className="flex justify-between">
                      <span>Return on Equity:</span>
                      <span className="font-medium">
                        {(ackmanAnalysis.businessQuality.returnOnEquity * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Competitive Advantage:</span>
                    <Badge variant="secondary">
                      {ackmanAnalysis.businessQuality.competitiveAdvantage}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-1">
                    {ackmanAnalysis.businessQuality.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Financial Discipline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Discipline
                  <span className={`text-sm font-normal ${getScoreColor(ackmanAnalysis.financialDiscipline.score, 10)}`}>
                    ({ackmanAnalysis.financialDiscipline.score}/10)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {ackmanAnalysis.financialDiscipline.avgDebtToEquity !== null && (
                    <div className="flex justify-between">
                      <span>Debt-to-Equity:</span>
                      <span className="font-medium">
                        {ackmanAnalysis.financialDiscipline.avgDebtToEquity.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Capital Returns:</span>
                    <Badge variant={ackmanAnalysis.financialDiscipline.capitalReturns ? "default" : "secondary"}>
                      {ackmanAnalysis.financialDiscipline.capitalReturns ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Share Count Trend:</span>
                    <Badge variant="secondary">
                      {ackmanAnalysis.financialDiscipline.shareCountTrend}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Leverage Management:</span>
                    <Badge variant="secondary">
                      {ackmanAnalysis.financialDiscipline.leverageManagement}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-1">
                    {ackmanAnalysis.financialDiscipline.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Activism Potential */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Activism Potential
                  <span className={`text-sm font-normal ${getScoreColor(ackmanAnalysis.activismPotential.score, 10)}`}>
                    ({ackmanAnalysis.activismPotential.score}/10)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Operational Gaps:</span>
                    <Badge variant={ackmanAnalysis.activismPotential.operationalGaps ? "destructive" : "default"}>
                      {ackmanAnalysis.activismPotential.operationalGaps ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {ackmanAnalysis.activismPotential.marginImprovement !== null && (
                    <div className="flex justify-between">
                      <span>Margin Improvement:</span>
                      <span className="font-medium">
                        +{(ackmanAnalysis.activismPotential.marginImprovement * 100).toFixed(1)}pp
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Management Efficiency:</span>
                    <Badge variant="secondary">
                      {ackmanAnalysis.activismPotential.managementEfficiency}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Value Creation:</span>
                    <Badge variant="secondary">
                      {ackmanAnalysis.activismPotential.valueCreationOpportunity}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-1">
                    {ackmanAnalysis.activismPotential.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Valuation Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Valuation Analysis
                  <span className={`text-sm font-normal ${getScoreColor(ackmanAnalysis.valuation.score, 10)}`}>
                    ({ackmanAnalysis.valuation.score}/10)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {ackmanAnalysis.valuation.intrinsicValue && (
                    <div className="flex justify-between">
                      <span>Intrinsic Value:</span>
                      <span className="font-medium">
                        ${ackmanAnalysis.valuation.intrinsicValue.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {ackmanAnalysis.valuation.currentPrice && (
                    <div className="flex justify-between">
                      <span>Current Price:</span>
                      <span className="font-medium">
                        ${ackmanAnalysis.valuation.currentPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {ackmanAnalysis.valuation.marginOfSafety !== null && (
                    <div className="flex justify-between">
                      <span>Margin of Safety:</span>
                      <span className={`font-medium ${ackmanAnalysis.valuation.marginOfSafety > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(ackmanAnalysis.valuation.marginOfSafety * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>DCF Assumptions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Growth Rate: {(ackmanAnalysis.valuation.dcfAssumptions.growthRate * 100).toFixed(0)}%</li>
                    <li>Discount Rate: {(ackmanAnalysis.valuation.dcfAssumptions.discountRate * 100).toFixed(0)}%</li>
                    <li>Terminal Multiple: {ackmanAnalysis.valuation.dcfAssumptions.terminalMultiple}x</li>
                  </ul>
                </div>
                <div className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-1">
                    {ackmanAnalysis.valuation.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Educational Note */}
          <Card>
            <CardHeader>
              <CardTitle>About Bill Ackman's Investment Philosophy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bill Ackman focuses on concentrated investments in high-quality businesses with durable competitive advantages. 
                His approach emphasizes strong management, efficient capital allocation, and the potential for activist involvement 
                to unlock value. Ackman typically invests in 6-8 positions, requiring high conviction and significant margin of safety.
                Key criteria include: ROE &gt; 15%, operating margins &gt; 15%, conservative debt levels, and clear catalysts for value creation.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BillAckmanAnalysis;
