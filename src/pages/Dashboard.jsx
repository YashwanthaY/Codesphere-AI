import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GitBranch, Database, Cpu, Code2,
  BarChart3, MessageSquare, Sparkles,
  Zap, Trophy, Flame, Target, ArrowRight,
  BarChart2, BookMarked, Calendar, CheckCircle,
  Circle, Clock, TrendingUp,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../context/AuthContext";
import { useXP } from "../context/XPContext";
import { trackModuleVisit } from "../utils/progressTracker";

// ── ALL MODULES ───────────────────────────────────────────────────────────────
const MODULES = [
  { path: "/progress",    label: "Progress",         icon: BarChart2,     desc: "Track XP, streaks and all module activity",       color: "text-blue-400",    bg: "bg-blue-500/10",    border: "hover:border-blue-500/50",    status: "New"    },
  { path: "/dsa",         label: "DSA Visualizer",   icon: GitBranch,     desc: "Animate sorting, trees and graphs with C++ code",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50", status: "Active" },
  { path: "/sql",         label: "SQL Playground",   icon: Database,      desc: "Live SQL in browser using WebAssembly",            color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "hover:border-cyan-500/50",    status: "Active" },
  { path: "/os",          label: "OS Simulator",     icon: Cpu,           desc: "FCFS, Round Robin, Gantt charts live",             color: "text-amber-400",   bg: "bg-amber-500/10",   border: "hover:border-amber-500/50",   status: "Active" },
  { path: "/review",      label: "AI Code Review",   icon: Code2,         desc: "Groq AI scores your code quality 1–10",            color: "text-green-400",   bg: "bg-green-500/10",   border: "hover:border-green-500/50",   status: "Active" },
  { path: "/interview",   label: "Interview Coach",  icon: MessageSquare, desc: "AI asks questions, scores your answers live",      color: "text-violet-400",  bg: "bg-violet-500/10",  border: "hover:border-violet-500/50",  status: "Active" },
  { path: "/challenges",  label: "Daily Challenges", icon: Flame,         desc: "30 coding problems with XP rewards and streaks",   color: "text-orange-400",  bg: "bg-orange-500/10",  border: "hover:border-orange-500/50",  status: "Active" },
  { path: "/portfolio",   label: "Portfolio Gen",    icon: Sparkles,      desc: "Generate your portfolio and download as PDF",      color: "text-rose-400",    bg: "bg-rose-500/10",    border: "hover:border-rose-500/50",    status: "Active" },
  { path: "/notes",       label: "Notes & Bookmarks",icon: BookMarked,    desc: "Save code snippets, notes and useful links",       color: "text-teal-400",    bg: "bg-teal-500/10",    border: "hover:border-teal-500/50",    status: "New"    },
  { path: "/analytics",   label: "Analytics",        icon: BarChart3,     desc: "Your coding stats in a Power BI style dashboard",  color: "text-pink-400",    bg: "bg-pink-500/10",    border: "hover:border-pink-500/50",    status: "Active" },
  { path: "/leaderboard", label: "Leaderboard",      icon: Trophy,        desc: "Real-time XP rankings from Firebase",              color: "text-amber-400",   bg: "bg-amber-500/10",   border: "hover:border-amber-500/50",   status: "Active" },
];

const QUICK_ACTIONS = [
  { label: "Practice DSA",    path: "/dsa",       color: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
  { label: "Mock Interview",  path: "/interview", color: "bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/20"     },
  { label: "Daily Challenge", path: "/challenges",color: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20"     },
  { label: "Review My Code",  path: "/review",    color: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"             },
];

// ── PLACEMENT COUNTDOWN ───────────────────────────────────────────────────────
function PlacementCountdown() {
  const [targetDate, setTargetDate] = useLocalStorage("placement-date", "");
  const [editing, setEditing]       = useState(false);
  const [inputVal, setInputVal]     = useState(targetDate);
  const [daysLeft, setDaysLeft]     = useState(null);

  useEffect(function() {
    if (!targetDate) { setDaysLeft(null); return; }
    const diff = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff);
  }, [targetDate]);

  function saveDate() {
    setTargetDate(inputVal);
    setEditing(false);
  }

  const urgencyColor = daysLeft === null ? "text-slate-400"
    : daysLeft <= 14  ? "text-red-400"
    : daysLeft <= 30  ? "text-amber-400"
    : "text-emerald-400";

  const urgencyBg = daysLeft === null ? "border-slate-700"
    : daysLeft <= 14  ? "border-red-500/30 bg-red-500/5"
    : daysLeft <= 30  ? "border-amber-500/30 bg-amber-500/5"
    : "border-emerald-500/30 bg-emerald-500/5";

  return (
    <div className={"rounded-xl border p-4 " + urgencyBg}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar size={14} className={urgencyColor} />
          <span className="text-xs font-semibold text-slate-300">Placement Countdown</span>
        </div>
        <button
          onClick={function() { setEditing(function(e) { return !e; }); setInputVal(targetDate); }}
          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          {editing ? "cancel" : "set date"}
        </button>
      </div>

      {editing ? (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="date"
            value={inputVal}
            onChange={function(e) { setInputVal(e.target.value); }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          />
          <button
            onClick={saveDate}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-all"
          >
            Save
          </button>
        </div>
      ) : daysLeft === null ? (
        <p className="text-xs text-slate-500 mt-1">Set your placement date to start the countdown!</p>
      ) : daysLeft < 0 ? (
        <p className="text-xs text-slate-400 mt-1">Placement date has passed. Update it!</p>
      ) : (
        <div className="flex items-end gap-2 mt-1">
          <span className={"text-3xl font-black " + urgencyColor}>{daysLeft}</span>
          <span className="text-xs text-slate-400 mb-1">days to placement season</span>
        </div>
      )}

      {daysLeft !== null && daysLeft >= 0 && (
        <p className="text-[10px] text-slate-600 mt-1">
          {daysLeft <= 14  ? "⚠ Final stretch — focus on DSA + mock interviews!"
           : daysLeft <= 30 ? "📅 One month left — stay consistent!"
           : "✅ You have time — build strong fundamentals!"}
        </p>
      )}
    </div>
  );
}

// ── MODULE COMPLETION TRACKER ─────────────────────────────────────────────────
function ModuleCompletion() {
  const visited = (() => {
    try {
      const raw = localStorage.getItem("cs_moduleVisits");
      return raw ? Object.keys(JSON.parse(raw)) : [];
    } catch { return []; }
  })();

  const allModules = [
    "DSA Visualizer", "SQL Playground", "OS Simulator",
    "AI Code Reviewer", "Interview Coach", "Daily Challenges",
    "Portfolio Generator", "Notes & Bookmarks", "Analytics",
    "Leaderboard", "GitHub Tracker", "Progress Dashboard",
  ];

  const visitedCount = allModules.filter(function(m) {
    return visited.some(function(v) { return v.toLowerCase().includes(m.toLowerCase().split(" ")[0].toLowerCase()); });
  }).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <TrendingUp size={14} className="text-blue-400" />
          Module Explorer
        </h3>
        <span className="text-xs text-slate-500">{visitedCount}/{allModules.length} visited</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {allModules.map(function(mod) {
          const isVisited = visited.some(function(v) {
            return v.toLowerCase().includes(mod.toLowerCase().split(" ")[0].toLowerCase());
          });
          return (
            <div
              key={mod}
              className={"flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all " +
                (isVisited
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-slate-800 text-slate-500")}
            >
              {isVisited
                ? <CheckCircle size={11} className="flex-shrink-0" />
                : <Circle size={11} className="flex-shrink-0" />}
              <span className="truncate">{mod}</span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-700"
          style={{ width: (visitedCount / allModules.length * 100) + "%" }}
        />
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const { totalXP, currentLevel, nextLevel, progress, xpHistory } = useXP();

  const [streak, setStreak] = useLocalStorage("streak", 1);
  const [sessions]          = useLocalStorage("interview-sessions", []);

  // Track module visit
  useEffect(function() {
    trackModuleVisit("Dashboard");
  }, []);

  // Auto-increment streak daily
  useEffect(function() {
    const lastVisit = localStorage.getItem("last-visit-date");
    const today     = new Date().toDateString();
    if (lastVisit !== today) {
      localStorage.setItem("last-visit-date", today);
      if (lastVisit) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastVisit === yesterday.toDateString()) {
          setStreak(function(prev) { return prev + 1; });
        } else {
          setStreak(1);
        }
      } else {
        setStreak(1);
      }
    }
  }, []);

  const avgScore = sessions.length > 0
    ? (sessions.reduce(function(s, r) { return s + parseFloat(r.score || 0); }, 0) / sessions.length).toFixed(1)
    : "—";

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name     = user
    ? (user.displayName ? user.displayName.split(" ")[0] : "there")
    : "Developer";

  const STAT_CARDS = [
    { label: "Total XP",        value: totalXP,          sub: "Earn XP by using modules", icon: Zap,    color: "text-blue-400",    bg: "bg-blue-500/10",    bar: "bg-blue-500"    },
    { label: "Day Streak",      value: streak + " 🔥",   sub: "Keep visiting daily!",     icon: Flame,  color: "text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-500" },
    { label: "Actions Done",    value: xpHistory.length, sub: "Total XP-earning actions", icon: Target, color: "text-amber-400",   bg: "bg-amber-500/10",   bar: "bg-amber-500"   },
    { label: "Interview Score", value: avgScore,         sub: "Avg across sessions",      icon: Trophy, color: "text-violet-400",  bg: "bg-violet-500/10",  bar: "bg-violet-500"  },
  ];

  const ACTIVITY = sessions.length > 0
    ? sessions.slice(0, 4).map(function(s) {
        return {
          icon:   MessageSquare,
          label:  "Interview: " + s.topic,
          time:   s.date + " · " + s.difficulty,
          score:  s.score + "/10",
          iconBg: "bg-violet-500/10 text-violet-400",
          path:   "/interview",
        };
      })
    : [
        { icon: GitBranch,     label: "Visualize an algorithm",  time: "DSA Visualizer",   score: "+10 XP", iconBg: "bg-emerald-500/10 text-emerald-400", path: "/dsa"        },
        { icon: MessageSquare, label: "Start a mock interview",   time: "Interview Coach",  score: "+20 XP", iconBg: "bg-violet-500/10 text-violet-400",   path: "/interview"  },
        { icon: Code2,         label: "Review your code with AI", time: "AI Code Review",   score: "+15 XP", iconBg: "bg-green-500/10 text-green-400",     path: "/review"     },
        { icon: Flame,         label: "Solve a daily challenge",  time: "Daily Challenges", score: "+25 XP", iconBg: "bg-orange-500/10 text-orange-400",   path: "/challenges" },
      ];

  return (
    <div className="space-y-5 max-w-7xl">

      {/* ── GREETING + LEVEL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {greeting}, {name} 👋
          </h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            {streak > 1
              ? `${streak}-day streak! Keep going — placements are getting closer!`
              : "Welcome back! Start a module to build your streak."}
          </p>
        </div>

        {/* Level badge */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 self-start">
          <span className="text-xl">{currentLevel?.icon}</span>
          <div>
            <p className={"text-xs font-semibold " + currentLevel?.color}>{currentLevel?.title}</p>
            <p className="text-[10px] text-slate-500">Level {currentLevel?.level} · {totalXP} XP</p>
          </div>
          {nextLevel && (
            <div className="ml-2 w-20">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: progress + "%" }}
                />
              </div>
              <p className="text-[9px] text-slate-600 mt-0.5 text-right">{progress}% → {nextLevel.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {STAT_CARDS.map(function(card) {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-xl p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className={"absolute top-0 left-0 right-0 h-0.5 " + card.bar} />
              <div className={"absolute top-3 right-3 w-8 h-8 rounded-lg " + card.bg + " flex items-center justify-center"}>
                <Icon size={15} className={card.color} />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className={"text-2xl font-bold " + card.color}>{card.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── PLACEMENT COUNTDOWN + QUICK ACTIONS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PlacementCountdown />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(function(action) {
            return (
              <Link
                key={action.path}
                to={action.path}
                className={"flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all " + action.color}
              >
                {action.label}
                <ArrowRight size={11} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── MODULE CARDS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">All Modules</h2>
          <span className="text-xs text-slate-500">{MODULES.length} modules</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {MODULES.map(function(mod) {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.path}
                to={mod.path}
                className={"block p-4 rounded-xl bg-slate-900 border border-slate-800 " +
                           mod.border + " hover:bg-slate-800/50 transition-all group"}
              >
                <div className={"w-9 h-9 rounded-lg " + mod.bg + " flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200"}>
                  <Icon size={17} className={mod.color} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{mod.label}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{mod.desc}</p>
                <div className="flex items-center justify-between">
                  <span className={
                    "text-[10px] px-2 py-0.5 rounded-full font-medium " +
                    (mod.status === "New"
                      ? "text-violet-400 bg-violet-500/10"
                      : "text-emerald-400 bg-emerald-500/10")
                  }>
                    {mod.status}
                  </span>
                  <ArrowRight size={12} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── MODULE COMPLETION + RECENT ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModuleCompletion />

        {/* Recent Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              {sessions.length > 0 ? "Recent Sessions" : "Suggested Actions"}
            </h3>
            <Link to="/progress" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-1">
            {ACTIVITY.map(function(item, i) {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  onClick={function() { navigate(item.path); }}
                  className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0 cursor-pointer hover:bg-slate-800/50 rounded-lg px-2 transition-all group"
                >
                  <div className={"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 " + item.iconBg}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{item.label}</p>
                    <p className="text-[11px] text-slate-500">{item.time}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-emerald-400 font-semibold">{item.score}</span>
                    <ArrowRight size={11} className="text-slate-600 group-hover:text-slate-400 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}