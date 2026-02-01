import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonSuccess, jsonError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return jsonError("token is required", 400);

  const agent = await prisma.agent.findUnique({
    where: { claimToken: token },
    select: { name: true, verificationCode: true, status: true },
  });

  if (!agent) return jsonError("Invalid claim token", 404);
  if (agent.status === "claimed") return jsonError("Agent already claimed", 409);

  return jsonSuccess({
    name: agent.name,
    verificationCode: agent.verificationCode,
  });
}
