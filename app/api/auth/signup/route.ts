import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Account creation is currently disabled (invite-only)." },
    { status: 403 },
  );
}
