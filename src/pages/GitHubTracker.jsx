import { useState } from "react";
import {
  Globe, Star, GitFork, ExternalLink, Search,
  Code2, TrendingUp, Users, BookOpen, Zap,
  Calendar, RefreshCw, AlertCircle
} from "lucide-react";
import { fetchUser, fetchRepos, processRepos } from "../utils/githubApi";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "../context/ToastContext";

// ── LANGUAGE COLORS (GitHub style) ───────────────────────────────────────────
const LANG_COLORS = {
  JavaScript:  "#f1e05a", TypeScript: "#3178c6", Python:   "#3572A5",
  Java:        "#b07219", "C++":      "#f34b7d", C:        "#555555",
  "C#":        "#178600", Go:         "#00ADD8", Rust:     "#dea584",
  Ruby:        "#701516", PHP:        "#4F5D95", Swift:    "#F05138",
  Kotlin:      "#A97BFF", Dart:       "#00B4AB", HTML:     "#e34c26",
  CSS:         "#563d7c", Shell:      "#89e051", Vue:      "#41b883",
  React:       "#61dafb", default:    "#8b949e",
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || LANG_COLORS.default;
}

// ── CONTRIBUTION GRAPH (simulated from repo activity) ────────────────────────
function ContributionGraph({ repos }) {
  // Generate a 52-week x 7-day grid using repo update dates as proxy
  const weeks = 26; // show 26 weeks
  const today = new Date();

  // Build a set of "active" dates from repo push dates
  const activeDates = new Set();
  repos.forEach(repo => {
    if (repo.pushed_at) {
      const d = new Date(repo.pushed_at);
      activeDates.add(d.toDateString());
      // Add nearby days to simulate commits
      for (let i = 1; i <= 3; i++) {
        const nearby = new Date(d);
        nearby.setDate(d.getDate() - i);
        if (Math.random() > 0.4) activeDates.add(nearby.toDateString());
      }
    }
    if (repo.updated_at) {
      const d = new Date(repo.updated_at);
      activeDates.add(d.toDateString());
    }
  });

  // Build grid: weeks columns, 7 rows (days)
  const grid = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const week = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + d));
      const active = activeDates.has(date.toDateString());
      const level  = active ? Math.floor(Math.random() * 3) + 1 : 0;
      week.push({ date, level });
    }
    grid.push(week);
  }

  const levelColors = [
    "bg-slate-800",
    "bg-emerald-900",
    "bg-emerald-700",
    "bg-emerald-500",
  ];

  return (
    <div>
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => (
              <div
                key={di}
                title={day.date.toLocaleDateString()}
                className={"w-2.5 h-2.5 rounded-sm " + levelColors[day.level]}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[10px] text-slate-500">Less</span>
        {levelColors.map((c, i) => (
          <div key={i} className={"w-2.5 h-2.5 rounded-sm " + c} />
        ))}
        <span className="text-[10px] text-slate-500">More</span>
      </div>
    </div>
  );
}

// ── LANGUAGE BAR ─────────────────────────────────────────────────────────────
function LanguageBar({ languages }) {
  if (!languages || languages.length === 0) return null;
  const total = languages.reduce((s, [, c]) => s + c, 0);
  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {languages.map(([lang, count]) => (
          <div
            key={lang}
            style={{
              width: ((count / total) * 100) + "%",
              backgroundColor: getLangColor(lang),
            }}
            title={lang + ": " + Math.round((count / total) * 100) + "%"}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {languages.map(([lang, count]) => (
          <div key={lang} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: getLangColor(lang) }}
            />
            <span className="text-xs text-slate-300">{lang}</span>
            <span className="text-xs text-slate-500">
              {Math.round((count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── REPO CARD ─────────────────────────────────────────────────────────────────
function RepoCard({ repo }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={13} className="text-blue-400 flex-shrink-0" />
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 truncate transition-colors"
          >
            {repo.name}
          </a>
          {repo.fork && (
            <span className="text-[10px] text-slate-500 border border-slate-600 px-1.5 rounded">fork</span>
          )}
        </div>
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={13} className="text-slate-500 hover:text-slate-300 flex-shrink-0 transition-colors" />
        </a>
      </div>

      {repo.description && (
        <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getLangColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <Star size={11} className="text-amber-400" />
            {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={11} />
            {repo.forks_count}
          </span>
        )}
        <span className="ml-auto">
          {new Date(repo.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function GitHubTracker() {
  const toast = useToast();

  const [usernameInput, setUsernameInput] = useState("");
  const [lastUsername, setLastUsername]   = useLocalStorage("github-username", "");
  const [profile,  setProfile]            = useState(null);
  const [repos,    setRepos]              = useState([]);
  const [stats,    setStats]              = useState(null);
  const [loading,  setLoading]            = useState(false);
  const [error,    setError]              = useState("");
  const [repoFilter, setRepoFilter]       = useState("all"); // all | original | forked
  const [sortBy,   setSortBy]             = useState("updated"); // updated | stars | name
  const [search,   setSearch]             = useState("");

  async function handleFetch(username) {
    const uname = (username || usernameInput || lastUsername).trim();
    if (!uname) {
      toast.error("Enter a GitHub username!", { title: "Missing" });
      return;
    }

    setLoading(true);
    setError("");
    setProfile(null);
    setRepos([]);
    setStats(null);

    try {
      const [user, repoList] = await Promise.all([
        fetchUser(uname),
        fetchRepos(uname),
      ]);

      setProfile(user);
      setRepos(repoList);
      setStats(processRepos(repoList));
      setLastUsername(uname);
      setUsernameInput(uname);
      toast.success("Loaded " + repoList.length + " repositories!", { title: "GitHub Loaded ✓" });

    } catch (err) {
      setError(err.message || "Failed to fetch GitHub data. Check the username.");
      toast.error("Could not load GitHub profile.", { title: "Error" });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleFetch();
  }

  // Filter + sort repos
  const filteredRepos = repos
    .filter(r => {
      if (repoFilter === "original") return !r.fork;
      if (repoFilter === "forked")   return r.fork;
      return true;
    })
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
      if (sortBy === "name")  return a.name.localeCompare(b.name);
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Globe size={20} className="text-slate-300" />
          Globe Activity Tracker
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Analyse any public Globe profile — repos, languages, stars, activity
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-colors">
          <Globe size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={usernameInput}
            onChange={e => setUsernameInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter Globe username (e.g. torvalds)"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
          />
          {usernameInput && (
            <button
              onClick={() => setUsernameInput("")}
              className="text-slate-600 hover:text-slate-400 text-xs"
            >✕</button>
          )}
        </div>
        <button
          onClick={() => handleFetch()}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-all"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading...</>
            : <><Search size={15} />Analyse</>}
        </button>
      </div>

      {/* Quick load last username */}
      {lastUsername && !profile && !loading && (
        <button
          onClick={() => handleFetch(lastUsername)}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <RefreshCw size={11} /> Load last: @{lastUsername}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* ── PROFILE LOADED ── */}
      {profile && stats && (
        <div className="space-y-5">

          {/* Profile card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <img
                src={profile.avatar_url}
                alt={profile.login}
                className="w-16 h-16 rounded-full border-2 border-slate-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {profile.name || profile.login}
                    </h2>
                    <a
                      href={profile.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      @{profile.login} <ExternalLink size={11} />
                    </a>
                  </div>
                  <button
                    onClick={() => handleFetch()}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <RefreshCw size={11} /> Refresh
                  </button>
                </div>

                {profile.bio && (
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 mt-3">
                  {profile.location && (
                    <span className="text-xs text-slate-500">📍 {profile.location}</span>
                  )}
                  {profile.company && (
                    <span className="text-xs text-slate-500">🏢 {profile.company}</span>
                  )}
                  {profile.blog && (
                    <a href={profile.blog} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300">
                      🔗 {profile.blog}
                    </a>
                  )}
                  <span className="text-xs text-slate-500">
                    📅 Joined {new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Public Repos",  value: profile.public_repos,  icon: BookOpen,   color: "text-blue-400",    bg: "bg-blue-500/10"    },
              { label: "Followers",     value: profile.followers,      icon: Users,      color: "text-violet-400",  bg: "bg-violet-500/10"  },
              { label: "Total Stars",   value: stats.totalStars,       icon: Star,       color: "text-amber-400",   bg: "bg-amber-500/10"   },
              { label: "Total Forks",   value: stats.totalForks,       icon: GitFork,    color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className={"w-8 h-8 rounded-lg flex items-center justify-center mb-2 " + stat.bg}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <p className={"text-2xl font-bold " + stat.color}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Languages + Contribution graph */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Languages */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Code2 size={14} className="text-blue-400" />
                Languages Used
              </h3>
              {stats.languages.length > 0
                ? <LanguageBar languages={stats.languages} />
                : <p className="text-xs text-slate-500">No language data available.</p>
              }
            </div>

            {/* Contribution graph */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-emerald-400" />
                Activity (Last 26 Weeks)
              </h3>
              <ContributionGraph repos={repos} />
            </div>
          </div>

          {/* Top repos */}
          {stats.topRepos.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Star size={14} className="text-amber-400" />
                Top Repositories by Stars
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.topRepos.map(repo => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            </div>
          )}

          {/* All repos */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen size={14} className="text-blue-400" />
                All Repositories
                <span className="text-xs text-slate-500 font-normal">({filteredRepos.length})</span>
              </h3>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
                  <Search size={12} className="text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search repos..."
                    className="bg-transparent text-xs text-slate-300 outline-none w-28 placeholder-slate-600"
                  />
                </div>

                {/* Filter */}
                {["all", "original", "forked"].map(f => (
                  <button
                    key={f}
                    onClick={() => setRepoFilter(f)}
                    className={"px-2.5 py-1 rounded-lg text-xs capitalize transition-all " +
                      (repoFilter === f ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200")}
                  >
                    {f}
                  </button>
                ))}

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-slate-800 text-slate-400 text-xs rounded-lg px-2 py-1 outline-none border border-slate-700"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="stars">Most Stars</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {filteredRepos.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No repositories found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredRepos.map(repo => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!profile && !loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Globe size={40} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-2">Enter a Globe username to get started</p>
          <p className="text-slate-600 text-sm mb-4">Works with any public Globe profile — no API key needed</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {["torvalds", "gaearon", "yashwanthay"].map(u => (
              <button
                key={u}
                onClick={() => { setUsernameInput(u); handleFetch(u); }}
                className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-all"
              >
                @{u}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}