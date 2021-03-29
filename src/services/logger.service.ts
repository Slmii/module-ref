import { Inject, Logger } from '@nestjs/common';
import { ContextIdFactory, ModuleRef, REQUEST } from '@nestjs/core';
import { Request } from 'express';

export class LoggerService extends Logger {
  constructor(
    @Inject(REQUEST) private req?: Request,
    private moduleRef?: ModuleRef,
  ) {
    super('Nest');
  }

  log(message: string) {
    console.log('LOG [' + this.context + '] ' + message);
    console.log(this.req);
  }

  async customLog(message: string) {
    if (!this.moduleRef) {
      return;
    }

    if (!this.req) {
      return;
    }

    const contextId = ContextIdFactory.getByRequest(this.req);
    const { req } = await this.moduleRef.resolve(LoggerService, contextId);

    console.log(message);
    console.log(req);
  }
}
