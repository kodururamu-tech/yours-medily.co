import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

// Retrieve config from local storage or environment variables
export function getFirebaseConfig(): FirebaseConfig | null {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("firebase_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse firebase_config from localStorage:", e);
      }
    }
  }

  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig as FirebaseConfig;
  }

  return null;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

const config = getFirebaseConfig();
if (config) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    if (typeof window !== "undefined" && config.measurementId) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

export { app, auth, db, analytics };
export const isFirebaseConfigured = !!app && !!auth && !!db;

export function isFirebaseEnabled(): boolean {
  return isFirebaseConfigured;
}

// Seeding Firestore database with mock data if configured but empty
export async function seedFirebase() {
  if (!db) return false;

  try {
    // Check if pharmacies collection is empty
    const phSnapshot = await getDocs(collection(db, "pharmacies"));
    if (!phSnapshot.empty) {
      console.log("Firebase database already seeded.");
      return false; // already seeded
    }

    console.log("Seeding Firebase database...");
    const batch = writeBatch(db);

    const BASE_PHARMACIES = [
      {
        id: "p1",
        name: "Apollo Pharmacy",
        address: "MG Road, Sector 14",
        phone: "+91 98765 43210",
        distanceKm: 1.2,
        hours: "8:00 AM – 11:00 PM",
        open: true,
        rating: 4.7,
        lat: 28.47,
        lng: 77.08,
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
        lat: 28.46,
        lng: 77.09,
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
        lat: 28.48,
        lng: 77.07,
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
        lat: 28.45,
        lng: 77.06,
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
        lat: 28.49,
        lng: 77.1,
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
        lat: 28.44,
        lng: 77.11,
      },
    ];

    // Seed pharmacies
    for (const ph of BASE_PHARMACIES) {
      const phRef = doc(db, "pharmacies", ph.id);
      batch.set(phRef, ph);
    }

    // Seed medicines
    const POPULAR_MEDICINES = [
      { name: "Paracetamol", desc: "Common painkiller and temperature reducer" },
      { name: "Ibuprofen", desc: "Anti-inflammatory pain reliever" },
      { name: "Amoxicillin", desc: "Antibiotic used to treat bacterial infections" },
      { name: "Cetirizine", desc: "Antihistamine used to treat allergies" },
      { name: "Azithromycin", desc: "Common antibiotic for throat and lung infections" },
      { name: "Metformin", desc: "Medication used to treat type 2 diabetes" },
      { name: "Pantoprazole", desc: "Proton pump inhibitor that reduces stomach acid" },
      { name: "Aspirin", desc: "Blood thinner and pain reliever" },
    ];

    for (const med of POPULAR_MEDICINES) {
      const docId = med.name.toLowerCase();
      const medRef = doc(db, "medicines", docId);

      // Generate simulated availability mapping for each pharmacy
      const availability: Record<string, { price: number; stock: number; available: boolean }> = {};

      BASE_PHARMACIES.forEach((ph, index) => {
        const hash = docId.charCodeAt(0) + docId.charCodeAt(docId.length - 1) + index;
        const available = hash % 5 !== 0; // ~80% availability
        const price = 15 + (hash % 80);
        const stock = available ? 5 + (hash % 60) : 0;
        availability[ph.id] = {
          price: available ? price : 0,
          stock,
          available,
        };
      });

      batch.set(medRef, {
        name: med.name,
        description: med.desc,
        availability,
      });
    }

    await batch.commit();
    console.log("Firebase seeding complete!");
    return true;
  } catch (error) {
    console.error("Error seeding Firebase:", error);
    return false;
  }
}

// Function to search medicine in Firebase and return list of pharmacies with price & stock info
export async function searchFirebaseMedicines(query: string) {
  if (!db) return [];

  const q = query.trim().toLowerCase();
  if (!q) return [];

  try {
    // 1. Fetch all pharmacies first to get their base details
    const phSnapshot = await getDocs(collection(db, "pharmacies"));
    const pharmaciesMap: Record<string, any> = {};
    phSnapshot.forEach((doc) => {
      pharmaciesMap[doc.id] = doc.data();
    });

    // 2. Fetch the medicine document from Firestore
    // We try to match exactly first
    let medDocRef = doc(db, "medicines", q);
    let medDocSnap = await getDoc(medDocRef);

    // If exact document doesn't exist, search the medicines collection for partial match
    let medicineData: any = null;
    if (medDocSnap.exists()) {
      medicineData = medDocSnap.data();
    } else {
      const medSnapshot = await getDocs(collection(db, "medicines"));
      medSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name.toLowerCase().includes(q)) {
          medicineData = data;
        }
      });
    }

    if (!medicineData) {
      return [];
    }

    // 3. Map medicine availability to pharmacy details
    const results: any[] = [];
    const availability = medicineData.availability || {};

    Object.keys(pharmaciesMap).forEach((phId) => {
      const ph = pharmaciesMap[phId];
      const av = availability[phId] || { available: false, price: 0, stock: 0 };

      results.push({
        ...ph,
        available: av.available,
        price: av.available ? av.price : undefined,
        stock: av.stock,
      });
    });

    return results.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return a.distanceKm - b.distanceKm;
    });
  } catch (error) {
    console.error("Error searching in Firebase:", error);
    throw error;
  }
}
