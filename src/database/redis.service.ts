import { Injectable, Inject } from '@nestjs/common';
import * as Redis from 'ioredis';
import * as crypto from 'crypto';
require('dotenv').config();


@Injectable()
export class RedisService {
  private encryptionKey: string;

  constructor(
    @Inject('REDIS_CONNECTION') private readonly redis: Redis.Redis,

  ) {
    // Access encryption key from environment variables
    this.encryptionKey = process.env.ENCRYPTION_KEY;
  }

  encrypt(text: string): string {
    if (!text) {
      throw new Error('No text provided for encryption');
    }

    const key = Buffer.from(this.encryptionKey.padEnd(32, '\0'), 'utf-8');

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const result = iv.toString('base64') + ':' + encrypted;

    return result;
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) {
      throw new Error('No encrypted text provided for decryption');
    }

    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }

    const [ivBase64, encryptedBase64] = parts;

    const iv = Buffer.from(ivBase64, 'base64');
    const encrypted = Buffer.from(encryptedBase64, 'base64');

    const key = Buffer.from(this.encryptionKey.padEnd(32, '\0'), 'utf-8');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  async setKeyWithEncrypt({
    key,
    value,
    time,
  }: {
    key: string;
    value: string;
    time?: number;
  }): Promise<'OK' | null> {
    const encryptedValue = await this.encrypt(value);
    return await this.redis.set(key, encryptedValue, 'EX', time || 600);
  }

  async setKey({
    key,
    value,
    time,
  }: {
    key: string;
    value: string;
    time?: number;
  }): Promise<'OK' | null> {
    return await this.redis.set(key, value, 'EX', time || 600);
  }
  async getKeyWithDecrypt(key: string): Promise<any | null> {
    const encryptedValue = await this.redis.get(key);
    if (!encryptedValue) return null;
    return this.decrypt(encryptedValue);
  }

  async getKey(key: string): Promise<any | null> {
    return await this.redis.get(key);
  }

  async delKey(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async existsKey(key: string): Promise<number> {
    return this.redis.exists(key);
  }

  // Thêm token vào blacklist
  async addToBlacklist({
    token,
    ttl = 3600,
  }: {
    token: string;
    ttl?: number;
  }): Promise<void> {
    const key = `blacklist:token:${token}`;

    await this.redis.sadd('blacklist', key);

    await this.redis.setex(key, ttl, token);
    console.log(`Token added to blacklist with TTL: ${key}`);
  }

  // Kiểm tra xem token có trong blacklist không
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:token:${token}`;
    const exists = await this.redis.sismember('blacklist', key);
    return exists === 1;
  }

  // Xóa token khỏi blacklist
  async removeFromBlacklist(token: string): Promise<void> {
    const key = `blacklist:token:${token}`;
    await this.redis.srem('blacklist', key);
    console.log(`Token removed from blacklist: ${key}`);
  }

  async clearAll(): Promise<string> {
    const result = await this.redis.flushall();
    return result;
  }
}
