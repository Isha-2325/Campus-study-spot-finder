import { NextResponse } from "next/server";
import { isDatabaseConfigured, queryDb } from "@/lib/db";
import { campusAreas, studySpots } from "@/lib/mock-data";

type StudySpotRow = {
  id: number;
  area_id: number;
  name: string;
  building: string | null;
  address: string | null;
  rating: number | string | null;
  review_count: number | string | null;
  noise_level: number | string | null;
  wifi_quality: number | string | null;
  outlets: number | string | null;
  busyness: number | string | null;
  image_url: string | null;
  vibe: string | null;
  map_x: number | string | null;
  map_y: number | string | null;
  summary: string | null;
  tags: string[] | null;
  features: string[] | null;
  open_until: string | null;
  category: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  review_highlights: string[] | null;
  area_name: string | null;
  area_subtitle: string | null;
  area_summary: string | null;
  area_vibe: string | null;
};

function normalizeNumber(value: number | string | null, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return Number(value) || fallback;
}

function mapStudySpotRow(row: StudySpotRow) {
  return {
    id: String(row.id),
    areaId: String(row.area_id),
    name: row.name,
    building: row.building ?? "Campus Spot",
    address: row.address ?? "Campus area",
    distance: "Nearby",
    rating: normalizeNumber(row.rating, 4.5),
    reviewCount: normalizeNumber(row.review_count, 0),
    noiseLevel: normalizeNumber(row.noise_level, 2),
    wifiQuality: normalizeNumber(row.wifi_quality, 4),
    outlets: normalizeNumber(row.outlets, 3),
    busyness: normalizeNumber(row.busyness, 3),
    image: row.image_url ?? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    vibe: row.vibe ?? row.area_vibe ?? "Balanced",
    mapX: normalizeNumber(row.map_x, 50),
    mapY: normalizeNumber(row.map_y, 50),
    summary: row.summary ?? row.area_summary ?? "A student favorite study zone.",
    tags: Array.isArray(row.tags) ? row.tags : [row.category ?? "Study"],
    features: Array.isArray(row.features) ? row.features : ["Wi‑Fi", "Study seating"],
    openUntil: row.open_until ?? "Open today",
    category: (row.category as "Library" | "Silent café" | "Co-working space" | "Outdoor quiet zone") ?? "Library",
    latitude: normalizeNumber(row.latitude, 40.4419),
    longitude: normalizeNumber(row.longitude, -79.9431),
    reviewHighlights: Array.isArray(row.review_highlights)
      ? row.review_highlights
      : ["Highly rated by students", "Good for focused study"],
  };
}

async function getDatabaseSpots(areaId: string | null, query: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const whereClauses: string[] = [];
  const params: unknown[] = [];

  if (areaId) {
    whereClauses.push("s.campus_id = $1");
    params.push(Number(areaId));
  }

  if (query) {
    whereClauses.push(`(
      lower(s.name) LIKE $${params.length + 1} OR
      lower(s.building) LIKE $${params.length + 2} OR
      lower(s.summary) LIKE $${params.length + 3} OR
      lower(CAST(s.tags AS text)) LIKE $${params.length + 4}
    )`);
    const pattern = `%${query}%`;
    params.push(pattern, pattern, pattern, pattern);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const rows = await queryDb<StudySpotRow>(`
    SELECT
      s.id,
      s.campus_id AS area_id,
      s.name,
      s.building,
      s.address,
      s.rating,
      COALESCE(r.review_count, 0) AS review_count,
      s.noise_level,
      s.wifi_quality,
      s.outlets,
      s.busyness,
      s.image_url,
      s.vibe,
      s.map_x,
      s.map_y,
      s.summary,
      s.tags,
      s.features,
      s.open_until,
      s.category,
      s.latitude,
      s.longitude,
      s.review_highlights,
      c.name AS area_name,
      c.subtitle AS area_subtitle,
      c.summary AS area_summary,
      c.vibe AS area_vibe
    FROM study_spots s
    LEFT JOIN campuses c ON c.id = s.campus_id
    LEFT JOIN (
      SELECT spot_id, COUNT(*)::int AS review_count
      FROM reviews
      GROUP BY spot_id
    ) r ON r.spot_id = s.id
    ${whereSql}
    ORDER BY s.rating DESC, s.name ASC
  `, params);

  if (!rows.length) {
    return [];
  }

  return rows.map(mapStudySpotRow);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const areaId = searchParams.get("areaId");
  const query = searchParams.get("query")?.trim().toLowerCase() ?? "";

  const dbSpots = await getDatabaseSpots(areaId, query);

  if (dbSpots !== null) {
    return NextResponse.json({
      areas: campusAreas,
      spots: dbSpots,
      total: dbSpots.length,
      generatedAt: new Date().toISOString(),
      source: "database",
    });
  }

  const spots = studySpots.filter((spot) => {
    if (areaId && spot.areaId !== areaId) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      spot.name.toLowerCase().includes(query) ||
      spot.building.toLowerCase().includes(query) ||
      spot.summary.toLowerCase().includes(query) ||
      spot.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return NextResponse.json({
    areas: campusAreas,
    spots,
    total: spots.length,
    generatedAt: new Date().toISOString(),
    source: "fallback",
  });
}
