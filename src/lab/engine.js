import { generateBubbleSort } from "../modules/core/algorithm/sorting/algorithms/bubbleSort.js";
import { generateSelectionSort } from "../modules/core/algorithm/sorting/algorithms/selectionSort.js";
import { generateInsertionSort } from "../modules/core/algorithm/sorting/algorithms/insertionSort.js";
import { generateMergeSort } from "../modules/core/algorithm/sorting/algorithms/mergeSort.js";
import { generateQuickSort } from "../modules/core/algorithm/sorting/algorithms/quickSort.js";
import { generateHeapSort } from "../modules/core/algorithm/sorting/algorithms/heapSort.js";

export const algorithms = {
  bubble: {
    name: "Bubble sort",
    run: generateBubbleSort,
    time: "O(n²)",
    space: "O(1)",
    idea: "Compare neighbors. Move the larger value right. Each pass locks one more element.",
    invariant:
      "After each complete pass, the rightmost processed elements are in their final positions.",
  },
  selection: {
    name: "Selection sort",
    run: generateSelectionSort,
    time: "O(n²)",
    space: "O(1)",
    idea: "Find the smallest remaining element and place it at the next output position.",
    invariant:
      "The sorted prefix contains the smallest elements in increasing order.",
  },
  insertion: {
    name: "Insertion sort",
    run: generateInsertionSort,
    time: "O(n²)",
    space: "O(1)",
    idea: "Take the next element and insert it into the already sorted prefix.",
    invariant: "The prefix before the current insertion is sorted.",
  },
  merge: {
    name: "Merge sort",
    run: generateMergeSort,
    time: "O(n log n)",
    space: "O(n)",
    idea: "Split the array, sort both halves, then merge their ordered values.",
    invariant:
      "Each merge consumes two sorted ranges and produces a sorted range.",
  },
  quick: {
    name: "Quick sort",
    run: generateQuickSort,
    time: "O(n²) worst",
    space: "O(n) worst",
    idea: "Partition around the last element as pivot, then recursively sort either side.",
    invariant:
      "After partition, the pivot is final; left values are ≤ it and right values are greater.",
  },
  heap: {
    name: "Heap sort",
    run: generateHeapSort,
    time: "O(n log n)",
    space: "O(log n)*",
    idea: "Build a max heap. Extract the largest value, then restore the heap.",
    invariant:
      "After heap restoration, the root is the largest value in the active heap.",
  },
};
export function parseInput(text) {
  if (typeof text !== "string" || !text.trim())
    throw new Error("Enter 2–24 integers, separated by commas.");
  const parts = text.split(",");
  if (parts.length < 2 || parts.length > 24)
    throw new Error(
      "Use 2–24 values. Small inputs keep every operation inspectable.",
    );
  if (parts.some((p) => !/^-?\d+$/.test(p.trim())))
    throw new Error(
      "Use whole numbers separated by commas. Empty values are not allowed.",
    );
  const values = parts.map(Number);
  if (values.some((n) => !Number.isSafeInteger(n) || Math.abs(n) > 999))
    throw new Error("Each number must be between −999 and 999.");
  return values;
}
export function playbackReducer(state, action) {
  switch (action.type) {
    case "load":
      return { cursor: 0, length: action.length, playing: false };
    case "toggle":
      return {
        ...state,
        cursor: state.cursor === state.length - 1 ? 0 : state.cursor,
        playing: !state.playing,
      };
    case "tick":
      return {
        ...state,
        cursor: Math.min(state.cursor + 1, state.length - 1),
        playing: state.cursor + 1 < state.length - 1,
      };
    case "seek":
      return {
        ...state,
        cursor: Math.max(0, Math.min(action.cursor, state.length - 1)),
        playing: false,
      };
    default:
      return state;
  }
}
export function makeDataset(kind, seed = 42) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const values = Array.from(
    { length: 10 },
    () => 5 + Math.floor(random() * 90),
  );
  if (kind === "reverse") return values.sort((a, b) => b - a);
  if (kind === "sorted") return values.sort((a, b) => a - b);
  if (kind === "duplicates") return values.map((n) => (n % 4) * 15 + 10);
  return values;
}
export function windowTrace(values, target, buggy = false) {
  let left = 0,
    sum = 0,
    best = Infinity;
  const trace = [];
  for (let right = 0; right < values.length; right++) {
    sum += values[right];
    trace.push({
      left,
      right,
      sum,
      best,
      action: `Add ${values[right]} to the window.`,
    });
    while (sum >= target) {
      if (!buggy || sum === target) best = Math.min(best, right - left + 1);
      trace.push({
        left,
        right,
        sum,
        best,
        action:
          buggy && sum !== target
            ? `${sum} ≠ ${target}: incorrectly skip a qualifying window.`
            : `${sum} ≥ ${target}: record length ${right - left + 1}.`,
      });
      sum -= values[left++];
    }
  }
  return { trace, result: best === Infinity ? 0 : best };
}
export function findCounterexample() {
  // Bounded exhaustive search in increasing length and lexicographic order.
  for (let length = 1; length <= 3; length++) {
    for (let code = 0; code < 4 ** length; code++) {
      const values = Array.from(
        { length },
        (_, i) => 1 + (Math.floor(code / 4 ** (length - i - 1)) % 4),
      );
      for (let target = 1; target <= 8; target++) {
        const correct = windowTrace(values, target),
          buggy = windowTrace(values, target, true);
        if (correct.result !== buggy.result)
          return { values, target, correct, buggy };
      }
    }
  }
  return null;
}
