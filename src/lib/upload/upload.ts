import { env } from "@/lib/env";
import { createSupabaseStorageClient } from "./upload.client";
import type { UploadClient } from "./upload.types";

let client: UploadClient | undefined;

export function getUpload(): UploadClient {
  client ??= createSupabaseStorageClient({
    url: env.SUPABASE_URL,
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: env.UPLOAD_BUCKET,
  });
  return client;
}

export type { UploadClient };
