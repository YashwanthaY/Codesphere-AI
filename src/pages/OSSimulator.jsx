import { useState } from "react";
import { Plus, Trash2, Play, RotateCcw, Cpu, HardDrive, FileStack } from "lucide-react";
import { fcfs, sjf, priority, roundRobin, getAverages } from "../utils/scheduling";
import { useToast } from "../context/ToastContext";

const COLORS = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#a78bfa","#06b6d4","#fb7185","#84cc16"];

const DEFAULT_PROCESSES = [
  { id: "P1", arrival: 0, burst: 5, priority: 2, color: COLORS[0] },
  { id: "P2", arrival: 1, burst: 3, priority: 1, color: COLORS[1] },
  { id: "P3", arrival: 2, burst: 8, priority: 3, color: COLORS[2] },
  { id: "P4", arrival: 3, burst: 2, priority: 2, color: COLORS[3] },
];

const REF_STRING = [7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1];

function fifoPageReplacement(pages, frames) {
  const memory = [];
  const steps  = [];
  for (const page of pages) {
    const hit = memory.includes(page);
    if (!hit) { if (memory.length >= frames) memory.shift(); memory.push(page); }
    steps.push({ page, memory: [...memory], hit });
  }
  return steps;
}

function lruPageReplacement(pages, frames) {
  let memory  = [];
  const steps = [];
  for (const page of pages) {
    const hit = memory.includes(page);
    if (hit) { memory = memory.filter(function(p) { return p !== page; }); memory.push(page); }
    else { if (memory.length >= frames) memory.shift(); memory.push(page); }
    steps.push({ page, memory: [...memory], hit });
  }
  return steps;
}

export default function OSSimulator() {
  const toast = useToast();

  const [activeTab, setActiveTab]   = useState("scheduling");
  const [algorithm, setAlgorithm]   = useState("fcfs");
  const [quantum, setQuantum]       = useState(2);
  const [processes, setProcesses]   = useState(DEFAULT_PROCESSES);
  const [schedule, setSchedule]     = useState(null);
  const [newProc, setNewProc]       = useState({ arrival: 0, burst: 4, priority: 1 });
  const [pageAlgo, setPageAlgo]     = useState("fifo");
  const [frameCount, setFrameCount] = useState(3);
  const [pageSteps, setPageSteps]   = useState(null);

  function addProcess() {
    if (processes.length >= 8) { toast.warning("Maximum 8 processes allowed!", { title: "Limit Reached" }); return; }
    const id    = "P" + (processes.length + 1);
    const color = COLORS[processes.length % COLORS.length];
    setProcesses([...processes, {
      id, color,
      arrival:  Number(newProc.arrival),
      burst:    Number(newProc.burst),
      priority: Number(newProc.priority),
    }]);
    toast.success("Process " + id + " added!", { title: "Process Added" });
  }

  function removeProcess(id) {
    setProcesses(processes.filter(function(p) { return p.id !== id; }));
    setSchedule(null);
    toast.info("Process " + id + " removed", { title: "Removed" });
  }

  function resetProcesses() {
    setProcesses(DEFAULT_PROCESSES);
    setSchedule(null);
    toast.info("Reset to default processes", { title: "Reset" });
  }

  function runScheduler() {
    let output;
    if (algorithm === "fcfs")     output = fcfs(processes);
    if (algorithm === "sjf")      output = sjf(processes);
    if (algorithm === "priority") output = priority(processes);
    if (algorithm === "rr")       output = roundRobin(processes, quantum);
    setSchedule(output);
    const avg = getAverages(output.result);
    toast.success(algorithm.toUpperCase() + " complete!", { title: "Done!" });
awardXP(XP_REWARDS.OS_SCHEDULER_RUN.xp, XP_REWARDS.OS_SCHEDULER_RUN.label);
  }

  function runPageReplacement() {
    const steps = pageAlgo === "fifo"
      ? fifoPageReplacement(REF_STRING, frameCount)
      : lruPageReplacement(REF_STRING, frameCount);
    setPageSteps(steps);
    const hits   = steps.filter(function(s) { return s.hit; }).length;
    const misses = steps.length - hits;
    toast.success("Simulation complete!", { title: "Done!" });
    awardXP(XP_REWARDS.OS_PAGE_REPLACEMENT.xp, XP_REWARDS.OS_PAGE_REPLACEMENT.label);
  }

  const totalTime = schedule ? Math.max(...schedule.timeline.map(function(t) { return t.end; })) : 0;
  const averages  = schedule ? getAverages(schedule.result) : null;

  const TABS = [
    { id: "scheduling", label: "CPU Scheduling",    icon: Cpu       },
    { id: "memory",     label: "Memory Management", icon: HardDrive },
    { id: "paging",     label: "Page Replacement",  icon: FileStack },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold text-white">OS Simulator</h1>
        <p className="text-sm text-slate-400 mt-1">Visualize CPU scheduling, memory management, and page replacement</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg w-fit border border-slate-800">
        {TABS.map(function(tab) {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={function() { setActiveTab(tab.id); }}
              className={"flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all " +
                (activeTab === tab.id ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-300")}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* CPU Scheduling Tab */}
      {activeTab === "scheduling" && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3 items-center">
            {[
              { id: "fcfs",     label: "FCFS"        },
              { id: "sjf",      label: "SJF"         },
              { id: "priority", label: "Priority"    },
              { id: "rr",       label: "Round Robin" },
            ].map(function(a) {
              return (
                <button
                  key={a.id}
                  onClick={function() { setAlgorithm(a.id); }}
                  className={"px-4 py-2 rounded-lg text-sm border transition-all " +
                    (algorithm === a.id
                      ? "border-blue-500 text-blue-400 bg-slate-800"
                      : "border-slate-700 text-slate-400 hover:border-slate-600")}
                >
                  {a.label}
                </button>
              );
            })}
            {algorithm === "rr" && (
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-400">Quantum:</span>
                <input
                  type="number" min="1" max="10" value={quantum}
                  onChange={function(e) { setQuantum(Number(e.target.value)); }}
                  className="w-12 bg-transparent text-white text-sm font-mono outline-none text-center"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Process list */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Processes</h3>
                <button onClick={resetProcesses} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
                  <RotateCcw size={11} /> Reset
                </button>
              </div>
              <div className="space-y-2 mb-4">
                {processes.map(function(p) {
                  return (
                    <div key={p.id} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-xs font-mono font-semibold text-white w-6">{p.id}</span>
                      <div className="flex gap-3 text-xs text-slate-400 flex-1">
                        <span>AT:{p.arrival}</span>
                        <span>BT:{p.burst}</span>
                        <span>PR:{p.priority}</span>
                      </div>
                      <button onClick={function() { removeProcess(p.id); }} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <p className="text-xs text-slate-500 font-medium">Add Process</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Arrival",  key: "arrival"  },
                    { label: "Burst",    key: "burst"    },
                    { label: "Priority", key: "priority" },
                  ].map(function(field) {
                    return (
                      <div key={field.key}>
                        <label className="text-[10px] text-slate-500 block mb-1">{field.label}</label>
                        <input
                          type="number" min="0"
                          value={newProc[field.key]}
                          onChange={function(e) { setNewProc(function(prev) { return { ...prev, [field.key]: e.target.value }; }); }}
                          className="w-full bg-slate-800 text-white text-xs font-mono rounded-lg px-2 py-1.5 outline-none border border-slate-700 focus:border-blue-500"
                        />
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={addProcess}
                  disabled={processes.length >= 8}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-40 border border-slate-700 transition-all"
                >
                  <Plus size={12} /> Add Process
                </button>
              </div>
              <div className="mt-4 text-[10px] text-slate-500 space-y-1">
                <p>AT = Arrival Time · BT = Burst Time · PR = Priority</p>
              </div>
            </div>

            {/* Gantt + Stats */}
            <div className="xl:col-span-2 space-y-4">
              <button
                onClick={runScheduler}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-all"
              >
                <Play size={14} /> Run {algorithm.toUpperCase()}
              </button>

              {schedule && (
                <>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Gantt Chart</h3>
                    <div className="flex rounded-lg overflow-hidden border border-slate-700 mb-2">
                      {schedule.timeline.map(function(slot, i) {
                        const width = ((slot.end - slot.start) / totalTime) * 100;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-center text-xs font-bold text-white border-r border-slate-700/50 last:border-r-0 relative group"
                            style={{ width: width + "%", minWidth: "24px", height: "48px", backgroundColor: slot.pid === "idle" ? "#1e293b" : slot.color }}
                          >
                            <span className={slot.pid === "idle" ? "text-slate-500 text-[10px]" : "text-white"}>
                              {slot.pid === "idle" ? "—" : slot.pid}
                            </span>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap hidden group-hover:block z-10">
                              {slot.start}→{slot.end}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex">
                      {schedule.timeline.map(function(slot, i) {
                        const width = ((slot.end - slot.start) / totalTime) * 100;
                        return (
                          <div key={i} className="text-[10px] text-slate-500 font-mono" style={{ width: width + "%", minWidth: "24px" }}>
                            {slot.start}
                          </div>
                        );
                      })}
                      <span className="text-[10px] text-slate-500 font-mono ml-auto">{totalTime}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-800">
                      <h3 className="text-sm font-semibold text-white">Process Statistics</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-800">
                            {["Process","Arrival","Burst","Priority","Start","Finish","Waiting","Turnaround"].map(function(h) {
                              return <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>;
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {schedule.result.map(function(p) {
                            return (
                              <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                                    <span className="text-xs font-mono font-semibold text-white">{p.id}</span>
                                  </div>
                                </td>
                                {[p.arrival, p.burst, p.priority, p.start, p.finish].map(function(v, i) {
                                  return <td key={i} className="px-4 py-2.5 text-xs font-mono text-slate-300">{v}</td>;
                                })}
                                <td className="px-4 py-2.5 text-xs font-mono font-semibold text-amber-400">{p.waiting}</td>
                                <td className="px-4 py-2.5 text-xs font-mono font-semibold text-emerald-400">{p.turnaround}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-5 py-3 border-t border-slate-800 flex gap-6 bg-slate-800/30">
                      <div>
                        <span className="text-xs text-slate-400">Avg Waiting Time:</span>
                        <span className="text-sm font-bold text-amber-400 ml-2">{averages.avgWaiting}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Avg Turnaround Time:</span>
                        <span className="text-sm font-bold text-emerald-400 ml-2">{averages.avgTurnaround}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!schedule && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center gap-3">
                  <Cpu size={32} className="text-slate-700" />
                  <p className="text-slate-500 text-sm">Add processes and click Run to see the Gantt chart</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Memory Tab */}
      {activeTab === "memory" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Fixed Partitioning</h3>
            <p className="text-xs text-slate-400 mb-4">Memory divided into fixed equal-sized partitions. Simple but causes internal fragmentation.</p>
            <div className="space-y-2">
              {[
                { label: "OS Kernel",   size: 20, used: true,  color: "#3b82f6", process: "System"       },
                { label: "Partition 1", size: 20, used: true,  color: "#22c55e", process: "P1 (Browser)" },
                { label: "Partition 2", size: 20, used: false, color: "#1e293b", process: "Free"          },
                { label: "Partition 3", size: 20, used: true,  color: "#f59e0b", process: "P2 (Game)"    },
                { label: "Partition 4", size: 20, used: false, color: "#1e293b", process: "Free"          },
              ].map(function(block, i) {
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 w-20 text-right font-mono">{i * 20}MB</span>
                    <div
                      className="flex-1 h-10 rounded-lg flex items-center px-3 border transition-all"
                      style={{ backgroundColor: block.used ? block.color + "33" : "#0f172a", borderColor: block.used ? block.color + "66" : "#334155" }}
                    >
                      <span className="text-xs font-medium" style={{ color: block.used ? block.color : "#475569" }}>{block.process}</span>
                      {!block.used && <span className="ml-auto text-[10px] text-slate-600">EMPTY</span>}
                    </div>
                    <span className="text-[10px] text-slate-600 w-10">20MB</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-400">⚠ Internal Fragmentation: Empty space inside allocated partitions that cannot be used.</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Dynamic Partitioning</h3>
            <p className="text-xs text-slate-400 mb-4">Partitions created based on actual process size. Reduces internal but causes external fragmentation.</p>
            <div className="space-y-2">
              {[
                { process: "OS Kernel", size: 15, color: "#3b82f6" },
                { process: "P1 (8MB)",  size: 8,  color: "#22c55e" },
                { process: "P2 (12MB)", size: 12, color: "#f59e0b" },
                { process: "Free",      size: 5,  color: null      },
                { process: "P3 (18MB)", size: 18, color: "#a78bfa" },
                { process: "Free",      size: 7,  color: null      },
                { process: "P4 (10MB)", size: 10, color: "#fb7185" },
              ].map(function(block, i) {
                const heightPx = block.size * 2 + 8;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 w-12 font-mono">{block.size}MB</span>
                    <div
                      className="flex-1 rounded-lg flex items-center px-3 border transition-all"
                      style={{ height: Math.max(heightPx, 28) + "px", backgroundColor: block.color ? block.color + "22" : "#0f172a", borderColor: block.color ? block.color + "55" : "#1e293b" }}
                    >
                      <span className="text-xs" style={{ color: block.color || "#475569" }}>{block.process}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-400">ℹ External Fragmentation: Free memory scattered in chunks that together could fit a process, but not contiguously.</p>
            </div>
          </div>
        </div>
      )}

      {/* Paging Tab */}
      {activeTab === "paging" && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3 items-center bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex gap-2">
              {["fifo", "lru"].map(function(algo) {
                return (
                  <button
                    key={algo}
                    onClick={function() { setPageAlgo(algo); setPageSteps(null); }}
                    className={"px-4 py-2 rounded-lg text-sm border transition-all " +
                      (pageAlgo === algo ? "border-blue-500 text-blue-400 bg-slate-800" : "border-slate-700 text-slate-400 hover:border-slate-600")}
                  >
                    {algo.toUpperCase()}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
              <span className="text-xs text-slate-400">Frames:</span>
              {[2,3,4].map(function(n) {
                return (
                  <button
                    key={n}
                    onClick={function() { setFrameCount(n); setPageSteps(null); }}
                    className={"w-7 h-7 rounded text-xs font-mono transition-all " +
                      (frameCount === n ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-700")}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <button
              onClick={runPageReplacement}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-all"
            >
              <Play size={14} /> Simulate {pageAlgo.toUpperCase()}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-2">Reference String:</p>
            <div className="flex flex-wrap gap-1.5">
              {REF_STRING.map(function(page, i) {
                return (
                  <span key={i} className="w-7 h-7 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center justify-center">
                    {page}
                  </span>
                );
              })}
            </div>
          </div>

          {pageSteps && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{pageAlgo.toUpperCase()} Simulation</h3>
                <div className="flex gap-4 text-xs">
                  <span className="text-emerald-400">✓ Hits: {pageSteps.filter(function(s) { return s.hit; }).length}</span>
                  <span className="text-red-400">✗ Misses: {pageSteps.filter(function(s) { return !s.hit; }).length}</span>
                  <span className="text-slate-400">
                    Hit Rate: {((pageSteps.filter(function(s) { return s.hit; }).length / pageSteps.length) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto p-4">
                <div className="flex gap-1" style={{ minWidth: "max-content" }}>
                  {pageSteps.map(function(step, i) {
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className={"text-xs font-mono font-bold " + (step.hit ? "text-emerald-400" : "text-red-400")}>{step.page}</span>
                        <div className="flex flex-col gap-0.5">
                          {Array.from({ length: frameCount }).map(function(_, f) {
                            return (
                              <div
                                key={f}
                                className={"w-8 h-7 rounded flex items-center justify-center text-xs font-mono border transition-all " +
                                  (step.memory[f] !== undefined ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-900 border-slate-800 text-slate-700")}
                              >
                                {step.memory[f] !== undefined ? step.memory[f] : "—"}
                              </div>
                            );
                          })}
                        </div>
                        <span className={"text-[9px] font-bold " + (step.hit ? "text-emerald-500" : "text-red-500")}>
                          {step.hit ? "HIT" : "MISS"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">FIFO</h4>
              <p className="text-xs text-slate-400 leading-relaxed">First In First Out — the oldest page in memory is replaced first. Simple but can suffer from Belady's Anomaly.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">LRU</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Least Recently Used — replaces the page not used for the longest time. Better performance, used in modern OS.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}