import { createContext } from 'react';

type ThemeContextProps = {
  theme: string;
  setTheme: (theme: string) => void;
  lightMode: string;
  darkMode: string;
};

/**
 * Tracks the current theme of the project: dark or light.
 */
export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'dark',
  setTheme: () => {},
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode'
});
