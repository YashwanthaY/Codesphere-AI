import { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Search, Star, GitFork, BookOpen,
  Users, TrendingUp, ExternalLink,
  BarChart3, RefreshCw, Globe,
} from "lucide-react";
import { fetchUser, fetchRepos, processRepos } from "../utils/githubApi";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement,
  Tooltip, Legend
);

const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python:     "#3572A5",
  Java:       "#b07219",
  "C++":      "#f34b7d",
  HTML:       "#e34c26",
  CSS:        "#563d7c",
  Go:         "#00ADD8",
  Rust:       "#dea584",
  Swift:      "#F05138",
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || "#94a3b8";
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
    y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "right", labels: { color: "#94a3b8", font: { size: 11 }, padding: 12 } },
  },
};

export default function AnalyticsDashboard() {
  const [inputVal, setInputVal]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [user, setUser]               = useState(null);
  const [repos, setRepos]             = useState([]);
  const [stats, setStats]             = useState(null);
  const [activeChart, setActiveChart] = useState("bar");

  async function handleFetch() {
    if (!inputVal.trim()) return;
    setLoading(true);
    setError("");
    setUser(null);
    setRepos([]);
    setStats(null);
    try {
      const [userData, reposData] = await Promise.all([
        fetchUser(inputVal.trim()),
        fetchRepos(inputVal.trim()),
      ]);
      setUser(userData);
      setRepos(reposData);
      setStats(processRepos(reposData));
    } catch (err) {
      setError(err.message || "Failed to fetch GitHub data");
    } finally {
      setLoading(false);
    }
  }

  const barData = stats ? {
    labels: stats.languages.map(function(i) { return i[0]; }),
    datasets: [{ label: "Repositories", data: stats.languages.map(function(i) { return i[1]; }), backgroundColor: stats.languages.map(function(i) { return getLangColor(i[0]); }), borderRadius: 6 }],
  } : null;

  const pieData = stats ? {
    labels: stats.languages.map(function(i) { return i[0]; }),
    datasets: [{ data: stats.languages.map(function(i) { return i[1]; }), backgroundColor: stats.languages.map(function(i) { return getLangColor(i[0]); }), borderWidth: 0 }],
  } : null;

  const KPI_CARDS = user && stats ? [
    { label: "Public Repos", value: user.public_repos,      icon: BookOpen,   color: "text-blue-400",    bg: "bg-blue-500/10",    bar: "bg-blue-500"    },
    { label: "Total Stars",  value: stats.totalStars,       icon: Star,       color: "text-amber-400",   bg: "bg-amber-500/10",   bar: "bg-amber-500"   },
    { label: "Total Forks",  value: stats.totalForks,       icon: GitFork,    color: "text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-500" },
    { label: "Followers",    value: user.followers,         icon: Users,      color: "text-violet-400",  bg: "bg-violet-500/10",  bar: "bg-violet-500"  },
    { label: "Following",    value: user.following,         icon: TrendingUp, color: "text-pink-400",    bg: "bg-pink-500/10",    bar: "bg-pink-500"    },
    { label: "Languages",    value: stats.languages.length, icon: Globe,      color: "text-cyan-400",    bg: "bg-cyan-500/10",    bar: "bg-cyan-500"    },
  ] : [];

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Analytics Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Power BI style GitHub analytics — enter any public GitHub username</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text" value={inputVal}
            onChange={function(e) { setInputVal(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") handleFetch(); }}
            placeholder="Enter GitHub username (e.g. torvalds)"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
          />
        </div>
        <button
          onClick={handleFetch} disabled={loading || !inputVal.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-all"
        >
          {loading ? <RefreshCw size={15} className="animate-spin" /> : <BarChart3 size={15} />}
          {loading ? "Fetching..." : "Analyze"}
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Try:</span>
        {["torvalds", "gaearon", "sindresorhus", "addyosmani"].map(function(name) {
          return (
            <button key={name} onClick={function() { setInputVal(name); }}
              className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700 transition-all">
              @{name}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">Error: {error}</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map(function(_, i) {
            return <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />;
          })}
        </div>
      )}

      {user && stats && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-5">
            <img src={user.avatar_url} alt={user.login} className="w-16 h-16 rounded-full border-2 border-slate-700" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white">{user.name || user.login}</h2>
              <p className="text-sm text-slate-400">@{user.login}</p>
              {user.bio && <p className="text-xs text-slate-500 mt-1 truncate">{user.bio}</p>}
            </div>
            <a href={"https://github.com/" + user.login} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-all">
              <ExternalLink size={13} /> View on GitHub
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {KPI_CARDS.map(function(card) {
              const Icon = card.icon;
              return (
                <div key={card.label} className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className={"absolute top-0 left-0 right-0 h-0.5 " + card.bar} />
                  <div className={"w-8 h-8 rounded-lg " + card.bg + " flex items-center justify-center mb-3"}>
                    <Icon size={15} className={card.color} />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                  <p className={"text-2xl font-bold " + card.color}>{card.value.toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Language Analytics</h3>
              <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                {["bar", "pie"].map(function(id) {
                  return (
                    <button key={id} onClick={function() { setActiveChart(id); }}
                      className={"px-3 py-1 rounded-md text-xs font-medium transition-all capitalize " +
                        (activeChart === id ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-300")}>
                      {id}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ height: "260px" }}>
              {activeChart === "bar" && barData && <Bar data={barData} options={barOptions} />}
              {activeChart === "pie" && pieData && <Pie data={pieData} options={pieOptions} />}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Star size={14} className="text-amber-400" /> Top Repositories
              </h3>
              <div className="space-y-3">
                {stats.topRepos.map(function(repo, i) {
                  return (
                    <div key={repo.id} className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
                      <span className="text-xs font-bold text-slate-500 w-5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{repo.name}</p>
                        {repo.description && <p className="text-[10px] text-slate-500 truncate mt-0.5">{repo.description}</p>}
                        {repo.language && (
                          <span className="text-[10px] mt-1 flex items-center gap-1" style={{ color: getLangColor(repo.language) }}>
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: getLangColor(repo.language) }} />
                            {repo.language}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                        <Star size={11} /> {repo.stargazers_count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen size={14} className="text-blue-400" /> Recent Repositories
              </h3>
              <div className="space-y-1">
                {repos.slice(0, 8).map(function(repo) {
                  return (
                    <div key={repo.id} className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-slate-200 truncate">{repo.name}</p>
                          {repo.fork && <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 rounded">fork</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{new Date(repo.updated_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        {repo.language && <span style={{ color: getLangColor(repo.language) }}>{repo.language}</span>}
                        <span className="flex items-center gap-0.5 text-slate-500"><Star size={10} /> {repo.stargazers_count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {!user && !loading && (
        <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-xl p-16 gap-4">
          <BarChart3 size={40} className="text-slate-700" />
          <p className="text-slate-400 text-sm font-medium">Enter a GitHub username to see their analytics</p>
          <p className="text-slate-600 text-xs">Works with any public GitHub profile</p>
        </div>
      )}
    </div>
  );
}