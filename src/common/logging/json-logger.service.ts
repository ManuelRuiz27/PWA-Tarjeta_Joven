import { LogLevel, LoggerService } from '@nestjs/common';

const LOG_LEVEL_ORDER: LogLevel[] = [
  'fatal',
  'error',
  'warn',
  'log',
  'debug',
  'verbose',
];

export interface JsonLoggerOptions {
  level?: LogLevel;
}

interface LogPayload {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: string;
  stack?: string;
  meta?: Record<string, unknown>;
}

export class JsonLoggerService implements LoggerService {
  private allowedLevels: Set<LogLevel>;

  constructor(options: JsonLoggerOptions = {}) {
    const level = options.level ?? 'log';
    this.allowedLevels = this.buildLevelsFromThreshold(level);
  }

  setLogLevels(levels: LogLevel[]) {
    if (!levels || levels.length === 0) {
      return;
    }

    this.allowedLevels = new Set(levels);
  }

  setLogLevel(level: LogLevel) {
    this.allowedLevels = this.buildLevelsFromThreshold(level);
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    const { context, meta } = this.extractContextAndMeta(optionalParams);
    this.write('log', message, { context, meta });
  }

  error(message: unknown, stack?: string, context?: string, ...optionalParams: unknown[]) {
    const extraMeta = this.normalizeMeta(optionalParams.length > 0 ? optionalParams : undefined);
    this.write('error', message, {
      context,
      stack,
      meta: extraMeta,
    });
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    const { context, meta } = this.extractContextAndMeta(optionalParams);
    this.write('warn', message, { context, meta });
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    const { context, meta } = this.extractContextAndMeta(optionalParams);
    this.write('debug', message, { context, meta });
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    const { context, meta } = this.extractContextAndMeta(optionalParams);
    this.write('verbose', message, { context, meta });
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    const { context, meta } = this.extractContextAndMeta(optionalParams);
    this.write('fatal', message, { context, meta });
  }

  private buildLevelsFromThreshold(level: LogLevel): Set<LogLevel> {
    const thresholdIndex = LOG_LEVEL_ORDER.indexOf(level);
    if (thresholdIndex < 0) {
      return new Set(LOG_LEVEL_ORDER);
    }

    return new Set(LOG_LEVEL_ORDER.slice(0, thresholdIndex + 1));
  }

  private extractContextAndMeta(
    optionalParams: unknown[],
  ): { context?: string; meta?: Record<string, unknown> } {
    if (!optionalParams || optionalParams.length === 0) {
      return {};
    }

    const [first, ...rest] = optionalParams;

    if (typeof first === 'string') {
      const context = first;
      if (rest.length === 0) {
        return { context };
      }

      return { context, meta: this.normalizeMeta(rest.length === 1 ? rest[0] : rest) };
    }

    return { meta: this.normalizeMeta(optionalParams.length === 1 ? optionalParams[0] : optionalParams) };
  }

  private normalizeMeta(meta: unknown): Record<string, unknown> | undefined {
    if (meta === undefined) {
      return undefined;
    }

    if (Array.isArray(meta)) {
      return { data: meta };
    }

    if (typeof meta === 'object' && meta !== null) {
      return meta as Record<string, unknown>;
    }

    return { data: meta };
  }

  private normalizeMessage(
    message: unknown,
  ): { text: string; meta?: Record<string, unknown>; stack?: string } {
    if (message instanceof Error) {
      return {
        text: message.message,
        meta: {
          name: message.name,
        },
        stack: message.stack,
      };
    }

    if (typeof message === 'string') {
      return { text: message };
    }

    if (typeof message === 'object' && message !== null) {
      const payload = message as Record<string, unknown>;
      const text = typeof payload.message === 'string' ? payload.message : JSON.stringify(payload);
      const meta = { ...payload };
      delete meta.message;
      return {
        text,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
      };
    }

    return { text: String(message) };
  }

  private write(
    level: LogLevel,
    message: unknown,
    options: { context?: string; meta?: Record<string, unknown>; stack?: string },
  ) {
    if (!this.allowedLevels.has(level)) {
      return;
    }

    const normalizedMessage = this.normalizeMessage(message);
    const payload: LogPayload = {
      level,
      timestamp: new Date().toISOString(),
      message: normalizedMessage.text,
      ...(options.context ? { context: options.context } : {}),
      ...(normalizedMessage.stack || options.stack
        ? { stack: options.stack ?? normalizedMessage.stack }
        : {}),
      ...(normalizedMessage.meta || options.meta
        ? { meta: this.mergeMeta(normalizedMessage.meta, options.meta) }
        : {}),
    };

    const serialized = JSON.stringify(payload);

    if (level === 'error' || level === 'fatal') {
      console.error(serialized);
      return;
    }

    if (level === 'warn') {
      console.warn(serialized);
      return;
    }

    console.log(serialized);
  }

  private mergeMeta(
    primary?: Record<string, unknown>,
    secondary?: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!primary && !secondary) {
      return {};
    }

    if (!primary) {
      return secondary ?? {};
    }

    if (!secondary) {
      return primary;
    }

    return { ...secondary, ...primary };
  }
}
