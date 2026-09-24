"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Camera,
  Clock3,
  Heart,
  LocateFixed,
  MapPin,
  MessageSquareText,
  Search,
  SendHorizonal,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import {
  botSeedMessages,
  quickReplies,
  studySpots,
  type ChatMessage,
  type StudySpot,
} from "@/lib/mock-data";

type FilterKey = "All" | "Quiet" | "High WiFi" | "Outlets" | "Less crowded";
type StudyMode = "Deep focus" | "Group review" | "Quick recharge";

const filterOptions: FilterKey[] = ["All", "Quiet", "High WiFi", "Outlets", "Less crowded"];
const studyModes: StudyMode[] = ["Deep focus", "Group review", "Quick recharge"];
const fallbackLocation = { latitude: 40.4419, longitude: -79.9431 };

function distanceBetweenKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreSpot(spot: StudySpot, userLocation = fallbackLocation, mode: StudyMode = "Deep focus") {
  const distanceKm = distanceBetweenKm(
    userLocation.latitude,
    userLocation.longitude,
    spot.latitude,
    spot.longitude,
  );
  const proximityBoost = Math.max(0, 2.4 - distanceKm) * 18;

  let modeBoost = 0;

  if (mode === "Deep focus") {
    modeBoost = (5 - spot.noiseLevel) * 14 + spot.wifiQuality * 6;
  } else if (mode === "Group review") {
    modeBoost = spot.wifiQuality * 10 + spot.outlets * 9 + (5 - spot.busyness) * 10;
  } else {
    modeBoost = spot.outlets * 12 + (5 - spot.busyness) * 10 + spot.wifiQuality * 5;
  }

  return (
    spot.rating * 22 +
    spot.wifiQuality * 18 +
    spot.outlets * 18 +
    (6 - spot.busyness) * 12 +
    (6 - spot.noiseLevel) * 16 +
    modeBoost +
    proximityBoost
  );
}

export default function StudySpotFinder() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("All");
  const [studyMode, setStudyMode] = useState<StudyMode>("Deep focus");
  const [selectedId, setSelectedId] = useState(studySpots[0].id);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(botSeedMessages);
  useEffect(() => {
    try {
      const savedFavorites = window.localStorage.getItem("study-sync-favorites");
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("study-sync-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    const updateLocation = (position: GeolocationPosition) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setLocationStatus("granted");
    };

    const handleError = () => {
      setLocationStatus("denied");
      setUserLocation(fallbackLocation);
    };

    const watchId = navigator.geolocation.watchPosition(updateLocation, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const [communityReviews, setCommunityReviews] = useState([
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
  ]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
    photo: "",
  });

  const filteredSpots = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matches = studySpots.filter((spot) => {
      const byText =
        query.length === 0 ||
        spot.name.toLowerCase().includes(query) ||
        spot.building.toLowerCase().includes(query) ||
        spot.tags.some((tag) => tag.toLowerCase().includes(query));

      const byFilter = (() => {
        if (filter === "All") return true;
        if (filter === "Quiet") return spot.noiseLevel <= 2;
        if (filter === "High WiFi") return spot.wifiQuality >= 4;
        if (filter === "Outlets") return spot.outlets >= 4;
        return spot.busyness <= 3;
      })();

      return byText && byFilter;
    });

    const currentLocation = userLocation ?? fallbackLocation;
    return [...matches].sort(
      (a, b) => scoreSpot(b, currentLocation, studyMode) - scoreSpot(a, currentLocation, studyMode),
    );
  }, [filter, search, studyMode, userLocation]);

  const favoriteSpots = useMemo(
    () => studySpots.filter((spot) => favorites.includes(spot.id)),
    [favorites],
  );

  const selectedSpot =
    filteredSpots.find((spot) => spot.id === selectedId) ?? filteredSpots[0] ?? studySpots[0];

  useEffect(() => {
    if (locationStatus === "granted" && filteredSpots.length > 0) {
      setSelectedId(filteredSpots[0].id);
    }
  }, [filteredSpots, locationStatus]);

  const visibleReviews = communityReviews.filter((review) => review.spotId === selectedSpot.id).slice(0, 3);
  const currentLocation = userLocation ?? fallbackLocation;
  const nearestDistanceKm = distanceBetweenKm(
    currentLocation.latitude,
    currentLocation.longitude,
    selectedSpot.latitude,
    selectedSpot.longitude,
  );

  const toggleFavorite = (spotId: string) => {
    setFavorites((current) =>
      current.includes(spotId) ? current.filter((id) => id !== spotId) : [...current, spotId],
    );
  };

  const bestSpotNow = filteredSpots[0];

  const handleQuickReply = (reply: string) => {
    handleChatSend(reply);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("idle");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
        setUserLocation(fallbackLocation);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleChatSend = (promptText?: string) => {
    const value = (promptText ?? chatInput).trim();
    if (!value) return;

    const lower = value.toLowerCase();
    let response = "I found a few strong options for your study flow. Try the quick filters to narrow them down.";

    if (lower.includes("quiet")) {
      setFilter("Quiet");
      response = "I’ve narrowed the list to the quietest study spots. Harbor Library Nook is the strongest choice for deep focus.";
    } else if (lower.includes("wifi") || lower.includes("internet")) {
      setFilter("High WiFi");
      response = "The best Wi‑Fi options are the main library and the STEM lounge. Both have strong connectivity for video calls and long sessions.";
    } else if (lower.includes("outlet") || lower.includes("charging")) {
      setFilter("Outlets");
      response = "The library and STEM center have the most power outlets. They are ideal for laptop-heavy study sessions.";
    } else if (lower.includes("review")) {
      response = "Tap the review form below and add your rating, comment, and optional photo. Your feedback helps other students choose the right place.";
    } else if (lower.includes("crowd") || lower.includes("busy")) {
      setFilter("Less crowded");
      response = "I’d recommend the courtyard or library for calmer conditions. They stay less crowded during off-peak hours.";
    }

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: value },
      { id: Date.now() + 1, role: "bot", text: response },
    ]);
    setChatInput("");
    setChatOpen(true);
  };

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reviewForm.comment.trim()) return;

    const newReview = {
      id: Date.now(),
      spotId: selectedSpot.id,
      student: reviewForm.name.trim() || "Anonymous student",
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      photo: reviewForm.photo.trim() || selectedSpot.image,
    };

    setCommunityReviews((current) => [newReview, ...current]);
    setReviewForm({ name: "", rating: 5, comment: "", photo: "" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md pb-28">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Campus guide</p>
              <h1 className="text-xl font-bold text-white">StudySync</h1>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200"
            >
              <MessageSquareText className="h-4 w-4" />
              Help
            </button>
          </div>
        </header>

        <main className="space-y-4 p-4">
          <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-4 shadow-[0_20px_70px_rgba(14,165,233,0.18)]">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
              <Search className="h-4 w-4 text-cyan-300" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by study vibe, library, or café"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 outline-none"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold uppercase tracking-[0.18em] text-cyan-200">Best nearby now</span>
                <span>{locationStatus === "granted" ? "Live" : "Preview"}</span>
              </div>
              <p className="mt-1 text-sm text-white">{bestSpotNow ? `${bestSpotNow.name} is the strongest match for your current area and study mode.` : "No matches yet"}</p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Best study match</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{selectedSpot.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedSpot.id)}
                  aria-label={`Save ${selectedSpot.name}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    favorites.includes(selectedSpot.id)
                      ? "border-pink-400 bg-pink-500/15 text-pink-200"
                      : "border-white/10 bg-slate-900/80 text-slate-300"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(selectedSpot.id) ? "fill-current" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950"
                >
                  Live guide
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="h-4 w-4 text-cyan-300" />
              {selectedSpot.building} • {selectedSpot.category} • {nearestDistanceKm < 1 ? `${nearestDistanceKm.toFixed(2)} km away` : `${nearestDistanceKm.toFixed(1)} km away`}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-slate-950/30 px-3 py-2 text-xs text-cyan-100">
              <span className="flex items-center gap-2">
                <LocateFixed className="h-3.5 w-3.5" />
                {locationStatus === "granted" ? "Live location enabled" : locationStatus === "denied" ? "Using fallback campus center" : locationStatus === "unsupported" ? "Location unavailable" : "Checking nearby spaces..."}
              </span>
              <span className="text-slate-300">{selectedSpot.distance}</span>
            </div>

            <div className="relative mt-4 h-40 overflow-hidden rounded-[24px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_rgba(15,23,42,0.4)_60%,_rgba(15,23,42,0.9))]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
              {studySpots.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setSelectedId(spot.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${spot.mapX}%`, top: `${spot.mapY}%` }}
                  aria-label={`View ${spot.name}`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      selectedSpot.id === spot.id
                        ? "border-cyan-300 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                        : "border-slate-200 bg-emerald-400"
                    }`}
                  />
                </button>
              ))}
              <div className="absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-3 py-2 text-xs text-cyan-200 backdrop-blur-sm">
                {selectedSpot.vibe}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/90 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Filters</h3>
              </div>
              <span className="text-xs text-slate-400">{filteredSpots.length} matches</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    filter === option
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-white/10 bg-slate-800/70 text-slate-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">Study mode</p>
              <div className="flex flex-wrap gap-2">
                {studyModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setStudyMode(mode)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      studyMode === mode
                        ? "border-emerald-400 bg-emerald-400 text-slate-950"
                        : "border-white/10 bg-slate-800/80 text-slate-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/90 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Your plan</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{studyMode}</h3>
              </div>
              <div className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-200">
                {favoriteSpots.length} saved
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {studyMode === "Deep focus"
                ? "Focus mode is prioritizing low noise, calmer energy, and stronger concentration support."
                : studyMode === "Group review"
                  ? "Collaboration mode is favoring shared tables, strong Wi‑Fi, and spaces that are easy to meet in."
                  : "Quick recharge mode is leaning toward easy access, outlets, and a smooth setup for short sessions."}
            </p>
          </section>

          <section className="space-y-3">
            {filteredSpots.map((spot) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => setSelectedId(spot.id)}
                className={`flex w-full items-center gap-3 rounded-[26px] border p-3 text-left transition ${
                  selectedSpot.id === spot.id
                    ? "border-cyan-400/60 bg-cyan-500/10"
                    : "border-white/10 bg-slate-900/80"
                }`}
              >
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate font-semibold text-white">{spot.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full bg-amber-300/12 px-2 py-1 text-xs font-semibold text-amber-200">
                        <Star className="h-3 w-3 fill-current" />
                        {spot.rating}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavorite(spot.id);
                        }}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                          favorites.includes(spot.id)
                            ? "border-pink-400 bg-pink-500/15 text-pink-200"
                            : "border-white/10 bg-slate-800 text-slate-300"
                        }`}
                        aria-label={`Save ${spot.name}`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${favorites.includes(spot.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="h-3 w-3 text-cyan-300" />
                    {spot.building}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-200">
                    {spot.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-800 px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/90 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Space summary</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{selectedSpot.name}</h3>
              </div>
              <div className="rounded-full bg-emerald-300/12 px-2 py-1 text-xs font-medium text-emerald-200">
                {selectedSpot.vibe}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-300">{selectedSpot.summary}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
                <div className="mb-2 flex items-center gap-2 text-cyan-300">
                  <Wifi className="h-4 w-4" />
                  Wi‑Fi
                </div>
                <div className="text-xl font-bold text-white">{selectedSpot.wifiQuality}/5</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
                <div className="mb-2 flex items-center gap-2 text-cyan-300">
                  <Zap className="h-4 w-4" />
                  Outlets
                </div>
                <div className="text-xl font-bold text-white">{selectedSpot.outlets}/5</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
                <div className="mb-2 flex items-center gap-2 text-cyan-300">
                  <Users className="h-4 w-4" />
                  Crowd
                </div>
                <div className="text-xl font-bold text-white">{selectedSpot.busyness}/5</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
                <div className="mb-2 flex items-center gap-2 text-cyan-300">
                  <Clock3 className="h-4 w-4" />
                  Open until
                </div>
                <div className="text-xl font-bold text-white">{selectedSpot.openUntil}</div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/90 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Community reviews</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Student feedback</h3>
              </div>
              <div className="flex items-center gap-1 text-amber-200">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">{selectedSpot.rating}</span>
              </div>
            </div>

            <div className="space-y-3">
              {visibleReviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{review.student}</p>
                      <div className="mt-1 flex items-center gap-1 text-amber-200">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star key={index} className={`h-3 w-3 ${index < review.rating ? "fill-current" : "text-slate-600"}`} />
                        ))}
                      </div>
                    </div>
                    <img src={review.photo} alt="Review" className="h-12 w-12 rounded-xl object-cover" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/90 p-4">
            <div className="mb-4 flex items-center gap-2 text-cyan-300">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-lg font-semibold text-white">Leave a review</h3>
            </div>

            <form className="space-y-3" onSubmit={handleReviewSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={reviewForm.name}
                  onChange={(event) => setReviewForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                  className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-400"
                />
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))
                  }
                  className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} stars
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={reviewForm.comment}
                onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                rows={3}
                placeholder="How was the noise, Wi‑Fi, and atmosphere?"
                className="w-full rounded-2xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-400"
              />

              <div className="flex items-center gap-2 rounded-2xl border border-dashed border-cyan-400/40 bg-cyan-500/5 px-3 py-2 text-sm text-cyan-200">
                <Camera className="h-4 w-4" />
                <input
                  value={reviewForm.photo}
                  onChange={(event) => setReviewForm((current) => ({ ...current, photo: event.target.value }))}
                  placeholder="Optional photo URL"
                  className="w-full bg-transparent text-sm text-white placeholder:text-cyan-200/70 outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Share review
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </section>
        </main>
      </div>

      {chatOpen && (
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-3 pb-4">
          <div className="rounded-t-[28px] border border-cyan-400/20 bg-slate-900/95 p-3 shadow-[0_-10px_40px_rgba(14,165,233,0.2)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                  <MessageSquareText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Study assistant</p>
                  <p className="text-[10px] text-slate-400">Always ready to guide you</p>
                </div>
              </div>
              <button type="button" onClick={() => setChatOpen(false)} className="text-xs text-slate-400">
                Close
              </button>
            </div>

            <div className="mb-3 max-h-44 space-y-2 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === "bot"
                      ? "bg-slate-800 text-slate-100"
                      : "ml-auto bg-cyan-400 text-slate-950"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => handleQuickReply(reply)}
                  className="rounded-full border border-white/10 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200"
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-3 py-2">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about quiet places, Wi‑Fi, or reviews"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={() => handleChatSend()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-slate-950"
                aria-label="Send message"
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
