import { useState, useEffect } from "react";
import { Trophy, Star, Lock, CheckCircle, Zap, Flame, Code2, BookOpen, Globe, MessageSquare } from "lucide-react";
import { useXP } from "../context/XPContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

// ── BADGE DEFINITIONS ─────────────────────────────────────────────────────────
// Each badge has: id, title, desc, icon, category, rarity, condition checker
const BADGE_CATEGORIES = [
  { id: "xp",        label: "XP & Levels",     icon: Zap,          color: "text-amber-400",   bg: "bg-amber-500/10"   },
  { id: "dsa",       label: "DSA Visualizer",  icon: Code2,        color: "text-blue-400",    bg: "bg-blue-500/10"    },
  { id: "interview", label: "Interview",       icon: MessageSquare,color: "text-violet-400",  bg: "bg-violet-500/10"  },
  { id: "challenge", label: "Daily Challenges",icon: Flame,        color: "text-orange-400",  bg: "bg-orange-500/10"  },
  { id: "github",    label: "GitHub",          icon: Globe,       color: "text-slate-300",   bg: "bg-slate-500/10"   },
  { id: "general",   label: "General",         icon: Star,         color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

const RARITY_COLORS = {
  Common:    { text: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/30"   },
  Rare:      { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30"    },
  Epic:      { text: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/30"  },
  Legendary: { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
};

// ── CHECK FUNCTIONS ───────────────────────────────────────────────────────────
// Each returns true/false based on localStorage data
function check(key, fn) {
  try {
    const val = localStorage.getItem(key);
    return val ? fn(val) : false;
  } catch { return false; }
}

function getXP()              { return parseInt(localStorage.getItem("codesphere-xp") || "0"); }
function getChallenges()      { try { return JSON.parse(localStorage.getItem("challenges-completed") || "{}"); } catch { return {}; } }
function getChallengeStreak() { return parseInt(localStorage.getItem("challenges-streak") || "0"); }
function getChallengeTotalXP(){ return parseInt(localStorage.getItem("challenges-xp") || "0"); }
function getReviewHistory()   { try { return JSON.parse(localStorage.getItem("code-review-history") || "[]"); } catch { return []; } }
function getInterviewSessions(){ try { return JSON.parse(localStorage.getItem("interview-sessions") || "[]"); } catch { return []; } }
function getGitHubUsername()  { return localStorage.getItem("github-username") || ""; }
function getXPHistory()       { try { return JSON.parse(localStorage.getItem("codesphere-xp-history") || "[]"); } catch { return []; } }

const ALL_BADGES = [
  // ── XP & LEVELS ──
  { id: "xp_first",     category: "xp",        rarity: "Common",    icon: "⚡", title: "First Spark",       desc: "Earn your first XP",                        check: () => getXP() >= 1          },
  { id: "xp_50",        category: "xp",        rarity: "Common",    icon: "🔋", title: "Charged Up",         desc: "Reach 50 XP",                               check: () => getXP() >= 50         },
  { id: "xp_100",       category: "xp",        rarity: "Common",    icon: "💡", title: "Junior Dev",         desc: "Reach 100 XP and Level 2",                  check: () => getXP() >= 100        },
  { id: "xp_300",       category: "xp",        rarity: "Rare",      icon: "🔥", title: "On Fire",            desc: "Reach 300 XP and Level 3",                  check: () => getXP() >= 300        },
  { id: "xp_600",       category: "xp",        rarity: "Epic",      icon: "🚀", title: "Senior Dev",         desc: "Reach 600 XP and Level 4",                  check: () => getXP() >= 600        },
  { id: "xp_1000",      category: "xp",        rarity: "Legendary", icon: "👑", title: "Expert",             desc: "Reach 1000 XP — Maximum Level!",            check: () => getXP() >= 1000       },

  // ── DSA ──
  { id: "dsa_first",    category: "dsa",       rarity: "Common",    icon: "📊", title: "First Algorithm",    desc: "Run any DSA algorithm",                     check: () => getXP() >= 10         },
  { id: "dsa_sort",     category: "dsa",       rarity: "Common",    icon: "🔢", title: "Sorting Enthusiast", desc: "Try all 6 sorting algorithms",              check: () => getXP() >= 30         },
  { id: "dsa_tree",     category: "dsa",       rarity: "Rare",      icon: "🌲", title: "Tree Explorer",      desc: "Visualize Binary Tree BFS",                 check: () => getXP() >= 50         },
  { id: "dsa_graph",    category: "dsa",       rarity: "Rare",      icon: "🕸️", title: "Graph Master",       desc: "Complete Graph DFS visualization",          check: () => getXP() >= 70         },
  { id: "dsa_ll",       category: "dsa",       rarity: "Epic",      icon: "🔗", title: "Linked Up",          desc: "Complete all Linked List operations",       check: () => getXP() >= 100        },

  // ── CODE REVIEW ──
  { id: "review_first", category: "general",   rarity: "Common",    icon: "🔍", title: "Code Inspector",     desc: "Complete your first AI code review",        check: () => getReviewHistory().length >= 1  },
  { id: "review_5",     category: "general",   rarity: "Common",    icon: "🧐", title: "Critical Eye",       desc: "Complete 5 code reviews",                  check: () => getReviewHistory().length >= 5  },
  { id: "review_10",    category: "general",   rarity: "Rare",      icon: "🏅", title: "Code Critic",        desc: "Complete 10 code reviews",                 check: () => getReviewHistory().length >= 10 },
  { id: "review_run",   category: "general",   rarity: "Common",    icon: "▶️", title: "Live Runner",        desc: "Run code using the live executor",          check: () => getXPHistory().some(h => h.reason && h.reason.includes("executed")) },
  { id: "review_score", category: "general",   rarity: "Rare",      icon: "💯", title: "Clean Coder",        desc: "Get a code review score of 8 or higher",   check: () => getReviewHistory().some(r => r.score >= 8) },

  // ── INTERVIEW ──
  { id: "int_first",    category: "interview", rarity: "Common",    icon: "🎤", title: "First Interview",    desc: "Complete your first interview session",     check: () => getInterviewSessions().length >= 1  },
  { id: "int_3",        category: "interview", rarity: "Rare",      icon: "💼", title: "Job Seeker",         desc: "Complete 3 interview sessions",             check: () => getInterviewSessions().length >= 3  },
  { id: "int_mock",     category: "interview", rarity: "Epic",      icon: "🎯", title: "Mock Master",        desc: "Complete a Mock Interview session",         check: () => getInterviewSessions().some(s => s.isMock) },
  { id: "int_hired",    category: "interview", rarity: "Legendary", icon: "🎉", title: "HIRED!",             desc: "Score 8+ average in a Mock Interview",      check: () => getInterviewSessions().some(s => s.isMock && parseFloat(s.score) >= 8) },
  { id: "int_score",    category: "interview", rarity: "Rare",      icon: "⭐", title: "Top Performer",      desc: "Score 8+ in any interview session",         check: () => getInterviewSessions().some(s => parseFloat(s.score) >= 8) },

  // ── DAILY CHALLENGES ──
  { id: "ch_first",     category: "challenge", rarity: "Common",    icon: "📅", title: "Day One",            desc: "Complete your first daily challenge",       check: () => Object.keys(getChallenges()).length >= 1  },
  { id: "ch_5",         category: "challenge", rarity: "Common",    icon: "🔄", title: "Consistent",         desc: "Complete 5 daily challenges",               check: () => Object.keys(getChallenges()).length >= 5  },
  { id: "ch_10",        category: "challenge", rarity: "Rare",      icon: "📆", title: "Two Weeks Strong",   desc: "Complete 10 daily challenges",              check: () => Object.keys(getChallenges()).length >= 10 },
  { id: "ch_streak3",   category: "challenge", rarity: "Rare",      icon: "🔥", title: "On a Roll",          desc: "Maintain a 3-day streak",                  check: () => getChallengeStreak() >= 3  },
  { id: "ch_streak7",   category: "challenge", rarity: "Epic",      icon: "💪", title: "Week Warrior",       desc: "Maintain a 7-day streak",                  check: () => getChallengeStreak() >= 7  },
  { id: "ch_hard",      category: "challenge", rarity: "Epic",      icon: "🧠", title: "Hard Mode",          desc: "Complete a Hard difficulty challenge",      check: () => Object.values(getChallenges()).some(c => c.difficulty === "Hard") },

  // ── GITHUB ──
  { id: "gh_first",     category: "github",    rarity: "Common",    icon: "🐙", title: "GitHub Explorer",    desc: "Analyze your first GitHub profile",         check: () => getGitHubUsername().length > 0 },
  { id: "gh_100repos",  category: "github",    rarity: "Rare",      icon: "📁", title: "Prolific Coder",     desc: "Analyze a profile with 20+ repos",          check: () => getXP() >= 200         },
  { id: "portfolio",    category: "general",   rarity: "Common",    icon: "📄", title: "Portfolio Ready",    desc: "Download your portfolio",                   check: () => getXPHistory().some(h => h.reason && h.reason.toLowerCase().includes("portfolio")) },
  { id: "all_modules",  category: "general",   rarity: "Legendary", icon: "🌟", title: "Platform Master",    desc: "Use all 11 modules of CodeSphere AI",       check: () => getXP() >= 500         },
];

export default function Achievements() {
  const { totalXP, currentLevel } = useXP();
  const [unlockedBadges, setUnlockedBadges] = useLocalStorage("achievements-unlocked", []);
  const [filter, setFilter]   = useState("all");
  const [newBadges, setNewBadges] = useState([]);

  // Check all badges on mount and when XP changes
  useEffect(() => {
    const currentUnlocked = new Set(unlockedBadges);
    const justUnlocked    = [];

    ALL_BADGES.forEach(badge => {
      const earned = badge.check();
      if (earned && !currentUnlocked.has(badge.id)) {
        currentUnlocked.add(badge.id);
        justUnlocked.push(badge);
      }
    });

    if (justUnlocked.length > 0) {
      setUnlockedBadges([...currentUnlocked]);
      setNewBadges(justUnlocked);
      setTimeout(() => setNewBadges([]), 4000);
    }
  }, [totalXP]);

  const unlockedSet  = new Set(unlockedBadges);
  const unlockedCount = unlockedBadges.length;
  const totalCount    = ALL_BADGES.length;
  const percentage    = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = filter === "all"
    ? ALL_BADGES
    : filter === "unlocked"
      ? ALL_BADGES.filter(b => unlockedSet.has(b.id))
      : filter === "locked"
        ? ALL_BADGES.filter(b => !unlockedSet.has(b.id))
        : ALL_BADGES.filter(b => b.category === filter);

  return (
    <div className="space-y-5 max-w-7xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Trophy size={20} className="text-amber-400" />
          Achievements
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Unlock badges by using CodeSphere AI modules and completing challenges
        </p>
      </div>

      {/* New badge notification */}
      {newBadges.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <span className="text-2xl">{newBadges[0].icon}</span>
          <div>
            <p className="text-amber-400 font-semibold text-sm">
              🎉 New Badge Unlocked: {newBadges[0].title}
              {newBadges.length > 1 && ` +${newBadges.length - 1} more!`}
            </p>
            <p className="text-amber-600 text-xs">{newBadges[0].desc}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Unlocked",    value: unlockedCount,            color: "text-emerald-400", icon: "🏆" },
          { label: "Remaining",   value: totalCount - unlockedCount, color: "text-slate-400",  icon: "🔒" },
          { label: "Completion",  value: percentage + "%",          color: "text-blue-400",    icon: "📊" },
          { label: "Current XP",  value: totalXP,                  color: "text-amber-400",   icon: "⚡" },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-lg mb-1">{stat.icon}</p>
            <p className={"text-2xl font-bold " + stat.color}>{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Overall Progress</span>
          <span className="text-sm text-amber-400 font-bold">{unlockedCount}/{totalCount} badges</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: percentage + "%" }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0</span>
          <span>{percentage}% complete</span>
          <span>{totalCount}</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "all",      label: "All Badges" },
          { id: "unlocked", label: "✓ Unlocked" },
          { id: "locked",   label: "🔒 Locked"  },
          ...BADGE_CATEGORIES.map(c => ({ id: c.id, label: c.label })),
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " +
              (filter === f.id
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredBadges.map(badge => {
          const unlocked = unlockedSet.has(badge.id);
          const rarity   = RARITY_COLORS[badge.rarity];
          const isNew    = newBadges.some(b => b.id === badge.id);
          const cat      = BADGE_CATEGORIES.find(c => c.id === badge.category);

          return (
            <div
              key={badge.id}
              className={"rounded-xl border p-4 transition-all " +
                (unlocked
                  ? "bg-slate-900 border-slate-700 hover:border-slate-500"
                  : "bg-slate-900/50 border-slate-800 opacity-60") +
                (isNew ? " ring-2 ring-amber-500 ring-offset-1 ring-offset-slate-950" : "")}
            >
              <div className="flex items-start gap-3">
                {/* Badge icon */}
                <div className={"w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 " +
                  (unlocked ? rarity.bg : "bg-slate-800")}>
                  {unlocked ? badge.icon : <Lock size={18} className="text-slate-600" />}
                </div>

                {/* Badge info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={"text-sm font-semibold " + (unlocked ? "text-white" : "text-slate-500")}>
                      {badge.title}
                    </p>
                    {isNew && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">NEW</span>
                    )}
                  </div>
                  <p className={"text-xs mb-2 " + (unlocked ? "text-slate-400" : "text-slate-600")}>
                    {badge.desc}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Rarity */}
                    <span className={"text-[10px] px-1.5 py-0.5 rounded border " + rarity.text + " " + rarity.bg + " " + rarity.border}>
                      {badge.rarity}
                    </span>
                    {/* Category */}
                    {cat && (
                      <span className={"text-[10px] px-1.5 py-0.5 rounded " + cat.bg + " " + cat.color}>
                        {cat.label}
                      </span>
                    )}
                    {/* Unlocked check */}
                    {unlocked && (
                      <CheckCircle size={12} className="text-emerald-400 ml-auto" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rarity legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-3">Rarity Guide</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(RARITY_COLORS).map(([rarity, colors]) => (
            <div key={rarity} className={"rounded-lg p-3 border " + colors.bg + " " + colors.border}>
              <p className={"text-sm font-semibold " + colors.text}>{rarity}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {rarity === "Common"    && "Easy to unlock"}
                {rarity === "Rare"      && "Requires effort"}
                {rarity === "Epic"      && "Major milestones"}
                {rarity === "Legendary" && "Ultimate achievements"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}