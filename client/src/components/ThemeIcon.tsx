import { memo, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

// Location of the SVG sprite sheet
const source = '/assets/icons.svg';

type ThemeIconProps = {
  width?: number;
  height?: number;
  id?: string;
  className?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
};

/**
 * ThemeIcon Component
 * Renders an SVG icon that adapts to the current theme (light/dark).
 * Uses a single SVG sprite sheet for all icons to optimize performance.
 * Props:
 * - width: Width of the icon
 * - height: Height of the icon
 * - id: ID of the icon in the sprite sheet
 * - className: Additional CSS classes for styling
 * - ariaLabel: Accessibility label for the icon
 * - onClick: Click event handler
 */
export const ThemeIcon: React.FC<ThemeIconProps> = memo(({
  width = 0,
  height = 0,
  id = '',
  className = '',
  ariaLabel = '',
  onClick = undefined
}) => {

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!onClick) 
      return;

    // SVG doesn't natively override these.
    // If this is on a page with a form, like login, trying to hit enter while focused
    // On the back button will try to submit the form. This fixes that
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onClick(e as unknown as React.MouseEvent<SVGSVGElement>);
    }
  };

  return (
    <svg
      width={width}
      height={height}
      id={id}
      className={`${className} ${onClick && "scale-on-hover"}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : -1}
    >
      <use href={`${source}#${id}`} xlinkHref={`${source}#${id}`} />
    </svg>
  );
});

type ThemeImageProps = {
  lightSrc: string;
  darkSrc: string;
  width?: number;
  height?: number;
  id?: string;
  className?: string;
  alt?: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
};


/**
 * ThemeImage Component
 * Renders an img that adapts to the current theme (light/dark).
 * Relies on img files that change color more complexly than SVG icons.
 * Props:
 * - lightSrc: Source to display for light mode
 * - darkSrc: Source to display for dark mode
 * - id: CSS id for styling
 * - className: Additional CSS classes for styling
 * - ariaLabel: Accessibility label for the icon
 * - onClick: Click event handler
 */
export const ThemeImage: React.FC<ThemeImageProps> = memo(({
  lightSrc = '',
  darkSrc = '',
  id = '',
  className = '',
  alt = '',
  onClick = undefined
}) => {

  // Theme storage
  const theme = useContext(ThemeContext)['theme'];

  const getImageSource = (): string => {
    if (darkSrc && theme === 'dark') {
      return darkSrc;
    }
    return lightSrc;
  }

  return (
    <img
      src={getImageSource()}
      alt={alt}
      id={id}
      className={`${className} ${onClick && "scale-on-hover"}`}
      onClick={onClick}
    />
  );

});