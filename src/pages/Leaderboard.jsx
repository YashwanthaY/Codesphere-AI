import { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../context/AuthContext";
import { getLeaderboard } from "../services/userService";
import { Trophy, Zap, Code2, Database, Cpu, GitBranch, MessageSquare, BarChart3, Sparkles, TrendingUp, RotateCcw, Crown, RefreshCw } from "lucide-react";

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
  var next = LEVELS.find(function(l) { return l.level === current.level + 1; });
  if (!next) return 100;
  return Math.min(Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100), 100);
}

const MODULE_ACHIEVEMENTS = [
  { id: "dsa",       label: "DSA Visualizer",  icon: GitBranch,     color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", tasks: [{ id: "dsa_bubble", label: "Completed Bubble Sort", xp: 10, key: "dsa-bubble-done" }, { id: "dsa_merge", label: "Completed Merge Sort", xp: 10, key: "dsa-merge-done" }, { id: "dsa_binary", label: "Used Binary Search", xp: 10, key: "dsa-binary-done" }, { id: "dsa_selection", label: "Completed Selection Sort", xp: 10, key: "dsa-selection-done" }] },
  { id: "sql",       label: "SQL Playground",  icon: Database,      color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    tasks: [{ id: "sql_query", label: "Ran first SQL query", xp: 5, key: "sql-first-query" }, { id: "sql_join", label: "Used a JOIN query", xp: 10, key: "sql-join-used" }, { id: "sql_chart", label: "Visualized SQL results", xp: 5, key: "sql-chart-used" }, { id: "sql_10", label: "Ran 10 queries", xp: 15, key: "sql-10-queries" }] },
  { id: "os",        label: "OS Simulator",    icon: Cpu,           color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   tasks: [{ id: "os_fcfs", label: "Ran FCFS Scheduling", xp: 8, key: "os-fcfs-done" }, { id: "os_rr", label: "Ran Round Robin", xp: 8, key: "os-rr-done" }, { id: "os_page", label: "Simulated Page Replacement", xp: 6, key: "os-page-done" }, { id: "os_memory", label: "Explored Memory Management", xp: 5, key: "os-memory-done" }] },
  { id: "review",    label: "AI Code Review",  icon: Code2,         color: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20",   tasks: [{ id: "review_first", label: "Got first code review", xp: 15, key: "review-first" }, { id: "review_perfect", label: "Scored 9+ on a review", xp: 20, key: "review-9plus" }, { id: "review_5", label: "Completed 5 reviews", xp: 25, key: "review-5-done" }, { id: "review_copy", label: "Copied improved code", xp: 5, key: "review-copy-done" }] },
  { id: "interview", label: "Interview Coach", icon: MessageSquare, color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20",  tasks: [{ id: "int_first", label: "Completed first session", xp: 20, key: "int-first-session" }, { id: "int_score8", label: "Scored 8+ in session", xp: 25, key: "int-score-8plus" }, { id: "int_3sessions", label: "Completed 3 sessions", xp: 30, key: "int-3-sessions" }, { id: "int_topics", label: "Tried 3 different topics", xp: 15, key: "int-3-topics" }] },
  { id: "analytics", label: "Analytics",       icon: BarChart3,     color: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20",    tasks: [{ id: "ana_first", label: "Analyzed first GitHub profile", xp: 5, key: "ana-first" }, { id: "ana_chart", label: "Switched chart type", xp: 3, key: "ana-chart" }, { id: "ana_famous", label: "Analyzed a famous developer", xp: 5, key: "ana-famous" }, { id: "ana_5", label: "Analyzed 5 profiles", xp: 10, key: "ana-5-profiles" }] },
  { id: "portfolio", label: "Portfolio Gen",   icon: Sparkles,      color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20",    tasks: [{ id: "port_download", label: "Downloaded portfolio", xp: 10, key: "port-downloaded" }, { id: "port_preview", label: "Used preview mode", xp: 3, key: "port-previewed" }, { id: "port_theme", label: "Changed color theme", xp: 3, key: "port-theme-changed" }, { id: "port_project", label: "Added 3+ projects", xp: 5, key: "port-3-projects" }] },
];

const TABS = [
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "leaderboard",  label: "Leaderboard",  icon: Crown  },
  { id: "history",      label: "XP History",   icon: TrendingUp },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("achievements");
  const { user } = useAuth();
  const [totalXP]   = useLocalStorage("codesphere-xp", 0);
  const [xpHistory] = useLocalStorage("codesphere-xp-history", []);
  const [completed, setCompleted] = useLocalStorage("codesphere-achievements", {});
  const [board, setBoard] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);

  const currentLevel = getLevelFromXP(totalXP);
  const progress = getProgress(totalXP);
  const nextLevel = LEVELS.find(function(l) { return l.level === currentLevel.level + 1; });
  const totalCompleted = Object.values(completed).filter(Boolean).length;
  const totalAchievements = MODULE_ACHIEVEMENTS.reduce(function(s, m) { return s + m.tasks.length; }, 0);

  useEffect(function() {
    if (activeTab === "leaderboard") loadLeaderboard();
  }, [activeTab]);

  async function loadLeaderboard() {
    setBoardLoading(true);
    try {
      const data = await getLeaderboard();
      setBoard(data);
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setBoardLoading(false);
    }
  }

  function toggleAchievement(key) {
    setCompleted(function(prev) {
      var u = { ...prev };
      u[key] = !u[key];
      return u;
    });
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Leaderboard</h1>
          <p className="text-sm text-slate-400 mt-1">Track achievements, XP history, and rank among all users</p>
        </div>
        <button onClick={function() { setCompleted({}); }} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-400 transition-all">
          <RotateCcw size={12} /> Reset Achievements
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className={"flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700 " + currentLevel.bg}>
            <span className="text-3xl">{currentLevel.icon}</span>
            <div>
              <p className={"text-lg font-bold " + currentLevel.color}>{currentLevel.title}</p>
              <p className="text-xs text-slate-500">Level {currentLevel.level}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div><p className="text-2xl font-bold text-white">{totalXP}</p><p className="text-xs text-slate-500">Total XP</p></div>
            <div><p className="text-2xl font-bold text-emerald-400">{totalCompleted}</p><p className="text-xs text-slate-500">Achievements</p></div>
            <div><p className="text-2xl font-bold text-blue-400">{xpHistory.length}</p><p className="text-xs text-slate-500">Actions Done</p></div>
          </div>
          <div className="flex-1 min-w-48">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Progress to {nextLevel ? nextLevel.title : "Max Level"}</span>
              <span className="text-slate-400">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700" style={{ width: progress + "%" }} />
            </div>
            {nextLevel && <p className="text-[10px] text-slate-600 mt-1">{nextLevel.minXP - totalXP} XP needed</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg w-fit border border-slate-800">
        {TABS.map(function(tab) {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={function() { setActiveTab(tab.id); }}
              className={"flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all " + (activeTab === tab.id ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-300")}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "achievements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{totalCompleted} / {totalAchievements} achievements unlocked</p>
            <div className="h-1.5 w-48 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: (totalCompleted / totalAchievements * 100) + "%" }} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MODULE_ACHIEVEMENTS.map(function(module) {
              const Icon = module.icon;
              const doneCount = module.tasks.filter(function(t) { return completed[t.key]; }).length;
              return (
                <div key={module.id} className={"bg-slate-900 border rounded-xl p-5 " + module.border}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={"w-8 h-8 rounded-lg flex items-center justify-center " + module.bg}><Icon size={16} className={module.color} /></div>
                      <span className="text-sm font-semibold text-white">{module.label}</span>
                    </div>
                    <span className={"text-xs font-semibold " + module.color}>{doneCount}/{module.tasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {module.tasks.map(function(task) {
                      const isDone = completed[task.key];
                      return (
                        <div key={task.id} onClick={function() { toggleAchievement(task.key); }}
                          className={"flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all " + (isDone ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-slate-800 border border-slate-700 hover:border-slate-600")}>
                          <div className={"w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 " + (isDone ? "border-emerald-500 bg-emerald-500" : "border-slate-600")}>
                            {isDone && <span className="text-white text-[10px] font-bold">✓</span>}
                          </div>
                          <span className={"text-xs flex-1 " + (isDone ? "text-emerald-300 line-through opacity-70" : "text-slate-300")}>{task.label}</span>
                          <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + (isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-500")}>+{task.xp} XP</span>
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

      {activeTab === "leaderboard" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Real rankings from all CodeSphere AI users</p>
            <button onClick={loadLeaderboard} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              <RefreshCw size={12} className={boardLoading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
          {boardLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map(function(_, i) { return <div key={i} className="h-16 skeleton rounded-xl" />; })}</div>
          ) : board.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <Trophy size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No users yet — be the first!</p>
              <p className="text-slate-600 text-xs mt-1">Sign in and earn XP to appear here</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800"><h3 className="text-sm font-semibold text-white">All Rankings</h3></div>
              <div className="divide-y divide-slate-800">
                {board.map(function(entry, i) {
                  const isYou = user && entry.uid === user.uid;
                  const lvl   = getLevelFromXP(entry.totalXP || 0);
                  return (
                    <div key={entry.uid} className={"flex items-center gap-4 px-5 py-3 transition-all " + (isYou ? "bg-blue-500/5 border-l-2 border-blue-500" : "hover:bg-slate-800/50")}>
                      <span className={"text-sm font-bold w-6 " + (i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-700" : "text-slate-600")}>#{i + 1}</span>
                      {entry.photoURL
                        ? <img src={entry.photoURL} alt={entry.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                        : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{entry.name ? entry.name[0].toUpperCase() : "U"}</div>
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{entry.name}</p>
                          {isYou && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">You</span>}
                        </div>
                        <p className="text-xs text-slate-500">{lvl.icon} {lvl.title}</p>
                      </div>
                      <span className="text-sm font-bold text-amber-400 w-20 text-right">{entry.totalXP} XP</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0"><Zap size={14} className="text-violet-400" /></div>
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
        </div>
      )}
    </div>
  );
}