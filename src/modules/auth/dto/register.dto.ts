import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'Pérez López' })
  @IsString()
  apellidos!: string;

  @ApiProperty({ example: '31/12/2000' })
  @IsString()
  fechaNacimiento!: string;

  @ApiProperty({ example: 'CURP123456HDFLNS09' })
  @IsString()
  @Length(10, 18)
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

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  ine_file?: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  comprobante_file?: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  curp_file?: any;

  @ApiProperty({ example: true })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  acepta_tc!: boolean;
}
