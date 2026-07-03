const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts = 3,
  baseDelayMs = 100,
): Promise<T> => {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await sleep(baseDelayMs * 2 ** i); // 100, 200, 400
    }
  }
  throw lastError;
};
