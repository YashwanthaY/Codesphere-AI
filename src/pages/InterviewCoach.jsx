import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Play, Send, RotateCcw, Trophy,
  MessageSquare, ChevronRight, Lightbulb,
  CheckCircle, XCircle, BookOpen, Target,
  Clock, AlertCircle, Zap
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const TOPICS = [
  { id: "JavaScript",    label: "JavaScript",    icon: "🟨" },
  { id: "React",         label: "React",         icon: "⚛️" },
  { id: "CSS",           label: "CSS",           icon: "🎨" },
  { id: "DSA",           label: "DSA",           icon: "🌲" },
  { id: "OS",            label: "OS",            icon: "💻" },
  { id: "SQL",           label: "SQL",           icon: "🗄️" },
  { id: "Python",        label: "Python",        icon: "🐍" },
  { id: "System Design", label: "System Design", icon: "🏗️" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// Timer duration per difficulty
const TIMER_DURATIONS = {
  Easy:   90,
  Medium: 60,
  Hard:   45,
};

const TOTAL_QUESTIONS = 5;

function scoreColor(score) {
  if (score >= 8) return "text-emerald-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score) {
  if (score >= 8) return "bg-emerald-500/10 border-emerald-500/30";
  if (score >= 5) return "bg-amber-500/10 border-amber-500/30";
  return "bg-red-500/10 border-red-500/30";
}

function timerColor(seconds, total) {
  const pct = seconds / total;
  if (pct > 0.5) return "bg-emerald-500";
  if (pct > 0.25) return "bg-amber-500";
  return "bg-red-500";
}

function timerTextColor(seconds, total) {
  const pct = seconds / total;
  if (pct > 0.5) return "text-emerald-400";
  if (pct > 0.25) return "text-amber-400";
  return "text-red-400";
}

export default function InterviewCoach() {
  const [topic, setTopic]             = useState("JavaScript");
  const [difficulty, setDifficulty]   = useState("Medium");
  const [sessionState, setSessionState] = useState("setup");
  const [questionNum, setQuestionNum] = useState(0);
  const [question, setQuestion]       = useState(null);
  const [answer, setAnswer]           = useState("");
  const [feedback, setFeedback]       = useState(null);
  const [allResults, setAllResults]   = useState([]);
  const [showHint, setShowHint]       = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError]             = useState("");

  // ── TIMER STATE ───────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft]       = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [timeUsed, setTimeUsed]       = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const timerRef = useRef(null);
  const totalTime = TIMER_DURATIONS[difficulty] || 60;

  const [pastSessions, setPastSessions] = useLocalStorage("interview-sessions", []);

  // ── Timer logic ───────────────────────────────────────────────────────────
  useEffect(function() {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(function() {
        setTimeLeft(function(prev) {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            // Auto-submit with whatever answer is typed
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return function() { clearInterval(timerRef.current); };
  }, [timerActive]);

  function startTimer() {
    setTimeLeft(totalTime);
    setTimerActive(true);
    setAutoSubmitted(false);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
    setTimerActive(false);
    setTimeUsed(totalTime - timeLeft);
  }

  async function handleAutoSubmit() {
    setAutoSubmitted(true);
    setTimerActive(false);
    // If no answer typed, submit empty answer
    await submitAnswerWithText(answer || "No answer provided — time ran out.");
  }

  // ── Session flow ──────────────────────────────────────────────────────────
  async function startSession() {
    setAllResults([]);
    setQuestionNum(1);
    setAnswer("");
    setFeedback(null);
    setShowHint(false);
    setError("");
    setSessionState("question");
    await fetchQuestion();
  }

  async function fetchQuestion() {
    setLoadingQuestion(true);
    setError("");
    setQuestion(null);
    setAnswer("");
    setFeedback(null);
    setShowHint(false);
    setAutoSubmitted(false);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/interview/question",
        { topic, difficulty },
        { timeout: 30000 }
      );
      setQuestion(res.data);
      startTimer(); // ← Start timer when question loads
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("Backend not running. Start Flask server: python app.py");
      } else {
        setError("Failed to load question. Please try again.");
      }
      setSessionState("setup");
    } finally {
      setLoadingQuestion(false);
    }
  }

  // ── Submit answer ─────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!answer.trim() || !question) return;
    stopTimer();
    await submitAnswerWithText(answer.trim());
  }

  async function submitAnswerWithText(answerText) {
    setLoadingFeedback(true);
    setError("");
    const usedTime = totalTime - timeLeft;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/interview/evaluate",
        {
          question: question.question,
          answer:   answerText,
          topic,
        },
        { timeout: 30000 }
      );

      const fb = res.data;

      // Apply time penalty if answered too slowly
      var finalScore = fb.score;
      if (usedTime > totalTime * 0.8 && finalScore > 3) {
        finalScore = Math.max(finalScore - 1, 1);
        fb.feedback = fb.feedback + " (Note: -1 point for slow response time)";
      }

      fb.score = finalScore;
      setFeedback(fb);
      setSessionState("feedback");
      setTimeUsed(usedTime);

      setAllResults(function(prev) {
        return [...prev, {
          question:   question.question,
          answer:     answerText,
          score:      finalScore,
          feedback:   fb.feedback,
          good:       fb.what_was_good,
          missing:    fb.what_was_missing,
          model:      fb.model_answer,
          topic,
          timeUsed:   usedTime,
          autoSubmit: autoSubmitted,
        }];
      });

    } catch (err) {
      setError("Failed to evaluate. Please try again.");
    } finally {
      setLoadingFeedback(false);
    }
  }

  async function nextQuestion() {
    if (questionNum >= TOTAL_QUESTIONS) {
      const avgScore = allResults.reduce(function(s, r) { return s + r.score; }, 0) / allResults.length;
      const session = {
        id:         Date.now(),
        topic,
        difficulty,
        score:      avgScore.toFixed(1),
        questions:  TOTAL_QUESTIONS,
        date:       new Date().toLocaleDateString(),
      };
      setPastSessions(function(prev) { return [session, ...prev].slice(0, 5); });
      setSessionState("report");
    } else {
      setQuestionNum(function(n) { return n + 1; });
      setSessionState("question");
      await fetchQuestion();
    }
  }

  function reset() {
    clearInterval(timerRef.current);
    setSessionState("setup");
    setQuestion(null);
    setAnswer("");
    setFeedback(null);
    setAllResults([]);
    setQuestionNum(0);
    setError("");
    setTimerActive(false);
    setTimeLeft(60);
  }

  const progress = TOTAL_QUESTIONS > 0
    ? Math.round(((questionNum - 1) / TOTAL_QUESTIONS) * 100) : 0;

  const avgScore = allResults.length > 0
    ? (allResults.reduce(function(s, r) { return s + r.score; }, 0) / allResults.length).toFixed(1)
    : 0;

  const timerPct = (timeLeft / totalTime) * 100;

  return (
    <div className="space-y-5 max-w-4xl">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">AI Interview Coach</h1>
          <p className="text-sm text-slate-400 mt-1">
            AI generates questions, scores your answers, and gives detailed feedback
          </p>
        </div>
        {sessionState !== "setup" && (
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-all"
          >
            <RotateCcw size={14} /> New Session
          </button>
        )}
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">⚠ {error}</p>
        </div>
      )}

      {/* ════════════════════════════════════════
          SETUP SCREEN
      ════════════════════════════════════════ */}
      {sessionState === "setup" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">

              {/* Topic selector */}
              <div>
                <p className="text-sm font-semibold text-white mb-3">Select Topic</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TOPICS.map(function(t) {
                    return (
                      <button
                        key={t.id}
                        onClick={function() { setTopic(t.id); }}
                        className={"flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border transition-all " +
                          (topic === t.id
                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-slate-700 text-slate-400 hover:border-slate-600")}
                      >
                        <span>{t.icon}</span> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <p className="text-sm font-semibold text-white mb-3">Difficulty Level</p>
                <div className="flex gap-3">
                  {DIFFICULTIES.map(function(d) {
                    const colors = {
                      Easy:   "border-emerald-500 bg-emerald-500/10 text-emerald-400",
                      Medium: "border-amber-500 bg-amber-500/10 text-amber-400",
                      Hard:   "border-red-500 bg-red-500/10 text-red-400",
                    };
                    return (
                      <button
                        key={d}
                        onClick={function() { setDifficulty(d); }}
                        className={"flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all " +
                          (difficulty === d ? colors[d] : "border-slate-700 text-slate-400 hover:border-slate-600")}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timer info */}
              <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-4 py-3">
                <Clock size={16} className="text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Time limit: {TIMER_DURATIONS[difficulty]}s per question
                  </p>
                  <p className="text-xs text-slate-500">
                    Timer starts when question loads · -1 point if you use 80%+ of time
                  </p>
                </div>
              </div>

              {/* Start button */}
              <button
                onClick={startSession}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white transition-all"
              >
                <Play size={16} />
                Start Interview ({TOTAL_QUESTIONS} Questions · {TIMER_DURATIONS[difficulty]}s each)
              </button>
            </div>

            {/* Past sessions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy size={14} className="text-amber-400" /> Past Sessions
              </h3>
              {pastSessions.length === 0 ? (
                <p className="text-xs text-slate-500">No sessions yet. Start your first interview!</p>
              ) : (
                <div className="space-y-2">
                  {pastSessions.map(function(s) {
                    return (
                      <div key={s.id} className="bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-300">{s.topic}</span>
                          <span className={"text-xs font-bold " + scoreColor(parseFloat(s.score))}>
                            {s.score}/10
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{s.difficulty}</span>
                          <span>{s.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, color: "text-blue-400",    bg: "bg-blue-500/10",    title: "AI-Generated",  desc: "Unique questions every session"       },
              { icon: Clock,         color: "text-amber-400",   bg: "bg-amber-500/10",   title: "Timed Questions",desc: "Beat the clock for full marks"        },
              { icon: BookOpen,      color: "text-violet-400",  bg: "bg-violet-500/10",  title: "Final Report",   desc: "See weak topics and model answers"    },
            ].map(function(card) {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
                  <div className={"w-9 h-9 rounded-lg " + card.bg + " flex items-center justify-center flex-shrink-0"}>
                    <Icon size={16} className={card.color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{card.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          QUESTION SCREEN
      ════════════════════════════════════════ */}
      {sessionState === "question" && (
        <div className="space-y-4">

          {/* Progress bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">Question {questionNum} of {TOTAL_QUESTIONS}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-500">{topic} · {difficulty}</span>
                <span className="text-blue-400 font-medium">{progress}% done</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: progress + "%" }}
              />
            </div>
          </div>

          {loadingQuestion ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Generating {difficulty} {topic} question...</p>
            </div>
          ) : question ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">

              {/* ── TIMER ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className={timerTextColor(timeLeft, totalTime)} />
                    <span className={"text-sm font-bold font-mono " + timerTextColor(timeLeft, totalTime)}>
                      {timeLeft}s
                    </span>
                    {timeLeft <= 10 && timeLeft > 0 && (
                      <span className="text-xs text-red-400 animate-pulse font-medium">
                        Hurry up!
                      </span>
                    )}
                    {timeLeft === 0 && (
                      <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                        <AlertCircle size={12} /> Time's up!
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {totalTime}s limit
                  </span>
                </div>

                {/* Timer bar */}
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={"h-full rounded-full transition-all duration-1000 " + timerColor(timeLeft, totalTime)}
                    style={{ width: timerPct + "%" }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={15} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Question {questionNum}</p>
                  <p className="text-white text-base leading-relaxed font-medium">
                    {question.question}
                  </p>
                </div>
              </div>

              {/* Hint */}
              <div>
                <button
                  onClick={function() { setShowHint(function(h) { return !h; }); }}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Lightbulb size={13} />
                  {showHint ? "Hide hint" : "Show hint (-2s penalty)"}
                </button>
                {showHint && question.hint && (
                  <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5">
                    <p className="text-xs text-amber-300">{question.hint}</p>
                  </div>
                )}
              </div>

              {/* Answer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400">Your Answer:</label>
                  <span className="text-xs text-slate-600">{answer.length} characters</span>
                </div>
                <textarea
                  value={answer}
                  onChange={function(e) { setAnswer(e.target.value); }}
                  rows={6}
                  placeholder="Type your answer here... Be as detailed as you can."
                  disabled={timeLeft === 0}
                  className={"w-full border rounded-xl p-4 text-sm outline-none resize-none leading-relaxed transition-all " +
                    (timeLeft === 0
                      ? "bg-red-500/5 border-red-500/20 text-slate-500 cursor-not-allowed"
                      : "bg-slate-950 border-slate-700 focus:border-blue-500 text-slate-200")}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || loadingFeedback || timeLeft === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-all"
              >
                {loadingFeedback ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Evaluating your answer...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Submit Answer
                    {timeLeft > 0 && (
                      <span className="text-xs opacity-70 ml-1">({timeLeft}s left)</span>
                    )}
                  </>
                )}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* ════════════════════════════════════════
          FEEDBACK SCREEN
      ════════════════════════════════════════ */}
      {sessionState === "feedback" && feedback && (
        <div className="space-y-4">

          {/* Progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">Question {questionNum} of {TOTAL_QUESTIONS}</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-medium">Answer submitted!</span>
                {timeUsed > 0 && (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> {timeUsed}s used
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: Math.round((questionNum / TOTAL_QUESTIONS) * 100) + "%" }}
              />
            </div>
          </div>

          {/* Auto-submit warning */}
          {autoSubmitted && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-400" />
              <p className="text-red-400 text-xs">
                Time ran out — answer was auto-submitted. Try to answer faster next time!
              </p>
            </div>
          )}

          {/* Score */}
          <div className={"flex items-center gap-5 p-5 rounded-xl border " + scoreBg(feedback.score)}>
            <div className={"text-5xl font-black " + scoreColor(feedback.score)}>
              {feedback.score}
              <span className="text-xl font-normal text-slate-500">/10</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-1">{feedback.feedback}</p>
              {timeUsed > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={11} />
                  Answered in {timeUsed}s of {totalTime}s
                  {timeUsed > totalTime * 0.8 && (
                    <span className="text-amber-400">· Slow response penalty applied</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* What was good */}
          {feedback.what_was_good && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle size={15} className="text-emerald-400" /> What You Got Right
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{feedback.what_was_good}</p>
            </div>
          )}

          {/* What was missing */}
          {feedback.what_was_missing && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <XCircle size={15} className="text-red-400" /> What Was Missing
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{feedback.what_was_missing}</p>
            </div>
          )}

          {/* Model answer */}
          {feedback.model_answer && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BookOpen size={15} className="text-blue-400" /> Model Answer
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {feedback.model_answer}
              </p>
            </div>
          )}

          {/* Next button */}
          <button
            onClick={nextQuestion}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white transition-all"
          >
            {questionNum >= TOTAL_QUESTIONS ? (
              <><Trophy size={15} /> See Final Report</>
            ) : (
              <>Next Question <ChevronRight size={15} /></>
            )}
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════
          FINAL REPORT
      ════════════════════════════════════════ */}
      {sessionState === "report" && (
        <div className="space-y-5">

          {/* Overall score */}
          <div className={"p-6 rounded-xl border text-center " + scoreBg(parseFloat(avgScore))}>
            <p className="text-slate-400 text-sm mb-2">Overall Score</p>
            <p className={"text-6xl font-black mb-2 " + scoreColor(parseFloat(avgScore))}>
              {avgScore}<span className="text-2xl font-normal text-slate-500">/10</span>
            </p>
            <p className="text-slate-400 text-sm">{topic} · {difficulty} · {TOTAL_QUESTIONS} Questions</p>
          </div>

          {/* Time stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Avg Time",
                value: allResults.length > 0
                  ? Math.round(allResults.reduce(function(s, r) { return s + (r.timeUsed || 0); }, 0) / allResults.length) + "s"
                  : "—",
                color: "text-blue-400",
              },
              {
                label: "Fastest Answer",
                value: allResults.length > 0
                  ? Math.min.apply(null, allResults.map(function(r) { return r.timeUsed || totalTime; })) + "s"
                  : "—",
                color: "text-emerald-400",
              },
              {
                label: "Auto-submitted",
                value: allResults.filter(function(r) { return r.autoSubmit; }).length,
                color: "text-red-400",
              },
            ].map(function(stat) {
              return (
                <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <p className={"text-2xl font-bold " + stat.color}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Score breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {allResults.map(function(r, i) {
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20 flex-shrink-0">
                      Q{i + 1}
                      {r.timeUsed && (
                        <span className="text-slate-600 ml-1">· {r.timeUsed}s</span>
                      )}
                    </span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={"h-full rounded-full " +
                          (r.score >= 8 ? "bg-emerald-500" : r.score >= 5 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: (r.score * 10) + "%" }}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-20 justify-end">
                      {r.autoSubmit && (
                        <span title="Auto-submitted">
                          <Clock size={11} className="text-red-400" />
                        </span>
                      )}
                      <span className={"text-xs font-bold " + scoreColor(r.score)}>
                        {r.score}/10
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full review */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Full Review</h3>
            {allResults.map(function(r, i) {
              return (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-sm font-medium text-white flex-1">Q{i + 1}: {r.question}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.timeUsed && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {r.timeUsed}s
                        </span>
                      )}
                      <span className={"text-sm font-bold " + scoreColor(r.score)}>{r.score}/10</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 mb-3">
                    <p className="text-xs text-slate-500 mb-1">Your answer:</p>
                    <p className="text-xs text-slate-300">{r.answer}</p>
                  </div>
                  {r.missing && (
                    <p className="text-xs text-slate-400">
                      <span className="text-red-400 font-medium">Missing: </span>{r.missing}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={startSession}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white transition-all"
            >
              <RotateCcw size={15} /> Retry Same Topic
            </button>
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-300 transition-all"
            >
              Change Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}