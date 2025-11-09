import 'dotenv/config';

import { createApp } from './app';
import { appConfig } from './config/env';
import { initializeDatabase } from './database/prismaClient';

const bootstrap = async () => {
  await initializeDatabase();

  const app = createApp();

  app.listen(appConfig.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${appConfig.port}`);
  });
};

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});
