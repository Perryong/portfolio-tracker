import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { TechnicalIndicators } from "@/services/riskAnalysisService";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface TechnicalIndicatorsCardProps {
  technicalIndicators: TechnicalIndicators;
}

const TechnicalIndicatorsCard: React.FC<TechnicalIndicatorsCardProps> = ({ technicalIndicators }) => {
  const getSignalBadge = (signal: "bullish" | "bearish" | "neutral", confidence: number) => {
    const confidencePercent = Math.round(confidence * 100);
    
    if (signal === "bullish") {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
        <TrendingUp className="h-3 w-3 mr-1" />
        Bullish ({confidencePercent}%)
      </Badge>;
    } else if (signal === "bearish") {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
        <TrendingDown className="h-3 w-3 mr-1" />
        Bearish ({confidencePercent}%)
      </Badge>;
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-300">
        Neutral ({confidencePercent}%)
      </Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Advanced Technical Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Advanced Signals Overview */}
        {technicalIndicators.advancedSignals && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              Multi-Strategy Analysis
              {getSignalBadge(
                technicalIndicators.advancedSignals.signal,
                technicalIndicators.advancedSignals.confidence
              )}
            </h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Combined Score</div>
                <div className="text-lg font-semibold">
                  {formatNumber(technicalIndicators.advancedSignals.combined_score)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">ADX</div>
                <div className="text-lg font-semibold">
                  {technicalIndicators.adx ? formatNumber(technicalIndicators.adx) : 'N/A'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Hurst Exponent</div>
                <div className="text-lg font-semibold">
                  {technicalIndicators.hurstExponent ? formatNumber(technicalIndicators.hurstExponent) : 'N/A'}
                </div>
              </div>
            </div>

            {/* Strategy Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Strategy Signals</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Trend Following:</span>
                    {getSignalBadge(
                      technicalIndicators.advancedSignals.strategies.trend_following.signal,
                      technicalIndicators.advancedSignals.strategies.trend_following.confidence
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mean Reversion:</span>
                    {getSignalBadge(
                      technicalIndicators.advancedSignals.strategies.mean_reversion.signal,
                      technicalIndicators.advancedSignals.strategies.mean_reversion.confidence
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Momentum:</span>
                    {getSignalBadge(
                      technicalIndicators.advancedSignals.strategies.momentum.signal,
                      technicalIndicators.advancedSignals.strategies.momentum.confidence
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Volatility:</span>
                    {getSignalBadge(
                      technicalIndicators.advancedSignals.strategies.volatility.signal,
                      technicalIndicators.advancedSignals.strategies.volatility.confidence
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Statistical Arbitrage:</span>
                    {getSignalBadge(
                      technicalIndicators.advancedSignals.strategies.statistical_arbitrage.signal,
                      technicalIndicators.advancedSignals.strategies.statistical_arbitrage.confidence
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Key Metrics</h5>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Trend Strength</TableCell>
                      <TableCell className="text-right">
                        {technicalIndicators.trendStrength ? formatNumber(technicalIndicators.trendStrength) : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Volatility Regime</TableCell>
                      <TableCell className="text-right">
                        {technicalIndicators.volatilityRegime ? formatNumber(technicalIndicators.volatilityRegime) : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Momentum Score</TableCell>
                      <TableCell className="text-right">
                        {technicalIndicators.momentumScore ? formatNumber(technicalIndicators.momentumScore) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* Traditional Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Price Indicators</h4>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">RSI (21)</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.rsi ? formatNumber(technicalIndicators.rsi) : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SMA (20)</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.sma20 ? formatCurrency(technicalIndicators.sma20) : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SMA (50)</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.sma50 ? formatCurrency(technicalIndicators.sma50) : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SMA (200)</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.sma200 ? formatCurrency(technicalIndicators.sma200) : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EMA (20)</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.ema20 ? formatCurrency(technicalIndicators.ema20) : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EMA (50)</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.ema50 ? formatCurrency(technicalIndicators.ema50) : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">VWMA (20)</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.vwma20 ? formatCurrency(technicalIndicators.vwma20) : 'N/A'}
                  </TableCell>
                </TableRow>
                {technicalIndicators.bollingerBands && (
                  <>
                    <TableRow>
                      <TableCell className="font-medium">Bollinger Upper</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(technicalIndicators.bollingerBands.upper)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Bollinger Lower</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(technicalIndicators.bollingerBands.lower)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Momentum & Volume</h4>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">MACD</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.macd ? formatNumber(technicalIndicators.macd.macd) : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">MACD Signal</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.macd ? formatNumber(technicalIndicators.macd.signal) : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">MACD Histogram</TableCell>
                  <TableCell className="text-right">
                    {technicalIndicators.macd ? formatNumber(technicalIndicators.macd.histogram) : 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Volume SMA(20)</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(technicalIndicators.volumeSma20, 0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Price Change</TableCell>
                  <TableCell className="text-right">
                    <span className={technicalIndicators.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {technicalIndicators.priceChange >= 0 ? '+' : ''}{formatCurrency(technicalIndicators.priceChange)} ({formatNumber(technicalIndicators.priceChangePercent)}%)
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalIndicatorsCard;
