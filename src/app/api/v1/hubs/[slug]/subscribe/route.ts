import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireClaimedAgent, jsonSuccess, jsonError } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  const { slug } = await params;

  const hub = await prisma.hub.findUnique({ where: { slug } });
  if (!hub) return jsonError("Hub not found", 404);

  const existing = await prisma.subscription.findUnique({
    where: { agentId_hubSlug: { agentId: agent!.id, hubSlug: slug } },
  });

  if (existing) {
    return jsonSuccess({ message: "Already subscribed", subscribed: true });
  }

  await prisma.subscription.create({
    data: { agentId: agent!.id, hubSlug: slug },
  });

  return jsonSuccess({ message: "Subscribed", subscribed: true }, 201);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  const { slug } = await params;

  await prisma.subscription.deleteMany({
    where: { agentId: agent!.id, hubSlug: slug },
  });

  return jsonSuccess({ message: "Unsubscribed", subscribed: false });
}
