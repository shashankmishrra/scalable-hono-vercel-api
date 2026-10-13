import { env } from "@/lib/env";

import { createBullMqJobsClient } from "./jobs.client";
import type { JobsClient } from "./jobs.types";
import { QUEUE_NAME } from "./jobs.types";

// Lazily-created singleton; opened once and reused for the process lifetime.
let client: JobsClient | undefined;

/**
 * Returns the shared jobs client, wired to Redis-backed BullMQ. This is the
 * only entry point feature code should use to enqueue work.
 */
export function getJobs(): JobsClient {
  client ??= createBullMqJobsClient({
    connection: { url: env.REDIS_URL },
    queueName: QUEUE_NAME,
  });
  return client;
}

export { QUEUE_NAME };
export type { JobsClient };
