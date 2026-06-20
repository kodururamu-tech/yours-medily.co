import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Pill, SlidersHorizontal, Compass, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { SearchBar } from "@/components/SearchBar";
import { PharmacyCard } from "@/components/PharmacyCard";
import { UserMenu } from "@/components/UserMenu";
import { useLanguage } from "../hooks/useLanguage";
import { toast } from "sonner";
import { useLocation, CITY_PRESETS } from "../hooks/useLocation";
import { LocationSelector } from "@/components/LocationSelector";
import { FirebaseSetup } from "@/components/FirebaseSetup";
import {
  isFirebaseEnabled,
  searchFirebaseMedicines,
  fetchFirebasePharmacies,
} from "@/lib/firebase";
import { searchPharmacies, BASE_PHARMACIES } from "@/lib/mock-data";

const searchSchema = z.object({
  q: z.string().optional().default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: ({ match }) => ({
    meta: [
      {
        title: match.search.q
          ? `${match.search.q} — Nearby pharmacies | Medily`
          : "Search medicines | Medily",
      },
      {
        name: "description",
        content: "Find which nearby pharmacies have your medicine in stock, with live prices.",
      },
    ],
  }),
  component: SearchPage,
});

type Filter = "all" | "available" | "open";

const PHARMACY_COORDS_OFFSETS: Record<string, { lat: number; lng: number }> = {
  p1: { lat: 0.005, lng: 0.006 }, // ~0.8 km
  p2: { lat: -0.008, lng: 0.01 }, // ~1.3 km
  p3: { lat: 0.012, lng: -0.014 }, // ~2.0 km
  p4: { lat: -0.016, lng: -0.018 }, // ~2.7 km
  p5: { lat: 0.022, lng: 0.024 }, // ~3.6 km
  p6: { lat: -0.028, lng: 0.03 }, // ~4.4 km
};

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function localHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

function getLocalizedAddress(pharmacyId: string, index: number, cityName: string | null): string {
  if (!cityName) return "";
  const preset = CITY_PRESETS.find(
    (c) =>
      c.name.toLowerCase() === cityName.toLowerCase() ||
      cityName.toLowerCase().includes(c.name.toLowerCase()),
  );
  if (preset && preset.addresses[index]) {
    return preset.addresses[index];
  }
  const fallbacks = [
    `${cityName} Main Road`,
    `${cityName} Sector 4`,
    `${cityName} Town Center`,
    `${cityName} Block A`,
    `${cityName} Junction`,
    `${cityName} Tech Park`,
  ];
  return fallbacks[index] || `${cityName} Area`;
}

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"distance" | "price">("distance");
  const { t } = useLanguage();

  const { coords, cityName, locating, detectLocation, setManualLocation } = useLocation();

  const [results, setResults] = useState<any[]>([]);
  const [loadingReal, setLoadingReal] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchPharmacies = async () => {
      setLoadingReal(true);
      try {
        let fbResults = [];
        if (isFirebaseEnabled()) {
          try {
            const basePhs = await fetchFirebasePharmacies();
            if (basePhs.length === 0) {
              // Firebase is configured, but empty/unseeded. Fall back to local mock data.
              console.warn("Firebase database is empty/unseeded. Using offline mock data.");
              fbResults = q ? searchPharmacies(q) : BASE_PHARMACIES;
            } else {
              if (q) {
                fbResults = await searchFirebaseMedicines(q);
                // Fall back to mock search if live search returns 0 pharmacies (unseeded medicines)
                if (fbResults.length === 0) {
                  const mockResults = searchPharmacies(q);
                  if (mockResults.length > 0) {
                    console.warn("Live search returned 0 results. Falling back to mock database.");
                    fbResults = mockResults;
                  }
                }
              } else {
                fbResults = basePhs;
              }
            }
          } catch (firebaseErr) {
            console.warn("Firebase query failed, falling back to local database:", firebaseErr);
            fbResults = q ? searchPharmacies(q) : BASE_PHARMACIES;
          }
        } else {
          // If Firebase is not configured, fall back to mock data
          fbResults = q ? searchPharmacies(q) : BASE_PHARMACIES;
        }

        if (active) {
          if (coords) {
            const mapped = fbResults.map((p, idx) => {
              const offset = PHARMACY_COORDS_OFFSETS[p.id] || { lat: 0, lng: 0 };
              const pharmacyLat = coords.lat + offset.lat;
              const pharmacyLng = coords.lng + offset.lng;
              const calculatedDistance = calculateHaversineDistance(
                coords.lat,
                coords.lng,
                pharmacyLat,
                pharmacyLng,
              );
              const localizedAddress = getLocalizedAddress(p.id, idx, cityName);
              return {
                ...p,
                lat: pharmacyLat,
                lng: pharmacyLng,
                distanceKm: calculatedDistance,
                address: localizedAddress || p.address,
              };
            });
            setResults(mapped);
          } else {
            setResults(fbResults);
          }
        }
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
        toast.error("Failed to load pharmacies. Using offline demo data.");
        if (active) {
          const fallback = q ? searchPharmacies(q) : BASE_PHARMACIES;
          setResults(fallback);
        }
      } finally {
        if (active) setLoadingReal(false);
      }
    };

    fetchPharmacies();

    return () => {
      active = false;
    };
  }, [q, coords, cityName]);

  const filtered = useMemo(() => {
    let r = results;
    if (filter === "available") r = r.filter((p) => p.available);
    if (filter === "open") r = r.filter((p) => p.open);

    if (sort === "distance") {
      r = [...r].sort((a, b) => {
        if (a.available !== b.available) {
          if (a.available !== undefined && b.available !== undefined) {
            return a.available ? -1 : 1;
          }
        }
        return a.distanceKm - b.distanceKm;
      });
    } else if (sort === "price") {
      r = [...r].sort((a, b) => {
        if (a.price === undefined) return 1;
        if (b.price === undefined) return -1;
        return (a.price ?? 0) - (b.price ?? 0);
      });
    }
    return r;
  }, [results, filter, sort]);

  const availableCount = results.filter((r) => r.available).length;
  const pricedResults = results.filter((r) => r.price !== undefined);
  const minPrice = pricedResults.length > 0 ? Math.min(...pricedResults.map((r) => r.price!)) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Top/Left Row: Back Button, Logo, and Quick Controls */}
          <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                to="/"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/70 transition shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link to="/" className="hidden sm:flex items-center gap-2 shrink-0">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-primary-foreground"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  <Pill className="h-4 w-4" />
                </div>
                <span className="font-display text-base sm:text-lg font-semibold">Medily</span>
              </Link>
            </div>

            {/* Quick Action Badges / Controls in mobile (right-aligned in first row) */}
            <div className="flex items-center gap-2 sm:hidden shrink-0">
              <LocationSelector />
              <FirebaseSetup />
              <UserMenu />
            </div>
          </div>

          {/* Geolocation selector & Database selector (hidden on mobile first row, shown on desktop) */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <LocationSelector />
            <FirebaseSetup />
          </div>

          {/* Search Input Bar (full-width on mobile, flex-1 on desktop) */}
          <div className="w-full sm:flex-1 sm:max-w-xl sm:ml-auto">
            <SearchBar
              size="md"
              initial={q}
              onSearch={(nq) => navigate({ to: "/search", search: { q: nq } })}
            />
          </div>

          {/* User Menu on desktop */}
          <div className="hidden sm:block shrink-0">
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <>
          {/* Header */}
          <motion.div
            key={q || "nearest"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <p className="text-sm text-muted-foreground">
              {q ? t("search.showing") : t("search.nearestSub")}
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-1 capitalize">
              {q ? q : t("search.nearestTitle")}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
              {q ? (
                <span>
                  <span className="font-semibold text-foreground">{availableCount}</span>{" "}
                  {t("search.of")} {results.length} {t("search.haveit")}
                </span>
              ) : (
                <span>
                  <span className="font-semibold text-foreground">{results.length}</span> pharmacies
                  near you
                </span>
              )}
              {q && availableCount > 0 && (
                <span>
                  {t("search.from")}{" "}
                  <span className="font-semibold text-foreground">₹{minPrice}</span>
                </span>
              )}
              <span>{t("search.radius")}</span>

              {/* Geolocation Exact Finder */}
              <div className="flex flex-wrap items-center gap-3 w-full mt-2 sm:mt-0 sm:w-auto">
                <button
                  onClick={() => detectLocation(true)}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-60"
                >
                  {locating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Compass className="h-3 w-3" />
                  )}
                  {cityName ? t("gps.shopsIn").replace("{city}", cityName) : t("gps.locate")}
                </button>

                {/* Quick Cities Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Select City:
                  </span>
                  {CITY_PRESETS.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => setManualLocation(city.name, city.coords)}
                      className={`text-xs px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                        cityName?.toLowerCase() === city.name.toLowerCase()
                          ? "bg-primary/10 text-primary border-primary/20 font-semibold"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", t("search.filter.all")],
                  ...(q ? [["available", t("search.filter.available")]] : []),
                  ["open", t("search.filter.open")],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as Filter)}
                  className={`px-4 h-9 rounded-full text-sm font-medium transition cursor-pointer ${
                    filter === key
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="bg-card border border-border rounded-full h-9 px-4 text-sm font-medium outline-none focus:border-primary/40 cursor-pointer"
              >
                <option value="distance">{t("search.sort.distance")}</option>
                {q && <option value="price">{t("search.sort.price")}</option>}
              </select>
            </div>
          </div>

          {/* Results */}
          {loadingReal ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground font-medium">{t("search.scanning")}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <p className="text-muted-foreground">{t("search.nofilter")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((p, i) => (
                <PharmacyCard key={p.id} pharmacy={p} index={i} />
              ))}
            </div>
          )}
        </>
      </main>
    </div>
  );
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="text-center py-24">
      <div
        className="h-16 w-16 mx-auto rounded-2xl flex items-center justify-center text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <Pill className="h-7 w-7" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold">{t("search.empty.title")}</h2>
      <p className="mt-2 text-muted-foreground">{t("search.empty.desc")}</p>
    </div>
  );
}
