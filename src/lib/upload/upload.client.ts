import { createClient } from "@supabase/supabase-js";

import type { UploadClient, UploadClientConfig } from "./upload.types";

/**
 * Builds an {@link UploadClient} backed by Supabase Storage. The service-role
 * key is server-only and is used to sign URLs and manage the bucket.
 */
export function createSupabaseStorageClient(config: UploadClientConfig): UploadClient {
  const supabase = createClient(config.url, config.serviceKey, {
    // No browser session to persist; only the server-side storage API is used.
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const storage = supabase.storage;

  // Supabase-js returns `{ data, error }`; centralise the error -> exception
  // mapping so callers get a single, consistent failure path.
  function throwOnError(error: { message: string } | null, context: string): void {
    if (error) {
      throw new Error(`${context}: ${error.message}`);
    }
  }

  async function ensureBucket(name = config.bucket): Promise<void> {
    const { data, error } = await storage.listBuckets();
    throwOnError(error, "list buckets");
    if (!data) {
      throw new Error("list buckets: empty response");
    }
    // Idempotent: only create when missing so repeated ensure calls are safe.
    if (data.some((bucket) => bucket.name === name)) {
      return;
    }
    const { error: createError } = await storage.createBucket(name, { public: false });
    throwOnError(createError, `create bucket "${name}"`);
  }

  async function createUploadUrl(key: string): Promise<string> {
    // Buckets are created lazily so a fresh environment works on first use.
    await ensureBucket();
    const { data, error } = await storage.from(config.bucket).createSignedUploadUrl(key);
    throwOnError(error, `create upload url for "${key}"`);
    if (!data) {
      throw new Error(`create upload url for "${key}": empty response`);
    }
    return data.signedUrl;
  }

  async function createDownloadUrl(key: string, expiresIn = 60): Promise<string> {
    const { data, error } = await storage.from(config.bucket).createSignedUrl(key, expiresIn);
    throwOnError(error, `create download url for "${key}"`);
    if (!data) {
      throw new Error(`create download url for "${key}": empty response`);
    }
    return data.signedUrl;
  }

  async function verifyObject(key: string): Promise<boolean> {
    // A signed URL for a missing object returns an error, which is a cheap
    // existence check that avoids downloading the object.
    const { error } = await storage.from(config.bucket).createSignedUrl(key, 60);
    return !error;
  }

  async function deleteObject(key: string): Promise<void> {
    const { error } = await storage.from(config.bucket).remove([key]);
    throwOnError(error, `delete object "${key}"`);
  }

  async function ping(): Promise<void> {
    const { error } = await storage.listBuckets();
    throwOnError(error, "storage ping");
  }

  return {
    ensureBucket,
    createUploadUrl,
    createDownloadUrl,
    verifyObject,
    deleteObject,
    ping,
  };
}
