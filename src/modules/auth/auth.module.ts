import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { OtpSenderService } from './providers/otp-sender.service';
import { OtpThrottleGuard } from '../../common/guards/otp-throttle.guard';
import { RefreshGuard } from '../../common/guards/refresh.guard';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TTL') ?? '900s',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpSenderService, OtpThrottleGuard, RefreshGuard],
  exports: [AuthService],
})
export class AuthModule {}
