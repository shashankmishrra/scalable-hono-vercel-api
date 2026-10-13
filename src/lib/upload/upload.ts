import { env } from "@/lib/env";

import { createSupabaseStorageClient } from "./upload.client";
import type { UploadClient } from "./upload.types";

// Lazily-created singleton; opened once and reused for the process lifetime.
let client: UploadClient | undefined;

/**
 * Returns the shared upload client, wired to local Supabase Storage. This is
 * the only entry point feature code should use.
 */
export function getUpload(): UploadClient {
  client ??= createSupabaseStorageClient({
    url: env.SUPABASE_URL,
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: env.UPLOAD_BUCKET,
  });
  return client;
}

export type { UploadClient };
