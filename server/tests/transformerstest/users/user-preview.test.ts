import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformMajor } from '#services/transformers/datasets/major.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#services/transformers/datasets/major.ts', () => ({
  transformMajor: vi.fn(),
}));

describe('transformUserToPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps prisma user into UserPreview with skill flags', () => {
    const prismaUser: any = {
      userId: 5,
      firstName: 'Ari',
      lastName: 'Forge',
      username: 'skyforger',
      profileImage: null,
      headline: 'building cities',
      pronouns: 'they/them',
      location: 'Rochester',
      title: 'Engineer',
      funFact: 'Loves gears',
      mentor: true,

      majors: [{ majorId: 1, label: 'CS' }],

      userSkills: [
        {
          skills: { type: 'Developer' },
        },
        {
          skills: { type: 'Designer' },
        },
      ],
    };

    vi.mocked(transformMajor).mockReturnValue({ majorId: 1, label: 'CS' } as any);

    const result = transformUserToPreview(prismaUser);

    expect(result).toEqual({
      userId: 5,
      firstName: 'Ari',
      lastName: 'Forge',
      username: 'skyforger',
      profileImage: null,
      headline: 'building cities',
      pronouns: 'they/them',
      location: 'Rochester',
      title: 'Engineer',
      funFact: 'Loves gears',
      majors: [{ majorId: 1, label: 'CS' }],
      mentor: true,
      developer: true,
      designer: true,
      apiUrl: 'api/users/5',
    });
  });

  it('sets developer/designer false when no matching skills exist', () => {
    const prismaUser: any = {
      userId: 9,
      firstName: 'Nova',
      lastName: 'Ash',
      username: 'nova',
      profileImage: 'img.png',
      headline: '',
      pronouns: '',
      location: '',
      title: '',
      funFact: '',
      mentor: false,
      majors: [],
      userSkills: [{ skills: { type: 'Writer' } }],
    };

    const result = transformUserToPreview(prismaUser);

    expect(result.developer).toBe(false);
    expect(result.designer).toBe(false);
  });
});
