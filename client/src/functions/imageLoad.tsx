import { useState, useEffect } from 'react';

/**
 * Reusable custom hook for preloading an image.
 * @param expectedSrc - The expected image source URL.
 * @param placeholder - The placeholder image source URL.
 * @returns The current image source URL.
 */
const usePreloadedImage = (expectedSrc: string, placeholder: string) => {
  const [imgSrc, setImgSrc] = useState(placeholder);

  useEffect(() => {
    // Callers build expectedSrc from a template string, so data that hasn't loaded yet
    // arrives as "undefined" or "null". Stay on the placeholder instead of requesting it.
    if (!expectedSrc || expectedSrc === 'undefined' || expectedSrc === 'null') {
      setImgSrc(placeholder);
      return;
    }

    // Set once a newer source replaces this one, so a late result from an old load
    // (e.g. a failure arriving after the real image loaded) can't overwrite the current image
    let stale = false;
    const img = new window.Image();

    // Load handlers
    img.onload = () => {
      if (!stale) setImgSrc(expectedSrc);
    };
    img.onerror = () => {
      if (!stale) setImgSrc(placeholder);
    };

    // Starts loading process
    img.src = expectedSrc;

    return () => {
      stale = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [expectedSrc, placeholder]);

  return imgSrc;
};

export default usePreloadedImage;
