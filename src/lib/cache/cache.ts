import { env } from "@/lib/env";
import { createRedisCacheClient } from "./cache.client";
import type { CacheClient } from "./cache.types";

let client: CacheClient | undefined;

export function getCache(): CacheClient {
  client ??= createRedisCacheClient(env.REDIS_URL);
  return client;
}

export type { CacheClient };
