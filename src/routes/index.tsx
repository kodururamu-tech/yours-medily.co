import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Pill, MapPin, Zap, ShieldCheck, ArrowRight, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { POPULAR_MEDICINES } from "@/lib/mock-data";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Medily — Find Medicines in Nearby Pharmacies, Instantly" },
      {
        name: "description",
        content:
          "Search any medicine and instantly see availability, prices, distance, and contact info for pharmacies near you.",
      },
      { property: "og:title", content: "Medily — Medicine Availability Checker" },
      { property: "og:description", content: "Real-time medicine availability across nearby pharmacies." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = Route.useNavigate();
  const [recent] = useState<string[]>([]);

  const onSearch = (q: string) => {
    navigate({ to: "/search", search: { q } });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      {/* Nav */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Pill className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Medily</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#why" className="hover:text-foreground transition">Why Medily</a>
          <Link to="/signin" className="hover:text-foreground transition">Sign in</Link>
          <Link to="/signin" className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition">
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-muted-foreground mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Live stock from 2,400+ pharmacies
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-5xl sm:text-7xl font-semibold tracking-tight text-foreground leading-[1.05]"
        >
          Find any medicine,
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            in minutes — not hours.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Stop running shop to shop. Search a medicine and see real-time availability,
          prices, and directions to nearby pharmacies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 max-w-2xl mx-auto"
        >
          <SearchBar onSearch={onSearch} />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Try:</span>
            {POPULAR_MEDICINES.slice(0, 6).map((m) => (
              <button
                key={m}
                onClick={() => onSearch(m)}
                className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-foreground hover:border-primary/40 hover:text-primary transition"
              >
                {m}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="why" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Instant results",
              desc: "Search once, see every nearby pharmacy with live stock in under a second.",
            },
            {
              icon: MapPin,
              title: "Sorted by distance",
              desc: "We show you the closest store with the best price first — saving travel time.",
            },
            {
              icon: ShieldCheck,
              title: "Verified pharmacies",
              desc: "Every listing is a licensed pharmacy with up-to-date inventory and pricing.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]"
            >
              <div className="h-10 w-10 rounded-xl bg-secondary text-primary flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 pb-32">
        <div
          className="rounded-3xl p-10 sm:p-16 text-primary-foreground relative overflow-hidden"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-sm uppercase tracking-widest opacity-80 mb-3">How it works</p>
            <h2 className="text-4xl sm:text-5xl font-semibold leading-tight">
              Three steps between you and your medicine.
            </h2>
            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                ["01", "Search", "Type the medicine name."],
                ["02", "Compare", "See availability, price & distance."],
                ["03", "Go", "Call the pharmacy or get directions."],
              ].map(([n, t, d]) => (
                <div key={n} className="border-t border-white/20 pt-5">
                  <div className="text-xs opacity-70 font-mono mb-2">{n}</div>
                  <div className="text-xl font-semibold">{t}</div>
                  <div className="text-sm opacity-80 mt-1">{d}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => document.querySelector("input")?.focus()}
              className="mt-10 inline-flex items-center gap-2 bg-card text-foreground px-6 h-12 rounded-full font-semibold hover:scale-[1.02] transition-transform"
            >
              Find a medicine now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t border-border">
        <p>© {new Date().getFullYear()} Medily. Care, closer.</p>
        <p className="opacity-70">Demo data shown for preview purposes.</p>
      </footer>
    </div>
  );
}
