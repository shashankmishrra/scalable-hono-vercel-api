import { Queue, Worker } from "bullmq";
import { env } from "@/lib/env";
import { getCache } from "@/lib/cache/cache";
import { getUpload } from "@/lib/upload/upload";
import { getJobs } from "@/lib/jobs/jobs";

async function check(name: string, fn: () => Promise<void>): Promise<boolean> {
  try {
    await fn();
    console.log(`  ok  ${name}`);
    return true;
  } catch (error) {
    console.error(`FAIL  ${name}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function main(): Promise<void> {
  const results: boolean[] = [];

  results.push(
    await check("Redis (cache SDK)", async () => {
      const cache = getCache();
      await cache.ping();
      await cache.close();
    }),
  );

  results.push(
    await check("Supabase Postgres (PostgREST)", async () => {
      const response = await fetch(`${env.SUPABASE_URL}/rest/v1/`, {
        headers: { apikey: env.SUPABASE_ANON_KEY },
      });
      if (!response.ok) {
        throw new Error(`PostgREST returned ${response.status}`);
      }
    }),
  );

  results.push(
    await check("Supabase Auth", async () => {
      const response = await fetch(`${env.SUPABASE_URL}/auth/v1/health`);
      if (!response.ok) {
        throw new Error(`auth health returned ${response.status}`);
      }
    }),
  );

  results.push(
    await check("Supabase Storage (upload SDK)", async () => {
      const upload = getUpload();
      await upload.ensureBucket();
      const key = `verify/${Date.now()}.txt`;
      const uploadUrl = await upload.createUploadUrl(key);
      const put = await fetch(uploadUrl, { method: "PUT", body: "verify" });
      if (!put.ok) {
        throw new Error(`signed upload returned ${put.status}`);
      }
      if (!(await upload.verifyObject(key))) {
        throw new Error("object not found after upload");
      }
      await upload.deleteObject(key);
    }),
  );

  results.push(
    await check("BullMQ queue (jobs SDK + worker round-trip)", async () => {
      const jobs = getJobs();
      await jobs.ping();

      const verifyQueue = "resourcebox-verify";
      const connection = { url: env.REDIS_URL };
      const worker = new Worker(verifyQueue, async () => {}, { connection });
      await worker.waitUntilReady();

      const queue = new Queue(verifyQueue, { connection });
      const completed = new Promise<string>((resolve) => {
        worker.on("completed", (job) => resolve(job.id ?? ""));
      });

      const job = await queue.add(
        "verify.ping",
        { at: Date.now() },
        { removeOnComplete: true, removeOnFail: true },
      );
      const ok = await Promise.race([
        completed.then((id) => id === (job.id ?? "")),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)),
      ]);

      await worker.close();
      // Remove the throwaway queue so repeated runs leave no Redis keys behind.
      await queue.obliterate({ force: true }).catch(() => {});
      await queue.close();
      await jobs.close();
      if (!ok) {
        throw new Error("job did not complete");
      }
    }),
  );

  const failed = results.filter((result) => !result).length;
  console.log(`\n${failed === 0 ? "all checks passed" : `${failed} check(s) failed`}`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
