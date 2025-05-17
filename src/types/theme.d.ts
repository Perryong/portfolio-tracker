
import 'next-themes';

declare module 'next-themes' {
  interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: string;
    storageKey?: string;
    forcedTheme?: string;
    disableTransitionOnChange?: boolean;
    enableSystem?: boolean;
    enableColorScheme?: boolean;
    themes?: string[];
    attribute?: string;
  }
  
  interface UseThemeProps {
    themes?: string[];
    forcedTheme?: string;
    enableSystem?: boolean;
  }
  
  interface UseThemeOutput {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    forcedTheme: string | undefined;
    resolvedTheme: string | undefined;
    themes: string[];
    systemTheme: 'dark' | 'light' | undefined;
  }
  
  export function useTheme(props?: UseThemeProps): UseThemeOutput;
  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
}
