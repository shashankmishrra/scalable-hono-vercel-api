/**
 * Minimal, provider-agnostic cache contract. Implementations are selected at
 * runtime by `getCache()`; feature code depends only on this interface, so the
 * backing store (local Redis today, Upstash later) can be swapped without
 * touching callers.
 */
export interface CacheClient {
  /** Returns the cached value deserialized from JSON, or null on a miss. */
  get<T>(key: string): Promise<T | null>;
  /** Stores a value serialized to JSON with a TTL in seconds. */
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  /** Removes a key (used for invalidation after mutations). */
  del(key: string): Promise<void>;
  /** Round-trips a cheap command to confirm the store is reachable. */
  ping(): Promise<void>;
  /** Releases the underlying connection(s). */
  close(): Promise<void>;
}
