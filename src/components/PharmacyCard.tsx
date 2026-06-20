import { Phone, MapPin, Clock, Navigation, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Pharmacy } from "@/lib/mock-data";
import { POPULAR_MEDICINES } from "@/lib/mock-data";
import { useLanguage } from "../hooks/useLanguage";
import { useLocation } from "../hooks/useLocation";
import { useNavigate } from "@tanstack/react-router";

export function PharmacyCard({ pharmacy, index }: { pharmacy: Pharmacy; index: number }) {
  const [fav, setFav] = useState(false);
  const {
    available,
    price,
    name,
    address,
    phone,
    distanceKm,
    hours,
    open,
    rating,
    stock,
    lat,
    lng,
  } = pharmacy;
  const { t } = useLanguage();
  const { coords: userCoords } = useLocation();
  const navigate = useNavigate();

  // Generate deterministic in-stock medicines for preview if available is undefined
  const getMockMedicines = () => {
    const list = POPULAR_MEDICINES.slice(0, 4);
    return list
      .map((med) => {
        const docId = med.toLowerCase();
        const phIndex = parseInt(pharmacy.id.replace("p", "")) || 0;
        const seed = docId.charCodeAt(0) + docId.charCodeAt(docId.length - 1) + phIndex;
        const isAvail = seed % 5 !== 0;
        const mockPrice = 15 + (seed % 80);
        return {
          name: med,
          available: isAvail,
          price: mockPrice,
        };
      })
      .filter((m) => m.available);
  };

  const mockMeds = getMockMedicines();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-semibold text-foreground truncate">{name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span>{rating}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{address}</span> ·{" "}
            <span className="font-medium text-foreground whitespace-nowrap">{distanceKm} km</span>
          </p>
        </div>

        <button
          onClick={() => setFav(!fav)}
          aria-label="Favorite"
          className="shrink-0 h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-accent transition-colors cursor-pointer"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-accent text-accent" : ""}`} />
        </button>
      </div>

      <div className="mt-5 border-t border-border/40 pt-4 flex flex-col gap-4">
        {available !== undefined ? (
          <div className="flex items-end justify-between gap-4">
            <div>
              {available ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/12 text-success text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    {t("card.available")} · {stock} {t("card.stock")}
                  </span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground font-display">
                      ₹{price}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {t("card.strip")}</span>
                  </div>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                  {t("card.notAvailable")}
                </span>
              )}
            </div>

            <div className="text-right text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-end gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{hours}</span>
              </div>
              <div className={open ? "text-success font-medium" : "text-destructive font-medium"}>
                {open ? t("card.opennow") : t("card.closed")}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{hours}</span>
              </div>
              <div className={open ? "text-success font-medium" : "text-destructive font-medium"}>
                {open ? t("card.opennow") : t("card.closed")}
              </div>
            </div>

            <div className="mt-1">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {t("card.inStockMeds")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mockMeds.map((med) => (
                  <button
                    key={med.name}
                    onClick={() => navigate({ to: "/search", search: { q: med.name } })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium text-foreground cursor-pointer border border-border"
                  >
                    <span>{med.name}</span>
                    <span className="text-[10px] text-muted-foreground">₹{med.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-border flex gap-2">
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/70 transition-colors"
        >
          <Phone className="h-4 w-4" />
          {t("card.call")}
        </a>
        <button
          onClick={() => {
            const dest = lat && lng ? `${lat},${lng}` : encodeURIComponent(`${name}, ${address}`);
            const origin = userCoords ? `${userCoords.lat},${userCoords.lng}` : "";
            const url = origin
              ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
              : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-full text-primary-foreground text-sm font-semibold transition-transform hover:scale-[1.02] cursor-pointer"
          style={{ background: "var(--gradient-hero)" }}
        >
          <Navigation className="h-4 w-4" />
          {t("card.directions")}
        </button>
      </div>
    </motion.article>
  );
}
