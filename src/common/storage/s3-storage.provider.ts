import { Injectable, NotImplementedException } from '@nestjs/common';
import { IncomingFile, StorageProvider } from './storage.types';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  async saveUserDocument(
    _userId: string,
    _documentType: string,
    _file: IncomingFile,
  ): Promise<string> {
    throw new NotImplementedException(
      'S3 storage driver is not implemented yet. Configure STORAGE_DRIVER=local to persist files locally.',
    );
  }
}
