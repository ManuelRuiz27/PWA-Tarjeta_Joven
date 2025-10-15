import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: 'CURP123456HDFLNS09' })
  @IsString()
  @Length(10, 18)
  curp!: string;
}
