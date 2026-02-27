import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformSocial } from '#services/transformers/datasets/social.ts';
import type { ProjectSocialPayload } from '#services/transformers/projects/parts/project-social.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
vi.mock('#services/transformers/datasets/social.ts', () => ({
  transformSocial: vi.fn(),
}));

describe('transformProjectSocial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps url, spreads dataset transform, and builds apiUrl correctly', () => {
    const prismaSocial: ProjectSocialPayload = {
      url: 'https://example.com',
      socials: {
        websiteId: 7,
        label: 'Website',
      },
    } as ProjectSocialPayload;

    vi.mocked(transformSocial).mockReturnValue({
      websiteId: 7,
      label: 'Website',
      icon: 'globe',
    } as any);

    const result = transformProjectSocial(42, prismaSocial);

    // delegation
    expect(transformSocial).toHaveBeenCalledWith({
      websiteId: 7,
      label: 'Website',
    });

    // preserved field
    expect(result.url).toBe('https://example.com');

    // spread result
    expect(result.websiteId).toBe(7);
    expect(result.label).toBe('Website');
    //expect(result.icon).toBe('globe');

    // apiUrl
    expect(result.apiUrl).toBe('/api/projects/42/socials/7');
  });
});
