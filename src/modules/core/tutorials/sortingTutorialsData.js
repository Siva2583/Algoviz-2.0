export const sortingData = {
    quick: {
        title: "Quick Sort",
        overview: "Quick Sort is a highly efficient, in-place sorting algorithm. It uses a 'Divide and Conquer' strategy by picking a 'Pivot' element and partitioning the array so that everything smaller than the pivot goes to its left, and everything larger goes to its right.",
        whyExists: "Merge sort is fast but requires O(N) extra memory. Quick Sort was invented to achieve O(N log N) speed without needing a massive secondary array, making it the default sorting algorithm in many system libraries (like C++'s std::sort).",
        mechanics: [
            "Select a pivot element (often the last element).",
            "Initialize two pointers to partition the array around the pivot.",
            "Iterate through the array. If an element is smaller than the pivot, swap it into the 'left' partition.",
            "Move the pivot into its correct sorted position between the two partitions.",
            "Recursively apply the same logic to the left and right sub-arrays."
        ],
        dryRun: [
            { step: "Array: [10, 80, 30, 90, 40, 50, 70]. Pivot = 70.", state: "Sub-array: [0...6]" },
            { step: "Partitioning: 10, 30, 40, 50 are < 70.", state: "Swapping elements to left." },
            { step: "Place Pivot: Swap 70 with 80.", state: "Array: [10, 30, 40, 50, 70, 90, 80]" },
            { step: "Recurse Left: [10, 30, 40, 50] | Recurse Right: [90, 80]", state: "Pivot 70 is now sorted!" }
        ],
        pseudo: `function quickSort(arr, low, high):\n  if low < high:\n    pivotIndex = partition(arr, low, high)\n    \n    // Recursively sort elements before and after partition\n    quickSort(arr, low, pivotIndex - 1)\n    quickSort(arr, pivotIndex + 1, high)\n\nfunction partition(arr, low, high):\n  pivot = arr[high]\n  i = low - 1\n  for j from low to high - 1:\n    if arr[j] <= pivot:\n      i++\n      swap(arr, i, j)\n  swap(arr, i + 1, high)\n  return i + 1`,
        memory: "Quick Sort is an 'In-Place' algorithm. It does not create new arrays. However, it still uses O(log N) memory under the hood for the recursive Call Stack. In the absolute worst-case (already sorted array), the stack can degrade to O(N).",
        time: "O(N log N) Avg | O(N²) Worst",
        space: "O(log N)",
        pattern: [
            "You need an efficient sort with strict memory limits.",
            "Finding the 'Kth Largest/Smallest Element' in O(N) time (QuickSelect algorithm).",
            "When instability (changing relative order of equal elements) is acceptable."
        ],
        apps: [
            "V8 Engine (JavaScript's Array.prototype.sort for numbers)", 
            "Database query optimizations", 
            "Embedded systems with low RAM"
        ],
        mistakes: [
            "Always picking the last element as the pivot when the array is already sorted. This causes the O(N²) worst-case. (Fix: Pick a random pivot or 'Median of Three').",
            "Failing to handle duplicate elements correctly during the partition phase, causing infinite loops."
        ]
    },
    merge: {
        title: "Merge Sort",
        overview: "Merge Sort is a stable, Divide and Conquer algorithm. It continuously splits an array in half until it reaches single-element arrays, and then continuously 'merges' them back together in perfect sorted order.",
        whyExists: "Quick Sort's O(N²) worst-case can be dangerous in critical systems. Merge Sort was created to absolutely guarantee O(N log N) performance regardless of the input data, and to sort data sequentially (like reading from magnetic tapes).",
        mechanics: [
            "Find the middle index of the array.",
            "Recursively split the array into a left half and a right half until sizes are 1.",
            "Create temporary buffer arrays to hold the left and right halves.",
            "Use two pointers to compare the front of both halves.",
            "Write the smaller element back into the main array and advance the pointer.",
            "Copy any remaining elements if one half empties first."
        ],
        dryRun: [
            { step: "Initial: [38, 27, 43, 3, 9, 82, 10]", state: "Splitting..." },
            { step: "Bottom out: [38] [27] [43] [3]", state: "Sizes = 1" },
            { step: "Merge Phase 1: [27, 38] and [3, 43]", state: "Comparing and writing" },
            { step: "Merge Phase 2: [3, 27, 38, 43]", state: "Sub-arrays sorted!" }
        ],
        pseudo: `function mergeSort(arr, l, r):\n  if l >= r: return\n  \n  m = Math.floor((l + r) / 2)\n  mergeSort(arr, l, m)\n  mergeSort(arr, m + 1, r)\n  merge(arr, l, m, r)\n\nfunction merge(arr, l, m, r):\n  // Create temp arrays L[] and R[]\n  // Copy data to temp arrays\n  \n  i = 0, j = 0, k = l\n  while i < L.length and j < R.length:\n    if L[i] <= R[j]:\n      arr[k++] = L[i++]\n    else:\n      arr[k++] = R[j++]\n      \n  // Copy remaining elements of L[] and R[]`,
        memory: "Merge Sort requires O(N) extra space. Because it cannot easily merge elements in-place without overwriting data, it must allocate temporary buffer arrays (L[] and R[]) during the conquer phase to safely hold the numbers being compared.",
        time: "O(N log N)",
        space: "O(N)",
        pattern: [
            "Sorting a Linked List (Merge Sort is O(1) space for Linked Lists!).",
            "Counting 'Inversions' in an array (Classic LeetCode Hard problem pattern).",
            "When stability is required (equal elements must keep original order)."
        ],
        apps: [
            "External sorting (sorting massive files that don't fit in RAM)", 
            "E-commerce sorting where secondary properties must remain grouped", 
            "Python's default sort (Timsort is derived from Merge Sort)"
        ],
        mistakes: [
            "Allocating the temporary `L[]` and `R[]` arrays inside the recursive function call. In high-performance systems, this causes massive Garbage Collection lag. (Fix: Pass a single global buffer array).",
            "Mishandling the mid-point math `(l + r) / 2`, causing integer overflow in strongly typed languages."
        ]
    },
    heap: {
        title: "Heap Sort",
        overview: "Heap Sort utilizes a Complete Binary Tree (specifically a Max-Heap) to sort an array. It builds the heap directly inside the array structure, repeatedly extracts the maximum element (the root), and shrinks the heap boundary.",
        whyExists: "It combines the best of both worlds: it guarantees O(N log N) worst-case time like Merge Sort, but does it completely in-place (O(1) memory) like Quick Sort.",
        mechanics: [
            "Treat the flat array as a Complete Binary Tree (Left child = 2i+1, Right child = 2i+2).",
            "Run a 'Build-Max-Heap' phase from the bottom up to ensure every parent is larger than its children.",
            "Swap the root (the maximum element) with the last element in the heap.",
            "Reduce the active heap size by 1 (locking the max element in place).",
            "Run 'Heapify' on the new root to sink it down and restore the Max-Heap property.",
            "Repeat until the heap size is 1."
        ],
        dryRun: [
            { step: "Array: [4, 10, 3, 5, 1]", state: "Build Max-Heap..." },
            { step: "Heapified: [10, 5, 3, 4, 1]", state: "Root 10 is the max." },
            { step: "Swap 10 and 1. Reduce size.", state: "Array: [1, 5, 3, 4 | 10]" },
            { step: "Heapify Root (1).", state: "Array: [5, 4, 3, 1 | 10]" }
        ],
        pseudo: `function heapSort(arr):\n  n = arr.length\n  \n  // Build Max-Heap\n  for i = Math.floor(n / 2) - 1 down to 0:\n    heapify(arr, n, i)\n    \n  // Extract elements one by one\n  for i = n - 1 down to 1:\n    swap(arr[0], arr[i])\n    heapify(arr, i, 0) // Sink down the new root\n\nfunction heapify(arr, size, rootIndex):\n  largest = rootIndex\n  left = 2 * rootIndex + 1\n  right = 2 * rootIndex + 2\n  \n  if left < size and arr[left] > arr[largest]: largest = left\n  if right < size and arr[right] > arr[largest]: largest = right\n  \n  if largest != rootIndex:\n    swap(arr[rootIndex], arr[largest])\n    heapify(arr, size, largest)`,
        memory: "Heap Sort is strictly O(1) auxiliary space. The ingenious part of the algorithm is that it uses mathematical formulas (2i+1, 2i+2) to navigate the array as if it were a tree, meaning no actual node objects or pointers need to be created in memory.",
        time: "O(N log N)",
        space: "O(1)",
        pattern: [
            "Finding the Top K elements in a streaming dataset.",
            "When you need guaranteed O(N log N) performance with zero memory overhead.",
            "Priority Queue implementations."
        ],
        apps: [
            "Linux kernel implementations (security critical systems)", 
            "Task scheduling (Highest priority task runs first)", 
            "Graph algorithms (Dijkstra's relies on Min-Heaps)"
        ],
        mistakes: [
            "Forgetting that arrays are 0-indexed. If a parent is at index `i`, its left child is `2*i + 1`, NOT `2*i`. (A very common whiteboard mistake).",
            "Failing to re-heapify the root element after swapping it during the extraction phase."
        ]
    }
};