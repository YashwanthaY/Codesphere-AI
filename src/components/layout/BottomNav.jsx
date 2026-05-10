import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, GitBranch, Flame,
  MessageSquare, Code2,
} from "lucide-react";

// ── 5 most important modules for mobile ──────────────────
const NAV_ITEMS = [
  { path: "/",          label: "Home",      icon: LayoutDashboard },
  { path: "/dsa",       label: "DSA",       icon: GitBranch       },
  { path: "/challenges",label: "Daily",     icon: Flame           },
  { path: "/review",    label: "Code AI",   icon: Code2           },
  { path: "/interview", label: "Interview", icon: MessageSquare   },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/60 flex items-center justify-around px-1 pt-2 pb-3">
      {NAV_ITEMS.map(function(item) {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={function(obj) {
              return (
                "relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 " +
                (obj.isActive ? "text-blue-400" : "text-slate-500 active:scale-95")
              );
            }}
          >
            {function(obj) {
              return (
                <>
                  {/* Active background pill */}
                  {obj.isActive && (
                    <span className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/20" />
                  )}
                  <Icon
                    size={19}
                    strokeWidth={obj.isActive ? 2.5 : 2}
                    className="relative z-10"
                  />
                  <span className={
                    "text-[10px] relative z-10 " +
                    (obj.isActive ? "font-bold" : "font-medium")
                  }>
                    {item.label}
                  </span>
                </>
              );
            }}
          </NavLink>
        );
      })}
    </nav>
  );
}