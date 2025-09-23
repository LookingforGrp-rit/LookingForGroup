import type { Request, Response } from 'express';
import { vi, describe, test, expect } from 'vitest';
import getMediumsController from '#controllers/datasets/get-mediums.ts';
import { getMediumsService } from '#services/datasets/get-mediums.ts';

vi.mock('#services/datasets/get-mediums.ts');

describe('Get mediums', () => {
  const req = {} as unknown as Request;

  const res = {} as unknown as Response;
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);

  test('should be using the mocked service', () => {
    expect(getMediumsService).toBe(vi.mocked(getMediumsService));
  });

  test('should normally return 200', async () => {
    vi.mocked(getMediumsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getMediumsService).mockResolvedValue([]);

    const responseBody = {
      status: 200,
      error: null,
      data: [],
    };

    await getMediumsController(req, res);

    expect(getMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getMediumsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });

  test('should return 500 if the service returns INTERNAL_ERROR', async () => {
    vi.mocked(getMediumsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getMediumsService).mockResolvedValue('INTERNAL_ERROR');

    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getMediumsController(req, res);

    expect(getMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getMediumsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });
});
