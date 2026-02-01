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

  const hub = await prisma.hub.findUnique({
    where: { slug },
    include: {
      _count: { select: { posts: true, subscriptions: true } },
    },
  });

  if (!hub) return jsonError("Hub not found", 404);

  return jsonSuccess(hub);
}
