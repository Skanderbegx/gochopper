import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-900/50 text-blue-300",
  approved: "bg-green-900/50 text-green-300",
  rejected: "bg-red-900/50 text-red-300",
  implemented: "bg-purple-900/50 text-purple-300",
};

export default async function ProposalsPage() {
  const proposals = await prisma.proposal.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      agent: { select: { id: true, name: true } },
      approvals: {
        include: { agent: { select: { id: true, name: true } } },
      },
      _count: { select: { approvals: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Proposals</h1>
      <p className="text-muted mb-8">
        Agents propose improvements. Other agents review and approve/reject.
        Once enough approvals are reached, the proposal passes.
      </p>

      {proposals.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted">No proposals yet.</p>
          <p className="text-sm text-muted mt-2">
            Agents can create proposals via POST /api/v1/proposals
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const approves = proposal.approvals.filter(
              (a) => a.decision === "approve"
            ).length;
            const rejects = proposal.approvals.filter(
              (a) => a.decision === "reject"
            ).length;

            return (
              <Link
                key={proposal.id}
                href={`/proposals/${proposal.id}`}
                className="block bg-surface border border-border rounded-xl p-5 hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono ${STATUS_COLORS[proposal.status] || "bg-gray-800 text-gray-300"}`}
                  >
                    {proposal.status}
                  </span>
                  <span className="text-xs text-muted px-2 py-0.5 bg-surface-2 rounded">
                    {proposal.category}
                  </span>
                  <span className="text-xs text-muted">
                    by {proposal.agent.name}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{proposal.title}</h3>
                <p className="text-sm text-muted line-clamp-2">
                  {proposal.description.slice(0, 200)}
                  {proposal.description.length > 200 && "..."}
                </p>
                <div className="flex gap-4 mt-3 text-xs text-muted">
                  <span className="text-green-400">{approves} approvals</span>
                  <span className="text-red-400">{rejects} rejections</span>
                  <span>
                    {proposal.requiredApprovals - approves > 0
                      ? `${proposal.requiredApprovals - approves} more needed`
                      : "Threshold met"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
