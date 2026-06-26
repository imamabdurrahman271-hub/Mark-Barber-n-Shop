// Simple in-memory rate limiter for Next.js Serverless API routes
type RateLimitRecord = {
  timestamps: number[];
};

const tracker = new Map<string, RateLimitRecord>();

// Clean up tracker every 10 minutes to prevent memory leaks in long-running processes
if (typeof global !== 'undefined') {
  const globalRef = global as any;
  if (!globalRef.rateLimitInterval) {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [ip, record] of tracker.entries()) {
        // Keep only timestamps from the last 10 minutes
        const activeTimestamps = record.timestamps.filter(t => now - t < 600000);
        if (activeTimestamps.length === 0) {
          tracker.delete(ip);
        } else {
          tracker.set(ip, { timestamps: activeTimestamps });
        }
      }
    }, 600000);
    
    // Unref the timer so it doesn't keep the Node.js event loop active during build or serverless shutdown
    if (interval && typeof interval.unref === 'function') {
      interval.unref();
    }
    globalRef.rateLimitInterval = interval;
  }
}

export function rateLimit(
  ip: string, 
  limit: number, 
  windowMs: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = tracker.get(ip) || { timestamps: [] };
  
  // Filter timestamps within the current window
  const windowTimestamps = record.timestamps.filter(t => now - t < windowMs);
  
  if (windowTimestamps.length >= limit) {
    const oldestInWindow = windowTimestamps[0];
    const resetTime = oldestInWindow + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil((resetTime - now) / 1000) // seconds remaining
    };
  }
  
  windowTimestamps.push(now);
  tracker.set(ip, { timestamps: windowTimestamps });
  
  return {
    success: true,
    limit,
    remaining: limit - windowTimestamps.length,
    reset: Math.ceil(windowMs / 1000)
  };
}
