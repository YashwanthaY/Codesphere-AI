import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun, Moon, Bell, Search, X,
  GitBranch, Database, Cpu, Code2,
  BarChart3, MessageSquare, Sparkles, Trophy, Menu
} from "lucide-react";

const SEARCH_ITEMS = [
  { label: "DSA Visualizer",   path: "/dsa",         desc: "Sorting, trees, graphs", icon: GitBranch,     color: "text-emerald-400 bg-emerald-500/10" },
  { label: "SQL Playground",   path: "/sql",         desc: "Live SQL in browser",    icon: Database,      color: "text-cyan-400 bg-cyan-500/10"       },
  { label: "OS Simulator",     path: "/os",          desc: "CPU scheduling",         icon: Cpu,           color: "text-amber-400 bg-amber-500/10"     },
  { label: "AI Code Reviewer", path: "/review",      desc: "Gemini AI reviews code", icon: Code2,         color: "text-green-400 bg-green-500/10"     },
  { label: "Analytics",        path: "/analytics",   desc: "GitHub stats dashboard", icon: BarChart3,     color: "text-pink-400 bg-pink-500/10"       },
  { label: "Interview Coach",  path: "/interview",   desc: "AI mock interviews",     icon: MessageSquare, color: "text-violet-400 bg-violet-500/10"   },
  { label: "Portfolio Gen",    path: "/portfolio",   desc: "Generate portfolio",     icon: Sparkles,      color: "text-rose-400 bg-rose-500/10"       },
  { label: "Leaderboard",      path: "/leaderboard", desc: "XP and achievements",    icon: Trophy,        color: "text-amber-400 bg-amber-500/10"     },
];

const NOTIFICATIONS = [
  { text: "Complete DSA module to earn 50 XP",    time: "2m ago",  dot: "bg-blue-500"    },
  { text: "New interview questions available",      time: "1h ago",  dot: "bg-violet-500"  },
  { text: "Your streak is active! Keep it up!",    time: "1d ago",  dot: "bg-emerald-500" },
];

export default function Navbar({ isDark, toggleTheme, pageTitle, collapsed }) {
  const navigate = useNavigate();

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotif,   setShowNotif]   = useState(false);

  const filtered = SEARCH_ITEMS.filter(function(item) {
    const q = searchQuery.toLowerCase();
    return item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
  });

  function openSearch()  { setSearchOpen(true); setSearchQuery(""); }
  function closeSearch() { setSearchOpen(false); setSearchQuery(""); }

  function goToModule(path) {
    closeSearch();
    navigate(path);
  }

  return (
    <>
      <header
        className={
          "fixed top-0 right-0 z-30 h-14 " +
          "bg-slate-900/95 backdrop-blur-md border-b border-slate-800 " +
          "flex items-center px-4 gap-3 transition-all duration-300 " +
          /* Desktop: offset by sidebar width */
          (collapsed ? "lg:left-16" : "lg:left-56") + " " +
          /* Mobile: full width */
          "left-0"
        }
      >
        {/* Page title */}
        <h1 className="text-[15px] font-semibold text-white flex-1 truncate">
          {pageTitle}
        </h1>

        {/* Search button */}
        <button
          onClick={openSearch}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700
                     text-slate-400 hover:text-slate-200 text-xs
                     px-3 py-1.5 rounded-lg transition-all border border-slate-700"
        >
          <Search size={13} />
          <span className="hidden sm:inline">Search...</span>
        </button>

        {/* Live indicator — desktop only */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={function() { setShowNotif(function(p) { return !p; }); }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700
                       flex items-center justify-center text-slate-400
                       hover:text-slate-200 transition-all relative border border-slate-700"
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-64 sm:w-72 bg-slate-900
                            border border-slate-700 rounded-xl shadow-2xl z-50
                            overflow-hidden animate-scale-in">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-white">Notifications</p>
              </div>
              {NOTIFICATIONS.map(function(n, i) {
                return (
                  <div key={i} className="flex items-start gap-3 px-4 py-3
                                          hover:bg-slate-800 transition-all
                                          border-b border-slate-800 last:border-0 cursor-pointer">
                    <div className={"w-2 h-2 rounded-full mt-1.5 flex-shrink-0 " + n.dot} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dark/Light toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700
                     flex items-center justify-center text-slate-400
                     hover:text-yellow-400 transition-all border border-slate-700"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-3"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-700
                       rounded-xl overflow-hidden shadow-2xl"
            onClick={function(e) { e.stopPropagation(); }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={function(e) { setSearchQuery(e.target.value); }}
                onKeyDown={function(e) {
                  if (e.key === "Escape") closeSearch();
                  if (e.key === "Enter" && filtered.length > 0) goToModule(filtered[0].path);
                }}
                placeholder="Search modules..."
                className="flex-1 bg-transparent text-white text-sm
                           outline-none placeholder-slate-500"
              />
              <button onClick={closeSearch}
                className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="py-2 max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">No modules found</p>
                </div>
              ) : (
                filtered.map(function(item) {
                  const Icon  = item.icon;
                  const parts = item.color.split(" ");
                  return (
                    <button
                      key={item.path}
                      onClick={function() { goToModule(item.path); }}
                      className="w-full flex items-center gap-3 px-4 py-3
                                 hover:bg-slate-800 transition-all text-left group"
                    >
                      <div className={"w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 " + parts[1]}>
                        <Icon size={16} className={parts[0]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <span className="text-slate-600 group-hover:text-slate-400 transition-all">→</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2 border-t border-slate-800 text-[10px] text-slate-600 flex gap-4">
              <span>↵ open first</span>
              <span>Esc close</span>
            </div>
          </div>
        </div>
      )}

      {showNotif && (
        <div className="fixed inset-0 z-40" onClick={function() { setShowNotif(false); }} />
      )}
    </>
  );
}