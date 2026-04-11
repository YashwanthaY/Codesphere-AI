import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Shuffle, ChevronRight, ChevronLeft, Zap } from "lucide-react";
import {
  generateBubbleSortSteps,
  generateSelectionSortSteps,
  generateInsertionSortSteps,
  generateMergeSortSteps,
  generateBinarySearchSteps,
  COMPLEXITY,
  CPP_CODE,
} from "../utils/algorithms";

const ALGORITHMS = [
  { id: "bubble",    label: "Bubble Sort",    color: "text-blue-400",    border: "border-blue-500"    },
  { id: "selection", label: "Selection Sort", color: "text-cyan-400",    border: "border-cyan-500"    },
  { id: "insertion", label: "Insertion Sort", color: "text-violet-400",  border: "border-violet-500"  },
  { id: "merge",     label: "Merge Sort",     color: "text-emerald-400", border: "border-emerald-500" },
  { id: "binary",    label: "Binary Search",  color: "text-amber-400",   border: "border-amber-500"   },
];

const SPEEDS = [
  { label: "0.5x", ms: 600 },
  { label: "1x",   ms: 300 },
  { label: "2x",   ms: 150 },
  { label: "4x",   ms: 60  },
];

const EXPLANATIONS = {
  bubble:    "Repeatedly compares adjacent elements and swaps them if they are in the wrong order. After each pass, the largest unsorted element bubbles up to its correct position.",
  selection: "Finds the minimum element in the unsorted portion and places it at the beginning. The sorted portion grows from left to right one element at a time.",
  insertion: "Builds the sorted array one item at a time by picking each element and inserting it into its correct position among the previously sorted elements.",
  merge:     "Divides the array into halves recursively until each half has one element, then merges them back in sorted order. Classic divide-and-conquer algorithm.",
  binary:    "Searches a sorted array by repeatedly halving the search range. Compares the middle element with the target and eliminates half the remaining elements each step.",
};

function randomArray(size) {
  size = size || 16;
  return Array.from({ length: size }, function() {
    return Math.floor(Math.random() * 85) + 10;
  });
}

function colorize(line) {
  const keywords = ["void", "int", "return", "if", "else", "while", "for"];
  const parts = line.split(/(\b\w+\b|\/\/.*$|"[^"]*")/g);
  return parts.map(function(part, i) {
    if (part.startsWith("//"))           return <span key={i} className="text-slate-500">{part}</span>;
    if (keywords.includes(part))         return <span key={i} className="text-blue-400">{part}</span>;
    if (!isNaN(part) && part.trim() !== "") return <span key={i} className="text-amber-400">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

export default function DSAVisualizer() {
  const [selectedAlgo, setSelectedAlgo] = useState("bubble");
  const [array, setArray]               = useState(function() { return randomArray(); });
  const [steps, setSteps]               = useState([]);
  const [currentStep, setCurrentStep]   = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [speedIdx, setSpeedIdx]         = useState(1);
  const [searchTarget, setSearchTarget] = useState(42);
  const [arraySize, setArraySize]       = useState(16);

  const intervalRef = useRef(null);

  const generateSteps = useCallback(function(algo, arr) {
    var s = [];
    if (algo === "bubble")    s = generateBubbleSortSteps(arr);
    if (algo === "selection") s = generateSelectionSortSteps(arr);
    if (algo === "insertion") s = generateInsertionSortSteps(arr);
    if (algo === "merge")     s = generateMergeSortSteps(arr);
    if (algo === "binary")    s = generateBinarySearchSteps(arr, searchTarget);
    setSteps(s);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [searchTarget]);

  useEffect(function() {
    generateSteps(selectedAlgo, array);
  }, [selectedAlgo, array, generateSteps]);

  useEffect(function() {
    if (isPlaying) {
      intervalRef.current = setInterval(function() {
        setCurrentStep(function(prev) {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, SPEEDS[speedIdx].ms);
    }
    return function() { clearInterval(intervalRef.current); };
  }, [isPlaying, steps.length, speedIdx]);

  function handleShuffle() {
    var newArr = randomArray(arraySize);
    setArray(newArr);
  }

  function handleReset() {
    setCurrentStep(0);
    setIsPlaying(false);
  }

  function handleStepBack() {
    setIsPlaying(false);
    setCurrentStep(function(p) { return Math.max(0, p - 1); });
  }

  function handleStepForward() {
    setIsPlaying(false);
    setCurrentStep(function(p) { return Math.min(steps.length - 1, p + 1); });
  }

  var frame = steps[currentStep] || { array: array, comparing: [], swapping: [], sorted: [] };
  var algoInfo   = ALGORITHMS.find(function(a) { return a.id === selectedAlgo; });
  var complexity = COMPLEXITY[selectedAlgo];
  var code       = CPP_CODE[selectedAlgo];
  var maxVal     = Math.max.apply(null, frame.array.concat([1]));
  var progress   = steps.length > 1 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0;

  function getBarColor(index) {
    if (frame.sorted   && frame.sorted.includes(index))   return "#22c55e";
    if (frame.swapping && frame.swapping.includes(index)) return "#ef4444";
    if (frame.comparing && frame.comparing.includes(index)) return "#eab308";
    return "#3b82f6";
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold text-white">DSA Visualizer</h1>
        <p className="text-sm text-slate-400 mt-1">Watch sorting algorithms come alive — step by step with C++ code</p>
      </div>

      {/* Algorithm selector */}
      <div className="flex flex-wrap gap-2">
        {ALGORITHMS.map(function(algo) {
          return (
            <button
              key={algo.id}
              onClick={function() { setSelectedAlgo(algo.id); }}
              className={
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all " +
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* LEFT — Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={function() { setIsPlaying(function(p) { return !p; }); }}
              disabled={currentStep >= steps.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-all"
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
              <Shuffle size={14} /> New Array
            </button>

            {/* Speed */}
            <div className="flex items-center gap-1 ml-auto">
              <Zap size={13} className="text-slate-400" />
              {SPEEDS.map(function(s, i) {
                return (
                  <button key={i} onClick={function() { setSpeedIdx(i); }}
                    className={"px-2 py-1 rounded text-xs font-mono transition-all " +
                      (speedIdx === i ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Binary search target */}
          {selectedAlgo === "binary" && (
            <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-4 py-2">
              <span className="text-xs text-slate-400">Search target:</span>
              <input
                type="number" value={searchTarget}
                onChange={function(e) { setSearchTarget(Number(e.target.value)); }}
                className="w-20 bg-transparent text-white text-sm font-mono outline-none"
              />
              <button onClick={function() { generateSteps("binary", array); }}
                className="text-xs text-blue-400 hover:text-blue-300">
                Search →
              </button>
            </div>
          )}

          {/* Array size */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 whitespace-nowrap">Size: {arraySize}</span>
            <input type="range" min="8" max="30" value={arraySize}
              onChange={function(e) {
                var size = Number(e.target.value);
                setArraySize(size);
                setArray(randomArray(size));
              }}
              className="flex-1 accent-blue-500"
            />
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-0.5 bg-slate-950 rounded-lg px-4 pt-4 pb-2" style={{ height: "220px" }}>
            {frame.array.map(function(val, idx) {
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
                  {frame.array.length <= 20 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 hidden group-hover:block whitespace-nowrap">
                      {val}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" /> Comparing</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Swapping</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Sorted</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Unsorted</span>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Step {currentStep} of {steps.length - 1}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-150" style={{ width: progress + "%" }} />
            </div>
          </div>

          {/* Complexity */}
          {complexity && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Best",    val: complexity.best  },
                { label: "Average", val: complexity.avg   },
                { label: "Worst",   val: complexity.worst },
                { label: "Space",   val: complexity.space },
              ].map(function(item) {
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

        {/* RIGHT — Code Panel */}
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
              {code && code.split("\n").map(function(line, i) {
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