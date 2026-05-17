import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Pill, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SearchBar } from "@/components/SearchBar";
import { PharmacyCard } from "@/components/PharmacyCard";
import { UserMenu } from "@/components/UserMenu";
import { searchPharmacies } from "@/lib/mock-data";

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

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"distance" | "price">("distance");

  const results = useMemo(() => searchPharmacies(q || ""), [q]);

  const filtered = useMemo(() => {
    let r = results;
    if (filter === "available") r = r.filter((p) => p.available);
    if (filter === "open") r = r.filter((p) => p.open);
    if (sort === "price") {
      r = [...r].sort((a, b) => {
        if (!a.available) return 1;
        if (!b.available) return -1;
        return (a.price ?? 0) - (b.price ?? 0);
      });
    }
    return r;
  }, [results, filter, sort]);

  const availableCount = results.filter((r) => r.available).length;
  const minPrice = Math.min(...results.filter((r) => r.price).map((r) => r.price!));

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/70 transition shrink-0"
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
            <span className="font-display text-lg font-semibold">Medily</span>
          </Link>
          <div className="flex-1 max-w-2xl ml-auto">
            <SearchBar
              size="md"
              initial={q}
              onSearch={(nq) => navigate({ to: "/search", search: { q: nq } })}
            />
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {!q ? (
          <EmptyState />
        ) : (
          <>
            {/* Header */}
            <motion.div
              key={q}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <p className="text-sm text-muted-foreground">Showing results for</p>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-1 capitalize">
                {q}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">{availableCount}</span> of{" "}
                  {results.length} pharmacies have it
                </span>
                {availableCount > 0 && (
                  <span>
                    From <span className="font-semibold text-foreground">₹{minPrice}</span>
                  </span>
                )}
                <span>Within 5 km radius</span>
              </div>
            </motion.div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-2 justify-between">
              <div className="flex flex-wrap gap-2">
                {([
                  ["all", "All"],
                  ["available", "Available only"],
                  ["open", "Open now"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 h-9 rounded-full text-sm font-medium transition ${
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
                  className="bg-card border border-border rounded-full h-9 px-4 text-sm font-medium outline-none focus:border-primary/40"
                >
                  <option value="distance">Sort: Distance</option>
                  <option value="price">Sort: Price</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <p className="text-muted-foreground">No pharmacies match these filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filtered.map((p, i) => (
                  <PharmacyCard key={p.id} pharmacy={p} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div
        className="h-16 w-16 mx-auto rounded-2xl flex items-center justify-center text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <Pill className="h-7 w-7" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold">Search a medicine to begin</h2>
      <p className="mt-2 text-muted-foreground">Type the name in the search bar above.</p>
    </div>
  );
}
