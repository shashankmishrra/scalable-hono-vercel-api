import { Queue } from "bullmq";
import type { JobsClient, JobsClientConfig } from "./jobs.types";

export function createBullMqJobsClient(config: JobsClientConfig): JobsClient {
  const queue = new Queue(config.queueName, {
    connection: config.connection,
    defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 1000 } },
  });

  return {
    async publish<T>(name: string, payload: T): Promise<string> {
      const job = await queue.add(name, payload);
      return job.id ?? "";
    },
    async ping(): Promise<void> {
      await queue.getJobCounts();
    },
    async close(): Promise<void> {
      await queue.close();
    },
  };
}
