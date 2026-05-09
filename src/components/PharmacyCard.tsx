import { Phone, MapPin, Clock, Navigation, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Pharmacy } from "@/lib/mock-data";

export function PharmacyCard({ pharmacy, index }: { pharmacy: Pharmacy; index: number }) {
  const [fav, setFav] = useState(false);
  const { available, price, name, address, phone, distanceKm, hours, open, rating, stock } = pharmacy;

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
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {address} · <span className="font-medium text-foreground">{distanceKm} km</span>
          </p>
        </div>

        <button
          onClick={() => setFav(!fav)}
          aria-label="Favorite"
          className="shrink-0 h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-accent text-accent" : ""}`} />
        </button>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          {available ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/12 text-success text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Available · {stock} in stock
              </span>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground font-display">₹{price}</span>
                <span className="text-xs text-muted-foreground">/ strip</span>
              </div>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
              Not Available
            </span>
          )}
        </div>

        <div className="text-right text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-end gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{hours}</span>
          </div>
          <div className={open ? "text-success font-medium" : "text-destructive font-medium"}>
            {open ? "Open now" : "Closed"}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-border flex gap-2">
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/70 transition-colors"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-full text-primary-foreground text-sm font-semibold transition-transform hover:scale-[1.02]"
          style={{ background: "var(--gradient-hero)" }}
        >
          <Navigation className="h-4 w-4" />
          Directions
        </button>
      </div>
    </motion.article>
  );
}
