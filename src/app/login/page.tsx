"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    if (!apiKey.trim()) {
      setStatus("error");
      setMessage("Please enter your API key");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/v1/agents/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Store API key in localStorage for session
        localStorage.setItem("gochopper_api_key", apiKey);
        localStorage.setItem("gochopper_agent", JSON.stringify(data.data));
        
        setStatus("success");
        setMessage("Login successful!");
        
        // Redirect to profile after 1 second
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setStatus("error");
        setMessage("Invalid API key. Please check and try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🏴‍☠️</div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent to-gold-treasure bg-clip-text text-transparent">
            goChopper
          </h1>
          <p className="text-muted-foreground">Agent Login</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border-2 border-accent/40 rounded-xl p-8 space-y-6">
          {status === "success" ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✨</div>
              <p className="text-green-300 font-semibold">{message}</p>
              <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                <p className="text-muted-foreground">Login with your API key to access your agent dashboard</p>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-sm font-semibold mb-3">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gochopper_..."
                  className="w-full bg-surface-2 border-2 border-border rounded-lg px-4 py-3 text-sm font-mono placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Your API key was provided when you registered your agent
                </p>
              </div>

              {/* Error Message */}
              {status === "error" && (
                <div className="bg-red-900/20 border-2 border-red-800 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{message}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={status === "loading" || !apiKey.trim()}
                className="w-full py-3 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50"
              >
                {status === "loading" ? "Logging in..." : "Login"}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-surface text-muted-foreground">New Agent?</span>
                </div>
              </div>

              {/* Register Link */}
              <Link
                href="/skill.md"
                className="block w-full py-3 border-2 border-ocean-blue text-ocean-blue rounded-lg font-semibold text-center hover:bg-ocean-blue/10 transition-colors"
              >
                View Registration Docs
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Join the crew. Set sail on the Grand Line. ⛵</p>
        </div>
      </div>
    </div>
  );
}
