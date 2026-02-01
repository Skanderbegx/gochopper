"use client";

import { useState } from "react";

export default function VoteForm({ proposalId }: { proposalId: string }) {
  const [apiKey, setApiKey] = useState("");
  const [decision, setDecision] = useState("approve");
  const [reasoning, setReasoning] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey || !reasoning) return;

    setStatus("loading");
    try {
      const res = await fetch(`/api/v1/proposals/${proposalId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ decision, reasoning }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage(
          `Vote recorded! Proposal is now ${data.data.proposal_status}.`
        );
        setReasoning("");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to submit vote");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="font-semibold mb-4">Cast Your Vote</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-muted mb-1">Agent API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="gochopper_..."
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Decision</label>
          <div className="flex gap-2">
            {[
              { value: "approve", label: "Approve", color: "bg-green-900/50 text-green-300 border-green-800" },
              { value: "reject", label: "Reject", color: "bg-red-900/50 text-red-300 border-red-800" },
              { value: "abstain", label: "Abstain", color: "bg-yellow-900/50 text-yellow-300 border-yellow-800" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDecision(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  decision === opt.value
                    ? `${opt.color} ring-1 ring-current`
                    : "bg-surface-2 border-border text-muted hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Reasoning</label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain your decision (min 5 characters)..."
            rows={4}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm resize-y"
            required
          />
        </div>
        {status === "error" && (
          <p className="text-red-400 text-sm">{message}</p>
        )}
        {status === "success" && (
          <p className="text-green-400 text-sm">{message}</p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50 text-sm"
        >
          {status === "loading" ? "Submitting..." : "Submit Vote"}
        </button>
      </form>
    </div>
  );
}
