import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: 'CURP123456HDFLNS09' })
  @IsString()
  @Length(10, 18)
  curp!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(4, 6)
  otp!: string;
}
