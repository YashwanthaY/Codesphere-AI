import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, GitBranch, Database, Cpu,
  Code2, BarChart3, MessageSquare, Sparkles,
  ChevronLeft, ChevronRight, Zap, Trophy, LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/",            label: "Dashboard",      icon: LayoutDashboard, badge: null },
  { path: "/dsa",         label: "DSA Visualizer", icon: GitBranch,       badge: "9"  },
  { path: "/sql",         label: "SQL Playground", icon: Database,        badge: null },
  { path: "/os",          label: "OS Simulator",   icon: Cpu,             badge: null },
  { path: "/review",      label: "AI Code Review", icon: Code2,           badge: null },
  { path: "/analytics",   label: "Analytics",      icon: BarChart3,       badge: null },
  { path: "/interview",   label: "Interview Coach",icon: MessageSquare,   badge: null },
  { path: "/portfolio",   label: "Portfolio Gen",  icon: Sparkles,        badge: null },
  { path: "/leaderboard", label: "Leaderboard",    icon: Trophy,          badge: null },
];

export default function Sidebar({
  collapsed, setCollapsed,
  totalXP, currentLevel, progress, nextLevel,
  user, onSignOut,
}) {
  return (
    <aside className={"fixed left-0 top-0 h-full z-40 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out " + (collapsed ? "w-16" : "w-56")}>

      {/* LOGO */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-slate-800 overflow-hidden flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white whitespace-nowrap">CodeSphere</p>
            <p className="text-[10px] text-blue-400 tracking-widest uppercase whitespace-nowrap">AI Platform</p>
          </div>
        )}
      </div>

      {/* NAV */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {!collapsed && <p className="text-[10px] text-slate-500 uppercase tracking-widest px-2 py-2">Navigation</p>}
        {NAV_ITEMS.map(function(item) {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} end={item.path === "/"}
              className={function(obj) {
                return "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all cursor-pointer " +
                  (obj.isActive ? "bg-blue-500/15 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200");
              }}>
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-[13px] font-medium whitespace-nowrap flex-1">{item.label}</span>
                  {item.badge && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* XP BAR */}
      {!collapsed && currentLevel && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentLevel.icon}</span>
                <div>
                  <p className={"text-xs font-semibold " + currentLevel.color}>{currentLevel.title}</p>
                  <p className="text-[10px] text-slate-500">Level {currentLevel.level}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-white">{totalXP || 0} XP</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: (progress || 0) + "%" }} />
            </div>
            {nextLevel && <p className="text-[10px] text-slate-600 mt-1.5 text-center">{nextLevel.minXP - (totalXP || 0)} XP to {nextLevel.title}</p>}
          </div>
        </div>
      )}

      {/* COLLAPSE */}
      <div className="px-2 py-3 border-t border-slate-800 flex-shrink-0">
        <button onClick={function() { setCollapsed(!collapsed); }}
          className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all">
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-xs">Collapse</span></>}
        </button>
      </div>

      {/* USER CARD */}
      {!collapsed && (
        <div className="px-3 pb-4 flex-shrink-0">
          {user ? (
            <div className="bg-slate-800 rounded-lg p-2.5 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                {user.photoURL
                  ? <img src={user.photoURL} alt={user.displayName || "User"} className="w-7 h-7 rounded-full flex-shrink-0" />
                  : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">{user.displayName ? user.displayName[0] : "U"}</div>
                }
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-200 truncate">{user.displayName || "User"}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              {onSignOut && (
                <button onClick={onSignOut}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs transition-all">
                  <LogOut size={11} /> Sign out
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">AK</div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">Arjun Kumar</p>
                <p className="text-[10px] text-slate-500">Final Year B.Tech</p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}