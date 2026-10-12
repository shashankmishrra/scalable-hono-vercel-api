import { env } from "@/lib/env";
import { createBullMqJobsClient } from "./jobs.client";
import type { JobsClient } from "./jobs.types";
import { QUEUE_NAME } from "./jobs.types";

let client: JobsClient | undefined;

export function getJobs(): JobsClient {
  client ??= createBullMqJobsClient({
    connection: { url: env.REDIS_URL },
    queueName: QUEUE_NAME,
  });
  return client;
}

export { QUEUE_NAME };
export type { JobsClient };
