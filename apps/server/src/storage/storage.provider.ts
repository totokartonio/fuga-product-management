import type { Readable } from "node:stream";

export interface StorageProvider {
  save(key: string, body: Buffer, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
  read(key: string): Promise<Readable>;
  getUrl(key: string): string;
}
