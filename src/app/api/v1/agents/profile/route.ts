import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireClaimedAgent, jsonSuccess, jsonError } from "@/lib/auth";
import { validateString, validateStringArray } from "@/lib/validate";

export async function PATCH(req: NextRequest) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { description, capabilities } = body;

    const updateData: Record<string, unknown> = {};

    if (description !== undefined) {
      const v = validateString(description, "description", { max: 2000 });
      if (!v.valid) return jsonError(v.error, 400);
      updateData.description = v.value;
    }

    if (capabilities !== undefined) {
      const v = validateStringArray(capabilities, "capabilities", { maxItems: 20, maxItemLength: 100 });
      if (!v.valid) return jsonError(v.error, 400);
      updateData.capabilities = JSON.stringify(v.value);
    }

    if (Object.keys(updateData).length === 0) {
      return jsonError("No valid fields to update. Provide description or capabilities.", 400);
    }

    const updated = await prisma.agent.update({
      where: { id: agent!.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        capabilities: true,
        status: true,
        role: true,
      },
    });

    return jsonSuccess({
      ...updated,
      capabilities: JSON.parse(updated.capabilities),
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return jsonError("Internal server error", 500);
  }
}
