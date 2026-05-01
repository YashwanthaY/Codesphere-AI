import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Shuffle, ChevronRight, ChevronLeft, Zap } from "lucide-react";
import {
  generateBubbleSortSteps,
  generateSelectionSortSteps,
  generateInsertionSortSteps,
  generateMergeSortSteps,
  generateBinarySearchSteps,
  generateQuickSortSteps,
  generateHeapSortSteps,
  generateLinkedListSteps,
  generateBinaryTreeBFSSteps,
  generateGraphDFSSteps,
  COMPLEXITY,
  CPP_CODE,
} from "../utils/algorithms";

// ── ALGORITHM REGISTRY ───────────────────────────────────────────────────────
const ALGORITHMS = [
  // Sorting
  { id: "bubble",     label: "Bubble Sort",    color: "text-blue-400",    border: "border-blue-500",    group: "Sorting"         },
  { id: "selection",  label: "Selection Sort", color: "text-cyan-400",    border: "border-cyan-500",    group: "Sorting"         },
  { id: "insertion",  label: "Insertion Sort", color: "text-violet-400",  border: "border-violet-500",  group: "Sorting"         },
  { id: "merge",      label: "Merge Sort",     color: "text-emerald-400", border: "border-emerald-500", group: "Sorting"         },
  { id: "quick",      label: "Quick Sort",     color: "text-orange-400",  border: "border-orange-500",  group: "Sorting"         },
  { id: "heap",       label: "Heap Sort",      color: "text-rose-400",    border: "border-rose-500",    group: "Sorting"         },
  // Search
  { id: "binary",     label: "Binary Search",  color: "text-amber-400",   border: "border-amber-500",   group: "Search"          },
  // Data Structures
  { id: "linkedlist", label: "Linked List",    color: "text-pink-400",    border: "border-pink-500",    group: "Data Structures" },
  { id: "bfstree",    label: "Tree BFS",       color: "text-teal-400",    border: "border-teal-500",    group: "Trees & Graphs"  },
  { id: "dfsgraph",   label: "Graph DFS",      color: "text-indigo-400",  border: "border-indigo-500",  group: "Trees & Graphs"  },
];

const ALGO_GROUPS = ["Sorting", "Search", "Data Structures", "Trees & Graphs"];

const SPEEDS = [
  { label: "0.5x", ms: 600 },
  { label: "1x",   ms: 300 },
  { label: "2x",   ms: 150 },
  { label: "4x",   ms: 60  },
];

const EXPLANATIONS = {
  bubble:     "Repeatedly compares adjacent elements and swaps them if they are in the wrong order. After each pass, the largest unsorted element bubbles up to its correct position.",
  selection:  "Finds the minimum element in the unsorted portion and places it at the beginning. The sorted portion grows from left to right one element at a time.",
  insertion:  "Builds the sorted array one item at a time by picking each element and inserting it into its correct position among the previously sorted elements.",
  merge:      "Divides the array into halves recursively until each half has one element, then merges them back in sorted order. Classic divide-and-conquer algorithm.",
  quick:      "Picks a pivot element and partitions the array so all smaller elements go left and larger go right. Pivot is now in its final position. Recurse on both halves.",
  heap:       "Phase 1: Build a Max Heap (parent always > children). Phase 2: Swap root (max) with last element, shrink heap, re-heapify. Repeat until sorted.",
  binary:     "Searches a sorted array by repeatedly halving the search range. Compares the middle element with the target and eliminates half the remaining elements each step.",
  linkedlist: "A chain of nodes where each node holds a value and a pointer to the next node. Unlike arrays, nodes are not contiguous in memory — you follow pointers to traverse.",
  bfstree:    "BFS uses a Queue (FIFO). Start at root, enqueue it. Each step: dequeue a node, visit it, enqueue its children. Visits nodes level by level, left to right.",
  dfsgraph:   "DFS uses recursion (call stack). Start at source node, mark visited, then recursively visit each unvisited neighbour. Goes as deep as possible before backtracking.",
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function randomArray(size) {
  size = size || 16;
  return Array.from({ length: size }, function () {
    return Math.floor(Math.random() * 85) + 10;
  });
}

// Default values for linked list, tree, graph
const DEFAULT_LINKED_LIST = [12, 7, 43, 19, 55, 3, 28];
const DEFAULT_TREE_VALUES = [1, 2, 3, 4, 5, 6, 7];
const DEFAULT_GRAPH = { 0: [1, 2], 1: [0, 3, 4], 2: [0, 5], 3: [1], 4: [1, 5], 5: [2, 4] };

// Algorithms that use bar chart vs special visualizers
const BAR_CHART_ALGOS    = ["bubble", "selection", "insertion", "merge", "quick", "heap", "binary"];
const LINKED_LIST_ALGOS  = ["linkedlist"];
const TREE_ALGOS         = ["bfstree"];
const GRAPH_ALGOS        = ["dfsgraph"];

function colorize(line) {
  const keywords = ["void", "int", "return", "if", "else", "while", "for", "struct", "class", "public", "bool", "vector", "queue"];
  const parts = line.split(/(\b\w+\b|\/\/.*$|"[^"]*")/g);
  return parts.map(function (part, i) {
    if (part.startsWith("//"))               return <span key={i} className="text-slate-500">{part}</span>;
    if (keywords.includes(part))             return <span key={i} className="text-blue-400">{part}</span>;
    if (!isNaN(part) && part.trim() !== "")  return <span key={i} className="text-amber-400">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

// ── LINKED LIST VISUALIZER ───────────────────────────────────────────────────
function LinkedListVisualizer({ step }) {
  if (!step || !step.nodes) return null;
  const { nodes, activeNode, foundNode, message } = step;

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-full min-h-[180px]">
      <p className="text-xs text-slate-400 text-center px-4 min-h-[32px]">{message}</p>
      <div className="flex items-center flex-wrap gap-0 justify-center">
        {nodes.map(function (node, i) {
          const isActive = activeNode === i;
          const isFound  = foundNode  === i;
          return (
            <div key={node.id} className="flex items-center">
              {/* Node box */}
              <div className={
                "flex flex-col border-2 rounded-lg overflow-hidden transition-all duration-300 " +
                (isFound  ? "border-emerald-400 scale-110" :
                 isActive ? "border-yellow-400 scale-105" :
                            "border-slate-600")
              }>
                {/* Value cell */}
                <div className={
                  "px-3 py-2 text-sm font-mono font-bold text-center min-w-[44px] " +
                  (isFound  ? "bg-emerald-500/20 text-emerald-300" :
                   isActive ? "bg-yellow-500/20 text-yellow-300" :
                              "bg-slate-800 text-slate-200")
                }>
                  {node.value}
                </div>
                {/* Pointer cell */}
                <div className="px-3 py-1 bg-slate-900 text-[9px] text-slate-500 text-center border-t border-slate-700">
                  {node.next !== null ? `→ ${node.next}` : "NULL"}
                </div>
              </div>
              {/* Arrow between nodes */}
              {i < nodes.length - 1 && (
                <div className="flex items-center px-1">
                  <div className="w-6 h-px bg-slate-600" />
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-slate-600" />
                </div>
              )}
            </div>
          );
        })}
        {/* NULL terminator */}
        <div className="flex items-center px-1">
          <div className="w-4 h-px bg-slate-700" />
          <span className="text-xs text-slate-600 font-mono ml-1">NULL</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-yellow-400 inline-block" /> Active</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-emerald-400 inline-block" /> Found</span>
      </div>
    </div>
  );
}

// ── BINARY TREE BFS VISUALIZER ───────────────────────────────────────────────
function TreeVisualizer({ step }) {
  if (!step || !step.nodes) return null;
  const { nodes, visited, activeNode, queue, traversalOrder } = step;

  // Layout: positions for up to 7 nodes (3 levels)
  const positions = [
    { x: 50, y: 10 },           // level 0: root
    { x: 25, y: 38 },           // level 1: left
    { x: 75, y: 38 },           // level 1: right
    { x: 12, y: 66 },           // level 2
    { x: 37, y: 66 },
    { x: 62, y: 66 },
    { x: 87, y: 66 },
  ];

  return (
    <div className="flex flex-col gap-3 h-full min-h-[180px]">
      <p className="text-xs text-slate-400 text-center px-2 min-h-[32px]">{step.message}</p>

      {/* SVG Tree */}
      <div className="flex-1 relative" style={{ minHeight: "140px" }}>
        <svg viewBox="0 0 100 85" className="w-full h-full">
          {/* Draw edges first */}
          {nodes.map(function (node) {
            const pos = positions[node.id];
            if (!pos) return null;
            return (
              <g key={"edges-" + node.id}>
                {node.left !== null && positions[node.left] && (
                  <line
                    x1={pos.x} y1={pos.y + 4}
                    x2={positions[node.left].x} y2={positions[node.left].y - 4}
                    stroke="#334155" strokeWidth="0.8"
                  />
                )}
                {node.right !== null && positions[node.right] && (
                  <line
                    x1={pos.x} y1={pos.y + 4}
                    x2={positions[node.right].x} y2={positions[node.right].y - 4}
                    stroke="#334155" strokeWidth="0.8"
                  />
                )}
              </g>
            );
          })}
          {/* Draw nodes */}
          {nodes.map(function (node) {
            const pos = positions[node.id];
            if (!pos) return null;
            const isActive  = activeNode === node.id;
            const isVisited = visited && visited.includes(node.id);
            const inQueue   = queue && queue.includes(node.id);

            let fill   = "#1e293b";
            let stroke = "#475569";
            let textColor = "#94a3b8";

            if (isActive)       { fill = "#ca8a04"; stroke = "#eab308"; textColor = "#fff"; }
            else if (isVisited) { fill = "#166534"; stroke = "#22c55e"; textColor = "#fff"; }
            else if (inQueue)   { fill = "#1d4ed8"; stroke = "#3b82f6"; textColor = "#fff"; }

            return (
              <g key={"node-" + node.id}>
                <circle cx={pos.x} cy={pos.y} r="5.5" fill={fill} stroke={stroke} strokeWidth="0.8" />
                <text x={pos.x} y={pos.y + 1.5} textAnchor="middle" fontSize="3.5" fill={textColor} fontWeight="bold">
                  {node.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Queue + traversal order */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-slate-500 mb-1">Queue (FIFO)</p>
          <p className="font-mono text-blue-300">
            {queue && queue.length > 0
              ? "[" + queue.map(function(i) { return nodes[i] ? nodes[i].value : "?"; }).join(", ") + "]"
              : "[ empty ]"}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-slate-500 mb-1">Visit Order</p>
          <p className="font-mono text-emerald-300">
            {traversalOrder && traversalOrder.length > 0
              ? traversalOrder.join(" → ")
              : "—"}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs text-slate-400 justify-center">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Active</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" /> Visited</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> In Queue</span>
      </div>
    </div>
  );
}

// ── GRAPH DFS VISUALIZER ─────────────────────────────────────────────────────
function GraphVisualizer({ step }) {
  if (!step || !step.graph) return null;
  const { graph, visited, activeNode, activeEdge, visitOrder } = step;

  // Fixed positions for 6-node graph (percentage of SVG viewBox 100x80)
  const nodePositions = {
    0: { x: 50, y: 10 },
    1: { x: 20, y: 35 },
    2: { x: 80, y: 35 },
    3: { x: 10, y: 65 },
    4: { x: 40, y: 65 },
    5: { x: 75, y: 65 },
  };

  const drawnEdges = new Set();

  return (
    <div className="flex flex-col gap-3 h-full min-h-[180px]">
      <p className="text-xs text-slate-400 text-center px-2 min-h-[32px]">{step.message}</p>

      <div className="flex-1 relative" style={{ minHeight: "150px" }}>
        <svg viewBox="0 0 100 80" className="w-full h-full">
          {/* Edges */}
          {Object.keys(graph).map(function (nodeId) {
            return graph[nodeId].map(function (neighbour) {
              const edgeKey = [Math.min(+nodeId, neighbour), Math.max(+nodeId, neighbour)].join("-");
              if (drawnEdges.has(edgeKey)) return null;
              drawnEdges.add(edgeKey);

              const from = nodePositions[nodeId];
              const to   = nodePositions[neighbour];
              if (!from || !to) return null;

              const isActive =
                activeEdge &&
                ((+activeEdge[0] === +nodeId && +activeEdge[1] === neighbour) ||
                 (+activeEdge[0] === neighbour && +activeEdge[1] === +nodeId));

              return (
                <line
                  key={edgeKey}
                  x1={from.x} y1={from.y}
                  x2={to.x}   y2={to.y}
                  stroke={isActive ? "#eab308" : "#334155"}
                  strokeWidth={isActive ? "1.5" : "0.8"}
                />
              );
            });
          })}

          {/* Nodes */}
          {Object.keys(nodePositions).map(function (nodeId) {
            const pos       = nodePositions[nodeId];
            const isActive  = activeNode === +nodeId;
            const isVisited = visited && visited.includes(+nodeId);

            let fill   = "#1e293b";
            let stroke = "#475569";
            let textColor = "#94a3b8";

            if (isActive)       { fill = "#ca8a04"; stroke = "#eab308"; textColor = "#fff"; }
            else if (isVisited) { fill = "#166534"; stroke = "#22c55e"; textColor = "#fff"; }

            return (
              <g key={"gnode-" + nodeId}>
                <circle cx={pos.x} cy={pos.y} r="6" fill={fill} stroke={stroke} strokeWidth="1" />
                <text x={pos.x} y={pos.y + 1.5} textAnchor="middle" fontSize="4" fill={textColor} fontWeight="bold">
                  {nodeId}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Visit order */}
      <div className="bg-slate-800 rounded-lg p-2 text-xs">
        <span className="text-slate-500">DFS Order: </span>
        <span className="font-mono text-emerald-300">
          {visitOrder && visitOrder.length > 0 ? visitOrder.join(" → ") : "—"}
        </span>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs text-slate-400 justify-center">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Active</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" /> Visited</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" /> Unvisited</span>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DSAVisualizer() {
  const [selectedAlgo, setSelectedAlgo] = useState("bubble");
  const [array, setArray]               = useState(function () { return randomArray(); });
  const [steps, setSteps]               = useState([]);
  const [currentStep, setCurrentStep]   = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [speedIdx, setSpeedIdx]         = useState(1);
  const [searchTarget, setSearchTarget] = useState(42);
  const [arraySize, setArraySize]       = useState(16);
  const [llOperation, setLlOperation]   = useState("traverse");

  const intervalRef = useRef(null);

  const generateSteps = useCallback(function (algo, arr) {
    var s = [];
    if (algo === "bubble")     s = generateBubbleSortSteps(arr);
    if (algo === "selection")  s = generateSelectionSortSteps(arr);
    if (algo === "insertion")  s = generateInsertionSortSteps(arr);
    if (algo === "merge")      s = generateMergeSortSteps(arr);
    if (algo === "quick")      s = generateQuickSortSteps(arr);
    if (algo === "heap")       s = generateHeapSortSteps(arr);
    if (algo === "binary")     s = generateBinarySearchSteps(arr, searchTarget);
    if (algo === "linkedlist") s = generateLinkedListSteps(DEFAULT_LINKED_LIST, llOperation);
    if (algo === "bfstree")    s = generateBinaryTreeBFSSteps(DEFAULT_TREE_VALUES);
    if (algo === "dfsgraph")   s = generateGraphDFSSteps(DEFAULT_GRAPH, 0);
    setSteps(s);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [searchTarget, llOperation]);

  useEffect(function () {
    generateSteps(selectedAlgo, array);
  }, [selectedAlgo, array, generateSteps]);

  useEffect(function () {
    if (isPlaying) {
      intervalRef.current = setInterval(function () {
        setCurrentStep(function (prev) {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, SPEEDS[speedIdx].ms);
    }
    return function () { clearInterval(intervalRef.current); };
  }, [isPlaying, steps.length, speedIdx]);

  function handleShuffle() {
    if (BAR_CHART_ALGOS.includes(selectedAlgo)) {
      setArray(randomArray(arraySize));
    } else {
      // Re-generate for structural algos
      generateSteps(selectedAlgo, array);
    }
  }

  function handleReset()       { setCurrentStep(0); setIsPlaying(false); }
  function handleStepBack()    { setIsPlaying(false); setCurrentStep(function (p) { return Math.max(0, p - 1); }); }
  function handleStepForward() { setIsPlaying(false); setCurrentStep(function (p) { return Math.min(steps.length - 1, p + 1); }); }

  var frame      = steps[currentStep] || { array: array, comparing: [], swapping: [], sorted: [] };
  var algoInfo   = ALGORITHMS.find(function (a) { return a.id === selectedAlgo; });
  var complexity = COMPLEXITY[selectedAlgo];
  var code       = CPP_CODE[selectedAlgo];
  var isBarChart = BAR_CHART_ALGOS.includes(selectedAlgo);
  var maxVal     = isBarChart ? Math.max.apply(null, (frame.array || array).concat([1])) : 1;
  var progress   = steps.length > 1 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0;

  function getBarColor(index) {
    if (frame.sorted    && frame.sorted.includes(index))    return "#22c55e";
    if (frame.swapping  && frame.swapping.includes(index))  return "#ef4444";
    if (frame.comparing && frame.comparing.includes(index)) return "#eab308";
    // Quick sort: highlight pivot
    if (frame.pivot !== undefined && frame.pivot === index) return "#f97316";
    return "#3b82f6";
  }

  const isSorting      = LINKED_LIST_ALGOS.includes(selectedAlgo);
  const isTree         = TREE_ALGOS.includes(selectedAlgo);
  const isGraph        = GRAPH_ALGOS.includes(selectedAlgo);
  const isLinkedList   = LINKED_LIST_ALGOS.includes(selectedAlgo);

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold text-white">DSA Visualizer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Watch algorithms come alive — step by step with C++ code
        </p>
      </div>

      {/* ── Algorithm selector grouped ── */}
      <div className="space-y-2">
        {ALGO_GROUPS.map(function (group) {
          const groupAlgos = ALGORITHMS.filter(function (a) { return a.group === group; });
          return (
            <div key={group} className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-600 uppercase tracking-wider w-24 flex-shrink-0">
                {group}
              </span>
              {groupAlgos.map(function (algo) {
                return (
                  <button
                    key={algo.id}
                    onClick={function () { setSelectedAlgo(algo.id); }}
                    className={
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all " +
                      (selectedAlgo === algo.id
                        ? algo.border + " " + algo.color + " bg-slate-800"
                        : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300")
                    }
                  >
                    {algo.label}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* ── LEFT — Visualizer ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={function () { setIsPlaying(function (p) { return !p; }); }}
              disabled={currentStep >= steps.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500
                         disabled:opacity-40 disabled:cursor-not-allowed rounded-lg
                         text-sm font-medium text-white transition-all"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button onClick={handleStepBack} disabled={currentStep === 0}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-all">
              <ChevronLeft size={16} />
            </button>

            <button onClick={handleStepForward} disabled={currentStep >= steps.length - 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-all">
              <ChevronRight size={16} />
            </button>

            <button onClick={handleReset}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
              <RotateCcw size={16} />
            </button>

            <button onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-all">
              <Shuffle size={14} />
              {isBarChart ? "New Array" : "Restart"}
            </button>

            {/* Speed */}
            <div className="flex items-center gap-1 ml-auto">
              <Zap size={13} className="text-slate-400" />
              {SPEEDS.map(function (s, i) {
                return (
                  <button key={i} onClick={function () { setSpeedIdx(i); }}
                    className={"px-2 py-1 rounded text-xs font-mono transition-all " +
                      (speedIdx === i ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Binary search: target input */}
          {selectedAlgo === "binary" && (
            <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-4 py-2">
              <span className="text-xs text-slate-400">Search target:</span>
              <input
                type="number" value={searchTarget}
                onChange={function (e) { setSearchTarget(Number(e.target.value)); }}
                className="w-20 bg-transparent text-white text-sm font-mono outline-none"
              />
              <button onClick={function () { generateSteps("binary", array); }}
                className="text-xs text-blue-400 hover:text-blue-300">
                Search →
              </button>
            </div>
          )}

          {/* Linked list: operation selector */}
          {selectedAlgo === "linkedlist" && (
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 flex-wrap">
              <span className="text-xs text-slate-400">Operation:</span>
              {["traverse", "search", "insert", "delete"].map(function (op) {
                return (
                  <button key={op}
                    onClick={function () { setLlOperation(op); generateSteps("linkedlist", array); }}
                    className={"px-2 py-1 rounded text-xs font-mono capitalize transition-all " +
                      (llOperation === op ? "bg-pink-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600")}>
                    {op}
                  </button>
                );
              })}
            </div>
          )}

          {/* Array size slider — only for sorting/search */}
          {isBarChart && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 whitespace-nowrap">Size: {arraySize}</span>
              <input type="range" min="8" max="30" value={arraySize}
                onChange={function (e) {
                  var size = Number(e.target.value);
                  setArraySize(size);
                  setArray(randomArray(size));
                }}
                className="flex-1 accent-blue-500"
              />
            </div>
          )}

          {/* ── VISUALIZATION AREA ── */}
          {isBarChart && (
            <div className="flex items-end gap-0.5 bg-slate-950 rounded-lg px-4 pt-4 pb-2" style={{ height: "220px" }}>
              {(frame.array || array).map(function (val, idx) {
                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-t-sm transition-all duration-100 relative group"
                    style={{
                      height: ((val / maxVal) * 170) + "px",
                      backgroundColor: getBarColor(idx),
                      minWidth: "4px",
                    }}
                  >
                    {(frame.array || array).length <= 20 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 hidden group-hover:block whitespace-nowrap">
                        {val}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isLinkedList && (
            <div className="bg-slate-950 rounded-lg p-4" style={{ minHeight: "220px" }}>
              <LinkedListVisualizer step={frame} />
            </div>
          )}

          {isTree && (
            <div className="bg-slate-950 rounded-lg p-4" style={{ minHeight: "220px" }}>
              <TreeVisualizer step={frame} />
            </div>
          )}

          {isGraph && (
            <div className="bg-slate-950 rounded-lg p-4" style={{ minHeight: "220px" }}>
              <GraphVisualizer step={frame} />
            </div>
          )}

          {/* Legend — bar chart only */}
          {isBarChart && (
            <div className="flex gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" /> Comparing</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Swapping</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Sorted</span>
              {selectedAlgo === "quick" && (
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" /> Pivot</span>
              )}
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Unsorted</span>
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Step {currentStep} of {steps.length - 1}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-150"
                style={{ width: progress + "%" }}
              />
            </div>
          </div>

          {/* Complexity table */}
          {complexity && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Best",    val: complexity.best  },
                { label: "Average", val: complexity.avg   },
                { label: "Worst",   val: complexity.worst },
                { label: "Space",   val: complexity.space },
              ].map(function (item) {
                return (
                  <div key={item.label} className="bg-slate-800 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-500 mb-0.5">{item.label}</p>
                    <p className="text-xs font-mono font-semibold text-emerald-400">{item.val}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT — Code Panel ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">C++ Implementation</h3>
            {algoInfo && (
              <span className={"text-xs px-2 py-0.5 rounded-full bg-slate-800 " + algoInfo.color}>
                {algoInfo.label}
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-950 rounded-lg p-4 overflow-auto">
            <pre className="text-sm font-mono leading-relaxed">
              {code && code.split("\n").map(function (line, i) {
                return (
                  <div key={i} className="flex gap-4 hover:bg-slate-900 px-1 rounded">
                    <span className="text-slate-600 select-none w-5 text-right flex-shrink-0">{i + 1}</span>
                    <span className="text-slate-200">{colorize(line)}</span>
                  </div>
                );
              })}
            </pre>
          </div>

          <div className="mt-4 bg-slate-800 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-300 mb-2">How it works:</p>
            <p className="text-xs text-slate-400 leading-relaxed">{EXPLANATIONS[selectedAlgo]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}