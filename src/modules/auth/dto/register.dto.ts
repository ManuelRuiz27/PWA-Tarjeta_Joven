import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CS|CH|DF|CL|CM|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TL|TS|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;

export class RegisterDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'Pérez López' })
  @IsString()
  apellidos!: string;

  @ApiProperty({ example: '31/12/2000' })
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/)
  fechaNacimiento!: string;

  @ApiProperty({ example: 'CAHG000101HDFLNS09' })
  @Transform(({ value, obj }) => {
    if (Array.isArray(value)) {
      const fileCandidate = value.find(
        (item) => item && typeof item === 'object' && item.type === 'file',
      );
      if (fileCandidate) {
        obj.curpFile = fileCandidate;
      }
      const stringCandidate = value.find((item) => typeof item === 'string');
      if (typeof stringCandidate === 'string') {
        return stringCandidate;
      }
      return fileCandidate?.value ?? '';
    }
    if (value && typeof value === 'object' && value.type === 'file') {
      obj.curpFile = value;
      return value.value ?? '';
    }
    return value;
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsString()
  @Matches(CURP_REGEX, { message: 'La CURP proporcionada no es válida' })
  curp!: string;

  @ApiProperty({ example: 'Colonia Centro' })
  @IsString()
  colonia!: string;

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
  ine?: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Archivo con la CURP escaneada',
  })
  @IsOptional()
  curpFile?: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  comprobante?: any;

  @ApiProperty({ example: true })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  acepta_tc!: boolean;
}
