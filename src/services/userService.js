// WHAT THIS FILE DOES:
// All Firebase Firestore operations for user data
// Each user gets their own document: users/{uid}
// Saves: XP, streak, history, interview sessions, achievements

import {
  doc, getDoc, setDoc, updateDoc,
  arrayUnion, serverTimestamp,
  collection, getDocs, orderBy, query, limit,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ── Initialize user on first login ────────────────────────────────────────────
export async function initUserData(user) {
  const ref  = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Brand new user
    const newData = {
      uid:          user.uid,
      name:         user.displayName || "User",
      email:        user.email       || "",
      photoURL:     user.photoURL    || "",
      totalXP:      0,
      streak:       1,
      lastVisit:    new Date().toDateString(),
      level:        1,
      xpHistory:    [],
      sessions:     [],
      achievements: {},
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
    };
    await setDoc(ref, newData);
    return {
      totalXP:      0,
      streak:       1,
      xpHistory:    [],
      sessions:     [],
      achievements: {},
    };
  }

  // Existing user — handle streak
  const data      = snap.data();
  const today     = new Date().toDateString();
  const lastVisit = data.lastVisit || "";
  let   newStreak = data.streak    || 1;

  if (lastVisit !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastVisit === yesterday.toDateString()) {
      newStreak = newStreak + 1;
    } else {
      newStreak = 1;
    }

    await updateDoc(ref, {
      lastVisit: today,
      streak:    newStreak,
      updatedAt: serverTimestamp(),
    });
  }

  return {
    totalXP:      data.totalXP      || 0,
    streak:       newStreak,
    xpHistory:    data.xpHistory    || [],
    sessions:     data.sessions     || [],
    achievements: data.achievements || {},
  };
}

// ── Award XP to user ──────────────────────────────────────────────────────────
export async function awardXPToUser(uid, amount, reason) {
  if (!uid) return 0;
  const ref  = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;

  const current  = snap.data().totalXP || 0;
  const newTotal = current + amount;

  const entry = {
    amount,
    reason,
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    id:   Date.now(),
  };

  await updateDoc(ref, {
    totalXP:   newTotal,
    xpHistory: arrayUnion(entry),
    updatedAt: serverTimestamp(),
  });

  // Also sync to localStorage
  localStorage.setItem("codesphere-xp", String(newTotal));
  const history = JSON.parse(localStorage.getItem("codesphere-xp-history") || "[]");
  history.unshift(entry);
  localStorage.setItem("codesphere-xp-history", JSON.stringify(history.slice(0, 50)));

  return newTotal;
}

// ── Save interview session ────────────────────────────────────────────────────
export async function saveSessionToFirebase(uid, session) {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    sessions:  arrayUnion(session),
    updatedAt: serverTimestamp(),
  });

  // Sync to localStorage
  const sessions = JSON.parse(localStorage.getItem("interview-sessions") || "[]");
  sessions.unshift(session);
  localStorage.setItem("interview-sessions", JSON.stringify(sessions.slice(0, 20)));
}

// ── Save achievement ──────────────────────────────────────────────────────────
export async function saveAchievement(uid, key, value) {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  const update = {};
  update["achievements." + key] = value;
  update["updatedAt"] = serverTimestamp();
  await updateDoc(ref, update);
}

// ── Update user level ─────────────────────────────────────────────────────────
export async function updateUserLevel(uid, level) {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { level, updatedAt: serverTimestamp() });
}

// ── Get real leaderboard from Firestore ───────────────────────────────────────
export async function getLeaderboard() {
  try {
    const q    = query(collection(db, "users"), orderBy("totalXP", "desc"), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(function(d) {
      const data = d.data();
      return {
        uid:      d.id,
        name:     data.name     || "Anonymous",
        email:    data.email    || "",
        photoURL: data.photoURL || "",
        totalXP:  data.totalXP  || 0,
        streak:   data.streak   || 1,
        level:    data.level    || 1,
      };
    });
  } catch (err) {
    console.error("Failed to get leaderboard:", err);
    return [];
  }
}

// ── Get single user data ──────────────────────────────────────────────────────
export async function getUserData(uid) {
  if (!uid) return null;
  const ref  = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}