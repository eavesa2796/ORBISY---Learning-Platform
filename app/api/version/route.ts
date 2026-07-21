import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF || "unknown",
    deployedAt: new Date().toISOString(),
  });
}
