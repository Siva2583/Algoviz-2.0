export const twoPointersData = {
    twoPointers: {
        title: "Two Pointers Technique",
        overview: "The Two Pointers pattern involves creating two integer variables (pointers) that move through an array or string in tandem. Typically, they start at opposite ends and move toward the center, or start at the same end and move in parallel, until they meet or satisfy a specific mathematical condition.",
        whyExists: "It is the ultimate weapon for destroying O(N²) nested loops. By taking advantage of sorted data or spatial relationships, Two Pointers allows you to process pairs of elements in a single O(N) sweep, saving massive amounts of computational time.",
        mechanics: [
            "Ensure the data is SORTED (if the specific problem requires it, like Two Sum II).",
            "Initialize pointer A (left) at index 0, and pointer B (right) at the last index.",
            "Evaluate the elements at both pointers (e.g., add them together, compare them).",
            "Based on the evaluation, move ONE of the pointers inward.",
            "If the sum is too small, move the left pointer to the right (to increase the sum).",
            "If the sum is too large, move the right pointer to the left (to decrease the sum).",
            "Stop when the condition is met, or when the pointers cross each other."
        ],
        dryRun: [
            { step: "Array: [2, 7, 11, 15]. Target: 9.", state: "Left: 0 (val 2) | Right: 3 (val 15)" },
            { step: "Check: 2 + 15 = 17.", state: "17 > 9. Sum too large. Right--" },
            { step: "Left stays 0 (2). Right moves to 2 (11).", state: "Check: 2 + 11 = 13." },
            { step: "13 > 9. Sum too large. Right--.", state: "Left: 0 (val 2) | Right: 1 (val 7)" },
            { step: "Check: 2 + 7 = 9.", state: "9 == 9. TARGET FOUND!" }
        ],
        pseudo: `function searchPair(arr, target):\n  left = 0\n  right = arr.length - 1\n  \n  while left < right:\n    currentSum = arr[left] + arr[right]\n    \n    if currentSum == target:\n      return [left, right]\n      \n    if currentSum < target:\n      left++  // Need a larger number\n    else:\n      right-- // Need a smaller number\n      \n  return [-1, -1] // Pair not found`,
        memory: "The Two Pointers technique is fiercely efficient. Because it only requires initializing two standard integer variables to track indices, it always operates In-Place with an O(1) memory footprint.",
        time: "O(N) - Linear Time",
        space: "O(1) - Constant Space",
        pattern: [
            "The array is SORTED and you need to find pairs or triplets (e.g., 3Sum).",
            "You need to verify if a string is a Palindrome.",
            "You need to reverse an array or string in-place.",
            "You are comparing elements at two different ends of a sequence (e.g., Container With Most Water)."
        ],
        apps: [
            "String manipulation libraries (reverse, palindrome checks)",
            "Memory management (compacting fragmented memory blocks from both ends)",
            "Database query optimizations on sorted indices"
        ],
        mistakes: [
            "Using `while (left <= right)` instead of `while (left < right)` when looking for distinct pairs. If you use `<=`, a number will pair with itself if the pointers land on the exact same index!",
            "Forgetting that the classic 'opposite ends' approach ONLY works if the array is sorted. If it isn't sorted, you must sort it first (which adds O(N log N) time) or use a HashMap instead.",
            "Integer overflow. When adding `arr[left] + arr[right]` in languages like Java or C++, the sum of two large integers might exceed the 32-bit limit. Cast to `long` if necessary."
        ]
    }
};