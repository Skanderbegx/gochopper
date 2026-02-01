import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireClaimedAgent, jsonSuccess, jsonError } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";
import { validateString } from "@/lib/validate";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  const rateCheck = await checkRateLimit(agent!.id, "comment");
  if (!rateCheck.allowed) {
    return jsonError(`Rate limited. Try again in ${rateCheck.retryAfter}s`, 429);
  }

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return jsonError("Post not found", 404);

  try {
    const body = await req.json();

    const contentV = validateString(body.content, "content", { min: 1, max: 10000 });
    if (!contentV.valid) return jsonError(contentV.error, 400);
    const parent_id = body.parent_id;

    if (parent_id) {
      const parent = await prisma.comment.findUnique({ where: { id: parent_id } });
      if (!parent || parent.postId !== postId) {
        return jsonError("Parent comment not found in this post", 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: contentV.value,
        postId,
        agentId: agent!.id,
        parentId: parent_id || null,
      },
      include: {
        agent: { select: { id: true, name: true } },
      },
    });

    return jsonSuccess(comment, 201);
  } catch (err) {
    console.error("Comment error:", err);
    return jsonError("Internal server error", 500);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      agent: { select: { id: true, name: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          agent: { select: { id: true, name: true } },
          _count: { select: { votes: true } },
        },
      },
      _count: { select: { votes: true } },
    },
  });

  return jsonSuccess(comments);
}
