import cors from 'cors';

import { appConfig } from './env';

const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed = appConfig.corsOrigin.includes('*') ||
      appConfig.corsOrigin.some((allowedOrigin) => allowedOrigin === origin);

    callback(null, isAllowed);
  },
  credentials: true,
};

export const corsMiddleware = cors(corsOptions as any);
