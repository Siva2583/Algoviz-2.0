%PART: Whiteboard coding | PART XXX | Eleven exercises drawn from the project, with approach, edge cases, complexity, common mistakes and a model solution.

# 56 · Whiteboard exercises

> You will be asked to write code. These are the exercises that AlgoViz makes natural, and every model solution is one you can defend by pointing at the repository.

## 56.0 How to perform on a whiteboard

:::must The five-step protocol — say it while you do it, not after
1. **Restate the problem** and confirm the signature out loud: *"Input is an array of numbers, output is a sorted copy, and I must not mutate the input."*
2. **State the approach and its complexity before writing**: *"I'll do a Lomuto partition with a last-element pivot; average O(n log n), worst O(n²) on sorted input."* This buys you credit even if the code has a typo.
3. **Write the skeleton first** (loop bounds, base case), then fill in the body. Sketches that start with variable declarations read as hesitation.
4. **Test it on a tiny input by hand** — always `[3,1,2]` or `[2,1]`. Narrate: *"i=0, j=1, 1<=2 so i becomes 0, swap…"*
5. **State the edge cases you would handle and the tests you would write.** This is what separates a candidate who has shipped code from one who has only written functions.
:::

---

## Exercise 1 · Bubble sort — the interview version

**Question.** *"Write bubble sort. Don't mutate the input. What's its best case?"*

**Expected approach.** Copy the array, nested loops, early-exit flag, swap when out of order. The early exit is the part being tested.

```js
function bubbleSort(input) {
  const arr = [...input];                      // never mutate the caller's array
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {      // the sorted tail shrinks
      if (arr[j] > arr[j + 1]) {               // strict > keeps it stable
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;                       // no swaps means already sorted
  }
  return arr;
}
```

| Aspect | Answer |
| --- | --- |
| Time | Best Θ(n) **with** the flag; average/worst Θ(n²) |
| Space | O(1) auxiliary; O(n) for the returned copy |
| Stable | Yes — the comparison is strict |
| Edge cases | `[]`, `[1]`, all-equal, already sorted, reverse sorted, negatives |
| Common mistakes | Omitting the flag and claiming O(n) best case; `j < n - i` (reading into the sorted tail); using `>=` (breaks stability); returning the input array itself |
| AlgoViz tie-in | **The generator deliberately omits the early exit**, so the app's bubble sort is Θ(n²) on every input — measured: a sorted 24-element array still reports 276 comparisons. Say this; it converts a textbook answer into project knowledge. |

---

## Exercise 2 · Selection sort

**Question.** *"Write selection sort and tell me something interesting about its comparison count."*

```js
function selectionSort(input) {
  const arr = [...input], n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}
```

**The interesting fact:** the comparison count is **exactly n(n−1)/2 regardless of the input**. It is not adaptive, and it does at most n−1 swaps — the minimum for a comparison sort that only swaps. Verification from your own traces: 28 comparisons for n = 8 and 45 for n = 10, both exact.

| Common mistakes | Consequence |
| --- | --- |
| Comparing against `arr[i]` instead of `arr[minIdx]` | Finds the minimum of each *pair*, not the running minimum |
| Swapping unconditionally | Inflates the swap count; loses the "zero swaps on equal input" property |
| Starting the inner loop at `i` | An extra self-comparison that inflates the count by n |

---

## Exercise 3 · Insertion sort

**Question.** *"Write insertion sort. Why would a real library use it?"*

```js
function insertionSort(input) {
  const arr = [...input];
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {   // strict > keeps it stable
      arr[j + 1] = arr[j];             // shift, don't swap
      j--;
    }
    arr[j + 1] = key;                  // drop into place
  }
  return arr;
}
```

**Why libraries use it:** adaptive (Θ(n) on nearly-sorted input), tiny constant factor, no allocation, no recursion, and online — it can sort a stream as items arrive. Timsort and introsort implementations switch to it below a size threshold, typically 16–32 elements.

| Aspect | Detail |
| --- | --- |
| Best case | n − 1 comparisons, 0 shifts — Θ(n) |
| Common mistakes | Swapping instead of shifting (doubles the writes); `arr[j] >= key` (breaks stability); forgetting `j >= 0` (reads `arr[-1]`, which is `undefined` and every comparison against it is false — so it can silently "work" and stop early) |
| AlgoViz tie-in | The generator swaps instead of shifting, so its exchange counter is not the same measure as a shift-based implementation's — the reason the comparison panel uses comparisons only. This implementation *does* have the early exit the bubble sort lacked; that asymmetry is visible in the app, where insertion sort's trace on a sorted input is dramatically shorter than bubble sort's. |

---

## Exercise 4 · Merge sort

**Question.** *"Write merge sort. Is it stable? In-place? What's the space complexity?"*

```js
function mergeSort(a) {
  if (a.length <= 1) return [...a];
  const mid = a.length >> 1;
  return merge(mergeSort(a.slice(0, mid)), mergeSort(a.slice(mid)));
}

function merge(L, R) {
  const out = [];
  let i = 0, j = 0;
  while (i < L.length && j < R.length) out.push(L[i] <= R[j] ? L[i++] : R[j++]);
  while (i < L.length) out.push(L[i++]);
  while (j < R.length) out.push(R[j++]);
  return out;
}
```

| Aspect | Answer |
| --- | --- |
| Time | Θ(n log n) in every case — best, average and worst |
| Space | O(n) auxiliary (the merged arrays plus the recursion depth O(log n)) |
| Stable | Yes, **because** the comparison is `<=`: ties take from the left run first |
| In-place | No |
| Common mistakes | Writing `<` instead of `<=` (breaks stability); forgetting one of the two tail loops (drops the remaining elements); using `mid` as both a split point and an inclusive bound inconsistently; recursion on `a.length === 2` producing an infinite loop if the base case is `a.length === 0` only |
| AlgoViz tie-in | The generator sorts **in place with a buffer**, not by returning new arrays, because a frame must show one canonical current array. And that buffer write-back is where the duplicate-ID frames come from — 23 of 107 frames on the default input. |

---

## Exercise 5 · Quick sort

**Question.** *"Write quick sort with Lomuto partitioning. What's the worst case, and when does it occur?"*

```js
function quickSort(a, low = 0, high = a.length - 1) {
  if (low >= high) return a;
  const p = partition(a, low, high);
  quickSort(a, low, p - 1);      // pivot excluded
  quickSort(a, p + 1, high);
  return a;
}

function partition(a, low, high) {
  const pivot = a[high];         // capture the VALUE, not the index
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (a[j] <= pivot) { i++; [a[i], a[j]] = [a[j], a[i]]; }
  }
  [a[i + 1], a[high]] = [a[high], a[i + 1]];
  return i + 1;
}
```

| Aspect | Answer |
| --- | --- |
| Time | Best/average Θ(n log n); **worst Θ(n²)** |
| Worst case | **Already-sorted input with a last-element pivot.** Every partition places the pivot at `high` itself, so the recursion becomes a single subproblem one element smaller: n levels of O(n) work |
| Space | O(log n) average stack, O(n) worst — the recursion is not tail-call optimised |
| Stable | No (the long-distance swaps reorder equal keys) |
| Common mistakes | Recursing on `p` instead of `p ± 1` (infinite recursion on a size-1 range); `j <= high` (compares the pivot with itself); reading `a[high]` inside the loop after swaps have moved it |
| AlgoViz tie-in | The app ships exactly this worst case, and the user can trigger it by pressing the **"sorted" preset** — a live, interactive demonstration of an algorithmic worst case. The fix is median-of-three or a randomised pivot. |

**Follow-up you should be ready for:** *"How would you avoid the worst case?"* Median-of-three (median of `low`, `mid`, `high` as the pivot), randomising the pivot by swapping `a[high]` with a random index before partitioning, or switching to introsort (fall back to heap sort when the recursion depth exceeds 2 log n).

---

## Exercise 6 · Heap sort — the sixth algorithm

**Question.** *"Write heap sort. Why is building the heap O(n) rather than O(n log n)?"*

```js
function heapSort(input) {
  const a = [...input], n = a.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(a, n, i);   // build: O(n)
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    siftDown(a, end, 0);
  }
  return a;
}

function siftDown(a, size, i) {
  while (true) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && a[l] > a[largest]) largest = l;
    if (r < size && a[r] > a[largest]) largest = r;
    if (largest === i) break;
    [a[i], a[largest]] = [a[largest], a[i]];
    i = largest;
  }
}
```

| Aspect | Answer |
| --- | --- |
| Time | **Θ(n log n) in every case** — no input distribution is bad for it |
| Build phase | **O(n)**, not O(n log n): most nodes are shallow, so the sum of (nodes at depth d) × (height below d) telescopes to O(n) |
| Space | O(1) auxiliary with the iterative sift above; O(log n) if `siftDown` recurses |
| Stable | No |
| Common mistakes | Starting the build loop at `n-1` (works but does wasted work); `l < size` omitted (reads past the heap); using the full array length in the second phase's sift instead of the shrinking `end` |
| AlgoViz tie-in | The generator uses a **recursive** `heapify` and increments two comparison counters per call unconditionally — verified: the counter rises even on a leaf with no children. Both facts are on screen: the panel shows `O(log n)*` with a call-stack footnote, and the counters carry a footnote about being implementation-specific. |

---

## Exercise 7 · The playback reducer

**Question.** *"Here's a UI with a cursor, a frame count and a playing flag. Design the state machine. What actions do you need? What are the invariants?"*

**Expected approach.** Enumerate the transitions first, then write the reducer, then state the invariants.

```js
const initial = (length) => ({ cursor: 0, length, playing: false });

function playbackReducer(state, action) {
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
```

| Aspect | Answer |
| --- | --- |
| Invariants | `0 <= cursor <= length - 1`; reaching the last frame always clears `playing`; every `seek` pauses |
| Four actions, not eight | `restart` is `seek(0)`; `next` is `seek(cursor+1)`; `previous` is `seek(cursor-1)`; `replay` is `toggle` at the end. Fewer actions means fewer transitions to test |
| Why a reducer | The three fields have cross-field rules; a reducer states them once, purely, and testably |
| Edge cases to mention | `length === 1`; seek beyond either end; an unknown action type returning the same object so React bails out; **non-integer and `NaN` seeks, which this reducer does not reject** |
| The improvement you should volunteer | A `step` action with a `delta` would let the keydown effect drop its `cursor` dependency |
| AlgoViz tie-in | This *is* the shipped reducer — `src/lab/engine.js` lines 80–105 — and it is asserted by the test group "playback keeps final state, pauses on seek and bounds its cursor" |

---

## Exercise 8 · A frame generator

**Question.** *"Write a function that takes an array of numbers and returns a list of snapshots of an insertion sort, where each snapshot shows the array, which indices are being compared, and the running comparison count. Don't mutate the input."*

**Expected approach.** Wrap values into identified objects, clone on every push, push a frame before each decision and after each mutation.

```js
function recordInsertionSort(raw) {
  const arr = raw.map((val, i) => ({ id: `block-${i}`, val }));
  const frames = [];
  const sortedIndices = [];
  let comps = 0;

  const snap = (active, code, msg, sorted = []) => ({
    array: arr.map((it) => ({ ...it })),   // fresh element objects
    activeIndices: active,
    sortedIndices: [...sorted],
    codeLine: code,
    currentStats: { comps },               // clone the counters
    msg,
  });

  frames.push(snap([], "start", "Ready."));
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0) {
      comps++;
      frames.push(snap([j, j - 1], "compare",
        `Comparing ${arr[j].val} with ${arr[j - 1].val}.`));
      if (arr[j].val < arr[j - 1].val) {
        [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
        frames.push(snap([j, j - 1], "swap", "Shifted."));
        j--;
      } else {
        frames.push(snap([j, j - 1], "break", "In position."));
        break;
      }
    }
    sortedIndices.push(i);
    frames.push(snap([], "drop", "Dropped.", [...sortedIndices]));
  }
  return frames;
}
```

| Aspect | Answer |
| --- | --- |
| The four requirements | (1) fresh array on every push; (2) fresh counter object on every push; (3) indices as metadata, since intent is not recoverable from data; (4) the input untouched |
| Missing from this skeleton | The terminal frame with all indices sorted, and `passes`/`swaps` counters. Both are easy additions and mentioning them shows you know the contract |
| Complexity | O(frames × n) time and space — for an O(n²) sort with per-step cloning that is conceptually O(n³) storage |
| The insight to state | **"The frames must be independent. If I reused one array, every frame would show the final state, because they would all point at the same object."** |
| AlgoViz tie-in | This mirrors `generateInsertionSort` exactly, including the `break` frame — except the shipped version also carries `isLifting`, and it swaps rather than shifts |

---

## Exercise 9 · The input parser

**Question.** *"Write a function that turns `' 38, 66, 12 '` into `[38, 66, 12]`, rejecting anything that isn't 2 to 24 whole numbers between −999 and 999. Give me the error messages."*

```js
function parseInput(text) {
  if (typeof text !== "string" || !text.trim())
    throw new Error("Enter 2–24 integers, separated by commas.");

  const parts = text.split(",");
  if (parts.length < 2 || parts.length > 24)
    throw new Error("Use 2–24 values. Small inputs keep every operation inspectable.");

  if (parts.some((p) => !/^-?\d+$/.test(p.trim())))
    throw new Error("Use whole numbers separated by commas. Empty values are not allowed.");

  const values = parts.map(Number);
  if (values.some((n) => !Number.isSafeInteger(n) || Math.abs(n) > 999))
    throw new Error("Each number must be between −999 and 999.");

  return values;
}
```

| Aspect | Answer |
| --- | --- |
| Why regex first | `Number("")` is 0, `Number("1e3")` is 1000, `Number("0x10")` is 16, `Number("Infinity")` is `Infinity`. Coercion accepts all of them silently; an anchored regex states the grammar |
| Why `.trim()` in the test | `" 66 "` must be accepted; the regex is anchored so the whitespace has to be removed first |
| Why split before counting | So `"1,,2"` counts as three parts and fails the regex — a shorter, clearer failure than a special-case check |
| Edge cases to mention | `""`, `" "`, `"1"` (too few), `"1,2.5"`, `"1,,2"`, `"1,"`, 25 values, `"1,1000"`, `"1,Infinity"`, `"-0"` (parses to `-0`, which `Number.isSafeInteger` accepts — a genuine curiosity), and `"007"` (accepted, becomes 7) |
| AlgoViz tie-in | This is `parseInput` verbatim, and the same seven rejection cases are asserted in the test file |

---

## Exercise 10 · JSON validation

**Question.** *"You receive a JSON file from a user. You expect `{version: 1, algorithm: string, input: number[], cursor: number}`. Write the validation. Assume you must not trust anything."*

```js
const ALGORITHMS = { bubble: 1, selection: 1, insertion: 1, merge: 1, quick: 1, heap: 1 };
const MAX_BYTES = 16384;

function loadExperiment(rawText) {
  if (rawText.length > MAX_BYTES) throw new Error("File is too large.");

  let data;
  try { data = JSON.parse(rawText); }
  catch { throw new Error("This file is not valid JSON."); }

  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Not a supported AlgoViz experiment.");

  if (data.version !== 1) throw new Error("Unsupported experiment version.");

  // prototype-safe: Object.hasOwn, never `in` and never a bare lookup
  if (typeof data.algorithm !== "string" || !Object.hasOwn(ALGORITHMS, data.algorithm))
    throw new Error("Unknown algorithm in this experiment.");

  if (!Array.isArray(data.input) || data.input.some((v) => typeof v !== "number"))
    throw new Error("The experiment input must be an array of numbers.");

  const values = parseInput(data.input.join(","));   // reuse the one validator

  const cursor = Number.isInteger(data.cursor) && data.cursor >= 0 ? data.cursor : 0;

  return { version: 1, algorithm: data.algorithm, input: values, cursor };
}
```

| Aspect | Answer |
| --- | --- |
| Ordering of gates | Cheapest and most specific first: size → parse → shape → version → algorithm → input type → value rules → cursor |
| The critical security detail | `Object.hasOwn(ALGORITHMS, data.algorithm)`. `'constructor' in ALGORITHMS` is `true` because `in` walks the prototype chain, so a crafted file could reach a prototype function |
| The design principle | Reuse `parseInput` for the values. One validator means the file format cannot drift from what the UI accepts |
| What it still does not do | Allowlist the fields (extra keys pass silently); bound nesting depth; validate `cursor` against the trace length (the reducer clamps it); or verify a signature |
| AlgoViz tie-in | This mirrors `importExperiment`, with one difference: the app's version is slightly *more* permissive, because it checks only `Array.isArray(data.input)` and then relies on `join(",")` to coerce — so `[[1,2],[3,4]]` imports as `[1,2,3,4]`. Say that if asked "is your validation strict?" |

---

## Exercise 11 · The sliding window, and its precondition

**Question.** *"Find the length of the shortest contiguous subarray whose sum is at least a target on positive integers. Then tell me what breaks if I allow negatives."*

```js
function shortestAtLeast(nums, target) {
  if (target <= 0 || !nums.length || nums.some((n) => n <= 0)) {
    throw new Error("Requires positive values and a positive target.");
  }
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];                        // expand
    while (sum >= target) {                    // shrink while it still qualifies
      best = Math.min(best, right - left + 1);
      sum -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}
```

| Aspect | Answer |
| --- | --- |
| Time | **O(n)** — each pointer moves forward at most n times — versus O(n²) brute force |
| Space | O(1) |
| Why positivity is required | It guarantees monotonicity: expanding can only increase the sum and shrinking can only decrease it, so the walk is monotone. The `while` loop's exit is then a proof that no shorter window ending at `right` qualifies |
| With a negative value | The monotonicity is lost. Measured against the project's implementation: `[-1, 3, 2]` with target 3 returns **2** where the true answer is **1**; `[1, -1, 1, 1]` with target 2 returns **4** where the true answer is **2** |
| The correct fix for negatives | The sliding window does not apply. Either use prefix sums with a monotonic deque, or brute force; the simplest correct approach is O(n²) enumeration, or a different technique entirely |
| AlgoViz tie-in | The precondition is enforced in `generateWindow`, disclosed on the Counterexample page, and stated in the README — three places for one assumption. The `windowTrace` reference function, by contrast, has no guard, which is a real inconsistency. |

:::must The closing line that ties every exercise back to the project
"This project's exercises are unusual in one way: for most of them I can show you the code in the repository, the trace it produces, and the test that pins it. All six sorts, the reducer, the parser and the JSON validation are shipped and asserted; the generator exercise is the shape that all six of mine follow. So if you want to see any of these running rather than on a whiteboard, I can open the file."
:::

:::check Red-line drills for Part XXX
- [ ] Write all six sorts from memory in under twelve minutes total.
- [ ] Write the reducer including the `default` branch.
- [ ] Write `parseInput` with its four error messages.
- [ ] Write a frame-generating function that clones on every push and explain why.
- [ ] Explain the sliding window's monotonicity requirement and the negative-input failure with a concrete example.
- [ ] State the five-step whiteboard protocol and follow it in a mock session.
:::
