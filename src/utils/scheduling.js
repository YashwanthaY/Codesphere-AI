// WHAT THIS FILE DOES:
// Takes a list of processes (arrival time, burst time, priority)
// and computes the execution schedule for each algorithm.
// Returns: timeline (for Gantt chart) + per-process stats

// ── FCFS — First Come First Served ──────────────────────────────────────────
// Simplest algorithm: processes run in order of arrival time
export function fcfs(processes) {
  const procs = [...processes].sort((a, b) => a.arrival - b.arrival);
  const timeline = [];
  let time = 0;

  const result = procs.map((p) => {
    // If CPU is idle (next process hasn't arrived yet)
    if (time < p.arrival) {
      timeline.push({ pid: "idle", start: time, end: p.arrival });
      time = p.arrival;
    }

    const start = time;
    const end   = time + p.burst;
    timeline.push({ pid: p.id, start, end, color: p.color });
    time = end;

    return {
      ...p,
      start,
      finish:     end,
      waiting:    start - p.arrival,
      turnaround: end   - p.arrival,
    };
  });

  return { timeline, result };
}

// ── SJF — Shortest Job First (Non-preemptive) ────────────────────────────────
// At each decision point, pick the process with shortest burst time
export function sjf(processes) {
  const procs    = processes.map((p) => ({ ...p, done: false }));
  const timeline = [];
  const result   = [];
  let time       = 0;
  let completed  = 0;

  while (completed < procs.length) {
    // Get all processes that have arrived and are not done
    const available = procs.filter(
      (p) => !p.done && p.arrival <= time
    );

    if (available.length === 0) {
      // CPU idle — jump to next arrival
      const next = procs.filter((p) => !p.done)
                        .sort((a, b) => a.arrival - b.arrival)[0];
      timeline.push({ pid: "idle", start: time, end: next.arrival });
      time = next.arrival;
      continue;
    }

    // Pick shortest burst
    available.sort((a, b) => a.burst - b.burst);
    const p     = available[0];
    const start = time;
    const end   = time + p.burst;

    timeline.push({ pid: p.id, start, end, color: p.color });
    time = end;

    p.done = true;
    completed++;

    result.push({
      ...p,
      start,
      finish:     end,
      waiting:    start - p.arrival,
      turnaround: end   - p.arrival,
    });
  }

  return { timeline, result };
}

// ── Priority Scheduling (Non-preemptive) ─────────────────────────────────────
// Lower priority number = higher priority
export function priority(processes) {
  const procs    = processes.map((p) => ({ ...p, done: false }));
  const timeline = [];
  const result   = [];
  let time       = 0;
  let completed  = 0;

  while (completed < procs.length) {
    const available = procs.filter(
      (p) => !p.done && p.arrival <= time
    );

    if (available.length === 0) {
      const next = procs.filter((p) => !p.done)
                        .sort((a, b) => a.arrival - b.arrival)[0];
      timeline.push({ pid: "idle", start: time, end: next.arrival });
      time = next.arrival;
      continue;
    }

    // Pick highest priority (lowest number)
    available.sort((a, b) => a.priority - b.priority);
    const p     = available[0];
    const start = time;
    const end   = time + p.burst;

    timeline.push({ pid: p.id, start, end, color: p.color });
    time = end;
    p.done = true;
    completed++;

    result.push({
      ...p,
      start,
      finish:     end,
      waiting:    start - p.arrival,
      turnaround: end   - p.arrival,
    });
  }

  return { timeline, result };
}

// ── Round Robin ──────────────────────────────────────────────────────────────
// Each process gets a fixed time quantum. If not finished, goes back to queue.
export function roundRobin(processes, quantum = 2) {
  const procs    = processes.map((p) => ({ ...p, remaining: p.burst }));
  const timeline = [];
  const result   = [];
  let time       = 0;

  // Sort by arrival time initially
  procs.sort((a, b) => a.arrival - b.arrival);

  const queue   = [];
  const visited = new Set();
  let idx       = 0;

  // Add first process to queue
  while (idx < procs.length && procs[idx].arrival <= time) {
    queue.push(procs[idx]);
    visited.add(procs[idx].id);
    idx++;
  }

  while (queue.length > 0) {
    const p = queue.shift();

    const execTime = Math.min(p.remaining, quantum);
    const start    = time;
    const end      = time + execTime;

    timeline.push({ pid: p.id, start, end, color: p.color });
    time           = end;
    p.remaining   -= execTime;

    // Add newly arrived processes to queue
    while (idx < procs.length && procs[idx].arrival <= time) {
      if (!visited.has(procs[idx].id)) {
        queue.push(procs[idx]);
        visited.add(procs[idx].id);
      }
      idx++;
    }

    if (p.remaining > 0) {
      queue.push(p); // Not done — goes back to queue
    } else {
      result.push({
        ...p,
        finish:     end,
        waiting:    end - p.arrival - p.burst,
        turnaround: end - p.arrival,
      });
    }
  }

  return { timeline, result };
}

// ── Calculate averages ────────────────────────────────────────────────────────
export function getAverages(result) {
  const n   = result.length;
  const avg = (key) =>
    (result.reduce((sum, p) => sum + p[key], 0) / n).toFixed(2);

  return {
    avgWaiting:    avg("waiting"),
    avgTurnaround: avg("turnaround"),
  };
}