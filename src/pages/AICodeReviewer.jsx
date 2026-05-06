import { useState } from "react";
import {
  Play, Code2, AlertTriangle, Lightbulb,
  CheckCircle, Star, Clock, ChevronDown,
  ChevronUp, Copy, Check, Terminal, Zap,
  RotateCcw, MessageSquare
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
  java: `public class Main {
    public static int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }
    public static void main(String[] args) {
        System.out.println(factorial(10));
    }
}`,
  typescript: `function greet(name: string): string {
    return \`Hello, \${name}!\`;
}
const message: string = greet("CodeSphere");
console.log(message);`,
  sql: `-- SQL runs in the SQL Playground module
SELECT * FROM users WHERE age > 18;`,
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
  const [running, setRunning]           = useState(false);
  const [review, setReview]             = useState(null);
  const [output, setOutput]             = useState(null);
  const [error, setError]               = useState("");
  const [runError, setRunError]         = useState("");
  const [showImproved, setShowImproved] = useState(false);
  const [copied, setCopied]             = useState(false);
  const [history, setHistory]           = useLocalStorage("code-review-history", []);
  const [stdin, setStdin]               = useState("");
  const [showStdin, setShowStdin]       = useState(false);
  const [execTime, setExecTime]         = useState(null);

  // ── RUN CODE ────────────────────────────────────────────────────────────
  async function handleRun() {
    if (!code.trim()) return;
    if (language === "sql") {
      toast.error("SQL runs in the SQL Playground module!", { title: "Not Supported" });
      return;
    }
    setRunning(true);
    setRunError("");
    setOutput(null);
    const startTime = Date.now();
    try {
      const response = await fetch("http://localhost:5000/api/execute", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code, language, stdin }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Execution failed (" + response.status + ")");
      }
      const data    = await response.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      setExecTime(elapsed);
      setOutput({ stdout: data.stdout || "", stderr: data.stderr || "", exitCode: data.exitCode ?? 0 });
      if (data.exitCode === 0 && !data.stderr) {
        toast.success("Code executed in " + elapsed + "s!", { title: "✓ Run Complete" });
      } else {
        toast.error("Code ran with errors.", { title: "Runtime Error" });
      }
    } catch (err) {
      const isNetwork = err instanceof TypeError && err.message.toLowerCase().includes("fetch");
      setRunError(isNetwork
        ? "Cannot connect to backend. Make sure Flask is running on port 5000."
        : err.message || "Execution failed. Please try again.");
      toast.error("Execution failed.", { title: "Run Error" });
    } finally {
      setRunning(false);
    }
  }

  // ── EXPLAIN CODE ─────────────────────────────────────────────────────────
  async function handleExplain() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setReview(null);
    setShowImproved(false);
    try {
      const response = await fetch("http://localhost:5000/api/explain", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code, language }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Explanation failed.");
        return;
      }
      const data = await response.json();
      setReview({
        score:         null,
        summary:       "📖 Code Explanation",
        explanation:   data.explanation,
        bugs:          [],
        suggestions:   [],
        positives:     [],
        improved_code: null,
        isExplanation: true,
      });
      toast.success("Code explained line by line! +10 XP", { title: "Explanation Ready ✓" });
    } catch (err) {
      const isNetwork = err instanceof TypeError && err.message.toLowerCase().includes("fetch");
      setError(isNetwork
        ? "Cannot connect to backend. Make sure Flask is running."
        : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── AI REVIEW ────────────────────────────────────────────────────────────
  async function handleReview() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setReview(null);
    setShowImproved(false);
    try {
      const response = await fetch("http://localhost:5000/api/review", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code, language }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const message = errData.error || "Server error (" + response.status + ")";
        setError(message);
        toast.error(message, { title: "API Error" });
        return;
      }
      const data = await response.json();
      setReview(data);
      toast.xp(
        "Code scored " + data.score + "/10 — " + (data.bugs ? data.bugs.length : 0) + " issues found",
        { title: "Review Complete! +15 XP" }
      );
      setHistory(prev => [{
        id:       Date.now(),
        language,
        score:    data.score,
        summary:  data.summary,
        codeSnip: code.slice(0, 80) + (code.length > 80 ? "..." : ""),
        time:     new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 5));
    } catch (err) {
      const isNetwork = err instanceof TypeError && err.message.toLowerCase().includes("fetch");
      if (isNetwork) {
        const msg = "Cannot connect to backend. Make sure Flask is running on port 5000.";
        setError(msg);
        toast.error("Backend not running!", { title: "Connection Error" });
      } else {
        setError("Something went wrong. Please try again.");
        toast.error("Something went wrong.", { title: "Error" });
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyImproved() {
    if (!review || !review.improved_code) return;
    await navigator.clipboard.writeText(review.improved_code);
    setCopied(true);
    toast.success("Copied to clipboard!", { title: "Copied ✓" });
    setTimeout(() => setCopied(false), 2000);
  }

  function clearOutput() {
    setOutput(null);
    setRunError("");
    setExecTime(null);
  }

  const scoreColors = review && !review.isExplanation ? getScoreColor(review.score) : null;

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold text-white">AI Code Reviewer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Write code → Run it live → Explain it → Get AI review
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── LEFT — Editor ── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Language tabs */}
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => {
                  setLanguage(lang.id);
                  if (SAMPLE_CODES[lang.id]) setCode(SAMPLE_CODES[lang.id]);
                  setReview(null); setOutput(null);
                  setError(""); setRunError("");
                }}
                className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all " +
                  (language === lang.id
                    ? "border-blue-500 text-blue-400 bg-slate-800"
                    : "border-slate-700 text-slate-400 hover:border-slate-600")}
              >
                <span>{lang.icon}</span>{lang.label}
              </button>
            ))}
          </div>

          {/* Code editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                {language} · {code.split("\n").length} lines
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowStdin(p => !p)}
                  className={"text-xs px-2 py-0.5 rounded transition-colors " +
                    (showStdin ? "text-blue-400 bg-blue-500/10" : "text-slate-600 hover:text-slate-400")}
                >
                  stdin
                </button>
                <button
                  onClick={() => { setCode(""); setReview(null); setOutput(null); setError(""); setRunError(""); }}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {showStdin && (
              <div className="border-b border-slate-800 px-4 py-2 bg-slate-950">
                <p className="text-[10px] text-slate-500 mb-1">Standard Input (stdin)</p>
                <textarea
                  value={stdin}
                  onChange={e => setStdin(e.target.value)}
                  rows={2}
                  placeholder="Enter input values here..."
                  className="w-full bg-transparent text-slate-300 font-mono text-xs outline-none resize-none"
                />
              </div>
            )}

            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={16}
              spellCheck={false}
              className="w-full bg-slate-950 text-slate-200 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
              placeholder={"Paste your " + language + " code here..."}
            />
          </div>

          {/* ── 3 ACTION BUTTONS ── */}
          <div className="flex gap-3 flex-wrap">
            {/* Run */}
            <button
              onClick={handleRun}
              disabled={running || !code.trim() || language === "sql"}
              title={language === "sql" ? "Use SQL Playground module" : "Run code live"}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500
                         disabled:opacity-50 disabled:cursor-not-allowed rounded-xl
                         text-sm font-semibold text-white transition-all"
            >
              {running
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Running...</>
                : <><Terminal size={15} />Run Code</>}
            </button>

            {/* Explain */}
            <button
              onClick={handleExplain}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-500
                         disabled:opacity-50 disabled:cursor-not-allowed rounded-xl
                         text-sm font-semibold text-white transition-all"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading...</>
                : <><MessageSquare size={15} />Explain Code</>}
            </button>

            {/* Review */}
            <button
              onClick={handleReview}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed rounded-xl
                         text-sm font-semibold text-white transition-all flex-1 justify-center"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing with AI...</>
                : <><Zap size={15} />Review with AI</>}
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">⚠ {error}</p>
            </div>
          )}

          {/* ── OUTPUT PANEL ── */}
          {(output !== null || runError || running) && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-white">Output</span>
                  {execTime && (
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{execTime}s</span>
                  )}
                  {output && (
                    <span className={"text-[10px] px-2 py-0.5 rounded-full font-mono " +
                      (output.exitCode === 0 && !output.stderr
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400")}>
                      exit {output.exitCode}
                    </span>
                  )}
                </div>
                <button onClick={clearOutput}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1">
                  <RotateCcw size={11} /> Clear
                </button>
              </div>
              <div className="p-4 bg-slate-950 font-mono text-sm min-h-[80px]">
                {running && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    Executing code with AI...
                  </div>
                )}
                {runError && <p className="text-red-400">⚠ {runError}</p>}
                {output && (
                  <div className="space-y-3">
                    {output.stdout && (
                      <div>
                        <p className="text-[10px] text-slate-600 mb-1">STDOUT</p>
                        <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">{output.stdout}</pre>
                      </div>
                    )}
                    {output.stderr && (
                      <div>
                        <p className="text-[10px] text-slate-600 mb-1">STDERR</p>
                        <pre className="text-red-300 whitespace-pre-wrap leading-relaxed text-xs">{output.stderr}</pre>
                      </div>
                    )}
                    {!output.stdout && !output.stderr && (
                      <p className="text-slate-600 text-xs">
                        {output.exitCode === 0
                          ? "✓ Code ran successfully with no output."
                          : "✗ Code exited with error code " + output.exitCode}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── RESULTS (Explanation OR Review) ── */}
          {review && (
            <div className="space-y-4">

              {/* ── EXPLANATION ── */}
              {review.isExplanation && (
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageSquare size={15} className="text-violet-400" />
                    Line-by-Line Explanation
                  </h3>
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                    {review.explanation}
                  </pre>
                </div>
              )}

              {/* ── REVIEW RESULTS ── */}
              {!review.isExplanation && (
                <>
                  {/* Score card */}
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
                        <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">{review.bugs.length}</span>
                      </h3>
                      <div className="space-y-2">
                        {review.bugs.map((bug, i) => (
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
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {review.suggestions && review.suggestions.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Lightbulb size={15} className="text-amber-400" />Suggestions
                      </h3>
                      <ul className="space-y-2">
                        {review.suggestions.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-slate-300">
                            <span className="text-amber-400 flex-shrink-0">→</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Positives */}
                  {review.positives && review.positives.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <CheckCircle size={15} className="text-emerald-400" />What You Did Well
                      </h3>
                      <ul className="space-y-2">
                        {review.positives.map((p, i) => (
                          <li key={i} className="flex gap-2 text-sm text-slate-300">
                            <span className="text-emerald-400 flex-shrink-0">✓</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improved code */}
                  {review.improved_code && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowImproved(p => !p)}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800 transition-all"
                      >
                        <span className="text-sm font-semibold text-white flex items-center gap-2">
                          <Code2 size={15} className="text-blue-400" />Improved Code
                        </span>
                        {showImproved
                          ? <ChevronUp size={16} className="text-slate-400" />
                          : <ChevronDown size={16} className="text-slate-400" />}
                      </button>
                      {showImproved && (
                        <>
                          <div className="flex justify-between px-4 py-2 border-t border-b border-slate-800">
                            <button
                              onClick={() => { setCode(review.improved_code); setOutput(null); toast.success("Loaded into editor!", { title: "Loaded ✓" }); }}
                              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <Play size={11} /> Load into editor & run
                            </button>
                            <button onClick={copyImproved}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
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
                </>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT — Sidebar ── */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Star size={14} className="text-amber-400" />How It Works
            </h3>
            <div className="space-y-3">
              {[
                { step: "1", text: "Paste or write your code",               color: "bg-blue-500/20 text-blue-400"       },
                { step: "2", text: "Run Code — execute it live",              color: "bg-emerald-500/20 text-emerald-400" },
                { step: "3", text: "Explain Code — understand line by line",  color: "bg-violet-500/20 text-violet-400"   },
                { step: "4", text: "Review with AI — get bugs & suggestions", color: "bg-amber-500/20 text-amber-400"     },
              ].map(item => (
                <div key={item.step} className="flex gap-3 items-start">
                  <span className={"w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-semibold " + item.color}>
                    {item.step}
                  </span>
                  <p className="text-xs text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" />Features
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <p>→ <span className="text-emerald-400">Run</span> — live code execution</p>
              <p>→ <span className="text-violet-400">Explain</span> — line-by-line breakdown</p>
              <p>→ <span className="text-blue-400">Review</span> — bugs, score, improvements</p>
              <p>→ Supports Python, JS, C++, Java, TS</p>
              <p>→ Powered by Groq AI (llama-3.3-70b)</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />Recent Reviews
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500">No reviews yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map(item => {
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

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>→ Run first to verify output</li>
              <li>→ Use Explain to understand complex code</li>
              <li>→ Use Review to find bugs and improve</li>
              <li>→ Load improved code and run to compare</li>
              <li>→ Use stdin for interactive programs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}