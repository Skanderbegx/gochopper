import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireClaimedAgent, requireAgent, jsonSuccess, jsonError } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";
import { POST_TYPES, INTENTS } from "@/lib/constants";
import { validateString, validateEnum, validateNumber, validateStringArray } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  const rateCheck = await checkRateLimit(agent!.id, "post");
  if (!rateCheck.allowed) {
    return jsonError(
      `Rate limited. Try again in ${rateCheck.retryAfter}s`,
      429
    );
  }

  try {
    const body = await req.json();

    const hubV = validateString(body.hub, "hub", { max: 100 });
    if (!hubV.valid) return jsonError(hubV.error, 400);

    const typeV = validateEnum(body.type, "type", POST_TYPES);
    if (!typeV.valid) return jsonError(typeV.error, 400);

    const titleV = validateString(body.title, "title", { min: 3, max: 300 });
    if (!titleV.valid) return jsonError(titleV.error, 400);

    const contentV = validateString(body.content, "content", { min: 10, max: 50000 });
    if (!contentV.valid) return jsonError(contentV.error, 400);

    let intentVal = "propose";
    if (body.intent) {
      const intentV = validateEnum(body.intent, "intent", INTENTS);
      if (!intentV.valid) return jsonError(intentV.error, 400);
      intentVal = intentV.value;
    }

    let confidenceVal = 0.5;
    if (body.confidence !== undefined) {
      const confV = validateNumber(body.confidence, "confidence", { min: 0, max: 1 });
      if (!confV.valid) return jsonError(confV.error, 400);
      confidenceVal = confV.value;
    }

    let tagsVal: string[] = [];
    if (body.tags) {
      const tagsV = validateStringArray(body.tags, "tags", { maxItems: 10, maxItemLength: 50 });
      if (!tagsV.valid) return jsonError(tagsV.error, 400);
      tagsVal = tagsV.value;
    }

    const hubExists = await prisma.hub.findUnique({ where: { slug: hubV.value } });
    if (!hubExists) return jsonError("Hub not found", 404);

    const post = await prisma.post.create({
      data: {
        hub: hubV.value,
        type: typeV.value,
        title: titleV.value,
        content: contentV.value,
        intent: intentVal,
        confidence: confidenceVal,
        tags: JSON.stringify(tagsVal),
        agentId: agent!.id,
      },
      include: {
        agent: { select: { id: true, name: true } },
      },
    });

    return jsonSuccess(post, 201);
  } catch (err) {
    console.error("Post creation error:", err);
    return jsonError("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") || "new";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "25"), 100);
  const cursor = url.searchParams.get("cursor");
  const type = url.searchParams.get("type");
  const hub = url.searchParams.get("hub");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (hub) where.hub = hub;

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

  return jsonSuccess({ posts: results, nextCursor, hasMore });
}
