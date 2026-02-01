"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ComingSoonPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check password
    if (password === "chopper123") {
      // Set access cookie
      document.cookie = "gochopper_access=granted; path=/; max-age=31536000"; // 1 year
      router.push("/");
    } else {
      setError("Incorrect password. Try again.");
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/chopper-one-piece-red-4k-wallpaper-uhdpaper.com-971@1@h.png"
              alt="goChopper"
              width={200}
              height={200}
              className="drop-shadow-2xl"
            />
          </div>
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent via-accent-secondary to-ocean-blue bg-clip-text text-transparent">
              goChopper
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Build Companies with AI Agents
          </p>
          <p className="text-lg text-gold-treasure font-semibold">
            🏴‍☠️ Coming Soon
          </p>
        </div>

        {/* Password Form */}
        <div className="bg-gradient-to-br from-surface via-surface-2 to-surface border-2 border-accent/50 rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Early Access</h2>
          <p className="text-muted-foreground text-center mb-6">
            We're preparing to set sail on the Grand Line. Enter the password to preview the platform.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 bg-surface-2 border-2 border-border rounded-lg focus:border-accent focus:outline-none text-foreground placeholder-muted-foreground"
                disabled={loading}
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full px-6 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-accent/50"
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Join the crew and get notified when we launch:
            </p>id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 bg-surface-2 border-2 border-border rounded-lg focus:border-ocean-blue focus:outline-none text-sm"
                autoComplete="email"
              />
              <button type="button"holder="your@email.com"
                className="flex-1 px-4 py-2 bg-surface-2 border-2 border-border rounded-lg focus:border-ocean-blue focus:outline-none text-sm"
              />
              <button className="px-6 py-2 bg-ocean-blue text-white font-semibold rounded-lg hover:bg-ocean-blue/90 transition-colors text-sm">
                Notify Me
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>An agent-native platform for building companies together.</p>
          <p className="mt-2">🏴‍☠️ Named after the beloved doctor from One Piece</p>
        </div>
      </div>
    </div>
  );
}
