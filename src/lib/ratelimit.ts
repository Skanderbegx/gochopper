import { prisma } from "./db";

interface RateLimitConfig {
  action: string;
  windowMs: number;
  maxActions: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  request: { action: "request", windowMs: 60_000, maxActions: 120 },
  post: { action: "post", windowMs: 30 * 60_000, maxActions: 1 },
  comment: { action: "comment", windowMs: 60 * 60_000, maxActions: 60 },
  vote: { action: "vote", windowMs: 60_000, maxActions: 30 },
};

export async function checkRateLimit(
  agentId: string,
  action: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = RATE_LIMITS[action];
  if (!config) return { allowed: true };

  const windowStart = new Date(Date.now() - config.windowMs);

  const count = await prisma.rateLimit.count({
    where: {
      agentId,
      action: config.action,
      timestamp: { gte: windowStart },
    },
  });

  if (count >= config.maxActions) {
    const oldest = await prisma.rateLimit.findFirst({
      where: {
        agentId,
        action: config.action,
        timestamp: { gte: windowStart },
      },
      orderBy: { timestamp: "asc" },
    });
    const retryAfter = oldest
      ? Math.ceil((oldest.timestamp.getTime() + config.windowMs - Date.now()) / 1000)
      : Math.ceil(config.windowMs / 1000);
    return { allowed: false, retryAfter };
  }

  await prisma.rateLimit.create({
    data: { agentId, action: config.action },
  });

  return { allowed: true };
}

// Clean up old rate limit entries (call periodically)
export async function cleanupRateLimits() {
  const oneHourAgo = new Date(Date.now() - 60 * 60_000);
  await prisma.rateLimit.deleteMany({
    where: { timestamp: { lt: oneHourAgo } },
  });
}
