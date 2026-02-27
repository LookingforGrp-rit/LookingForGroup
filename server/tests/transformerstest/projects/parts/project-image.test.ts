import { describe, it, expect } from 'vitest';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

describe('transformProjectImage', () => {
  it('maps fields and builds apiUrl correctly', () => {
    const result = transformProjectImage(42, {
      imageId: 7,
      image: 'image.png',
      altText: 'A dramatic skyline',
    });

    expect(result).toEqual({
      apiUrl: 'api/projects/42/images/7',
      imageId: 7,
      image: 'image.png',
      altText: 'A dramatic skyline',
    });
  });

  it('handles numeric conversion properly', () => {
    const result = transformProjectImage(1, {
      imageId: 99,
      image: 'banner.jpg',
      altText: 'banner',
    });

    expect(result.apiUrl).toBe('api/projects/1/images/99');
  });
});
