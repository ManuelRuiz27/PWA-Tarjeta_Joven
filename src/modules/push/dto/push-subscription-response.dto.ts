import { ApiProperty } from '@nestjs/swagger';

export class PushSubscriptionResponseDto {
  @ApiProperty({ example: 'sub_123' })
  id!: string;

  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/c0ffe...' })
  endpoint!: string;

  @ApiProperty({ example: 'BOrD2PXrC9eY3ev1Dv2rQp1d...==' })
  p256dh!: string;

  @ApiProperty({ example: 'W1d2x3y4z5==' })
  auth!: string;

  @ApiProperty({ example: 'usr_123' })
  userId!: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-02T12:00:00.000Z', format: 'date-time' })
  updatedAt!: Date;
}
