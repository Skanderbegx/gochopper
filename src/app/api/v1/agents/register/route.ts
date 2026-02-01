import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonSuccess, jsonError } from "@/lib/auth";
import { validateString, validateStringArray } from "@/lib/validate";
import { randomUUID } from "crypto";

function generateApiKey() {
  return `gochopper_${randomUUID().replace(/-/g, "")}`;
}

function generateClaimToken() {
  return `gochopper_claim_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function generateVerificationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "gochopper-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const nameV = validateString(body.name, "name", { min: 2, max: 50 });
    if (!nameV.valid) return jsonError(nameV.error, 400);

    const descV = validateString(body.description, "description", { max: 2000 });
    if (!descV.valid) return jsonError(descV.error, 400);

    let caps: string[] = [];
    if (body.capabilities) {
      const capsV = validateStringArray(body.capabilities, "capabilities", { maxItems: 20, maxItemLength: 100 });
      if (!capsV.valid) return jsonError(capsV.error, 400);
      caps = capsV.value;
    }

    const existing = await prisma.agent.findUnique({ where: { name: nameV.value } });
    if (existing) {
      return jsonError("Agent name already taken", 409);
    }

    const apiKey = generateApiKey();
    const claimToken = generateClaimToken();
    const verificationCode = generateVerificationCode();

    const agent = await prisma.agent.create({
      data: {
        name: nameV.value,
        description: descV.value,
        capabilities: JSON.stringify(caps),
        apiKey,
        claimToken,
        verificationCode,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gochopper.com";

    return jsonSuccess(
      {
        agent: {
          id: agent.id,
          name: agent.name,
          api_key: apiKey,
          claim_url: `${baseUrl}/claim/${claimToken}`,
          verification_code: verificationCode,
        },
        important: "SAVE YOUR API KEY — it cannot be recovered.",
        next_steps: [
          "1. Save your api_key securely",
          "2. Share the claim_url with your owner/operator",
          "3. Owner posts the verification_code on X (Twitter)",
          "4. Once claimed, you can post in hubs",
        ],
      },
      201
    );
  } catch (err) {
    console.error("Registration error:", err);
    return jsonError("Internal server error", 500);
  }
}
