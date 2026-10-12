/**
 * Process-local fixed-window rate limiter.
 *
 * Both `ne-2` (apps/api/src/modules/auth/services/rate-limiter.ts,
 * `AuthRateLimiter`) and `nevo-event-os-3` (apps/web/lib/rate-limit.ts,
 * `consumeRateLimit`) had independently implemented the same fixed-window
 * counter shape (a Map<string, {count, resetAt}>, reset when the window
 * expires, deny once the count exceeds the limit). nevo-event-os-3's
 * version additionally bounds the map's size to guard against unbounded
 * growth from unique keys (e.g. many distinct IPs) - that safeguard is
 * folded in here since it's a strict improvement with no behavior change
 * for callers under the bound.
 *
 * This remains an explicit "process-local fallback" per nevo-event-os-3's
 * own comment - a durable, shared (e.g. Redis-backed) limiter for
 * multi-instance deployments is out of scope for this package.
 */

export interface RateLimitAllowed {
  allowed: true;
  remaining: number;
  resetAt: number;
}

export interface RateLimitDenied {
  allowed: false;
  retryAfterSeconds: number;
  resetAt: number;
}

export type RateLimitResult = RateLimitAllowed | RateLimitDenied;

interface Bucket {
  count: number;
  resetAt: number;
}

export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly maxBuckets = 10_000) {}

  /** Full result shape: use when callers need remaining/retry-after (nevo-event-os-3 style). */
  consume(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
    if (this.buckets.size > this.maxBuckets) {
      for (const [entry, bucket] of this.buckets) {
        if (bucket.resetAt <= now || this.buckets.size > this.maxBuckets) this.buckets.delete(entry);
        if (this.buckets.size <= this.maxBuckets) break;
      }
    }
    const existing = this.buckets.get(key);
    const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;
    bucket.count += 1;
    this.buckets.set(key, bucket);
    if (bucket.count > limit) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000)), resetAt: bucket.resetAt };
    }
    return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
  }

  /** Simple boolean form: use for a plain accept/reject check (ne-2 AuthRateLimiter style). */
  allow(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
    return this.consume(key, limit, windowMs, now).allowed;
  }
}

export function rateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(limit),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1_000)),
  };
  if (result.allowed) headers["RateLimit-Remaining"] = String(result.remaining);
  else headers["Retry-After"] = String(result.retryAfterSeconds);
  return headers;
}
