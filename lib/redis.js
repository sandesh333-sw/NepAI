import 'server-only' 
import Redis from "ioredis";

let redis;

const redisUrl = process.env.UPSTASH_REDIS_URL;
const isValidRedisUrl =
  typeof redisUrl === 'string' &&
  (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://'));

if (isValidRedisUrl) {
  redis = new Redis(redisUrl, {
    // JUSTIFICATION: Upstash requires TLS connection
    tls: {},
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on("error", (err) => {
    console.error("Redis client error", err);
  });

  redis.on("connect", () => {
    console.log("Redis Client Connected");
  });
} else {
  if (redisUrl) {
    console.warn(
      "Invalid UPSTASH_REDIS_URL (expected redis:// or rediss://), caching disabled"
    );
  } else {
    console.warn("Redis URL not configured, caching disabled");
  }
}

// Cache helper functions
// JUSTIFICATION: Centralized cache operations with JSON serialization and error handling
export const cache = {
  async get(key) {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis GET error:", error);
      return null;
    }
  },

  async set(key, value, expirationInSeconds = 300) {
    if (!redis) return false;
    try {
      await redis.setex(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Redis SET error", error);
      return false;
    }
  },

  async del(key) {
    if (!redis) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error("Redis DEL error", error);
      return false;
    }
  },

  async delPattern(pattern) {
    if (!redis) return false;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("Redis DEL PATTERN error:", error);
      return false;
    }
  },
};

// Rate limiter using sliding window algorithm
// JUSTIFICATION: Sliding window is more accurate than fixed window, prevents burst attacks
// Stores timestamps in Redis sorted set, removes old ones, counts remaining
export const rateLimiter = {
  async check(identifier, route, limit, windowSecs) {
    // JUSTIFICATION: Fail open if Redis is down — app keeps working
    if (!redis) return { success: true, remaining: limit, resetIn: windowSecs };

    const key = `rate_limit:${route}:${identifier}`;
    const now = Date.now();
    const windowMs = windowSecs * 1000;

    try {
      // Remove timestamps outside current window
      await redis.zremrangebyscore(key, 0, now - windowMs);
      
      // Count requests in current window
      const count = await redis.zcard(key);

      if (count >= limit) {
        return { success: false, remaining: 0, resetIn: windowSecs };
      }

      // Add current request timestamp
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      
      // Auto-expire key for cleanup
      await redis.expire(key, windowSecs);

      return { success: true, remaining: limit - count - 1, resetIn: windowSecs };
    } catch (error) {
      // JUSTIFICATION: Fail open on Redis errors to prevent app downtime
      console.error("Rate limit error:", error);
      return { success: true, remaining: limit, resetIn: windowSecs };
    }
  },
};

export default redis;