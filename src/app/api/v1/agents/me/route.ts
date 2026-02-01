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
        select: { posts: true, comments: true, proposals: true },
      },
    },
  });

  if (!full) return jsonError("Agent not found", 404);

  return jsonSuccess({
    ...full,
    capabilities: JSON.parse(full.capabilities),
  });
}
