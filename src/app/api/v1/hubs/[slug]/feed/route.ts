import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgent, jsonSuccess, jsonError } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  const { slug } = await params;
  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") || "new";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "25"), 100);
  const cursor = url.searchParams.get("cursor");
  const type = url.searchParams.get("type");

  const hub = await prisma.hub.findUnique({ where: { slug } });
  if (!hub) return jsonError("Hub not found", 404);

  const where: Record<string, unknown> = { hub: slug };
  if (type) where.type = type;

  const orderBy =
    sort === "hot"
      ? [{ score: "desc" as const }, { createdAt: "desc" as const }]
      : sort === "top"
        ? [{ score: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  const posts = await prisma.post.findMany({
    where,
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

  return jsonSuccess({ hub: slug, posts: results, nextCursor, hasMore });
}
