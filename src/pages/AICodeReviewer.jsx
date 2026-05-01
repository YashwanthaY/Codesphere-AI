import { useState } from "react";
import {
  Play, Code2, AlertTriangle, Lightbulb,
  CheckCircle, Star, RotateCcw, Clock,
  ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "../context/ToastContext";

const LANGUAGES = [
  { id: "python",     label: "Python",     icon: "🐍" },
  { id: "javascript", label: "JavaScript", icon: "🟨" },
  { id: "cpp",        label: "C++",        icon: "⚙️" },
  { id: "java",       label: "Java",       icon: "☕" },
  { id: "typescript", label: "TypeScript", icon: "🔷" },
  { id: "sql",        label: "SQL",        icon: "🗄️" },
];

const SAMPLE_CODES = {
  python: `def find_duplicates(arr):
    duplicates = []
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            if arr[i] == arr[j]:
                if arr[i] not in duplicates:
                    duplicates.append(arr[i])
    return duplicates

result = find_duplicates([1, 2, 3, 2, 4, 3, 5])
print(result)`,

  javascript: `function fetchUserData(userId) {
  fetch('/api/users/' + userId)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      document.getElementById('name').innerHTML = data.name
      document.getElementById('email').innerHTML = data.email
    })
}

fetchUserData(123)`,

  cpp: `#include <iostream>
using namespace std;

int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n-1);
}

int main() {
    int n = 10;
    cout << factorial(n) << endl;
    return 0;
}`,
};

function getScoreColor(score) {
  if (score >= 8) return { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" };
  if (score >= 6) return { text: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/30"   };
  return              { text: "text-red-400",     bg: "bg-red-500/15",     border: "border-red-500/30"     };
}

function getSeverityColor(severity) {
  if (severity === "high")   return "text-red-400 bg-red-500/10 border-red-500/20";
  if (severity === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return                            "text-blue-400 bg-blue-500/10 border-blue-500/20";
}

export default function AICodeReviewer() {
  const toast = useToast();

  const [code, setCode]                 = useState(SAMPLE_CODES.python);
  const [language, setLanguage]         = useState("python");
  const [loading, setLoading]           = useState(false);
  const [review, setReview]             = useState(null);
  const [error, setError]               = useState("");
  const [showImproved, setShowImproved] = useState(false);
  const [copied, setCopied]             = useState(false);
  const [history, setHistory]           = useLocalStorage("code-review-history", []);

  // ✅ FIXED: Proper fetch() syntax — was mixing axios + fetch incorrectly
  async function handleReview() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setReview(null);
    setShowImproved(false);

    try {
      const response = await fetch("http://localhost:5000/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      // ✅ fetch() does NOT throw on 4xx/5xx — must check response.ok manually
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const message = errData.error || `Server error (${response.status})`;
        setError(message);
        toast.error(message, { title: "API Error" });
        return;
      }

      // ✅ fetch() returns a Response object — must call .json() to get data
      const data = await response.json();
      setReview(data);

      toast.xp(
        "Code scored " + data.score + "/10 — " + (data.bugs ? data.bugs.length : 0) + " issues found",
        { title: "Review Complete! +15 XP" }
      );

      const historyItem = {
        id:       Date.now(),
        language,
        score:    data.score,
        summary:  data.summary,
        codeSnip: code.slice(0, 80) + (code.length > 80 ? "..." : ""),
        time:     new Date().toLocaleTimeString(),
      };
      setHistory([historyItem, ...history].slice(0, 5));

    } catch (err) {
      // ✅ fetch() throws only on network failure (no internet / backend not running)
      const isNetworkError =
        err instanceof TypeError && err.message.toLowerCase().includes("fetch");

      if (isNetworkError) {
        const msg = "Cannot connect to backend. Make sure Flask server is running on port 5000.";
        setError(msg);
        toast.error("Backend not running! Start Flask server.", { title: "Connection Error" });
      } else {
        setError("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.", { title: "Error" });
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyImproved() {
    if (!review || !review.improved_code) return;
    await navigator.clipboard.writeText(review.improved_code);
    setCopied(true);
    toast.success("Improved code copied to clipboard!", { title: "Copied ✓" });
    setTimeout(function() { setCopied(false); }, 2000);
  }

  const scoreColors = review ? getScoreColor(review.score) : null;

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold text-white">AI Code Reviewer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste any code — Gemini AI reviews it for bugs, quality, and improvements
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Left — Editor ── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Language selector */}
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(function(lang) {
              return (
                <button
                  key={lang.id}
                  onClick={function() {
                    setLanguage(lang.id);
                    if (SAMPLE_CODES[lang.id]) setCode(SAMPLE_CODES[lang.id]);
                    setReview(null);
                    setError("");
                  }}
                  className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all " +
                    (language === lang.id
                      ? "border-blue-500 text-blue-400 bg-slate-800"
                      : "border-slate-700 text-slate-400 hover:border-slate-600")}
                >
                  <span>{lang.icon}</span>
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Code editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                {language} · {code.split("\n").length} lines
              </span>
              <button
                onClick={function() { setCode(""); setReview(null); setError(""); }}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              value={code}
              onChange={function(e) { setCode(e.target.value); }}
              rows={16}
              spellCheck={false}
              className="w-full bg-slate-950 text-slate-200 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
              placeholder={"Paste your " + language + " code here..."}
            />
          </div>

          {/* Review button */}
          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed rounded-xl
                       text-sm font-semibold text-white transition-all w-full justify-center"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with Gemini AI...
              </>
            ) : (
              <>
                <Play size={15} />
                Review with AI
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">⚠ {error}</p>
            </div>
          )}

          {/* Review results */}
          {review && (
            <div className="space-y-4">

              {/* Score */}
              <div className={"flex items-center gap-5 p-5 rounded-xl border " + scoreColors.bg + " " + scoreColors.border}>
                <div className={"text-5xl font-black " + scoreColors.text}>
                  {review.score}
                  <span className="text-xl font-normal text-slate-500">/10</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">{review.summary}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-slate-400">{review.bugs ? review.bugs.length : 0} bugs found</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{review.suggestions ? review.suggestions.length : 0} suggestions</span>
                  </div>
                </div>
              </div>

              {/* Bugs */}
              {review.bugs && review.bugs.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle size={15} className="text-red-400" />
                    Issues Found
                    <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
                      {review.bugs.length}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {review.bugs.map(function(bug, i) {
                      return (
                        <div key={i} className="flex gap-3 bg-slate-800 rounded-lg p-3">
                          <span className={"text-[10px] font-bold px-2 py-0.5 rounded border self-start mt-0.5 " + getSeverityColor(bug.severity)}>
                            {bug.severity ? bug.severity.toUpperCase() : "BUG"}
                          </span>
                          <div>
                            <p className="text-xs text-slate-300">{bug.issue}</p>
                            {bug.line && bug.line !== "general" && (
                              <p className="text-[10px] text-slate-500 mt-1">Line {bug.line}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {review.suggestions && review.suggestions.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Lightbulb size={15} className="text-amber-400" />
                    Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {review.suggestions.map(function(s, i) {
                      return (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-amber-400 flex-shrink-0">→</span>
                          {s}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Positives */}
              {review.positives && review.positives.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-400" />
                    What You Did Well
                  </h3>
                  <ul className="space-y-2">
                    {review.positives.map(function(p, i) {
                      return (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-emerald-400 flex-shrink-0">✓</span>
                          {p}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Improved code */}
              {review.improved_code && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={function() { setShowImproved(function(p) { return !p; }); }}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800 transition-all"
                  >
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Code2 size={15} className="text-blue-400" />
                      Improved Code
                    </span>
                    {showImproved
                      ? <ChevronUp size={16} className="text-slate-400" />
                      : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {showImproved && (
                    <>
                      <div className="flex justify-end px-4 py-2 border-t border-b border-slate-800">
                        <button
                          onClick={copyImproved}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          {copied
                            ? <><Check size={12} className="text-emerald-400" /> Copied!</>
                            : <><Copy size={12} /> Copy code</>}
                        </button>
                      </div>
                      <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed bg-slate-950">
                        {review.improved_code}
                      </pre>
                    </>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

        {/* ── Right — Sidebar ── */}
        <div className="space-y-4">

          {/* How it works */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Star size={14} className="text-amber-400" />
              How It Works
            </h3>
            <div className="space-y-3">
              {[
                { step: "1", text: "Paste your code in any language"              },
                { step: "2", text: "Select the programming language"              },
                { step: "3", text: "Click Review with AI"                         },
                { step: "4", text: "Get score, bugs, suggestions & improved code" },
              ].map(function(item) {
                return (
                  <div key={item.step} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center flex-shrink-0 font-semibold">
                      {item.step}
                    </span>
                    <p className="text-xs text-slate-400">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              Recent Reviews
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500">No reviews yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map(function(item) {
                  const colors = getScoreColor(item.score);
                  return (
                    <div key={item.id} className="bg-slate-800 rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{item.language}</span>
                        <span className={"text-xs font-bold " + colors.text}>{item.score}/10</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{item.codeSnip}</p>
                      <p className="text-[10px] text-slate-600">{item.time}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>→ Try submitting code with intentional bugs</li>
              <li>→ Compare scores before and after improvements</li>
              <li>→ Use sample codes as starting points</li>
              <li>→ Powered by Google Gemini AI</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}