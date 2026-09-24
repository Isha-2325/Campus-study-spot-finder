export type StudySpot = {
  id: string;
  name: string;
  building: string;
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
};

export const studySpots: StudySpot[] = [
  {
    id: "harbor-library",
    name: "Harbor Library Nook",
    building: "Main Library",
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
    summary: "Best for deep work, silent study blocks, and reliable Wi-Fi.",
    tags: ["Quiet", "Fast Wi-Fi", "Power outlets"],
    features: ["Silent zones", "Charging desks", "Natural light"],
    openUntil: "10:00 PM",
    category: "Library",
    latitude: 40.4415,
    longitude: -79.944,
  },
  {
    id: "innovation-lab",
    name: "Innovation Lab Lounge",
    building: "STEM Center",
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
    summary: "A solid mix of collaboration and focus with lots of desk space.",
    tags: ["Group work", "Strong Wi-Fi", "High mobility"],
    features: ["Whiteboards", "Monitor stations", "USB ports"],
    openUntil: "9:30 PM",
    category: "Co-working space",
    latitude: 40.4429,
    longitude: -79.9418,
  },
  {
    id: "greenhouse-cafe",
    name: "Greenhouse Café",
    building: "Student Union",
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
    summary: "Great when you want an active environment with snacks and quick coffee breaks.",
    tags: ["Coffee", "Group study", "Social vibe"],
    features: ["Barista coffee", "Long tables", "Lounge seating"],
    openUntil: "11:00 PM",
    category: "Silent café",
    latitude: 40.4397,
    longitude: -79.9412,
  },
  {
    id: "sunset-garden",
    name: "Sunset Garden Courtyard",
    building: "Arts Quad",
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
    summary: "Perfect for reading, journaling, or low-pressure study sessions outdoors.",
    tags: ["Outdoor", "Low traffic", "Nature"],
    features: ["Shade seating", "Outdoor tables", "Scenic view"],
    openUntil: "8:30 PM",
    category: "Outdoor quiet zone",
    latitude: 40.4435,
    longitude: -79.9473,
  },
];

export const quickReplies = [
  "Find the quietest place",
  "Best Wi-Fi spots",
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
    text: "Hi! I can help you find the best study spot on campus. Try filtering by quiet spaces or strong Wi‑Fi.",
  },
  {
    id: "guide",
    role: "bot",
    text: "Need help? I can suggest a location, explain which spot matches your vibe, or walk you through leaving a study review.",
  },
];
