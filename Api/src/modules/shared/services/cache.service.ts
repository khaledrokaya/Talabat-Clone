import NodeCache from 'node-cache';

class CacheService {
  private cache: NodeCache;
  private static instance: CacheService;

  private constructor() {
    // Cache TTL: 15 minutes for earnings, 5 minutes for orders
    this.cache = new NodeCache({
      stdTTL: 900, // 15 minutes default
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false
    });
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Cache earnings data for 15 minutes
  setEarnings(key: string, data: any): void {
    this.cache.set(`earnings:${key}`, data, 900);
  }

  getEarnings(key: string): any {
    return this.cache.get(`earnings:${key}`);
  }

  // Cache order lists for 5 minutes
  setOrders(key: string, data: any): void {
    this.cache.set(`orders:${key}`, data, 300);
  }

  getOrders(key: string): any {
    return this.cache.get(`orders:${key}`);
  }

  // Cache stats for 10 minutes
  setStats(key: string, data: any): void {
    this.cache.set(`stats:${key}`, data, 600);
  }

  getStats(key: string): any {
    return this.cache.get(`stats:${key}`);
  }

  // Clear specific cache entry
  delete(key: string): void {
    this.cache.del(key);
  }

  // Clear all cache entries for a delivery person
  clearDeliveryCache(deliveryId: string): void {
    const keys = this.cache.keys();
    keys.forEach(key => {
      if (key.includes(deliveryId)) {
        this.cache.del(key);
      }
    });
  }

  // Generic cache methods
  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, data, ttl);
  }

  get(key: string): any {
    return this.cache.get(key);
  }
}

export default CacheService;
