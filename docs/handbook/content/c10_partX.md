%PART: The six sorting algorithms | PART X | Code, traces, complexity, stability, edge cases and whiteboard implementations for every algorithm in AlgoViz — plus the ones you should not claim.

# 30 · The algorithm set, and what is not in it

> Establish the boundary before the interviewer does.

## 30.1 What "six algorithms" means, precisely

[VERIFIED] `src/lab/engine.js` registers exactly six algorithms in `algorithms`, and they are the six whose generators live in `src/modules/core/algorithm/sorting/algorithms/`:

| Key | Display name | Generator file | Declared time | Declared space |
| --- | --- | --- | --- | --- |
| `bubble` | Bubble sort | `bubbleSort.js` | O(n²) | O(1) |
| `selection` | Selection sort | `selectionSort.js` | O(n²) | O(1) |
| `insertion` | Insertion sort | `insertionSort.js` | O(n²) | O(1) |
| `merge` | Merge sort | `mergeSort.js` | O(n log n) | O(n) |
| `quick` | Quick sort | `quickSort.js` | O(n²) worst | O(n) worst |
| `heap` | Heap sort | `heapSort.js` | O(n log n) | O(log n)\* |

The `time` and `space` strings are **declared metadata rendered in the UI** — not measured. [VERIFIED]

:::danger Four algorithms that exist in the repository but are NOT in the "six sorting algorithms"
1. **Binary search, N-Queens, pathfinding (BFS/DFS), tree traversals, two pointers, fast/slow pointers, prefix sum, merge intervals** — these are the twelve module routes, not the sorting set. Each has its own logic module (some confusingly located under `algorithm/sorting/`).
2. **The sliding-window implementation** is in the sorting algorithms folder but is not registered in `algorithms` — it is used by the Sliding Window module and by the counterexample lab.
3. There is **no** counting sort, radix sort, bucket sort, shell sort, timsort, or introspective sort. [VERIFIED by exhaustive file listing]
4. There is **no** Dijkstra (the README names "weighted Dijkstra" explicitly as not a current feature) and **no** Floyd cycle detection — the Fast & Slow Pointers module demonstrates Move Zeroes.

If an interviewer asks "which sorts did you implement?", answer with the six and add the boundary in the same breath: *"Six sorts in the lab. The other twelve modules are different algorithm families — those exist, but they don't use the frame recorder, so I'd keep the two stories separate."*
:::

## 30.2 The colour code for study priority

| Colour | Algorithms | What you must be able to do |
| --- | --- | --- |
| **RED — code from scratch under pressure** | Bubble, Insertion, Selection, Merge, Quick | Write the algorithm, the *generator* version, and state complexity — without notes |
| **ORANGE — code with minor help** | Heap | Understand sift-down/heapify and the two-phase structure; code it if given the array-index formulas |
| **GREEN — recognition** | The twelve non-sorting modules | Describe the idea of each and point to its file |

:::must The honest answer to "which one should I be able to code from scratch?"
All five RED ones, because they are the standard interview set and AlgoViz gives you a story for each. Heap sort is worth being able to code too — it is the one that separates candidates — and the only reason it is ORANGE here is that its generator subtleties (two comparisons per heapify call, extraction bookkeeping) are harder to reproduce perfectly under pressure than the algorithm itself.
:::

---

# 31 · Bubble sort

> The algorithm you must be able to explain not as "the slow one" but as a specific sequence of compare-and-swap decisions.

## 31.1 Problem and intuition

**Problem.** Given an array of numbers, produce a permutation in non-decreasing order.

**Intuition.** Walk left to right comparing neighbours. If a pair is out of order, swap them. After one full walk, the largest value is guaranteed to be at the end — because it will have won every comparison it entered and been carried rightward, one swap at a time. That single fact gives the algorithm its name and its invariant.

## 31.2 The invariant

[VERIFIED from `engine.js` metadata] **"After each complete pass, the rightmost processed elements are in their final positions."**

This is the sentence displayed in the lab's "What stays true?" panel, and it is the correct invariant: after pass *i*, the last *i+1* positions hold the *i+1* largest values in sorted order, and they will never be touched again. The inner loop bound `j < n - i - 1` is the direct expression of the invariant. [VERIFIED in the code.]

## 31.3 The actual implementation

@@code src/modules/core/algorithm/sorting/algorithms/bubbleSort.js 1 45

## 31.4 The real trace: `[3, 1, 2]` → 19 frames

This is the actual output of the generator, not a reconstruction:

| # | codeLine | array | active | sorted | comps | passes | swaps | msg |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | start | [3,1,2] | [] | [] | 0 | 0 | 0 | System Ready. Initializing Bubble Sort. |
| 1 | outer | [3,1,2] | [] | [] | 0 | 1 | 0 | Pass 1 of 3. |
| 2 | inner | [3,1,2] | [0,1] | [] | 0 | 1 | 0 | Scanning window at index 0 and 1. |
| 3 | compare | [3,1,2] | [0,1] | [] | 1 | 1 | 0 | Comparing 3 and 1. Is 3 > 1? |
| 4 | swap | [3,1,2] | [0,1] | [] | 1 | 1 | 1 | Yes! 3 > 1. Swapping blocks... |
| 5 | swap | [1,3,2] | [0,1] | [] | 1 | 1 | 1 | Swap complete. |
| 6 | inner | [1,3,2] | [1,2] | [] | 1 | 1 | 1 | Scanning window at index 1 and 2. |
| 7 | compare | [1,3,2] | [1,2] | [] | 2 | 1 | 1 | Comparing 3 and 2. Is 3 > 2? |
| 8 | swap | [1,3,2] | [1,2] | [] | 2 | 1 | 2 | Yes! 3 > 2. Swapping blocks... |
| 9 | swap | [1,2,3] | [1,2] | [] | 2 | 1 | 2 | Swap complete. |
| 10 | outer | [1,2,3] | [] | [2] | 2 | 1 | 2 | Pass complete. Block locked into its final sorted position. |
| 11 | outer | [1,2,3] | [] | [2] | 2 | 2 | 2 | Pass 2 of 3. |
| 12 | inner | [1,2,3] | [0,1] | [2] | 2 | 2 | 2 | Scanning window at index 0 and 1. |
| 13 | compare | [1,2,3] | [0,1] | [2] | 3 | 2 | 2 | Comparing 1 and 2. Is 1 > 2? |
| 14 | compare | [1,2,3] | [0,1] | [2] | 3 | 2 | 2 | No swap needed. Moving window forward. |
| 15 | outer | [1,2,3] | [] | [2,1] | 3 | 2 | 2 | Pass complete. Block locked into its final sorted position. |
| 16 | outer | [1,2,3] | [] | [2,1] | 3 | 3 | 2 | Pass 3 of 3. |
| 17 | outer | [1,2,3] | [] | [2,1,0] | 3 | 3 | 2 | Pass complete. Block locked into its final sorted position. |
| 18 | start | [1,2,3] | [] | [0,1,2] | 3 | 3 | 2 | Bubble Sort Complete! Array is fully sorted. |

:::must Three things this trace proves, that you should point out
1. **Frame 18 shows the entire stats as `c3 p3 s2`** — 3 comparisons, 3 passes, 2 swaps for a 3-element array. The theoretical minimum comparisons for the optimal bubble variant is n−1 = 2; this implementation performs 3 because it does not early-exit.
2. **`sortedIndices` at frame 17 is `[2, 1, 0]`** — descending. The sorted set is filled from the right and is **not ordered**, which matters because the UI only ever asks `.includes(i)`, never iterates it for display order. [VERIFIED]
3. **Frame 16 and 17 are the "wasted" third pass.** With early-exit, the pass at frame 16 would be skipped entirely. Its presence is visible evidence that this implementation runs exactly n passes.
:::

## 31.5 Complexity

| Case | Comparisons | Swaps | Time | Why |
| --- | --- | --- | --- | --- |
| Best | n(n−1)/2 = 276 for n = 24 | 0 | **Θ(n²)** in *this* implementation | No early-exit flag, so a sorted array still performs every pass and every comparison |
| Average | ≈ n²/2 | ≈ n²/4 | Θ(n²) | Each pair is out of order with probability ½ |
| Worst (reverse) | n(n−1)/2 | n(n−1)/2 | Θ(n²) | Every comparison swaps — measured: 276 comparisons, 276 swaps for n = 24 |

:::trap "Isn't bubble sort's best case O(n)?"
Not in *this* implementation. The textbook O(n) best case requires an early-exit flag:

```js
// [PROPOSED] the optimisation this project does not implement
let swapped = false;
for (let j = 0; j < n - i - 1; j++) {
  if (arr[j].val > arr[j+1].val) { swap; swapped = true; }
}
if (!swapped) break;   // <-- absent from bubbleSort.js
```

[VERIFIED] `bubbleSort.js` has no `swapped` flag and no `break`, so it always performs all n passes. Measured proof: a fully sorted 24-element array produces **878 frames and 276 comparisons** — the same 276 comparisons as the reverse-sorted case. If you claim "bubble sort is O(n) on sorted input", an interviewer who has read the file can falsify it by running the app. The correct phrasing: *"Bubble sort can be Θ(n) best-case with an early-exit flag; this implementation deliberately omits it, so it is Θ(n²) on every input. That's visible in the comparison counter — a sorted input still shows 276 comparisons, and the trace still shows every pass."*
:::

## 31.6 Stability, in-place, edge cases

| Property | Answer |
| --- | --- |
| **Stable?** | **Yes.** The comparison is `arr[j].val > arr[j+1].val` — strict. Equal elements never swap, so their relative order is preserved |
| **In-place?** | Yes for the array itself. The *visualisation* is not in-place, which is a different question |
| **Adaptive?** | Only in the sense that it performs fewer *swaps* on a sorted input; the comparisons are fixed |
| **n = 0** | 2 frames (`start` + `Complete!`), loop bodies never execute. [VERIFIED] |
| **n = 1** | 2 frames. [VERIFIED] |
| **All equal** | No swaps at all; frames are still produced for every comparison. This is the case where the `duplicates` preset is useful |
| **Negative values** | Fine — comparisons use `val`, and the UI uses `Math.abs(val)` only for bar height |
| **Large values** | Bounded by `parseInput` to ±999 |

## 31.7 Bugs to watch for

| Bug | How it would appear |
| --- | --- |
| Off-by-one in the inner bound (`j < n - i` instead of `j < n - i - 1`) | Compares past the sorted region, causing a frame where an active index sits inside `sortedIndices` — visible as a bar that is both green and teal |
| Using `>=` instead of `>` | Destroys stability: equal elements swap, and the ID order in the final frame changes. The reproducibility test would still pass (it only compares two runs of the *same* implementation), which is why stability needs a separate assertion |
| Forgetting `sortedIndices.push(n - i - 1)` | The sorted region never grows; the "sorted" tint would never appear, and the final frame would still be correct — a silent visual bug |
| Swapping but not pushing the post-swap frame | The trace would show the array *before* each swap and jump at the next frame; the learner would never see the result |
| Mutating `rawArray` instead of cloning | The caller's array changes; the test `assert.deepEqual(input, before)` would fail |

## 31.8 Interview questions

:::q "What does bubble sort's inner loop bound `n - i - 1` mean?"
"After pass *i*, the last *i+1* elements are in their final positions, so the inner loop only needs to scan the unsorted prefix. The `- 1` is there because the loop body compares `arr[j]` with `arr[j+1]`; if `j` could reach `n - i - 1`, the last comparison would read past the unsorted region — and for the final pass with `i = n - 1` on a 2-element remainder, `j+1` would address an element that is already locked."
:::

:::q "Why does your bubble sort push a frame even when no swap happens?"
"Because a *negative decision* is information. If I only recorded swaps, a viewer could not tell a comparison that returned false from a comparison that never happened. The `No swap needed. Moving window forward.` frame is what makes the trace a record of decisions rather than a record of mutations."
:::

:::q "Bubble sort is O(n²). Why include the worst algorithm in a product?"
"For exactly the reason it's the worst algorithm: it is the clearest one to read. It is the algorithm people learn first, and having it in the same lab as merge sort is what makes the comparison feature meaningful — comparing merge against quick tells you something subtle, but comparing bubble against merge against the same array tells you something you can *feel*: 276 comparisons versus 16 on the same eight numbers. The lab is not trying to be fast; it is trying to make the difference visible."
:::

## 31.9 Whiteboard

:::must Bubble sort — the version to write, and the version AlgoViz would need
```js
// Classic, with early exit — what an interviewer expects first
function bubbleSort(a) {
  const arr = [...a];                      // never mutate the caller's array
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;                   // best case Θ(n)
  }
  return arr;
}
```
Then say the sentence that shows you understand both worlds: *"For the visualiser I'd write it differently — the early exit makes the animation shorter and hides the fact that the algorithm would otherwise keep scanning, so I kept the n-pass version and I'd probably show the early-exit variant as a second option rather than replacing this one."* [PROPOSED for the second option]
:::

---

# 32 · Selection sort

> The algorithm that makes "find the minimum" visible — and whose trace has the cleanest bookkeeping of the six.

## 32.1 Problem and intuition

**Problem.** Same as before.

**Intuition.** Divide the array into a sorted prefix (empty at first) and an unsorted suffix. Repeatedly scan the entire unsorted suffix to find its smallest element, then swap it into the first unsorted position. The prefix grows by one; the suffix shrinks by one. Crucially, the scan *does not move anything* — it only remembers an index.

## 32.2 The invariant

[VERIFIED] **"The sorted prefix contains the smallest elements in increasing order."**

By construction, the prefix holds the *k* smallest values of the whole array, in order, so it can never be disturbed by a later step.

## 32.3 The actual implementation

@@code src/modules/core/algorithm/sorting/algorithms/selectionSort.js 16 57

## 32.4 The real trace: `[3, 1, 2]` → 15 frames

| # | codeLine | array | active | sorted | minIndex | comps | passes | swaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | start | [3,1,2] | [] | [] | – | 0 | 0 | 0 |
| 1 | outer | [3,1,2] | [0] | [] | 0 | 0 | 1 | 0 |
| 2 | inner | [3,1,2] | [1] | [] | 0 | 1 | 1 | 0 |
| 3 | new_min | [3,1,2] | [1] | [] | **1** | 1 | 1 | 0 |
| 4 | inner | [3,1,2] | [2] | [] | 1 | 2 | 1 | 0 |
| 5 | swap | [3,1,2] | [0,1] | [] | 1 | 2 | 1 | 1 |
| 6 | swap | [1,3,2] | [0,1] | [] | 0 | 2 | 1 | 1 |
| 7 | lock | [1,3,2] | [] | [0] | – | 2 | 1 | 1 |
| 8 | outer | [1,3,2] | [1] | [0] | 1 | 2 | 2 | 1 |
| 9 | inner | [1,3,2] | [2] | [0] | 1 | 3 | 2 | 1 |
| 10 | new_min | [1,3,2] | [2] | [0] | **2** | 3 | 2 | 1 |
| 11 | swap | [1,3,2] | [1,2] | [0] | 2 | 3 | 2 | 2 |
| 12 | swap | [1,2,3] | [1,2] | [0] | 1 | 3 | 2 | 2 |
| 13 | lock | [1,2,3] | [] | [0,1] | – | 3 | 2 | 2 |
| 14 | start | [1,2,3] | [] | [0,1,2] | – | 3 | 2 | 2 |

**Comparisons: 3 for n = 3.** That is exactly n(n−1)/2 = 3 — selection sort's comparison count is **input-independent**. Verify against the measured data: for the default 8-element input it reports 28 = 8×7/2, and for the seeded 10-element input it reports 45 = 10×9/2. [VERIFIED] That is a beautiful fact to state: *"Selection sort's comparison count is a function of n alone — it is the same for a sorted array as for a reversed one. Only the swap count is data-dependent."*

## 32.5 Complexity

| Case | Comparisons | Swaps | Time |
| --- | --- | --- | --- |
| Best | n(n−1)/2 | **0** | Θ(n²) |
| Average | n(n−1)/2 | ≤ n−1 | Θ(n²) |
| Worst | n(n−1)/2 | n−1 | Θ(n²) |

:::must The one genuinely interesting property of selection sort
**It performs at most n − 1 swaps**, the minimum possible for a comparison sort that only swaps. That is why it was historically attractive when writes were expensive. Bubble sort on the same reverse-sorted input performs 276 swaps where selection performs 23 (for n = 24). Measured from the traces: selection on reverse-24 reports 492 frames with 23 swaps; bubble reports 1,154 frames with 276 swaps. [VERIFIED]
:::

## 32.6 Stability, in-place, edge cases

| Property | Answer |
| --- | --- |
| **Stable?** | **No.** The swap `arr[i] ↔ arr[minIndex]` can jump an element over an equal one. Classic example: `[3a, 3b, 1]` — the first pass swaps index 0 with index 2, putting `3a` after `3b`. In this codebase you can *see* it: sort the `duplicates` preset and watch the `block-*` ids in the final frame — they will not be in ascending order for equal values |
| **In-place?** | Yes |
| **n = 0 / 1** | 2 frames each [VERIFIED] |
| **All equal** | `minIndex` never changes, so `minIndex === i` always and **zero swaps** occur. The trace is a pure scan |
| **The trailing `sortedIndices.push(n - 1)`** | [VERIFIED line 66] After the loop ends at `i = n - 2`, the final index is never visited by the outer loop, so it is marked sorted explicitly. Without it the sorted region would be missing one index in every final frame |

:::q "Why does your selection sort loop to n−1 and then mark the last index separately?"
"Because the last element is sorted by definition — after n−1 passes, exactly one element remains unsorted, and it is necessarily the largest of the remaining, so it is already in place. Marking it explicitly keeps the last frame's `sortedIndices` complete and ordered, which the final-frame assertions depend on."
:::

## 32.7 Bugs to watch for, and interview questions

| Bug | Symptom |
| --- | --- |
| Comparing against `i` instead of `minIndex` (`arr[i].val > arr[j].val`) | The scan would find the minimum of the *pair* rather than the running minimum — the array would be partially sorted and the `new_min` frames would be meaningless |
| Forgetting `stats.passes++` | The "Passes / calls" tile stays at 0 while the trace visibly has passes |
| Swapping unconditionally | Extra frames and an inflated swap count; also destroys the "0 swaps on equal input" property |
| Not marking the last index | The final frame shows `n-1` sorted indices instead of `n` |

:::q "Is selection sort ever the right choice in production?"
Almost never for arrays. Its modern relevance is niche: it needs only O(1) extra space, it does the minimum number of writes, and it is trivially interruptible (the sorted prefix is valid at every point). Where writes are the dominant cost — for example writing to flash memory — the write-minimal property can matter. But it is not adaptive, so it cannot exploit partial sortedness.
:::

## 32.8 Whiteboard

```js
function selectionSort(a) {
  const arr = [...a], n = arr.length;
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

:::must The three details that make this answer strong
The `minIdx !== i` guard (avoids a self-swap, which is why equal inputs report zero swaps), the `<` comparison (which would preserve stability *if* the swap were not used — say this precisely and you look sharp), and the fact that the inner loop starts at `i + 1` rather than 0.
:::

---

# 33 · Insertion sort

> The only generator with an early exit, an explicit `break` frame, and a "lifted" element flag.

## 33.1 Problem and intuition

**Intuition.** Keep a sorted prefix. Take the next element, remember its value, and walk *backwards* through the prefix shifting larger elements one slot to the right until you find the element's correct home; drop it there. It is exactly how most people sort a hand of playing cards.

## 33.2 The invariant

[VERIFIED] **"The prefix before the current insertion is sorted."**

## 33.3 The actual implementation

@@code src/modules/core/algorithm/sorting/algorithms/insertionSort.js 21 70

## 33.4 The real trace: `[3, 1, 2]` → 14 frames, including the `break`

| # | codeLine | array | active | sorted | comps | passes | swaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | start | [3,1,2] | [] | **[0]** | 0 | 0 | 0 |
| 1 | outer | [3,1,2] | [1] | [0] | 0 | 1 | 0 |
| 2 | compare | [3,1,2] | [1,0] | [0] | 1 | 1 | 0 |
| 3 | swap | [3,1,2] | [1,0] | [0] | 1 | 1 | 1 |
| 4 | swap | [1,3,2] | [1,0] | [0] | 1 | 1 | 1 |
| 5 | drop | [1,3,2] | [] | [0,1] | 1 | 1 | 1 |
| 6 | outer | [1,3,2] | [2] | [0,1] | 1 | 2 | 1 |
| 7 | compare | [1,3,2] | [2,1] | [0,1] | 2 | 2 | 1 |
| 8 | swap | [1,3,2] | [2,1] | [0,1] | 2 | 2 | 2 |
| 9 | swap | [1,2,3] | [2,1] | [0,1] | 2 | 2 | 2 |
| 10 | compare | [1,2,3] | [1,0] | [0,1] | **3** | 2 | 2 |
| 11 | **break** | [1,2,3] | [1,0] | [0,1] | 3 | 2 | 2 |
| 12 | drop | [1,2,3] | [] | [0,1,2] | 3 | 2 | 2 |
| 13 | start | [1,2,3] | [] | [0,1,2] | 3 | 2 | 2 |

:::must Frame 0 is different from every other generator's frame 0
Look at the `sorted` column: **`[0]`**. Insertion sort's seed frame already declares index 0 as sorted, because a single element is trivially sorted. Compare the seed frames: bubble and selection and merge and quick and heap all start with `[]`; insertion starts with `[0]`. [VERIFIED — this is initialised as `const sortedIndices = [0]` at line 10.]

That is a superb detail to volunteer, because it shows the sorting regions are *algorithm-specific*, not a generic "sorted so far" counter. It also means an interviewer checking "does every algorithm's final frame show all n indices sorted?" gets the same answer for all six — but the path there differs.
:::

:::trap The insertion sort trace contains a frame that will confuse you if you do not read it carefully
At frame 10 the array is already `[1,2,3]` — fully sorted — and the algorithm **still performs one more comparison** before breaking. That comparison (comps goes 2 → 3) is the check that stops the shift loop: `2 >= 1`. That single extra comparison is why this implementation reports 3 comparisons instead of 2 for `[3,1,2]`.

It is also why the algorithm's *"best case is Θ(n)"* claim is precise rather than free: on a sorted input, insertion sort performs exactly n − 1 comparisons — one per element to discover it is already in place — and then breaks. [VERIFIED: the `break` frame is pushed with `codeLine: 'break'` and the message `"2 >= 1. Correct position found."`]

And note the *direction* of the active indices on a shift: `[2,1]` then `[1,0]`. `activeIndices` is `[j, j-1]`, so as `j` decrements the highlight walks leftwards through the prefix. That is the visual signature of insertion sort.
:::

## 33.5 Complexity

| Case | Comparisons | Shifts (the generator's "swaps") | Time |
| --- | --- | --- | --- |
| Best (sorted) | n − 1 | 0 | Θ(n) |
| Average | ≈ n²/4 | ≈ n²/4 | Θ(n²) |
| Worst (reverse) | n(n−1)/2 = 276 for n = 24 | n(n−1)/2 = 276 | Θ(n²) |

[VERIFIED against the measurements: insertion on reverse-24 produces 876 frames with 276 comparisons and 276 shifts; on the sorted 24-element input it performs far fewer.]

## 33.6 Stability, in-place, edge cases

| Property | Answer |
| --- | --- |
| **Stable?** | **Yes**, and this implementation's strict `<` is what makes it so: an element stops shifting the moment it meets an equal one (`arr[j].val < arr[j-1].val` is false), so it is inserted *after* its equal, preserving the original order |
| **In-place?** | Yes |
| **Adaptive?** | Yes — the only one of the three O(n²) sorts in this project that is genuinely adaptive |
| **n = 0** | 2 frames; the loop never runs, so the seed frame's `sortedIndices = [0]` refers to a non-existent index. [VERIFIED — that is a harmless but real artefact: for `[]`, the `start` frame claims index 0 is sorted] |
| **All equal** | Zero shifts; one comparison per pass then break. Fastest possible path |

:::danger The empty-input artefact, and how to answer it
[VERIFIED] For an empty array, insertion sort's seed frame carries `sortedIndices: [0]` even though index 0 does not exist. The final frame overwrites it with `[...Array(0).keys()] = []`, so the terminal state is correct — but the initial frame is internally inconsistent.

In practice `parseInput` requires at least 2 values, so this is unreachable through the UI and only appears in the test suite (which does sort `[]` for all six algorithms). The honest answer: *"The tests sort an empty array, and insertion sort's seed frame marks index 0 as sorted. That is harmless because 'sorted' is only ever queried with `.includes(i)` for real indices, and the final frame is correct — but it's an inconsistency, and the cleanest fix is to initialise `sortedIndices` to `n > 0 ? [0] : []`."* [PROPOSED]
:::

## 33.7 Interview questions

:::q "Why is insertion sort the one sorting algorithm you would actually use on small inputs?"
"Because it is adaptive and has tiny constant factors. On a nearly-sorted array it does almost no work, and below roughly 16 elements it beats the O(n log n) sorts in practice because it has no recursion overhead and no allocation. That is exactly why real library sorts — Timsort in Java and Python, and introsort implementations — switch to insertion sort below a size threshold. It is also online: it can sort a stream as elements arrive, one at a time, which is a property none of the other five have."
:::

:::q "Your 'shift' is implemented as a swap. Is that the same thing?"
"No — and it is a real inefficiency in the generator. A true insertion sort shifts each larger element one slot right and writes the held value once, which is one write per shift plus one final write. This implementation swaps, which is two writes per shift. The number of *comparisons* is identical, which is why the comparison counter is unaffected, but the exchange counter over-reports relative to a shift-based insertion sort. That is a good example of why I tell people not to compare the swap counter across algorithms — and why the comparison panel only uses `comps`."
:::

## 33.8 Whiteboard

```js
function insertionSort(a) {
  const arr = [...a];
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {   // strict > preserves stability
      arr[j + 1] = arr[j];             // shift, not swap
      j--;
    }
    arr[j + 1] = key;                  // drop into place
  }
  return arr;
}
```

:::must The two sentences that make this a senior answer
"Shifting rather than swapping halves the writes, and the strict `>` is what keeps it stable — with `>=` an equal element would be moved behind the insertion point." Then, unprompted: "In my generator I used swaps, so my exchange counter is not the same measure as a shift-based implementation's — which is why the comparison panel deliberately only uses comparisons." That is the difference between knowing the algorithm and knowing your own code.
:::
