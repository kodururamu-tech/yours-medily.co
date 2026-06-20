export type Pharmacy = {
  id: string;
  name: string;
  address: string;
  phone: string;
  distanceKm: number;
  hours: string;
  open: boolean;
  rating: number;
  available: boolean;
  price?: number;
  stock?: number;
  lat?: number;
  lng?: number;
};

export const POPULAR_MEDICINES = [
  "Paracetamol",
  "Ibuprofen",
  "Amoxicillin",
  "Cetirizine",
  "Azithromycin",
  "Metformin",
  "Pantoprazole",
  "Aspirin",
];

export const BASE_PHARMACIES: Omit<Pharmacy, "available" | "price" | "stock">[] = [
  {
    id: "p1",
    name: "Apollo Pharmacy",
    address: "MG Road, Sector 14",
    phone: "+91 98765 43210",
    distanceKm: 1.2,
    hours: "8:00 AM – 11:00 PM",
    open: true,
    rating: 4.7,
  },
  {
    id: "p2",
    name: "MedPlus",
    address: "Park Street, Block B",
    phone: "+91 98123 45678",
    distanceKm: 2.0,
    hours: "24 hours",
    open: true,
    rating: 4.5,
  },
  {
    id: "p3",
    name: "Netmeds Local",
    address: "Lake View Road",
    phone: "+91 90000 11122",
    distanceKm: 2.6,
    hours: "9:00 AM – 10:00 PM",
    open: true,
    rating: 4.3,
  },
  {
    id: "p4",
    name: "Wellness Forever",
    address: "Crown Plaza, 2nd Ave",
    phone: "+91 99887 76655",
    distanceKm: 3.4,
    hours: "8:00 AM – 12:00 AM",
    open: true,
    rating: 4.6,
  },
  {
    id: "p5",
    name: "Guardian Pharmacy",
    address: "Hill Road Junction",
    phone: "+91 91234 56789",
    distanceKm: 4.1,
    hours: "10:00 AM – 9:00 PM",
    open: false,
    rating: 4.2,
  },
  {
    id: "p6",
    name: "1mg Express",
    address: "Tech Park Gate 3",
    phone: "+91 93456 12345",
    distanceKm: 4.8,
    hours: "9:00 AM – 11:00 PM",
    open: true,
    rating: 4.8,
  },
];

// Deterministic pseudo-random based on string
function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function searchPharmacies(query: string): Pharmacy[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return BASE_PHARMACIES.map((p) => {
    const seed = hash(q + p.id);
    const available = seed % 5 !== 0; // ~80% chance
    const basePrice = 15 + (hash(q) % 80);
    const variance = (seed % 12) - 6;
    return {
      ...p,
      available,
      price: available ? Math.max(8, basePrice + variance) : undefined,
      stock: available ? 5 + (seed % 60) : 0,
    };
  }).sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return a.distanceKm - b.distanceKm;
  });
}
