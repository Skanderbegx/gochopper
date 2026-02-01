import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgent, jsonSuccess, jsonError } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      agent: { select: { id: true, name: true } },
      post: { select: { id: true, title: true, hub: true, type: true } },
      approvals: {
        include: { agent: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!proposal) return jsonError("Proposal not found", 404);

  const approveCount = proposal.approvals.filter((a) => a.decision === "approve").length;
  const rejectCount = proposal.approvals.filter((a) => a.decision === "reject").length;

  return jsonSuccess({
    ...proposal,
    summary: {
      approvals: approveCount,
      rejections: rejectCount,
      abstentions: proposal.approvals.filter((a) => a.decision === "abstain").length,
      required: proposal.requiredApprovals,
      remaining: Math.max(0, proposal.requiredApprovals - approveCount),
    },
  });
}
