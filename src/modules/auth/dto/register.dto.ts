import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CS|CH|DF|CL|CM|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TL|TS|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;

export interface MultipartField {
  type?: string;
  value?: unknown;
  mimetype?: string;
  [key: string]: unknown;
}

const isMultipartField = (value: unknown): value is MultipartField =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  (value as { type?: unknown }).type === 'file';

const assignCurpFile = (target: unknown, file: MultipartField): void => {
  if (typeof target === 'object' && target !== null) {
    (target as { curpFile?: MultipartField }).curpFile = file;
  }
};

const extractCurpValue = (value: unknown, target: unknown): string => {
  if (Array.isArray(value)) {
    const stringCandidate = value.find((item): item is string => typeof item === 'string');
    if (stringCandidate) {
      return stringCandidate;
    }

    const fileCandidate = value.find(isMultipartField);
    if (fileCandidate) {
      assignCurpFile(target, fileCandidate);
      return typeof fileCandidate.value === 'string' ? fileCandidate.value : '';
    }

    return '';
  }

  if (isMultipartField(value)) {
    assignCurpFile(target, value);
    return typeof value.value === 'string' ? value.value : '';
  }

  return typeof value === 'string' ? value : '';
};

const coerceBoolean = (value: unknown): boolean =>
  value === true || value === 'true' || value === '1';

export class RegisterDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'Perez Lopez' })
  @IsString()
  apellidos!: string;

  @ApiProperty({ example: '31/12/2000' })
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/)
  fechaNacimiento!: string;

  @ApiProperty({
    example: 'P4ssw0rd!',
    description: 'Contrasena utilizada para el inicio de sesion',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'CAHG000101HDFLNS09' })
  @Transform(({ value, obj }) => extractCurpValue(value, obj))
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    if (value === undefined || value === null) {
      return '';
    }
    return String(value).toUpperCase();
  })
  @IsString()
  @Matches(CURP_REGEX, { message: 'La CURP proporcionada no es valida' })
  curp!: string;

  @ApiProperty({ example: 'Colonia Centro' })
  @IsString()
  colonia!: string;

  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ required: false, example: '3312345678' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ required: false, example: 'Guadalajara' })
  @IsOptional()
  @IsString()
  municipio?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  ine?: MultipartField;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Archivo con la CURP escaneada',
  })
  @IsOptional()
  curpFile?: MultipartField;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  comprobante?: MultipartField;

  @ApiProperty({ example: true })
  @Transform(({ value }) => coerceBoolean(value))
  @IsBoolean()
  acepta_tc!: boolean;
}
