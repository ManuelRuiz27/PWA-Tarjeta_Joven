import { CorsOptions } from 'cors';
import { AppConfig } from '../../config/app.config';

export const buildCorsOptions = (config: AppConfig): CorsOptions => {
  const origin = config.cors.origin;

  return {
    origin,
    methods: config.cors.methods,
    credentials: origin === '*' ? false : config.cors.credentials,
  };
};
