import { Injectable } from '@nestjs/common';

@Injectable()
export class VersionService {
  getVersion() {
    return {
      version: process.env.npm_package_version ?? '0.0.0',
      commit:
        process.env.GIT_COMMIT ??
        process.env.VERCEL_GIT_COMMIT_SHA ??
        process.env.COMMIT_SHA ??
        'unknown',
    };
  }
}
