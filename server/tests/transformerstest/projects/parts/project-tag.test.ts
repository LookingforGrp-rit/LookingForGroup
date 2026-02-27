import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformTag } from '#services/transformers/datasets/tag.ts';
import type { ProjectTagPayload } from '#services/transformers/projects/parts/project-tag.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
vi.mock('#services/transformers/datasets/tag.ts', () => ({
  transformTag: vi.fn(),
}));

describe('transformProjectTag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds apiUrl and spreads dataset transform correctly', () => {
    const prismaTag: ProjectTagPayload = {
      tagId: 5,
      label: 'Steampunk',
      type: 'GENRE',
    } as ProjectTagPayload;

    vi.mocked(transformTag).mockReturnValue({
      tagId: 5,
      label: 'Steampunk',
      type: 'GENRE',
      color: 'bronze',
    } as any);

    const result = transformProjectTag(42, prismaTag);

    // delegation
    expect(transformTag).toHaveBeenCalledWith({
      label: 'Steampunk',
      tagId: 5,
      type: 'GENRE',
    });

    // spread verification
    expect(result.tagId).toBe(5);
    expect(result.label).toBe('Steampunk');
    expect(result.type).toBe('GENRE');

    // apiUrl
    expect(result.apiUrl).toBe('/api/projects/42/tags/5');
  });
});
