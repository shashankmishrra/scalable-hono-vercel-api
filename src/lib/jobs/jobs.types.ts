/** Default BullMQ queue name shared by both the publisher and the worker. */
export const QUEUE_NAME = "resourcebox";

/**
 * Provider-agnostic job-publishing contract. Local development uses BullMQ
 * (Redis); production will target Upstash QStash behind this same interface.
 */
export interface JobsClient {
  /** Enqueues a typed job and resolves with the job id. */
  publish<T>(name: string, payload: T): Promise<string>;
  /** Confirms the queue backend is reachable. */
  ping(): Promise<void>;
  /** Releases the underlying queue connection(s). */
  close(): Promise<void>;
}

export interface JobsClientConfig {
  connection: { url: string };
  queueName: string;
}
