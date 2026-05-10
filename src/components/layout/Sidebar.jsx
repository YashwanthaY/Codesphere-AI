import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, GitBranch, Database, Cpu,
  Code2, BarChart3, MessageSquare, Sparkles,
  ChevronLeft, ChevronRight, Zap, Trophy, LogOut,
  Flame, Globe, Medal, BarChart2, BookMarked,
  Target,
} from "lucide-react";

// ── NAV GROUPED ───────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { path: "/",          label: "Dashboard", icon: LayoutDashboard },
      { path: "/progress",  label: "Progress",  icon: BarChart2       },
      { path: "/analytics", label: "Analytics", icon: BarChart3       },
    ],
  },
  {
    label: "Practice",
    items: [
      { path: "/dsa",        label: "DSA Visualizer",  icon: GitBranch,     badge: "10" },
      { path: "/sql",        label: "SQL Playground",  icon: Database                   },
      { path: "/os",         label: "OS Simulator",    icon: Cpu                        },
      { path: "/challenges", label: "Daily Challenges",icon: Flame,         badge: "🔥" },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { path: "/review",    label: "AI Code Review",  icon: Code2        },
      { path: "/interview", label: "Interview Coach", icon: MessageSquare },
      { path: "/portfolio", label: "Portfolio Gen",   icon: Sparkles      },
    ],
  },
  {
    label: "Explore",
    items: [
      { path: "/notes",       label: "Notes & Bookmarks", icon: BookMarked },
      { path: "/github",      label: "GitHub Tracker",    icon: Globe      },
      { path: "/achievements",label: "Achievements",      icon: Medal      },
      { path: "/leaderboard", label: "Leaderboard",       icon: Trophy     },
    ],
  },
];

export default function Sidebar({
  collapsed, setCollapsed,
  totalXP, currentLevel, progress, nextLevel,
  user, onSignOut,
}) {
  return (
    <aside className={
      "fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out " +
      "bg-slate-950 border-r border-slate-800/60 " +
      (collapsed ? "w-[60px]" : "w-[220px]")
    }>

      {/* ── LOGO ── */}
      <div className={
        "flex items-center h-14 border-b border-slate-800/60 flex-shrink-0 overflow-hidden " +
        (collapsed ? "justify-center px-0" : "gap-3 px-4")
      }>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <Zap size={15} className="text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white tracking-tight">CodeSphere</p>
            <p className="text-[9px] text-blue-400/80 tracking-[0.15em] uppercase font-medium">AI Platform</p>
          </div>
        )}
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none">
        {NAV_GROUPS.map(function(group) {
          return (
            <div key={group.label} className="mb-3">
              {/* Group label — hidden when collapsed */}
              {!collapsed && (
                <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-[0.12em] px-2 mb-1.5">
                  {group.label}
                </p>
              )}
              {group.items.map(function(item) {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    title={collapsed ? item.label : undefined}
                    className={function(obj) {
                      return (
                        "flex items-center rounded-lg transition-all duration-150 mb-0.5 " +
                        (collapsed ? "justify-center w-10 h-10 mx-auto " : "gap-2.5 px-2.5 py-2 ") +
                        (obj.isActive
                          ? "bg-blue-500/15 text-blue-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60")
                      );
                    }}
                  >
                    {function(obj) {
                      return (
                        <>
                          {/* Active left bar */}
                          {!collapsed && obj.isActive && (
                            <div className="absolute left-0 w-0.5 h-5 bg-blue-400 rounded-r-full" />
                          )}
                          <Icon
                            size={16}
                            strokeWidth={obj.isActive ? 2.5 : 2}
                            className="flex-shrink-0"
                          />
                          {!collapsed && (
                            <>
                              <span className={
                                "text-[12.5px] flex-1 whitespace-nowrap " +
                                (obj.isActive ? "font-semibold" : "font-medium")
                              }>
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-700">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </>
                      );
                    }}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── XP BAR ── */}
      {!collapsed && currentLevel && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm leading-none">{currentLevel.icon}</span>
                <div>
                  <p className={"text-[11px] font-bold " + currentLevel.color}>
                    {currentLevel.title}
                  </p>
                  <p className="text-[9px] text-slate-600">Lv {currentLevel.level}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-white tabular-nums">
                {(totalXP || 0).toLocaleString()} XP
              </span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: (progress || 0) + "%",
                  background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                }}
              />
            </div>
            {nextLevel && (
              <p className="text-[9px] text-slate-600 mt-1.5 text-right">
                {Math.max(0, nextLevel.minXP - (totalXP || 0))} XP → {nextLevel.title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── COLLAPSE BUTTON ── */}
      <div className="px-2 py-2 border-t border-slate-800/60 flex-shrink-0">
        <button
          onClick={function() { setCollapsed(!collapsed); }}
          className={
            "w-full flex items-center rounded-lg text-slate-500 hover:text-slate-300 " +
            "hover:bg-slate-800/60 transition-all duration-150 " +
            (collapsed ? "justify-center py-2.5" : "gap-2 px-2.5 py-2")
          }
        >
          {collapsed
            ? <ChevronRight size={15} />
            : <><ChevronLeft size={15} /><span className="text-[11px] font-medium">Collapse</span></>
          }
        </button>
      </div>

      {/* ── USER ── */}
      {!collapsed && (
        <div className="px-3 pb-4 flex-shrink-0">
          {user ? (
            <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                {user.photoURL
                  ? <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-7 h-7 rounded-full ring-1 ring-slate-700 flex-shrink-0"
                    />
                  : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                      {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                    </div>
                }
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-200 truncate">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/15 hover:text-red-400 text-slate-500 text-[11px] font-medium transition-all duration-150"
                >
                  <LogOut size={11} /> Sign out
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-2.5 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                CS
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-200">CodeSphere User</p>
                <p className="text-[9px] text-slate-500">Final Year B.Tech</p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}