import { NextResponse } from "next/server";
import { isDatabaseConfigured, queryDb } from "@/lib/db";
import { studySpots } from "@/lib/mock-data";

const localReviews = [
  {
    id: 1,
    spotId: "harbor-library",
    student: "Ava",
    rating: 5,
    comment: "Perfect for lecture prep and quiet revision blocks.",
    photo:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    spotId: "innovation-lab",
    student: "Marcus",
    rating: 4,
    comment: "Great Wi‑Fi and the tables are ideal for teamwork.",
    photo:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    spotId: "greenhouse-cafe",
    student: "Leah",
    rating: 5,
    comment: "Good energy and coffee, while still productive.",
    photo:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const spotId = searchParams.get("spotId");

  if (isDatabaseConfigured()) {
    const rows = await queryDb<{ id: number; spot_id: number; student_name: string; rating: number; comment: string; photo_url: string | null }>(
      spotId
        ? `SELECT id, spot_id, student_name, rating, comment, photo_url FROM reviews WHERE spot_id = $1 ORDER BY created_at DESC`
        : `SELECT id, spot_id, student_name, rating, comment, photo_url FROM reviews ORDER BY created_at DESC`,
      spotId ? [Number(spotId)] : [],
    );

    if (rows.length) {
      return NextResponse.json({
        reviews: rows.map((review) => ({
          id: review.id,
          spotId: String(review.spot_id),
          student: review.student_name,
          rating: Number(review.rating),
          comment: review.comment,
          photo: review.photo_url ?? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
        })),
        count: rows.length,
        source: "database",
      });
    }
  }

  const filtered = spotId
    ? localReviews.filter((review) => review.spotId === spotId)
    : localReviews;

  return NextResponse.json({ reviews: filtered, count: filtered.length, source: "fallback" });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    spotId?: string;
    name?: string;
    rating?: number;
    comment?: string;
    photo?: string;
  };

  if (!body.spotId || !body.comment || !studySpots.some((spot) => spot.id === body.spotId)) {
    return NextResponse.json(
      { ok: false, message: "Valid spotId and comment are required." },
      { status: 400 },
    );
  }

  if (isDatabaseConfigured()) {
    const inserted = await queryDb<{ id: number; spot_id: number; student_name: string; rating: number; comment: string; photo_url: string }>(
      `INSERT INTO reviews (spot_id, student_name, rating, comment, photo_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, spot_id, student_name, rating, comment, photo_url`,
      [
        Number(body.spotId),
        body.name || "Anonymous student",
        Number(body.rating ?? 5),
        body.comment,
        body.photo || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
      ],
    );

    if (inserted[0]) {
      return NextResponse.json({
        ok: true,
        review: {
          id: inserted[0].id,
          spotId: String(inserted[0].spot_id),
          student: inserted[0].student_name,
          rating: Number(inserted[0].rating),
          comment: inserted[0].comment,
          photo: inserted[0].photo_url,
        },
        source: "database",
      });
    }
  }

  const review = {
    id: Date.now(),
    spotId: body.spotId,
    student: body.name || "Anonymous student",
    rating: Number(body.rating ?? 5),
    comment: body.comment,
    photo: body.photo || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  };

  localReviews.unshift(review);

  return NextResponse.json({ ok: true, review, source: "fallback" });
}
