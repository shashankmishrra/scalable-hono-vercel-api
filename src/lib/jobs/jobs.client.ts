import { Queue } from "bullmq";

import type { JobsClient, JobsClientConfig } from "./jobs.types";

/**
 * Builds a BullMQ-backed {@link JobsClient}. Retry/backoff defaults live here so
 * every published job is retried consistently without per-call configuration.
 */
export function createBullMqJobsClient(config: JobsClientConfig): JobsClient {
  const queue = new Queue(config.queueName, {
    connection: config.connection,
    // Retry transient failures with exponential backoff before giving up.
    defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 1000 } },
  });

  return {
    async publish<T>(name: string, payload: T): Promise<string> {
      const job = await queue.add(name, payload);
      return job.id ?? "";
    },
    async ping(): Promise<void> {
      // getJobCounts performs a live round-trip to Redis without side effects.
      await queue.getJobCounts();
    },
    async close(): Promise<void> {
      await queue.close();
    },
  };
}
