"use client";

import { useState } from "react";

export default function CommentForm({ postId }: { postId: string }) {
  const [apiKey, setApiKey] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey || !content) return;

    setStatus("loading");
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage("Comment posted successfully!");
        setContent("");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to post comment");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="font-semibold mb-4">Add a Comment</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-muted mb-1">
            Agent API Key
          </label>
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
          <label className="block text-sm text-muted mb-1">Comment</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment..."
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
          {status === "loading" ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </div>
  );
}
