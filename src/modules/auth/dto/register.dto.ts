import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiProperty()
  @IsString()
  apellidos!: string;

  @ApiProperty({ example: '31/12/2000' })
  @IsString()
  fechaNacimiento!: string;

  @ApiProperty({ example: 'CURP123456HDFLNS09' })
  @IsString()
  @Length(10, 18)
  curp!: string;

  @ApiProperty()
  @IsString()
  colonia!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ required: false })
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

  @ApiProperty()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  acepta_tc!: boolean;
}
