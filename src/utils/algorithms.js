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
// HOW IT WORKS:
// Pick a pivot (last element). Partition: move all elements smaller than pivot
// to the left, larger to the right. Pivot is now in its final sorted position.
// Recursively apply to left and right sub-arrays.
// Average O(n log n), Worst O(n²) if already sorted.
export function generateQuickSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const sortedSet = new Set();

  function partition(arr, low, high) {
    const pivot = arr[high]; // choose last element as pivot
    let i = low - 1;

    for (let j = low; j < high; j++) {
      // Show: comparing current element with pivot
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
          // Show: swapping elements into correct partition
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

    // Place pivot in its correct sorted position
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
      // Single element is trivially sorted
      sortedSet.add(low);
    }
  }

  quickSort(a, 0, a.length - 1);

  // Final step: all sorted
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
// HOW IT WORKS:
// Phase 1 — Build a Max Heap: rearrange array so parent > children always.
// Phase 2 — Extract: swap root (max) with last element, reduce heap size,
// re-heapify. Repeat until heap is empty. Result: sorted array.
// Always O(n log n) — no bad cases like Quick Sort.
export function generateHeapSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sortedSet = new Set();

  function heapify(arr, size, rootIdx) {
    let largest = rootIdx;
    const left  = 2 * rootIdx + 1;
    const right = 2 * rootIdx + 2;

    // Compare root with left child
    if (left < size) {
      steps.push({
        array: [...arr],
        comparing: [largest, left],
        swapping: [],
        sorted: [...sortedSet],
      });
      if (arr[left] > arr[largest]) largest = left;
    }

    // Compare current largest with right child
    if (right < size) {
      steps.push({
        array: [...arr],
        comparing: [largest, right],
        swapping: [],
        sorted: [...sortedSet],
      });
      if (arr[right] > arr[largest]) largest = right;
    }

    // If largest is not root, swap and continue heapifying
    if (largest !== rootIdx) {
      [arr[rootIdx], arr[largest]] = [arr[largest], arr[rootIdx]];
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [rootIdx, largest],
        sorted: [...sortedSet],
      });
      heapify(arr, size, largest);
    }
  }

  // Phase 1: Build max heap (start from last non-leaf node)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(a, n, i);
  }

  // Phase 2: Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root (max) to end — it's now in sorted position
    [a[0], a[i]] = [a[i], a[0]];
    sortedSet.add(i);
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [0, i],
      sorted: [...sortedSet],
    });
    // Heapify the reduced heap
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

// ── LINKED LIST TRAVERSAL ────────────────────────────────────────────────────
// HOW IT WORKS:
// A linked list is a chain of nodes. Each node holds a value + pointer to next.
// Unlike arrays, nodes are NOT contiguous in memory — you must follow pointers.
// We simulate: Insert at head, Insert at tail, Delete a node, Search a value.
// Each step records which node is "active" (being visited) and which is "found".
export function generateLinkedListSteps(values, operation = "traverse") {
  const steps = [];

  // Build initial linked list as array of node objects
  const nodes = values.map((val, i) => ({
    value: val,
    id: i,
    next: i < values.length - 1 ? i + 1 : null,
  }));

  if (operation === "traverse") {
    // Visit each node one by one following next pointers
    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      activeNode: null,
      foundNode: null,
      message: "Start at Head node",
      operation: "traverse",
    });

    for (let i = 0; i < nodes.length; i++) {
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        activeNode: i,
        foundNode: null,
        message: `Visiting node [${nodes[i].value}] → ${nodes[i].next !== null ? "next exists" : "next is NULL (tail)"}`,
        operation: "traverse",
      });
    }

    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      activeNode: null,
      foundNode: null,
      message: "Traversal complete! Visited all nodes.",
      operation: "traverse",
    });
  }

  else if (operation === "search") {
    const target = values[Math.floor(values.length / 2)]; // search for middle value
    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      activeNode: null,
      foundNode: null,
      message: `Search for value: ${target}. Start at Head.`,
      operation: "search",
      target,
    });

    let found = false;
    for (let i = 0; i < nodes.length; i++) {
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        activeNode: i,
        foundNode: null,
        message: `Check node [${nodes[i].value}] — is it ${target}? ${nodes[i].value === target ? "YES! ✓" : "No, move next →"}`,
        operation: "search",
        target,
      });

      if (nodes[i].value === target) {
        steps.push({
          nodes: nodes.map(n => ({ ...n })),
          activeNode: null,
          foundNode: i,
          message: `Found ${target} at position ${i}! Search complete.`,
          operation: "search",
          target,
        });
        found = true;
        break;
      }
    }

    if (!found) {
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        activeNode: null,
        foundNode: null,
        message: `Value ${target} not found in list.`,
        operation: "search",
        target,
      });
    }
  }

  else if (operation === "insert") {
    // Insert a new node at the head
    const newValue = 99;
    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      activeNode: null,
      foundNode: null,
      message: `Insert ${newValue} at Head. Create new node.`,
      operation: "insert",
    });

    const newNode = { value: newValue, id: -1, next: 0 };
    steps.push({
      nodes: [newNode, ...nodes.map(n => ({ ...n }))],
      activeNode: 0,
      foundNode: null,
      message: `New node [${newValue}] created. Point its next → old Head [${nodes[0].value}].`,
      operation: "insert",
    });

    // Re-index
    const updated = [newNode, ...nodes].map((n, i) => ({
      ...n,
      id: i,
      next: i < nodes.length ? i + 1 : null,
    }));

    steps.push({
      nodes: updated,
      activeNode: 0,
      foundNode: null,
      message: `Update Head pointer → new node [${newValue}]. Insert complete!`,
      operation: "insert",
    });
  }

  else if (operation === "delete") {
    // Delete the middle node
    const deleteIdx = Math.floor(nodes.length / 2);
    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      activeNode: null,
      foundNode: null,
      message: `Delete node [${nodes[deleteIdx].value}]. Traverse to find it.`,
      operation: "delete",
    });

    for (let i = 0; i <= deleteIdx; i++) {
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        activeNode: i,
        foundNode: i === deleteIdx ? i : null,
        message: i === deleteIdx
          ? `Found target node [${nodes[i].value}]! Now unlink it.`
          : `Visiting [${nodes[i].value}] — not target, move next →`,
        operation: "delete",
      });
    }

    // Show pointer bypass: prev.next = target.next
    const afterDelete = nodes
      .filter((_, i) => i !== deleteIdx)
      .map((n, i, arr) => ({
        ...n,
        id: i,
        next: i < arr.length - 1 ? i + 1 : null,
      }));

    steps.push({
      nodes: afterDelete,
      activeNode: null,
      foundNode: null,
      message: `Node [${nodes[deleteIdx].value}] removed. Previous node now points to next node. Done!`,
      operation: "delete",
    });
  }

  return steps;
}

// ── BINARY TREE BFS (Level Order Traversal) ──────────────────────────────────
// HOW IT WORKS:
// BFS uses a Queue (FIFO). Start with root in queue.
// Each iteration: dequeue a node, visit it, enqueue its children.
// This visits nodes level by level — left to right, top to bottom.
// Great for finding shortest path, level-by-level processing.
export function generateBinaryTreeBFSSteps(values) {
  const steps = [];

  // Build tree as array (index i → left child: 2i+1, right child: 2i+2)
  const nodes = values.map((val, i) => ({
    id: i,
    value: val,
    left:  2 * i + 1 < values.length ? 2 * i + 1 : null,
    right: 2 * i + 2 < values.length ? 2 * i + 2 : null,
    level: Math.floor(Math.log2(i + 1)),
  }));

  const visited = [];
  const queue   = [0]; // start BFS from root (index 0)

  steps.push({
    nodes,
    visited: [],
    queue:   [0],
    activeNode: null,
    message: "BFS Start: Add root to Queue. Queue = [" + nodes[0].value + "]",
    traversalOrder: [],
  });

  while (queue.length > 0) {
    const currentIdx = queue.shift(); // dequeue front
    visited.push(currentIdx);
    const current = nodes[currentIdx];

    steps.push({
      nodes,
      visited: [...visited],
      queue:   [...queue],
      activeNode: currentIdx,
      message: `Dequeue [${current.value}]. Visit it. Level ${current.level}.`,
      traversalOrder: visited.map(i => nodes[i].value),
    });

    // Enqueue left child
    if (current.left !== null) {
      queue.push(current.left);
      steps.push({
        nodes,
        visited: [...visited],
        queue:   [...queue],
        activeNode: currentIdx,
        message: `Enqueue left child [${nodes[current.left].value}]. Queue = [${queue.map(i => nodes[i].value).join(", ")}]`,
        traversalOrder: visited.map(i => nodes[i].value),
      });
    }

    // Enqueue right child
    if (current.right !== null) {
      queue.push(current.right);
      steps.push({
        nodes,
        visited: [...visited],
        queue:   [...queue],
        activeNode: currentIdx,
        message: `Enqueue right child [${nodes[current.right].value}]. Queue = [${queue.map(i => nodes[i].value).join(", ")}]`,
        traversalOrder: visited.map(i => nodes[i].value),
      });
    }
  }

  steps.push({
    nodes,
    visited: [...visited],
    queue:   [],
    activeNode: null,
    message: `BFS Complete! Level-order: [${visited.map(i => nodes[i].value).join(" → ")}]`,
    traversalOrder: visited.map(i => nodes[i].value),
  });

  return steps;
}

// ── GRAPH DFS (Depth First Search) ───────────────────────────────────────────
// HOW IT WORKS:
// DFS uses a Stack (LIFO) — or recursion (which uses call stack).
// Start at source node. Visit it, mark visited.
// For each unvisited neighbour: recurse/push to stack and visit.
// Goes as DEEP as possible before backtracking.
// Used for: cycle detection, topological sort, maze solving, connected components.
export function generateGraphDFSSteps(adjacencyList, startNode = 0) {
  const steps = [];
  const visited = new Set();
  const visitOrder = [];
  const stack = [startNode];

  // Default graph if none provided: 6 nodes, bidirectional edges
  const graph = adjacencyList || {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5],
    3: [1],
    4: [1, 5],
    5: [2, 4],
  };

  const nodeLabels = Object.keys(graph).map(Number);

  steps.push({
    graph,
    visited: [],
    stack:   [startNode],
    activeNode: null,
    activeEdge: null,
    message: `DFS Start from node ${startNode}. Push to Stack. Stack = [${startNode}]`,
    visitOrder: [],
    nodeLabels,
  });

  function dfs(node) {
    visited.add(node);
    visitOrder.push(node);

    steps.push({
      graph,
      visited:    [...visited],
      stack:      [...stack],
      activeNode: node,
      activeEdge: null,
      message:    `Visit node ${node}. Mark as visited. Visit order: [${visitOrder.join(" → ")}]`,
      visitOrder: [...visitOrder],
      nodeLabels,
    });

    const neighbours = graph[node] || [];
    for (const neighbour of neighbours) {
      steps.push({
        graph,
        visited:    [...visited],
        stack:      [...stack],
        activeNode: node,
        activeEdge: [node, neighbour],
        message:    visited.has(neighbour)
          ? `Edge ${node}→${neighbour}: Already visited. Skip.`
          : `Edge ${node}→${neighbour}: Not visited. Go deeper!`,
        visitOrder: [...visitOrder],
        nodeLabels,
      });

      if (!visited.has(neighbour)) {
        stack.push(neighbour);
        dfs(neighbour);
        stack.pop();

        steps.push({
          graph,
          visited:    [...visited],
          stack:      [...stack],
          activeNode: node,
          activeEdge: null,
          message:    `Backtrack to node ${node}. Continue checking remaining neighbours.`,
          visitOrder: [...visitOrder],
          nodeLabels,
        });
      }
    }
  }

  dfs(startNode);

  steps.push({
    graph,
    visited:    [...visited],
    stack:      [],
    activeNode: null,
    activeEdge: null,
    message:    `DFS Complete! Visit order: [${visitOrder.join(" → ")}]. All reachable nodes visited.`,
    visitOrder: [...visitOrder],
    nodeLabels,
  });

  return steps;
}

// ── COMPLEXITY TABLE ─────────────────────────────────────────────────────────
export const COMPLEXITY = {
  bubble:     { best: "O(n)",       avg: "O(n²)",      worst: "O(n²)",      space: "O(1)"    },
  selection:  { best: "O(n²)",      avg: "O(n²)",      worst: "O(n²)",      space: "O(1)"    },
  insertion:  { best: "O(n)",       avg: "O(n²)",      worst: "O(n²)",      space: "O(1)"    },
  merge:      { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)"    },
  binary:     { best: "O(1)",       avg: "O(log n)",   worst: "O(log n)",   space: "O(1)"    },
  quick:      { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)",      space: "O(log n)" },
  heap:       { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)"    },
  linkedlist: { best: "O(1)",       avg: "O(n)",       worst: "O(n)",       space: "O(n)"    },
  bfstree:    { best: "O(V+E)",     avg: "O(V+E)",     worst: "O(V+E)",     space: "O(V)"    },
  dfsgraph:   { best: "O(V+E)",     avg: "O(V+E)",     worst: "O(V+E)",     space: "O(V)"    },
};

// ── C++ CODE SNIPPETS ────────────────────────────────────────────────────────
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
  int pivot = arr[high]; // last element as pivot
  int i = low - 1;

  for (int j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      swap(arr[i], arr[j]); // move smaller to left
    }
  }
  swap(arr[i+1], arr[high]); // place pivot correctly
  return i + 1;
}

void quickSort(int arr[], int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);  // left of pivot
    quickSort(arr, pi + 1, high); // right of pivot
  }
}`,

  heap: `void heapify(int arr[], int n, int i) {
  int largest = i;
  int left  = 2*i + 1;
  int right = 2*i + 2;

  if (left < n && arr[left] > arr[largest])
    largest = left;
  if (right < n && arr[right] > arr[largest])
    largest = right;

  if (largest != i) {
    swap(arr[i], arr[largest]);
    heapify(arr, n, largest); // fix affected subtree
  }
}

void heapSort(int arr[], int n) {
  // Build max heap
  for (int i = n/2 - 1; i >= 0; i--)
    heapify(arr, n, i);

  // Extract max one by one
  for (int i = n-1; i > 0; i--) {
    swap(arr[0], arr[i]); // move root to end
    heapify(arr, i, 0);   // heapify reduced heap
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
  // Insert at head — O(1)
  void insertHead(int val) {
    Node* newNode = new Node(val);
    newNode->next = head;
    head = newNode;
  }

  // Delete a node by value — O(n)
  void deleteNode(int val) {
    if (!head) return;
    if (head->data == val) {
      head = head->next; return;
    }
    Node* curr = head;
    while (curr->next && curr->next->data != val)
      curr = curr->next;
    if (curr->next)
      curr->next = curr->next->next;
  }

  // Traverse — O(n)
  void traverse() {
    Node* curr = head;
    while (curr) {
      cout << curr->data << " → ";
      curr = curr->next;
    }
    cout << "NULL" << endl;
  }
};`,

  bfstree: `#include <queue>
void bfs(int root, vector<vector<int>>& adj, int n) {
  vector<bool> visited(n, false);
  queue<int> q;

  visited[root] = true;
  q.push(root);

  while (!q.empty()) {
    int node = q.front();
    q.pop();
    cout << node << " "; // visit node

    // Enqueue all unvisited neighbours
    for (int neighbour : adj[node]) {
      if (!visited[neighbour]) {
        visited[neighbour] = true;
        q.push(neighbour);
      }
    }
  }
}`,

  dfsgraph: `void dfs(int node, vector<vector<int>>& adj,
         vector<bool>& visited) {
  visited[node] = true;
  cout << node << " "; // visit node

  // Recurse for all unvisited neighbours
  for (int neighbour : adj[node]) {
    if (!visited[neighbour]) {
      dfs(neighbour, adj, visited); // go deep
    }
  }
  // Implicit backtrack when recursion returns
}

void dfsDriver(int start, vector<vector<int>>& adj, int n) {
  vector<bool> visited(n, false);
  dfs(start, adj, visited);
}`,
};