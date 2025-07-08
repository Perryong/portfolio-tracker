
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { analyzeFundValuation } from "@/services/fundValuationService";
import { classifyAsset, getPopularAssetsByType } from "@/services/assetClassificationService";
import { Search, AlertTriangle, Info, Building } from 'lucide-react';

const FundValuations = () => {
  const [symbol, setSymbol] = useState<string>("");
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

  const popularFunds = getPopularAssetsByType('fund');

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
            {error instanceof Error ? error.message : 'Unknown error occurred while fetching fund data'}
          </AlertDescription>
        </Alert>
      )}

      {!symbol && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Enter a fund or ETF symbol above to begin comprehensive analysis. This feature relies on real-time data from financial providers.
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

      {/* Results would be displayed here if the analysis succeeds */}
      {fundAnalysis && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Fund Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Fund analysis data for {symbol} would be displayed here when real data is available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FundValuations;
