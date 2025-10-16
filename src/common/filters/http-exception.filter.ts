import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

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

    response.status(status).send({
      statusCode: status,
      code,
      message,
      ...(details ? { details } : {}),
    });
  }
}
