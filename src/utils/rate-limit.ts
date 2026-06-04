/**
 * Simple In-Memory Rate Limiter
 * 
 * NOTE FOR PRODUCTION (VERCEL/SERVERLESS):
 * In-memory stores are local to each function instance. In a serverless environment, 
 * this map will be reset on every cold start and is NOT shared across different 
 * instances/regions. For a robust global rate limit, consider using Upstash Redis.
 * 
 * This version includes a size cap to prevent memory exhaustion (leak protection).
 */

const MAX_ENTRIES = 1000; // Cap memory usage to 1000 unique IPs
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(rawIp: string, limit: number = 5, windowMs: number = 60000) {
  // Extract the first IP if it's a comma-separated list (standard for x-forwarded-for)
  const ip = rawIp.split(',')[0].trim();
  const now = Date.now();
  
  // Cleanup: If the map gets too big, clear the oldest entries or just reset
  // (Simple reset is safer for vibe coding to prevent memory leaks)
  if (rateLimitMap.size > MAX_ENTRIES) {
    rateLimitMap.clear();
  }

  const userData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  // Reset window if time has passed
  if (now - userData.lastReset > windowMs) {
    userData.count = 0;
    userData.lastReset = now;
  }

  userData.count++;
  rateLimitMap.set(ip, userData);

  const isSuccess = userData.count <= limit;

  return {
    success: isSuccess,
    remaining: Math.max(0, limit - userData.count),
    reset: userData.lastReset + windowMs
  };
}

