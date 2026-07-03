import { redis } from "./redis";

export const cacheAside = async <T>(
  key: string,
  ttlSeconds: number,
  fetchFresh: () => Promise<T>,
): Promise<T> => {
  try {
    const cached = await redis.get(key);
    if (cached !== null) return JSON.parse(cached) as T;
  } catch {
    // fall through when Redis unreachable
  }

  const fresh = await fetchFresh();

  try {
    await redis.set(key, JSON.stringify(fresh), { EX: ttlSeconds });
  } catch {
    // best-effort populate
  }

  return fresh;
};

export const invalidate = async (...keys: string[]): Promise<void> => {
  if (!keys.length) return;
  try {
    await redis.del(keys);
  } catch {
    /* when Redis down */
  }
};

export const invalidateByPrefix = async (prefix: string): Promise<void> => {
  try {
    const keys: string[] = [];
    for await (const key of redis.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100,
    })) {
      keys.push(String(key));
    }
    if (keys.length) await redis.del(keys);
  } catch {
    /* best-effort */
  }
};
