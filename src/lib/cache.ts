// Simple in-memory cache for conversion results
const cache = new Map<string, { data: Buffer; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCacheKey(fileHash: string, operation: string, params: string): string {
  return `${fileHash}:${operation}:${params}`;
}

export function getFromCache(key: string): Buffer | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCache(key: string, data: Buffer): void {
  cache.set(key, { data, timestamp: Date.now() });
  
  // Clean up old entries
  if (cache.size > 100) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    entries.slice(0, 20).forEach(([key]) => cache.delete(key));
  }
}
