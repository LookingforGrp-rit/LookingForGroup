import { describe, it, expect } from 'vitest';
import { createJobQueue } from '#services/images/image-queue.ts';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A job that takes a moment and records how many jobs were running alongside it
const trackedJob =
  (state: { active: number; peak: number }, ms = 10) =>
  async () => {
    state.active++;
    state.peak = Math.max(state.peak, state.active);
    await delay(ms);
    state.active--;
  };

describe('createJobQueue', () => {
  it('resolves with the job result', async () => {
    const run = createJobQueue(1);

    await expect(run(() => Promise.resolve(42))).resolves.toBe(42);
  });

  it('runs only one job at a time when the limit is 1, however many are added together', async () => {
    const run = createJobQueue(1);
    const state = { active: 0, peak: 0 };

    await Promise.all(Array.from({ length: 8 }, () => run(trackedJob(state))));

    expect(state.peak).toBe(1);
  });

  it('allows up to the limit at the same time', async () => {
    const run = createJobQueue(3);
    const state = { active: 0, peak: 0 };

    await Promise.all(Array.from({ length: 9 }, () => run(trackedJob(state))));

    expect(state.peak).toBe(3);
  });

  it('starts waiting jobs in the order they were added', async () => {
    const run = createJobQueue(1);
    const order: number[] = [];

    await Promise.all(
      [1, 2, 3, 4, 5].map((n) =>
        run(async () => {
          await delay(5);
          order.push(n);
        }),
      ),
    );

    expect(order).toStrictEqual([1, 2, 3, 4, 5]);
  });

  it('rejects only the failing job, and the jobs behind it still run', async () => {
    const run = createJobQueue(1);
    const results: string[] = [];

    const first = run(() => Promise.reject(new Error('first failed')));
    const second = run(() => {
      results.push('second');
      return Promise.resolve('second done');
    });
    const third = run(() => {
      results.push('third');
      return Promise.resolve('third done');
    });

    await expect(first).rejects.toThrow('first failed');
    await expect(second).resolves.toBe('second done');
    await expect(third).resolves.toBe('third done');
    expect(results).toStrictEqual(['second', 'third']);
  });

  it('copes with a job that throws before returning a promise', async () => {
    const run = createJobQueue(1);

    const broken = run((): Promise<string> => {
      throw new Error('threw straight away');
    });
    const after = run(() => Promise.resolve('still runs'));

    await expect(broken).rejects.toThrow('threw straight away');
    await expect(after).resolves.toBe('still runs');
  });

  it('keeps working after the queue has emptied', async () => {
    const run = createJobQueue(1);
    const state = { active: 0, peak: 0 };

    await Promise.all([run(trackedJob(state)), run(trackedJob(state))]);
    await Promise.all([run(trackedJob(state)), run(trackedJob(state))]);

    expect(state.peak).toBe(1);
  });

  it('treats a limit below 1, or not a number, as 1', async () => {
    for (const limit of [0, -3, Number.NaN]) {
      const run = createJobQueue(limit);
      const state = { active: 0, peak: 0 };

      await Promise.all(Array.from({ length: 4 }, () => run(trackedJob(state, 5))));

      expect(state.peak).toBe(1);
    }
  });
});
