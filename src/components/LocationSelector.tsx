import { useState, useRef, useEffect } from "react";
import { MapPin, Compass, ChevronDown, Check, Loader2 } from "lucide-react";
import { useLocation, CITY_PRESETS } from "../hooks/useLocation";
import { useLanguage } from "../hooks/useLanguage";

export function LocationSelector() {
  const { coords, cityName, locating, detectLocation, setManualLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDetect = async () => {
    await detectLocation(true);
    setIsOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-medium hover:border-primary/40 transition hover:bg-secondary/40 cursor-pointer text-foreground"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="max-w-[120px] truncate">{cityName || t("location.select")}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-card border border-border p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={handleDetect}
            disabled={locating}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-secondary/60 text-sm font-medium text-left text-foreground cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center gap-2">
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Compass className="h-4 w-4 text-primary" />
              )}
              <span>{t("location.detect")}</span>
            </div>
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">
              {t("location.gps")}
            </span>
          </button>

          <div className="my-1.5 border-t border-border" />

          <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("location.popular")}
          </div>

          <div className="max-h-56 overflow-y-auto mt-1 space-y-0.5 pr-1">
            {CITY_PRESETS.map((city) => {
              const isSelected = cityName === city.name;
              return (
                <button
                  key={city.name}
                  onClick={() => {
                    setManualLocation(city.name, city.coords);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition text-left cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{city.name}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
