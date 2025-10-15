import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { PrismaModule } from './common/services/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { VersionModule } from './modules/version/version.module';
import { UsersModule } from './modules/users/users.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AuthModule } from './modules/auth/auth.module';
import { PushModule } from './modules/push/push.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    HealthModule,
    VersionModule,
    UsersModule,
    CatalogModule,
    AuthModule,
    PushModule,
  ],
})
export class AppModule {}
