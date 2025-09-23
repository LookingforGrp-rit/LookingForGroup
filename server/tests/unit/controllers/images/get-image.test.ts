import type { Request, Response } from 'express';
import { vi, describe, test, expect } from 'vitest';
import { getImage } from '#controllers/images/get-image.ts';
import { getImageService } from '#services/images/get-image.ts';

vi.mock('#services/images/get-image.ts');

describe('Get image', () => {
  const req = {
    params: {
      image: 'sample-key',
    },
  } as unknown as Request;

  const res = {} as unknown as Response;
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.redirect = vi.fn(() => res);

  test('should be using the mocked service', () => {
    expect(getImageService).toBe(vi.mocked(getImageService));
  });

  test('should redirect if image found', async () => {
    vi.mocked(getImageService).mockClear();
    vi.mocked(res.redirect).mockClear();
    vi.mocked(getImageService).mockResolvedValue({ location: 'url/to/image' });

    await getImage(req, res);

    expect(getImageService).toHaveBeenCalledOnce();
    expect(res.redirect).toHaveBeenCalledExactlyOnceWith(301, 'url/to/image');

    vi.mocked(getImageService).mockClear();
    vi.mocked(res.redirect).mockClear();
  });

  test('should return 404 if image not found', async () => {
    vi.mocked(getImageService).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(getImageService).mockResolvedValue('NOT_FOUND');

    const responseBody = {
      status: 404,
      error: 'Image not found',
      data: null,
    };

    await getImage(req, res);

    expect(getImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(404);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getImageService).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(res.json).mockClear();
  });

  test('should return 500 if the service returns INTERNAL_ERROR', async () => {
    vi.mocked(getImageService).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(res.json).mockClear();
    vi.mocked(getImageService).mockResolvedValue('INTERNAL_ERROR');

    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getImage(req, res);

    expect(getImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(responseBody);

    vi.mocked(getImageService).mockClear();
    vi.mocked(res.status).mockClear();
    vi.mocked(res.json).mockClear();
  });
});
