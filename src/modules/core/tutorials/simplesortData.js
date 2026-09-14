export const simpleSortData = {
    bubble: {
        title: "Bubble Sort",
        overview: "Bubble Sort is the simplest sorting algorithm. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. With each pass, the largest remaining element 'bubbles' up to its correct position at the end of the array.",
        whyExists: "It exists primarily as an educational tool. It is the easiest algorithm to conceptualize and write, making it the perfect introduction to algorithmic thinking, array iteration, and variable swapping.",
        mechanics: [
            "Start at the beginning of the array.",
            "Compare the current element with the next element.",
            "If the current element is greater, swap them.",
            "Move to the next element and repeat until the end of the unsorted portion.",
            "After one full pass, the largest element is locked at the end.",
            "Repeat the entire process N times, ignoring the locked elements at the end."
        ],
        dryRun: [
            { step: "Array: [5, 3, 8, 4, 2]", state: "Start Pass 1" },
            { step: "Compare 5 & 3 -> Swap.", state: "[3, 5, 8, 4, 2]" },
            { step: "Compare 5 & 8 -> Keep.", state: "[3, 5, 8, 4, 2]" },
            { step: "Compare 8 & 4 -> Swap.", state: "[3, 5, 4, 8, 2]" },
            { step: "Compare 8 & 2 -> Swap.", state: "[3, 5, 4, 2 | 8] (8 is locked)" }
        ],
        pseudo: `function bubbleSort(arr):\n  n = arr.length\n  for i from 0 to n - 1:\n    swapped = false\n    \n    // Last i elements are already in place\n    for j from 0 to n - i - 2:\n      if arr[j] > arr[j + 1]:\n        swap(arr[j], arr[j + 1])\n        swapped = true\n        \n    // If no two elements were swapped, array is sorted\n    if not swapped:\n      break`,
        memory: "Bubble Sort operates entirely In-Place. It only requires a single temporary variable to handle the swapping process, meaning its memory footprint never scales with the size of the input.",
        time: "O(N²) Worst | O(N) Best",
        space: "O(1)",
        pattern: [
            "The dataset is extremely small.",
            "The array is already almost completely sorted (Best Case O(N)).",
            "You are asked to implement the simplest possible sort on a whiteboard."
        ],
        apps: [
            "Educational environments (intro to CS)", 
            "Computer graphics (sorting almost-sorted polygons for rendering)", 
            "Detecting extremely small errors in nearly sorted arrays"
        ],
        mistakes: [
            "Forgetting the `swapped` boolean flag optimization. Without it, the algorithm will blindly run O(N²) times even if the array was sorted on the first pass.",
            "Running the inner loop all the way to `n` every time, rather than `n - i - 1`, wasting time comparing elements that are already locked in place."
        ]
    },
    selection: {
        title: "Selection Sort",
        overview: "Selection Sort divides the array into a 'sorted' left half and an 'unsorted' right half. It scans the unsorted half to find the absolute minimum value, and then swaps it with the leftmost unsorted element, growing the sorted half by one.",
        whyExists: "Selection sort was designed to minimize the number of memory writes. Unlike Bubble Sort which swaps constantly, Selection Sort only makes a maximum of O(N) swaps. This is highly valuable when writing to memory is physically expensive or slow.",
        mechanics: [
            "Maintain a boundary between the sorted (left) and unsorted (right) sub-arrays.",
            "Set the first unsorted element as the assumed 'minimum'.",
            "Iterate through the rest of the unsorted elements to find the true minimum.",
            "Swap the true minimum with the first unsorted element.",
            "Shift the boundary one position to the right and repeat."
        ],
        dryRun: [
            { step: "Array: [29, 10, 14, 37, 13]", state: "Sorted: [] | Unsorted: [29...]" },
            { step: "Scan unsorted. Min is 10.", state: "Swap 29 and 10." },
            { step: "Boundary moves.", state: "Sorted: [10] | Unsorted: [29, 14, 37, 13]" },
            { step: "Scan unsorted. Min is 13.", state: "Swap 29 and 13." },
            { step: "Boundary moves.", state: "Sorted: [10, 13] | Unsorted: [14, 37, 29]" }
        ],
        pseudo: `function selectionSort(arr):\n  n = arr.length\n  \n  for i from 0 to n - 1:\n    min_idx = i\n    \n    // Find the minimum element in unsorted array\n    for j from i + 1 to n - 1:\n      if arr[j] < arr[min_idx]:\n        min_idx = j\n        \n    // Swap the found minimum element with the first element\n    if min_idx != i:\n      swap(arr[i], arr[min_idx])`,
        memory: "Selection Sort is strictly In-Place. It requires zero extra data structures and only uses one integer to track the `min_idx`.",
        time: "O(N²) Always",
        space: "O(1)",
        pattern: [
            "Writing to memory is extremely costly (e.g., Flash memory wear and tear).",
            "Memory space is strictly O(1) and you want to guarantee maximum N swaps.",
            "When Time Complexity doesn't matter (very small N)."
        ],
        apps: [
            "EEPROM or Flash memory systems with limited write cycles", 
            "Embedded systems with extreme constraints",
            "Situations where the cost of swapping is vastly greater than comparing"
        ],
        mistakes: [
            "Swapping the elements *inside* the inner loop. You must wait until the inner loop finishes finding the absolute minimum before swapping.",
            "Selection sort is generally NOT stable (it changes the relative order of equal elements). Do not use it if stability is required."
        ]
    },
    insertion: {
        title: "Insertion Sort",
        overview: "Insertion Sort builds the final sorted array one item at a time. It mimics how humans sort a hand of playing cards: you pick up the next card, scan the cards you already hold from right to left, and slide the new card into its correct slot.",
        whyExists: "It is the undisputed king of sorting extremely small arrays (N < 50) and nearly-sorted data. Because it can exit its inner loop early, it runs in blazing fast O(N) time on already sorted data.",
        mechanics: [
            "Assume the first element (index 0) is already sorted.",
            "Pick up the next element (index 1) and store it in a temporary 'key' variable.",
            "Look at the elements to the left. If they are larger than the key, shift them one space to the right.",
            "Once you find an element smaller than the key (or hit the start), insert the key.",
            "Repeat for all elements."
        ],
        dryRun: [
            { step: "Array: [4, 3, 2, 10]", state: "Assume [4] is sorted. Key = 3." },
            { step: "4 is > 3. Shift 4 right.", state: "Array: [4, 4, 2, 10]" },
            { step: "Insert Key (3).", state: "Array: [3, 4, 2, 10]" },
            { step: "Next Key = 2. Shift 4, Shift 3.", state: "Array: [3, 3, 4, 10]" },
            { step: "Insert Key (2).", state: "Array: [2, 3, 4, 10]" }
        ],
        pseudo: `function insertionSort(arr):\n  n = arr.length\n  \n  for i from 1 to n - 1:\n    key = arr[i]\n    j = i - 1\n    \n    // Move elements greater than key to one position ahead\n    while j >= 0 and arr[j] > key:\n      arr[j + 1] = arr[j]\n      j = j - 1\n      \n    arr[j + 1] = key`,
        memory: "Insertion Sort is In-Place. It uses a single variable `key` to hold the value being evaluated while the array shifts around it.",
        time: "O(N²) Worst | O(N) Best",
        space: "O(1)",
        pattern: [
            "Data is streaming in live (Online Algorithm).",
            "The array is already mostly sorted.",
            "The array is very small (less than ~40 elements)."
        ],
        apps: [
            "Timsort (The default sort in Python and Java uses Insertion Sort for small chunks)", 
            "V8 JavaScript Engine (Used as a fallback for small arrays)", 
            "Live tracking systems (maintaining a top-10 leaderboard)"
        ],
        mistakes: [
            "Trying to SWAP elements in the inner loop. Insertion sort doesn't swap; it SHIFTS elements to the right to make a gap, then drops the key in.",
            "Forgetting to save `arr[i]` into a temporary `key` variable before the inner loop begins, causing the value to be overwritten and lost during the shift."
        ]
    }
};