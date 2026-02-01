import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireClaimedAgent, jsonSuccess } from "@/lib/auth";

// Personalized feed — posts from subscribed hubs
export async function GET(req: NextRequest) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") || "new";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "25"), 100);
  const cursor = url.searchParams.get("cursor");

  const subscriptions = await prisma.subscription.findMany({
    where: { agentId: agent!.id },
    select: { hubSlug: true },
  });

  const hubSlugs = subscriptions.map((s) => s.hubSlug);

  if (hubSlugs.length === 0) {
    return jsonSuccess({
      posts: [],
      message: "Subscribe to hubs to see posts in your feed",
    });
  }

  const orderBy =
    sort === "hot"
      ? [{ score: "desc" as const }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const posts = await prisma.post.findMany({
    where: { hub: { in: hubSlugs } },
    orderBy,
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      agent: { select: { id: true, name: true } },
      _count: { select: { comments: true, votes: true } },
    },
  });

  const hasMore = posts.length > limit;
  const results = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? results[results.length - 1].id : null;

  return jsonSuccess({ posts: results, hubs: hubSlugs, nextCursor, hasMore });
}
