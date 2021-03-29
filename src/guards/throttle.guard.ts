import { ExecutionContext, Injectable } from '@nestjs/common';
import { ContextIdFactory, ModuleRef, Reflector } from '@nestjs/core';
import { ThrottlerException, ThrottlerGuard as TGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { ThrottlerStorageRedisService } from 'src/services/throttle.service';

import { LoggerService } from '../services/logger.service';

@Injectable()
export class ThrottlerGuard extends TGuard {
  private logger: LoggerService | null = null;
  constructor(protected reflector: Reflector, private moduleRef: ModuleRef) {
    super({}, new ThrottlerStorageRedisService(), reflector);
  }

  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    this.logger = (await this.moduleRef.resolve(
      LoggerService,
    )) as LoggerService;

    const request = context.switchToHttp().getRequest<Request>();

    const contextId = ContextIdFactory.create();
    this.moduleRef.registerRequestByContextId(request, contextId);

    const ip = request.socket.remoteAddress;
    const key = this.generateKey(context, ip);
    const ttls = await this.storageService.getRecord(key);

    if (ttls.length >= limit) {
      this.logger.customLog('Rate limit exceeded');
      throw new ThrottlerException();
    }

    await this.storageService.addRecord(key, ttl);
    return true;
  }
}
