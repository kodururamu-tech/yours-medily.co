import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Pill, MapPin, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { UserMenu } from "@/components/UserMenu";
import { POPULAR_MEDICINES } from "@/lib/mock-data";
import { useLanguage } from "../hooks/useLanguage";
import { LocationSelector } from "@/components/LocationSelector";

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
  const { t } = useLanguage();
  const [recent] = useState<string[]>([]);

  const onSearch = (q: string) => {
    navigate({ to: "/search", search: { q } });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      {/* Nav */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Pill className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Medily</span>
          </Link>
          <LocationSelector />
        </div>
        <nav className="hidden sm:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition">{t("nav.how")}</a>
          <a href="#why" className="hover:text-foreground transition">{t("nav.why")}</a>
          <UserMenu />
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
          {t("hero.livestock")}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-5xl sm:text-7xl font-semibold tracking-tight text-foreground leading-[1.05]"
        >
          {t("hero.title1")}
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            {t("hero.title2")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 max-w-2xl mx-auto"
        >
          <SearchBar onSearch={onSearch} />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">{t("hero.try")}</span>
            {POPULAR_MEDICINES.slice(0, 6).map((m) => (
              <button
                key={m}
                onClick={() => onSearch(m)}
                className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-foreground hover:border-primary/40 hover:text-primary transition cursor-pointer"
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
              title: t("features.instant.title"),
              desc: t("features.instant.desc"),
            },
            {
              icon: MapPin,
              title: t("features.distance.title"),
              desc: t("features.distance.desc"),
            },
            {
              icon: ShieldCheck,
              title: t("features.verified.title"),
              desc: t("features.verified.desc"),
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
            <p className="text-sm uppercase tracking-widest opacity-80 mb-3">{t("nav.how")}</p>
            <h2 className="text-4xl sm:text-5xl font-semibold leading-tight">
              {t("how.title")}
            </h2>
            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                ["01", t("how.step1.title"), t("how.step1.desc")],
                ["02", t("how.step2.title"), t("how.step2.desc")],
                ["03", t("how.step3.title"), t("how.step3.desc")],
              ].map(([n, tVal, d]) => (
                <div key={n} className="border-t border-white/20 pt-5">
                  <div className="text-xs opacity-70 font-mono mb-2">{n}</div>
                  <div className="text-xl font-semibold">{tVal}</div>
                  <div className="text-sm opacity-80 mt-1">{d}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => document.querySelector("input")?.focus()}
              className="mt-10 inline-flex items-center gap-2 bg-card text-foreground px-6 h-12 rounded-full font-semibold hover:scale-[1.02] transition-transform cursor-pointer"
            >
              {t("how.findBtn")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t border-border">
        <p>© {new Date().getFullYear()} {t("footer.care")}</p>
        <p className="opacity-70">{t("footer.demo")}</p>
      </footer>
    </div>
  );
}
