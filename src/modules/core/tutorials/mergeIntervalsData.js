export const mergeIntervalsData = {
    mergeIntervals: {
        title: "Merge Intervals Pattern",
        overview: "The Merge Intervals pattern deals with overlapping continuous ranges (like time slots, numeric ranges, or geometric coordinates). The core idea is to sort the intervals based on their starting points, which guarantees that any overlapping intervals will be strictly adjacent to each other in the list.",
        whyExists: "Comparing every interval against every other interval to check for overlaps takes a disastrous O(N²) time. By spending O(N log N) time to sort the intervals first, you reduce the actual merging process to a single O(N) linear sweep. This is the foundational algorithm behind modern calendar and scheduling software.",
        mechanics: [
            "Sort the array of intervals based on their start values in ascending order.",
            "Create an empty list called 'merged' to hold the consolidated intervals.",
            "Push the very first interval into the 'merged' list.",
            "Iterate through the remaining intervals one by one.",
            "Compare the current interval's START time to the END time of the last interval in the 'merged' list.",
            "If they overlap (current.start <= last.end), merge them by updating last.end to the maximum of both end times.",
            "If they do not overlap, push the current interval into the 'merged' list as a new standalone range."
        ],
        dryRun: [
            { step: "Input: [[2,6], [1,3], [15,18], [8,10]]", state: "Step 1: SORT by start time." },
            { step: "Sorted: [[1,3], [2,6], [8,10], [15,18]]", state: "Push [1,3] to merged." },
            { step: "Next: [2,6]. Check: 2 <= 3 (Overlap!).", state: "Merge: End = max(3, 6). merged = [[1,6]]" },
            { step: "Next: [8,10]. Check: 8 <= 6 (No overlap).", state: "Push. merged = [[1,6], [8,10]]" },
            { step: "Next: [15,18]. Check: 15 <= 10 (No).", state: "Push. merged = [[1,6], [8,10], [15,18]]. DONE." }
        ],
        pseudo: `function merge(intervals):\n  if intervals.length == 0: return []\n  \n  // 1. Sort by start time\n  intervals.sort((a, b) => a[0] - b[0])\n  \n  merged = [intervals[0]]\n  \n  for i from 1 to intervals.length - 1:\n    current = intervals[i]\n    lastMerged = merged[merged.length - 1]\n    \n    // 2. Check for overlap\n    if current[0] <= lastMerged[1]:\n      // Overlap! Update the end time\n      lastMerged[1] = Math.max(lastMerged[1], current[1])\n    else:\n      // No overlap! Push as new interval\n      merged.push(current)\n      \n  return merged`,
        memory: "The memory footprint is heavily dependent on the sorting algorithm used by your programming language (e.g., Python's Timsort takes O(N) space, while C++ std::sort takes O(log N)). The output array itself requires O(N) space in the worst case where no intervals overlap.",
        time: "O(N log N) - Dominated by the sorting phase",
        space: "O(N) - To store the merged results",
        pattern: [
            "You are given a list of intervals, time slots, or geometric ranges.",
            "You need to find overlapping regions, mutually exclusive regions, or 'free time'.",
            "You need to calculate the maximum number of simultaneous events (e.g., the 'Meeting Rooms II' problem)."
        ],
        apps: [
            "Calendar applications (Google Calendar 'Find a Time' feature)",
            "Operating System CPU Process scheduling",
            "Network packet reassembly (handling overlapping TCP segments)"
        ],
        mistakes: [
            "Forgetting to sort the array first! The O(N) linear sweep strictly relies on the intervals arriving in start-time order. If you don't sort, the logic completely falls apart.",
            "Updating the merged end time to just `current.end` instead of using `Math.max(last.end, current.end)`. If you have a massive interval `[1, 10]` and a smaller one inside it `[2, 6]`, the merged result must remain `[1, 10]`, NOT `[1, 6]`!"
        ]
    }
};