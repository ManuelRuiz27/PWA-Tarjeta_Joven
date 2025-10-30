import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CS|CH|DF|CL|CM|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TL|TS|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;

export class LoginDto {
  @ApiProperty({ example: 'GALA000101MJCRRN01' })
  @IsString()
  @Matches(CURP_REGEX, { message: 'La CURP proporcionada no es valida' })
  curp!: string;

  @ApiProperty({ example: 'P4ssw0rd!' })
  @IsString()
  @MinLength(8)
  password!: string;
}
