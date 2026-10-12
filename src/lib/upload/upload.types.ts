export interface UploadClient {
  ensureBucket(name?: string): Promise<void>;
  createUploadUrl(key: string): Promise<string>;
  createDownloadUrl(key: string, expiresIn?: number): Promise<string>;
  verifyObject(key: string): Promise<boolean>;
  deleteObject(key: string): Promise<void>;
  ping(): Promise<void>;
}

export interface UploadClientConfig {
  url: string;
  serviceKey: string;
  bucket: string;
}
