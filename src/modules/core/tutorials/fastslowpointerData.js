export const fastSlowData = {
    moveZeroes: {
        title: "Fast & Slow Pointers (Move Zeroes)",
        overview: "This variation of Fast & Slow pointers acts as a 'Snowplow'. The Fast pointer scouts ahead to find valid elements, while the Slow pointer anchors behind to mark the boundary of the processed data. It allows you to filter or shift elements in a single pass.",
        whyExists: "If you want to move all zeroes to the end of an array, a naive approach requires creating a second array and copying non-zeroes over, wasting O(N) memory. This pattern performs the compaction strictly In-Place, making it the standard for memory-efficient data filtering.",
        mechanics: [
            "Initialize both slow and fast pointers at index 0.",
            "Advance the fast pointer by 1 in every iteration.",
            "Evaluate the element at the fast pointer.",
            "If the element is valid, swap it with the element at the slow pointer.",
            "Increment the slow pointer by 1 strictly when a swap occurs.",
            "When fast reaches the end, all valid elements are packed at the front, and the remaining trailing elements are the targets."
        ],
        dryRun: [
            { step: "Array: [0, 1, 0, 3]. Fast: 0, Slow: 0.", state: "arr[Fast] is 0. Ignore." },
            { step: "Fast moves to 1. arr[1] is 1.", state: "Valid! Swap arr[Slow] and arr[Fast]." },
            { step: "Array is now [1, 0, 0, 3].", state: "Increment Slow to 1. Fast moves to 2." },
            { step: "Fast is 2. arr[2] is 0. Ignore.", state: "Fast moves to 3." },
            { step: "Fast is 3. arr[3] is 3.", state: "Valid! Swap arr[Slow] and arr[Fast]." },
            { step: "Array is now [1, 3, 0, 0].", state: "Fast reaches end. Done." }
        ],
        pseudo: "function moveZeroes(arr):\n  let slow = 0\n  for fast = 0 to arr.length - 1:\n    if arr[fast] !== 0:\n      swap(arr[slow], arr[fast])\n      slow++\n  return arr",
        memory: "Because it only uses two integer variables to track the current positions, the spatial footprint is exactly O(1).",
        time: "O(N) - Linear Time",
        space: "O(1) - Constant Space",
        pattern: [
            "You are asked to move specific elements to the end or beginning of an array.",
            "You need to remove duplicates from a sorted array strictly In-Place.",
            "You must partition an array into two categories without changing the relative order."
        ],
        apps: [
            "Disk defragmentation algorithms.",
            "In-place filtering of datasets in low-memory environments.",
            "Data sanitization pipelines."
        ],
        mistakes: [
            "Incrementing the slow pointer inside the main loop unconditionally. The slow pointer must only advance when a valid element is found and swapped.",
            "Trying to explicitly write zeroes to the end of the array. The swapping mechanism naturally pushes the zeroes to the back without needing manual assignment."
        ]
    }
};