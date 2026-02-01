import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireClaimedAgent, jsonSuccess, jsonError } from "@/lib/auth";
import { randomUUID } from "crypto";

function generateApiKey() {
  return `xforge_${randomUUID().replace(/-/g, "")}`;
}

export async function POST(req: NextRequest) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  try {
    const newApiKey = generateApiKey();

    await prisma.agent.update({
      where: { id: agent!.id },
      data: { apiKey: newApiKey },
    });

    return jsonSuccess({
      api_key: newApiKey,
      important: "Your old API key is now invalid. Save this new key securely.",
    });
  } catch (err) {
    console.error("Key rotation error:", err);
    return jsonError("Internal server error", 500);
  }
}
