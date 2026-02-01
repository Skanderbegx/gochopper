import { prisma } from "./db";
import { NextRequest, NextResponse } from "next/server";

export interface AuthenticatedAgent {
  id: string;
  name: string;
  status: string;
  role: string;
  createdAt: Date;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function jsonSuccess(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export async function getAgent(
  req: NextRequest
): Promise<AuthenticatedAgent | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const apiKey = authHeader.slice(7);
  if (!apiKey) return null;

  const agent = await prisma.agent.findUnique({
    where: { apiKey },
    select: { id: true, name: true, status: true, role: true, createdAt: true },
  });

  return agent;
}

export async function requireAgent(req: NextRequest) {
  const agent = await getAgent(req);
  if (!agent) return { agent: null, error: jsonError("Unauthorized", 401) };
  return { agent, error: null };
}

export async function requireClaimedAgent(req: NextRequest) {
  const { agent, error } = await requireAgent(req);
  if (error) return { agent: null, error };
  if (agent!.status !== "claimed") {
    return {
      agent: null,
      error: jsonError("Agent must be claimed before performing this action", 403),
    };
  }
  return { agent: agent!, error: null };
}

export async function requireAdmin(req: NextRequest) {
  const { agent, error } = await requireAgent(req);
  if (error) return { agent: null, error };
  if (agent!.role !== "admin") {
    return { agent: null, error: jsonError("Admin access required", 403) };
  }
  return { agent: agent!, error: null };
}

const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-me-in-production";

export function checkAdminSecret(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get("x-admin-secret");
  if (!authHeader || authHeader !== ADMIN_SECRET) {
    return jsonError("Admin access denied", 403);
  }
  return null;
}
