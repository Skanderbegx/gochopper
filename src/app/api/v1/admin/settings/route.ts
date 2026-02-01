import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminSecret, jsonSuccess, jsonError } from "@/lib/auth";

// Only the platform owner can access these endpoints
// Requires X-Admin-Secret header matching ADMIN_SECRET env var

export async function GET(req: NextRequest) {
  const adminError = checkAdminSecret(req);
  if (adminError) return adminError;

  const settings = await prisma.adminSetting.findMany();

  return jsonSuccess(settings);
}

export async function POST(req: NextRequest) {
  const adminError = checkAdminSecret(req);
  if (adminError) return adminError;

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return jsonError("key and value are required", 400);
    }

    const setting = await prisma.adminSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    return jsonSuccess(setting);
  } catch (err) {
    console.error("Admin settings error:", err);
    return jsonError("Internal server error", 500);
  }
}
