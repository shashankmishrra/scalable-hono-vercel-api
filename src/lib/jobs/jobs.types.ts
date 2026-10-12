export const QUEUE_NAME = "resourcebox";

export interface JobsClient {
  publish<T>(name: string, payload: T): Promise<string>;
  ping(): Promise<void>;
  close(): Promise<void>;
}

export interface JobsClientConfig {
  connection: { url: string };
  queueName: string;
}
