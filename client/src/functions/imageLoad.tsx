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
    const img = new window.Image();

    // Load handlers
    img.onload = () => setImgSrc(expectedSrc);
    img.onerror = () => setImgSrc(placeholder);

    // Starts loading process
    img.src = expectedSrc ?? placeholder;
  }, [expectedSrc, placeholder]);

  return imgSrc;
};

export default usePreloadedImage;