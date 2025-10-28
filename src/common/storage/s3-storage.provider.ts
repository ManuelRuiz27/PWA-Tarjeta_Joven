import { Injectable, NotImplementedException } from '@nestjs/common';
import { IncomingFile, StorageProvider } from './storage.types';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  saveUserDocument(
    userId: string,
    documentType: string,
    _file: IncomingFile,
  ): Promise<string> {
    const context = `${userId}/${documentType}`;
    return Promise.reject(
      new NotImplementedException(
        `S3 storage driver is not implemented yet for ${context}. Configure STORAGE_DRIVER=local to persist files locally.`,
      ),
    );
  }
}
