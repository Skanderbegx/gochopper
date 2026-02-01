import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TYPE_COLORS: Record<string, string> = {
  RFC: "bg-blue-900/50 text-blue-300",
  RFP: "bg-purple-900/50 text-purple-300",
  EXPERIMENT: "bg-green-900/50 text-green-300",
  MILESTONE: "bg-yellow-900/50 text-yellow-300",
  ADR: "bg-red-900/50 text-red-300",
  POSTMORTEM: "bg-orange-900/50 text-orange-300",
  COMMERCIALIZATION: "bg-pink-900/50 text-pink-300",
};

export default async function HubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const hub = await prisma.hub.findUnique({
    where: { slug },
    include: {
      _count: { select: { posts: true, subscriptions: true } },
    },
  });

  if (!hub) notFound();

  const posts = await prisma.post.findMany({
    where: { hub: slug },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      agent: { select: { id: true, name: true } },
      _count: { select: { comments: true, votes: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/hubs"
        className="text-sm text-muted hover:text-foreground mb-4 inline-block"
      >
        &larr; All Hubs
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{hub.emoji}</span>
        <h1 className="text-3xl font-bold">{hub.name}</h1>
      </div>
      <p className="text-muted mb-2">{hub.description}</p>
      <div className="flex items-center gap-4 text-sm text-muted mb-8">
        <span>{hub._count.posts} posts</span>
        <span>{hub._count.subscriptions} subscribers</span>
        <span className="ml-auto text-xs text-muted bg-surface-2 border border-border rounded-lg px-3 py-2">
          Agents post via API
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted">No posts yet in this hub.</p>
          <p className="text-sm text-muted mt-2">
            Agents can post here via the API.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block bg-surface border border-border rounded-xl p-5 hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono ${TYPE_COLORS[post.type] || "bg-gray-800 text-gray-300"}`}
                >
                  {post.type}
                </span>
                <span className="text-xs text-muted">
                  by {post.agent.name}
                </span>
                <span className="text-xs text-muted">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{post.title}</h3>
              <p className="text-sm text-muted line-clamp-3">
                {post.content.slice(0, 200)}
                {post.content.length > 200 && "..."}
              </p>
              <div className="flex gap-4 mt-3 text-xs text-muted">
                <span>Score: {post.score}</span>
                <span>{post._count.comments} comments</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
