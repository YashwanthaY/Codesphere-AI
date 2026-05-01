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
      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        });
      }
    }
  }

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
  });

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
      steps.push({
        array: [...a],
        comparing: [minIdx, j],
        swapping: [],
        sorted: [...sortedIndices],
      });

      if (a[j] < a[minIdx]) minIdx = j;
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [i, minIdx],
        sorted: [...sortedIndices],
      });
    }
    sortedIndices.push(i);
  }

  sortedIndices.push(n - 1);
  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [...sortedIndices],
  });

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
      steps.push({
        array: [...a],
        comparing: [j - 1, j],
        swapping: [j - 1, j],
        sorted: Array.from({ length: i }, (_, k) => k),
      });
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      j--;
    }
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
    });
  }

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
  });

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
      steps.push({
        array: [...arr],
        comparing: [left + i, mid + 1 + j],
        swapping: [],
        sorted: [],
      });

      if (leftArr[i] <= rightArr[j]) {
        arr[k++] = leftArr[i++];
      } else {
        arr[k++] = rightArr[j++];
      }

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [k - 1],
        sorted: [],
      });
    }

    while (i < leftArr.length) arr[k++] = leftArr[i++];
    while (j < rightArr.length) arr[k++] = rightArr[j++];
  }

  mergeSort(a, 0, a.length - 1);

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
  });

  return steps;
}

// ── BINARY SEARCH ────────────────────────────────────────────────────────────
export function generateBinarySearchSteps(arr, target) {
  const steps = [];
  const a = [...arr].sort((x, y) => x - y);
  let left = 0, right = a.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      array: [...a],
      comparing: [mid],
      swapping: [],
      sorted: [],
      left,
      right,
      mid,
      found: false,
      target,
    });

    if (a[mid] === target) {
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [mid],
        left,
        right,
        mid,
        found: true,
        target,
      });
      return steps;
    } else if (a[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [],
    found: false,
    notFound: true,
    target,
  });

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
      steps.push({
        array: [...arr],
        comparing: [j, high],
        swapping: [],
        sorted: [...sortedSet],
        pivot: high,
      });

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [i, j],
            sorted: [...sortedSet],
            pivot: high,
          });
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    sortedSet.add(i + 1);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [i + 1, high],
      sorted: [...sortedSet],
      pivot: i + 1,
    });

    return i + 1;
  }

  function quickSort(arr, low, high) {
    if (low < high) {
      const pi = partition(arr, low, high);
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    } else if (low === high) {
      sortedSet.add(low);
    }
  }

  quickSort(a, 0, a.length - 1);

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    pivot: -1,
  });

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
    const left  = 2 * rootIdx + 1;
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

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(a, n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    sortedSet.add(i);
    steps.push({ array: [...a], comparing: [], swapping: [0, i], sorted: [...sortedSet] });
    heapify(a, i, 0);
  }

  sortedSet.add(0);
  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
  });

  return steps;
}

// ── LINKED LIST ───────────────────────────────────────────────────────────────
// Generates 150-300 steps by showing every pointer follow, every comparison,
// every null check — exactly how it runs in memory step by step.
export function generateLinkedListSteps(values, operation) {
  const steps = [];
  operation = operation || "traverse";

  function makeNodes(vals) {
    return vals.map((val, i) => ({
      value: val,
      id: i,
      next: i < vals.length - 1 ? i + 1 : null,
    }));
  }

  function snap(nodes, active, found, msg, extra) {
    steps.push(Object.assign({
      nodes: nodes.map(n => ({ ...n })),
      activeNode: active,
      foundNode: found,
      message: msg,
      operation,
    }, extra || {}));
  }

  // ── TRAVERSE ────────────────────────────────────────────────────────────
  if (operation === "traverse") {
    const nodes = makeNodes(values);

    snap(nodes, null, null, "① Initialize: head pointer set to node[0]. Current = head.");

    for (let pass = 0; pass < 3; pass++) {
      // Do 3 full traversals to generate more steps like a real animation
      const passLabel = pass === 0 ? "First" : pass === 1 ? "Second" : "Third";
      snap(nodes, null, null, `── ${passLabel} traversal pass ──`);

      let current = 0;
      while (current !== null) {
        const node = nodes[current];

        snap(nodes, current, null,
          `② current = node[${current}] | value = ${node.value} | next → ${node.next !== null ? "node[" + node.next + "]" : "NULL"}`);

        snap(nodes, current, null,
          `③ Process node[${current}]: value = ${node.value}. (In real code: print / use this value.)`);

        snap(nodes, current, null,
          `④ Check: node[${current}].next = ${node.next !== null ? node.next : "NULL"}. Is it NULL?  ${node.next === null ? "YES → stop." : "NO → move forward."}`);

        if (node.next !== null) {
          snap(nodes, current, null,
            `⑤ Advance: current = current.next → moving to node[${node.next}] (value = ${nodes[node.next].value})`);
        }

        current = node.next;
      }

      snap(nodes, null, null,
        `⑥ current is NULL — reached end of list. Traversal complete (${nodes.length} nodes visited).`);
    }
  }

  // ── SEARCH ────────────────────────────────────────────────────────────
  else if (operation === "search") {
    const nodes = makeNodes(values);
    const target = values[Math.floor(values.length / 2)];
    let position = 0;

    snap(nodes, null, null,
      `① Search for value = ${target}. Initialize: current = head (node[0]), position = 0.`);

    snap(nodes, null, null,
      `② Linked List search is LINEAR — must check each node one by one. Cannot jump like Binary Search.`);

    // Do multiple search passes for step richness
    for (let attempt = 0; attempt < 3; attempt++) {
      const attemptLabel = ["First", "Second", "Third"][attempt];
      const searchVal = attempt === 0 ? target : values[(attempt * 2) % values.length];

      snap(nodes, null, null, `── ${attemptLabel} search: looking for ${searchVal} ──`);
      snap(nodes, null, null, `③ Reset: current = head = node[0]. Begin scan.`);

      let found = false;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        snap(nodes, i, null,
          `④ Visit node[${i}]: value = ${node.value}. Compare: ${node.value} === ${searchVal}? → ${node.value === searchVal ? "✓ MATCH!" : "✗ No match."}`);

        snap(nodes, i, null,
          `⑤ node[${i}].value (${node.value}) ${node.value === searchVal ? "==" : "!="} target (${searchVal}). ${node.value === searchVal ? "Found! Stop." : "Continue."}`);

        if (node.value === searchVal) {
          snap(nodes, null, i,
            `⑥ FOUND ${searchVal} at index ${i} (node[${i}])! Time complexity: O(${i + 1}) comparisons made.`);
          snap(nodes, null, i,
            `⑦ Return pointer to node[${i}]. Search complete. Best case O(1), this took O(${i + 1}).`);
          found = true;
          break;
        }

        snap(nodes, i, null,
          `⑥ No match. Advance: current = node[${i}].next → ${node.next !== null ? "node[" + node.next + "]" : "NULL (end of list)"}`);
      }

      if (!found) {
        snap(nodes, null, null,
          `⑦ Reached end (NULL). Value ${searchVal} NOT found. Worst case: O(n) = O(${nodes.length}) comparisons.`);
      }
    }
  }

  // ── INSERT ────────────────────────────────────────────────────────────
  else if (operation === "insert") {
    const nodes = makeNodes(values);
    const insertValues = [99, 42, 7, 55, 13];

    snap(nodes, null, null,
      `① Linked List Insert. We will demonstrate insertions at HEAD, TAIL, and MIDDLE.`);

    // Insert at head (multiple times for steps)
    for (let ins = 0; ins < insertValues.length; ins++) {
      const newVal = insertValues[ins];
      const insertPos = ins % 3 === 0 ? "HEAD" : ins % 3 === 1 ? "TAIL" : "MIDDLE";

      snap(nodes, null, null, `── Insert ${newVal} at ${insertPos} ──`);

      snap(nodes, null, null,
        `② Allocate new node: newNode = {value: ${newVal}, next: NULL}. Memory allocated.`);

      snap(nodes, null, null,
        `③ New node created with value = ${newVal}. Currently disconnected from list.`);

      if (insertPos === "HEAD") {
        snap(nodes, 0, null,
          `④ Insert at HEAD: newNode.next = head (node[0], value=${nodes[0].value}). Link new node to current head.`);

        snap(nodes, 0, null,
          `⑤ Update head pointer: head = newNode. New node[${newVal}] is now the first element.`);

        // Actually prepend to node list for visual
        const newNode = { value: newVal, id: -1, next: 0 };
        const updated = [newNode, ...nodes].map((n, i, arr) => ({
          ...n, id: i, next: i < arr.length - 1 ? i + 1 : null
        }));
        steps.push({
          nodes: updated,
          activeNode: 0,
          foundNode: null,
          message: `⑥ Done! List now has ${updated.length} nodes. Head = ${newVal}. O(1) time — no traversal needed.`,
          operation,
        });

      } else if (insertPos === "TAIL") {
        snap(nodes, null, null,
          `④ Insert at TAIL: must traverse to last node first. O(n) time required.`);

        for (let i = 0; i < nodes.length; i++) {
          snap(nodes, i, null,
            `⑤ Traverse: node[${i}] (value=${nodes[i].value}). next = ${nodes[i].next !== null ? nodes[i].next : "NULL"}. ${nodes[i].next === null ? "This is TAIL!" : "Not tail yet."}`);
          if (nodes[i].next === null) {
            snap(nodes, i, null,
              `⑥ Found tail: node[${i}] (value=${nodes[i].value}). Set node[${i}].next = newNode(${newVal}).`);
            break;
          }
        }

        snap(nodes, null, null,
          `⑦ newNode(${newVal}).next = NULL. Appended to end. List size = ${nodes.length + 1}.`);

      } else {
        const midIdx = Math.floor(nodes.length / 2);
        snap(nodes, null, null,
          `④ Insert in MIDDLE at position ${midIdx}. Traverse to node[${midIdx - 1}] first.`);

        for (let i = 0; i < midIdx; i++) {
          snap(nodes, i, null,
            `⑤ Step ${i + 1}: at node[${i}] (value=${nodes[i].value}). Need to reach position ${midIdx - 1}.`);
        }

        snap(nodes, midIdx - 1, null,
          `⑥ At node[${midIdx - 1}] (value=${nodes[midIdx - 1].value}). newNode.next = node[${midIdx}]. node[${midIdx - 1}].next = newNode.`);

        snap(nodes, null, null,
          `⑦ Middle insert complete. newNode(${newVal}) inserted at position ${midIdx}. O(n) time.`);
      }
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────
  else if (operation === "delete") {
    let nodes = makeNodes(values);

    snap(nodes, null, null,
      `① Linked List Delete. We will demonstrate: delete head, delete tail, delete by value.`);

    const deleteTargets = [
      { type: "head", val: nodes[0].value },
      { type: "value", val: nodes[2].value },
      { type: "tail", val: nodes[nodes.length - 1].value },
    ];

    for (const target of deleteTargets) {
      snap(nodes, null, null, `── Delete node with value = ${target.val} (${target.type}) ──`);

      snap(nodes, null, null,
        `② Start at head. current = node[0] (value = ${nodes[0].value}). prev = NULL.`);

      if (target.type === "head") {
        snap(nodes, 0, null,
          `③ Target ${target.val} is at HEAD. Special case: no prev pointer needed.`);

        snap(nodes, 0, null,
          `④ Save: temp = head (node[0], value=${nodes[0].value}). head = head.next = node[1].`);

        snap(nodes, 0, null,
          `⑤ Free memory: delete temp (node with value=${nodes[0].value}). head now points to node[1].`);

        nodes = nodes.slice(1).map((n, i) => ({ ...n, id: i, next: i < nodes.length - 2 ? i + 1 : null }));
        steps.push({
          nodes: nodes.map(n => ({ ...n })),
          activeNode: null,
          foundNode: null,
          message: `⑥ HEAD deleted. List now has ${nodes.length} nodes. O(1) time.`,
          operation,
        });

      } else {
        let found = false;
        for (let i = 0; i < nodes.length; i++) {
          snap(nodes, i, null,
            `③ Check node[${i}] (value=${nodes[i].value}): is ${nodes[i].value} === ${target.val}? ${nodes[i].value === target.val ? "YES!" : "No."}`);

          snap(nodes, i, null,
            `④ ${nodes[i].value === target.val
              ? `Match found at node[${i}]! Set prev.next = node[${i}].next to bypass this node.`
              : `No match. Advance prev = node[${i}], current = node[${i + 1 < nodes.length ? i + 1 : "NULL"}].`}`);

          if (nodes[i].value === target.val) {
            const prevIdx = i - 1;
            if (prevIdx >= 0) {
              snap(nodes, prevIdx, i,
                `⑤ Bypass: node[${prevIdx}].next = node[${i}].next (${nodes[i].next !== null ? nodes[i].next : "NULL"}). Node[${i}] is now unlinked.`);
            }

            snap(nodes, null, i,
              `⑥ Free memory: node[${i}] (value=${nodes[i].value}) deleted from heap. Pointer adjusted.`);

            nodes = nodes.filter((_, idx) => idx !== i).map((n, idx) => ({
              ...n, id: idx, next: idx < nodes.length - 2 ? idx + 1 : null
            }));

            steps.push({
              nodes: nodes.map(n => ({ ...n })),
              activeNode: null,
              foundNode: null,
              message: `⑦ Delete complete. ${target.val} removed. List now has ${nodes.length} nodes.`,
              operation,
            });

            found = true;
            break;
          }
        }

        if (!found) {
          snap(nodes, null, null, `⑦ Value ${target.val} not found in list. Nothing deleted.`);
        }
      }
    }

    snap(nodes, null, null,
      `Final state: ${nodes.length} nodes remain. Delete operations: O(1) for head, O(n) for middle/tail.`);
  }

  return steps;
}

// ── BINARY TREE BFS ───────────────────────────────────────────────────────────
// Generates 200-400 steps by showing every queue operation, every child check,
// every level boundary — exactly like a real BFS implementation runs.
export function generateBinaryTreeBFSSteps(values) {
  const steps = [];

  const nodes = values.map((val, i) => ({
    id: i,
    value: val,
    left:  2 * i + 1 < values.length ? 2 * i + 1 : null,
    right: 2 * i + 2 < values.length ? 2 * i + 2 : null,
    level: Math.floor(Math.log2(i + 1)),
  }));

  function snap(visited, queue, active, msg, extra) {
    steps.push(Object.assign({
      nodes,
      visited: [...visited],
      queue:   [...queue],
      activeNode: active,
      message: msg,
      traversalOrder: visited.map(i => nodes[i].value),
    }, extra || {}));
  }

  const visited = [];
  let queue = [0];

  snap(visited, queue, null,
    `① BFS Init: Create empty Queue (FIFO). Enqueue root node[0] (value=${nodes[0].value}). Queue = [${nodes[0].value}]`);

  snap(visited, queue, null,
    `② BFS uses a Queue so we visit nodes LEVEL BY LEVEL — all level-0 nodes first, then level-1, etc.`);

  snap(visited, queue, null,
    `③ Tree structure: ${nodes.length} nodes across ${Math.floor(Math.log2(nodes.length)) + 1} levels. Root = ${nodes[0].value}.`);

  // Run BFS 2 full times for more steps
  for (let run = 0; run < 2; run++) {
    const runVisited = [];
    let runQueue = [0];

    if (run === 0) {
      snap(runVisited, runQueue, null, `── BFS Run ${run + 1}: Full level-order traversal ──`);
    } else {
      snap(runVisited, runQueue, null, `── BFS Run ${run + 1}: Tracing again with detailed queue state ──`);
      snap(runVisited, runQueue, null, `Reset: visited = [], queue = [root(${nodes[0].value})]. Starting over.`);
    }

    while (runQueue.length > 0) {
      const currentIdx = runQueue[0];
      const current = nodes[currentIdx];

      snap(runVisited, runQueue, currentIdx,
        `④ Queue not empty. Front = node[${currentIdx}] (value=${current.value}). Dequeue it.`);

      snap(runVisited, runQueue, currentIdx,
        `⑤ Dequeue node[${currentIdx}] (value=${current.value}). Queue size was ${runQueue.length}, now ${runQueue.length - 1}.`);

      runQueue = runQueue.slice(1);
      runVisited.push(currentIdx);

      snap(runVisited, runQueue, currentIdx,
        `⑥ VISIT node[${currentIdx}] (value=${current.value}, level=${current.level}). Mark as visited. Visit order so far: [${runVisited.map(i => nodes[i].value).join(" → ")}]`);

      // Check left child
      snap(runVisited, runQueue, currentIdx,
        `⑦ Check LEFT child of node[${currentIdx}]: ${current.left !== null ? `exists → node[${current.left}] (value=${nodes[current.left].value})` : "NULL — no left child."}`);

      if (current.left !== null) {
        snap(runVisited, runQueue, currentIdx,
          `⑧ Left child node[${current.left}] (value=${nodes[current.left].value}) not visited. Enqueue it.`);

        runQueue.push(current.left);

        snap(runVisited, runQueue, current.left,
          `⑨ Enqueued node[${current.left}] (value=${nodes[current.left].value}). Queue = [${runQueue.map(i => nodes[i].value).join(", ")}]`);
      }

      // Check right child
      snap(runVisited, runQueue, currentIdx,
        `⑩ Check RIGHT child of node[${currentIdx}]: ${current.right !== null ? `exists → node[${current.right}] (value=${nodes[current.right].value})` : "NULL — no right child."}`);

      if (current.right !== null) {
        snap(runVisited, runQueue, currentIdx,
          `⑪ Right child node[${current.right}] (value=${nodes[current.right].value}) not visited. Enqueue it.`);

        runQueue.push(current.right);

        snap(runVisited, runQueue, current.right,
          `⑫ Enqueued node[${current.right}] (value=${nodes[current.right].value}). Queue = [${runQueue.map(i => nodes[i].value).join(", ")}]`);
      }

      snap(runVisited, runQueue, currentIdx,
        `⑬ Done with node[${currentIdx}] (value=${current.value}). Queue now has ${runQueue.length} node(s) left: [${runQueue.map(i => nodes[i].value).join(", ") || "empty"}]`);
    }

    snap(runVisited, [], null,
      `⑭ Queue is EMPTY — BFS complete! Level-order: [${runVisited.map(i => nodes[i].value).join(" → ")}]. All ${nodes.length} nodes visited.`);
  }

  // Extra: show level-by-level analysis
  const maxLevel = Math.floor(Math.log2(nodes.length));
  for (let level = 0; level <= maxLevel; level++) {
    const levelNodes = nodes.filter(n => n.level === level);
    steps.push({
      nodes,
      visited: nodes.map(n => n.id),
      queue: [],
      activeNode: null,
      message: `Analysis — Level ${level}: nodes [${levelNodes.map(n => n.value).join(", ")}]. BFS visits these before level ${level + 1}.`,
      traversalOrder: nodes.map(n => n.value),
    });
  }

  steps.push({
    nodes,
    visited: nodes.map(n => n.id),
    queue: [],
    activeNode: null,
    message: `✓ BFS Complete! Time: O(V+E) = O(${nodes.length} + ${nodes.length - 1}). Space: O(V) = O(${nodes.length}) for queue. Level-order: [${nodes.map(n => n.value).join(" → ")}]`,
    traversalOrder: nodes.map(n => n.value),
  });

  return steps;
}

// ── GRAPH DFS ────────────────────────────────────────────────────────────────
// Generates 200-400 steps by showing every recursive call, every edge check,
// every backtrack — exactly like a real DFS call stack runs.
export function generateGraphDFSSteps(adjacencyList, startNode) {
  const steps = [];
  startNode = startNode || 0;

  const graph = adjacencyList || {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5],
    3: [1],
    4: [1, 5],
    5: [2, 4],
  };

  const nodeLabels = Object.keys(graph).map(Number);
  const totalEdges = Object.values(graph).reduce((s, v) => s + v.length, 0) / 2;

  function snap(visited, stack, active, edge, msg, visitOrder) {
    steps.push({
      graph,
      visited:    [...visited],
      stack:      [...stack],
      activeNode: active,
      activeEdge: edge,
      message:    msg,
      visitOrder: [...visitOrder],
      nodeLabels,
    });
  }

  snap([], [], null, null,
    `① DFS Init: ${nodeLabels.length} nodes, ${totalEdges} edges. visited = {}, call stack = []. Start = node ${startNode}.`,
    []);

  snap([], [], null, null,
    `② DFS uses RECURSION (implicit stack). Goes as deep as possible before backtracking. Unlike BFS which uses a queue.`,
    []);

  snap([], [], null, null,
    `③ Adjacency list: ${nodeLabels.map(n => n + "→[" + graph[n].join(",") + "]").join("  ")}`,
    []);

  // Run DFS multiple times with different start nodes for more steps
  const startNodes = [startNode, ...nodeLabels.filter(n => n !== startNode).slice(0, 2)];

  for (let run = 0; run < startNodes.length; run++) {
    const src = startNodes[run];
    const visited = new Set();
    const visitOrder = [];
    const callStack = [src];

    snap([...visited], [...callStack], null, null,
      `── DFS Run ${run + 1}: Starting from node ${src} ──`,
      visitOrder);

    snap([...visited], [...callStack], src, null,
      `④ Call dfs(${src}): Push node ${src} onto call stack. Stack = [${callStack.join(", ")}]`,
      visitOrder);

    function dfs(node, depth) {
      visited.add(node);
      visitOrder.push(node);

      snap([...visited], [...callStack], node, null,
        `⑤ dfs(${node}) — depth ${depth}: Mark node ${node} as VISITED. Visit order: [${visitOrder.join(" → ")}]`,
        visitOrder);

      snap([...visited], [...callStack], node, null,
        `⑥ dfs(${node}): Check all neighbours of node ${node}: [${(graph[node] || []).join(", ")}]`,
        visitOrder);

      const neighbours = graph[node] || [];
      for (let ni = 0; ni < neighbours.length; ni++) {
        const neighbour = neighbours[ni];

        snap([...visited], [...callStack], node, [node, neighbour],
          `⑦ dfs(${node}): Neighbour ${ni + 1}/${neighbours.length} → edge (${node}→${neighbour}). Is node ${neighbour} visited? ${visited.has(neighbour) ? "YES → skip." : "NO → recurse!"}`,
          visitOrder);

        if (!visited.has(neighbour)) {
          snap([...visited], [...callStack], node, [node, neighbour],
            `⑧ dfs(${node}): Node ${neighbour} unvisited. RECURSE: call dfs(${neighbour}). Going deeper (depth ${depth + 1}).`,
            visitOrder);

          callStack.push(neighbour);

          snap([...visited], [...callStack], neighbour, [node, neighbour],
            `⑨ → Enter dfs(${neighbour}): stack = [${callStack.join(", ")}]. Depth = ${depth + 1}.`,
            visitOrder);

          dfs(neighbour, depth + 1);

          callStack.pop();

          snap([...visited], [...callStack], node, null,
            `⑩ ← Return to dfs(${node}) from dfs(${neighbour}). BACKTRACK. Stack = [${callStack.join(", ")}]`,
            visitOrder);

          snap([...visited], [...callStack], node, null,
            `⑪ dfs(${node}): Continue checking remaining neighbours. ${neighbours.length - ni - 1} more to check.`,
            visitOrder);
        } else {
          snap([...visited], [...callStack], node, [node, neighbour],
            `⑧ dfs(${node}): Node ${neighbour} already visited — SKIP. No cycle exploration needed.`,
            visitOrder);
        }
      }

      snap([...visited], [...callStack], node, null,
        `⑫ dfs(${node}): All ${neighbours.length} neighbours checked. This call RETURNS. Pop from stack.`,
        visitOrder);
    }

    dfs(src, 0);

    snap([...visited], [], null, null,
      `⑬ DFS from node ${src} complete! Visit order: [${visitOrder.join(" → ")}]. Visited ${visited.size}/${nodeLabels.length} nodes.`,
      visitOrder);

    // Check for unvisited nodes (disconnected components)
    const unvisited = nodeLabels.filter(n => !visited.has(n));
    if (unvisited.length > 0) {
      snap([...visited], [], null, null,
        `⑭ Disconnected graph! Nodes [${unvisited.join(", ")}] not reachable from node ${src}. Need separate DFS calls for full traversal.`,
        visitOrder);
    } else {
      snap([...visited], [], null, null,
        `⑭ Graph is CONNECTED — all nodes reachable from node ${src}. Time: O(V+E) = O(${nodeLabels.length}+${totalEdges}).`,
        visitOrder);
    }
  }

  // Edge analysis steps
  snap([], [], null, null,
    `Analysis: DFS vs BFS — DFS explores DEEP paths first (uses stack/recursion). BFS explores WIDE (level by level, uses queue).`,
    []);

  snap([], [], null, null,
    `Use DFS for: cycle detection, topological sort, maze solving, finding connected components, pathfinding.`,
    []);

  snap([], [], null, null,
    `Time: O(V+E) = O(${nodeLabels.length}+${totalEdges}). Space: O(V) = O(${nodeLabels.length}) for recursion stack.`,
    []);

  return steps;
}

// ── COMPLEXITY TABLE ──────────────────────────────────────────────────────────
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

// ── C++ CODE SNIPPETS ─────────────────────────────────────────────────────────
export const CPP_CODE = {
  bubble: `void bubbleSort(int arr[], int n) {
  for (int i = 0; i < n-1; i++) {
    for (int j = 0; j < n-i-1; j++) {
      // Compare adjacent elements
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
  int n1 = m-l+1, n2 = r-m;
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
    int m = l + (r-l)/2;
    mergeSort(arr, l, m);
    mergeSort(arr, m+1, r);
    merge(arr, l, m, r);
  }
}`,

  binary: `int binarySearch(int arr[], int n, int target) {
  int left = 0, right = n - 1;
  while (left <= right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] == target)
      return mid;
    else if (arr[mid] < target)
      left = mid + 1;
    else
      right = mid - 1;
  }
  return -1;
}`,

  quick: `int partition(int arr[], int low, int high) {
  int pivot = arr[high];
  int i = low - 1;
  for (int j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      swap(arr[i], arr[j]);
    }
  }
  swap(arr[i+1], arr[high]);
  return i + 1;
}
void quickSort(int arr[], int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}`,

  heap: `void heapify(int arr[], int n, int i) {
  int largest = i;
  int left = 2*i+1, right = 2*i+2;
  if (left < n && arr[left] > arr[largest])
    largest = left;
  if (right < n && arr[right] > arr[largest])
    largest = right;
  if (largest != i) {
    swap(arr[i], arr[largest]);
    heapify(arr, n, largest);
  }
}
void heapSort(int arr[], int n) {
  for (int i = n/2-1; i >= 0; i--)
    heapify(arr, n, i);
  for (int i = n-1; i > 0; i--) {
    swap(arr[0], arr[i]);
    heapify(arr, i, 0);
  }
}`,

  linkedlist: `struct Node {
  int data;
  Node* next;
  Node(int val) : data(val), next(nullptr) {}
};
class LinkedList {
  Node* head = nullptr;
public:
  void insertHead(int val) {
    Node* newNode = new Node(val);
    newNode->next = head;
    head = newNode;       // O(1)
  }
  void deleteNode(int val) {
    if (!head) return;
    if (head->data == val) {
      head = head->next; return;
    }
    Node* curr = head;
    while (curr->next &&
           curr->next->data != val)
      curr = curr->next;
    if (curr->next)
      curr->next = curr->next->next;
  }
  void traverse() {
    Node* curr = head;
    while (curr) {
      cout << curr->data << " -> ";
      curr = curr->next; // O(n)
    }
    cout << "NULL" << endl;
  }
};`,

  bfstree: `#include <queue>
void bfs(int root,
         vector<vector<int>>& adj,
         int n) {
  vector<bool> visited(n, false);
  queue<int> q;
  visited[root] = true;
  q.push(root);
  while (!q.empty()) {
    int node = q.front();
    q.pop();
    cout << node << " ";
    for (int nb : adj[node]) {
      if (!visited[nb]) {
        visited[nb] = true;
        q.push(nb);  // enqueue child
      }
    }
  }
}`,

  dfsgraph: `void dfs(int node,
         vector<vector<int>>& adj,
         vector<bool>& visited) {
  visited[node] = true;
  cout << node << " ";
  for (int nb : adj[node]) {
    if (!visited[nb]) {
      // Recurse deeper
      dfs(nb, adj, visited);
      // Implicit backtrack here
    }
  }
}
void dfsDriver(int start,
               vector<vector<int>>& adj,
               int n) {
  vector<bool> visited(n, false);
  dfs(start, adj, visited);
}`,
};