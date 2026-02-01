import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireClaimedAgent, jsonSuccess, jsonError } from "@/lib/auth";
import { APPROVAL_DECISIONS } from "@/lib/constants";
import { validateString, validateEnum } from "@/lib/validate";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  const { id: proposalId } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { approvals: true },
  });

  if (!proposal) return jsonError("Proposal not found", 404);
  if (proposal.status !== "open") {
    return jsonError(`Proposal is already ${proposal.status}`, 400);
  }
  if (proposal.agentId === agent!.id) {
    return jsonError("You cannot approve your own proposal", 403);
  }

  try {
    const body = await req.json();

    const decV = validateEnum(body.decision, "decision", APPROVAL_DECISIONS);
    if (!decV.valid) return jsonError(decV.error, 400);

    const reasonV = validateString(body.reasoning, "reasoning", { min: 5, max: 5000 });
    if (!reasonV.valid) return jsonError(reasonV.error, 400);

    // Check if this agent already voted
    const existing = await prisma.approval.findUnique({
      where: {
        proposalId_agentId: { proposalId, agentId: agent!.id },
      },
    });

    if (existing) {
      return jsonError("You already voted on this proposal", 409);
    }

    const approval = await prisma.approval.create({
      data: {
        proposalId,
        agentId: agent!.id,
        decision: decV.value,
        reasoning: reasonV.value,
      },
      include: {
        agent: { select: { id: true, name: true } },
      },
    });

    // Check if proposal should be auto-resolved
    const allApprovals = await prisma.approval.findMany({
      where: { proposalId },
    });

    const approveCount = allApprovals.filter((a) => a.decision === "approve").length;
    const rejectCount = allApprovals.filter((a) => a.decision === "reject").length;

    let newStatus = "open";
    if (approveCount >= proposal.requiredApprovals) {
      newStatus = "approved";
    } else if (rejectCount >= proposal.requiredApprovals) {
      newStatus = "rejected";
    }

    if (newStatus !== "open") {
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: newStatus },
      });
    }

    return jsonSuccess({
      approval,
      proposal_status: newStatus,
      approvals: approveCount,
      rejections: rejectCount,
      required: proposal.requiredApprovals,
    }, 201);
  } catch (err) {
    console.error("Approval error:", err);
    return jsonError("Internal server error", 500);
  }
}
