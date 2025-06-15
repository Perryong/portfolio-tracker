
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFinancialData } from "@/hooks/useFinancialData";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Calculator, Search, TrendingUp, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StockValuations = () => {
  const [symbol, setSymbol] = useState<string>("AAPL");
  const [inputSymbol, setInputSymbol] = useState<string>("AAPL");
  const [intrinsicValue, setIntrinsicValue] = useState<number | null>(null);

  const { 
    financialData, 
    isLoading, 
    error, 
    isCalculating,
    refetch,
    calculateValuation 
  } = useFinancialData(symbol);

  const handleSearch = () => {
    if (inputSymbol.trim()) {
      setSymbol(inputSymbol.trim().toUpperCase());
      setIntrinsicValue(null);
    }
  };

  const handleCalculateValuation = async () => {
    const value = await calculateValuation();
    setIntrinsicValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const latestIncomeStatement = financialData?.income_statements?.[0];
  const latestBalanceSheet = financialData?.balance_sheets?.[0];
  const latestCashFlow = financialData?.cash_flow_statements?.[0];

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Stock Valuation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input 
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g. AAPL)"
              className="max-w-sm"
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">
              Error loading financial data. Please try again.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Valuation Summary */}
      {financialData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Valuation Summary - {symbol}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {latestIncomeStatement?.earnings_per_share ? 
                    formatCurrency(latestIncomeStatement.earnings_per_share) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Earnings Per Share</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {latestCashFlow?.free_cash_flow ? 
                    formatCurrency(latestCashFlow.free_cash_flow / 1000000) + 'M' : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Free Cash Flow</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {intrinsicValue ? formatCurrency(intrinsicValue) : 'Calculate'}
                </div>
                <div className="text-sm text-muted-foreground">Intrinsic Value</div>
              </div>
            </div>
            
            <Button 
              onClick={handleCalculateValuation} 
              disabled={isCalculating || !financialData}
              className="w-full"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {isCalculating ? 'Calculating...' : 'Calculate Intrinsic Value'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Financial Statements */}
      {financialData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Statement */}
          <Card>
            <CardHeader>
              <CardTitle>Income Statement</CardTitle>
              <Badge variant="outline">
                {latestIncomeStatement?.report_period || 'Latest'}
              </Badge>
            </CardHeader>
            <CardContent>
              {latestIncomeStatement && (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Revenue</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(latestIncomeStatement.revenue / 1000000)}M
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Gross Profit</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(latestIncomeStatement.gross_profit / 1000000)}M
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Operating Income</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(latestIncomeStatement.operating_income / 1000000)}M
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Net Income</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(latestIncomeStatement.net_income / 1000000)}M
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Balance Sheet */}
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet</CardTitle>
              <Badge variant="outline">
                {latestBalanceSheet?.report_period || 'Latest'}
              </Badge>
            </CardHeader>
            <CardContent>
              {latestBalanceSheet && (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Total Assets</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(latestBalanceSheet.total_assets / 1000000)}M
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cash & Equivalents</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(latestBalanceSheet.cash_and_equivalents / 1000000)}M
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Debt</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(latestBalanceSheet.total_debt / 1000000)}M
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Shareholders Equity</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(latestBalanceSheet.shareholders_equity / 1000000)}M
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Loading financial data...</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockValuations;