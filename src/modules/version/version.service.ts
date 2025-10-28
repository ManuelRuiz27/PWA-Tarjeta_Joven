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
      const contents = readFileSync(packageJsonPath, 'utf8');
      const parsed = JSON.parse(contents) as unknown;

      if (this.isPackageJson(parsed)) {
        return parsed.version;
      }

      return '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  private isPackageJson(value: unknown): value is { version: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'version' in value &&
      typeof (value as { version?: unknown }).version === 'string'
    );
  }
}
