export const binarysearchData = {
    binary: {
        title: "Binary Search",
        overview: "Binary Search is an extremely efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.",
        whyExists: "Scanning an array item-by-item (Linear Search) takes O(N) time. For an array of 1 billion items, that is 1 billion checks. Binary search cuts the search space in half every step, finding the target in a 1-billion-item array in just 30 steps. It is the fundamental algorithm that makes large-scale database lookups instant.",
        mechanics: [
            "Ensure the array is strictly sorted.",
            "Set two pointers: 'left' at index 0, and 'right' at the last index.",
            "Calculate the 'mid' index between left and right.",
            "Compare the target value to the element at the mid index.",
            "If they match, return the mid index. You are done!",
            "If the target is smaller, it MUST be in the left half. Move the 'right' pointer to mid - 1.",
            "If the target is larger, it MUST be in the right half. Move the 'left' pointer to mid + 1.",
            "Repeat until left is greater than right (meaning the target doesn't exist)."
        ],
        dryRun: [
            { step: "Array: [2, 5, 8, 12, 16, 23, 38, 56]. Target: 23.", state: "Left: 0 | Right: 7" },
            { step: "Mid = (0+7)/2 = 3. arr[3] is 12.", state: "12 < 23. Move Left to Mid + 1." },
            { step: "Left is now 4. Right is 7.", state: "Mid = (4+7)/2 = 5." },
            { step: "arr[5] is 23. Matches Target!", state: "Return index 5. DONE." }
        ],
        pseudo: `function binarySearch(arr, target):\n  left = 0\n  right = arr.length - 1\n\n  while left <= right:\n    // CRITICAL: Prevent integer overflow\n    mid = left + Math.floor((right - left) / 2)\n    \n    if arr[mid] == target:\n      return mid\n    else if arr[mid] < target:\n      left = mid + 1\n    else:\n      right = mid - 1\n      \n  return -1 // Target not found`,
        memory: "Iterative Binary Search operates entirely In-Place using just three integer pointers (left, right, mid), resulting in a microscopic O(1) memory footprint. (Note: A recursive implementation would use O(log N) Call Stack memory, which is why iterative is preferred).",
        time: "O(log N) Worst/Avg | O(1) Best",
        space: "O(1) Iterative",
        pattern: [
            "The input array/matrix is SORTED.",
            "The problem requires O(log N) time complexity.",
            "'Binary Search on Answer': You are looking for the 'minimum maximum' or 'maximum minimum' value that satisfies a specific condition."
        ],
        apps: [
            "Database Indexing (B-Trees rely heavily on binary search logic)",
            "Debugging (e.g., 'git bisect' uses binary search to find the exact commit that broke the code)",
            "Auto-complete and spell checkers (Searching dictionary tries)"
        ],
        mistakes: [
            "Using `mid = (left + right) / 2`. In strongly typed languages (Java, C++), adding two massive indices together will exceed the 32-bit integer limit and crash the program. ALWAYS use `mid = left + (right - left) / 2`.",
            "Writing the `while` loop as `while (left < right)`. If the target is at the exact index where left equals right, the loop breaks too early. It must be `while (left <= right)`."
        ]
    }
};