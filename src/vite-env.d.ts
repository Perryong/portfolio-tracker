
/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: import("vite").ImportMetaEnv
}

interface ImportMetaEnv {
  readonly VITE_ALPHA_VANTAGE_API_KEY: string
  readonly VITE_FINNHUB_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  // Add more environment variables as needed
}
