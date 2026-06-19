import { FirebaseApp, initializeApp, getApps, getApp } from "firebase/app";
import {
  Auth,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import {
  Firestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";

// Types for Firebase integration
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string | Date | Timestamp; // Date, Timestamp or number
  location: { country: string; region: string };
  onboardingComplete: boolean;
}

export interface FootprintProfile {
  homeType: "apartment" | "house_small" | "house_large";
  householdSize: number;
  heatingFuel: "electric" | "gas" | "oil" | "other";
  primaryCommute: "car_solo" | "carpool" | "public_transit" | "bike_walk" | "wfh";
  commuteDistanceKm: number;
  dietPattern: "meat_heavy" | "meat_moderate" | "vegetarian" | "vegan";
  flightsPerYear: number;
  shoppingLevel: "minimal" | "moderate" | "high";
  updatedAt: string | Date | Timestamp;
}

export interface FootprintHistory {
  id?: string;
  date: string | Date | Timestamp;
  totalCO2e: number;
  breakdown: { home: number; transport: number; food: number; shopping: number };
}

export interface Habit {
  id: string;
  title: string;
  category: "home" | "transport" | "food" | "shopping";
  estAnnualSavingsKg: number;
  effortWeight: number;
  status: "suggested" | "active" | "completed" | "dismissed";
  streakCount: number;
  lastCheckedInAt: string | Date | null;
  createdAt: string | Date;
  freezeUsedDates?: string[];
}

export interface CheckIn {
  id?: string;
  habitId: string;
  date: string | Date | Timestamp;
  completed: boolean;
}

export const toDate = (val: string | Date | Timestamp): Date => {
  if (val instanceof Date) return val;
  if (typeof val === "string") return new Date(val);
  if (val instanceof Timestamp) return val.toDate();
  return new Date(val as unknown as string);
};

export class MockFirebaseError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message || code);
    this.name = "FirebaseError";
    this.code = code;
  }
}

// ----------------------------------------------------
// Setup Firebase configuration
// ----------------------------------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let isMockEnabled =
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.startsWith("mock-") ||
  firebaseConfig.apiKey === "your-api-key";

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (!isMockEnabled) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully in production mode.");
  } catch (error) {
    console.error("Firebase failed to initialize. Falling back to Mock Mode.", error);
    isMockEnabled = true;
  }
} else {
  console.log("Running in EcoTrack Mock Mode (offline storage).");
}

// ----------------------------------------------------
// MOCK STATE & LOCAL STORAGE HELPER
// ----------------------------------------------------
const getLocalData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T) : defaultValue;
};

const setLocalData = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

interface StoredMockUser {
  uid: string;
  email: string;
  displayName: string;
  password?: string;
}

// Mock listeners registry
const mockListeners: ((user: UserProfile | null) => void)[] = [];
let mockCurrentUser: UserProfile | null = null;

// Populate initial mock state if empty
if (typeof window !== "undefined" && !localStorage.getItem("ecotrack_users")) {
  localStorage.setItem("ecotrack_users", JSON.stringify({}));
  localStorage.setItem("ecotrack_profiles", JSON.stringify({}));
  localStorage.setItem("ecotrack_history", JSON.stringify({}));
  localStorage.setItem("ecotrack_habits", JSON.stringify({}));
  localStorage.setItem("ecotrack_checkins", JSON.stringify({}));
}

// ----------------------------------------------------
// REPOSITORY EXPORTS
// ----------------------------------------------------

export const isMockMode = () => isMockEnabled;

// Auth API
export const registerUser = async (email: string, password: string, displayName: string): Promise<UserProfile> => {
  if (isMockEnabled) {
    // Simulate register
    const users = getLocalData<Record<string, StoredMockUser>>("ecotrack_users", {});
    const uid = "mock_user_" + Date.now();
    if (Object.values(users).some((u) => u.email === email)) {
      throw new MockFirebaseError("auth/email-already-in-use");
    }
    const profile: UserProfile = {
      uid,
      email,
      displayName,
      createdAt: new Date().toISOString(),
      location: { country: "US", region: "CA" },
      onboardingComplete: false
    };
    users[uid] = { uid, email, displayName, password };
    setLocalData("ecotrack_users", users);
    
    // Save profile doc
    const profiles = getLocalData<Record<string, UserProfile>>("ecotrack_profiles", {});
    profiles[uid] = profile;
    setLocalData("ecotrack_profiles", profiles);

    // Set mock user
    mockCurrentUser = profile;
    mockListeners.forEach(cb => cb(profile));
    return profile;
  } else {
    try {
      const cred = await createUserWithEmailAndPassword(auth!, email, password);
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName,
        createdAt: new Date(),
        location: { country: "US", region: "CA" }, // default
        onboardingComplete: false
      };
      // Save to Firestore
      await setDoc(doc(db!, "users", cred.user.uid), profile);
      return profile;
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === "unavailable" || err.message?.includes("offline") || err.message?.includes("network")) {
        console.warn("Firestore register unavailable, falling back to mock:", err);
        isMockEnabled = true;
        return registerUser(email, password, displayName);
      }
      throw error;
    }
  }
};

export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  if (isMockEnabled) {
    const users = getLocalData<Record<string, StoredMockUser>>("ecotrack_users", {});
    const userMatch = Object.values(users).find((u) => u.email === email && u.password === password);
    if (!userMatch) {
      throw new MockFirebaseError("auth/invalid-credential");
    }
    const profiles = getLocalData<Record<string, UserProfile>>("ecotrack_profiles", {});
    const profile = profiles[userMatch.uid];
    
    mockCurrentUser = profile;
    mockListeners.forEach(cb => cb(profile));
    return profile;
  } else {
    try {
      const cred = await signInWithEmailAndPassword(auth!, email, password);
      const docRef = doc(db!, "users", cred.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      // Fallback if profile doesn't exist
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split("@")[0],
        createdAt: new Date(),
        location: { country: "US", region: "CA" },
        onboardingComplete: false
      };
      await setDoc(doc(db!, "users", cred.user.uid), profile);
      return profile;
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === "unavailable" || err.message?.includes("offline") || err.message?.includes("network")) {
        console.warn("Firestore login unavailable, falling back to mock:", err);
        isMockEnabled = true;
        return loginUser(email, password);
      }
      throw error;
    }
  }
};

export const loginWithGoogle = async (): Promise<UserProfile> => {
  if (isMockEnabled) {
    const profile: UserProfile = {
      uid: "mock_google_user",
      email: "googleuser@example.com",
      displayName: "Google Explorer",
      createdAt: new Date().toISOString(),
      location: { country: "US", region: "CA" },
      onboardingComplete: false
    };
    const profiles = getLocalData<Record<string, UserProfile>>("ecotrack_profiles", {});
    profiles["mock_google_user"] = profile;
    setLocalData("ecotrack_profiles", profiles);

    mockCurrentUser = profile;
    mockListeners.forEach(cb => cb(profile));
    return profile;
  } else {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth!, provider);
      const docRef = doc(db!, "users", cred.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || "",
        displayName: cred.user.displayName || "Eco Traveler",
        createdAt: new Date(),
        location: { country: "US", region: "CA" },
        onboardingComplete: false
      };
      await setDoc(doc(db!, "users", cred.user.uid), profile);
      return profile;
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === "unavailable" || err.message?.includes("offline") || err.message?.includes("network")) {
        console.warn("Google Sign-In unavailable, falling back to mock:", err);
        isMockEnabled = true;
        return loginWithGoogle();
      }
      throw error;
    }
  }
};

export const logoutUser = async (): Promise<void> => {
  if (isMockEnabled) {
    mockCurrentUser = null;
    mockListeners.forEach(cb => cb(null));
  } else {
    try {
      await signOut(auth!);
    } catch (e) {
      console.warn("Error during signout, falling back to mock:", e);
      isMockEnabled = true;
      await logoutUser();
    }
  }
};

export const onAuthStateChange = (callback: (user: UserProfile | null) => void): (() => void) => {
  if (isMockEnabled) {
    mockListeners.push(callback);
    callback(mockCurrentUser);
    return () => {
      const idx = mockListeners.indexOf(callback);
      if (idx > -1) mockListeners.splice(idx, 1);
    };
  } else {
    try {
      return onAuthStateChanged(auth!, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const docRef = doc(db!, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              callback(docSnap.data() as UserProfile);
            } else {
              callback(null);
            }
          } catch (e) {
            console.warn("Firestore error in onAuthStateChange inner query, falling back to mock:", e);
            isMockEnabled = true;
            mockCurrentUser = null;
            callback(null);
          }
        } else {
          callback(null);
        }
      });
    } catch (e) {
      console.warn("Error in onAuthStateChange wrapper, falling back to mock:", e);
      isMockEnabled = true;
      return onAuthStateChange(callback);
    }
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  if (isMockEnabled) {
    const profiles = getLocalData<Record<string, UserProfile>>("ecotrack_profiles", {});
    if (profiles[uid]) {
      profiles[uid] = { ...profiles[uid], ...updates };
      setLocalData("ecotrack_profiles", profiles);
      if (mockCurrentUser && mockCurrentUser.uid === uid) {
        mockCurrentUser = profiles[uid];
        mockListeners.forEach(cb => cb(mockCurrentUser));
      }
    }
  } else {
    try {
      const docRef = doc(db!, "users", uid);
      await updateDoc(docRef, updates);
    } catch (e) {
      console.warn("Firestore error in updateUserProfile, falling back to mock:", e);
      isMockEnabled = true;
      await updateUserProfile(uid, updates);
    }
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (isMockEnabled) {
    const profiles = getLocalData<Record<string, UserProfile>>("ecotrack_profiles", {});
    return profiles[uid] || null;
  } else {
    try {
      const docRef = doc(db!, "users", uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (e) {
      console.warn("Firestore error in getUserProfile, falling back to mock:", e);
      isMockEnabled = true;
      return getUserProfile(uid);
    }
  }
};

// ----------------------------------------------------
// Firestore: users/{userId}/footprintProfile/current
// ----------------------------------------------------
export const getFootprintProfile = async (uid: string): Promise<FootprintProfile | null> => {
  if (isMockEnabled) {
    const profiles = getLocalData<Record<string, FootprintProfile>>("ecotrack_footprint_profiles", {});
    return profiles[uid] || null;
  } else {
    try {
      const docRef = doc(db!, "users", uid, "footprintProfile", "current");
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as FootprintProfile) : null;
    } catch (e) {
      console.warn("Firestore error in getFootprintProfile, falling back to mock:", e);
      isMockEnabled = true;
      return getFootprintProfile(uid);
    }
  }
};

export const saveFootprintProfile = async (uid: string, profile: FootprintProfile): Promise<void> => {
  if (isMockEnabled) {
    const profiles = getLocalData<Record<string, FootprintProfile>>("ecotrack_footprint_profiles", {});
    profiles[uid] = { ...profile, updatedAt: new Date().toISOString() };
    setLocalData("ecotrack_footprint_profiles", profiles);
  } else {
    try {
      const docRef = doc(db!, "users", uid, "footprintProfile", "current");
      await setDoc(docRef, {
        ...profile,
        updatedAt: Timestamp.now()
      });
    } catch (e) {
      console.warn("Firestore error in saveFootprintProfile, falling back to mock:", e);
      isMockEnabled = true;
      await saveFootprintProfile(uid, profile);
    }
  }
};

// ----------------------------------------------------
// Firestore: users/{userId}/footprintHistory/{snapshotId}
// ----------------------------------------------------
export const getFootprintHistory = async (uid: string): Promise<FootprintHistory[]> => {
  if (isMockEnabled) {
    const historyMap = getLocalData<Record<string, FootprintHistory[]>>("ecotrack_history", {});
    const list = historyMap[uid] || [];
    return list.sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());
  } else {
    try {
      const collRef = collection(db!, "users", uid, "footprintHistory");
      const q = query(collRef, orderBy("date", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
          totalCO2e: data.totalCO2e,
          breakdown: data.breakdown
        } as FootprintHistory;
      });
    } catch (e) {
      console.warn("Firestore error in getFootprintHistory, falling back to mock:", e);
      isMockEnabled = true;
      return getFootprintHistory(uid);
    }
  }
};

export const addFootprintHistory = async (uid: string, totalCO2e: number, breakdown: FootprintHistory["breakdown"]): Promise<void> => {
  if (isMockEnabled) {
    const historyMap = getLocalData<Record<string, FootprintHistory[]>>("ecotrack_history", {});
    if (!historyMap[uid]) historyMap[uid] = [];
    
    // Add new snapshot
    const newSnapshot: FootprintHistory = {
      id: "hist_" + Date.now(),
      date: new Date().toISOString(),
      totalCO2e,
      breakdown
    };
    
    historyMap[uid].push(newSnapshot);
    setLocalData("ecotrack_history", historyMap);
  } else {
    try {
      const collRef = collection(db!, "users", uid, "footprintHistory");
      await addDoc(collRef, {
        date: Timestamp.now(),
        totalCO2e,
        breakdown
      });
    } catch (e) {
      console.warn("Firestore error in addFootprintHistory, falling back to mock:", e);
      isMockEnabled = true;
      await addFootprintHistory(uid, totalCO2e, breakdown);
    }
  }
};

// ----------------------------------------------------
// Firestore: users/{userId}/habits/{habitId}
// ----------------------------------------------------
export const getHabits = async (uid: string): Promise<Habit[]> => {
  if (isMockEnabled) {
    const habitsMap = getLocalData<Record<string, Habit[]>>("ecotrack_habits", {});
    return habitsMap[uid] || [];
  } else {
    try {
      const collRef = collection(db!, "users", uid, "habits");
      const snap = await getDocs(collRef);
      return snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastCheckedInAt: data.lastCheckedInAt instanceof Timestamp ? data.lastCheckedInAt.toDate() : data.lastCheckedInAt,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
        } as Habit;
      });
    } catch (e) {
      console.warn("Firestore error in getHabits, falling back to mock:", e);
      isMockEnabled = true;
      return getHabits(uid);
    }
  }
};

export const saveHabits = async (uid: string, habits: Habit[]): Promise<void> => {
  if (isMockEnabled) {
    const habitsMap = getLocalData<Record<string, Habit[]>>("ecotrack_habits", {});
    habitsMap[uid] = habits.map(h => ({
      ...h,
      lastCheckedInAt: h.lastCheckedInAt ? (h.lastCheckedInAt instanceof Date ? h.lastCheckedInAt.toISOString() : h.lastCheckedInAt) : null,
      createdAt: h.createdAt instanceof Date ? h.createdAt.toISOString() : h.createdAt
    }));
    setLocalData("ecotrack_habits", habitsMap);
  } else {
    try {
      for (const h of habits) {
        const docRef = doc(db!, "users", uid, "habits", h.id);
        await setDoc(docRef, {
          ...h,
          lastCheckedInAt: h.lastCheckedInAt ? Timestamp.fromDate(new Date(h.lastCheckedInAt)) : null,
          createdAt: h.createdAt ? Timestamp.fromDate(new Date(h.createdAt)) : Timestamp.now()
        });
      }
    } catch (e) {
      console.warn("Firestore error in saveHabits, falling back to mock:", e);
      isMockEnabled = true;
      await saveHabits(uid, habits);
    }
  }
};

export const updateHabit = async (uid: string, habitId: string, updates: Partial<Habit>): Promise<void> => {
  if (isMockEnabled) {
    const habitsMap = getLocalData<Record<string, Habit[]>>("ecotrack_habits", {});
    const list: Habit[] = habitsMap[uid] || [];
    const index = list.findIndex(h => h.id === habitId);
    if (index > -1) {
      list[index] = { ...list[index], ...updates } as Habit;
      habitsMap[uid] = list;
      setLocalData("ecotrack_habits", habitsMap);
    }
  } else {
    try {
      const docRef = doc(db!, "users", uid, "habits", habitId);
      const { lastCheckedInAt, ...rest } = updates;
      const rawUpdates = {
        ...rest,
        ...(lastCheckedInAt === null
          ? { lastCheckedInAt: null }
          : lastCheckedInAt
          ? { lastCheckedInAt: Timestamp.fromDate(new Date(lastCheckedInAt)) }
          : {})
      };
      await setDoc(docRef, rawUpdates, { merge: true });
    } catch (e) {
      console.warn("Firestore error in updateHabit, falling back to mock:", e);
      isMockEnabled = true;
      await updateHabit(uid, habitId, updates);
    }
  }
};

// ----------------------------------------------------
// Firestore: users/{userId}/checkIns/{checkInId}
// ----------------------------------------------------
export const getCheckIns = async (uid: string): Promise<CheckIn[]> => {
  if (isMockEnabled) {
    const checkinsMap = getLocalData<Record<string, CheckIn[]>>("ecotrack_checkins", {});
    return checkinsMap[uid] || [];
  } else {
    try {
      const collRef = collection(db!, "users", uid, "checkIns");
      const snap = await getDocs(collRef);
      return snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          habitId: data.habitId,
          date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
          completed: data.completed
        } as CheckIn;
      });
    } catch (e) {
      console.warn("Firestore error in getCheckIns, falling back to mock:", e);
      isMockEnabled = true;
      return getCheckIns(uid);
    }
  }
};

export const addCheckIn = async (uid: string, habitId: string, completed: boolean): Promise<void> => {
  if (isMockEnabled) {
    const checkinsMap = getLocalData<Record<string, CheckIn[]>>("ecotrack_checkins", {});
    if (!checkinsMap[uid]) checkinsMap[uid] = [];
    
    const newCheckIn: CheckIn = {
      id: "check_" + Date.now(),
      habitId,
      date: new Date().toISOString(),
      completed
    };
    
    checkinsMap[uid].push(newCheckIn);
    setLocalData("ecotrack_checkins", checkinsMap);
  } else {
    try {
      const collRef = collection(db!, "users", uid, "checkIns");
      await addDoc(collRef, {
        habitId,
        date: Timestamp.now(),
        completed
      });
    } catch (e) {
      console.warn("Firestore error in addCheckIn, falling back to mock:", e);
      isMockEnabled = true;
      await addCheckIn(uid, habitId, completed);
    }
  }
};
