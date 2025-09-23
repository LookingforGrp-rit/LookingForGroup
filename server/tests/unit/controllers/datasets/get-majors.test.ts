import type { Request, Response } from 'express';
import { vi, describe, test, expect } from 'vitest';
import getMajorsController from '#controllers/datasets/get-majors.ts';
import { getMajorsService } from '#services/datasets/get-majors.ts';

vi.mock('#services/datasets/get-majors.ts');

describe('Get majors', () => {
  const req = {} as unknown as Request;

  const res = {} as unknown as Response;
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);

  test('should be using the mocked service', () => {
    expect(getMajorsService).toBe(vi.mocked(getMajorsService));
  });

  test('should normally return 200', async () => {
    vi.mocked(getMajorsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getMajorsService).mockResolvedValue([]);

    const responseBody = {
      status: 200,
      error: null,
      data: [],
    };

    await getMajorsController(req, res);

    expect(getMajorsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getMajorsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });

  test('should return 500 if the service returns INTERNAL_ERROR', async () => {
    vi.mocked(getMajorsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getMajorsService).mockResolvedValue('INTERNAL_ERROR');

    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getMajorsController(req, res);

    expect(getMajorsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getMajorsService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });
});
