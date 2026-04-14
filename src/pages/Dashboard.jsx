import { Link, useNavigate } from "react-router-dom";
import {
  GitBranch, Database, Cpu, Code2,
  BarChart3, MessageSquare, Sparkles,
  Zap, Trophy, Flame, Target, ArrowRight, BookOpen
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../context/AuthContext";

const STAT_CARDS = [
  { label: "Modules Active",  value: "9",   sub: "All modules unlocked",  icon: Zap,    color: "text-blue-400",    bg: "bg-blue-500/10",    bar: "bg-blue-500",    delay: "delay-0" },
  { label: "Day Streak",      value: "7",   sub: "↑ 2 from last week",    icon: Flame,  color: "text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-500", delay: "delay-1" },
  { label: "Problems Solved", value: "42",  sub: "DSA + SQL combined",    icon: Target, color: "text-amber-400",   bg: "bg-amber-500/10",   bar: "bg-amber-500",   delay: "delay-2" },
  { label: "Interview Score", value: "8.4", sub: "Last session avg /10",  icon: Trophy, color: "text-violet-400",  bg: "bg-violet-500/10",  bar: "bg-violet-500",  delay: "delay-3" },
];

const MODULES = [
  { path: "/dsa",         label: "DSA Visualizer",  icon: GitBranch,     desc: "Animate sorting, trees, and graphs with C++ code", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50", status: "Active", statusColor: "text-emerald-400 bg-emerald-500/10", delay: "delay-0" },
  { path: "/sql",         label: "SQL Playground",  icon: Database,      desc: "Live SQL in browser using WebAssembly + Chart.js",  color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "hover:border-cyan-500/50",    status: "Active", statusColor: "text-emerald-400 bg-emerald-500/10", delay: "delay-1" },
  { path: "/os",          label: "OS Simulator",    icon: Cpu,           desc: "FCFS, Round Robin, Gantt charts live",              color: "text-amber-400",   bg: "bg-amber-500/10",   border: "hover:border-amber-500/50",   status: "Active", statusColor: "text-amber-400 bg-amber-500/10",   delay: "delay-2" },
  { path: "/review",      label: "AI Code Review",  icon: Code2,         desc: "Gemini AI scores your code quality 1-10",           color: "text-green-400",   bg: "bg-green-500/10",   border: "hover:border-green-500/50",   status: "Active", statusColor: "text-emerald-400 bg-emerald-500/10", delay: "delay-3" },
  { path: "/analytics",   label: "Analytics",       icon: BarChart3,     desc: "GitHub stats in Power BI style dashboard",          color: "text-pink-400",    bg: "bg-pink-500/10",    border: "hover:border-pink-500/50",    status: "Active", statusColor: "text-emerald-400 bg-emerald-500/10", delay: "delay-4" },
  { path: "/interview",   label: "Interview Coach", icon: MessageSquare, desc: "AI asks questions, scores your answers",            color: "text-violet-400",  bg: "bg-violet-500/10",  border: "hover:border-violet-500/50",  status: "New",    statusColor: "text-violet-400 bg-violet-500/10",  delay: "delay-5" },
  { path: "/portfolio",   label: "Portfolio Gen",   icon: Sparkles,      desc: "AI writes your portfolio from a form",              color: "text-rose-400",    bg: "bg-rose-500/10",    border: "hover:border-rose-500/50",    status: "New",    statusColor: "text-rose-400 bg-rose-500/10",      delay: "delay-6" },
  { path: "/leaderboard", label: "Leaderboard",     icon: Trophy,        desc: "Track XP, achievements and rankings",               color: "text-amber-400",   bg: "bg-amber-500/10",   border: "hover:border-amber-500/50",   status: "New",    statusColor: "text-amber-400 bg-amber-500/10",   delay: "delay-7" },
];

const SKILLS = [
  { name: "React.js + Redux", pct: 82, color: "bg-blue-500",    delay: "delay-0" },
  { name: "Data Structures",  pct: 75, color: "bg-emerald-500", delay: "delay-1" },
  { name: "SQL & DBMS",       pct: 68, color: "bg-cyan-500",    delay: "delay-2" },
  { name: "OS Concepts",      pct: 55, color: "bg-amber-500",   delay: "delay-3" },
  { name: "Python Flask",     pct: 60, color: "bg-violet-500",  delay: "delay-4" },
  { name: "Tailwind CSS",     pct: 90, color: "bg-pink-500",    delay: "delay-5" },
];

const ACTIVITY = [
  { icon: GitBranch,     label: "Bubble Sort Visualized", time: "2 hours ago · DSA",     score: "+10 XP", iconBg: "bg-emerald-500/10 text-emerald-400", path: "/dsa"       },
  { icon: MessageSquare, label: "Interview Session #4",   time: "Yesterday · React + JS", score: "8.2/10", iconBg: "bg-violet-500/10 text-violet-400",   path: "/interview" },
  { icon: Code2,         label: "Python code reviewed",   time: "Yesterday · AI Review",  score: "9/10",   iconBg: "bg-green-500/10 text-green-400",     path: "/review"    },
  { icon: Database,      label: "SQL JOIN challenge",      time: "2 days ago · SQL",       score: "+15 XP", iconBg: "bg-cyan-500/10 text-cyan-400",       path: "/sql"       },
];

const QUICK_ACTIONS = [
  { label: "Practice DSA",   path: "/dsa",       color: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
  { label: "Run SQL Query",  path: "/sql",       color: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/20"             },
  { label: "Mock Interview", path: "/interview", color: "bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/20"     },
  { label: "Review My Code", path: "/review",    color: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"             },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [streak] = useLocalStorage("streak", 7);
  const { user } = useAuth();

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name     = user ? (user.displayName ? user.displayName.split(" ")[0] : "there") : "Arjun";

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── GREETING ── */}
      <div className="animate-fade-in-up delay-0">
        <h1 className="text-2xl font-semibold text-white">
          {greeting}, {name} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          You have a {streak}-day streak. Keep it up — campus placements are getting closer!
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(function(card) {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={"relative overflow-hidden rounded-xl p-5 bg-slate-900 border border-slate-800 card-hover animate-fade-in-up " + card.delay}
            >
              <div className={"absolute top-0 left-0 right-0 h-0.5 " + card.bar} />
              <div className={"absolute top-4 right-4 w-9 h-9 rounded-lg " + card.bg + " flex items-center justify-center"}>
                <Icon size={18} className={card.color} />
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className={"text-3xl font-bold mb-1 " + card.color}>{card.value}</p>
              <p className="text-xs text-slate-500">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── MODULE CARDS ── */}
      <div className="animate-fade-in-up delay-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Modules Overview</h2>
          <button
            onClick={function() { navigate("/dsa"); }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {MODULES.map(function(mod) {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.path}
                to={mod.path}
                className={"block p-4 rounded-xl bg-slate-900 border border-slate-800 " +
                           mod.border + " card-hover animate-fade-in-up cursor-pointer group " + mod.delay}
              >
                <div className={"w-10 h-10 rounded-lg " + mod.bg + " flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200"}>
                  <Icon size={20} className={mod.color} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{mod.label}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{mod.desc}</p>
                <div className="flex items-center justify-between">
                  <span className={"text-[11px] px-2 py-0.5 rounded-full font-medium " + mod.statusColor}>
                    {mod.status}
                  </span>
                  <ArrowRight size={13} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── SKILLS + ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Skills */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-fade-in-up delay-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Skills Progress</h3>
            <BookOpen size={14} className="text-slate-500" />
          </div>
          <div className="space-y-3.5">
            {SKILLS.map(function(skill) {
              return (
                <div key={skill.name} className={"animate-fade-in-up " + skill.delay}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">{skill.name}</span>
                    <span className="text-slate-400">{skill.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={"h-full rounded-full transition-all duration-1000 " + skill.color}
                      style={{ width: skill.pct + "%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-fade-in-up delay-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            <Flame size={14} className="text-slate-500" />
          </div>
          <div className="space-y-1">
            {ACTIVITY.map(function(item, i) {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  onClick={function() { navigate(item.path); }}
                  className={"flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0 cursor-pointer hover:bg-slate-800/50 rounded-lg px-2 transition-all group animate-fade-in-up delay-" + i}
                >
                  <div className={"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 " + item.iconBg}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{item.label}</p>
                    <p className="text-[11px] text-slate-500">{item.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-semibold">{item.score}</span>
                    <ArrowRight size={12} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up delay-5">
        {QUICK_ACTIONS.map(function(action, i) {
          return (
            <Link
              key={action.path}
              to={action.path}
              className={"flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-200 btn-press " + action.color}
            >
              {action.label}
              <ArrowRight size={13} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}