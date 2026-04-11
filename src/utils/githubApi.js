// WHAT THIS FILE DOES:
// All GitHub API calls in one place
// GitHub's public API works WITHOUT a key for public repos
// Rate limit: 60 requests/hour (enough for demo)

const BASE = "https://api.github.com";

// Fetch basic user profile
export async function fetchUser(username) {
  const res = await fetch(`${BASE}/users/${username}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

// Fetch all public repositories
export async function fetchRepos(username) {
  const res = await fetch(
    `${BASE}/users/${username}/repos?per_page=100&sort=updated`
  );
  if (!res.ok) throw new Error("Could not fetch repos");
  return res.json();
}

// Fetch commit activity for a specific repo (last 52 weeks)
export async function fetchCommitActivity(username, repo) {
  const res = await fetch(
    `${BASE}/repos/${username}/${repo}/stats/commit_activity`
  );
  if (!res.ok) return [];
  return res.json();
}

// ── Process raw repo data into useful stats ──────────────────────────────────
export function processRepos(repos) {
  // Count languages
  const languageCount = {};
  repos.forEach((repo) => {
    if (repo.language) {
      languageCount[repo.language] =
        (languageCount[repo.language] || 0) + 1;
    }
  });

  // Sort by stars
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  // Total stats
  const totalStars = repos.reduce(
    (sum, r) => sum + r.stargazers_count, 0
  );
  const totalForks = repos.reduce(
    (sum, r) => sum + r.forks_count, 0
  );

  // Languages sorted by usage
  const languages = Object.entries(languageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return { languageCount, topRepos, totalStars, totalForks, languages };
}