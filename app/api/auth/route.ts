import { NextResponse } from "next/server";
import { isDatabaseConfigured, queryDb } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as { fullName?: string; email?: string; mobile?: string };

  if (!body.fullName || (!body.email && !body.mobile)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Full name and either email or mobile are required.",
      },
      { status: 400 },
    );
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));

  if (isDatabaseConfigured()) {
    try {
      const existingUser = await queryDb<{ id: number }>(
        `SELECT id FROM users WHERE email = $1 OR mobile = $2 LIMIT 1`,
        [body.email ?? null, body.mobile ?? null],
      );

      if (existingUser.length) {
        await queryDb(
          `UPDATE users SET full_name = $1, email = $2, mobile = $3, updated_at = NOW() WHERE id = $4`,
          [body.fullName, body.email ?? null, body.mobile ?? null, existingUser[0].id],
        );
      } else {
        await queryDb(
          `INSERT INTO users (full_name, email, mobile) VALUES ($1, $2, $3)`,
          [body.fullName, body.email ?? null, body.mobile ?? null],
        );
      }

      await queryDb(
        `INSERT INTO otp_verifications (phone_or_email, otp_code, expires_at) VALUES ($1, $2, NOW() + interval '10 minutes')`,
        [body.email ?? body.mobile ?? "unknown", otp],
      );
    } catch (error) {
      console.error("Failed to store auth data in the database:", error);
    }
  }

  return NextResponse.json({
    ok: true,
    message: "OTP sent successfully.",
    otp,
    source: isDatabaseConfigured() ? "database" : "mock",
    user: {
      fullName: body.fullName,
      email: body.email ?? null,
      mobile: body.mobile ?? null,
    },
  });
}
