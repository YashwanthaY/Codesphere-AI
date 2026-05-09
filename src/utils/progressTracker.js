// ─────────────────────────────────────────────────────────────
//  progressTracker.js
//  Central event-logging utility for CodeSphere AI
//  Usage: import { trackEvent } from "../utils/progressTracker";
//
//  Every module calls trackEvent() to log activity.
//  Data is stored in localStorage and synced to Firestore
//  by the ProgressDashboard when it mounts.
// ─────────────────────────────────────────────────────────────

// ── Keys used in localStorage ──────────────────────────────
const KEYS = {
  XP_LOG:          "cs_xpLog",           // [{date, xp, reason}]
  MODULE_VISITS:   "cs_moduleVisits",    // {moduleName: count}
  DSA_PRACTICED:   "cs_dsaPracticed",    // {algoName: count}
  INTERVIEW_LOG:   "cs_interviewLog",    // [{date, score, verdict, topic}]
  ACTIVITY_LOG:    "cs_activityLog",     // {YYYY-MM-DD: activityCount}
  CHALLENGES_LOG:  "cs_challengesLog",   // [{date, problemId, solved}]
  // Counters (already used across modules — we keep same keys)
  CODE_REVIEWS:    "cs_codeReviews",
  CODE_EXECUTIONS: "cs_codeExecutions",
  CODE_EXPLAINS:   "cs_codeExplanations",
  SQL_QUERIES:     "cs_sqlQueries",
  AI_CHAT_MSGS:    "cs_aiChatMessages",
  INTERVIEWS:      "cs_interviews",
  HIRED_VERDICTS:  "cs_hiredVerdicts",
  CHALLENGES:      "cs_challenges",
  LONGEST_STREAK:  "cs_longestStreak",
  ALGORITHMS_RUN:  "cs_algorithmsRun",
  MINUTES_SPENT:   "cs_minutesSpent",
};

// ── Helpers ────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("progressTracker: localStorage write failed", e);
  }
};

const incrementKey = (key) => {
  const current = parseInt(localStorage.getItem(key) || "0");
  localStorage.setItem(key, String(current + 1));
  return current + 1;
};

// ── Bump daily activity counter (for streak calendar) ──────
const bumpActivity = () => {
  const log = readJSON(KEYS.ACTIVITY_LOG, {});
  const d = today();
  log[d] = (log[d] || 0) + 1;
  writeJSON(KEYS.ACTIVITY_LOG, log);
};

// ─────────────────────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────────────────────

/**
 * trackXP(amount, reason)
 * Call this whenever XP is awarded so we can chart it over time.
 * Your XPContext.addXP should call this alongside its own logic.
 */
export const trackXP = (amount, reason = "Activity") => {
  const log = readJSON(KEYS.XP_LOG, []);
  const d = today();
  // Accumulate XP for the same day
  const existing = log.find((e) => e.date === d);
  if (existing) {
    existing.xp += amount;
    existing.reasons = [...(existing.reasons || []), reason];
  } else {
    log.push({ date: d, xp: amount, reasons: [reason] });
  }
  // Keep last 60 days only
  const sorted = log.sort((a, b) => a.date.localeCompare(b.date)).slice(-60);
  writeJSON(KEYS.XP_LOG, sorted);
  bumpActivity();
};

/**
 * trackModuleVisit(moduleName)
 * Call at the top of each page component inside useEffect.
 */
export const trackModuleVisit = (moduleName) => {
  const visits = readJSON(KEYS.MODULE_VISITS, {});
  visits[moduleName] = (visits[moduleName] || 0) + 1;
  writeJSON(KEYS.MODULE_VISITS, visits);
  bumpActivity();
};

/**
 * trackDSA(algorithmName)
 * Call inside DSAVisualizer when user runs a visualization.
 */
export const trackDSA = (algorithmName) => {
  const practiced = readJSON(KEYS.DSA_PRACTICED, {});
  practiced[algorithmName] = (practiced[algorithmName] || 0) + 1;
  writeJSON(KEYS.DSA_PRACTICED, practiced);
  incrementKey(KEYS.ALGORITHMS_RUN);
  bumpActivity();
};

/**
 * trackInterview(score, verdict, topic)
 * Call inside InterviewCoach when a session ends.
 */
export const trackInterview = (score, verdict, topic = "General") => {
  const log = readJSON(KEYS.INTERVIEW_LOG, []);
  log.push({ date: today(), score, verdict, topic });
  writeJSON(KEYS.INTERVIEW_LOG, log.slice(-50)); // keep last 50
  incrementKey(KEYS.INTERVIEWS);
  if (verdict === "HIRED") incrementKey(KEYS.HIRED_VERDICTS);
  bumpActivity();
};

/**
 * trackChallenge(problemId, solved)
 * Call inside DailyChallenges when user submits.
 */
export const trackChallenge = (problemId, solved) => {
  const log = readJSON(KEYS.CHALLENGES_LOG, []);
  log.push({ date: today(), problemId, solved });
  writeJSON(KEYS.CHALLENGES_LOG, log.slice(-200));
  if (solved) incrementKey(KEYS.CHALLENGES);
  bumpActivity();
};

/**
 * trackCodeReview() / trackCodeExecution() / trackCodeExplanation()
 * Call inside AICodeReviewer for each action.
 */
export const trackCodeReview = () => { incrementKey(KEYS.CODE_REVIEWS); bumpActivity(); };
export const trackCodeExecution = () => { incrementKey(KEYS.CODE_EXECUTIONS); bumpActivity(); };
export const trackCodeExplanation = () => { incrementKey(KEYS.CODE_EXPLAINS); bumpActivity(); };

/**
 * trackSQLQuery()
 * Call inside SQLPlayground when a query is executed.
 */
export const trackSQLQuery = () => { incrementKey(KEYS.SQL_QUERIES); bumpActivity(); };

/**
 * trackAIChat()
 * Call inside ChatAssistant when user sends a message.
 */
export const trackAIChat = () => { incrementKey(KEYS.AI_CHAT_MSGS); bumpActivity(); };

// ─────────────────────────────────────────────────────────────
//  READ FUNCTIONS — used by ProgressDashboard
// ─────────────────────────────────────────────────────────────

/** Returns XP log for last N days → [{date, xp}] */
export const getXPLog = (days = 7) => {
  const log = readJSON(KEYS.XP_LOG, []);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffStr = cutoff.toISOString().split("T")[0];

  // Fill in missing days with 0
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = log.find((e) => e.date === dateStr);
    result.push({
      date: dateStr,
      label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      xp: found ? found.xp : 0,
    });
  }
  return result;
};

/** Returns module visit counts → [{module, count}] sorted desc */
export const getModuleVisits = () => {
  const visits = readJSON(KEYS.MODULE_VISITS, {});
  return Object.entries(visits)
    .map(([module, count]) => ({ module, count }))
    .sort((a, b) => b.count - a.count);
};

/** Returns DSA practice data → [{algo, count, practiced: bool}] */
export const getDSAProgress = () => {
  const ALL_ALGOS = [
    "Bubble Sort", "Selection Sort", "Insertion Sort",
    "Merge Sort", "Quick Sort", "Heap Sort",
    "Binary Search", "Linked List", "Tree BFS", "Graph DFS",
  ];
  const practiced = readJSON(KEYS.DSA_PRACTICED, {});
  return ALL_ALGOS.map((algo) => ({
    algo,
    count: practiced[algo] || 0,
    practiced: !!(practiced[algo] && practiced[algo] > 0),
  }));
};

/** Returns interview history → last N sessions */
export const getInterviewLog = (limit = 10) => {
  const log = readJSON(KEYS.INTERVIEW_LOG, []);
  return log.slice(-limit).reverse(); // most recent first
};

/** Returns activity heatmap for last 30 days → [{date, count, label}] */
export const getActivityHeatmap = (days = 30) => {
  const log = readJSON(KEYS.ACTIVITY_LOG, {});
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      count: log[dateStr] || 0,
      label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    });
  }
  return result;
};

/** Returns summary counters for KPI cards */
export const getSummaryStats = () => ({
  codeReviews:     parseInt(localStorage.getItem(KEYS.CODE_REVIEWS) || "0"),
  codeExecutions:  parseInt(localStorage.getItem(KEYS.CODE_EXECUTIONS) || "0"),
  codeExplanations:parseInt(localStorage.getItem(KEYS.CODE_EXPLAINS) || "0"),
  sqlQueries:      parseInt(localStorage.getItem(KEYS.SQL_QUERIES) || "0"),
  aiChatMessages:  parseInt(localStorage.getItem(KEYS.AI_CHAT_MSGS) || "0"),
  interviews:      parseInt(localStorage.getItem(KEYS.INTERVIEWS) || "0"),
  hiredVerdicts:   parseInt(localStorage.getItem(KEYS.HIRED_VERDICTS) || "0"),
  challenges:      parseInt(localStorage.getItem(KEYS.CHALLENGES) || "0"),
  longestStreak:   parseInt(localStorage.getItem(KEYS.LONGEST_STREAK) || "0"),
  algorithmsRun:   parseInt(localStorage.getItem(KEYS.ALGORITHMS_RUN) || "0"),
});

/**
 * exportProgressForFirestore()
 * Call this to get a clean snapshot to save to Firestore.
 */
export const exportProgressForFirestore = () => ({
  xpLog:         readJSON(KEYS.XP_LOG, []),
  moduleVisits:  readJSON(KEYS.MODULE_VISITS, {}),
  dsaPracticed:  readJSON(KEYS.DSA_PRACTICED, {}),
  interviewLog:  readJSON(KEYS.INTERVIEW_LOG, []),
  activityLog:   readJSON(KEYS.ACTIVITY_LOG, {}),
  challengesLog: readJSON(KEYS.CHALLENGES_LOG, []),
  stats:         getSummaryStats(),
  lastSynced:    new Date().toISOString(),
});

/**
 * importProgressFromFirestore(data)
 * Call this on login to restore data from Firestore into localStorage.
 * Only overwrites if Firestore has more data (merge strategy).
 */
export const importProgressFromFirestore = (data) => {
  if (!data) return;

  const mergeLog = (key, firestoreArr, localArr, dateKey = "date") => {
    const merged = [...localArr];
    firestoreArr.forEach((item) => {
      if (!merged.find((l) => l[dateKey] === item[dateKey])) {
        merged.push(item);
      }
    });
    return merged.sort((a, b) => a[dateKey]?.localeCompare?.(b[dateKey]) || 0);
  };

  const mergeObj = (firestoreObj, localObj) => {
    const result = { ...localObj };
    Object.entries(firestoreObj || {}).forEach(([k, v]) => {
      result[k] = Math.max(result[k] || 0, v);
    });
    return result;
  };

  if (data.xpLog) {
    const local = readJSON(KEYS.XP_LOG, []);
    writeJSON(KEYS.XP_LOG, mergeLog(KEYS.XP_LOG, data.xpLog, local));
  }
  if (data.moduleVisits) {
    const local = readJSON(KEYS.MODULE_VISITS, {});
    writeJSON(KEYS.MODULE_VISITS, mergeObj(data.moduleVisits, local));
  }
  if (data.dsaPracticed) {
    const local = readJSON(KEYS.DSA_PRACTICED, {});
    writeJSON(KEYS.DSA_PRACTICED, mergeObj(data.dsaPracticed, local));
  }
  if (data.interviewLog) {
    const local = readJSON(KEYS.INTERVIEW_LOG, []);
    writeJSON(KEYS.INTERVIEW_LOG, mergeLog(KEYS.INTERVIEW_LOG, data.interviewLog, local));
  }
  if (data.activityLog) {
    const local = readJSON(KEYS.ACTIVITY_LOG, {});
    writeJSON(KEYS.ACTIVITY_LOG, mergeObj(data.activityLog, local));
  }

  // Merge scalar counters — take the higher value
  if (data.stats) {
    const keyMap = {
      codeReviews:      KEYS.CODE_REVIEWS,
      codeExecutions:   KEYS.CODE_EXECUTIONS,
      codeExplanations: KEYS.CODE_EXPLAINS,
      sqlQueries:       KEYS.SQL_QUERIES,
      aiChatMessages:   KEYS.AI_CHAT_MSGS,
      interviews:       KEYS.INTERVIEWS,
      hiredVerdicts:    KEYS.HIRED_VERDICTS,
      challenges:       KEYS.CHALLENGES,
      longestStreak:    KEYS.LONGEST_STREAK,
      algorithmsRun:    KEYS.ALGORITHMS_RUN,
    };
    Object.entries(keyMap).forEach(([statKey, lsKey]) => {
      const firestoreVal = data.stats[statKey] || 0;
      const localVal = parseInt(localStorage.getItem(lsKey) || "0");
      localStorage.setItem(lsKey, String(Math.max(firestoreVal, localVal)));
    });
  }
};