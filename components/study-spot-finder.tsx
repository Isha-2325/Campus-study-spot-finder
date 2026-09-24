"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpenText,
  Camera,
  CheckCircle2,
  Clock3,
  Compass,
  Heart,
  LocateFixed,
  MapPin,
  MessageSquareText,
  Search,
  SendHorizonal,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import {
  botSeedMessages,
  campusAreas,
  quickReplies,
  studySpots,
  type ChatMessage,
  type StudySpot,
} from "@/lib/mock-data";

type FilterKey =
  | "All"
  | "Quiet"
  | "Cafés"
  | "Co-working"
  | "Gardens"
  | "Libraries"
  | "Group study"
  | "Fast Wi‑Fi"
  | "Outlets"
  | "Low crowd";
type StudyMode = "Deep focus" | "Group review" | "Quick recharge";
type SortKey = "Best match" | "Closest" | "Quietest" | "Highest rated";
type AuthStage = "signup" | "otp" | "location" | "explore";

const filterOptions: FilterKey[] = [
  "All",
  "Quiet",
  "Cafés",
  "Co-working",
  "Gardens",
  "Libraries",
  "Group study",
  "Fast Wi‑Fi",
  "Outlets",
  "Low crowd",
];
const sortOptions: SortKey[] = ["Best match", "Closest", "Quietest", "Highest rated"];
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
  const proximityBoost = Math.max(0, 2.6 - distanceKm) * 18;

  let modeBoost = 0;

  if (mode === "Deep focus") {
    modeBoost = (5 - spot.noiseLevel) * 18 + spot.wifiQuality * 7 + spot.rating * 6;
  } else if (mode === "Group review") {
    modeBoost = spot.wifiQuality * 11 + spot.outlets * 10 + (5 - spot.busyness) * 12;
  } else {
    modeBoost = spot.outlets * 13 + (5 - spot.busyness) * 10 + spot.wifiQuality * 6;
  }

  return (
    spot.rating * 22 +
    spot.wifiQuality * 18 +
    spot.outlets * 18 +
    (6 - spot.busyness) * 12 +
    (6 - spot.noiseLevel) * 16 +
    modeBoost +
    proximityBoost +
    spot.reviewCount * 0.06
  );
}

export default function StudySpotFinder() {
  const [authStage, setAuthStage] = useState<AuthStage>("signup");
  const [signupForm, setSignupForm] = useState({ fullName: "", mobile: "", email: "" });
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("All");
  const [sortBy, setSortBy] = useState<SortKey>("Best match");
  const [studyMode, setStudyMode] = useState<StudyMode>("Deep focus");
  const [spots, setSpots] = useState<StudySpot[]>(studySpots);
  const [areas, setAreas] = useState(campusAreas);
  const [selectedId, setSelectedId] = useState(studySpots[0]?.id ?? "");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(botSeedMessages);
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

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const response = await fetch("/api/study-spots");
        if (!response.ok) {
          throw new Error("Failed to load study spots");
        }

        const data = (await response.json()) as {
          spots?: StudySpot[];
          areas?: typeof campusAreas;
        };

        if (ignore) return;

        if (data.spots?.length) {
          setSpots(data.spots);
          setSelectedId(data.spots[0].id);
        }

        if (data.areas?.length) {
          setAreas(data.areas);
        }
      } catch {
        setSpots(studySpots);
        setAreas(campusAreas);
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

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

  const selectedArea = areas.find((area) => area.id === selectedAreaId) ?? areas[0] ?? campusAreas[0];

  const filteredSpots = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matches = spots.filter((spot) => {
      const inSelectedArea = !selectedAreaId || spot.areaId === selectedAreaId;
      const byText =
        query.length === 0 ||
        spot.name.toLowerCase().includes(query) ||
        spot.building.toLowerCase().includes(query) ||
        spot.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        spot.summary.toLowerCase().includes(query);

      const byFilter = (() => {
        if (filter === "All") return true;
        if (filter === "Quiet") return spot.noiseLevel <= 2 && spot.category !== "Co-working space";
        if (filter === "Cafés") return spot.category === "Silent café";
        if (filter === "Co-working") return spot.category === "Co-working space";
        if (filter === "Gardens") return spot.category === "Outdoor quiet zone";
        if (filter === "Libraries") return spot.category === "Library";
        if (filter === "Group study") return spot.busyness <= 3 || spot.features.includes("Whiteboards");
        if (filter === "Fast Wi‑Fi") return spot.wifiQuality >= 4;
        if (filter === "Outlets") return spot.outlets >= 4;
        return spot.busyness <= 2;
      })();

      return inSelectedArea && byText && byFilter;
    });

    const currentLocation = userLocation ?? fallbackLocation;
    const sorted = [...matches].sort((a, b) => {
      const scoreDelta = scoreSpot(b, currentLocation, studyMode) - scoreSpot(a, currentLocation, studyMode);
      if (sortBy === "Closest") {
        const distanceDelta =
          distanceBetweenKm(currentLocation.latitude, currentLocation.longitude, a.latitude, a.longitude) -
          distanceBetweenKm(currentLocation.latitude, currentLocation.longitude, b.latitude, b.longitude);
        return distanceDelta;
      }
      if (sortBy === "Quietest") {
        return a.noiseLevel - b.noiseLevel || b.rating - a.rating;
      }
      if (sortBy === "Highest rated") {
        return b.rating - a.rating || scoreDelta;
      }
      return scoreDelta;
    });

    return sorted;
  }, [filter, search, selectedAreaId, sortBy, studyMode, userLocation]);

  useEffect(() => {
    if (!filteredSpots.length) return;
    setSelectedId((current) => (filteredSpots.some((spot) => spot.id === current) ? current : filteredSpots[0].id));
  }, [filteredSpots]);

  const favoriteSpots = useMemo(
    () => spots.filter((spot) => favorites.includes(spot.id)),
    [favorites, spots],
  );

  const selectedSpot =
    filteredSpots.find((spot) => spot.id === selectedId) ?? filteredSpots[0] ?? spots[0] ?? studySpots[0];

  const visibleReviews = communityReviews.filter((review) => review.spotId === selectedSpot.id).slice(0, 3);
  const currentLocation = userLocation ?? fallbackLocation;
  const nearestDistanceKm = distanceBetweenKm(
    currentLocation.latitude,
    currentLocation.longitude,
    selectedSpot.latitude,
    selectedSpot.longitude,
  );

  const bestNearbyMatch = filteredSpots[0];

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signupForm.fullName.trim() || (!signupForm.mobile.trim() && !signupForm.email.trim())) {
      setAuthError("Please add your name and either email or mobile number.");
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: signupForm.fullName,
          mobile: signupForm.mobile,
          email: signupForm.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Auth request failed");
      }

      setAuthError("");
      setAuthStage("otp");
    } catch {
      setAuthError("Unable to start signup right now. Please try again.");
    }
  };

  const handleOtpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otp.trim().length < 4) {
      setAuthError("Enter the 4-digit OTP code to continue.");
      return;
    }

    setAuthError("");
    setAuthStage("location");
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      setAuthStage("explore");
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
        setAuthStage("explore");
      },
      () => {
        setLocationStatus("denied");
        setUserLocation(fallbackLocation);
        setAuthStage("explore");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const toggleFavorite = (spotId: string) => {
    setFavorites((current) =>
      current.includes(spotId) ? current.filter((id) => id !== spotId) : [...current, spotId],
    );
  };

  const handleQuickReply = (reply: string) => {
    handleChatSend(reply);
  };

  const handleChatSend = (promptText?: string) => {
    const value = (promptText ?? chatInput).trim();
    if (!value) return;

    const lower = value.toLowerCase();
    let response = "I found a few strong options for your study flow. Try the quick filters to narrow them down.";

    if (lower.includes("quiet") || lower.includes("silent")) {
      setFilter("Quiet");
      response = "I’ve narrowed the list to the quietest study spots. Harbor Library Nook is the strongest choice for deep focus.";
    } else if (lower.includes("wifi") || lower.includes("internet")) {
      setFilter("Fast Wi‑Fi");
      response = "The best Wi‑Fi options are the library and STEM lounge. Both have strong connectivity for long sessions.";
    } else if (lower.includes("outlet") || lower.includes("charging")) {
      setFilter("Outlets");
      response = "The library and STEM center have the most power outlets. They are ideal for laptop-heavy study sessions.";
    } else if (lower.includes("review")) {
      response = "Tap the review form below and add a quick rating and comment. Student feedback is a core ranking signal here.";
    } else if (lower.includes("crowd") || lower.includes("busy") || lower.includes("less crowded")) {
      setFilter("Low crowd");
      response = "I’d recommend the courtyard or library for calmer conditions during peak hours.";
    } else if (lower.includes("coffee") || lower.includes("cafe") || lower.includes("café")) {
      setFilter("Cafés");
      response = "Greenhouse Café is the best match if you want coffee, a relaxed vibe, and a productive rhythm.";
    } else if (lower.includes("group") || lower.includes("team")) {
      setFilter("Group study");
      response = "Innovation Lab Lounge is the strongest option for team reviews and collaborative work.";
    }

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: value },
      { id: Date.now() + 1, role: "bot", text: response },
    ]);
    setChatInput("");
    setChatOpen(true);
  };

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reviewForm.comment.trim()) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: selectedSpot.id,
          name: reviewForm.name,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          photo: reviewForm.photo,
        }),
      });

      if (!response.ok) {
        throw new Error("Review submission failed");
      }

      const data = (await response.json()) as { review?: { spotId: string; student: string; rating: number; comment: string; photo: string } };

      if (data.review) {
        setCommunityReviews((current) => [
          {
            id: Date.now(),
            spotId: data.review!.spotId,
            student: data.review!.student,
            rating: data.review!.rating,
            comment: data.review!.comment,
            photo: data.review!.photo,
          },
          ...current,
        ]);
      }
    } catch {
      const newReview = {
        id: Date.now(),
        spotId: selectedSpot.id,
        student: reviewForm.name.trim() || "Anonymous student",
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        photo: reviewForm.photo.trim() || selectedSpot.image,
      };

      setCommunityReviews((current) => [newReview, ...current]);
    }

    setReviewForm({ name: "", rating: 5, comment: "", photo: "" });
  };

  if (authStage === "signup") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8ed,_#f4f0ff_40%,_#eefaf8_100%)] px-4 py-8 text-slate-700">
        <div className="mx-auto max-w-md">
          <div className="rounded-[32px] border border-[#f7d9d1] bg-white/85 p-5 shadow-[0_18px_60px_rgba(132,101,202,0.12)] backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-rose-400">New user</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-800">QuietFind</h1>
              </div>
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <BookOpenText className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-[26px] bg-gradient-to-br from-[#fff4ef] via-white to-[#eefcf7] p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Welcome</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-800">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sign up with your email or mobile number to unlock live campus recommendations.
              </p>
            </div>

            <form className="mt-5 space-y-3" onSubmit={handleSignupSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Full name</label>
                <input
                  value={signupForm.fullName}
                  onChange={(event) => setSignupForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-[#eadbff] bg-[#faf7ff] px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Mobile number</label>
                <input
                  value={signupForm.mobile}
                  onChange={(event) => setSignupForm((current) => ({ ...current, mobile: event.target.value }))}
                  placeholder="+1 234 567 890"
                  className="w-full rounded-2xl border border-[#eadbff] bg-[#faf7ff] px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Email address</label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[#eadbff] bg-[#faf7ff] px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {authError ? <p className="text-sm text-rose-600">{authError}</p> : null}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (authStage === "otp") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8ed,_#f4f0ff_40%,_#eefaf8_100%)] px-4 py-8 text-slate-700">
        <div className="mx-auto max-w-md">
          <div className="rounded-[32px] border border-[#f7d9d1] bg-white/85 p-5 shadow-[0_18px_60px_rgba(132,101,202,0.12)] backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-rose-400">Verification</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-800">OTP code</h2>
              </div>
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-[26px] bg-[#f7f5ff] p-4 text-sm leading-6 text-slate-600">
              We sent a one-time password to {signupForm.mobile || signupForm.email}. Use the code to verify your account.
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleOtpSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Enter OTP</label>
                <input
                  inputMode="numeric"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-full rounded-2xl border border-[#eadbff] bg-[#faf7ff] px-3 py-3 text-center text-lg font-semibold tracking-[0.4em] text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <p className="text-xs text-slate-500">Demo code: 123456</p>
              {authError ? <p className="text-sm text-rose-600">{authError}</p> : null}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400"
              >
                Verify OTP
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (authStage === "location") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8ed,_#f4f0ff_40%,_#eefaf8_100%)] px-4 py-8 text-slate-700">
        <div className="mx-auto max-w-md">
          <div className="rounded-[32px] border border-[#f7d9d1] bg-white/85 p-5 shadow-[0_18px_60px_rgba(132,101,202,0.12)] backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-rose-400">Step 3</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-800">Allow location</h2>
              </div>
              <div className="rounded-full bg-[#dff8ef] p-3 text-emerald-600">
                <LocateFixed className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-[26px] bg-gradient-to-br from-[#f6fbff] via-white to-[#eefcf7] p-4 text-sm leading-6 text-slate-600">
              We use your location to rank the closest quiet spaces, cafes, and review-based recommendations in real time.
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={requestLocation}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-400"
              >
                Allow location access
                <LocateFixed className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserLocation(fallbackLocation);
                  setLocationStatus("denied");
                  setAuthStage("explore");
                }}
                className="w-full rounded-full border border-[#eadbff] bg-[#faf7ff] px-4 py-3 font-semibold text-violet-700"
              >
                Use campus default location
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fffaf7_0%,_#f7f4ff_26%,_#eefaf7_100%)] text-slate-700">
      <div className="mx-auto max-w-md pb-28">
        <header className="sticky top-0 z-20 border-b border-[#eadbff] bg-[#fffaf7]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-rose-400">Campus guide</p>
              <h1 className="text-xl font-bold text-slate-800">QuietFind</h1>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full border border-[#d8c9ff] bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700"
            >
              <MessageSquareText className="h-4 w-4" />
              Help
            </button>
          </div>
        </header>

        <main className="space-y-4 p-4">
          <section className="rounded-[30px] border border-[#f4d8db] bg-white/80 p-4 shadow-[0_20px_60px_rgba(167,139,250,0.12)] backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Selected area</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-800">{selectedArea.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAreaId(null)}
                className="rounded-full border border-[#ecd8ff] bg-violet-50 px-2.5 py-1.5 text-[10px] font-medium text-violet-700"
              >
                Change area
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#f1e7ff] bg-[#f9f5ff] px-3 py-2 text-sm text-slate-600">
              <Search className="h-4 w-4 text-violet-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search a spot, cafe, or quiet corner"
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>

            <div className="mt-4 rounded-[26px] border border-[#d9f1eb] bg-gradient-to-br from-[#fdf8f4] via-[#fff] to-[#eefaf7] p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Live recommendation</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{bestNearbyMatch?.name ?? "No spot found"}</p>
                </div>
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                  <LocateFixed className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {bestNearbyMatch
                  ? `${bestNearbyMatch.name} is the strongest live match based on your location, review quality, and study mode.`
                  : "No spaces match this filter yet."}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Selected spot</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-800">{selectedSpot.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedSpot.id)}
                  aria-label={`Save ${selectedSpot.name}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    favorites.includes(selectedSpot.id)
                      ? "border-rose-200 bg-rose-100 text-rose-500"
                      : "border-[#e7e1fa] bg-[#f9f5ff] text-slate-500"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(selectedSpot.id) ? "fill-current" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={requestLocation}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#cfeee6] bg-emerald-100 text-emerald-600"
                  aria-label="Use current location"
                >
                  <LocateFixed className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-violet-500" />
              {selectedSpot.building} • {selectedSpot.category} • {nearestDistanceKm < 1 ? `${nearestDistanceKm.toFixed(2)} km away` : `${nearestDistanceKm.toFixed(1)} km away`}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#f1e3d2] bg-[#fff8ee] px-3 py-2 text-xs text-slate-700">
              <span className="flex items-center gap-2">
                <LocateFixed className="h-3.5 w-3.5 text-amber-600" />
                {locationStatus === "granted"
                  ? "Live location enabled"
                  : locationStatus === "denied"
                    ? "Using campus center"
                    : locationStatus === "unsupported"
                      ? "Location unavailable"
                      : "Checking nearby spaces..."}
              </span>
              <span className="text-slate-500">{selectedSpot.distance}</span>
            </div>

            <div className="relative mt-4 h-40 overflow-hidden rounded-[24px] border border-[#ecd9ff] bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.25),_rgba(248,250,252,0.8)_55%,_rgba(223,255,247,0.7))]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
              {spots.filter((spot) => !selectedAreaId || spot.areaId === selectedAreaId).map((spot) => (
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
                        ? "border-violet-500 bg-violet-400 shadow-[0_0_20px_rgba(168,85,247,0.56)]"
                        : "border-white bg-emerald-400"
                    }`}
                  />
                </button>
              ))}
              <div className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-2 text-xs font-medium text-violet-700 backdrop-blur-sm">
                {selectedSpot.vibe}
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#f0e1ff] bg-white/80 p-4 shadow-[0_12px_36px_rgba(167,139,250,0.08)]">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-violet-500" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Filters</h3>
              </div>
              <span className="text-xs text-slate-500">{filteredSpots.length} matches</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    filter === option
                      ? "border-violet-400 bg-violet-500 text-white"
                      : "border-[#eadbff] bg-[#faf5ff] text-slate-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[#efe5ff] bg-[#faf8ff] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Sort by</p>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="w-full rounded-2xl border border-[#eadbff] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Study mode</p>
              <div className="flex flex-wrap gap-2">
                {studyModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setStudyMode(mode)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      studyMode === mode
                        ? "border-emerald-400 bg-emerald-500 text-white"
                        : "border-[#dfeae6] bg-[#f1faf7] text-slate-600"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#f0e1ff] bg-white/80 p-4 shadow-[0_12px_36px_rgba(167,139,250,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Your plan</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-800">{studyMode}</h3>
              </div>
              <div className="rounded-full bg-[#edfef7] px-2.5 py-1 text-xs font-medium text-emerald-700">
                {favoriteSpots.length} saved
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {studyMode === "Deep focus"
                ? "Focus mode prioritizes quiet spaces, low crowd density, and stronger Wi‑Fi reliability for deeper sessions."
                : studyMode === "Group review"
                  ? "Collaboration mode favors shared tables, outlets, and productive social energy for team work."
                  : "Quick recharge mode zeros in on fast access, practical seating, and short-session convenience."}
            </p>
          </section>

          <section className="space-y-3">
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(spot.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(spot.id);
                  }
                }}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-[26px] border p-3 text-left transition ${
                  selectedSpot.id === spot.id
                    ? "border-violet-300 bg-violet-50"
                    : "border-[#f0e8ff] bg-white/80"
                }`}
              >
                <img src={spot.image} alt={spot.name} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate font-semibold text-slate-800">{spot.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
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
                            ? "border-rose-200 bg-rose-100 text-rose-500"
                            : "border-[#eeebf7] bg-[#f7f5ff] text-slate-500"
                        }`}
                        aria-label={`Save ${spot.name}`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${favorites.includes(spot.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3 w-3 text-violet-500" />
                    {spot.building}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-600">
                    {spot.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#f4f2ff] px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-[30px] border border-[#f0e1ff] bg-white/80 p-4 shadow-[0_12px_36px_rgba(167,139,250,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Space summary</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-800">{selectedSpot.name}</h3>
              </div>
              <div className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                {selectedSpot.vibe}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">{selectedSpot.summary}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[20px] border border-[#ebebff] bg-[#faf8ff] p-3">
                <div className="mb-2 flex items-center gap-2 text-violet-600">
                  <Wifi className="h-4 w-4" />
                  Wi‑Fi
                </div>
                <div className="text-xl font-bold text-slate-800">{selectedSpot.wifiQuality}/5</div>
              </div>
              <div className="rounded-[20px] border border-[#ebebff] bg-[#faf8ff] p-3">
                <div className="mb-2 flex items-center gap-2 text-violet-600">
                  <Zap className="h-4 w-4" />
                  Outlets
                </div>
                <div className="text-xl font-bold text-slate-800">{selectedSpot.outlets}/5</div>
              </div>
              <div className="rounded-[20px] border border-[#ebebff] bg-[#faf8ff] p-3">
                <div className="mb-2 flex items-center gap-2 text-violet-600">
                  <Users className="h-4 w-4" />
                  Crowd
                </div>
                <div className="text-xl font-bold text-slate-800">{selectedSpot.busyness}/5</div>
              </div>
              <div className="rounded-[20px] border border-[#ebebff] bg-[#faf8ff] p-3">
                <div className="mb-2 flex items-center gap-2 text-violet-600">
                  <Clock3 className="h-4 w-4" />
                  Open until
                </div>
                <div className="text-xl font-bold text-slate-800">{selectedSpot.openUntil}</div>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#f0e1ff] bg-white/80 p-4 shadow-[0_12px_36px_rgba(167,139,250,0.08)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">OpenStreetMap</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-800">Directions</h3>
              </div>
              <div className="flex items-center gap-1 text-amber-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">{selectedSpot.rating}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-[#ebebff] bg-[#f8f7ff]">
              <iframe
                title={`${selectedSpot.name} map`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedSpot.longitude - 0.004).toFixed(5)}%2C${(selectedSpot.latitude - 0.003).toFixed(5)}%2C${(selectedSpot.longitude + 0.004).toFixed(5)}%2C${(selectedSpot.latitude + 0.003).toFixed(5)}&layer=mapnik&marker=${selectedSpot.latitude.toFixed(5)}%2C${selectedSpot.longitude.toFixed(5)}`}
                className="h-52 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>

          <section className="rounded-[30px] border border-[#f0e1ff] bg-white/80 p-4 shadow-[0_12px_36px_rgba(167,139,250,0.08)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Community reviews</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-800">Student feedback</h3>
              </div>
              <div className="flex items-center gap-1 text-amber-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">{selectedSpot.rating}</span>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {selectedSpot.reviewHighlights.map((highlight) => (
                <span key={highlight} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                  {highlight}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              {visibleReviews.map((review) => (
                <div key={review.id} className="rounded-[20px] border border-[#efe5ff] bg-[#faf8ff] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800">{review.student}</p>
                      <div className="mt-1 flex items-center gap-1 text-amber-600">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star key={index} className={`h-3 w-3 ${index < review.rating ? "fill-current" : "text-slate-300"}`} />
                        ))}
                      </div>
                    </div>
                    <img src={review.photo} alt="Review" className="h-12 w-12 rounded-xl object-cover" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-[#f0e1ff] bg-white/80 p-4 shadow-[0_12px_36px_rgba(167,139,250,0.08)]">
            <div className="mb-4 flex items-center gap-2 text-violet-600">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-lg font-semibold text-slate-800">Leave a review</h3>
            </div>

            <form className="space-y-3" onSubmit={handleReviewSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={reviewForm.name}
                  onChange={(event) => setReviewForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                  className="rounded-2xl border border-[#efe5ff] bg-[#faf8ff] px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))
                  }
                  className="rounded-2xl border border-[#efe5ff] bg-[#faf8ff] px-3 py-2.5 text-sm text-slate-700 outline-none"
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
                className="w-full rounded-2xl border border-[#efe5ff] bg-[#faf8ff] px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />

              <div className="flex items-center gap-2 rounded-2xl border border-dashed border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-700">
                <Camera className="h-4 w-4" />
                <input
                  value={reviewForm.photo}
                  onChange={(event) => setReviewForm((current) => ({ ...current, photo: event.target.value }))}
                  placeholder="Optional photo URL"
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-violet-400 outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400"
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
          <div className="rounded-t-[28px] border border-violet-200 bg-white/90 p-3 shadow-[0_-10px_36px_rgba(139,92,246,0.18)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <MessageSquareText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Study assistant</p>
                  <p className="text-[10px] text-slate-500">Always ready to guide you</p>
                </div>
              </div>
              <button type="button" onClick={() => setChatOpen(false)} className="text-xs text-slate-500">
                Close
              </button>
            </div>

            <div className="mb-3 max-h-44 space-y-2 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === "bot"
                      ? "bg-[#f4f0ff] text-slate-700"
                      : "ml-auto bg-violet-500 text-white"
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
                  className="rounded-full border border-[#efe5ff] bg-[#faf8ff] px-2.5 py-1 text-[11px] text-slate-700"
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-[#efe5ff] bg-[#faf8ff] px-3 py-2">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about quiet places, Wi‑Fi, or reviews"
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={() => handleChatSend()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 text-white"
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
