import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type LocationContextType = {
  coords: Coordinates | null;
  cityName: string | null;
  locating: boolean;
  detectLocation: (useGps?: boolean, silent?: boolean) => Promise<void>;
  setManualLocation: (cityName: string, coords: Coordinates) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Preset coordinates and local details for top cities
export const CITY_PRESETS = [
  {
    name: "Bengaluru",
    coords: { lat: 12.9716, lng: 77.5946 },
    addresses: [
      "Indiranagar 100 Feet Rd",
      "Koramangala 4th Block",
      "Whitefield",
      "Jayanagar 3rd Block",
      "HSR Layout Sector 2",
      "Malleshwaram 15th Cross",
    ],
  },
  {
    name: "Mumbai",
    coords: { lat: 19.0596, lng: 72.8295 },
    addresses: [
      "Bandra West",
      "Andheri Link Road",
      "Colaba Causeway",
      "Juhu Tara Road",
      "Powai Central",
      "Dadar West",
    ],
  },
  {
    name: "Delhi NCR",
    coords: { lat: 28.4595, lng: 77.0266 },
    addresses: [
      "MG Road, Sector 14",
      "Connaught Place",
      "Saket Block A",
      "Vasant Kunj Phase 2",
      "Noida Sector 62",
      "Dwarka Sector 10",
    ],
  },
  {
    name: "Kolkata",
    coords: { lat: 22.5726, lng: 88.3639 },
    addresses: [
      "Park Street, Block B",
      "Lake View Road",
      "Salt Lake Sector V",
      "Gariahat Crossing",
      "Ballygunge Circular Rd",
      "New Town Action Area 1",
    ],
  },
  {
    name: "Chennai",
    coords: { lat: 13.0012, lng: 80.2565 },
    addresses: [
      "Adyar",
      "T. Nagar G.N. Chetty Rd",
      "Velachery Main Rd",
      "Mylapore High Rd",
      "Nungambakkam",
      "Anna Nagar West",
    ],
  },
  {
    name: "Hyderabad",
    coords: { lat: 17.385, lng: 78.4867 },
    addresses: [
      "Gachibowli",
      "Jubilee Hills Rd 36",
      "Madhapur Hitec City",
      "Banjara Hills Rd 1",
      "Kondapur",
      "Secunderabad Club Rd",
    ],
  },
  {
    name: "Pune",
    coords: { lat: 18.5204, lng: 73.8567 },
    addresses: [
      "Koregaon Park Lane 6",
      "Kothrud Depot Rd",
      "Viman Nagar",
      "Hinjewadi Phase 1",
      "Baner Road",
      "Deccan Gymkhana",
    ],
  },
];

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Detect location via IP (fast, zero-prompt) with multiple API fallbacks
  const detectLocationByIp = async () => {
    // 1. Try ipapi.co
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const newCoords = { lat: data.latitude, lng: data.longitude };
          setCoords(newCoords);
          setCityName(data.city || "Nearby");
          localStorage.setItem("medily_coords", JSON.stringify(newCoords));
          localStorage.setItem("medily_city", data.city || "Nearby");
          return true;
        }
      }
    } catch (e) {
      console.warn("Failed to get location by ipapi.co, trying backup API...", e);
    }

    // 2. Try freeipapi.com (backup)
    try {
      const res = await fetch("https://freeipapi.com/api/json");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const newCoords = { lat: data.latitude, lng: data.longitude };
          setCoords(newCoords);
          setCityName(data.cityName || "Nearby");
          localStorage.setItem("medily_coords", JSON.stringify(newCoords));
          localStorage.setItem("medily_city", data.cityName || "Nearby");
          return true;
        }
      }
    } catch (e) {
      console.warn("Failed to get location by backup freeipapi.com:", e);
    }
    return false;
  };

  const detectLocation = async (useGps = false, silent = false) => {
    setLocating(true);

    // If user explicitly requests GPS
    if (useGps && navigator.geolocation) {
      return new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const newCoords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCoords(newCoords);

            // Try to reverse geocode city name
            try {
              const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${newCoords.lat}&longitude=${newCoords.lng}&localityLanguage=en`,
              );
              const data = await res.json();

              // Build precise location name combining locality and city
              const name =
                data.locality && data.city && data.locality !== data.city
                  ? `${data.locality}, ${data.city}`
                  : data.locality || data.city || "Current Location";

              setCityName(name);
              localStorage.setItem("medily_coords", JSON.stringify(newCoords));
              localStorage.setItem("medily_city", name);
            } catch {
              setCityName("Current Location");
              localStorage.setItem("medily_coords", JSON.stringify(newCoords));
              localStorage.setItem("medily_city", "Current Location");
            }

            setLocating(false);
            if (!silent) {
              toast.success("Successfully set location using GPS!");
            }
            resolve();
          },
          async (error) => {
            console.error("GPS error:", error);
            if (!silent) {
              let msg = "Could not get GPS location.";
              if (error.code === error.PERMISSION_DENIED) {
                msg = "Location access denied. Please allow permissions or select a city.";
              }
              toast.error(msg);
            }

            // Fallback to IP if GPS fails
            await detectLocationByIp();
            setLocating(false);
            resolve();
          },
          { enableHighAccuracy: true, timeout: 6000 },
        );
      });
    }

    // Default fast detection using IP
    const success = await detectLocationByIp();
    if (!success) {
      // Final fallback to Delhi NCR if everything fails
      const fallbackPreset = CITY_PRESETS[2];
      setCoords(fallbackPreset.coords);
      setCityName(fallbackPreset.name);
      localStorage.setItem("medily_coords", JSON.stringify(fallbackPreset.coords));
      localStorage.setItem("medily_city", fallbackPreset.name);
    }
    setLocating(false);
  };

  useEffect(() => {
    // Automatically detect location on first load, trying GPS first silently
    const storedCoords = localStorage.getItem("medily_coords");
    const storedCity = localStorage.getItem("medily_city");
    if (storedCoords && storedCity) {
      try {
        setCoords(JSON.parse(storedCoords));
        setCityName(storedCity);
      } catch {
        detectLocation(true, true);
      }
    } else {
      detectLocation(true, true);
    }
  }, []);

  const setManualLocation = (name: string, newCoords: Coordinates) => {
    setCoords(newCoords);
    setCityName(name);
    try {
      localStorage.setItem("medily_coords", JSON.stringify(newCoords));
      localStorage.setItem("medily_city", name);
    } catch {
      // ignore
    }
    toast.success(`Location set to ${name}`);
  };

  return (
    <LocationContext.Provider
      value={{ coords, cityName, locating, detectLocation, setManualLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
