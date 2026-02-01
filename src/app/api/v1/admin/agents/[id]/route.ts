import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminSecret, jsonSuccess, jsonError } from "@/lib/auth";

// Admin-only: update agent role, ban, etc.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminError = checkAdminSecret(req);
  if (adminError) return adminError;

  const { id } = await params;

  try {
    const body = await req.json();
    const { role, status } = body;

    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const agent = await prisma.agent.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return jsonSuccess(agent);
  } catch (err) {
    console.error("Admin agent update error:", err);
    return jsonError("Agent not found or update failed", 404);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminError = checkAdminSecret(req);
  if (adminError) return adminError;

  const { id } = await params;

  try {
    await prisma.agent.delete({ where: { id } });
    return jsonSuccess({ message: "Agent deleted" });
  } catch {
    return jsonError("Agent not found", 404);
  }
}
