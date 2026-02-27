import { describe, it, expect } from 'vitest';
import { transformProjectMedium } from '#services/transformers/projects/parts/project-medium.ts';

describe('transformProjectMedium', () => {
  it('maps fields and builds apiUrl correctly', () => {
    const result = transformProjectMedium(42, {
      mediumId: 7,
      label: 'Comics',
    });

    expect(result).toEqual({
      apiUrl: 'api/project/42/mediums/7',
      mediumId: 7,
      label: 'Comics',
    });
  });

  it('converts numeric ids properly', () => {
    const result = transformProjectMedium(1, {
      mediumId: 99,
      label: 'Animation',
    });

    expect(result.apiUrl).toBe('api/project/1/mediums/99');
  });
});
