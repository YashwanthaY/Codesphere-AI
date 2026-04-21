import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, provider } from "../config/firebase";
import { initUserData } from "../services/userService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  async function loadUserData(firebaseUser) {
    try {
      const data = await initUserData(firebaseUser);
      setUserData(data);
      // Sync Firebase data to localStorage for offline + XP context
      localStorage.setItem("codesphere-xp",           String(data.totalXP || 0));
      localStorage.setItem("streak",                   String(data.streak  || 1));
      localStorage.setItem("codesphere-xp-history",   JSON.stringify(data.xpHistory    || []));
      localStorage.setItem("interview-sessions",       JSON.stringify(data.sessions     || []));
      localStorage.setItem("codesphere-achievements", JSON.stringify(data.achievements  || {}));
    } catch (err) {
      console.error("Failed to load user data from Firebase:", err);
    }
  }

  useEffect(function() {
    // Handle redirect sign-in result
    getRedirectResult(auth)
      .then(function(result) {
        if (result && result.user) {
          setUser(result.user);
          loadUserData(result.user);
        }
      })
      .catch(function(err) {
        console.error("Redirect error:", err);
      });

    // Listen for auth state
    const unsubscribe = onAuthStateChanged(auth, async function(firebaseUser) {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserData(firebaseUser);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signIn() {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      await loadUserData(result.user);
    } catch (err) {
      console.error("Sign in error:", err.code);
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        try { await signInWithRedirect(auth, provider); }
        catch { setError("Sign in failed. Please allow popups and try again."); }
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Add localhost to Firebase Console → Authentication → Authorized domains.");
      } else {
        setError(err.message || "Sign in failed. Please try again.");
      }
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}