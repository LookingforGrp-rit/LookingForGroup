import { useLayoutEffect, useRef } from 'react';

/**
 * Finds the biggest font size (between min and max) at which text still fits.
 *
 * @param fits - applies a size and says whether the text fits at that size
 * @param max - the size to prefer
 * @param min - the smallest size we are willing to use
 * @param tolerance - stop narrowing the search once this close (in px)
 * @returns the largest size that fits, or min if even that does not fit
 */
export function findFittingSize(
  fits: (size: number) => boolean,
  max: number,
  min: number,
  tolerance = 0.25,
): number {
  if (fits(max)) return max;
  if (!fits(min)) return min;

  // min fits and max does not: narrow in on the boundary
  let fitting = min;
  let tooBig = max;
  while (tooBig - fitting > tolerance) {
    const middle = (fitting + tooBig) / 2;
    if (fits(middle)) fitting = middle;
    else tooBig = middle;
  }
  return fitting;
}

/**
 * Keeps a single line of text inside its element by shrinking the font when it is too long.
 * The size from the stylesheet is the biggest it will use. Only active while the media
 * query matches, so other screen sizes keep their normal font size.
 *
 * The element needs `white-space: nowrap` and a width that does not depend on its text
 * (for example `flex: 1 1 0; min-width: 0`), otherwise there is nothing to measure against.
 *
 * @param text - the text shown; fitting runs again when it changes
 * @param query - media query that turns the shrinking on
 * @param minRem - the smallest font size to shrink to; anything longer is cut off with "..."
 * @returns a ref to put on the element
 */
export function useFitText<T extends HTMLElement>(
  text: string,
  query = '(max-width: 550px)',
  minRem = 0.8,
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia(query);

    const fit = () => {
      element.style.removeProperty('font-size');
      if (!media.matches) return;

      const max = parseFloat(getComputedStyle(element).fontSize);
      if (!max) return;
      const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const min = Math.min(max, minRem * rootSize);

      // "important" so it also beats the stylesheet's own !important font sizes
      const size = findFittingSize(
        (px) => {
          element.style.setProperty('font-size', `${px.toString()}px`, 'important');
          return element.scrollWidth <= element.clientWidth;
        },
        max,
        min,
      );
      element.style.setProperty('font-size', `${size.toString()}px`, 'important');
    };

    fit();

    // Fit again when the width changes (rotating the phone, resizing), but not for
    // height-only changes, which our own font size changes cause
    let lastWidth = element.clientWidth;
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            if (element.clientWidth === lastWidth) return;
            lastWidth = element.clientWidth;
            fit();
          });
    observer?.observe(element);

    media.addEventListener('change', fit);

    // The page font arriving late changes how wide the text is
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) fit();
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      media.removeEventListener('change', fit);
      element.style.removeProperty('font-size');
    };
  }, [text, query, minRem]);

  return ref;
}
