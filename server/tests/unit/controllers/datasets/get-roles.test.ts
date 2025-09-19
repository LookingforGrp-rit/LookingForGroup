import type { Request, Response } from 'express';
import { vi, describe, test, expect } from 'vitest';
import getRolesController from '#controllers/datasets/get-roles.ts';
import { getRolesService } from '#services/datasets/get-roles.ts';

vi.mock('#services/datasets/get-roles.ts', () => ({
  getRolesService: vi.fn(),
}));

describe('Get roles', () => {
  const req = {} as unknown as Request;

  const res = {} as unknown as Response;
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);

  test('should be using the mocked service', () => {
    expect(getRolesService).toBe(vi.mocked(getRolesService));
  });

  test('should normally return 200', async () => {
    vi.mocked(getRolesService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getRolesService).mockResolvedValue([]);

    const responseBody = {
      status: 200,
      error: null,
      data: [],
    };

    await getRolesController(req, res);

    expect(getRolesService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getRolesService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });

  test('should return 500 if the service returns INTERNAL_ERROR', async () => {
    vi.mocked(getRolesService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(getRolesService).mockResolvedValue('INTERNAL_ERROR');

    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getRolesController(req, res);

    expect(getRolesService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getRolesService).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(res.status).mockClear();
  });
});
