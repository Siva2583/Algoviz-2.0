export const slidingWindowData = {
    slidingWindow: {
        title: "Sliding Window Technique",
        overview: "The Sliding Window is a variation of the Two Pointers technique used to track a contiguous sub-array or sub-string. By maintaining a 'window' between a left and right pointer, the algorithm slides across the data, expanding or shrinking the window based on specific mathematical conditions.",
        whyExists: "It exists to eliminate redundant calculations. If you need the sum of every 3-element sub-array, a brute-force approach recalculates the inner elements every single time (O(N*K) time). A sliding window simply subtracts the element falling out of the left side and adds the new element coming in on the right, achieving blazing fast O(N) time.",
        mechanics: [
            "Initialize two pointers, 'left' and 'right', both starting at index 0.",
            "Expand the window by moving the 'right' pointer forward, adding the new element to your running state (e.g., running sum, frequency map).",
            "Check if the current window violates the problem's condition (e.g., sum is too large, or window exceeds size K).",
            "If invalid, shrink the window by moving the 'left' pointer forward, subtracting the outgoing element from your running state until the window is valid again.",
            "Update your 'best answer' (e.g., max length, min cost) while the window is in a valid state.",
            "Repeat until the 'right' pointer hits the end of the array."
        ],
        dryRun: [
            { step: "Array: [2, 1, 5, 1, 3]. Target Sum: >= 7.", state: "Find the SHORTEST contiguous sub-array." },
            { step: "Expand Right to 2. Window: [2, 1, 5].", state: "Sum = 8. Valid! Current Min Length = 3." },
            { step: "Shrink Left. Remove 2. Window: [1, 5].", state: "Sum = 6. Invalid." },
            { step: "Expand Right to 3. Window: [1, 5, 1].", state: "Sum = 7. Valid! Current Min Length = 3." },
            { step: "Shrink Left. Remove 1. Window: [5, 1].", state: "Sum = 6. Invalid." },
            { step: "Expand Right to 4. Window: [5, 1, 3].", state: "Sum = 9. Valid! Current Min Length = 3." },
            { step: "Shrink Left. Remove 5. Window: [1, 3].", state: "Sum = 4. Invalid. Best answer remains 3." }
        ],
        pseudo: `function shortestSubarray(arr, target):\n  left = 0\n  currentSum = 0\n  minLength = Infinity\n  \n  for right from 0 to arr.length - 1:\n    currentSum += arr[right] // Add incoming element\n    \n    // Shrink window while condition is met\n    while currentSum >= target:\n      minLength = min(minLength, right - left + 1)\n      currentSum -= arr[left] // Subtract outgoing element\n      left++ // Slide the left edge\n      \n  return minLength == Infinity ? 0 : minLength`,
        memory: "If tracking a simple metric like a running sum, the memory footprint is O(1). However, many Sliding Window string problems (like 'Longest Substring Without Repeating Characters') require a HashMap to track character frequencies inside the window, which takes O(K) space where K is the size of the alphabet.",
        time: "O(N) - Both pointers only move forward",
        space: "O(1) to O(K) depending on the state tracker",
        pattern: [
            "The problem explicitly asks for a 'contiguous sub-array' or 'substring'.",
            "You need to find the 'longest', 'shortest', or 'maximum' sequence.",
            "The window size is FIXED (e.g., 'Max sum of size K').",
            "The window size is DYNAMIC (e.g., 'Longest sub-array with sum <= K')."
        ],
        apps: [
            "TCP Protocol (Sliding Window handles packet transmission and congestion control).",
            "Streaming Data Analytics (e.g., calculating a 7-day moving average for stocks).",
            "String manipulation and Plagiarism detection algorithms (Rabin-Karp)."
        ],
        mistakes: [
            "Updating the 'best answer' in the wrong place. For a 'longest' subarray problem, update the max length AFTER shrinking the window. For a 'shortest' subarray problem, update the min length INSIDE the while loop as you shrink.",
            "Assuming it's an O(N²) algorithm because there is a `while` loop inside a `for` loop. (Interviewers love asking this! Explain that it is O(N) because the `left` pointer only ever moves forward, meaning each element is processed a maximum of twice: once by `right` and once by `left`)."
        ]
    }
};