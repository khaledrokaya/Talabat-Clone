import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, mergeMap, retryWhen, map } from 'rxjs/operators';

interface RequestInfo {
  timestamp: number;
  count: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class RateLimiterService {
  private requestCounts = new Map<string, RequestInfo>();
  private cache = new Map<string, CacheEntry>();

  // Rate limiting configuration
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_REQUESTS_PER_WINDOW = 50; // Max 50 requests per minute
  private readonly RETRY_DELAY = 2000; // 2 seconds delay before retry

  // Cache configuration
  private readonly DEFAULT_CACHE_DURATION = 30000; // 30 seconds
  private readonly CACHE_CLEANUP_INTERVAL = 300000; // 5 minutes

  constructor() {
    // Periodic cache cleanup
    setInterval(() => this.cleanupCache(), this.CACHE_CLEANUP_INTERVAL);
  }

  /**
   * Check if a request should be rate limited
   */
  private isRateLimited(key: string): boolean {
    const now = Date.now();
    const info = this.requestCounts.get(key);

    if (!info) {
      this.requestCounts.set(key, { timestamp: now, count: 1 });
      return false;
    }

    // Reset counter if window has passed
    if (now - info.timestamp > this.RATE_LIMIT_WINDOW) {
      this.requestCounts.set(key, { timestamp: now, count: 1 });
      return false;
    }

    // Increment counter
    info.count++;

    // Check if rate limit exceeded
    return info.count > this.MAX_REQUESTS_PER_WINDOW;
  }

  /**
   * Get data from cache if available and not expired
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Store data in cache
   */
  private setCachedData(key: string, data: any, duration?: number): void {
    const expiry = Date.now() + (duration || this.DEFAULT_CACHE_DURATION);
    this.cache.set(key, { data, timestamp: Date.now(), expiry });
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Execute a request with rate limiting and caching
   */
  executeRequest<T>(
    requestFn: () => Observable<T>,
    cacheKey: string,
    options?: {
      cacheDuration?: number;
      skipCache?: boolean;
      rateLimit?: boolean;
    }
  ): Observable<T> {
    const {
      cacheDuration = this.DEFAULT_CACHE_DURATION,
      skipCache = false,
      rateLimit = true
    } = options || {};

    // Check cache first (unless skipped)
    if (!skipCache) {
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for: ${cacheKey}`);
        return of(cachedData);
      }
    }

    // Check rate limiting
    if (rateLimit && this.isRateLimited(cacheKey)) {
      console.warn(`Rate limit exceeded for: ${cacheKey}`);
      return throwError(() => new Error('Rate limit exceeded. Please try again later.'));
    }

    // Execute the request
    return requestFn().pipe(
      map((response: T) => {
        // Cache the response
        if (!skipCache) {
          this.setCachedData(cacheKey, response, cacheDuration);
        }
        return response;
      }),
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error: any) => {
            // Retry on 429 errors with delay
            if (error.status === 429) {
              console.log(`429 error, retrying in ${this.RETRY_DELAY}ms...`);
              return timer(this.RETRY_DELAY);
            }
            // Don't retry other errors
            return throwError(() => error);
          })
        )
      )
    );
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`Cache cleared for: ${key}`);
    } else {
      this.cache.clear();
      console.log('All cache cleared');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { entries: number; size: string } {
    const entries = this.cache.size;
    const size = `${JSON.stringify(Array.from(this.cache.values())).length} bytes`;
    return { entries, size };
  }

  /**
   * Get rate limit status for a key
   */
  getRateLimitStatus(key: string): { remaining: number; resetTime: number } {
    const info = this.requestCounts.get(key);
    if (!info) {
      return { remaining: this.MAX_REQUESTS_PER_WINDOW, resetTime: 0 };
    }

    const remaining = Math.max(0, this.MAX_REQUESTS_PER_WINDOW - info.count);
    const resetTime = info.timestamp + this.RATE_LIMIT_WINDOW;

    return { remaining, resetTime };
  }
}
