import { Redis } from "ioredis";

import type { CacheClient } from "./cache.types";

/**
 * Builds a Redis-backed {@link CacheClient}. Values are stored as JSON so any
 * serialisable payload round-trips, while the interface stays provider-neutral.
 */
export function createRedisCacheClient(connectionUrl: string): CacheClient {
  const redis = new Redis(connectionUrl, {
    // Fail individual commands quickly instead of retrying forever when Redis is
    // down; callers are expected to fall back to the database.
    maxRetriesPerRequest: 1,
  });

  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await redis.get(key);
      // Distinguish a genuine miss (null) from a stored value; anything present
      // was serialized to JSON and needs deserializing.
      return raw === null ? null : (JSON.parse(raw) as T);
    },
    async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
      // Serialise to JSON and use Redis' built-in TTL so keys expire on their
      // own without a separate cleanup job.
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
