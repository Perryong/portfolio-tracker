
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { BarChart3 } from "lucide-react";
import { TechnicalIndicators } from "@/services/riskAnalysisService";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface TechnicalIndicatorsCardProps {
  technicalIndicators: TechnicalIndicators;
}

const TechnicalIndicatorsCard: React.FC<TechnicalIndicatorsCardProps> = ({ technicalIndicators }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                  <TableCell className="font-medium">Average Volume</TableCell>
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
