import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class VersionService {
  private readonly version: string;

  constructor() {
    this.version = this.loadVersion();
  }

  getVersion() {
    return {
      version: this.version,
      commit:
        process.env.GIT_COMMIT_SHORT ??
        process.env.GIT_COMMIT ??
        process.env.VERCEL_GIT_COMMIT_SHA ??
        process.env.COMMIT_SHA ??
        'unknown',
    };
  }

  private loadVersion(): string {
    try {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      return typeof packageJson.version === 'string'
        ? packageJson.version
        : '0.0.0';
    } catch (error) {
      return '0.0.0';
    }
  }
}
