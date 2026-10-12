import { createClient } from "@supabase/supabase-js";
import type { UploadClient, UploadClientConfig } from "./upload.types";

export function createSupabaseStorageClient(config: UploadClientConfig): UploadClient {
  const supabase = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const storage = supabase.storage;

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
    if (data.some((bucket) => bucket.name === name)) {
      return;
    }
    const { error: createError } = await storage.createBucket(name, { public: false });
    throwOnError(createError, `create bucket "${name}"`);
  }

  async function createUploadUrl(key: string): Promise<string> {
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
    const { error } = await storage.from(config.bucket).createSignedUrl(key, 60);
    if (error) {
      return false;
    }
    return true;
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
