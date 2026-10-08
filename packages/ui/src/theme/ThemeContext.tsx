import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { theme, Theme } from './theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = React.useState(() => systemColorScheme === 'dark');

  const toggleTheme = () => setIsDark(prev => !prev);
  const setTheme = (dark: boolean) => setIsDark(dark);

  const currentTheme = useMemo(() => ({
    ...theme,
    colors: {
      ...theme.colors,
      background: isDark ? '#000000' : theme.colors.background,
      surface: isDark ? '#1C1C1E' : theme.colors.surface,
      surfaceVariant: isDark ? '#2C2C2E' : theme.colors.surfaceVariant,
      text: isDark ? '#FFFFFF' : theme.colors.text,
      textSecondary: isDark ? '#8E8E93' : theme.colors.textSecondary,
      border: isDark ? '#38383A' : theme.colors.border,
      divider: isDark ? '#38383A' : theme.colors.divider,
    },
  }), [isDark]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

export function useThemeTypography() {
  const { theme } = useTheme();
  return theme.typography;
}