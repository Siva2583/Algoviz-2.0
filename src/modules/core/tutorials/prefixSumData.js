export const prefixSumData = {
    prefixSum: {
        title: "Prefix Sum Pattern",
        overview: "The Prefix Sum pattern involves creating a new array where each element at index 'i' stores the cumulative sum of all elements from the start of the original array up to 'i'. This precomputed data allows you to answer mathematical queries about any sub-range in instant O(1) time.",
        whyExists: "Imagine calculating the total sales from March to August in a yearly database. A brute-force approach loops through those months every single time a manager asks (O(N) time per query). If they ask 1,000 times, the app freezes. Prefix Sum calculates a running total exactly once upfront, so future range queries are solved with a single mathematical subtraction: (August Total) - (February Total).",
        mechanics: [
            "Create a new 'prefix' array. (Pro-tip: Make it size N + 1 and set index 0 to 0 to avoid messy edge cases).",
            "Iterate through the original array.",
            "For each element, add its value to the previous cumulative sum and store it in the prefix array.",
            "To find the sum of any range from index L to index R, use the formula: prefix[R + 1] - prefix[L].",
            "This instantly removes the 'tail' of numbers before L that you don't want in your sum."
        ],
        dryRun: [
            { step: "Original: [2, 4, 1, 3]. Query: Sum of index 1 to 3.", state: "Expected answer: 4 + 1 + 3 = 8." },
            { step: "Build Prefix Array of size N+1.", state: "prefix = [0, 0, 0, 0, 0]" },
            { step: "Iterate and Accumulate sums.", state: "prefix = [0, 2, 6, 7, 10]" },
            { step: "Query Range (L=1, R=3).", state: "Formula: prefix[3 + 1] - prefix[1]" },
            { step: "Calculate: prefix[4] - prefix[1]", state: "10 - 2 = 8. DONE in O(1) time!" }
        ],
        pseudo: `// 1. Precomputation Phase (Done once)\nfunction buildPrefix(arr):\n  prefix = new Array(arr.length + 1).fill(0)\n  for i from 0 to arr.length - 1:\n    prefix[i + 1] = prefix[i] + arr[i]\n  return prefix\n\n// 2. Query Phase (Done repeatedly in O(1))\nfunction rangeSum(prefix, left, right):\n  // Right + 1 gives the total up to the end boundary\n  // Left gives the total immediately BEFORE the start boundary\n  return prefix[right + 1] - prefix[left]`,
        memory: "A standard Prefix Sum requires O(N) auxiliary space to store the precomputed array. However, if the interviewer asks to optimize for space and you no longer need the original array values, you can overwrite the original array In-Place, achieving O(1) extra space.",
        time: "O(N) to Build | O(1) per Query",
        space: "O(N) Standard | O(1) In-Place",
        pattern: [
            "The problem requires the sum of elements in a contiguous sub-array.",
            "You are asked to perform MULTIPLE range queries on the same array.",
            "You need to find an equilibrium index (where left sum == right sum).",
            "2D Matrix queries (Sum of a rectangular region inside a grid)."
        ],
        apps: [
            "Image Processing (Summed-Area Tables for applying fast blur filters to photos)",
            "Financial Analytics (Year-To-Date calculations in dashboards)",
            "Machine Learning (Calculating cumulative probability distributions)"
        ],
        mistakes: [
            "The infamous Off-By-One Error. If you make the prefix array the exact same size as the original array (Size N), calculating the sum from index 0 to R forces you to write ugly `if (left == 0)` logic to avoid an OutOfBounds exception. Always use an N+1 size array starting with 0.",
            "Failing to account for Integer Overflow. If the original array contains very large numbers, the cumulative sum at the end of the prefix array might exceed the 32-bit integer limit. Use `long` or BigInt types if necessary."
        ]
    }
};