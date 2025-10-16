import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { CURP_REGEX } from './send-otp.dto';

export class VerifyOtpDto {
  @ApiProperty({ example: 'CURP123456HDFLNS09' })
  @IsString()
  @Length(10, 18)
  @Matches(CURP_REGEX, {
    message: 'El CURP proporcionado no es válido',
  })
  curp!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'El código OTP debe contener 6 dígitos' })
  otp!: string;
}
