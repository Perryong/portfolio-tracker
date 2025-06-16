import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePeterLynchAnalysis } from "@/hooks/usePeterLynchAnalysis";
import { TrendingUp, TrendingDown, Minus, Target, DollarSign, Award, AlertTriangle, Info } from "lucide-react";
import SearchSection from "./SearchSection";

const PeterLynchAnalysis = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [inputSymbol, setInputSymbol] = useState<string>("");

  const { analysis, isLoading, error } = usePeterLynchAnalysis(symbol);

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
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPEGColor = (pegRatio: number | null) => {
    if (!pegRatio) return 'text-gray-500';
    if (pegRatio < 1) return 'text-green-600';
    if (pegRatio < 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const hasSymbol = Boolean(symbol);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <SearchSection
        inputSymbol={inputSymbol}
        setInputSymbol={setInputSymbol}
        handleSearch={handleSearch}
        handleKeyDown={handleKeyDown}
        isLoading={isLoading}
        error={error}
        hasSymbol={hasSymbol}
        symbol={symbol}
      />

      {/* Peter Lynch Philosophy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Peter Lynch's Investment Philosophy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Core Principles:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• "Invest in what you know" - Understand the business</li>
                <li>• Growth at a Reasonable Price (GARP)</li>
                <li>• PEG ratio &lt; 1.0 is ideal</li>
                <li>• Look for "ten-baggers" - 10x potential</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What Lynch Avoided:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Overly complex businesses</li>
                <li>• High debt companies</li>
                <li>• Overvalued "story stocks"</li>
                <li>• Companies without earnings growth</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {hasSymbol && analysis && (
        <>
          {/* Overall Signal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Peter Lynch Signal: {symbol}</span>
                <div className="flex items-center gap-2">
                  {getSignalIcon(analysis.signal)}
                  <Badge className={getSignalColor(analysis.signal)}>
                    {analysis.signal.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {analysis.confidence}% confidence
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Lynch's Reasoning:</h4>
                  <p className="text-sm whitespace-pre-line">{analysis.reasoning}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GARP Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Growth at a Reasonable Price (GARP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {analysis.garpAnalysis.pegRatio ? (
                      <span className={getPEGColor(analysis.garpAnalysis.pegRatio)}>
                        {analysis.garpAnalysis.pegRatio.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">PEG Ratio</div>
                  <div className="text-xs mt-1">
                    {analysis.garpAnalysis.pegRatio && analysis.garpAnalysis.pegRatio < 1 
                      ? "Lynch's Sweet Spot!" 
                      : "Target: < 1.0"}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {analysis.garpAnalysis.peRatio ? 
                      analysis.garpAnalysis.peRatio.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">P/E Ratio</div>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {analysis.garpAnalysis.growthRate ? 
                      `${(analysis.garpAnalysis.growthRate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Growth Rate</div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">GARP Assessment:</h4>
                <p className="text-sm text-muted-foreground mb-2">{analysis.garpAnalysis.interpretation}</p>
                <ul className="text-sm space-y-1">
                  {analysis.garpAnalysis.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Growth Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Growth Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Growth Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue Growth:</span>
                      <span className="font-medium">
                        {analysis.growthAnalysis.revenueGrowth ? 
                          `${(analysis.growthAnalysis.revenueGrowth * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Earnings Growth:</span>
                      <span className="font-medium">
                        {analysis.growthAnalysis.earningsGrowth ? 
                          `${(analysis.growthAnalysis.earningsGrowth * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Growth Trend:</span>
                      <Badge variant="outline">{analysis.growthAnalysis.growthTrend}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Consistent Growth:</span>
                      <Badge variant={analysis.growthAnalysis.consistentGrowth ? "default" : "secondary"}>
                        {analysis.growthAnalysis.consistentGrowth ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Growth Details</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.growthAnalysis.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Business Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Profitability Margins</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Gross Margin:</span>
                      <span className="font-medium">
                        {analysis.businessQuality.profitMargins.gross ? 
                          `${(analysis.businessQuality.profitMargins.gross * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Operating Margin:</span>
                      <span className="font-medium">
                        {analysis.businessQuality.profitMargins.operating ? 
                          `${(analysis.businessQuality.profitMargins.operating * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Net Margin:</span>
                      <span className="font-medium">
                        {analysis.businessQuality.profitMargins.net ? 
                          `${(analysis.businessQuality.profitMargins.net * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Financial Strength</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Debt-to-Equity:</span>
                      <span className="font-medium">
                        {analysis.businessQuality.debtToEquity ? 
                          analysis.businessQuality.debtToEquity.toFixed(2) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Return on Equity:</span>
                      <span className="font-medium">
                        {analysis.businessQuality.returnOnEquity ? 
                          `${(analysis.businessQuality.returnOnEquity * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Business Model:</span>
                      <Badge variant="outline">{analysis.businessQuality.businessModel}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Competitive Position:</span>
                      <Badge variant={
                        analysis.businessQuality.competitivePosition === 'strong' ? 'default' :
                        analysis.businessQuality.competitivePosition === 'moderate' ? 'secondary' : 'destructive'
                      }>
                        {analysis.businessQuality.competitivePosition}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Quality Assessment:</h4>
                <ul className="text-sm space-y-1">
                  {analysis.businessQuality.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Ten-Bagger Potential */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Ten-Bagger Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Opportunity Assessment</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Market Opportunity:</span>
                      <Badge variant={
                        analysis.tenBaggerPotential.marketOpportunity === 'large' ? 'default' :
                        analysis.tenBaggerPotential.marketOpportunity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {analysis.tenBaggerPotential.marketOpportunity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Growth Runway:</span>
                      <span className="font-medium">{analysis.tenBaggerPotential.growthRunway} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Probability:</span>
                      <span className="font-medium text-orange-600">
                        {analysis.tenBaggerPotential.probability}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time Horizon:</span>
                      <span className="font-medium">{analysis.tenBaggerPotential.timeHorizon}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Key Factors</h4>
                  
                  {analysis.tenBaggerPotential.competitiveAdvantages.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-green-700 mb-1">Competitive Advantages:</h5>
                      <ul className="text-sm space-y-1">
                        {analysis.tenBaggerPotential.competitiveAdvantages.map((advantage, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.tenBaggerPotential.riskFactors.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-1">Risk Factors:</h5>
                      <ul className="text-sm space-y-1">
                        {analysis.tenBaggerPotential.riskFactors.map((risk, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Ten-Bagger Assessment:</h4>
                <ul className="text-sm space-y-1">
                  {analysis.tenBaggerPotential.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Loading State */}
      {hasSymbol && isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Loading Peter Lynch analysis for {symbol}...</div>
          </CardContent>
        </Card>
      )}

      {/* Peter Lynch Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            About Peter Lynch's Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">The PEG Ratio (Key Metric):</h4>
              <p className="text-muted-foreground">
                PEG = (P/E Ratio) ÷ (Growth Rate). Lynch preferred stocks with PEG ratios under 1.0, 
                indicating you're paying a fair price for growth. A PEG of 0.5 suggests exceptional value.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Stock Categories (Lynch's Classification):</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>Slow Growers:</strong> Large, mature companies (3-5% growth)</li>
                <li>• <strong>Stalwarts:</strong> Large companies with moderate growth (8-12%)</li>
                <li>• <strong>Fast Growers:</strong> Small, aggressive companies (15-25% growth)</li>
                <li>• <strong>Cyclicals:</strong> Companies tied to economic cycles</li>
                <li>• <strong>Turnarounds:</strong> Troubled companies with recovery potential</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Famous Lynch Quotes:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• "Invest in what you know"</li>
                <li>• "The stock market is a voting machine, not a weighing machine"</li>
                <li>• "You can't see the future through a rearview mirror"</li>
                <li>• "Know what you own, and know why you own it"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeterLynchAnalysis;
