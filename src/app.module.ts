import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerGuard } from './guards/throttle.guard';
import { LoggerModule } from './logger.module';
import { LoggerService } from './services/logger.service';
import { ThrottlerStorageRedisService } from './services/throttle.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [LoggerModule],
      inject: [LoggerService],
      useFactory: () => ({
        ttl: 50,
        limit: 1,
        storage: new ThrottlerStorageRedisService(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
