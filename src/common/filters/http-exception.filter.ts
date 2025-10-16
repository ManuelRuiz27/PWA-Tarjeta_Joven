import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';

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

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      const responseObject =
        typeof responseBody === 'string'
          ? { message: responseBody }
          : (responseBody as Record<string, unknown>);
      const responseMessage =
        responseObject?.message ?? exception.message ?? 'Error';

      const isArrayMessage = Array.isArray(responseMessage);
      message = isArrayMessage
        ? (responseMessage as string[]).join(', ')
        : String(responseMessage);

      code =
        (responseObject?.code as string | undefined) ??
        (isArrayMessage ? 'VALIDATION_ERROR' : exception.name);

      const responseDetails = responseObject?.details;
      if (responseDetails) {
        details = responseDetails;
      } else if (isArrayMessage) {
        details = responseMessage;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const exposeErrorDetails = this.options.exposeErrorDetails;

    if (!exposeErrorDetails) {
      const isHttpException = exception instanceof HttpException;
      if (!isHttpException || status >= HttpStatus.INTERNAL_SERVER_ERROR) {
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

    if (this.options.captureException && (status >= HttpStatus.INTERNAL_SERVER_ERROR || !(exception instanceof HttpException))) {
      this.options.captureException(exception, {
        ...logPayload,
      });
    }

    response.status(status).send(responseBody);
  }
}
