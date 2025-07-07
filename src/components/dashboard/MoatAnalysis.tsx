
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
  Shield, 
  Castle, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';

const MoatAnalysis = () => {
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

  const getMoatStrength = (score: number): { strength: string; color: string; icon: React.ReactNode } => {
    if (score >= 80) {
      return { 
        strength: 'Strong MOAT', 
        color: 'text-green-600', 
        icon: <Shield className="h-5 w-5 text-green-600" />
      };
    } else if (score >= 60) {
      return { 
        strength: 'Moderate MOAT', 
        color: 'text-yellow-600', 
        icon: <Castle className="h-5 w-5 text-yellow-600" />
      };
    } else {
      return { 
        strength: 'Weak/No MOAT', 
        color: 'text-red-600', 
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />
      };
    }
  };

  const getMoatCategory = (buffettMetrics: any): string[] => {
    const categories: string[] = [];
    
    if (buffettMetrics.roic >= 0.20) {
      categories.push("Capital Efficiency Advantage");
    }
    if (buffettMetrics.reinvestmentRate >= 0.25) {
      categories.push("Growth Opportunity Moat");
    }
    if (buffettMetrics.roiic >= 0.18) {
      categories.push("Profitable Expansion Moat");
    }
    if (buffettMetrics.roic >= 0.15 && buffettMetrics.reinvestmentRate >= 0.20) {
      categories.push("Compounding Machine");
    }
    
    return categories.length > 0 ? categories : ["Limited Competitive Advantage"];
  };

  const getMoatColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Economic MOAT Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input 
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g. AAPL, KO, MSFT)"
              className="max-w-sm"
              onKeyDown={handleKeyDown}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !inputSymbol.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Analyze MOAT
            </Button>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Economic MOATs are durable competitive advantages that protect a company's profits 
              and enable sustainable wealth creation over time.
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
            <div className="text-center">Analyzing {symbol}'s economic MOAT...</div>
          </CardContent>
        </Card>
      )}

      {buffettMetrics && financialData && (
        <>
          {/* MOAT Strength Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Castle className="h-5 w-5" />
                MOAT Strength Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {getMoatStrength(buffettMetrics.compoundingScore).icon}
                  <span className={`text-2xl font-bold ${getMoatStrength(buffettMetrics.compoundingScore).color}`}>
                    {getMoatStrength(buffettMetrics.compoundingScore).strength}
                  </span>
                </div>
                <div className={`text-4xl font-bold ${getMoatColor(buffettMetrics.compoundingScore)}`}>
                  {buffettMetrics.compoundingScore}/100
                </div>
                <Progress value={buffettMetrics.compoundingScore} className="h-4 mt-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Capital Efficiency MOAT */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Capital Efficiency</span>
                      {buffettMetrics.roic >= 0.15 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className={`font-bold ${getMoatColor(buffettMetrics.roicScore)}`}>
                      {formatNumber(buffettMetrics.roic * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (buffettMetrics.roic / 0.25) * 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    ROIC measures how efficiently capital generates returns
                  </div>
                </div>

                {/* Growth Opportunity MOAT */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Growth Opportunities</span>
                      {buffettMetrics.reinvestmentRate >= 0.20 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className={`font-bold ${getMoatColor(buffettMetrics.reinvestmentScore)}`}>
                      {formatNumber(buffettMetrics.reinvestmentRate * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (buffettMetrics.reinvestmentRate / 0.40) * 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    Reinvestment indicates available profitable growth
                  </div>
                </div>

                {/* Profitable Growth MOAT */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Profitable Growth</span>
                      {buffettMetrics.roiic >= 0.15 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className={`font-bold ${getMoatColor(buffettMetrics.roiicScore)}`}>
                      {formatNumber(buffettMetrics.roiic * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (buffettMetrics.roiic / 0.25) * 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    ROIIC shows returns on new investments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MOAT Categories & Competitive Advantages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Competitive Advantage Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Identified MOAT Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {getMoatCategory(buffettMetrics).map((category, index) => (
                      <Badge 
                        key={index} 
                        variant={category === "Limited Competitive Advantage" ? "destructive" : "default"}
                        className="px-3 py-1"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Competitive Strengths */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      MOAT Strengths
                    </h4>
                    <ul className="space-y-2">
                      {buffettMetrics.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Shield className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* MOAT Vulnerabilities */}
                  <div>
                    <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      MOAT Vulnerabilities
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

          {/* MOAT Sustainability Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                MOAT Sustainability & Investment Thesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-lg leading-relaxed">{buffettMetrics.investmentThesis}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold mb-1">
                      {buffettMetrics.isCompoundingMachine ? '5-10+' : '2-5'}
                    </div>
                    <div className="text-sm text-muted-foreground">Years MOAT Duration</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold mb-1">
                      {buffettMetrics.compoundingScore >= 80 ? 'High' : 
                       buffettMetrics.compoundingScore >= 60 ? 'Medium' : 'Low'}
                    </div>
                    <div className="text-sm text-muted-foreground">Sustainability Rating</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold mb-1">
                      {buffettMetrics.isCompoundingMachine ? 'Low' : 'Medium-High'}
                    </div>
                    <div className="text-sm text-muted-foreground">Erosion Risk</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <Card>
            <CardHeader>
              <CardTitle>Understanding Economic MOATs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">🏰 What is a MOAT?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    An economic moat is a durable competitive advantage that protects a company's 
                    profits from competitors, like a medieval castle's moat protected against invaders.
                  </p>
                  
                  <h4 className="font-semibold mb-2">📊 MOAT Indicators</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• High & consistent ROIC (&gt;15%)</li>
                    <li>• Strong reinvestment opportunities</li>
                    <li>• Profitable growth track record</li>
                    <li>• Sustainable competitive advantages</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">🎯 MOAT Types</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Cost Leadership:</strong> Lowest cost producer</li>
                    <li>• <strong>Brand Power:</strong> Premium pricing ability</li>
                    <li>• <strong>Network Effects:</strong> Value increases with users</li>
                    <li>• <strong>Switching Costs:</strong> Expensive to leave</li>
                    <li>• <strong>Regulatory:</strong> Government protection</li>
                  </ul>
                  
                  <h4 className="font-semibold mb-2 mt-4">⚠️ MOAT Risks</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Technology disruption</li>
                    <li>• Regulatory changes</li>
                    <li>• New market entrants</li>
                    <li>• Consumer preference shifts</li>
                  </ul>
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
              Enter a stock symbol above to analyze its economic MOAT strength
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MoatAnalysis;
