import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { IncomingFile, StorageProvider } from './storage.types';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly basePath = path.resolve(process.cwd(), 'uploads', 'users');

  async saveUserDocument(
    userId: string,
    documentType: string,
    file: IncomingFile,
  ): Promise<string> {
    const safeName = this.buildSafeFileName(documentType, file.originalName);
    const targetDir = path.join(this.basePath, userId);
    await fs.mkdir(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, safeName);
    await fs.writeFile(targetPath, file.buffer);
    return targetPath;
  }

  private buildSafeFileName(documentType: string, originalName: string) {
    const extension = path.extname(originalName).toLowerCase();
    const sanitizedType = documentType.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const randomHash = randomBytes(8).toString('hex');
    const base = sanitizedType.length > 0 ? sanitizedType : 'document';
    return `${base}-${Date.now()}-${randomHash}${extension}`;
  }
}
