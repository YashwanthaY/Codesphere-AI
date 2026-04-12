import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useXP } from "../../context/XPContext";
import { useAuth } from "../../context/AuthContext";

const PAGE_TITLES = {
  "/":            "Dashboard",
  "/dsa":         "DSA Visualizer",
  "/sql":         "SQL Playground",
  "/os":          "OS Simulator",
  "/review":      "AI Code Reviewer",
  "/analytics":   "Analytics Dashboard",
  "/interview":   "Interview Coach",
  "/portfolio":   "Portfolio Generator",
  "/leaderboard": "Leaderboard",
};

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark, toggle }        = useDarkMode();
  const location                  = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || "CodeSphere AI";

  const { totalXP, currentLevel, progress, nextLevel } = useXP();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        totalXP={totalXP}
        currentLevel={currentLevel}
        progress={progress}
        nextLevel={nextLevel}
        user={user}
        onSignOut={signOut}
      />
      <Navbar
        isDark={isDark}
        toggleTheme={toggle}
        pageTitle={pageTitle}
        collapsed={collapsed}
      />
      <main className={"pt-14 min-h-screen transition-all duration-300 " + (collapsed ? "ml-16" : "ml-56")}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}