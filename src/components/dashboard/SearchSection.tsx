
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Search, AlertTriangle, Info } from "lucide-react";

interface SearchSectionProps {
  inputSymbol: string;
  setInputSymbol: (value: string) => void;
  handleSearch: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  error: Error | null;
  hasSymbol: boolean;
  symbol: string;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  inputSymbol,
  setInputSymbol,
  handleSearch,
  handleKeyDown,
  isLoading,
  error,
  hasSymbol,
  symbol
}) => {
  return (
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
            placeholder="Enter stock symbol (e.g. AAPL, MSFT, GOOGL)"
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
        
        {error && hasSymbol && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading data for {symbol}: {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        {!hasSymbol && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter a stock symbol above to begin comprehensive valuation analysis including technical indicators, risk metrics, and quantitative recommendations.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchSection;
