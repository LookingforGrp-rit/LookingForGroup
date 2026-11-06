/**
 * A first-in, first-out queue that runs jobs a limited number at a time.
 *
 * Processing an image is the memory-heavy part of an upload: the picture is
 * decoded into raw pixels (a 4000x3000 photo is about 48 MB), resized, and
 * re-encoded. Several of those at once multiply the peak, so images wait their
 * turn here instead of all being processed together. That matters most for the
 * "upload multiple images" button, and for several people uploading at the same
 * time.
 *
 * A job that fails (or throws) only rejects its own promise. The jobs waiting
 * behind it still run.
 *
 * @param maxConcurrent - How many jobs may run at the same time
 * @returns a function that adds a job to the queue and resolves with its result
 */
export const createJobQueue = (maxConcurrent: number) => {
  const limit = Math.max(1, Math.floor(maxConcurrent) || 1);
  let running = 0;
  const waiting: (() => void)[] = [];

  const startNext = () => {
    if (running >= limit) return;
    waiting.shift()?.();
  };

  return <T>(job: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const start = () => {
        running++;
        // Promise.resolve().then(job) also catches a job that throws before returning a promise
        Promise.resolve()
          .then(job)
          .then(resolve, reject)
          .finally(() => {
            running--;
            startNext();
          });
      };

      if (running < limit) start();
      else waiting.push(start);
    });
};

/**
 * How many images are processed at the same time. One is the safest for memory.
 * Raise it with the IMAGE_PROCESSING_CONCURRENCY variable if uploads queue up
 * too long and the server has memory to spare.
 */
const MAX_CONCURRENT_IMAGE_JOBS = Number(process.env.IMAGE_PROCESSING_CONCURRENCY) || 1;

/** Runs an image-processing job in turn with all the others. */
export const runImageJob = createJobQueue(MAX_CONCURRENT_IMAGE_JOBS);
