import type { Request, Response } from 'express';
import { vi, describe, test, expect } from 'vitest';
import getTagsController from '#controllers/datasets/get-tags.ts';
import { getTagsService } from '#services/datasets/get-tags.ts';

vi.mock('#services/datasets/get-tags.ts');

describe('Get tags', () => {
  const req = {} as unknown as Request;

  const res = {} as unknown as Response;
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);

  test('should be using the mocked service', () => {
    expect(getTagsService).toBe(vi.mocked(getTagsService));
  });

  test('should normally return 200', async () => {
    vi.mocked(getTagsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getTagsService).mockResolvedValue([]);

    const responseBody = {
      status: 200,
      error: null,
      data: [],
    };

    await getTagsController(req, res);

    expect(getTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getTagsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });

  test('should return 500 if the service returns INTERNAL_ERROR', async () => {
    vi.mocked(getTagsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getTagsService).mockResolvedValue('INTERNAL_ERROR');

    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getTagsController(req, res);

    expect(getTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getTagsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });
});
