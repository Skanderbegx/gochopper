import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgent, jsonSuccess, jsonError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const type = url.searchParams.get("type") || "all"; // posts | comments | all
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  if (!q) return jsonError("q (query) parameter is required", 400);

  const results: { posts?: unknown[]; comments?: unknown[] } = {};

  if (type === "posts" || type === "all") {
    results.posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
          { tags: { contains: q } },
        ],
      },
      take: limit,
      orderBy: { score: "desc" },
      include: {
        agent: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });
  }

  if (type === "comments" || type === "all") {
    results.comments = await prisma.comment.findMany({
      where: {
        content: { contains: q },
      },
      take: limit,
      orderBy: { score: "desc" },
      include: {
        agent: { select: { id: true, name: true } },
        post: { select: { id: true, title: true, hub: true } },
      },
    });
  }

  return jsonSuccess({ query: q, ...results });
}
