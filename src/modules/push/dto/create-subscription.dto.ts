import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PushSubscriptionKeysDto {
  @ApiProperty({ example: 'BOrD2PXrC9eY3ev1Dv2rQp1d...==' })
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @ApiProperty({ example: 'W1d2x3y4z5==' })
  @IsString()
  @IsNotEmpty()
  auth!: string;
}

export class CreatePushSubscriptionDto {
  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/c0ffe...' })
  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @ApiProperty({
    type: () => PushSubscriptionKeysDto,
    example: {
      p256dh: 'BOrD2PXrC9eY3ev1Dv2rQp1d...==',
      auth: 'W1d2x3y4z5==',
    },
  })
  keys!: PushSubscriptionKeysDto;
}
