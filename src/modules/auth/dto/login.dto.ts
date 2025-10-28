import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'P4ssw0rd!' })
  @IsString()
  @MinLength(8)
  password!: string;
}
