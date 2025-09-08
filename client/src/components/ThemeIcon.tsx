import { memo } from 'react';

type ThemeIconProps = {
  width?: number;
  height?: number;
  id?: string;
  className?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
};

// Location of the SVG sprite sheet
const source = '/assets/icons.svg';

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
  onClick = () => {}
}) => {

  return (
    <svg
      width={width}
      height={height}
      id={id}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <use href={`${source}#${id}`} xlinkHref={`${source}#${id}`} />
    </svg>
  );
});
