// WHAT THIS FILE DOES:
// Global XP system — any component can award XP
// Tracks: total XP, level, XP history
// Saves everything to localStorage
// Shows level-up animation when user reaches new level

import { createContext, useContext, useState, useEffect } from "react";

const XPContext = createContext(null);

// ── LEVEL CONFIG ──────────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, title: "Beginner",     minXP: 0,    maxXP: 100,  color: "text-slate-400",   bg: "bg-slate-500/20",   icon: "🌱" },
  { level: 2, title: "Junior Dev",   minXP: 100,  maxXP: 300,  color: "text-blue-400",    bg: "bg-blue-500/20",    icon: "💻" },
  { level: 3, title: "Mid Dev",      minXP: 300,  maxXP: 600,  color: "text-emerald-400", bg: "bg-emerald-500/20", icon: "⚡" },
  { level: 4, title: "Senior Dev",   minXP: 600,  maxXP: 1000, color: "text-violet-400",  bg: "bg-violet-500/20",  icon: "🚀" },
  { level: 5, title: "Expert",       minXP: 1000, maxXP: 9999, color: "text-amber-400",   bg: "bg-amber-500/20",   icon: "👑" },
];

// ── XP REWARDS ────────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  DSA_SORT_COMPLETE:      { xp: 10, label: "Algorithm sorted!"         },
  DSA_SHUFFLE:            { xp: 2,  label: "New array generated"        },
  SQL_QUERY_RUN:          { xp: 5,  label: "SQL query executed"         },
  OS_SCHEDULER_RUN:       { xp: 8,  label: "Scheduler simulated"        },
  OS_PAGE_REPLACEMENT:    { xp: 6,  label: "Page replacement simulated" },
  CODE_REVIEW_COMPLETE:   { xp: 15, label: "Code reviewed by AI"        },
  INTERVIEW_QUESTION:     { xp: 5,  label: "Question answered"          },
  INTERVIEW_COMPLETE:     { xp: 20, label: "Interview session done!"    },
  PORTFOLIO_DOWNLOAD:     { xp: 10, label: "Portfolio downloaded"       },
  GITHUB_ANALYTICS:       { xp: 5,  label: "GitHub data analyzed"       },
  DAILY_VISIT:            { xp: 3,  label: "Daily visit bonus"          },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
export function getLevelFromXP(totalXP) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(currentLevel) {
  const idx = LEVELS.findIndex(function(l) { return l.level === currentLevel; });
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getXPProgress(totalXP) {
  const current = getLevelFromXP(totalXP);
  const xpInLevel = totalXP - current.minXP;
  const xpNeeded  = current.maxXP - current.minXP;
  return Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);
}

// ── PROVIDER ──────────────────────────────────────────────────────────────────
export function XPProvider({ children }) {
  const [totalXP, setTotalXP] = useState(function() {
    const saved = localStorage.getItem("codesphere-xp");
    return saved ? parseInt(saved) : 0;
  });

  const [xpHistory, setXPHistory] = useState(function() {
    const saved = localStorage.getItem("codesphere-xp-history");
    return saved ? JSON.parse(saved) : [];
  });

  const [levelUpAnim, setLevelUpAnim] = useState(null);

  // Save to localStorage whenever XP changes
  useEffect(function() {
    localStorage.setItem("codesphere-xp", String(totalXP));
  }, [totalXP]);

  useEffect(function() {
    localStorage.setItem("codesphere-xp-history", JSON.stringify(xpHistory.slice(0, 50)));
  }, [xpHistory]);

  // Award daily visit XP
  useEffect(function() {
    const lastVisit = localStorage.getItem("codesphere-last-visit");
    const today     = new Date().toDateString();
    if (lastVisit !== today) {
      localStorage.setItem("codesphere-last-visit", today);
      setTimeout(function() {
        awardXP(XP_REWARDS.DAILY_VISIT.xp, XP_REWARDS.DAILY_VISIT.label);
      }, 2000);
    }
  }, []);

  function awardXP(amount, reason) {
    setTotalXP(function(prev) {
      const oldLevel = getLevelFromXP(prev);
      const newTotal = prev + amount;
      const newLevel = getLevelFromXP(newTotal);

      // Check if leveled up
      if (newLevel.level > oldLevel.level) {
        setLevelUpAnim(newLevel);
        setTimeout(function() { setLevelUpAnim(null); }, 4000);
      }

      return newTotal;
    });

    // Add to history
    setXPHistory(function(prev) {
      const entry = {
        id:     Date.now(),
        amount,
        reason,
        time:   new Date().toLocaleTimeString(),
        date:   new Date().toLocaleDateString(),
      };
      return [entry, ...prev].slice(0, 50);
    });
  }

  function resetXP() {
    setTotalXP(0);
    setXPHistory([]);
    localStorage.removeItem("codesphere-xp");
    localStorage.removeItem("codesphere-xp-history");
  }

  const currentLevel = getLevelFromXP(totalXP);
  const nextLevel    = getNextLevel(currentLevel.level);
  const progress     = getXPProgress(totalXP);

  const value = {
    totalXP,
    xpHistory,
    currentLevel,
    nextLevel,
    progress,
    awardXP,
    resetXP,
  };

  return (
    <XPContext.Provider value={value}>
      {children}

      {/* ── LEVEL UP ANIMATION ── */}
      {levelUpAnim && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="text-center p-8 rounded-2xl border border-amber-500/30 bg-slate-900"
            style={{ animation: "slideIn 0.5s ease forwards" }}
          >
            <div className="text-6xl mb-3">{levelUpAnim.icon}</div>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-1">
              Level Up!
            </p>
            <p className="text-white text-2xl font-bold mb-1">
              {levelUpAnim.title}
            </p>
            <p className="text-slate-400 text-sm">
              You reached Level {levelUpAnim.level}!
            </p>
          </div>
        </div>
      )}
    </XPContext.Provider>
  );
}

// ── HOOK ──────────────────────────────────────────────────────────────────────
export function useXP() {
  const context = useContext(XPContext);
  if (!context) throw new Error("useXP must be used inside XPProvider");
  return context;
}