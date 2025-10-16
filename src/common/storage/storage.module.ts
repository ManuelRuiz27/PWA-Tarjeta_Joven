import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
import { STORAGE_PROVIDER, StorageProvider } from './storage.types';

@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageProvider,
    S3StorageProvider,
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService, LocalStorageProvider, S3StorageProvider],
      useFactory: (
        configService: ConfigService,
        localStorage: LocalStorageProvider,
        s3Storage: S3StorageProvider,
      ): StorageProvider => {
        const driver = (configService.get<string>('STORAGE_DRIVER') ?? 'local').toLowerCase();
        if (driver === 'local') {
          return localStorage;
        }
        if (driver === 's3') {
          return s3Storage;
        }
        throw new Error(`Unsupported storage driver: ${driver}`);
      },
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
