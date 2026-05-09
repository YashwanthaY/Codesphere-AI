import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  Zap, Trophy, Flame, Target, Code, Brain,
  Database, MessageSquare, Calendar, TrendingUp,
  CheckCircle, Circle, BarChart2, Clock, Award,
  RefreshCw,
} from "lucide-react";
import { useXP } from "../context/XPContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  getXPLog,
  getModuleVisits,
  getDSAProgress,
  getInterviewLog,
  getActivityHeatmap,
  getSummaryStats,
  exportProgressForFirestore,
  importProgressFromFirestore,
  trackModuleVisit,
} from "../utils/progressTracker";

// ── Level config (must match XPContext) ───────────────────
const LEVELS = [
  { level: 1, label: "Beginner",  minXP: 0,    color: "#6b7280" },
  { level: 2, label: "Junior",    minXP: 200,   color: "#3b82f6" },
  { level: 3, label: "Mid Dev",   minXP: 500,   color: "#8b5cf6" },
  { level: 4, label: "Senior",    minXP: 1000,  color: "#f59e0b" },
  { level: 5, label: "Expert",    minXP: 2000,  color: "#ef4444" },
];

const getLevelInfo = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      const next = LEVELS[i + 1];
      const progress = next
        ? ((xp - LEVELS[i].minXP) / (next.minXP - LEVELS[i].minXP)) * 100
        : 100;
      return { ...LEVELS[i], next, progress: Math.min(progress, 100) };
    }
  }
  return { ...LEVELS[0], next: LEVELS[1], progress: 0 };
};

// ── Heatmap intensity colours ──────────────────────────────
const heatColor = (count) => {
  if (count === 0) return "bg-gray-100 dark:bg-gray-700";
  if (count < 3)  return "bg-green-200 dark:bg-green-900";
  if (count < 6)  return "bg-green-400 dark:bg-green-700";
  if (count < 10) return "bg-green-500 dark:bg-green-600";
  return "bg-green-600 dark:bg-green-500";
};

// ── Recharts custom tooltip ────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
export default function ProgressDashboard() {
  const { xp, level } = useXP();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [timeRange, setTimeRange] = useState(7);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // Data states
  const [xpLog, setXpLog]           = useState([]);
  const [moduleVisits, setModuleVisits] = useState([]);
  const [dsaProgress, setDsaProgress]  = useState([]);
  const [interviewLog, setInterviewLog] = useState([]);
  const [heatmap, setHeatmap]          = useState([]);
  const [stats, setStats]              = useState({});

  // Load all data
  const loadData = () => {
    setXpLog(getXPLog(timeRange));
    setModuleVisits(getModuleVisits().slice(0, 8));
    setDsaProgress(getDSAProgress());
    setInterviewLog(getInterviewLog(8));
    setHeatmap(getActivityHeatmap(30));
    setStats(getSummaryStats());
  };

  // On mount: track visit, restore from Firestore, then load
  useEffect(() => {
    trackModuleVisit("Progress Dashboard");

    const restoreFromFirestore = async () => {
      if (!user) { loadData(); return; }
      try {
        const ref = doc(db, "users", user.uid, "progress", "snapshot");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          importProgressFromFirestore(snap.data());
          setLastSynced(snap.data().lastSynced);
        }
      } catch (e) {
        console.warn("Firestore restore failed", e);
      } finally {
        loadData();
      }
    };
    restoreFromFirestore();
  }, [user]);

  // Reload charts when time range changes
  useEffect(() => { loadData(); }, [timeRange]);

  // Sync to Firestore
  const syncToFirestore = async () => {
    if (!user) { showToast("Sign in to sync your progress", "warning"); return; }
    setSyncing(true);
    try {
      const ref = doc(db, "users", user.uid, "progress", "snapshot");
      const data = exportProgressForFirestore();
      await setDoc(ref, data, { merge: true });
      setLastSynced(data.lastSynced);
      showToast("✅ Progress synced to cloud!", "success");
    } catch (e) {
      showToast("Sync failed — check your connection", "error");
    } finally {
      setSyncing(false);
    }
  };

  const levelInfo = getLevelInfo(xp);
  const practicedCount = dsaProgress.filter((d) => d.practiced).length;

  // ── Badges summary from localStorage
  const unlockedBadges = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cs_unlockedBadges") || "[]");
      return saved.length;
    } catch { return 0; }
  })();

  // ── KPI cards data ─────────────────────────────────────
  const kpiCards = [
    {
      label: "Total XP",
      value: xp.toLocaleString(),
      icon: Zap,
      color: "text-yellow-500",
      bg: "from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    {
      label: "Current Level",
      value: `Lv ${level} · ${levelInfo.label}`,
      icon: Trophy,
      color: "text-purple-500",
      bg: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
      border: "border-purple-200 dark:border-purple-800",
    },
    {
      label: "Badges Unlocked",
      value: `${unlockedBadges} / 30`,
      icon: Award,
      color: "text-orange-500",
      bg: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
      border: "border-orange-200 dark:border-orange-800",
    },
    {
      label: "Longest Streak",
      value: `${stats.longestStreak || 0} days`,
      icon: Flame,
      color: "text-red-500",
      bg: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      border: "border-red-200 dark:border-red-800",
    },
    {
      label: "Interviews Done",
      value: stats.interviews || 0,
      icon: Brain,
      color: "text-blue-500",
      bg: "from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20",
      border: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Code Reviews",
      value: stats.codeReviews || 0,
      icon: Code,
      color: "text-green-500",
      bg: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-200 dark:border-green-800",
    },
    {
      label: "SQL Queries",
      value: stats.sqlQueries || 0,
      icon: Database,
      color: "text-cyan-500",
      bg: "from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20",
      border: "border-cyan-200 dark:border-cyan-800",
    },
    {
      label: "Challenges Done",
      value: stats.challenges || 0,
      icon: Target,
      color: "text-pink-500",
      bg: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
      border: "border-pink-200 dark:border-pink-800",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Progress Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your learning journey at a glance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSynced && (
            <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
              Last synced: {new Date(lastSynced).toLocaleTimeString("en-IN")}
            </p>
          )}
          <button
            onClick={syncToFirestore}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      {/* ── Level Progress Bar ───────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              Level {level}
            </span>
            <span
              className="px-2 py-0.5 rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: levelInfo.color }}
            >
              {levelInfo.label}
            </span>
          </div>
          {levelInfo.next && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {xp} / {levelInfo.next.minXP} XP → {levelInfo.next.label}
            </span>
          )}
        </div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${levelInfo.progress}%`,
              background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.next?.color || levelInfo.color})`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
          <span>{levelInfo.minXP} XP</span>
          <span>{Math.round(levelInfo.progress)}% to next level</span>
          <span>{levelInfo.next?.minXP || "MAX"} XP</span>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpiCards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-4 flex flex-col gap-2`}
          >
            <Icon className={`w-5 h-5 ${color}`} />
            <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* XP Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">XP Over Time</h2>
            </div>
            <div className="flex gap-1">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setTimeRange(d)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    timeRange === d
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {xpLog.every((d) => d.xp === 0) ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No XP data yet — start using modules!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={xpLog}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="xp"
                  name="XP"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#xpGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Module Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Module Activity</h2>
          </div>
          {moduleVisits.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              Visit modules to see activity here
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={moduleVisits} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="module" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Visits" radius={[0, 6, 6, 0]}>
                  {moduleVisits.map((_, i) => (
                    <Cell
                      key={i}
                      fill={[
                        "#3b82f6","#8b5cf6","#ec4899","#f59e0b",
                        "#10b981","#06b6d4","#ef4444","#84cc16",
                      ][i % 8]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── DSA Progress Grid ────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-green-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">DSA Algorithms Practiced</h2>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {practicedCount} / 10 completed
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {dsaProgress.map(({ algo, count, practiced }) => (
            <div
              key={algo}
              className={`rounded-xl p-3 text-center border transition-all ${
                practiced
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                  : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
              }`}
            >
              {practiced ? (
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
              )}
              <p className={`text-xs font-semibold leading-tight ${
                practiced ? "text-green-700 dark:text-green-300" : "text-gray-400 dark:text-gray-500"
              }`}>
                {algo}
              </p>
              {count > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{count}×</p>
              )}
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${(practicedCount / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Streak Calendar + Interview History ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Activity Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Activity — Last 30 Days</h2>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {heatmap.map(({ date, count, label }) => (
              <div
                key={date}
                title={`${label}: ${count} action${count !== 1 ? "s" : ""}`}
                className={`aspect-square rounded-md cursor-default transition-transform hover:scale-110 ${heatColor(count)}`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400 dark:text-gray-500">
            <span>Less</span>
            {["bg-gray-100 dark:bg-gray-700","bg-green-200 dark:bg-green-900","bg-green-400 dark:bg-green-700","bg-green-500 dark:bg-green-600","bg-green-600 dark:bg-green-500"].map((c) => (
              <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Interview History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Interview History</h2>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.hiredVerdicts || 0} HIRED 🎉
            </span>
          </div>

          {interviewLog.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Brain className="w-8 h-8 opacity-30" />
              <p className="text-sm">No interviews yet — try Interview Coach!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {interviewLog.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {item.topic}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {item.score}/10
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                        item.verdict === "HIRED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      }`}
                    >
                      {item.verdict}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Stats Footer ───────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          All-Time Activity Summary
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
          {[
            { label: "Code Reviews",  value: stats.codeReviews || 0 },
            { label: "Code Runs",     value: stats.codeExecutions || 0 },
            { label: "Explanations",  value: stats.codeExplanations || 0 },
            { label: "SQL Queries",   value: stats.sqlQueries || 0 },
            { label: "AI Chats",      value: stats.aiChatMessages || 0 },
            { label: "Algorithms",    value: stats.algorithmsRun || 0 },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs text-blue-200">{label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}