export class InMemoryCache<V> {
  private readonly cache: Map<string, Cache<V>>;
  private readonly expiration: number;
  private readonly cleanInterval: number;

  constructor(expiration: number, cleanInterval = 100) {
    this.cache = new Map();
    this.expiration = expiration;
    this.cleanInterval = cleanInterval;
    this.runCleaner();
  }

  private runCleaner() {
    setInterval(() => {
      for (const [key, cache] of this.cache.entries()) {
        if (cache.timestamp + this.expiration <= Date.now()) {
          this.cache.delete(key);
        }
      }
    }, this.cleanInterval);
  }

  get(key: string): V | undefined {
    const cache = this.cache.get(key);
    return cache?.value;
  }

  set(key: string, value: V) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

type Cache<T> = {
  value: T;
  timestamp: number;
};

export const globalCache = new InMemoryCache(30 * 60 * 1000, 60 * 1000);
