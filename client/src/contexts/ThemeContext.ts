import { createContext } from 'react';

type ThemeContextProps = {
  theme: string;
  setTheme: (theme: string) => void;
};

/**
 * Tracks the current theme of the project: dark or light.
 */
export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'dark',
  setTheme: () => {},
});
