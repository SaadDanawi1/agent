import Redis from 'ioredis';
import { env } from '@delivery/config';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  enableReadyCheck: true,
  lazyConnect: true,
});

if (env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export class RedisService {
  private client: Redis;

  constructor() {
    this.client = redis;
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // Key-value operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  async pexpire(key: string, milliseconds: number): Promise<number> {
    return this.client.pexpire(key, milliseconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.client.hdel(key, ...fields);
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    return this.client.sismember(key, member);
  }

  // Sorted set operations (for leaderboards, nearby drivers)
  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.client.zadd(key, score, member);
  }

  async zrem(key: string, member: string): Promise<number> {
    return this.client.zrem(key, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrange(key, start, stop);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrevrange(key, start, stop);
  }

  async zscore(key: string, member: string): Promise<number | null> {
    return this.client.zscore(key, member);
  }

  // Geo operations (for driver locations)
  async geoadd(key: string, longitude: number, latitude: number, member: string): Promise<number> {
    return this.client.geoadd(key, longitude, latitude, member);
  }

  async georadius(
    key: string,
    longitude: number,
    latitude: number,
    radius: number,
    unit: 'm' | 'km' | 'mi' | 'ft' = 'km'
  ): Promise<string[]> {
    return this.client.georadius(key, longitude, latitude, radius, unit);
  }

  async geopos(key: string, member: string): Promise<[string, string] | null> {
    const result = await this.client.geopos(key, member);
    return result?.[0] ? [result[0][0], result[0][1]] : null;
  }

  // Pub/Sub (for real-time)
  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  subscribe(channel: string, callback: (message: string) => void): void {
    const subscriber = this.client.duplicate();
    subscriber.subscribe(channel);
    subscriber.on('message', (ch, msg) => {
      if (ch === channel) callback(msg);
    });
  }

  // Rate limiting helpers
  async checkRateLimit(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.pexpire(key, windowMs);
    }
    const ttl = await this.client.ttl(key);
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime: Date.now() + ttl * 1000,
    };
  }

  // Session management
  async setSession(userId: string, sessionId: string, data: object, ttlSeconds: number): Promise<void> {
    await this.client.set(`session:${userId}:${sessionId}`, JSON.stringify(data), 'EX', ttlSeconds);
  }

  async getSession(userId: string, sessionId: string): Promise<object | null> {
    const data = await this.client.get(`session:${userId}:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    await this.client.del(`session:${userId}:${sessionId}`);
  }

  async getUserSessions(userId: string): Promise<string[]> {
    const keys = await this.client.keys(`session:${userId}:*`);
    return keys.map(k => k.split(':').pop()!);
  }

  // OTP storage
  async storeOtp(phone: string, otp: string, ttlSeconds: number = 300): Promise<void> {
    await this.client.set(`otp:${phone}`, otp, 'EX', ttlSeconds);
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const stored = await this.client.get(`otp:${phone}`);
    if (stored === otp) {
      await this.client.del(`otp:${phone}`);
      return true;
    }
    return false;
  }

  async incrementOtpAttempts(phone: string): Promise<number> {
    const attempts = await this.client.incr(`otp:attempts:${phone}`);
    if (attempts === 1) {
      await this.client.expire(`otp:attempts:${phone}`, 3600); // 1 hour
    }
    return attempts;
  }

  async getOtpAttempts(phone: string): Promise<number> {
    const attempts = await this.client.get(`otp:attempts:${phone}`);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  // Driver location cache
  async updateDriverLocation(driverId: string, latitude: number, longitude: number): Promise<void> {
    const key = 'drivers:locations';
    await this.client.geoadd(key, longitude, latitude, driverId);
    await this.client.hset(`driver:${driverId}:location`, 'latitude', latitude.toString(), 'longitude', longitude.toString(), 'updatedAt', Date.now().toString());
    await this.client.expire(`driver:${driverId}:location`, 300); // 5 min TTL
  }

  async getDriverLocation(driverId: string): Promise<{ latitude: number; longitude: number } | null> {
    const data = await this.client.hgetall(`driver:${driverId}:location`);
    if (!data.latitude || !data.longitude) return null;
    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    };
  }

  async getNearbyDrivers(longitude: number, latitude: number, radiusKm: number = 5): Promise<string[]> {
    return this.client.georadius('drivers:locations', longitude, latitude, radiusKm, 'km');
  }

  // Cache invalidation
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}

export const redisService = new RedisService();
export default redisService;