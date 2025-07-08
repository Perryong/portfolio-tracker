
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { analyzeIndexValuation } from "@/services/indexValuationService";
import { classifyAsset, getPopularAssetsByType } from "@/services/assetClassificationService";
import { Search, AlertTriangle, Info, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const IndexValuations = () => {
  const [symbol, setSymbol] = useState<string>("");
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
      } else {
        // Allow any symbol to be searched as a potential ETF
        setSymbol(inputSymbol.trim().toUpperCase());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const popularETFs = getPopularAssetsByType('fund');

  // Group ETFs by category for better display
  const groupedETFs = popularETFs.reduce((acc, etf) => {
    const category = etf.category.includes('Bond') ? 'Bond ETFs' :
                    etf.category.includes('International') || etf.category.includes('Emerging') ? 'International ETFs' :
                    etf.category.includes('Commodity') ? 'Specialty ETFs' : 'US Equity ETFs';
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(etf);
    return acc;
  }, {} as Record<string, typeof popularETFs>);

  const getValuationColor = (level: string) => {
    switch (level) {
      case 'Undervalued': return 'text-green-600 bg-green-50';
      case 'Overvalued': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getValuationIcon = (level: string) => {
    switch (level) {
      case 'Undervalued': return <TrendingDown className="h-4 w-4" />;
      case 'Overvalued': return <TrendingUp className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
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
              placeholder="Enter index or ETF symbol (e.g. SPY, QQQ, VTI)"
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
          
          <div className="space-y-4">
            {Object.entries(groupedETFs).map(([category, etfs]) => (
              <div key={category}>
                <p className="text-sm font-medium mb-2">{category}:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {etfs.map((etf) => (
                    <Button
                      key={etf.ticker}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputSymbol(etf.ticker);
                        setSymbol(etf.ticker);
                      }}
                      title={etf.name}
                    >
                      {etf.ticker}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error occurred while fetching data'}
          </AlertDescription>
        </Alert>
      )}

      {!symbol && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Enter an index or ETF symbol above to begin analysis. This analysis uses real price data and calculated metrics.
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

      {/* Analysis Results */}
      {indexAnalysis && !isLoading && (
        <div className="space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl">{indexAnalysis.name}</h3>
                  <p className="text-sm text-muted-foreground">{indexAnalysis.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${indexAnalysis.currentPrice.toFixed(2)}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={`flex items-center gap-2 ${getValuationColor(indexAnalysis.valuation.currentLevel)}`}>
                  {getValuationIcon(indexAnalysis.valuation.currentLevel)}
                  {indexAnalysis.valuation.currentLevel}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Confidence: {indexAnalysis.valuation.confidence}%
                </div>
              </div>
              <Progress value={indexAnalysis.valuation.confidence} className="mt-2" />
            </CardContent>
          </Card>

          {/* Valuation Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">P/E Ratio</p>
                  <p className="text-2xl font-bold">{indexAnalysis.metrics.currentPE}</p>
                  <p className="text-xs text-muted-foreground">
                    Range: {indexAnalysis.metrics.historicalPERange.min}-{indexAnalysis.metrics.historicalPERange.max}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">CAPE Ratio</p>
                  <p className="text-2xl font-bold">{indexAnalysis.metrics.cape}</p>
                  <p className="text-xs text-muted-foreground">Cyclically Adjusted</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Earnings Yield</p>
                  <p className="text-2xl font-bold">{indexAnalysis.metrics.earningsYield}%</p>
                  <p className="text-xs text-muted-foreground">vs Treasury: {indexAnalysis.metrics.treasuryYield}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Volatility (VIX)</p>
                  <p className="text-2xl font-bold">{indexAnalysis.metrics.sentiment.vixLevel.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Market Fear Index</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Context */}
          <Card>
            <CardHeader>
              <CardTitle>Historical Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">P/E Percentile (1Y)</p>
                  <div className="flex items-center gap-2">
                    <Progress value={indexAnalysis.historicalContext.pePercentile} className="flex-1" />
                    <span className="text-sm font-medium">{indexAnalysis.historicalContext.pePercentile}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">CAPE Percentile</p>
                  <div className="flex items-center gap-2">
                    <Progress value={indexAnalysis.historicalContext.capePercentile} className="flex-1" />
                    <span className="text-sm font-medium">{indexAnalysis.historicalContext.capePercentile}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Earnings Yield Rank</p>
                  <Badge variant="outline">{indexAnalysis.historicalContext.earningsYieldRank}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sector Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {indexAnalysis.metrics.sectorBreakdown
                  .sort((a, b) => b.weight - a.weight)
                  .slice(0, 8)
                  .map((sector) => (
                    <div key={sector.sector} className="flex items-center justify-between">
                      <span className="text-sm">{sector.sector}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={sector.weight} className="w-24" max={100} />
                        <span className="text-sm font-medium w-12 text-right">{sector.weight.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {indexAnalysis.valuation.reasoning.map((reason, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IndexValuations;
