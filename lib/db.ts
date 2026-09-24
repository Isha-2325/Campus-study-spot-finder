import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl:
        connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : null;

export function isDatabaseConfigured() {
  return Boolean(connectionString);
}

export async function queryDb<T extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!pool) {
    return [];
  }

  try {
    const result = await pool.query<T>(query, params);
    return result.rows;
  } catch (error) {
    console.error("Database query failed:", error);
    return [];
  }
}

export async function databaseHealthcheck() {
  if (!pool) {
    return { ok: false, mode: "fallback" as const, error: "DATABASE_URL is not configured." };
  }

  try {
    await pool.query("SELECT 1");
    return { ok: true, mode: "database" as const };
  } catch (error) {
    return {
      ok: false,
      mode: "fallback" as const,
      error: error instanceof Error ? error.message : "Database connection failed.",
    };
  }
}
