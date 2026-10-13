import { env } from "@/lib/env";

import { createRedisCacheClient } from "./cache.client";
import type { CacheClient } from "./cache.types";

// Lazily-created singleton so the client (and its connection) is only opened
// when caching is actually used, and reused for the lifetime of the process.
let client: CacheClient | undefined;

/**
 * Returns the shared cache client, wired to the configured Redis URL. This is
 * the only entry point feature code should use.
 */
export function getCache(): CacheClient {
  client ??= createRedisCacheClient(env.REDIS_URL);
  return client;
}

export type { CacheClient };
