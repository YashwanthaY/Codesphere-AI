import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  Trophy, Star, Zap, Target, Code2,
  Database, Cpu, GitBranch, MessageSquare,
  BarChart3, Sparkles, Medal, TrendingUp,
  RotateCcw, Crown
} from "lucide-react";

// ── LEVEL CONFIG (same as XPContext but standalone so no hook issues) ─────────
const LEVELS = [
  { level: 1, title: "Beginner",   minXP: 0,    icon: "🌱", color: "text-slate-400",   bg: "bg-slate-500/20"   },
  { level: 2, title: "Junior Dev", minXP: 100,  icon: "💻", color: "text-blue-400",    bg: "bg-blue-500/20"    },
  { level: 3, title: "Mid Dev",    minXP: 300,  icon: "⚡", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  { level: 4, title: "Senior Dev", minXP: 600,  icon: "🚀", color: "text-violet-400",  bg: "bg-violet-500/20"  },
  { level: 5, title: "Expert",     minXP: 1000, icon: "👑", color: "text-amber-400",   bg: "bg-amber-500/20"   },
];

function getLevelFromXP(xp) {
  for (var i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

function getProgress(xp) {
  var current = getLevelFromXP(xp);
  var next    = LEVELS.find(function(l) { return l.level === current.level + 1; });
  if (!next) return 100;
  var inLevel = xp - current.minXP;
  var needed  = next.minXP - current.minXP;
  return Math.min(Math.round((inLevel / needed) * 100), 100);
}

// ── MODULE ACHIEVEMENTS CONFIG ────────────────────────────────────────────────
const MODULE_ACHIEVEMENTS = [
  {
    id:      "dsa",
    label:   "DSA Visualizer",
    icon:    GitBranch,
    color:   "text-emerald-400",
    bg:      "bg-emerald-500/10",
    border:  "border-emerald-500/20",
    tasks: [
      { id: "dsa_bubble",    label: "Completed Bubble Sort",    xp: 10, key: "dsa-bubble-done"    },
      { id: "dsa_merge",     label: "Completed Merge Sort",     xp: 10, key: "dsa-merge-done"     },
      { id: "dsa_binary",    label: "Used Binary Search",       xp: 10, key: "dsa-binary-done"    },
      { id: "dsa_selection", label: "Completed Selection Sort", xp: 10, key: "dsa-selection-done" },
    ],
  },
  {
    id:     "sql",
    label:  "SQL Playground",
    icon:   Database,
    color:  "text-cyan-400",
    bg:     "bg-cyan-500/10",
    border: "border-cyan-500/20",
    tasks: [
      { id: "sql_query",  label: "Ran first SQL query",    xp: 5,  key: "sql-first-query"  },
      { id: "sql_join",   label: "Used a JOIN query",      xp: 10, key: "sql-join-used"    },
      { id: "sql_chart",  label: "Visualized SQL results", xp: 5,  key: "sql-chart-used"   },
      { id: "sql_10",     label: "Ran 10 queries",         xp: 15, key: "sql-10-queries"   },
    ],
  },
  {
    id:     "os",
    label:  "OS Simulator",
    icon:   Cpu,
    color:  "text-amber-400",
    bg:     "bg-amber-500/10",
    border: "border-amber-500/20",
    tasks: [
      { id: "os_fcfs",   label: "Ran FCFS Scheduling",      xp: 8, key: "os-fcfs-done"   },
      { id: "os_rr",     label: "Ran Round Robin",           xp: 8, key: "os-rr-done"     },
      { id: "os_page",   label: "Simulated Page Replacement",xp: 6, key: "os-page-done"   },
      { id: "os_memory", label: "Explored Memory Management",xp: 5, key: "os-memory-done" },
    ],
  },
  {
    id:     "review",
    label:  "AI Code Review",
    icon:   Code2,
    color:  "text-green-400",
    bg:     "bg-green-500/10",
    border: "border-green-500/20",
    tasks: [
      { id: "review_first",  label: "Got first code review",    xp: 15, key: "review-first"    },
      { id: "review_perfect",label: "Scored 9+ on a review",    xp: 20, key: "review-9plus"    },
      { id: "review_5",      label: "Completed 5 reviews",      xp: 25, key: "review-5-done"   },
      { id: "review_copy",   label: "Copied improved code",     xp: 5,  key: "review-copy-done"},
    ],
  },
  {
    id:     "interview",
    label:  "Interview Coach",
    icon:   MessageSquare,
    color:  "text-violet-400",
    bg:     "bg-violet-500/10",
    border: "border-violet-500/20",
    tasks: [
      { id: "int_first",    label: "Completed first session",  xp: 20, key: "int-first-session" },
      { id: "int_score8",   label: "Scored 8+ in session",     xp: 25, key: "int-score-8plus"   },
      { id: "int_3sessions",label: "Completed 3 sessions",     xp: 30, key: "int-3-sessions"    },
      { id: "int_topics",   label: "Tried 3 different topics", xp: 15, key: "int-3-topics"      },
    ],
  },
  {
    id:     "analytics",
    label:  "Analytics",
    icon:   BarChart3,
    color:  "text-pink-400",
    bg:     "bg-pink-500/10",
    border: "border-pink-500/20",
    tasks: [
      { id: "ana_first",  label: "Analyzed first GitHub profile", xp: 5,  key: "ana-first"      },
      { id: "ana_chart",  label: "Switched chart type",           xp: 3,  key: "ana-chart"      },
      { id: "ana_famous", label: "Analyzed a famous developer",   xp: 5,  key: "ana-famous"     },
      { id: "ana_5",      label: "Analyzed 5 profiles",           xp: 10, key: "ana-5-profiles" },
    ],
  },
  {
    id:     "portfolio",
    label:  "Portfolio Gen",
    icon:   Sparkles,
    color:  "text-rose-400",
    bg:     "bg-rose-500/10",
    border: "border-rose-500/20",
    tasks: [
      { id: "port_download",label: "Downloaded portfolio",   xp: 10, key: "port-downloaded"  },
      { id: "port_preview", label: "Used preview mode",      xp: 3,  key: "port-previewed"   },
      { id: "port_theme",   label: "Changed color theme",    xp: 3,  key: "port-theme-changed"},
      { id: "port_project", label: "Added 3+ projects",      xp: 5,  key: "port-3-projects"  },
    ],
  },
];

// ── SAMPLE LEADERBOARD DATA ───────────────────────────────────────────────────
const SAMPLE_BOARD = [
  { rank: 1, name: "Rahul Verma",    college: "IIT Bombay",    xp: 850,  level: "🚀 Senior Dev",  avatar: "RV", color: "from-amber-500 to-yellow-500"   },
  { rank: 2, name: "Priya Sharma",   college: "NIT Trichy",    xp: 720,  level: "🚀 Senior Dev",  avatar: "PS", color: "from-slate-400 to-slate-500"    },
  { rank: 3, name: "Karan Singh",    college: "BITS Pilani",   xp: 640,  level: "⚡ Mid Dev",     avatar: "KS", color: "from-amber-700 to-amber-800"    },
  { rank: 4, name: "Arjun Kumar",    college: "VTU",           xp: 0,    level: "🌱 Beginner",    avatar: "AK", color: "from-blue-500 to-violet-500", isYou: true },
  { rank: 5, name: "Sneha Patel",    college: "DTU Delhi",     xp: 380,  level: "⚡ Mid Dev",     avatar: "SP", color: "from-pink-500 to-rose-500"      },
  { rank: 6, name: "Vikram Nair",    college: "RVCE Bangalore",xp: 290,  level: "💻 Junior Dev",  avatar: "VN", color: "from-emerald-500 to-teal-500"   },
  { rank: 7, name: "Divya Menon",    college: "Manipal",       xp: 210,  level: "💻 Junior Dev",  avatar: "DM", color: "from-cyan-500 to-blue-500"      },
  { rank: 8, name: "Rohit Gupta",    college: "SRM Chennai",   xp: 150,  level: "💻 Junior Dev",  avatar: "RG", color: "from-violet-500 to-purple-500"  },
];

const TABS = [
  { id: "achievements", label: "Achievements",  icon: Trophy    },
  { id: "leaderboard",  label: "Leaderboard",   icon: Crown     },
  { id: "history",      label: "XP History",    icon: TrendingUp},
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("achievements");

  // Read XP from localStorage directly (no context hook)
  const [totalXP]    = useLocalStorage("codesphere-xp", 0);
  const [xpHistory]  = useLocalStorage("codesphere-xp-history", []);

  // Track completed achievements in localStorage
  const [completed, setCompleted] = useLocalStorage("codesphere-achievements", {});

  const currentLevel = getLevelFromXP(totalXP);
  const progress     = getProgress(totalXP);
  const nextLevel    = LEVELS.find(function(l) { return l.level === currentLevel.level + 1; });

  // Update leaderboard with real XP
  const board = SAMPLE_BOARD.map(function(entry) {
    if (entry.isYou) return { ...entry, xp: totalXP, level: currentLevel.icon + " " + currentLevel.title };
    return entry;
  }).sort(function(a, b) { return b.xp - a.xp; }).map(function(entry, i) {
    return { ...entry, rank: i + 1 };
  });

  // Count total completed achievements
  const totalCompleted = Object.values(completed).filter(Boolean).length;
  const totalAchievements = MODULE_ACHIEVEMENTS.reduce(function(sum, m) { return sum + m.tasks.length; }, 0);

  function toggleAchievement(key) {
    setCompleted(function(prev) {
      var updated = { ...prev };
      updated[key] = !updated[key];
      return updated;
    });
  }

  function resetAll() {
    setCompleted({});
  }

  return (
    <div className="space-y-5 max-w-7xl">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Leaderboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your achievements, XP history, and rank among peers
          </p>
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700
                     rounded-lg text-xs text-slate-400 transition-all"
        >
          <RotateCcw size={12} /> Reset Achievements
        </button>
      </div>

      {/* ── XP SUMMARY CARD ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-6 flex-wrap">

          {/* Level badge */}
          <div className={"flex items-center gap-3 px-4 py-3 rounded-xl border " +
                          currentLevel.bg + " " + currentLevel.color.replace("text-", "border-") + "/30"}>
            <span className="text-3xl">{currentLevel.icon}</span>
            <div>
              <p className={"text-lg font-bold " + currentLevel.color}>{currentLevel.title}</p>
              <p className="text-xs text-slate-500">Level {currentLevel.level}</p>
            </div>
          </div>

          {/* XP stats */}
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-white">{totalXP}</p>
              <p className="text-xs text-slate-500">Total XP</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{totalCompleted}</p>
              <p className="text-xs text-slate-500">Achievements</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{xpHistory.length}</p>
              <p className="text-xs text-slate-500">Actions Done</p>
            </div>
          </div>

          {/* Progress to next level */}
          <div className="flex-1 min-w-48">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Progress to {nextLevel ? nextLevel.title : "Max Level"}</span>
              <span className="text-slate-400">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: progress + "%" }}
              />
            </div>
            {nextLevel && (
              <p className="text-[10px] text-slate-600 mt-1">
                {nextLevel.minXP - totalXP} XP needed
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg w-fit border border-slate-800">
        {TABS.map(function(tab) {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={function() { setActiveTab(tab.id); }}
              className={"flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all " +
                (activeTab === tab.id ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-300")}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1 — ACHIEVEMENTS
      ══════════════════════════════════════════════ */}
      {activeTab === "achievements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {totalCompleted} / {totalAchievements} achievements unlocked
            </p>
            <div className="h-1.5 w-48 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: (totalCompleted / totalAchievements * 100) + "%" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MODULE_ACHIEVEMENTS.map(function(module) {
              const Icon = module.icon;
              const doneCount = module.tasks.filter(function(t) { return completed[t.key]; }).length;

              return (
                <div key={module.id}
                     className={"bg-slate-900 border rounded-xl p-5 " + module.border}>
                  {/* Module header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={"w-8 h-8 rounded-lg flex items-center justify-center " + module.bg}>
                        <Icon size={16} className={module.color} />
                      </div>
                      <span className="text-sm font-semibold text-white">{module.label}</span>
                    </div>
                    <span className={"text-xs font-semibold " + module.color}>
                      {doneCount}/{module.tasks.length}
                    </span>
                  </div>

                  {/* Achievement tasks */}
                  <div className="space-y-2">
                    {module.tasks.map(function(task) {
                      const isDone = completed[task.key];
                      return (
                        <div
                          key={task.id}
                          onClick={function() { toggleAchievement(task.key); }}
                          className={"flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all " +
                            (isDone
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-slate-800 border border-slate-700 hover:border-slate-600")}
                        >
                          {/* Checkbox */}
                          <div className={"w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all " +
                            (isDone ? "border-emerald-500 bg-emerald-500" : "border-slate-600")}>
                            {isDone && <span className="text-white text-[10px] font-bold">✓</span>}
                          </div>

                          <span className={"text-xs flex-1 " + (isDone ? "text-emerald-300 line-through opacity-70" : "text-slate-300")}>
                            {task.label}
                          </span>

                          <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " +
                            (isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-500")}>
                            +{task.xp} XP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2 — LEADERBOARD
      ══════════════════════════════════════════════ */}
      {activeTab === "leaderboard" && (
        <div className="space-y-4">

          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {board.slice(0, 3).map(function(entry, i) {
              const podiumHeight = i === 0 ? "pt-0" : i === 1 ? "pt-4" : "pt-8";
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={entry.rank} className={"flex flex-col items-center " + podiumHeight}>
                  <div className={"w-14 h-14 rounded-full bg-gradient-to-br " +
                                  entry.color + " flex items-center justify-center " +
                                  "text-white font-bold text-lg mb-2 " +
                                  (entry.isYou ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950" : "")}>
                    {entry.avatar}
                  </div>
                  <p className="text-sm font-semibold text-white text-center">{entry.name}</p>
                  <p className="text-xs text-slate-500 text-center mb-1">{entry.college}</p>
                  <span className="text-lg">{medals[i]}</span>
                  <p className="text-sm font-bold text-amber-400">{entry.xp} XP</p>
                  {entry.isYou && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full mt-1">
                      You
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">All Rankings</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {board.map(function(entry) {
                return (
                  <div
                    key={entry.rank}
                    className={"flex items-center gap-4 px-5 py-3 transition-all " +
                      (entry.isYou ? "bg-blue-500/5 border-l-2 border-blue-500" : "hover:bg-slate-800/50")}
                  >
                    {/* Rank */}
                    <span className={"text-sm font-bold w-6 " +
                      (entry.rank === 1 ? "text-amber-400" :
                       entry.rank === 2 ? "text-slate-300" :
                       entry.rank === 3 ? "text-amber-700" : "text-slate-600")}>
                      #{entry.rank}
                    </span>

                    {/* Avatar */}
                    <div className={"w-9 h-9 rounded-full bg-gradient-to-br " +
                                    entry.color + " flex items-center justify-center " +
                                    "text-white text-xs font-bold flex-shrink-0"}>
                      {entry.avatar}
                    </div>

                    {/* Name + college */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{entry.name}</p>
                        {entry.isYou && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{entry.college}</p>
                    </div>

                    {/* Level */}
                    <span className="text-xs text-slate-400 hidden sm:block">{entry.level}</span>

                    {/* XP */}
                    <span className="text-sm font-bold text-amber-400 w-20 text-right">
                      {entry.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-slate-600 text-center">
            * Sample data for demonstration. Your XP updates in real time.
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 3 — XP HISTORY
      ══════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {xpHistory.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 flex flex-col items-center gap-4">
              <Zap size={40} className="text-slate-700" />
              <p className="text-slate-400 text-sm font-medium">No XP earned yet</p>
              <p className="text-slate-600 text-xs">Use any module to start earning XP!</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">XP Activity Log</h3>
                <span className="text-xs text-slate-500">{xpHistory.length} actions</span>
              </div>
              <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
                {xpHistory.map(function(entry, i) {
                  return (
                    <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/50 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <Zap size={14} className="text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200">{entry.reason}</p>
                        <p className="text-[10px] text-slate-500">{entry.date} at {entry.time}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">+{entry.amount} XP</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* XP breakdown by action */}
          {xpHistory.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">XP Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total XP",    value: totalXP,            color: "text-amber-400"   },
                  { label: "Actions",     value: xpHistory.length,   color: "text-blue-400"    },
                  { label: "Avg per action", value: xpHistory.length > 0 ? Math.round(totalXP / xpHistory.length) : 0, color: "text-emerald-400" },
                  { label: "Best action", value: xpHistory.length > 0 ? Math.max.apply(null, xpHistory.map(function(h) { return h.amount; })) : 0, color: "text-violet-400" },
                ].map(function(stat) {
                  return (
                    <div key={stat.label} className="bg-slate-800 rounded-lg p-3 text-center">
                      <p className={"text-xl font-bold " + stat.color}>{stat.value}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}