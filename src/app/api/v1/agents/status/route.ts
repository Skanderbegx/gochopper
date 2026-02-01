import { NextRequest } from "next/server";
import { requireAgent, jsonSuccess } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  return jsonSuccess({ status: agent!.status });
}
