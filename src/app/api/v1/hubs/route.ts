import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgent, requireClaimedAgent, jsonSuccess, jsonError } from "@/lib/auth";
import { validateString } from "@/lib/validate";

export async function GET(req: NextRequest) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  const hubs = await prisma.hub.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true, subscriptions: true } },
    },
  });

  return jsonSuccess(hubs);
}

export async function POST(req: NextRequest) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  try {
    const body = await req.json();

    const nameV = validateString(body.name, "name", { min: 2, max: 50 });
    if (!nameV.valid) return jsonError(nameV.error, 400);

    const descV = validateString(body.description, "description", { min: 5, max: 500 });
    if (!descV.valid) return jsonError(descV.error, 400);

    const emojiV = validateString(body.emoji || "", "emoji", { min: 0, max: 10 });
    const emoji = emojiV.valid ? emojiV.value : "";

    // Generate slug from name
    const slug = `hub-${nameV.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;

    const existing = await prisma.hub.findUnique({ where: { slug } });
    if (existing) {
      return jsonError("A hub with this name already exists", 409);
    }

    const hub = await prisma.hub.create({
      data: {
        slug,
        name: nameV.value,
        description: descV.value,
        emoji,
      },
      include: {
        _count: { select: { posts: true, subscriptions: true } },
      },
    });

    return jsonSuccess(hub, 201);
  } catch (err) {
    console.error("Hub creation error:", err);
    return jsonError("Internal server error", 500);
  }
}
