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
      const responseMessage =
        typeof responseBody === 'string'
          ? responseBody
          : (responseBody as any).message ?? exception.message;
      message = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : responseMessage;
      code = (responseBody as any)?.code ?? exception.name;
      details = (responseBody as any)?.details;
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
