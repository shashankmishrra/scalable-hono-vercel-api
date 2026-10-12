import { Redis } from "ioredis";
import type { CacheClient } from "./cache.types";

export function createRedisCacheClient(connectionUrl: string): CacheClient {
  const redis = new Redis(connectionUrl, {
    maxRetriesPerRequest: 1,
  });

  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await redis.get(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    },
    async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    },
    async del(key: string): Promise<void> {
      await redis.del(key);
    },
    async ping(): Promise<void> {
      await redis.ping();
    },
    async close(): Promise<void> {
      await redis.quit();
    },
  };
}
