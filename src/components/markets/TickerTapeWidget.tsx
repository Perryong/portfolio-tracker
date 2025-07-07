
import React, { useEffect, useRef, memo } from 'react';

export const TickerTapeWidget = memo(() => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          {
            "proName": "FOREXCOM:SPXUSD",
            "title": "S&P 500 Index"
          },
          {
            "proName": "FOREXCOM:NSXUSD",
            "title": "US 100 Cash CFD"
          },
          {
            "description": "Hang Sheng",
            "proName": "HSI:HSI"
          },
          {
            "description": "Dow Jones",
            "proName": "BLACKBULL:US30"
          },
          {
            "description": "VOO",
            "proName": "AMEX:VOO"
          },
          {
            "description": "VIX",
            "proName": "TVC:VIX"
          },
          {
            "description": "Bitcoin",
            "proName": "COINBASE:BTCUSD"
          },
          {
            "description": "Ethereum",
            "proName": "COINBASE:ETHUSD"
          }
        ],
        "showSymbolLogo": true,
        "isTransparent": false,
        "displayMode": "adaptive",
        "colorTheme": "light",
        "locale": "en"
      }`;
    
    container.current.appendChild(script);
    
    return () => {
      if (container.current && script.parentNode === container.current) {
        container.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="text-blue-500">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
});

TickerTapeWidget.displayName = 'TickerTapeWidget';
