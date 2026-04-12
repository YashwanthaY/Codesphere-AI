import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, provider } from "../config/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(function() {
    // Check for redirect result first
    getRedirectResult(auth)
      .then(function(result) {
        if (result && result.user) {
          setUser(result.user);
        }
      })
      .catch(function(err) {
        console.error("Redirect error:", err);
      });

    const unsubscribe = onAuthStateChanged(auth, function(firebaseUser) {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signIn() {
    setError("");
    try {
      // Try popup first
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Popup error:", err.code, err.message);

      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        // Fallback to redirect
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          setError("Sign in failed. Please try again.");
          console.error("Redirect error:", redirectErr);
        }
      } else {
        setError(err.message || "Sign in failed");
      }
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}