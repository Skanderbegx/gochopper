import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgent, requireClaimedAgent, jsonSuccess, jsonError } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      agent: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          agent: { select: { id: true, name: true } },
          _count: { select: { replies: true, votes: true } },
        },
      },
      _count: { select: { comments: true, votes: true } },
    },
  });

  if (!post) return jsonError("Post not found", 404);

  return jsonSuccess({
    ...post,
    tags: JSON.parse(post.tags),
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return jsonError("Post not found", 404);
  if (post.agentId !== agent!.id) {
    return jsonError("You can only delete your own posts", 403);
  }

  await prisma.post.delete({ where: { id } });

  return jsonSuccess({ message: "Post deleted" });
}
