import { NextResponse } from "next/server";
import { databaseHealthcheck } from "@/lib/db";

export async function GET() {
  const dbStatus = await databaseHealthcheck();

  return NextResponse.json({
    ok: true,
    service: "campus-study-spot-finder-api",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
