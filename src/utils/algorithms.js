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
      // Step: comparing j and j+1 (highlight yellow)
      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]]; // swap
        // Step: just swapped (highlight red)
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        });
      }
    }
  }

  // Final step: all sorted (highlight green)
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
  const a = [...arr].sort((x, y) => x - y); // must be sorted
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

  // Not found
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

// ── COMPLEXITY TABLE ─────────────────────────────────────────────────────────
export const COMPLEXITY = {
  bubble: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  selection: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  insertion: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  merge: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  binary: { best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)" },
};

// ── C++ CODE SNIPPETS ────────────────────────────────────────────────────────
export const CPP_CODE = {
  bubble: `void bubbleSort(int arr[], int n) {
  for (int i = 0; i < n-1; i++) {
    for (int j = 0; j < n-i-1; j++) {
      // Compare adjacent elements
      if (arr[j] > arr[j+1]) {
        // Swap them
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
    // Swap minimum to correct position
    swap(arr[minIdx], arr[i]);
  }
}`,

  insertion: `void insertionSort(int arr[], int n) {
  for (int i = 1; i < n; i++) {
    int key = arr[i];
    int j = i - 1;
    // Shift larger elements right
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
      return mid;      // Found!
    else if (arr[mid] < target)
      left = mid + 1;  // Search right
    else
      right = mid - 1; // Search left
  }
  return -1; // Not found
}`,
};