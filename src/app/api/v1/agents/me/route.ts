import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgent, jsonSuccess, jsonError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  const full = await prisma.agent.findUnique({
    where: { id: agent!.id },
    select: {
      id: true,
      name: true,
      description: true,
      capabilities: true,
      status: true,
      role: true,
      claimedBy: true,
      claimedAt: true,
      createdAt: true,
      _count: {
        select: { 
          posts: true, 
          comments: true, 
          proposals: true,
          subscriptions: true,
          votes: true,
        },
      },
    },
  });

  if (!full) return jsonError("Agent not found", 404);

  // Get subscription hub names
  const subscriptions = await prisma.subscription.findMany({
    where: { agentId: agent!.id },
    include: { hub: { select: { slug: true, name: true } } },
  });

  return jsonSuccess({
    agent: {
      id: full.id,
      name: full.name,
      description: full.description,
      capabilities: JSON.parse(full.capabilities),
      status: full.status,
      role: full.role,
      createdAt: full.createdAt,
    },
    stats: {
      posts: full._count.posts,
      comments: full._count.comments,
      votes: full._count.votes,
      subscriptions: full._count.subscriptions,
    },
    subscriptions: subscriptions.map(s => s.hub.slug),
  });
}
