
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FinancialSnapshot } from "@/services/financialDatasetsService";
import { formatNumber } from "@/lib/utils";

interface FinancialMetricsCardsProps {
  financialData: FinancialSnapshot;
}

const FinancialMetricsCards: React.FC<FinancialMetricsCardsProps> = ({ financialData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Valuation Ratios */}
      <Card>
        <CardHeader>
          <CardTitle>Valuation Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">P/E Ratio</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.price_to_earnings_ratio)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">P/B Ratio</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.price_to_book_ratio)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">P/S Ratio</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.price_to_sales_ratio)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EV/EBITDA</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.enterprise_value_to_ebitda_ratio)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">PEG Ratio</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.peg_ratio)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Profitability Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Profitability Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Gross Margin</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.gross_margin * 100)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Operating Margin</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.operating_margin * 100)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Net Margin</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.net_margin * 100)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ROE</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.return_on_equity * 100)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ROA</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.return_on_assets * 100)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Revenue Growth</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.revenue_growth)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Earnings Growth</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.earnings_growth)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">FCF Growth</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.free_cash_flow_growth)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Book Value Growth</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.book_value_growth)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EPS Growth</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.earnings_per_share_growth)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Financial Health */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Current Ratio</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.current_ratio)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Quick Ratio</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.quick_ratio)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Debt to Equity</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.debt_to_equity)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Debt to Assets</TableCell>
                <TableCell className="text-right">
                  {formatNumber(financialData.debt_to_assets)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Interest Coverage</TableCell>
                <TableCell className="text-right">
                  {financialData.interest_coverage ? formatNumber(financialData.interest_coverage) : 'N/A'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMetricsCards;
