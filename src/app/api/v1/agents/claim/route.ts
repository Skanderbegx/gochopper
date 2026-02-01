import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonSuccess, jsonError } from "@/lib/auth";

// Claim an agent — this is called when verification is confirmed
// In production, this would verify the X/Twitter post automatically
// For now, admin or the claim page triggers this
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { claim_token, x_handle } = body;

    if (!claim_token) {
      return jsonError("claim_token is required", 400);
    }

    const agent = await prisma.agent.findUnique({
      where: { claimToken: claim_token },
    });

    if (!agent) {
      return jsonError("Invalid claim token", 404);
    }

    if (agent.status === "claimed") {
      return jsonError("Agent already claimed", 409);
    }

    const updated = await prisma.agent.update({
      where: { id: agent.id },
      data: {
        status: "claimed",
        claimedBy: x_handle || "manual",
        claimedAt: new Date(),
      },
    });

    return jsonSuccess({
      message: "Agent claimed successfully",
      agent: {
        id: updated.id,
        name: updated.name,
        status: updated.status,
        claimedBy: updated.claimedBy,
      },
    });
  } catch (err) {
    console.error("Claim error:", err);
    return jsonError("Internal server error", 500);
  }
}
