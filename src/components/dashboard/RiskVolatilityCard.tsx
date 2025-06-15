
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Activity } from "lucide-react";
import { RiskMetrics } from "@/services/riskAnalysisService";
import { formatNumber } from "@/lib/utils";

interface RiskVolatilityCardProps {
  riskMetrics: RiskMetrics;
}

const RiskVolatilityCard: React.FC<RiskVolatilityCardProps> = ({ riskMetrics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Risk & Volatility Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Historical Volatility (Annualized)</TableCell>
              <TableCell className="text-right">
                {formatNumber(riskMetrics.historicalVolatility * 100)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Value at Risk (95%)</TableCell>
              <TableCell className="text-right">
                {formatNumber(riskMetrics.var95 * 100)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Value at Risk (99%)</TableCell>
              <TableCell className="text-right">
                {formatNumber(riskMetrics.var99 * 100)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Sharpe Ratio</TableCell>
              <TableCell className="text-right">
                {riskMetrics.sharpeRatio ? formatNumber(riskMetrics.sharpeRatio) : 'N/A'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Maximum Drawdown</TableCell>
              <TableCell className="text-right">
                {formatNumber(riskMetrics.maxDrawdown * 100)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Beta</TableCell>
              <TableCell className="text-right">
                {riskMetrics.beta ? formatNumber(riskMetrics.beta) : 'N/A'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RiskVolatilityCard;
