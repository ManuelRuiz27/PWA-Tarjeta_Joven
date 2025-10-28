import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectSchema, ValidationError } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform<unknown, unknown> {
  constructor(private readonly schema: ObjectSchema) {}

  async transform(
    value: unknown,
    _metadata: ArgumentMetadata,
  ): Promise<unknown> {
    try {
      let payload: unknown = value;
      if (payload === undefined || payload === null) {
        payload = {};
      }
      const result: unknown = await this.schema.validateAsync(payload, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });
      return result;
    } catch (error: unknown) {
      if (this.isValidationError(error)) {
        const details = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Los datos proporcionados no son validos',
          details,
        });
      }

      throw error;
    }
  }

  private isValidationError(error: unknown): error is ValidationError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isJoi' in error &&
      Boolean((error as { isJoi?: boolean }).isJoi)
    );
  }
}
