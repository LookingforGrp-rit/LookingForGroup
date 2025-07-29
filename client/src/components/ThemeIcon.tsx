import { memo, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { hexToCSSFilter } from 'hex-to-css-filter'; // library to convert hex colors to CSS filters
// If you don't have this library, you can install it using npm
import { get } from 'http';

type ThemeIconProps = {
  src: string;
  darkSrc?: string; // Optional prop for dark mode images
  alt?: string;
  id?: string;
  addClass?: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
  lightModeColor?: string; // Optional prop for light mode custom color
  darkModeColor?: string; // Optional prop for dark mode custom color
};

export const ThemeIcon: React.FC<ThemeIconProps> = memo(
  ({ src, darkSrc, alt = '', id = '', addClass = '', onClick, lightModeColor, darkModeColor }) => {
    const theme = useContext(ThemeContext)['theme'];

    // If customColor is provided, white svg will be convert to different color
   // const iconSrc = (lightModeColor || darkModeColor) ? dark : (theme === 'dark' ? dark : light);
   
   // Determine the image based on the theme and custom colors
   const getImageSource = (): string => {
    if (darkSrc && theme === 'dark') {
      return darkSrc;
    }
    return src;
  }

    // Function to parse RGB string to RGB object
    // Example input: "rgb(255, 0, 0)"
    const parseRgb = (rgb: string): { r: number; g: number; b: number } | null => {
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      return match ? {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      } : null;
    };

    // Function to convert RGB to CSS 
    // ISSUE: The filter is not working as expected for custom colors
    // It should convert the RGB color to a filter that applies the same color effect
    // Example: rgb(255, 0, 0) should convert to a filter that makes the icon red, but it display different color
    /* const rgbToFilter = (r: number, g: number, b: number): string => {

      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Convert to HSL for better hue calculation
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;

      // Calculate brightness
      //const brightness = (rNorm + gNorm + bNorm) / 3 * 100;

      // Calculate saturation
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);

      const saturation = max === min ? 0 : ((max - min) / max) * 100;

      // Calculate hue
      let hue = 0;
      if (max !== min) {
        switch (max) {
          case rNorm:
            hue = ((gNorm - bNorm) / (max - min)) * 60;
            break;
          case gNorm:
            hue = (2 + (bNorm - rNorm) / (max - min)) * 60;
            break;
          case bNorm:
            hue = (4 + (rNorm - gNorm) / (max - min)) * 60;
            break;
        }
      }
      
      if (hue < 0) hue += 360;
      
      // Create filter
      const brightness = Math.round(luminance * 100);
      const sat = Math.round(saturation * 100);
      const invert = luminance > 0.5 ? 0 : 100;

      return `brightness(0) saturate(100%) invert(${invert}%) sepia(${sat}%) saturate(${sat * 3}%) hue-rotate(${Math.round(hue)}deg) brightness(${brightness + 20}%) contrast(120%)`;
    } */

    // Predefined Color custom filter generation
    const getCustomColorFilter = (color: string): string => {
      const colorFilters: { [key: string]: string } = {
        'red': 'invert(24%) sepia(91%) saturate(6408%) hue-rotate(2deg) brightness(98%) contrast(119%)',
        'green': 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)',
        'blue': 'invert(12%) sepia(89%) saturate(3493%) hue-rotate(231deg) brightness(97%) contrast(86%)',
        'yellow': 'invert(76%) sepia(89%) saturate(1926%) hue-rotate(3deg) brightness(106%) contrast(100%)',
        'purple': 'invert(20%) sepia(100%) saturate(4456%) hue-rotate(270deg) brightness(99%) contrast(135%)',
        'orange': 'invert(45%) sepia(100%) saturate(1016%) hue-rotate(4deg) brightness(100%) contrast(107%)',
        'pink': 'invert(69%) sepia(73%) saturate(1746%) hue-rotate(283deg) brightness(103%) contrast(101%)',
        'cyan': 'invert(70%) sepia(23%) saturate(3218%) hue-rotate(130deg) brightness(95%) contrast(80%)',
        'gray': 'invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)',
        'white': 'invert(0%)',
        'black': 'invert(100%)',
      };

      // Check if it's a predefined color
      const lowerColor = color.toLowerCase();
      if (colorFilters[lowerColor]) {
        return colorFilters[lowerColor];
      }
      try {
      // Handle hex colors
      if (color.startsWith('#')) {
        // Convert hex to CSS filter
        const result = hexToCSSFilter(color); 
        return result.filter;
      }

      // Handle RGB colors
      if (color.startsWith('rgb(')) {
        const rgb = parseRgb(color);
        if (rgb) {
          // Convert RGB to hex
          const hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
          const result = hexToCSSFilter(hex);
          return result.filter;
        }
      }
    } catch (error) {
      console.error('Error converting color to filter:', error);
       };

       

       // Handle CSS color names or CSS variables
      if (color.startsWith('var(')) {
        // For CSS variables, we can't convert to filter, so return a basic inversion
        return getVariableFilter(color);
      }

      // Fallback
      return 'none'; 
    };

    const getVariableFilter = (cssVariable: string): string => {
    // Map common CSS variables to appropriate filters
      const variableFilters: { [key: string]: string } = {
        'var(--primary-color)': 'invert(24%) sepia(91%) saturate(6408%) hue-rotate(2deg) brightness(98%) contrast(119%)',
        'var(--secondary-color)': 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)',
        'var(--accent-color)': 'invert(12%) sepia(89%) saturate(3493%) hue-rotate(231deg) brightness(97%) contrast(86%)',
        'var(--text-color)': theme === 'light' ? 'invert(100%)' : 'invert(0%)',
        'var(--background-color)': theme === 'light' ? 'invert(0%)' : 'invert(100%)',
        'var(--border-color)': 'invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)',
      };

      if (variableFilters[cssVariable]) {
       return variableFilters[cssVariable];
      }

  // Fallback for unknown CSS variables
  return theme === 'light' 
    ? 'brightness(0) saturate(100%) invert(0%) sepia(50%) saturate(200%) hue-rotate(0deg) brightness(80%) contrast(120%)'
    : 'brightness(0) saturate(100%) invert(100%) sepia(50%) saturate(200%) hue-rotate(0deg) brightness(80%) contrast(120%)';
};
    // Function to get the current color based on the theme
    const getCurrentColor = (): string => {
      // Don't apply color if no custom colors are provided
      if (darkSrc) {
        return 'none';
      }

      // Handle individual theme colors
      if (theme === 'light' && lightModeColor) {
        return lightModeColor;
      } else if (theme === 'dark' && darkModeColor) {
        return darkModeColor;
  }
      return 'none';
    };

    // Return the image element with the appropriate src based on the theme
    const getClasses = () => {
      let classes = `theme-icon ${addClass}`;

      if (lightModeColor || darkModeColor && !darkSrc) {
        classes += ' svg-color-icon';
      }

      if (darkSrc) {
        classes += ' theme-image-dark';
      }

      return classes;
    };

    // Function to get css styles based on the current theme and custom colors
    const getStyles = (): React.CSSProperties => {
      const styles: React.CSSProperties = {};
      const currentColor = getCurrentColor();
      
      if (currentColor !== 'none') {
        styles.filter = getCustomColorFilter(currentColor);
        
      }
      return styles;
    };

    return (
      <img
        src={getImageSource()}
        alt={alt}
        id={id}
        className={getClasses()}
        onClick={onClick}
        style={getStyles()}
      />
    );
  }
);
