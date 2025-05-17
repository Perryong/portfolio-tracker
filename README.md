
# Personal Portfolio Tracker

A responsive web application for monitoring your stock and cryptocurrency investments in one place.

## Features

- **Dashboard Layout**: Overview of portfolio value, daily changes, and allocation charts
- **Asset Management**: View and manage both stocks and cryptocurrencies
- **Editable Holdings**: Easily update your positions
- **Live Price Updates**: Price data refreshes every 60 seconds
- **Persistent Storage**: Your portfolio data is stored locally in your browser
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React with TypeScript
- Vite for the build system
- Tailwind CSS for styling
- shadcn/ui for UI components
- Zustand for state management
- React Query for data fetching
- Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd personal-portfolio-tracker
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

## Environment Variables

The app uses the following environment variables for API keys:

- `VITE_ALPHA_VANTAGE_API_KEY`: For historical stock data
- `VITE_FINNHUB_API_KEY`: For real-time stock quotes
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/public key

These values are preset in the `.env` file with demo API keys. For production use:

1. Create your own API keys from the respective services
2. Replace the values in the `.env` file or create a `.env.local` file with your own values

## API Keys

For production use, you'll want to replace the demo API keys with your own:

### Stock API (Finnhub)

1. Sign up for a free API key at [Finnhub](https://finnhub.io/)
2. Set the `VITE_FINNHUB_API_KEY` environment variable

### Historical Data API (Alpha Vantage)

1. Sign up for a free API key at [Alpha Vantage](https://www.alphavantage.co/)
2. Set the `VITE_ALPHA_VANTAGE_API_KEY` environment variable

### Crypto API (CoinGecko)

The app is configured to work with the free tier of CoinGecko's API.
If you're experiencing rate limiting:

1. Sign up for a CoinGecko Pro API key at [CoinGecko](https://www.coingecko.com/en/api)
2. Modify the crypto service to use your API key

## Usage

- **Dashboard**: View overall portfolio performance and allocation
- **Tables**: Switch between stocks and cryptocurrencies
- **Adding Assets**: Click "Add Position" to add new stocks or cryptocurrencies
- **Editing**: Click on any quantity to edit it inline
- **Refresh**: Manually refresh prices using the refresh button
- **Import/Export**: Use the dropdown menu to import or export your portfolio as CSV

## Future Development

Consider integrating with backend services for additional features:
- Real user authentication
- Server-side data storage
- Historical price charts
- Notifications for price movements

## License

This project is licensed under the MIT License.
