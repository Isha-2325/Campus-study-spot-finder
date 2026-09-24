export type StudySpot = {
  id: string;
  areaId: string;
  name: string;
  building: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  noiseLevel: number;
  wifiQuality: number;
  outlets: number;
  busyness: number;
  image: string;
  vibe: string;
  mapX: number;
  mapY: number;
  summary: string;
  tags: string[];
  features: string[];
  openUntil: string;
  category: "Library" | "Silent café" | "Co-working space" | "Outdoor quiet zone";
  latitude: number;
  longitude: number;
  reviewHighlights: string[];
};

export type CampusArea = {
  id: string;
  name: string;
  subtitle: string;
  summary: string;
  vibe: string;
};

export const campusAreas: CampusArea[] = [
  {
    id: "north-quad",
    name: "North Quad",
    subtitle: "Quiet and academic",
    summary: "Best for focused study blocks and library culture.",
    vibe: "Deep focus",
  },
  {
    id: "innovation-district",
    name: "Innovation District",
    subtitle: "Productive and social",
    summary: "Ideal for group work, review sessions, and collaborative study.",
    vibe: "Group review",
  },
  {
    id: "student-hub",
    name: "Student Hub",
    subtitle: "Coffee, energy, and flexible work",
    summary: "Great for a relaxed but active study rhythm with snacks and community energy.",
    vibe: "Creative flow",
  },
  {
    id: "arts-courtyard",
    name: "Arts Courtyard",
    subtitle: "Calm and scenic",
    summary: "A lighter environment for reading, planning, and reflective work.",
    vibe: "Light focus",
  },
];

export const studySpots: StudySpot[] = [
  {
    id: "harbor-library",
    areaId: "north-quad",
    name: "Harbor Library Nook",
    building: "Main Library",
    address: "Main Library, 100 Campus Way, North Quad",
    distance: "0.2 mi",
    rating: 4.9,
    reviewCount: 184,
    noiseLevel: 1,
    wifiQuality: 5,
    outlets: 5,
    busyness: 2,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    vibe: "Quiet and focused",
    mapX: 24,
    mapY: 55,
    summary: "Best for deep work, silent study blocks, and reliable Wi‑Fi.",
    tags: ["Quiet", "Fast Wi‑Fi", "Power outlets"],
    features: ["Silent zones", "Charging desks", "Natural light"],
    openUntil: "10:00 PM",
    category: "Library",
    latitude: 40.4415,
    longitude: -79.944,
    reviewHighlights: ["Highest student rating", "Perfect for finals prep", "Strongest Wi‑Fi"],
  },
  {
    id: "innovation-lab",
    areaId: "innovation-district",
    name: "Innovation Lab Lounge",
    building: "STEM Center",
    address: "STEM Center, 240 Research Lane, Innovation District",
    distance: "0.6 mi",
    rating: 4.8,
    reviewCount: 142,
    noiseLevel: 2,
    wifiQuality: 5,
    outlets: 5,
    busyness: 3,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    vibe: "Productive and social",
    mapX: 53,
    mapY: 34,
    summary: "A solid mix of collaboration and focus with plenty of desk space and screens.",
    tags: ["Group work", "Strong Wi‑Fi", "High mobility"],
    features: ["Whiteboards", "Monitor stations", "USB ports"],
    openUntil: "9:30 PM",
    category: "Co-working space",
    latitude: 40.4429,
    longitude: -79.9418,
    reviewHighlights: ["Best for team projects", "Excellent charging access", "Very productive energy"],
  },
  {
    id: "greenhouse-cafe",
    areaId: "student-hub",
    name: "Greenhouse Café",
    building: "Student Union",
    address: "Student Union Plaza, 88 Social Avenue, Student Hub",
    distance: "0.8 mi",
    rating: 4.6,
    reviewCount: 96,
    noiseLevel: 3,
    wifiQuality: 4,
    outlets: 4,
    busyness: 4,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    vibe: "Buzzing but energizing",
    mapX: 72,
    mapY: 62,
    summary: "Great for active study sessions with snacks, coffee, and a social rhythm.",
    tags: ["Coffee", "Group study", "Social vibe"],
    features: ["Barista coffee", "Long tables", "Lounge seating"],
    openUntil: "11:00 PM",
    category: "Silent café",
    latitude: 40.4397,
    longitude: -79.9412,
    reviewHighlights: ["Good coffee and energy", "Strong social atmosphere", "Nice for short blocks"],
  },
  {
    id: "sunset-garden",
    areaId: "arts-courtyard",
    name: "Sunset Garden Courtyard",
    building: "Arts Quad",
    address: "Arts Quad, 30 Meadow Lane, Arts Courtyard",
    distance: "1.1 mi",
    rating: 4.5,
    reviewCount: 78,
    noiseLevel: 2,
    wifiQuality: 3,
    outlets: 2,
    busyness: 2,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    vibe: "Calm and refreshing",
    mapX: 38,
    mapY: 74,
    summary: "Perfect for reading, journaling, or low-pressure outdoor study sessions.",
    tags: ["Outdoor", "Low traffic", "Nature"],
    features: ["Shade seating", "Outdoor tables", "Scenic view"],
    openUntil: "8:30 PM",
    category: "Outdoor quiet zone",
    latitude: 40.4435,
    longitude: -79.9473,
    reviewHighlights: ["Great for reading", "Relaxed environment", "A calmer reset spot"],
  },
];

export const quickReplies = [
  "Find the quietest place",
  "Best Wi‑Fi spots",
  "Show me outlets nearby",
  "How do I leave a review?",
];

export type ChatMessage = {
  id: string | number;
  role: "bot" | "user";
  text: string;
};

export const botSeedMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "bot",
    text: "Hi! I can help you find the best study spot on campus. Choose your area and I’ll match the closest fit.",
  },
  {
    id: "guide",
    role: "bot",
    text: "Need help? I can suggest a location based on your study vibe, current area, or your need for Wi‑Fi or quiet.",
  },
];
