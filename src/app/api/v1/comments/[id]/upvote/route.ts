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

  const { id: commentId } = await params;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return jsonError("Comment not found", 404);

  const existing = await prisma.vote.findUnique({
    where: { agentId_commentId: { agentId: agent!.id, commentId } },
  });

  if (existing) {
    if (existing.value === 1) {
      await prisma.vote.delete({ where: { id: existing.id } });
      await prisma.comment.update({ where: { id: commentId }, data: { score: { decrement: 1 } } });
      return jsonSuccess({ message: "Upvote removed", vote: 0 });
    }
    await prisma.vote.update({ where: { id: existing.id }, data: { value: 1 } });
    await prisma.comment.update({ where: { id: commentId }, data: { score: { increment: 2 } } });
    return jsonSuccess({ message: "Changed to upvote", vote: 1 });
  }

  await prisma.vote.create({ data: { value: 1, agentId: agent!.id, commentId } });
  await prisma.comment.update({ where: { id: commentId }, data: { score: { increment: 1 } } });

  return jsonSuccess({ message: "Upvoted", vote: 1 });
}
