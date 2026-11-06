import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImageService } from '#services/images/upload-image.ts';

// How many images were being decoded and re-encoded at the same moment
const processing = vi.hoisted(() => ({ active: 0, peak: 0, finished: 0 }));

vi.mock('sharp', () => {
  const toBuffer = async () => {
    processing.active++;
    processing.peak = Math.max(processing.peak, processing.active);
    await new Promise((resolve) => setTimeout(resolve, 10));
    processing.active--;
    processing.finished++;
    return Buffer.from('webp');
  };
  const chain = { resize: () => chain, webp: () => chain, toBuffer };
  return { default: () => chain };
});

vi.mock('#config/s3.ts', () => ({ default: { send: vi.fn(() => Promise.resolve({})) } }));
vi.mock('#config/env.ts', () => ({ default: { s3Bucket: 'test-bucket' } }));

describe('uploadImageService', () => {
  beforeEach(() => {
    processing.active = 0;
    processing.peak = 0;
    processing.finished = 0;
  });

  it('returns where the image can be fetched', async () => {
    const result = await uploadImageService(Buffer.from('png'), 'holiday photo.png');

    expect(typeof result === 'object' ? result.location : result).toMatch(
      /^\/api\/images\/.+\.webp$/,
    );
  });

  it('processes images one at a time, even when many are uploaded together', async () => {
    const results = await Promise.all(
      Array.from({ length: 6 }, (_, n) =>
        uploadImageService(Buffer.from('png'), `image ${n.toString()}.png`),
      ),
    );

    expect(processing.finished).toBe(6);
    expect(processing.peak).toBe(1);
    // and every upload still got its own result
    expect(new Set(results.map((r) => JSON.stringify(r))).size).toBe(6);
  });
});
