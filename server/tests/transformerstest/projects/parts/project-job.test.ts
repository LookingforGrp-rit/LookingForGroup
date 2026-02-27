import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformRole } from '#services/transformers/datasets/role.ts';
import type { ProjectJobPayload } from '#services/transformers/projects/parts/project-job.ts';
import { transformProjectJob } from '#services/transformers/projects/parts/project-job.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
vi.mock('#services/transformers/datasets/role.ts', () => ({
  transformRole: vi.fn(),
}));

vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

describe('transformProjectJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps fields and composes role + contact correctly', () => {
    const now = new Date();

    const prismaJob: ProjectJobPayload = {
      jobId: 5,
      availability: 'OPEN',
      compensation: 'PAID',
      createdAt: now,
      updatedAt: now,
      description: 'Steam engineer',
      duration: '6 months',
      location: 'Remote',
      roles: { roleId: 3 },
      contact: {
        users: { userId: 10 },
      },
    } as unknown as ProjectJobPayload;

    vi.mocked(transformUserToPreview).mockReturnValue({ userId: 10 } as any);
    vi.mocked(transformRole).mockReturnValue({ roleId: 3 } as any);

    const result = transformProjectJob(42, prismaJob);

    expect(transformUserToPreview).toHaveBeenCalledWith({ userId: 10 });
    expect(transformRole).toHaveBeenCalledWith({ roleId: 3 });

    expect(result.jobId).toBe(5);
    expect(result.description).toBe('Steam engineer');
    expect(result.location).toBe('Remote');

    expect(result.contact).toEqual({ userId: 10 });
    expect(result.role).toEqual({ roleId: 3 });

    expect(result.apiUrl).toBe('/api/projects/42/jobs/5');
  });
});
