
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuantitativeRecommendation } from "@/types/quantitativeAnalysis";
import { StockQuote } from "@/types";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Target, Loader2, Activity, Building2 } from "lucide-react";

interface QuantitativeRecommendationProps {
  recommendation: QuantitativeRecommendation;
  symbol: string;
  stockPrice?: StockQuote | null;
  isPriceLoading?: boolean;
}

export const QuantitativeRecommendationComponent: React.FC<QuantitativeRecommendationProps> = ({
  recommendation,
  symbol,
  stockPrice,
  isPriceLoading = false
}) => {
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "BUY": return "bg-green-500";
      case "WEAK_BUY": return "bg-green-400";
      case "HOLD": return "bg-yellow-500";
      case "WEAK_SELL": return "bg-red-400";
      case "SELL": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case "BUY":
      case "WEAK_BUY":
        return <TrendingUp className="h-4 w-4" />;
      case "HOLD":
        return <Minus className="h-4 w-4" />;
      case "WEAK_SELL":
      case "SELL":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Overall Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quantitative Analysis - {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Close Price Column */}
            <div className="text-center">
              {isPriceLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : stockPrice ? (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stockPrice.c)}
                  </div>
                  <div className={`text-sm ${getPriceChangeColor(stockPrice.d)}`}>
                    {stockPrice.d >= 0 ? '+' : ''}{formatCurrency(stockPrice.d)} ({formatNumber(stockPrice.dp)}%)
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Price unavailable</div>
              )}
              <div className="text-sm text-muted-foreground">Close Price</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(recommendation.technicalScore)}`}>
                {formatNumber(recommendation.technicalScore)}
              </div>
              <div className="text-sm text-muted-foreground">Technical Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(recommendation.fundamentalScore)}`}>
                {formatNumber(recommendation.fundamentalScore)}
              </div>
              <div className="text-sm text-muted-foreground">Fundamental Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(recommendation.riskAdjustedScore)}`}>
                {formatNumber(recommendation.riskAdjustedScore)}
              </div>
              <div className="text-sm text-muted-foreground">Risk-Adjusted Score</div>
            </div>
            <div className="text-center">
              <Badge className={`${getRecommendationColor(recommendation.recommendation)} text-white text-lg px-4 py-2`}>
                {getRecommendationIcon(recommendation.recommendation)}
                <span className="ml-2">{recommendation.recommendation.replace('_', ' ')}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Breakdown - Now Properly Separated */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Analysis - Price & Momentum Focus */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Activity className="h-5 w-5" />
              Price & Momentum Analysis: {recommendation.technicalVerdict}
            </CardTitle>
            <p className="text-sm text-blue-600">
              Analyzes price movements, trends, volume, and momentum indicators
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Technical Insights Summary */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Trend:</span>
                <p className="text-muted-foreground">{recommendation.technicalInsights.trendDirection}</p>
              </div>
              <div>
                <span className="font-medium">Momentum:</span>
                <p className="text-muted-foreground">{recommendation.technicalInsights.momentumStrength}</p>
              </div>
              <div>
                <span className="font-medium">Volume:</span>
                <p className="text-muted-foreground">{recommendation.technicalInsights.volumeConfirmation}</p>
              </div>
              <div>
                <span className="font-medium">Volatility:</span>
                <p className="text-muted-foreground">{recommendation.technicalInsights.volatilityContext}</p>
              </div>
            </div>

            {/* Technical Rationale */}
            <div className="space-y-3">
              {recommendation.technicalRationale.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  {item.includes('❌') ? (
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fundamental Analysis - Business & Valuation Focus */}
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Building2 className="h-5 w-5" />
              Business & Valuation Analysis: {recommendation.fundamentalVerdict}
            </CardTitle>
            <p className="text-sm text-orange-600">
              Analyzes financial health, growth, profitability, and valuation metrics
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fundamental Insights Summary */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Valuation:</span>
                <p className="text-muted-foreground">{recommendation.fundamentalInsights.valuation}</p>
              </div>
              <div>
                <span className="font-medium">Growth:</span>
                <p className="text-muted-foreground">{recommendation.fundamentalInsights.growth}</p>
              </div>
              <div>
                <span className="font-medium">Profitability:</span>
                <p className="text-muted-foreground">{recommendation.fundamentalInsights.profitability}</p>
              </div>
              <div>
                <span className="font-medium">Financial Health:</span>
                <p className="text-muted-foreground">{recommendation.fundamentalInsights.financialHealth}</p>
              </div>
            </div>

            {/* Fundamental Rationale */}
            <div className="space-y-3">
              {recommendation.fundamentalRationale.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  {item.includes('🚨') ? (
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : item.includes('⚠️') ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle>Final Quantitative Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className={recommendation.recommendation.includes('SELL') ? 'border-red-200' : 
                              recommendation.recommendation.includes('BUY') ? 'border-green-200' : 'border-yellow-200'}>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>Risk-Adjusted Score: {formatNumber(recommendation.riskAdjustedScore)}/100</strong>
                <br />
                <strong>Recommendation: {recommendation.recommendation.replace('_', ' ')}</strong>
              </AlertDescription>
            </Alert>

            {recommendation.alternativeStrategy && (
              <div>
                <h4 className="font-semibold mb-2">Alternative Strategy:</h4>
                <p className="text-sm text-muted-foreground">{recommendation.alternativeStrategy}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Portfolio Allocation:</h4>
              <p className="text-sm font-medium">{recommendation.portfolioAllocation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
