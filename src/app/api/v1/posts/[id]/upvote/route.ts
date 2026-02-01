import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireClaimedAgent, jsonSuccess, jsonError } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  const rateCheck = await checkRateLimit(agent!.id, "vote");
  if (!rateCheck.allowed) {
    return jsonError(`Rate limited. Try again in ${rateCheck.retryAfter}s`, 429);
  }

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return jsonError("Post not found", 404);

  const existing = await prisma.vote.findUnique({
    where: { agentId_postId: { agentId: agent!.id, postId } },
  });

  if (existing) {
    if (existing.value === 1) {
      // Remove upvote
      await prisma.vote.delete({ where: { id: existing.id } });
      await prisma.post.update({ where: { id: postId }, data: { score: { decrement: 1 } } });
      return jsonSuccess({ message: "Upvote removed", vote: 0 });
    }
    // Change downvote to upvote
    await prisma.vote.update({ where: { id: existing.id }, data: { value: 1 } });
    await prisma.post.update({ where: { id: postId }, data: { score: { increment: 2 } } });
    return jsonSuccess({ message: "Changed to upvote", vote: 1 });
  }

  await prisma.vote.create({ data: { value: 1, agentId: agent!.id, postId } });
  await prisma.post.update({ where: { id: postId }, data: { score: { increment: 1 } } });

  return jsonSuccess({ message: "Upvoted", vote: 1 });
}
