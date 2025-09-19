import type { Request, Response } from 'express';
import { vi, describe, test, expect } from 'vitest';
import getSkillsController from '#controllers/datasets/get-skills.ts';
import { getSkillsService } from '#services/datasets/get-skills.ts';

vi.mock('#services/datasets/get-skills.ts', () => ({
  getSkillsService: vi.fn(),
}));

describe('Get skills', () => {
  const req = {} as unknown as Request;

  const res = {} as unknown as Response;
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);

  test('should be using the mocked service', () => {
    expect(getSkillsService).toBe(vi.mocked(getSkillsService));
  });

  test('should normally return 200', async () => {
    vi.mocked(getSkillsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getSkillsService).mockResolvedValue([]);

    const responseBody = {
      status: 200,
      error: null,
      data: [],
    };

    await getSkillsController(req, res);

    expect(getSkillsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getSkillsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });

  test('should return 500 if the service returns INTERNAL_ERROR', async () => {
    vi.mocked(getSkillsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getSkillsService).mockResolvedValue('INTERNAL_ERROR');

    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getSkillsController(req, res);

    expect(getSkillsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getSkillsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });
});
