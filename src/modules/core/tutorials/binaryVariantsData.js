export const BinaryVariantsData = {
    firstLast: {
        title: "Binary Search: First & Last Occurrence",
        overview: "A standard Binary Search stops the moment it finds the target. However, if an array contains duplicate values, standard Binary Search might return a match in the middle of a cluster. The First & Last Occurrence variant specifically forces the search to continue to the absolute left or right edge of that cluster.",
        whyExists: "If you find a target at index 5, and the interviewer asks 'How many times does this number appear?', a naive approach is to use a while loop to expand left and right. But if the array is entirely made of that one number, your O(log N) search violently degrades into an O(N) linear scan! This variant guarantees O(log N) time even if the whole array is duplicates.",
        mechanics: [
            "Start with the standard Binary Search template (left = 0, right = arr.length - 1).",
            "Calculate mid. If arr[mid] > target, move left. If arr[mid] < target, move right.",
            "CRITICAL DIFFERENCE: If arr[mid] == target, DO NOT RETURN.",
            "Instead, save 'mid' in a 'result' variable as your best known answer.",
            "To find the FIRST occurrence: force the search to keep going LEFT (set right = mid - 1) to see if there is an even earlier match.",
            "To find the LAST occurrence: force the search to keep going RIGHT (set left = mid + 1) to see if there is an even later match.",
            "Return the saved 'result' variable after the loop finishes."
        ],
        dryRun: [
            { step: "Array: [2, 4, 4, 4, 6]. Target: 4.", state: "Find FIRST occurrence. Left: 0 | Right: 4" },
            { step: "Mid = 2. arr[2] is 4.", state: "Match! Save result = 2. Force Right = 1." },
            { step: "Left: 0 | Right: 1. Mid = 0. arr[0] is 2.", state: "2 < 4. Force Left = 1." },
            { step: "Left: 1 | Right: 1. Mid = 1. arr[1] is 4.", state: "Match! Update result = 1. Force Right = 0." },
            { step: "Left (1) > Right (0). Loop breaks.", state: "Return result: 1 (The very first '4')." }
        ],
        pseudo: `function findOccurrence(arr, target, findFirst):\n  left = 0, right = arr.length - 1\n  result = -1\n\n  while left <= right:\n    mid = left + Math.floor((right - left) / 2)\n    \n    if arr[mid] == target:\n      result = mid // Save the match!\n      if findFirst:\n        right = mid - 1 // Keep searching left\n      else:\n        left = mid + 1  // Keep searching right\n        \n    else if arr[mid] < target:\n      left = mid + 1\n    else:\n      right = mid - 1\n      \n  return result`,
        memory: "Just like standard Binary Search, this operates entirely In-Place using just the `left`, `right`, `mid`, and `result` integer variables, resulting in an O(1) memory footprint.",
        time: "O(log N) - Strictly logarithmic",
        space: "O(1) - Constant space",
        pattern: [
            "The array is sorted but explicitly contains DUPLICATE elements.",
            "You are asked to find the 'Frequency' or 'Count' of a specific element.",
            "You are asked to find the 'Range' of a target value.",
            "C++ equivalents: Utilizing std::lower_bound and std::upper_bound."
        ],
        apps: [
            "Database Range Queries (e.g., finding the exact block of records where date == '2026-06-05')",
            "Log parsing (Finding the first and last time a specific error code occurred in a sorted timestamp log)",
            "Frequency counting in massive datasets where O(N) scanning is too slow"
        ],
        mistakes: [
            "Returning `mid` the moment `arr[mid] == target`. You must resist the urge to return early! Save it and intentionally shrink the boundary.",
            "Running a while loop (`while arr[mid-1] == target`) after finding the target to scan for the edges. This ruins the O(log N) time complexity and instantly fails the interview.",
            "Off-by-one errors when calculating the total count of an element. If First is index 2 and Last is index 5, the total count is `(Last - First) + 1`."
        ]
    }
};