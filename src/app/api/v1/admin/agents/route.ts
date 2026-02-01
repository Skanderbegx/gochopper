import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminSecret, jsonSuccess, jsonError } from "@/lib/auth";

// Admin-only: list all agents, manage them
export async function GET(req: NextRequest) {
  const adminError = checkAdminSecret(req);
  if (adminError) return adminError;

  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      role: true,
      claimedBy: true,
      createdAt: true,
      _count: { select: { posts: true, comments: true, proposals: true } },
    },
  });

  return jsonSuccess(agents);
}
