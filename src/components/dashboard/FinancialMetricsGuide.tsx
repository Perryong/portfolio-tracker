import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Activity, 
  BarChart3, 
  Calculator, 
  TrendingUp, 
  Shield,
  AlertCircle,
  CheckCircle,
  Minus,
  Volume2
} from "lucide-react";

const FinancialMetricsGuide = () => {
  const getBenchmarkBadge = (type: 'good' | 'neutral' | 'poor') => {
    switch (type) {
      case 'good':
        return <Badge className="bg-green-500 text-white ml-2"><CheckCircle className="h-3 w-3 mr-1" />Good</Badge>;
      case 'neutral':
        return <Badge className="bg-yellow-500 text-white ml-2"><Minus className="h-3 w-3 mr-1" />Neutral</Badge>;
      case 'poor':
        return <Badge className="bg-red-500 text-white ml-2"><AlertCircle className="h-3 w-3 mr-1" />Concerning</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Financial Metrics Guide & Interpretation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {/* Risk & Volatility Indicators */}
          <AccordionItem value="risk-volatility">
            <AccordionTrigger className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Risk & Volatility Indicators
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Historical Volatility (Annualized)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Measures how much a stock's price fluctuates over time. Calculated using standard deviation of returns. Higher volatility means more price swings and increased risk.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">0-15%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">15-25%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&gt;25%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Value at Risk (VaR)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Maximum expected loss over a given time period at a specific confidence level. VaR 95% means 95% confidence that losses won't exceed this amount in one day.
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    VaR 99% provides even higher confidence but with larger loss estimates.
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Sharpe Ratio</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Risk-adjusted return measure: (Return - Risk-free Rate) / Volatility. Higher values indicate better risk-adjusted performance.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;1.0</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">0.5-1.0</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;0.5</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Maximum Drawdown</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Largest peak-to-trough decline during the analysis period. Shows the worst-case scenario for buy-and-hold investors.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&lt;20%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">20-40%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&gt;40%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Beta</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Measures correlation with overall market. Beta = 1 moves with market, &gt;1 more volatile than market, &lt;1 less volatile than market.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">0.8-1.2</span>{getBenchmarkBadge('neutral')} <span className="text-xs">(Market-like)</span>
                    <span className="text-xs">&gt;1.5</span>{getBenchmarkBadge('poor')} <span className="text-xs">(High volatility)</span>
                    <span className="text-xs">&lt;0.5</span>{getBenchmarkBadge('good')} <span className="text-xs">(Defensive)</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Technical Indicators */}
          <AccordionItem value="technical-indicators">
            <AccordionTrigger className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Technical Indicators
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">RSI (Relative Strength Index)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Momentum oscillator (0-100) using 21-period calculation for reduced noise. Measures overbought/oversold conditions based on recent price changes.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">30-70</span>{getBenchmarkBadge('good')} <span className="text-xs">(Balanced)</span>
                    <span className="text-xs">&gt;70</span>{getBenchmarkBadge('poor')} <span className="text-xs">(Overbought)</span>
                    <span className="text-xs">&lt;30</span>{getBenchmarkBadge('poor')} <span className="text-xs">(Oversold)</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">MACD (Moving Average Convergence Divergence)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Advanced momentum indicator with three components: MACD line (12-EMA minus 26-EMA), Signal line (9-period EMA of MACD), and Histogram (MACD minus Signal).
                  </p>
                  <ul className="text-xs text-muted-foreground ml-4 list-disc space-y-1">
                    <li><strong>MACD above Signal:</strong> Bullish momentum</li>
                    <li><strong>MACD below Signal:</strong> Bearish momentum</li>
                    <li><strong>Histogram:</strong> Shows momentum strength and direction changes</li>
                    <li><strong>Zero line crossover:</strong> Trend change indication</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Moving Averages (SMA/EMA)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Trend indicators that smooth price action. EMA (Exponential) reacts faster to recent changes than SMA (Simple). Price position relative to MAs indicates trend direction.
                  </p>
                  <ul className="text-xs text-muted-foreground ml-4 list-disc space-y-1">
                    <li><strong>SMA/EMA 20:</strong> Short-term trend (3-4 weeks)</li>
                    <li><strong>SMA/EMA 50:</strong> Medium-term trend (2-3 months)</li>
                    <li><strong>SMA 200:</strong> Long-term trend (major support/resistance)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    VWMA (Volume Weighted Moving Average)
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Price average weighted by trading volume: Sum(Price × Volume) / Sum(Volume). Gives more importance to prices with higher volume, providing better insight into institutional interest.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    When VWMA differs significantly from SMA, it indicates volume-driven price action.
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Bollinger Bands</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Volatility indicator with upper/lower bands at 2 standard deviations from 20-period SMA. Band width indicates volatility level.
                  </p>
                  <ul className="text-xs text-muted-foreground ml-4 list-disc space-y-1">
                    <li><strong>Price near upper band:</strong> Potential overbought condition</li>
                    <li><strong>Price near lower band:</strong> Potential oversold condition</li>
                    <li><strong>Band squeeze:</strong> Low volatility, potential breakout coming</li>
                    <li><strong>Band expansion:</strong> High volatility period</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Volume Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Volume confirms price movements. High volume with price movement suggests strong conviction. Volume above 20-period average indicates increased interest.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">Above Average + Price Rise</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">Below Average + Price Rise</span>{getBenchmarkBadge('poor')} <span className="text-xs">(Weak move)</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Valuation Ratios */}
          <AccordionItem value="valuation-ratios">
            <AccordionTrigger className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Valuation Ratios
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">P/E Ratio (Price-to-Earnings)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    How much investors pay per dollar of earnings. Lower can indicate value, higher suggests growth expectations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&lt;15</span>{getBenchmarkBadge('good')} <span className="text-xs">(Value)</span>
                    <span className="text-xs">15-25</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&gt;25</span>{getBenchmarkBadge('poor')} <span className="text-xs">(Expensive)</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">P/B Ratio (Price-to-Book)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Market value vs. book value. Lower ratios may indicate undervaluation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&lt;1.5</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">1.5-3</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&gt;3</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">P/S Ratio (Price-to-Sales)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Market cap divided by revenue. Useful for companies with low/no profits.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&lt;2</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">2-5</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&gt;5</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">EV/EBITDA</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enterprise value to earnings before interest, taxes, depreciation. Good for comparing companies with different capital structures.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&lt;10</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">10-15</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&gt;15</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">PEG Ratio</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    P/E ratio divided by growth rate. Accounts for growth in valuation assessment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&lt;1</span>{getBenchmarkBadge('good')} <span className="text-xs">(Undervalued)</span>
                    <span className="text-xs">1-1.5</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&gt;1.5</span>{getBenchmarkBadge('poor')} <span className="text-xs">(Overvalued)</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Profitability Metrics */}
          <AccordionItem value="profitability">
            <AccordionTrigger className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Profitability Metrics
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Gross Margin</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Revenue minus cost of goods sold, divided by revenue. Shows operational efficiency.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;40%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">20-40%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;20%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Operating Margin</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Operating income divided by revenue. Measures core business profitability.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;15%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">5-15%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;5%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Net Margin</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Net income divided by revenue. Bottom-line profitability after all expenses.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;10%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">3-10%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;3%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">ROE (Return on Equity)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Net income divided by shareholder equity. Measures how effectively the company uses shareholder investments.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;15%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">10-15%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;10%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">ROA (Return on Assets)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Net income divided by total assets. Shows how efficiently the company uses its assets.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;5%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">2-5%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;2%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Growth Metrics */}
          <AccordionItem value="growth-metrics">
            <AccordionTrigger className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Growth Metrics
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Revenue Growth</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Year-over-year increase in company revenue. Shows business expansion.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;10%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">3-10%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;3%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Earnings Growth</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Year-over-year increase in net income. Shows profit acceleration.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;15%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">5-15%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;5%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Free Cash Flow Growth</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Growth in cash generated after capital expenditures. Important for dividend sustainability and growth investments.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Book Value Growth</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Growth in shareholder equity over time. Shows wealth building for shareholders.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">EPS Growth</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Earnings per share growth. Shows per-share value creation for investors.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Financial Health */}
          <AccordionItem value="financial-health">
            <AccordionTrigger className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Financial Health
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current Ratio</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Current assets divided by current liabilities. Measures short-term liquidity.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">1.5-3</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">1-1.5</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;1</span>{getBenchmarkBadge('poor')} <span className="text-xs">(Liquidity risk)</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Quick Ratio</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    (Current assets - inventory) divided by current liabilities. More conservative liquidity measure.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;1</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">0.5-1</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;0.5</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Debt to Equity</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total debt divided by shareholder equity. Shows financial leverage.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&lt;0.3</span>{getBenchmarkBadge('good')} <span className="text-xs">(Conservative)</span>
                    <span className="text-xs">0.3-0.6</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&gt;0.6</span>{getBenchmarkBadge('poor')} <span className="text-xs">(High leverage)</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Debt to Assets</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total debt divided by total assets. Shows what percentage of assets are financed by debt.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&lt;30%</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">30-50%</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&gt;50%</span>{getBenchmarkBadge('poor')}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Interest Coverage</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    EBIT divided by interest expense. Shows ability to pay interest on debt.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs">&gt;5</span>{getBenchmarkBadge('good')}
                    <span className="text-xs">2.5-5</span>{getBenchmarkBadge('neutral')}
                    <span className="text-xs">&lt;2.5</span>{getBenchmarkBadge('poor')} <span className="text-xs">(Debt distress risk)</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Investment Tip:</strong> No single metric tells the complete story. Always consider metrics in context of the industry, company stage, and market conditions. Use technical indicators to time entries/exits while fundamental metrics guide long-term investment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialMetricsGuide;
