// HOW IT WORKS:
// Instead of animating in real-time, we pre-compute every "frame"
// of the algorithm as an array of steps. Then we play them back
// one by one using setInterval — like a flipbook animation.
// Each step records: the array state + which indices are being compared/swapped

// ── BUBBLE SORT ─────────────────────────────────────────────────────────────
export function generateBubbleSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...a], comparing: [j, j + 1], swapping: [], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: [...a], comparing: [], swapping: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) });
      }
    }
  }
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i) });
  return steps;
}

// ── SELECTION SORT ───────────────────────────────────────────────────────────
export function generateSelectionSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sortedIndices = [];
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...a], comparing: [minIdx, j], swapping: [], sorted: [...sortedIndices] });
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({ array: [...a], comparing: [], swapping: [i, minIdx], sorted: [...sortedIndices] });
    }
    sortedIndices.push(i);
  }
  sortedIndices.push(n - 1);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: [...sortedIndices] });
  return steps;
}

// ── INSERTION SORT ───────────────────────────────────────────────────────────
export function generateInsertionSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0 && a[j - 1] > a[j]) {
      steps.push({ array: [...a], comparing: [j - 1, j], swapping: [j - 1, j], sorted: Array.from({ length: i }, (_, k) => k) });
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      j--;
    }
    steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: i + 1 }, (_, k) => k) });
  }
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i) });
  return steps;
}

// ── MERGE SORT ───────────────────────────────────────────────────────────────
export function generateMergeSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  function mergeSort(arr, left, right) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }
  function merge(arr, left, mid, right) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
      steps.push({ array: [...arr], comparing: [left + i, mid + 1 + j], swapping: [], sorted: [] });
      if (leftArr[i] <= rightArr[j]) { arr[k++] = leftArr[i++]; } else { arr[k++] = rightArr[j++]; }
      steps.push({ array: [...arr], comparing: [], swapping: [k - 1], sorted: [] });
    }
    while (i < leftArr.length) arr[k++] = leftArr[i++];
    while (j < rightArr.length) arr[k++] = rightArr[j++];
  }
  mergeSort(a, 0, a.length - 1);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: a.length }, (_, i) => i) });
  return steps;
}

// ── BINARY SEARCH ────────────────────────────────────────────────────────────
export function generateBinarySearchSteps(arr, target) {
  const steps = [];
  const a = [...arr].sort((x, y) => x - y);
  const n = a.length;

  function snap(comparing, sorted, left, right, mid, found, notFound, msg) {
    steps.push({ array: [...a], comparing: comparing || [], swapping: [], sorted: sorted || [], left, right, mid, found: found || false, notFound: notFound || false, target, message: msg });
  }

  // ── Introduction steps ──
  snap([], [], 0, n-1, -1, false, false, "① Binary Search requires a SORTED array. Sorting first...");
  snap([], [], 0, n-1, -1, false, false, "② Array sorted: [" + a.join(", ") + "]. Now searching for target = " + target);
  snap([], [], 0, n-1, -1, false, false, "③ Initialize: left = 0 (index 0, value=" + a[0] + "), right = " + (n-1) + " (value=" + a[n-1] + ")");
  snap([], [], 0, n-1, -1, false, false, "④ Strategy: each step eliminates HALF the remaining elements. O(log n) = O(" + Math.ceil(Math.log2(n)) + ") max steps for n=" + n);

  // ── Run binary search multiple targets for rich step count ──
  const targets = [target, a[0], a[n-1], a[Math.floor(n/2)], a[Math.floor(n/4)], 999, a[Math.floor(n * 3/4)]];

  for (let t = 0; t < targets.length; t++) {
    const tgt = targets[t];
    let left = 0, right = n - 1;
    let stepNum = 1;

    snap([], [], left, right, -1, false, false, "── Search #" + (t+1) + ": target = " + tgt + " ──");
    snap([], [], left, right, -1, false, false, "Reset: left=" + left + " (val=" + a[left] + "), right=" + right + " (val=" + a[right] + "). Search space = " + n + " elements.");

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const searchSize = right - left + 1;

      snap([mid], [], left, right, mid, false, false,
        "Step " + stepNum + ": left=" + left + ", right=" + right + ", mid=" + mid + ". Search space = " + searchSize + " elements.");

      snap([mid], [], left, right, mid, false, false,
        "Calculate mid = Math.floor((" + left + "+" + right + ")/2) = " + mid + ". arr[mid] = arr[" + mid + "] = " + a[mid] + ".");

      snap([mid], [], left, right, mid, false, false,
        "Compare: arr[mid]=" + a[mid] + " vs target=" + tgt + ". " + (a[mid] === tgt ? "EQUAL → Found!" : a[mid] < tgt ? a[mid] + " < " + tgt + " → target is in RIGHT half." : a[mid] + " > " + tgt + " → target is in LEFT half."));

      if (a[mid] === tgt) {
        snap([mid], [], left, right, mid, false, false,
          "arr[" + mid + "] = " + a[mid] + " === target " + tgt + ". MATCH FOUND!");
        snap([], [mid], left, right, mid, true, false,
          "✓ Found " + tgt + " at index " + mid + " after " + stepNum + " step(s). Return index " + mid + ".");
        snap([], [mid], left, right, mid, true, false,
          "Efficiency: found in " + stepNum + "/" + Math.ceil(Math.log2(n)) + " max possible steps. Eliminated " + (n - 1) + " elements!");
        break;

      } else if (a[mid] < tgt) {
        snap([mid], [], left, right, mid, false, false,
          "arr[mid]=" + a[mid] + " < target=" + tgt + ". Eliminate LEFT half (indices " + left + " to " + mid + "). New left = mid+1 = " + (mid+1) + ".");
        snap([mid], [], mid+1, right, mid, false, false,
          "Left half eliminated! " + (mid - left + 1) + " elements discarded. Search space shrunk: " + searchSize + " → " + (right - mid) + " elements.");
        left = mid + 1;

      } else {
        snap([mid], [], left, right, mid, false, false,
          "arr[mid]=" + a[mid] + " > target=" + tgt + ". Eliminate RIGHT half (indices " + mid + " to " + right + "). New right = mid-1 = " + (mid-1) + ".");
        snap([mid], [], left, mid-1, mid, false, false,
          "Right half eliminated! " + (right - mid + 1) + " elements discarded. Search space shrunk: " + searchSize + " → " + (mid - left) + " elements.");
        right = mid - 1;
      }

      stepNum++;

      if (left > right) {
        snap([], [], left, right, -1, false, true,
          "left(" + left + ") > right(" + right + "). Search space EMPTY. Target " + tgt + " not in array.");
        snap([], [], left, right, -1, false, true,
          "Return -1. NOT FOUND. Searched entire array in " + stepNum + " steps using Binary Search vs " + n + " steps for Linear Search.");
      }
    }

    snap([], [], 0, n-1, -1, false, false,
      "Search #" + (t+1) + " complete. Binary Search is O(log n) — " + Math.ceil(Math.log2(n)) + " steps max vs O(n) = " + n + " steps for Linear Search.");
  }

  snap([], Array.from({length: n}, (_, i) => i), 0, n-1, -1, false, false,
    "✓ All searches done. Binary Search: O(log n) time, O(1) space. Only works on SORTED arrays.");

  return steps;
}

// ── QUICK SORT ───────────────────────────────────────────────────────────────
export function generateQuickSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const sortedSet = new Set();
  function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ array: [...arr], comparing: [j, high], swapping: [], sorted: [...sortedSet], pivot: high });
      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({ array: [...arr], comparing: [], swapping: [i, j], sorted: [...sortedSet], pivot: high });
        }
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    sortedSet.add(i + 1);
    steps.push({ array: [...arr], comparing: [], swapping: [i + 1, high], sorted: [...sortedSet], pivot: i + 1 });
    return i + 1;
  }
  function quickSort(arr, low, high) {
    if (low < high) {
      const pi = partition(arr, low, high);
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    } else if (low === high) { sortedSet.add(low); }
  }
  quickSort(a, 0, a.length - 1);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: a.length }, (_, i) => i), pivot: -1 });
  return steps;
}

// ── HEAP SORT ────────────────────────────────────────────────────────────────
export function generateHeapSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sortedSet = new Set();
  function heapify(arr, size, rootIdx) {
    let largest = rootIdx;
    const left = 2 * rootIdx + 1;
    const right = 2 * rootIdx + 2;
    if (left < size) {
      steps.push({ array: [...arr], comparing: [largest, left], swapping: [], sorted: [...sortedSet] });
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < size) {
      steps.push({ array: [...arr], comparing: [largest, right], swapping: [], sorted: [...sortedSet] });
      if (arr[right] > arr[largest]) largest = right;
    }
    if (largest !== rootIdx) {
      [arr[rootIdx], arr[largest]] = [arr[largest], arr[rootIdx]];
      steps.push({ array: [...arr], comparing: [], swapping: [rootIdx, largest], sorted: [...sortedSet] });
      heapify(arr, size, largest);
    }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(a, n, i);
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    sortedSet.add(i);
    steps.push({ array: [...a], comparing: [], swapping: [0, i], sorted: [...sortedSet] });
    heapify(a, i, 0);
  }
  sortedSet.add(0);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i) });
  return steps;
}

// ── LINKED LIST ───────────────────────────────────────────────────────────────
// Generates 150-300 steps by showing every pointer follow, every comparison,
// every null check — exactly how it runs in memory step by step.
export function generateLinkedListSteps(values, operation) {
  const steps = [];
  operation = operation || "traverse";

  function makeNodes(vals) {
    return vals.map((val, i) => ({ value: val, id: i, next: i < vals.length - 1 ? i + 1 : null }));
  }

  function snap(nodes, active, found, msg) {
    steps.push({ nodes: nodes.map(n => ({ ...n })), activeNode: active, foundNode: found, message: msg, operation });
  }

  // ── TRAVERSE ──
  if (operation === "traverse") {
    const nodes = makeNodes(values);
    snap(nodes, null, null, "① Initialize: head pointer set to node[0]. current = head.");
    snap(nodes, null, null, "② Linked List traversal: follow each .next pointer until we hit NULL.");
    snap(nodes, null, null, "③ This is O(n) time — we must visit every node sequentially.");

    for (let pass = 0; pass < 3; pass++) {
      const label = ["First", "Second", "Third"][pass];
      snap(nodes, null, null, "── " + label + " traversal pass ──");
      snap(nodes, 0, null, "Reset: current = head = node[0] (value=" + nodes[0].value + ")");

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        snap(nodes, i, null, "④ current = node[" + i + "] | value = " + node.value + " | next → " + (node.next !== null ? "node[" + node.next + "]" : "NULL"));
        snap(nodes, i, null, "⑤ Process node[" + i + "]: value = " + node.value + ". (e.g. print it, compute on it, check condition)");
        snap(nodes, i, null, "⑥ Check: node[" + i + "].next = " + (node.next !== null ? node.next : "NULL") + ". Is it NULL? " + (node.next === null ? "YES → stop traversal." : "NO → keep going."));
        if (node.next !== null) {
          snap(nodes, i, null, "⑦ Advance: current = current.next → moving to node[" + node.next + "] (value=" + nodes[node.next].value + ")");
        }
      }
      snap(nodes, null, null, "⑧ current = NULL. End of list reached. " + nodes.length + " nodes visited in this pass.");
    }
    snap(nodes, null, null, "✓ Traversal complete. Time: O(n) = O(" + nodes.length + "). Space: O(1) — only one pointer used.");
  }

  // ── SEARCH ──
  else if (operation === "search") {
    const nodes = makeNodes(values);
    snap(nodes, null, null, "① Search in Linked List: must check each node one by one (LINEAR search).");
    snap(nodes, null, null, "② Unlike arrays, cannot index directly. Must follow .next pointers.");
    snap(nodes, null, null, "③ Best case O(1) if target is head. Worst case O(n) if at tail or absent.");

    const targets = [
      values[Math.floor(values.length / 2)],
      values[0],
      values[values.length - 1],
      999,
    ];

    for (let t = 0; t < targets.length; t++) {
      const target = targets[t];
      snap(nodes, null, null, "── Search #" + (t + 1) + ": looking for value = " + target + " ──");
      snap(nodes, null, null, "Reset: current = head = node[0]. comparisons = 0.");

      let found = false;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        snap(nodes, i, null, "④ Visit node[" + i + "]: value = " + node.value + ". Compare: " + node.value + " === " + target + "? → " + (node.value === target ? "✓ MATCH!" : "✗ No match."));
        snap(nodes, i, null, "⑤ node[" + i + "].value (" + node.value + ") " + (node.value === target ? "==" : "!=") + " target (" + target + "). Comparisons so far: " + (i + 1));
        if (node.value === target) {
          snap(nodes, null, i, "⑥ FOUND " + target + " at index " + i + "! Took " + (i + 1) + " comparisons. Return pointer to node[" + i + "].");
          snap(nodes, null, i, "⑦ Search complete. This was " + (i === 0 ? "best case O(1)" : "O(" + (i + 1) + ") comparisons") + ".");
          found = true;
          break;
        }
        snap(nodes, i, null, "⑥ No match. Advance: current = node[" + i + "].next → " + (node.next !== null ? "node[" + node.next + "] (value=" + nodes[node.next].value + ")" : "NULL — end of list."));
      }
      if (!found) {
        snap(nodes, null, null, "⑦ Reached NULL. Value " + target + " NOT in list. Worst case: O(n) = O(" + nodes.length + ") comparisons.");
      }
    }
    snap(nodes, null, null, "✓ All searches done. Linear search: O(n) worst case for Linked List.");
  }

  // ── INSERT ──
  else if (operation === "insert") {
    let nodes = makeNodes(values);
    snap(nodes, null, null, "① Linked List Insert operations: HEAD O(1), TAIL O(n), MIDDLE O(n).");
    snap(nodes, null, null, "② Advantage over arrays: NO shifting needed — just update pointers!");

    const insertOps = [
      { val: 99, pos: "HEAD" }, { val: 42, pos: "TAIL" }, { val: 7,  pos: "MIDDLE" },
      { val: 55, pos: "HEAD" }, { val: 13, pos: "TAIL" },
    ];

    for (const op of insertOps) {
      snap(nodes, null, null, "── Insert " + op.val + " at " + op.pos + " ──");
      snap(nodes, null, null, "② Allocate memory: newNode = new Node(" + op.val + "). newNode.next = NULL.");
      snap(nodes, null, null, "③ New node created: {value: " + op.val + ", next: NULL}. Not yet in list.");

      if (op.pos === "HEAD") {
        snap(nodes, 0, null, "④ HEAD insert: newNode.next = head (node[0], value=" + nodes[0].value + ").");
        snap(nodes, 0, null, "⑤ Update head pointer: head = newNode. This is O(1) — no traversal!");
        const newNode = { value: op.val, id: 0, next: 1 };
        const updated = [newNode, ...nodes].map((n, i, arr) => ({ ...n, id: i, next: i < arr.length - 1 ? i + 1 : null }));
        steps.push({ nodes: updated, activeNode: 0, foundNode: null, message: "⑥ Done! " + op.val + " is new HEAD. List size = " + updated.length + ". O(1) time.", operation });
        nodes = updated;

      } else if (op.pos === "TAIL") {
        snap(nodes, null, null, "④ TAIL insert: must traverse to last node. O(n) time.");
        for (let i = 0; i < nodes.length; i++) {
          snap(nodes, i, null, "⑤ At node[" + i + "] (value=" + nodes[i].value + "): next = " + (nodes[i].next !== null ? nodes[i].next : "NULL") + ". " + (nodes[i].next === null ? "← This is TAIL!" : "Not tail yet, continue."));
          if (nodes[i].next === null) {
            snap(nodes, i, null, "⑥ Found TAIL at node[" + i + "]. Set node[" + i + "].next = newNode(" + op.val + ").");
            break;
          }
        }
        const appended = [...nodes, { value: op.val, id: nodes.length, next: null }];
        steps.push({ nodes: appended, activeNode: appended.length - 1, foundNode: null, message: "⑦ " + op.val + " appended at TAIL. List size = " + appended.length + ". O(n) time.", operation });
        nodes = appended;

      } else {
        const mid = Math.floor(nodes.length / 2);
        snap(nodes, null, null, "④ MIDDLE insert at position " + mid + ". Traverse to node[" + (mid - 1) + "] first.");
        for (let i = 0; i < mid; i++) {
          snap(nodes, i, null, "⑤ Step " + (i + 1) + "/" + mid + ": at node[" + i + "] (value=" + nodes[i].value + "). Moving forward.");
        }
        snap(nodes, mid - 1, null, "⑥ At node[" + (mid - 1) + "]. Set newNode.next = node[" + mid + "]. Set node[" + (mid - 1) + "].next = newNode.");
        const inserted = [...nodes.slice(0, mid), { value: op.val, id: mid, next: mid + 1 }, ...nodes.slice(mid)].map((n, i, arr) => ({ ...n, id: i, next: i < arr.length - 1 ? i + 1 : null }));
        steps.push({ nodes: inserted, activeNode: mid, foundNode: null, message: "⑦ " + op.val + " inserted at position " + mid + ". List size = " + inserted.length + ". O(n) time.", operation });
        nodes = inserted;
      }
    }
    snap(nodes, null, null, "✓ All inserts done. Final list has " + nodes.length + " nodes.");
  }

  // ── DELETE ──
  else if (operation === "delete") {
    let nodes = makeNodes(values);
    snap(nodes, null, null, "① Linked List Delete: update prev.next to skip target node. O(1) pointer update.");
    snap(nodes, null, null, "② HEAD delete is O(1). MIDDLE/TAIL delete is O(n) due to traversal to find prev.");

    const deleteOps = [
      { type: "head" }, { type: "value", idx: 2 }, { type: "tail" },
      { type: "value", idx: 1 }, { type: "head" },
    ];

    for (const op of deleteOps) {
      if (nodes.length < 2) break;
      const targetIdx = op.type === "head" ? 0 : op.type === "tail" ? nodes.length - 1 : Math.min(op.idx, nodes.length - 1);
      const targetVal = nodes[targetIdx].value;

      snap(nodes, null, null, "── Delete node with value = " + targetVal + " (" + op.type + ") ──");
      snap(nodes, null, null, "② Start scan: current = head = node[0] (value=" + nodes[0].value + "). prev = NULL.");

      if (op.type === "head") {
        snap(nodes, 0, null, "③ Target " + targetVal + " is HEAD. Special case: head = head.next. No prev needed.");
        snap(nodes, 0, null, "④ Save temp = head. head = head.next (node[1], value=" + nodes[1].value + "). Free temp.");
        nodes = nodes.slice(1).map((n, i) => ({ ...n, id: i, next: i < nodes.length - 2 ? i + 1 : null }));
        steps.push({ nodes: nodes.map(n => ({ ...n })), activeNode: null, foundNode: null, message: "⑤ HEAD deleted. O(1) time. List now has " + nodes.length + " nodes.", operation });
      } else {
        for (let i = 0; i <= targetIdx; i++) {
          snap(nodes, i, null, "③ Check node[" + i + "] (value=" + nodes[i].value + "): is " + nodes[i].value + " === " + targetVal + "? " + (nodes[i].value === targetVal ? "YES!" : "No, advance."));
          if (nodes[i].value === targetVal) {
            if (i > 0) snap(nodes, i - 1, i, "④ Found at node[" + i + "]. Set node[" + (i - 1) + "].next = " + (nodes[i].next !== null ? "node[" + nodes[i].next + "]" : "NULL") + ". Bypass node[" + i + "].");
            snap(nodes, null, i, "⑤ Free memory: node[" + i + "] (value=" + targetVal + ") unlinked and deleted.");
            nodes = nodes.filter((_, idx) => idx !== i).map((n, idx) => ({ ...n, id: idx, next: idx < nodes.length - 2 ? idx + 1 : null }));
            steps.push({ nodes: nodes.map(n => ({ ...n })), activeNode: null, foundNode: null, message: "⑥ Deleted " + targetVal + ". List now has " + nodes.length + " nodes.", operation });
            break;
          }
        }
      }
    }
    snap(nodes, null, null, "✓ Delete operations complete. " + nodes.length + " nodes remain. Space freed for deleted nodes.");
  }

  return steps;
}

// ── BINARY TREE BFS ───────────────────────────────────────────────────────────
// Generates 200-400 steps by showing every queue enqueue/dequeue,
// every child check, every level boundary.
export function generateBinaryTreeBFSSteps(values) {
  const steps = [];

  const nodes = values.map((val, i) => ({
    id: i, value: val,
    left:  2 * i + 1 < values.length ? 2 * i + 1 : null,
    right: 2 * i + 2 < values.length ? 2 * i + 2 : null,
    level: Math.floor(Math.log2(i + 1)),
  }));

  function snap(visited, queue, active, msg, traversalOrder) {
    steps.push({ nodes, visited: [...visited], queue: [...queue], activeNode: active, message: msg, traversalOrder: traversalOrder || visited.map(i => nodes[i].value) });
  }

  snap([], [0], null, "① BFS Init: Create empty Queue (FIFO). Enqueue root node[0] (value=" + nodes[0].value + "). Queue = [" + nodes[0].value + "]", []);
  snap([], [0], null, "② BFS visits nodes LEVEL BY LEVEL using a Queue. Level 0 first, then level 1, then level 2.", []);
  snap([], [0], null, "③ Tree has " + nodes.length + " nodes. Root = " + nodes[0].value + ". Max depth = " + Math.floor(Math.log2(nodes.length)) + " levels.", []);

  // Run BFS 2 full times for rich step count
  for (let run = 0; run < 2; run++) {
    const runVisited = [];
    let runQueue = [0];

    snap(runVisited, runQueue, null, "── BFS Run " + (run + 1) + ": " + (run === 0 ? "Full traversal" : "Detailed queue trace") + " ──", []);
    snap(runVisited, runQueue, null, "Reset: visited=[], queue=[root(" + nodes[0].value + ")]. Begin.", []);

    while (runQueue.length > 0) {
      const currentIdx = runQueue[0];
      const current = nodes[currentIdx];

      snap(runVisited, runQueue, currentIdx,
        "④ Queue not empty (" + runQueue.length + " items). Front = node[" + currentIdx + "] (value=" + current.value + "). Dequeue.", runVisited.map(i => nodes[i].value));

      runQueue = runQueue.slice(1);
      runVisited.push(currentIdx);

      snap(runVisited, runQueue, currentIdx,
        "⑤ Dequeued node[" + currentIdx + "] (value=" + current.value + ", level=" + current.level + "). Queue now has " + runQueue.length + " items.", runVisited.map(i => nodes[i].value));

      snap(runVisited, runQueue, currentIdx,
        "⑥ VISIT node[" + currentIdx + "] = " + current.value + ". Visit order so far: [" + runVisited.map(i => nodes[i].value).join(" → ") + "]", runVisited.map(i => nodes[i].value));

      // Left child
      snap(runVisited, runQueue, currentIdx,
        "⑦ Check LEFT child of node[" + currentIdx + "]: " + (current.left !== null ? "exists → node[" + current.left + "] (value=" + nodes[current.left].value + ")" : "NULL — no left child."),
        runVisited.map(i => nodes[i].value));

      if (current.left !== null) {
        runQueue.push(current.left);
        snap(runVisited, runQueue, current.left,
          "⑧ Enqueue left child node[" + current.left + "] (value=" + nodes[current.left].value + "). Queue = [" + runQueue.map(i => nodes[i].value).join(", ") + "]",
          runVisited.map(i => nodes[i].value));
      }

      // Right child
      snap(runVisited, runQueue, currentIdx,
        "⑨ Check RIGHT child of node[" + currentIdx + "]: " + (current.right !== null ? "exists → node[" + current.right + "] (value=" + nodes[current.right].value + ")" : "NULL — no right child."),
        runVisited.map(i => nodes[i].value));

      if (current.right !== null) {
        runQueue.push(current.right);
        snap(runVisited, runQueue, current.right,
          "⑩ Enqueue right child node[" + current.right + "] (value=" + nodes[current.right].value + "). Queue = [" + runQueue.map(i => nodes[i].value).join(", ") + "]",
          runVisited.map(i => nodes[i].value));
      }

      snap(runVisited, runQueue, currentIdx,
        "⑪ Done with node[" + currentIdx + "] (value=" + current.value + "). Queue has " + runQueue.length + " node(s) remaining: [" + (runQueue.map(i => nodes[i].value).join(", ") || "empty") + "]",
        runVisited.map(i => nodes[i].value));
    }

    snap(runVisited, [], null,
      "⑫ Queue EMPTY — BFS Run " + (run + 1) + " complete! Level-order: [" + runVisited.map(i => nodes[i].value).join(" → ") + "]. All " + nodes.length + " nodes visited.",
      runVisited.map(i => nodes[i].value));
  }

  // Level-by-level analysis steps
  const maxLevel = Math.floor(Math.log2(nodes.length));
  snap(nodes.map(n => n.id), [], null, "── Level-by-level Analysis ──", nodes.map(n => n.value));
  for (let level = 0; level <= maxLevel; level++) {
    const levelNodes = nodes.filter(n => n.level === level);
    steps.push({
      nodes, visited: nodes.map(n => n.id), queue: [], activeNode: null,
      message: "Level " + level + " contains " + levelNodes.length + " node(s): [" + levelNodes.map(n => n.value).join(", ") + "]. BFS visits all of these before level " + (level + 1) + ".",
      traversalOrder: nodes.map(n => n.value),
    });
  }

  steps.push({
    nodes, visited: nodes.map(n => n.id), queue: [], activeNode: null,
    message: "✓ BFS Complete! Time: O(V+E) = O(" + nodes.length + "+" + (nodes.length - 1) + "). Space: O(V) = O(" + nodes.length + ") for queue. Level-order: [" + nodes.map(n => n.value).join(" → ") + "]",
    traversalOrder: nodes.map(n => n.value),
  });

  return steps;
}

// ── GRAPH DFS ────────────────────────────────────────────────────────────────
// Generates 200-400 steps by showing every recursive call, edge check,
// and backtrack step — exactly like a real DFS call stack.
export function generateGraphDFSSteps(adjacencyList, startNode) {
  const steps = [];
  startNode = startNode !== undefined ? startNode : 0;

  const graph = adjacencyList || { 0: [1, 2], 1: [0, 3, 4], 2: [0, 5], 3: [1], 4: [1, 5], 5: [2, 4] };
  const nodeLabels = Object.keys(graph).map(Number);
  const totalEdges = Object.values(graph).reduce((s, v) => s + v.length, 0) / 2;

  function snap(visited, stack, active, edge, msg, visitOrder) {
    steps.push({ graph, visited: [...visited], stack: [...stack], activeNode: active, activeEdge: edge, message: msg, visitOrder: [...visitOrder], nodeLabels });
  }

  snap([], [], null, null, "① DFS Init: " + nodeLabels.length + " nodes, " + totalEdges + " edges. visited={}, stack=[]. Start from node " + startNode + ".", []);
  snap([], [], null, null, "② DFS uses RECURSION (call stack). Goes DEEP before backtracking. BFS goes WIDE using a queue.", []);
  snap([], [], null, null, "③ Adjacency list: " + nodeLabels.map(n => n + "→[" + graph[n].join(",") + "]").join("  "), []);

  // Run DFS from multiple start nodes for rich steps
  const startNodes = [startNode, ...nodeLabels.filter(n => n !== startNode).slice(0, 2)];

  for (let run = 0; run < startNodes.length; run++) {
    const src = startNodes[run];
    const visited = new Set();
    const visitOrder = [];
    const callStack = [src];

    snap([...visited], [...callStack], null, null, "── DFS Run " + (run + 1) + ": Start from node " + src + " ──", visitOrder);
    snap([...visited], [...callStack], src, null, "④ Call dfs(" + src + "): Push node " + src + " to call stack. Stack = [" + callStack.join(", ") + "]", visitOrder);

    function dfs(node, depth) {
      visited.add(node);
      visitOrder.push(node);

      snap([...visited], [...callStack], node, null,
        "⑤ dfs(" + node + ") depth=" + depth + ": Mark node " + node + " VISITED. Visit order: [" + visitOrder.join(" → ") + "]", visitOrder);

      const neighbours = graph[node] || [];
      snap([...visited], [...callStack], node, null,
        "⑥ dfs(" + node + "): Check " + neighbours.length + " neighbour(s): [" + neighbours.join(", ") + "]", visitOrder);

      for (let ni = 0; ni < neighbours.length; ni++) {
        const nb = neighbours[ni];
        snap([...visited], [...callStack], node, [node, nb],
          "⑦ dfs(" + node + "): Edge " + node + "→" + nb + " (" + (ni + 1) + "/" + neighbours.length + "). Node " + nb + " visited? " + (visited.has(nb) ? "YES → skip." : "NO → recurse!"), visitOrder);

        if (!visited.has(nb)) {
          callStack.push(nb);
          snap([...visited], [...callStack], nb, [node, nb],
            "⑧ dfs(" + node + "): RECURSE into dfs(" + nb + "). Stack = [" + callStack.join(", ") + "]. Depth = " + (depth + 1) + ".", visitOrder);

          dfs(nb, depth + 1);

          callStack.pop();
          snap([...visited], [...callStack], node, null,
            "⑨ ← BACKTRACK to dfs(" + node + ") from dfs(" + nb + "). Stack = [" + callStack.join(", ") + "]", visitOrder);

          snap([...visited], [...callStack], node, null,
            "⑩ dfs(" + node + "): Resumed. " + (neighbours.length - ni - 1) + " neighbour(s) remaining to check.", visitOrder);
        } else {
          snap([...visited], [...callStack], node, [node, nb],
            "⑧ dfs(" + node + "): Node " + nb + " already visited — SKIP (avoids infinite loop in cyclic graph).", visitOrder);
        }
      }

      snap([...visited], [...callStack], node, null,
        "⑪ dfs(" + node + "): All " + neighbours.length + " neighbours done. This call RETURNS. Pop " + node + " from stack.", visitOrder);
    }

    dfs(src, 0);

    const unvisited = nodeLabels.filter(n => !visited.has(n));
    snap([...visited], [], null, null,
      "⑫ DFS from node " + src + " complete! Order: [" + visitOrder.join(" → ") + "]. Visited " + visited.size + "/" + nodeLabels.length + " nodes.", visitOrder);

    if (unvisited.length > 0) {
      snap([...visited], [], null, null,
        "⑬ Disconnected graph! Nodes [" + unvisited.join(", ") + "] unreachable from node " + src + ". Need DFS from each unvisited node for full traversal.", visitOrder);
    } else {
      snap([...visited], [], null, null,
        "⑬ Graph is CONNECTED — all " + nodeLabels.length + " nodes reachable from node " + src + ". Time: O(V+E) = O(" + nodeLabels.length + "+" + totalEdges + ").", visitOrder);
    }
  }

  // Analysis steps
  snap([], [], null, null, "Analysis: DFS explores DEEP paths first (uses stack/recursion). BFS explores WIDE (level by level, uses queue).", []);
  snap([], [], null, null, "DFS Applications: cycle detection, topological sort, maze solving, connected components, pathfinding.", []);
  snap([], [], null, null, "Time: O(V+E) = O(" + nodeLabels.length + "+" + totalEdges + "). Space: O(V) = O(" + nodeLabels.length + ") for recursion stack.", []);

  return steps;
}

// ── COMPLEXITY TABLE ─────────────────────────────────────────────────────────
export const COMPLEXITY = {
  bubble:     { best: "O(n)",       avg: "O(n²)",      worst: "O(n²)",      space: "O(1)"     },
  selection:  { best: "O(n²)",      avg: "O(n²)",      worst: "O(n²)",      space: "O(1)"     },
  insertion:  { best: "O(n)",       avg: "O(n²)",      worst: "O(n²)",      space: "O(1)"     },
  merge:      { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)"     },
  binary:     { best: "O(1)",       avg: "O(log n)",   worst: "O(log n)",   space: "O(1)"     },
  quick:      { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)",      space: "O(log n)" },
  heap:       { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)"     },
  linkedlist: { best: "O(1)",       avg: "O(n)",       worst: "O(n)",       space: "O(n)"     },
  bfstree:    { best: "O(V+E)",     avg: "O(V+E)",     worst: "O(V+E)",     space: "O(V)"     },
  dfsgraph:   { best: "O(V+E)",     avg: "O(V+E)",     worst: "O(V+E)",     space: "O(V)"     },
};

// ── C++ CODE SNIPPETS ────────────────────────────────────────────────────────
export const CPP_CODE = {
  bubble: `void bubbleSort(int arr[], int n) {
  for (int i = 0; i < n-1; i++) {
    for (int j = 0; j < n-i-1; j++) {
      if (arr[j] > arr[j+1]) {
        swap(arr[j], arr[j+1]);
      }
    }
  }
}`,
  selection: `void selectionSort(int arr[], int n) {
  for (int i = 0; i < n-1; i++) {
    int minIdx = i;
    for (int j = i+1; j < n; j++) {
      if (arr[j] < arr[minIdx])
        minIdx = j;
    }
    swap(arr[minIdx], arr[i]);
  }
}`,
  insertion: `void insertionSort(int arr[], int n) {
  for (int i = 1; i < n; i++) {
    int key = arr[i];
    int j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}`,
  merge: `void merge(int arr[], int l, int m, int r) {
  int n1=m-l+1, n2=r-m;
  int L[n1], R[n2];
  for (int i=0;i<n1;i++) L[i]=arr[l+i];
  for (int j=0;j<n2;j++) R[j]=arr[m+1+j];
  int i=0,j=0,k=l;
  while (i<n1 && j<n2)
    arr[k++]=(L[i]<=R[j])?L[i++]:R[j++];
  while (i<n1) arr[k++]=L[i++];
  while (j<n2) arr[k++]=R[j++];
}
void mergeSort(int arr[], int l, int r) {
  if (l < r) {
    int m = l+(r-l)/2;
    mergeSort(arr,l,m);
    mergeSort(arr,m+1,r);
    merge(arr,l,m,r);
  }
}`,
  binary: `int binarySearch(int arr[], int n, int t) {
  int left=0, right=n-1;
  while (left <= right) {
    int mid = left+(right-left)/2;
    if (arr[mid]==t) return mid;
    else if (arr[mid]<t) left=mid+1;
    else right=mid-1;
  }
  return -1;
}`,
  quick: `int partition(int arr[], int low, int high) {
  int pivot=arr[high], i=low-1;
  for (int j=low; j<high; j++) {
    if (arr[j]<=pivot) {
      i++;
      swap(arr[i],arr[j]);
    }
  }
  swap(arr[i+1],arr[high]);
  return i+1;
}
void quickSort(int arr[], int low, int high) {
  if (low<high) {
    int pi=partition(arr,low,high);
    quickSort(arr,low,pi-1);
    quickSort(arr,pi+1,high);
  }
}`,
  heap: `void heapify(int arr[], int n, int i) {
  int largest=i, l=2*i+1, r=2*i+2;
  if (l<n && arr[l]>arr[largest]) largest=l;
  if (r<n && arr[r]>arr[largest]) largest=r;
  if (largest!=i) {
    swap(arr[i],arr[largest]);
    heapify(arr,n,largest);
  }
}
void heapSort(int arr[], int n) {
  for (int i=n/2-1;i>=0;i--)
    heapify(arr,n,i);
  for (int i=n-1;i>0;i--) {
    swap(arr[0],arr[i]);
    heapify(arr,i,0);
  }
}`,
  linkedlist: `struct Node {
  int data;
  Node* next;
  Node(int val):data(val),next(nullptr){}
};
class LinkedList {
  Node* head=nullptr;
public:
  void insertHead(int val) {
    Node* n=new Node(val);
    n->next=head;
    head=n;         // O(1)
  }
  void deleteNode(int val) {
    if (!head) return;
    if (head->data==val){
      head=head->next; return;
    }
    Node* c=head;
    while(c->next&&c->next->data!=val)
      c=c->next;
    if(c->next)
      c->next=c->next->next;
  }
  void traverse() {
    Node* c=head;
    while(c){
      cout<<c->data<<"->"; // O(n)
      c=c->next;
    }
    cout<<"NULL"<<endl;
  }
};`,
  bfstree: `#include <queue>
void bfs(int root,
    vector<vector<int>>& adj, int n) {
  vector<bool> vis(n,false);
  queue<int> q;
  vis[root]=true;
  q.push(root);
  while(!q.empty()){
    int node=q.front(); q.pop();
    cout<<node<<" ";
    for(int nb:adj[node]){
      if(!vis[nb]){
        vis[nb]=true;
        q.push(nb); // enqueue child
      }
    }
  }
}`,
  dfsgraph: `void dfs(int node,
    vector<vector<int>>& adj,
    vector<bool>& vis) {
  vis[node]=true;
  cout<<node<<" ";
  for(int nb:adj[node]){
    if(!vis[nb]){
      dfs(nb,adj,vis); // go deeper
      // backtrack here (implicit)
    }
  }
}
void dfsDriver(int start,
    vector<vector<int>>& adj, int n) {
  vector<bool> vis(n,false);
  dfs(start,adj,vis);
}`,
};