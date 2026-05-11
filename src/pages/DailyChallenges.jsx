import { useState, useEffect } from "react";
import {
  Trophy, Flame, Star, CheckCircle, Clock,
  ChevronDown, ChevronUp, Zap, Lock,
  Target, Calendar, Play
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useXP } from "../context/XPContext";
import { trackModuleVisit, trackChallenge } from "../utils/progressTracker";

const CHALLENGE_BANK = [
  { id: 1,  title: "Two Sum",                       difficulty: "Easy",   topic: "Arrays",         xp: 50,  description: "Given an array of integers and a target, return indices of two numbers that add up to the target.", examples: ["Input: nums=[2,7,11,15], target=9 → Output: [0,1]", "Input: nums=[3,2,4], target=6 → Output: [1,2]"], hint: "Use a hash map to store complement values." },
  { id: 2,  title: "Valid Parentheses",             difficulty: "Easy",   topic: "Stack",          xp: 50,  description: "Given a string containing brackets, determine if it is valid.", examples: ["Input: s='()[]{}' → Output: true", "Input: s='(]' → Output: false"], hint: "Use a stack — push opening brackets, pop and check closing brackets." },
  { id: 3,  title: "Reverse Linked List",           difficulty: "Easy",   topic: "Linked List",    xp: 50,  description: "Given the head of a singly linked list, reverse it and return the reversed list.", examples: ["Input: 1→2→3→4→5 → Output: 5→4→3→2→1"], hint: "Use three pointers: prev, current, next." },
  { id: 4,  title: "Maximum Subarray",              difficulty: "Medium", topic: "DP",             xp: 100, description: "Find the contiguous subarray with the largest sum (Kadane's Algorithm).", examples: ["Input: [-2,1,-3,4,-1,2,1,-5,4] → Output: 6"], hint: "Track current sum and reset to 0 when it goes negative." },
  { id: 5,  title: "Binary Search",                difficulty: "Easy",   topic: "Search",         xp: 50,  description: "Given a sorted array and target, return the index. Return -1 if not found.", examples: ["Input: nums=[-1,0,3,5,9,12], target=9 → Output: 4"], hint: "Use left and right pointers, mid = left + (right-left)/2." },
  { id: 6,  title: "Climbing Stairs",              difficulty: "Easy",   topic: "DP",             xp: 50,  description: "You can climb 1 or 2 steps. How many distinct ways to reach the top of n stairs?", examples: ["Input: n=2 → Output: 2", "Input: n=3 → Output: 3"], hint: "Fibonacci. f(n) = f(n-1) + f(n-2)." },
  { id: 7,  title: "Merge Two Sorted Lists",       difficulty: "Easy",   topic: "Linked List",    xp: 50,  description: "Merge two sorted linked lists into one sorted list.", examples: ["Input: l1=1→2→4, l2=1→3→4 → Output: 1→1→2→3→4→4"], hint: "Use a dummy head node and compare values iteratively." },
  { id: 8,  title: "Best Time to Buy Stock",       difficulty: "Easy",   topic: "Arrays",         xp: 50,  description: "Find the maximum profit from buying and selling once.", examples: ["Input: [7,1,5,3,6,4] → Output: 5", "Input: [7,6,4,3,1] → Output: 0"], hint: "Track minimum price seen so far and max profit." },
  { id: 9,  title: "Number of Islands",            difficulty: "Medium", topic: "Graph",          xp: 100, description: "Given a 2D grid of '1's (land) and '0's (water), count the number of islands.", examples: ["Input: grid with connected 1s → Output: count"], hint: "Use DFS or BFS to mark visited land cells." },
  { id: 10, title: "Longest Common Subsequence",   difficulty: "Medium", topic: "DP",             xp: 100, description: "Given two strings, return the length of their longest common subsequence.", examples: ["Input: 'abcde', 'ace' → Output: 3"], hint: "2D DP table. dp[i][j] = LCS of text1[:i] and text2[:j]." },
  { id: 11, title: "Invert Binary Tree",           difficulty: "Easy",   topic: "Trees",          xp: 50,  description: "Given the root of a binary tree, invert it and return its root.", examples: ["Input: [4,2,7,1,3,6,9] → Output: [4,7,2,9,6,3,1]"], hint: "Swap left and right children recursively." },
  { id: 12, title: "Validate BST",                 difficulty: "Medium", topic: "Trees",          xp: 100, description: "Determine if a binary tree is a valid binary search tree.", examples: ["Input: [2,1,3] → Output: true"], hint: "Pass min/max bounds while recursing." },
  { id: 13, title: "Coin Change",                  difficulty: "Medium", topic: "DP",             xp: 100, description: "Return the fewest coins needed to make up the amount.", examples: ["Input: coins=[1,5,11], amount=15 → Output: 3"], hint: "Bottom-up DP. dp[i] = min coins to make amount i." },
  { id: 14, title: "Product Except Self",          difficulty: "Medium", topic: "Arrays",         xp: 100, description: "Return array where each element is product of all others. No division.", examples: ["Input: [1,2,3,4] → Output: [24,12,8,6]"], hint: "Use prefix and suffix product arrays." },
  { id: 15, title: "Find Median from Data Stream", difficulty: "Hard",   topic: "Heap",           xp: 200, description: "Design a structure supporting addNum and findMedian in O(log n).", examples: ["addNum(1), addNum(2), findMedian()=1.5"], hint: "Use two heaps: max-heap for lower half, min-heap for upper half." },
  { id: 16, title: "Longest Palindromic Substring",difficulty: "Medium", topic: "Strings",        xp: 100, description: "Return the longest palindromic substring.", examples: ["Input: 'babad' → Output: 'bab'"], hint: "Expand around center for each character and pair." },
  { id: 17, title: "Word Search",                  difficulty: "Medium", topic: "Backtracking",   xp: 100, description: "Find if a word exists in a 2D grid (adjacent cells only).", examples: ["Input: board, word='ABCCED' → Output: true"], hint: "DFS with backtracking. Mark visited, unmark on return." },
  { id: 18, title: "3Sum",                         difficulty: "Medium", topic: "Arrays",         xp: 100, description: "Find all unique triplets that sum to zero.", examples: ["Input: [-1,0,1,2,-1,-4] → Output: [[-1,-1,2],[-1,0,1]]"], hint: "Sort, fix one element, use two pointers for the rest." },
  { id: 19, title: "Container With Most Water",    difficulty: "Medium", topic: "Two Pointers",   xp: 100, description: "Find two lines forming a container holding the most water.", examples: ["Input: [1,8,6,2,5,4,8,3,7] → Output: 49"], hint: "Move the pointer with smaller height inward." },
  { id: 20, title: "Trapping Rain Water",          difficulty: "Hard",   topic: "Arrays",         xp: 200, description: "Compute how much water can be trapped after raining.", examples: ["Input: [0,1,0,2,1,0,1,3,2,1,2,1] → Output: 6"], hint: "water[i] = min(maxLeft, maxRight) - height[i]." },
  { id: 21, title: "LRU Cache",                    difficulty: "Medium", topic: "Design",         xp: 100, description: "Design an LRU cache with O(1) get/put.", examples: ["LRUCache(2): put(1,1), put(2,2), get(1)=1, put(3,3), get(2)=-1"], hint: "HashMap + Doubly Linked List." },
  { id: 22, title: "Course Schedule",              difficulty: "Medium", topic: "Graph",          xp: 100, description: "Can you finish all courses given prerequisites? Detect cycle.", examples: ["Input: n=2, prereqs=[[1,0]] → Output: true"], hint: "Topological sort using DFS or BFS." },
  { id: 23, title: "Minimum Window Substring",     difficulty: "Hard",   topic: "Sliding Window", xp: 200, description: "Find the minimum window in s containing all characters of t.", examples: ["Input: s='ADOBECODEBANC', t='ABC' → Output: 'BANC'"], hint: "Sliding window with two pointers and frequency map." },
  { id: 24, title: "Serialize/Deserialize Tree",   difficulty: "Hard",   topic: "Trees",          xp: 200, description: "Design an algorithm to serialize and deserialize a binary tree.", examples: ["tree → '1,2,3,null,null,4,5' → tree"], hint: "BFS or preorder. Use 'null' markers for empty nodes." },
  { id: 25, title: "Sliding Window Maximum",       difficulty: "Hard",   topic: "Queue",          xp: 200, description: "Return the maximum in each sliding window of size k.", examples: ["Input: [1,3,-1,-3,5,3,6,7], k=3 → Output: [3,3,5,5,6,7]"], hint: "Monotonic deque maintaining decreasing order." },
  { id: 26, title: "Merge K Sorted Lists",         difficulty: "Hard",   topic: "Heap",           xp: 200, description: "Merge k sorted linked lists into one sorted list.", examples: ["Input: [[1,4,5],[1,3,4],[2,6]] → Output: [1,1,2,3,4,4,5,6]"], hint: "Min-heap of size k, always extract minimum." },
  { id: 27, title: "Jump Game II",                 difficulty: "Medium", topic: "Greedy",         xp: 100, description: "Find the minimum jumps to reach the last index.", examples: ["Input: [2,3,1,1,4] → Output: 2"], hint: "Track current reach and next reach, increment jumps when needed." },
  { id: 28, title: "Decode Ways",                  difficulty: "Medium", topic: "DP",             xp: 100, description: "Count ways to decode a numeric string (A=1...Z=26).", examples: ["Input: '12' → Output: 2", "Input: '226' → Output: 3"], hint: "dp[i] depends on single digit and two-digit decodings." },
  { id: 29, title: "Longest Increasing Subsequence",difficulty: "Medium",topic: "DP",             xp: 100, description: "Find the length of the longest strictly increasing subsequence.", examples: ["Input: [10,9,2,5,3,7,101,18] → Output: 4"], hint: "dp[i] = max length ending at i. Check all previous." },
  { id: 30, title: "Word Break",                   difficulty: "Medium", topic: "DP",             xp: 100, description: "Can the string be segmented into dictionary words?", examples: ["Input: s='leetcode', dict=['leet','code'] → Output: true"], hint: "dp[i] = true if s[:i] can be segmented. Try all split points." },
];

const DIFFICULTY_COLORS = {
  Easy:   { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  Medium: { text: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/30"   },
  Hard:   { text: "text-red-400",     bg: "bg-red-500/15",     border: "border-red-500/30"     },
};

const TOPIC_COLORS = {
  Arrays: "bg-blue-500/15 text-blue-400", Stack: "bg-violet-500/15 text-violet-400",
  "Linked List": "bg-pink-500/15 text-pink-400", DP: "bg-orange-500/15 text-orange-400",
  Search: "bg-cyan-500/15 text-cyan-400", Graph: "bg-teal-500/15 text-teal-400",
  Trees: "bg-green-500/15 text-green-400", Heap: "bg-red-500/15 text-red-400",
  Strings: "bg-yellow-500/15 text-yellow-400", Backtracking: "bg-indigo-500/15 text-indigo-400",
  "Two Pointers": "bg-sky-500/15 text-sky-400", Design: "bg-rose-500/15 text-rose-400",
  "Sliding Window": "bg-lime-500/15 text-lime-400", Queue: "bg-amber-500/15 text-amber-400",
  Greedy: "bg-emerald-500/15 text-emerald-400",
};

function getTodayIndex() {
  const start = new Date("2026-01-01");
  const today = new Date();
  const diff  = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff % CHALLENGE_BANK.length;
}

function getTodayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

export default function DailyChallenges() {
  const { showToast } = useToast();
  const { awardXP }   = useXP();

  const todayIdx = getTodayIndex();
  const todayKey = getTodayKey();
  const today    = CHALLENGE_BANK[todayIdx];

  const [completed,     setCompleted]     = useLocalStorage("challenges-completed", {});
  const [streak,        setStreak]        = useLocalStorage("challenges-streak", 0);
  const [lastDate,      setLastDate]      = useLocalStorage("challenges-lastdate", "");
  const [totalXPEarned, setTotalXPEarned] = useLocalStorage("challenges-xp", 0);

  const [showHint,     setShowHint]     = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solution,     setSolution]     = useState(null);
  const [loadingSol,   setLoadingSol]   = useState(false);
  const [answer,       setAnswer]       = useState("");
  const [submitted,    setSubmitted]    = useState(false);
  const [activeTab,    setActiveTab]    = useState("today");
  const [filter,       setFilter]       = useState("All");

  const isTodayDone = !!completed[todayKey];

  useEffect(function() {
    trackModuleVisit("Daily Challenges");
  }, []);

  // Fix streak on mount if gap detected
  useEffect(function() {
    if (lastDate === "" || lastDate === todayKey) return;
    const yesterdayKey = getYesterdayKey();
    if (lastDate !== yesterdayKey) {
      setStreak(0);
    }
  }, []);

  async function fetchSolution() {
    setLoadingSol(true);
    setShowSolution(true);
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Solve this: " + today.title + "\n" + today.description + "\nGive: approach, Python code with comments, time & space complexity.",
        }),
      });
      const data = await response.json();
      setSolution(data.reply || "No solution returned.");
    } catch {
      setSolution("Could not load solution. Make sure Flask is running on port 5000.");
    } finally {
      setLoadingSol(false);
    }
  }

  function handleSubmit() {
    if (!answer.trim()) {
      showToast("Write your approach before submitting!", "error");
      return;
    }
    if (isTodayDone) {
      showToast("Already completed today's challenge!", "error");
      return;
    }

    // Mark complete
    setCompleted(function(prev) {
      return { ...prev, [todayKey]: { title: today.title, xp: today.xp, difficulty: today.difficulty } };
    });
    setLastDate(todayKey);

    // Update streak
    const yesterdayKey = getYesterdayKey();
    const newStreak = (lastDate === yesterdayKey || lastDate === "") ? streak + 1 : 1;
    setStreak(newStreak);

    // Update longest streak
    const currentLongest = parseInt(localStorage.getItem("cs_longestStreak") || "0");
    if (newStreak > currentLongest) {
      localStorage.setItem("cs_longestStreak", String(newStreak));
    }

    // ✅ Award XP via XPContext
    awardXP(today.xp, "Daily Challenge: " + today.title);
    setTotalXPEarned(function(prev) { return prev + today.xp; });

    // ✅ Track in progressTracker
    trackChallenge(today.id, true);

    setSubmitted(true);
    showToast("+" + today.xp + " XP earned! Streak: " + newStreak + " days 🔥", "success");
  }

  const completedCount = Object.keys(completed).length;
  const filteredBank   = filter === "All"
    ? CHALLENGE_BANK
    : CHALLENGE_BANK.filter(function(c) { return c.difficulty === filter; });

  return (
    <div className="space-y-5 max-w-7xl">

      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Trophy size={20} className="text-amber-400" />
          Daily Coding Challenges
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          One new problem every day — solve it, earn XP, maintain your streak
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Day Streak",  value: streak,          icon: Flame,       color: "text-orange-400", bg: "bg-orange-500/10"  },
          { label: "Completed",   value: completedCount,  icon: CheckCircle, color: "text-emerald-400",bg: "bg-emerald-500/10" },
          { label: "Total XP",    value: totalXPEarned,   icon: Zap,         color: "text-blue-400",   bg: "bg-blue-500/10"   },
          { label: "Today's XP",  value: "+" + today.xp,  icon: Star,        color: "text-amber-400",  bg: "bg-amber-500/10"  },
        ].map(function(stat) {
          return (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className={"w-8 h-8 rounded-lg flex items-center justify-center mb-2 " + stat.bg}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <p className={"text-xl font-bold " + stat.color}>{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["today", "history"].map(function(tab) {
          return (
            <button
              key={tab}
              onClick={function() { setActiveTab(tab); }}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " +
                (activeTab === tab ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200")}
            >
              {tab === "today" ? "📅 Today's Challenge" : "📚 All 30 Challenges"}
            </button>
          );
        })}
      </div>

      {/* TODAY */}
      {activeTab === "today" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-4">

            {/* Challenge */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={"text-xs px-2 py-1 rounded-lg border font-medium " + DIFFICULTY_COLORS[today.difficulty].text + " " + DIFFICULTY_COLORS[today.difficulty].bg + " " + DIFFICULTY_COLORS[today.difficulty].border}>
                    {today.difficulty}
                  </span>
                  <span className={"text-xs px-2 py-1 rounded-lg " + (TOPIC_COLORS[today.topic] || "bg-slate-700 text-slate-300")}>
                    {today.topic}
                  </span>
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">+{today.xp} XP</span>
                  {isTodayDone && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle size={11} /> Completed
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">#{todayIdx + 1}. {today.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{today.description}</p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Examples</p>
                {today.examples.map(function(ex, i) {
                  return (
                    <div key={i} className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300">{ex}</div>
                  );
                })}
              </div>
            </div>

            {/* Hint */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={function() { setShowHint(function(p) { return !p; }); }}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800 transition-all"
              >
                <span className="text-sm font-medium text-amber-400">💡 Hint</span>
                {showHint ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {showHint && (
                <div className="px-5 pb-4 text-sm text-slate-300 border-t border-slate-800 pt-3">{today.hint}</div>
              )}
            </div>

            {/* Answer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold text-white">Your Approach / Solution</p>
              <textarea
                value={answer}
                onChange={function(e) { setAnswer(e.target.value); }}
                disabled={isTodayDone}
                rows={6}
                placeholder="Write your approach, pseudocode, or full solution here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono outline-none resize-none placeholder-slate-600 focus:border-blue-500 transition-colors leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleSubmit}
                  disabled={isTodayDone || !answer.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-all"
                >
                  <CheckCircle size={15} />
                  {isTodayDone ? "Already Submitted ✓" : "Submit Solution"}
                </button>
                <button
                  onClick={fetchSolution}
                  disabled={loadingSol}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl text-sm text-slate-300 transition-all"
                >
                  <Play size={13} />
                  {loadingSol ? "Loading..." : "View AI Solution"}
                </button>
              </div>
            </div>

            {/* AI Solution */}
            {showSolution && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Star size={14} className="text-amber-400" /> AI Solution
                </p>
                {loadingSol ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    Generating solution...
                  </div>
                ) : (
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">{solution}</pre>
                )}
              </div>
            )}

            {/* Success */}
            {(isTodayDone || submitted) && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Trophy size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-semibold text-sm">Challenge Complete! 🎉</p>
                  <p className="text-emerald-600 text-xs">You earned {today.xp} XP · Streak: {streak} days 🔥 · Come back tomorrow!</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Flame size={14} className="text-orange-400" /> 28-Day Activity
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }, function(_, i) {
                  const d = new Date();
                  d.setDate(d.getDate() - (27 - i));
                  const key     = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
                  const done    = !!completed[key];
                  const isToday = i === 27;
                  return (
                    <div
                      key={i}
                      title={d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      className={"w-full aspect-square rounded-sm " +
                        (done ? "bg-emerald-500" : isToday ? "bg-blue-500/30 border border-blue-500/50" : "bg-slate-800")}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                <span>28 days ago</span><span>Today</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Target size={14} className="text-blue-400" /> Today's Info
              </h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: "Problem",    value: "#" + (todayIdx + 1) + " of 30",   cls: "text-slate-300" },
                  { label: "Topic",      value: today.topic,                        cls: TOPIC_COLORS[today.topic] || "text-slate-300" },
                  { label: "Difficulty", value: today.difficulty,                   cls: DIFFICULTY_COLORS[today.difficulty].text },
                  { label: "Reward",     value: "+" + today.xp + " XP",            cls: "text-amber-400 font-semibold" },
                  { label: "Status",     value: isTodayDone ? "✓ Done" : "Pending",cls: isTodayDone ? "text-emerald-400" : "text-slate-400" },
                ].map(function(row) {
                  return (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-slate-500">{row.label}</span>
                      <span className={row.cls}>{row.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>→ Write approach first, then code</li>
                <li>→ Use hint if stuck for 10+ mins</li>
                <li>→ View AI solution only after attempting</li>
                <li>→ Solve daily to maintain streak</li>
                <li>→ Hard problems = 4× more XP</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ALL CHALLENGES */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            {["All", "Easy", "Medium", "Hard"].map(function(d) {
              return (
                <button
                  key={d}
                  onClick={function() { setFilter(d); }}
                  className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " +
                    (filter === d ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200")}
                >
                  {d}
                </button>
              );
            })}
            <span className="text-xs text-slate-500 ml-2">{completedCount}/{CHALLENGE_BANK.length} completed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredBank.map(function(challenge) {
              const idx      = CHALLENGE_BANK.findIndex(function(c) { return c.id === challenge.id; });
              const isToday  = idx === todayIdx;
              const isFuture = idx > todayIdx;
              const isDone   = !!Object.keys(completed).find(function(k) { return completed[k].title === challenge.title; });
              const diff     = DIFFICULTY_COLORS[challenge.difficulty];
              return (
                <div
                  key={challenge.id}
                  className={"bg-slate-900 border rounded-xl p-4 transition-all " +
                    (isToday ? "border-blue-500/50 bg-blue-500/5" : isDone ? "border-emerald-500/30" : isFuture ? "border-slate-800 opacity-50" : "border-slate-800 hover:border-slate-600")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={"text-[10px] px-1.5 py-0.5 rounded border " + diff.text + " " + diff.bg + " " + diff.border}>{challenge.difficulty}</span>
                      {isToday  && <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Today</span>}
                      {isDone   && <CheckCircle size={11} className="text-emerald-400" />}
                      {isFuture && <Lock size={10} className="text-slate-600" />}
                    </div>
                    <span className="text-[10px] text-amber-400 font-medium">+{challenge.xp} XP</span>
                  </div>
                  <p className="text-sm font-medium text-white mb-1">#{challenge.id}. {challenge.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={"text-[10px] px-1.5 py-0.5 rounded " + (TOPIC_COLORS[challenge.topic] || "bg-slate-700 text-slate-400")}>{challenge.topic}</span>
                    {isToday && !isDone && (
                      <button onClick={function() { setActiveTab("today"); }} className="text-[10px] text-blue-400 hover:text-blue-300">Solve now →</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}