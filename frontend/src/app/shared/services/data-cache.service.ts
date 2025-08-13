import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

export interface CacheConfig {
  maxAge: number; // in milliseconds
  maxSize: number; // maximum number of entries
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
  accessCount: number;
  lastAccessed: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultConfig: CacheConfig = {
    maxAge: 300000, // 5 minutes
    maxSize: 100
  };

  private cleanupInterval$ = timer(0, 60000); // Clean up every minute

  constructor() {
    // Start automatic cleanup
    this.cleanupInterval$.subscribe(() => this.cleanup());
  }

  /**
   * Get data from cache or execute the request function
   */
  get<T>(
    key: string,
    requestFn: () => Observable<T>,
    config?: Partial<CacheConfig>
  ): Observable<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const cached = this.getFromCache<T>(key);

    if (cached && !this.isExpired(cached)) {
      // Update access statistics
      cached.accessCount++;
      cached.lastAccessed = Date.now();

      return new BehaviorSubject(cached.data).asObservable();
    }


    return requestFn().pipe(
      map((data: T) => {
        this.setCache(key, data, finalConfig.maxAge);
        return data;
      }),
      shareReplay(1) // Share the result among subscribers
    );
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, maxAge?: number): void {
    this.setCache(key, data, maxAge || this.defaultConfig.maxAge);
  }

  /**
   * Get data from cache without executing request
   */
  getOnly<T>(key: string): T | null {
    const cached = this.getFromCache<T>(key);
    if (cached && !this.isExpired(cached)) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      return cached.data;
    }
    return null;
  }

  /**
   * Check if data exists in cache and is not expired
   */
  has(key: string): boolean {
    const cached = this.getFromCache(key);
    return cached !== null && !this.isExpired(cached);
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: { key: string; size: number; accessCount: number; age: number }[];
    totalMemory: string;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: JSON.stringify(entry.data).length,
      accessCount: entry.accessCount,
      age: Date.now() - entry.timestamp
    }));

    const totalMemory = entries.reduce((total, entry) => total + entry.size, 0);

    return {
      size: this.cache.size,
      entries,
      totalMemory: `${(totalMemory / 1024).toFixed(2)} KB`
    };
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    let deleted = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Preload data into cache
   */
  preload<T>(key: string, requestFn: () => Observable<T>, maxAge?: number): Observable<T> {
    return this.get(key, requestFn, { maxAge: maxAge || this.defaultConfig.maxAge });
  }

  /**
   * Get cache entry with metadata
   */
  getWithMetadata<T>(key: string): { data: T; metadata: CacheEntry<T> } | null {
    const cached = this.getFromCache<T>(key);
    if (cached && !this.isExpired(cached)) {
      return { data: cached.data, metadata: cached };
    }
    return null;
  }

  private getFromCache<T>(key: string): CacheEntry<T> | null {
    return this.cache.get(key) || null;
  }

  private setCache<T>(key: string, data: T, maxAge: number): void {
    // Check cache size limit
    if (this.cache.size >= this.defaultConfig.maxSize) {
      this.evictLeastUsed();
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expires: now + maxAge,
      accessCount: 1,
      lastAccessed: now
    };

    this.cache.set(key, entry);
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expires;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
    }
  }

  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastUsedEntry: CacheEntry<any> | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!leastUsedEntry ||
        entry.accessCount < leastUsedEntry.accessCount ||
        (entry.accessCount === leastUsedEntry.accessCount && entry.lastAccessed < leastUsedEntry.lastAccessed)) {
        leastUsedKey = key;
        leastUsedEntry = entry;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }
}
