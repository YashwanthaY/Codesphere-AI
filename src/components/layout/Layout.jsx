import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
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

      {/* Sidebar — desktop only */}
      <div className="hidden lg:block">
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
      </div>

      {/* Navbar */}
      <Navbar
        isDark={isDark}
        toggleTheme={toggle}
        pageTitle={pageTitle}
        collapsed={collapsed}
      />

      {/* Main content */}
      <main
        className={
          "pt-14 min-h-screen transition-all duration-300 " +
          "pb-20 lg:pb-0 " +
          (collapsed ? "lg:ml-16" : "lg:ml-56")
        }
      >
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <div className="block lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}