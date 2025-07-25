// src/utils/rateLimiter.ts
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

interface RateLimitError {
  limited: true;
  retryAfter: number;
  message: string;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  private cleanupOldRequests(key: string, windowMs: number) {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((time) => now - time < windowMs);

    if (validRequests.length === 0) {
      this.requests.delete(key);
    } else {
      this.requests.set(key, validRequests);
    }
  }

  canMakeRequest(config: RateLimitConfig): boolean {
    const key = config.identifier || "global";
    const now = Date.now();

    this.cleanupOldRequests(key, config.windowMs);

    const requests = this.requests.get(key) || [];

    return requests.length < config.maxRequests;
  }

  recordRequest(identifier?: string) {
    const key = identifier || "global";
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    requests.push(now);
    this.requests.set(key, requests);
  }

  getRemainingRequests(config: RateLimitConfig): number {
    const key = config.identifier || "global";
    this.cleanupOldRequests(key, config.windowMs);
    const requests = this.requests.get(key) || [];
    return Math.max(0, config.maxRequests - requests.length);
  }

  getResetTime(config: RateLimitConfig): number {
    const key = config.identifier || "global";
    const requests = this.requests.get(key) || [];

    if (requests.length === 0) return 0;

    const oldestRequest = Math.min(...requests);
    return oldestRequest + config.windowMs;
  }

  checkRateLimit(config: RateLimitConfig): RateLimitError | null {
    if (!this.canMakeRequest(config)) {
      const resetTime = this.getResetTime(config);
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      return {
        limited: true,
        retryAfter,
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      };
    }

    return null;
  }
}

export const rateLimiter = new RateLimiter();

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Auth endpoints - strict limits
  LOGIN: { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 attempts per 15 minutes
  REGISTER: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  PASSWORD_RESET: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour

  // Exam endpoints
  SUBMIT_EXAM: { maxRequests: 2, windowMs: 60 * 1000 }, // 2 per minute
  FETCH_QUESTIONS: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute

  // Forum endpoints
  CREATE_POST: { maxRequests: 5, windowMs: 5 * 60 * 1000 }, // 5 posts per 5 minutes
  CREATE_COMMENT: { maxRequests: 10, windowMs: 5 * 60 * 1000 }, // 10 comments per 5 minutes
  LIKE_ACTION: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 likes per minute

  // General API calls
  FETCH_DATA: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 per minute
  SEARCH: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 searches per minute
};

// Hook for rate limiting
export function useRateLimit(limitConfig: RateLimitConfig) {
  const checkLimit = () => rateLimiter.canMakeRequest(limitConfig);
  const recordRequest = () => rateLimiter.recordRequest(limitConfig.identifier);
  const getRemainingRequests = () =>
    rateLimiter.getRemainingRequests(limitConfig);
  const getResetTime = () => rateLimiter.getResetTime(limitConfig);
  const checkRateLimit = () => rateLimiter.checkRateLimit(limitConfig);

  return {
    checkLimit,
    recordRequest,
    getRemainingRequests,
    getResetTime,
    checkRateLimit,
  };
}
