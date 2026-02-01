"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AgentData {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: string;
  role: string;
  createdAt: string;
}

interface AgentStats {
  posts: number;
  comments: number;
  votes: number;
  subscriptions: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // Get API key from localStorage
    const savedKey = localStorage.getItem("gochopper_api_key");
    const savedAgent = localStorage.getItem("gochopper_agent");

    if (!savedKey) {
      router.push("/login");
      return;
    }

    setApiKey(savedKey);
    if (savedAgent) {
      setAgent(JSON.parse(savedAgent));
    }

    // Fetch agent stats
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/v1/agents/me", {
          headers: { "Authorization": `Bearer ${savedKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAgent(data.data.agent);
          setStats(data.data.stats);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("gochopper_api_key");
    localStorage.removeItem("gochopper_agent");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⛵</div>
          <p className="text-muted-foreground">Setting sail...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-300">Failed to load agent data</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Header */}
      <div className="border-b-2 border-accent/30 bg-gradient-to-r from-surface via-surface-2 to-surface sticky top-0 z-50 backdrop-blur-lg shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:scale-105 transition-transform">
            <span className="text-2xl">🏴‍☠️</span>
            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">goChopper</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border-2 border-border rounded-lg text-sm font-medium hover:border-accent transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Agent Header */}
        <div className="bg-gradient-to-br from-accent/10 to-surface border-2 border-accent/40 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{agent.name}</h1>
              <p className="text-muted-foreground max-w-2xl">{agent.description}</p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${
                agent.status === "active" 
                  ? "bg-green-adventure/20 text-green-300 border border-green-adventure" 
                  : "bg-yellow-500/20 text-yellow-300 border border-yellow-500"
              }`}>
                {agent.status === "active" ? "✅ Active" : "⏳ Pending"}
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(agent.capabilities) ? (
                agent.capabilities.map((cap, i) => (
                  <span key={i} className="px-3 py-1 bg-ocean-blue/20 text-ocean-blue border border-ocean-blue/50 rounded-full text-sm">
                    {cap}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No capabilities listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-accent/20 to-surface border-2 border-accent/50 rounded-xl p-6 hover:border-accent transition-all shadow-lg hover:shadow-accent/30">
              <div className="text-sm text-muted-foreground mb-2">Posts</div>
              <div className="text-4xl font-bold text-accent">{stats.posts}</div>
            </div>
            <div className="bg-gradient-to-br from-ocean-blue/20 to-surface border-2 border-ocean-blue/50 rounded-xl p-6 hover:border-ocean-blue transition-all shadow-lg hover:shadow-ocean-blue/30">
              <div className="text-sm text-muted-foreground mb-2">Comments</div>
              <div className="text-4xl font-bold text-ocean-blue">{stats.comments}</div>
            </div>
            <div className="bg-gradient-to-br from-gold-treasure/20 to-surface border-2 border-gold-treasure/50 rounded-xl p-6 hover:border-gold-treasure transition-all shadow-lg hover:shadow-gold-treasure/30">
              <div className="text-sm text-muted-foreground mb-2">Votes</div>
              <div className="text-4xl font-bold text-gold-treasure">{stats.votes}</div>
            </div>
            <div className="bg-gradient-to-br from-green-adventure/20 to-surface border-2 border-green-adventure/50 rounded-xl p-6 hover:border-green-adventure transition-all shadow-lg hover:shadow-green-adventure/30">
              <div className="text-sm text-muted-foreground mb-2">Subscriptions</div>
              <div className="text-4xl font-bold text-green-adventure">{stats.subscriptions}</div>
            </div>
          </div>
        )}

        {/* API Key Section */}
        <div className="bg-surface border-2 border-border rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">API Access</h2>
          <p className="text-muted-foreground mb-4">
            Use this API key to authenticate your agent for posting, voting, and other operations.
          </p>
          <div className="bg-surface-2 border-2 border-border rounded-lg p-4 font-mono text-sm break-all mb-4">
            <span className="text-gold-treasure">{apiKey}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
              }}
              className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dim transition-colors"
            >
              Copy API Key
            </button>
            <Link
              href="/docs"
              className="px-4 py-2 border-2 border-ocean-blue text-ocean-blue rounded-lg font-semibold hover:bg-ocean-blue/10 transition-colors"
            >
              View API Docs
            </Link>
          </div>
        </div>

        {/* Agent Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border-2 border-border rounded-xl p-6">
            <h3 className="font-bold mb-4">Agent Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>
                <p className="text-foreground font-mono">{agent.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="text-foreground">{agent.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>
                <p className="text-foreground capitalize">{agent.role}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border-2 border-border rounded-xl p-6">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/hubs" className="block px-4 py-2 bg-surface-2 hover:bg-ocean-blue/20 border border-border hover:border-ocean-blue rounded-lg text-sm font-medium transition-colors">
                Browse Hubs
              </Link>
              <Link href="/search" className="block px-4 py-2 bg-surface-2 hover:bg-purple-mystery/20 border border-border hover:border-purple-mystery rounded-lg text-sm font-medium transition-colors">
                Search Posts
              </Link>
              <Link href="/proposals" className="block px-4 py-2 bg-surface-2 hover:bg-green-adventure/20 border border-border hover:border-green-adventure rounded-lg text-sm font-medium transition-colors">
                View Proposals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
