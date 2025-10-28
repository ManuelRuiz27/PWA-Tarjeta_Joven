import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

interface HttpErrorFilterOptions {
  exposeErrorDetails: boolean;
  logger?: LoggerService;
  captureException?: (exception: unknown, context?: Record<string, unknown>) => void;
}

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  constructor(
    private readonly options: HttpErrorFilterOptions = { exposeErrorDetails: true },
  ) {}

  private isFastifyHttpError(exception: unknown): exception is FastifyError & {
    statusCode?: number;
    status?: number;
    code?: string;
    details?: unknown;
    validation?: unknown;
  } {
    if (!exception || typeof exception !== 'object') {
      return false;
    }

    const candidate = exception as Record<string, unknown>;
    const hasStatus =
      typeof candidate.statusCode === 'number' || typeof candidate.status === 'number';

    return hasStatus && typeof candidate.message === 'string';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: unknown;
    let handledAsHttpError = false;

    if (exception instanceof HttpException) {
      handledAsHttpError = true;
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      const responseObject =
        typeof responseBody === 'string'
          ? { message: responseBody }
          : (responseBody as Record<string, unknown>);
      const responseMessage = responseObject?.message ?? exception.message ?? 'Error';
      const isArrayMessage = Array.isArray(responseMessage);
      message = isArrayMessage
        ? responseMessage.map((item) => this.coerceToMessage(item)).join(', ')
        : this.coerceToMessage(responseMessage);

      code =
        (responseObject?.code as string | undefined) ??
        (isArrayMessage ? 'VALIDATION_ERROR' : exception.name);

      const responseDetails = responseObject?.details;
      if (responseDetails) {
        details = responseDetails;
      } else if (isArrayMessage) {
        details = responseMessage;
      }
    } else if (this.isFastifyHttpError(exception)) {
      handledAsHttpError = true;
      const httpStatus = exception.statusCode ?? exception.status;
      status =
        typeof httpStatus === 'number' && httpStatus >= 100
          ? httpStatus
          : HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.coerceToMessage(exception.message);
      code =
        typeof exception.code === 'string' && exception.code.trim().length > 0
          ? exception.code
          : status >= HttpStatus.INTERNAL_SERVER_ERROR
            ? 'FASTIFY_INTERNAL_ERROR'
            : 'FASTIFY_ERROR';
      details = exception.details ?? exception.validation ?? details;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const exposeErrorDetails = this.options.exposeErrorDetails;

    if (!exposeErrorDetails) {
      const isClientError = handledAsHttpError && status < HttpStatus.INTERNAL_SERVER_ERROR;
      if (!isClientError) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
        code = 'INTERNAL_ERROR';
        details = undefined;
      }
    }

    const responseBody = {
      statusCode: status,
      code,
      message,
      ...(details ? { details } : {}),
    };

    const logPayload = {
      ...responseBody,
      path: request?.url,
      method: request?.method,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR || !(exception instanceof HttpException)) {
      this.options.logger?.error(
        logPayload,
        exception instanceof Error ? exception.stack : undefined,
        HttpErrorFilter.name,
      );
    } else {
      this.options.logger?.warn(logPayload, HttpErrorFilter.name);
    }

    if (
      this.options.captureException &&
      (status >= HttpStatus.INTERNAL_SERVER_ERROR || !(exception instanceof HttpException))
    ) {
      this.options.captureException(exception, {
        ...logPayload,
      });
    }

    response.status(status).send(responseBody);
  }

  private coerceToMessage(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (value instanceof Error) {
      return value.message;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return 'Unknown error';
    }
  }
}
