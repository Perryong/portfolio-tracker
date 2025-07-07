
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useBuffettAnalysis } from '@/hooks/useBuffettAnalysis';
import { formatNumber } from '@/lib/utils';
import { 
  Search, 
  TrendingUp, 
  Target, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';

const WarrenBuffettAnalysis = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [inputSymbol, setInputSymbol] = useState<string>("");

  const { buffettMetrics, financialData, isLoading, error } = useBuffettAnalysis(symbol);

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

  const getMetricColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricIcon = (value: number, threshold: number) => {
    return value >= threshold ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Warren Buffett Investment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input 
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g. AAPL, BRK.B, KO)"
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
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This analysis applies Warren Buffett's criteria for identifying "Compounding Machines" - 
              businesses that can reinvest earnings at high returns to compound wealth over time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {error && symbol && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error analyzing {symbol}: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && symbol && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Analyzing {symbol} using Buffett's criteria...</div>
          </CardContent>
        </Card>
      )}

      {buffettMetrics && financialData && (
        <>
          {/* Compounding Machine Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Compounding Machine Test
                {buffettMetrics.isCompoundingMachine ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    PASSED
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    FAILED
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ROIC */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">ROIC</span>
                      {getMetricIcon(buffettMetrics.roic, 0.15)}
                    </div>
                    <span className={`font-bold ${getMetricColor(buffettMetrics.roic, 0.15)}`}>
                      {formatNumber(buffettMetrics.roic * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (buffettMetrics.roic / 0.25) * 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: ≥15%</span>
                    <span>Score: {buffettMetrics.roicScore}/40</span>
                  </div>
                </div>

                {/* Reinvestment Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Reinvestment</span>
                      {getMetricIcon(buffettMetrics.reinvestmentRate, 0.20)}
                    </div>
                    <span className={`font-bold ${getMetricColor(buffettMetrics.reinvestmentRate, 0.20)}`}>
                      {formatNumber(buffettMetrics.reinvestmentRate * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (buffettMetrics.reinvestmentRate / 0.40) * 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: ≥20%</span>
                    <span>Score: {buffettMetrics.reinvestmentScore}/30</span>
                  </div>
                </div>

                {/* ROIIC */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">ROIIC</span>
                      {getMetricIcon(buffettMetrics.roiic, 0.15)}
                    </div>
                    <span className={`font-bold ${getMetricColor(buffettMetrics.roiic, 0.15)}`}>
                      {formatNumber(buffettMetrics.roiic * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (buffettMetrics.roiic / 0.25) * 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: ≥15%</span>
                    <span>Score: {buffettMetrics.roiicScore}/30</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Compounding Score</span>
                  <span className={`text-2xl font-bold ${
                    buffettMetrics.compoundingScore >= 80 ? 'text-green-600' :
                    buffettMetrics.compoundingScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {buffettMetrics.compoundingScore}/100
                  </span>
                </div>
                <Progress value={buffettMetrics.compoundingScore} className="h-3" />
                <div className="text-xs text-muted-foreground mt-2">
                  {!buffettMetrics.isCompoundingMachine && buffettMetrics.compoundingScore > 60 && (
                    "Score capped due to failed threshold requirements"
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Thesis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Investment Thesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-lg leading-relaxed">{buffettMetrics.investmentThesis}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-2">
                      {buffettMetrics.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Concerns */}
                  <div>
                    <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Areas of Concern
                    </h4>
                    <ul className="space-y-2">
                      {buffettMetrics.concerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <Card>
            <CardHeader>
              <CardTitle>Understanding the Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">🎯 ROIC</h4>
                  <p className="text-sm text-muted-foreground">
                    Measures how efficiently a company converts invested capital into profits. 
                    Buffett looks for companies with consistently high ROIC (&gt;15%) as they indicate 
                    a sustainable competitive advantage.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📈 Reinvestment Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    Shows what percentage of profits are reinvested back into the business for growth. 
                    Higher rates (&gt;20%) suggest the company has abundant profitable growth opportunities.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🚀 ROIIC</h4>
                  <p className="text-sm text-muted-foreground">
                    Returns on incremental invested capital - shows if the company's growth investments 
                    are actually profitable. This separates truly great businesses from growth traps.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!symbol && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Enter a stock symbol above to analyze it using Warren Buffett's investment criteria
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WarrenBuffettAnalysis;
