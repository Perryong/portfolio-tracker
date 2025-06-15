
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useRiskAnalysis } from "@/hooks/useRiskAnalysis";
import { fetchStockPrice } from "@/services/stockService";
import { StockQuote } from "@/types";
import { QuantitativeRecommendationComponent } from "./QuantitativeRecommendation";
import FinancialMetricsGuide from "./FinancialMetricsGuide";
import SearchSection from "./SearchSection";
import ValuationSummaryCard from "./ValuationSummaryCard";
import RiskVolatilityCard from "./RiskVolatilityCard";
import TechnicalIndicatorsCard from "./TechnicalIndicatorsCard";
import FinancialMetricsCards from "./FinancialMetricsCards";

const StockValuations = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [inputSymbol, setInputSymbol] = useState<string>("");
  const [intrinsicValue, setIntrinsicValue] = useState<number | null>(null);
  const [stockPrice, setStockPrice] = useState<StockQuote | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);

  const { 
    financialData, 
    isLoading: isLoadingFinancial, 
    error: financialError, 
    isCalculating,
    calculateValuation 
  } = useFinancialData(symbol);

  const {
    riskMetrics,
    technicalIndicators,
    quantitativeRecommendation,
    isLoading: isLoadingRisk,
    error: riskError
  } = useRiskAnalysis(symbol, financialData);

  // Fetch stock price when symbol changes
  useEffect(() => {
    const fetchPrice = async () => {
      if (symbol) {
        setIsPriceLoading(true);
        try {
          const price = await fetchStockPrice(symbol);
          setStockPrice(price);
        } catch (error) {
          console.error('Error fetching stock price:', error);
          setStockPrice(null);
        } finally {
          setIsPriceLoading(false);
        }
      }
    };

    fetchPrice();
  }, [symbol]);

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

  const isLoading = isLoadingFinancial || isLoadingRisk;
  const error = financialError || riskError;
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

      {/* Show analysis sections only when we have a symbol */}
      {hasSymbol && (
        <>
          {/* Quantitative Recommendation */}
          {quantitativeRecommendation && (
            <QuantitativeRecommendationComponent 
              recommendation={quantitativeRecommendation}
              symbol={symbol}
              stockPrice={stockPrice}
              isPriceLoading={isPriceLoading}
            />
          )}

          {/* Valuation Summary */}
          {financialData && (
            <ValuationSummaryCard
              financialData={financialData}
              symbol={symbol}
              intrinsicValue={intrinsicValue}
              isCalculating={isCalculating}
              handleCalculateValuation={handleCalculateValuation}
            />
          )}

          {/* Risk & Volatility Indicators */}
          {riskMetrics && (
            <RiskVolatilityCard riskMetrics={riskMetrics} />
          )}

          {/* Technical Indicators */}
          {technicalIndicators && (
            <TechnicalIndicatorsCard technicalIndicators={technicalIndicators} />
          )}

          {/* Financial Metrics */}
          {financialData && (
            <FinancialMetricsCards financialData={financialData} />
          )}

          {isLoading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">Loading analysis data for {symbol}...</div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Financial Metrics Guide - Always visible */}
      <FinancialMetricsGuide />
    </div>
  );
};

export default StockValuations;
