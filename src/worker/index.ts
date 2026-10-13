import { Worker } from "bullmq";

import { QUEUE_NAME } from "../lib/jobs/jobs.types";

const connection = { url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379" };

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(`[worker] processed ${job.name} (${job.id})`, job.data);
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`[worker] completed ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(`[worker] failed ${job?.id}`, error);
});

console.log(`[worker] listening on queue "${QUEUE_NAME}"`);
