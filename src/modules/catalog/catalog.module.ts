import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthenticateTokenMiddleware } from '../../common/middleware/authenticate-token.middleware';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, AuthenticateTokenMiddleware],
})
export class CatalogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateTokenMiddleware)
      .forRoutes(CatalogController);
  }
}
