import { useState, useEffect, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from "chart.js";
import { Play, Clock, Database, BookOpen, BarChart2, PieChart, Trash2 } from "lucide-react";
import { DATABASES } from "../utils/sqlDatabases";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "../context/ToastContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CONCEPTS = [
  {
    title: "JOIN",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    desc: "Combines rows from two or more tables based on a related column.",
    example: "SELECT s.name, c.name\nFROM students s\nJOIN courses c ON s.id = c.id;",
  },
  {
    title: "GROUP BY",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    desc: "Groups rows sharing a property so aggregate functions can be applied.",
    example: "SELECT dept, COUNT(*)\nFROM students\nGROUP BY dept;",
  },
  {
    title: "INDEX",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    desc: "Speeds up data retrieval. Like an index in a book.",
    example: "CREATE INDEX idx_dept\nON students(department);",
  },
  {
    title: "FOREIGN KEY",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    desc: "Links two tables together and enforces referential integrity.",
    example: "FOREIGN KEY(student_id)\nREFERENCES students(id);",
  },
];

const CHART_COLORS = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#a78bfa","#06b6d4","#fb7185","#84cc16"];

function getTableNames(schema) {
  const matches = schema.match(/CREATE TABLE (\w+)/gi) || [];
  return matches.map(function(m) { return m.replace(/CREATE TABLE /i, ""); });
}

export default function SQLPlayground() {
  const toast = useToast();

  const [dbName, setDbName]         = useState("students");
  const [db, setDb]                 = useState(null);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState("SELECT * FROM students ORDER BY gpa DESC;");
  const [results, setResults]       = useState(null);
  const [error, setError]           = useState("");
  const [execTime, setExecTime]     = useState(null);
  const [chartType, setChartType]   = useState(null);
  const [activeTab, setActiveTab]   = useState("editor");
  const [queryHistory, setQueryHistory] = useLocalStorage("sql-history", []);

  const editorRef = useRef(null);

  useEffect(function() {
    async function loadDb() {
      setLoading(true);
      setResults(null);
      setError("");
      try {
        const initSqlJs = (await import("sql.js")).default;
        const SQL = await initSqlJs({ locateFile: function() { return "/sql-wasm.wasm"; } });
        const database = new SQL.Database();
        database.run(DATABASES[dbName].schema);
        setDb(database);
        toast.success("Database loaded: " + DATABASES[dbName].name, { title: "Ready ✓" });
      } catch (err) {
        setError("Failed to load database: " + err.message);
        toast.error("Failed to load database", { title: "Error" });
      } finally {
        setLoading(false);
      }
    }
    loadDb();
  }, [dbName]);

  function runQuery() {
    if (!db || !query.trim()) return;
    setError("");
    setResults(null);
    setChartType(null);
    const startTime = performance.now();
    try {
      const stmt = db.exec(query);
      const elapsed = (performance.now() - startTime).toFixed(2);
      setExecTime(elapsed);
      if (stmt.length === 0) {
        setResults({ columns: [], values: [], rowCount: 0 });
        toast.success("Query executed successfully!", { title: "SQL ✓" });
      } else {
        const { columns, values } = stmt[0];
        setResults({ columns, values, rowCount: values.length });
        toast.success(values.length + " rows returned in " + elapsed + "ms", { title: "Query Complete +5 XP" });
        const newHistory = [
          { sql: query, time: new Date().toLocaleTimeString(), rows: values.length },
          ...queryHistory.slice(0, 9),
        ];
        setQueryHistory(newHistory);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { title: "SQL Error" });
      setExecTime(null);
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
  }

  function buildChartData() {
    if (!results || results.columns.length < 2) return null;
    const labels = results.values.map(function(row) { return String(row[0]); });
    const data   = results.values.map(function(row) { return Number(row[1]) || 0; });
    return {
      labels,
      datasets: [{
        label: results.columns[1],
        data,
        backgroundColor: CHART_COLORS.slice(0, labels.length),
        borderRadius: 6,
      }],
    };
  }

  const chartData = buildChartData();
  const currentDbCfg = DATABASES[dbName];

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: "#94a3b8" } } },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
    },
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold text-white">SQL Playground</h1>
        <p className="text-sm text-slate-400 mt-1">Run real SQL queries in your browser — powered by SQLite WebAssembly</p>
      </div>

      {/* Database selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Select Database:</span>
        {Object.entries(DATABASES).map(function(entry) {
          const key = entry[0];
          const cfg = entry[1];
          return (
            <button
              key={key}
              onClick={function() { setDbName(key); }}
              className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all " +
                (dbName === key
                  ? "border-slate-500 bg-slate-800 " + cfg.color
                  : "border-slate-700 text-slate-400 hover:border-slate-600")}
            >
              <span>{cfg.icon}</span>
              {cfg.name}
            </button>
          );
        })}
        {loading && (
          <span className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg w-fit border border-slate-800">
        {[
          { id: "editor",   label: "Query Editor",  icon: Database },
          { id: "concepts", label: "DBMS Concepts",  icon: BookOpen },
        ].map(function(tab) {
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

      {/* Editor Tab */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-4">

            {/* Sample queries */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-500">Try:</span>
              {currentDbCfg.sampleQueries.map(function(q, i) {
                return (
                  <button
                    key={i}
                    onClick={function() { setQuery(q.sql); }}
                    className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700"
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>

            {/* Editor */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-mono">SQL Editor</span>
                <span className="text-[10px] text-slate-600">Ctrl+Enter to run</span>
              </div>
              <textarea
                ref={editorRef}
                value={query}
                onChange={function(e) { setQuery(e.target.value); }}
                onKeyDown={handleKeyDown}
                rows={6}
                spellCheck={false}
                className="w-full bg-slate-950 text-slate-200 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
                placeholder="SELECT * FROM students;"
              />
              <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800">
                <div className="flex gap-2">
                  <button
                    onClick={runQuery}
                    disabled={loading || !db}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-sm text-white font-medium transition-all"
                  >
                    <Play size={13} /> Run Query
                  </button>
                  <button
                    onClick={function() { setQuery(""); setResults(null); setError(""); }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-all"
                  >
                    Clear
                  </button>
                </div>
                {execTime && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={11} /> {execTime}ms
                  </span>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm font-mono">⚠ {error}</p>
              </div>
            )}

            {/* Results */}
            {results && results.columns.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                  <span className="text-sm font-medium text-white">
                    Results
                    <span className="ml-2 text-xs text-slate-500">{results.rowCount} rows</span>
                  </span>
                  {chartData && (
                    <div className="flex gap-1">
                      <button
                        onClick={function() { setChartType(chartType === "bar" ? null : "bar"); }}
                        className={"flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all " +
                          (chartType === "bar" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}
                      >
                        <BarChart2 size={12} /> Bar
                      </button>
                      <button
                        onClick={function() { setChartType(chartType === "pie" ? null : "pie"); }}
                        className={"flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all " +
                          (chartType === "pie" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}
                      >
                        <PieChart size={12} /> Pie
                      </button>
                    </div>
                  )}
                </div>
                {chartType && chartData && (
                  <div className="p-4 border-b border-slate-800 bg-slate-950 max-h-56">
                    {chartType === "bar"
                      ? <Bar data={chartData} options={chartOptions} />
                      : <Pie data={chartData} options={{ responsive: true, plugins: { legend: { labels: { color: "#94a3b8" } } } }} />
                    }
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {results.columns.map(function(col) {
                          return (
                            <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                              {col}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {results.values.map(function(row, i) {
                        return (
                          <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                            {row.map(function(cell, j) {
                              return (
                                <td key={j} className="px-4 py-2.5 text-slate-300 font-mono text-xs whitespace-nowrap">
                                  {cell === null ? <span className="text-slate-600 italic">NULL</span> : String(cell)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {results && results.columns.length === 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-emerald-400 text-sm">✓ Query executed successfully. No rows returned.</p>
                
              </div>
            )}
            
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Database size={14} className={currentDbCfg.color} />
                {currentDbCfg.name} Schema
              </h3>
              <p className="text-xs text-slate-400 mb-3">{currentDbCfg.description}</p>
              <div className="space-y-2">
                {getTableNames(currentDbCfg.schema).map(function(table) {
                  return (
                    <div
                      key={table}
                      className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-700 transition-all"
                      onClick={function() { setQuery("SELECT * FROM " + table + " LIMIT 10;"); }}
                    >
                      <span className="text-xs text-slate-400">📋</span>
                      <span className="text-xs font-mono text-slate-300">{table}</span>
                      <span className="ml-auto text-[10px] text-blue-400">preview</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" /> Query History
                </h3>
                {queryHistory.length > 0 && (
                  <button
                    onClick={function() { setQueryHistory([]); toast.info("History cleared"); }}
                    className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                )}
              </div>
              {queryHistory.length === 0 ? (
                <p className="text-xs text-slate-500">No queries run yet.</p>
              ) : (
                <div className="space-y-2">
                  {queryHistory.map(function(h, i) {
                    return (
                      <div key={i} onClick={function() { setQuery(h.sql); }} className="bg-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-700 transition-all">
                        <p className="text-xs font-mono text-slate-300 truncate">{h.sql}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{h.time} · {h.rows} rows</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Concepts Tab */}
      {activeTab === "concepts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONCEPTS.map(function(concept) {
            return (
              <div key={concept.title} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className={"inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 " + concept.bg + " " + concept.color}>
                  {concept.title}
                </div>
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">{concept.desc}</p>
                <pre className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                  {concept.example}
                </pre>
                <button
                  onClick={function() { setQuery(concept.example); setActiveTab("editor"); }}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Try this query →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}