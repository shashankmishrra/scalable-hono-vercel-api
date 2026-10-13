/**
 * Provider-agnostic object-storage contract used by the upload feature. Local
 * development talks to Supabase Storage; production will target AWS S3 behind
 * this same interface.
 */
export interface UploadClient {
  /** Creates the private bucket if it does not already exist. */
  ensureBucket(name?: string): Promise<void>;
  /** Returns a short-lived signed URL the browser uses to upload `key`. */
  createUploadUrl(key: string): Promise<string>;
  /** Returns a short-lived signed URL for downloading `key`. */
  createDownloadUrl(key: string, expiresIn?: number): Promise<string>;
  /** True when the object `key` exists in the bucket. */
  verifyObject(key: string): Promise<boolean>;
  /** Deletes the object `key`. */
  deleteObject(key: string): Promise<void>;
  /** Confirms the storage service is reachable. */
  ping(): Promise<void>;
}

export interface UploadClientConfig {
  url: string;
  serviceKey: string;
  bucket: string;
}
