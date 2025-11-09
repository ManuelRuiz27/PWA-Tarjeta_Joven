import path from 'path';
import { config as loadEnv } from 'dotenv';

const environment = process.env.NODE_ENV ?? 'development';

loadEnv({
  path: path.resolve(
    process.cwd(),
    `.env${environment === 'development' ? '' : `.${environment}`}`,
  ),
});

export interface AppConfig {
  port: number;
  jwtSecret: string;
  corsOrigin: string[];
}

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const appConfig: AppConfig = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  corsOrigin: (process.env.CORS_ORIGIN ?? '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
