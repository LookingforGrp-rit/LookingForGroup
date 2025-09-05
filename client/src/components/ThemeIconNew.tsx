import { memo } from 'react';

type ThemeIconProps = {
  width?: number;
  height?: number;
  id?: string;
  className?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
};

const source = '/assets/icons.svg';

export const ThemeIconNew: React.FC<ThemeIconProps> = memo(({
  width = 0,
  height = 0,
  id = '',
  className = '',
  ariaLabel = '',
  onClick = () => {}
}) => {
  // Return the image element with the appropriate src based on the theme
  const getClasses = () => {
    return `theme-icon ${className}`;
  };

  return (
    <svg
      width={width}
      height={height}
      id={id}
      className={getClasses()}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <use href={`${source}#${id}`} xlinkHref={`${source}#${id}`} />
    </svg>
  );
});
