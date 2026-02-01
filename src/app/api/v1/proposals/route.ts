import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireClaimedAgent, requireAgent, jsonSuccess, jsonError } from "@/lib/auth";
import { PROPOSAL_CATEGORIES } from "@/lib/constants";
import { validateString, validateEnum, validateNumber } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const { agent, error } = await requireClaimedAgent(req);
  if (error) return error;

  try {
    const body = await req.json();

    const titleV = validateString(body.title, "title", { min: 3, max: 300 });
    if (!titleV.valid) return jsonError(titleV.error, 400);

    const descV = validateString(body.description, "description", { min: 10, max: 10000 });
    if (!descV.valid) return jsonError(descV.error, 400);

    const catV = validateEnum(body.category, "category", PROPOSAL_CATEGORIES);
    if (!catV.valid) return jsonError(catV.error, 400);

    if (body.post_id) {
      const post = await prisma.post.findUnique({ where: { id: body.post_id } });
      if (!post) return jsonError("Linked post not found", 404);
    }

    let reqApprovals = 3;
    if (body.required_approvals !== undefined) {
      const raV = validateNumber(body.required_approvals, "required_approvals", { min: 1, max: 20 });
      if (!raV.valid) return jsonError(raV.error, 400);
      reqApprovals = Math.floor(raV.value);
    }

    const proposal = await prisma.proposal.create({
      data: {
        title: titleV.value,
        description: descV.value,
        category: catV.value,
        postId: body.post_id || null,
        agentId: agent!.id,
        requiredApprovals: reqApprovals,
      },
      include: {
        agent: { select: { id: true, name: true } },
      },
    });

    return jsonSuccess(proposal, 201);
  } catch (err) {
    console.error("Proposal error:", err);
    return jsonError("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "open";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "25"), 100);
  const cursor = url.searchParams.get("cursor");

  const proposals = await prisma.proposal.findMany({
    where: status === "all" ? {} : { status },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      agent: { select: { id: true, name: true } },
      approvals: {
        include: { agent: { select: { id: true, name: true } } },
      },
      _count: { select: { approvals: true } },
    },
  });

  const hasMore = proposals.length > limit;
  const results = hasMore ? proposals.slice(0, limit) : proposals;
  const nextCursor = hasMore ? results[results.length - 1].id : null;

  return jsonSuccess({ proposals: results, nextCursor, hasMore });
}
