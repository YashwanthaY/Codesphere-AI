import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, GitBranch, Database,
  Cpu, Code2, BarChart3, MessageSquare,
  Sparkles, Trophy
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/",            label: "Home",      icon: LayoutDashboard },
  { path: "/dsa",         label: "DSA",       icon: GitBranch       },
  { path: "/sql",         label: "SQL",       icon: Database        },
  { path: "/review",      label: "AI Review", icon: Code2           },
  { path: "/interview",   label: "Interview", icon: MessageSquare   },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 py-2 safe-area-pb">
      {NAV_ITEMS.map(function(item) {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={function(obj) {
              return (
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all " +
                (obj.isActive
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-slate-500 hover:text-slate-300")
              );
            }}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}