import { Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';

export interface ThrottlerStorageRedis {
  /**
   * The redis instance.
   */
  redis: Redis.Redis;

  /**
   * Get a record via its key and return all its request ttls.
   */
  getRecord(key: string): Promise<number[]>;

  /**
   * Add a record to the storage. The record will automatically be removed from
   * the storage once its TTL has been reached.
   */
  addRecord(key: string, ttl: number): Promise<void>;
}

@Injectable()
export class ThrottlerStorageRedisService implements ThrottlerStorageRedis {
  redis: Redis.Redis;
  storage: Record<string, number[]>;

  constructor() {
    this.redis = new Redis({
      host: '127.0.0.1',
      port: 6379,
    });
    this.storage = {};
  }

  async getRecord(key: string): Promise<number[]> {
    const ttls = (
      await this.redis.scan(0, 'MATCH', `${key}:*`, 'COUNT', 10000)
    ).pop();
    return (ttls as string[]).map((k) => parseInt(k.split(':')[1])).sort();
  }

  async addRecord(key: string, ttl: number): Promise<void> {
    await this.redis.set(`${key}:${Date.now() + ttl * 1000}`, ttl, 'EX', ttl);
  }
}
