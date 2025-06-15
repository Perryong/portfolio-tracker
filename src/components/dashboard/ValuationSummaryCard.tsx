
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign } from "lucide-react";
import { FinancialSnapshot } from "@/services/financialDatasetsService";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface ValuationSummaryCardProps {
  financialData: FinancialSnapshot;
  symbol: string;
  intrinsicValue: number | null;
  isCalculating: boolean;
  handleCalculateValuation: () => void;
}

const ValuationSummaryCard: React.FC<ValuationSummaryCardProps> = ({
  financialData,
  symbol,
  intrinsicValue,
  isCalculating,
  handleCalculateValuation
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Valuation Summary - {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              ${formatNumber(financialData.market_cap / 1000000000)}B
            </div>
            <div className="text-sm text-muted-foreground">Market Cap</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-600">
              ${formatNumber(financialData.enterprise_value / 1000000000)}B
            </div>
            <div className="text-sm text-muted-foreground">Enterprise Value</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(financialData.earnings_per_share)}
            </div>
            <div className="text-sm text-muted-foreground">Earnings Per Share</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(financialData.free_cash_flow_per_share)}
            </div>
            <div className="text-sm text-muted-foreground">FCF Per Share</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              {formatCurrency(financialData.book_value_per_share)}
            </div>
            <div className="text-sm text-muted-foreground">Book Value Per Share</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">
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
  );
};

export default ValuationSummaryCard;
