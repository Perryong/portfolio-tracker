import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { useSummaryAnalysis } from '@/hooks/useSummaryAnalysis';
import { WeightedAnalysis } from '@/types/summaryAnalysis';
import { AnalysisMethodSelector, SelectedMethods, presetConfigurations } from './AnalysisMethodSelector';
import { popularStocks } from '@/services/stockService';
import { 
  Search, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const SummaryAnalysis = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [inputSymbol, setInputSymbol] = useState<string>("");
  const [showWeightConfig, setShowWeightConfig] = useState<boolean>(false);
  const [selectedMethods, setSelectedMethods] = useState<SelectedMethods>({
    warrenBuffett: true,
    charlieMunger: true,
    peterLynch: true,
    billAckman: true,
    quantitative: true
  });

  const { summaryAnalysis, isLoading, error, weights, updateWeights } = useSummaryAnalysis(
    symbol, 
    undefined, 
    selectedMethods
  );

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

  const handleMethodToggle = (method: keyof SelectedMethods) => {
    const newSelectedMethods = {
      ...selectedMethods,
      [method]: !selectedMethods[method]
    };
    setSelectedMethods(newSelectedMethods);
    
    // Auto-distribute weights when methods change
    autoDistributeWeights(newSelectedMethods);
  };

  const autoDistributeWeights = (methods: SelectedMethods = selectedMethods) => {
    const selectedCount = Object.values(methods).filter(Boolean).length;
    if (selectedCount === 0) return;

    const equalWeight = Math.floor(100 / selectedCount);
    const remainder = 100 - (equalWeight * selectedCount);
    
    const newWeights: WeightedAnalysis = {
      warrenBuffett: 0,
      charlieMunger: 0,
      peterLynch: 0,
      billAckman: 0,
      quantitative: 0
    };

    let remainderDistributed = 0;
    Object.entries(methods).forEach(([method, isSelected], index) => {
      if (isSelected) {
        newWeights[method as keyof WeightedAnalysis] = equalWeight + 
          (remainderDistributed < remainder ? 1 : 0);
        if (remainderDistributed < remainder) remainderDistributed++;
      }
    });

    updateWeights(newWeights);
  };

  const handleApplyPreset = (presetName: string) => {
    const preset = presetConfigurations[presetName as keyof typeof presetConfigurations];
    if (preset) {
      setSelectedMethods(preset.methods);
      updateWeights(preset.weights);
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'SELL':
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
      case 'bullish':
        return 'bg-green-500';
      case 'SELL':
      case 'bearish':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleWeightChange = (method: keyof WeightedAnalysis, value: number) => {
    const newWeights = { ...weights, [method]: value };
    updateWeights(newWeights);
  };

  const getMethodWeight = (methodName: string): number => {
    const methodMapping: { [key: string]: keyof WeightedAnalysis } = {
      'Warren Buffett': 'warrenBuffett',
      'Charlie Munger': 'charlieMunger',
      'Peter Lynch': 'peterLynch',
      'Bill Ackman': 'billAckman',
      'Quantitative': 'quantitative'
    };
    
    const weightKey = methodMapping[methodName];
    return weightKey ? weights[weightKey] : 0;
  };

  const getMethodDisplayName = (method: string): string => {
    switch (method) {
      case 'warrenBuffett': return 'Warren Buffett';
      case 'charlieMunger': return 'Charlie Munger';
      case 'peterLynch': return 'Peter Lynch';
      case 'billAckman': return 'Bill Ackman';
      case 'quantitative': return 'Quantitative';
      default: return method;
    }
  };

  // Filter methods based on selection
  const filteredMethodScores = summaryAnalysis?.methodScores.filter(method => {
    const methodMapping: { [key: string]: keyof SelectedMethods } = {
      'Warren Buffett': 'warrenBuffett',
      'Charlie Munger': 'charlieMunger',
      'Peter Lynch': 'peterLynch',
      'Bill Ackman': 'billAckman',
      'Quantitative': 'quantitative'
    };
    const methodKey = methodMapping[method.method];
    return methodKey ? selectedMethods[methodKey] : false;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Investment Summary Analysis
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
              This analysis consolidates insights from multiple investment methodologies to provide 
              a comprehensive investment recommendation with configurable weighting.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Analysis Method Selection */}
      <AnalysisMethodSelector
        selectedMethods={selectedMethods}
        onMethodToggle={handleMethodToggle}
        onApplyPreset={handleApplyPreset}
        onAutoDistribute={() => autoDistributeWeights()}
      />

      {error && symbol && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error in analysis: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && symbol && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Consolidating analysis for {symbol}...</div>
          </CardContent>
        </Card>
      )}

      {summaryAnalysis && Object.values(selectedMethods).some(Boolean) && (
        <>
          {/* Final Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Final Investment Recommendation: {summaryAnalysis.ticker}</span>
                <Badge className={`${getSignalColor(summaryAnalysis.finalRecommendation.recommendation)} text-white text-lg px-4 py-2`}>
                  {summaryAnalysis.finalRecommendation.recommendation}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Weighted Score</span>
                    <span className={`font-bold ${getScoreColor(summaryAnalysis.finalRecommendation.weightedScore)}`}>
                      {summaryAnalysis.finalRecommendation.weightedScore}/100
                    </span>
                  </div>
                  <Progress value={summaryAnalysis.finalRecommendation.weightedScore} className="h-3" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Confidence</span>
                    <span className="font-bold">{summaryAnalysis.finalRecommendation.confidence}%</span>
                  </div>
                  <Progress value={summaryAnalysis.finalRecommendation.confidence} className="h-3" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Selected Methods</span>
                    <span className="font-bold">{filteredMethodScores.length}/5</span>
                  </div>
                  <Progress value={(filteredMethodScores.length / 5) * 100} className="h-3" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Investment Thesis</h4>
                  <p className="text-muted-foreground">{summaryAnalysis.finalRecommendation.reasoning}</p>
                </div>

                {summaryAnalysis.finalRecommendation.keyInsights.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Insights</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {summaryAnalysis.finalRecommendation.keyInsights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Method Analysis Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Analysis Method Breakdown</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWeightConfig(!showWeightConfig)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Weights
              </Button>
            </CardHeader>
            <CardContent>
              {showWeightConfig && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-4">Method Weights Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {(Object.entries(weights) as [keyof WeightedAnalysis, number][])
                      .filter(([method]) => selectedMethods[method])
                      .map(([method, weight]) => (
                      <div key={method} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            {getMethodDisplayName(method)}
                          </span>
                          <span className="text-sm">{weight}%</span>
                        </div>
                        <Slider
                          value={[weight]}
                          onValueChange={(values) => handleWeightChange(method, values[0])}
                          max={50}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Total weight: {Object.entries(weights)
                      .filter(([method]) => selectedMethods[method as keyof SelectedMethods])
                      .reduce((sum, [, weight]) => sum + (weight as number), 0)}% 
                    (doesn't need to equal 100%)
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Method</th>
                      <th className="text-center py-3 px-2">Signal</th>
                      <th className="text-center py-3 px-2">Score</th>
                      <th className="text-center py-3 px-2">Confidence</th>
                      <th className="text-center py-3 px-2">Weight</th>
                      <th className="text-left py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMethodScores.map((method, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-2 font-medium">{method.method}</td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getSignalIcon(method.signal)}
                            <Badge variant="outline" className={`${getSignalColor(method.signal)} text-white`}>
                              {method.signal}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`font-medium ${getScoreColor(method.score)}`}>
                            {method.available ? Math.round(method.score) : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="font-medium">
                            {method.available ? `${Math.round(method.confidence)}%` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="font-medium">
                            {getMethodWeight(method.method)}%
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {method.available ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs">Available</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <XCircle className="h-4 w-4" />
                              <span className="text-xs">No data</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Concerns */}
          {(summaryAnalysis.finalRecommendation.strengths.length > 0 || 
            summaryAnalysis.finalRecommendation.concerns.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {summaryAnalysis.finalRecommendation.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summaryAnalysis.finalRecommendation.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {summaryAnalysis.finalRecommendation.concerns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      Areas of Concern
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summaryAnalysis.finalRecommendation.concerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {!symbol && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Enter a stock symbol above to generate a comprehensive investment analysis summary
            </div>
          </CardContent>
        </Card>
      )}

      {symbol && Object.values(selectedMethods).every(method => !method) && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Please select at least one analysis method to proceed with the evaluation
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SummaryAnalysis;
