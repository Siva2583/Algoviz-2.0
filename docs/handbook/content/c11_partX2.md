# 34 · Merge sort

> The only recursive divide-and-conquer sort with an explicit buffer, and the source of the one genuine bug in the frame model.

## 34.1 Problem and intuition

**Intuition.** Sorting a whole array is hard; merging two *already sorted* arrays is easy — repeatedly take the smaller front element. So split the array in half, sort each half (recursively), then merge. The recursion bottoms out at single elements, which are sorted by definition.

## 34.2 The invariant

[VERIFIED] **"Each merge consumes two sorted ranges and produces a sorted range."**

## 34.3 The actual implementation

@@code src/modules/core/algorithm/sorting/algorithms/mergeSort.js 21 67

@@code src/modules/core/algorithm/sorting/algorithms/mergeSort.js 69 122

## 34.4 The real trace: `[3, 1, 2]` → 30 frames

| # | codeLine | array | active | sorted | range | comps | swaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | start | [3,1,2] | [] | [] | [] | 0 | 0 |
| 1 | start | [3,1,2] | [] | [] | [0,2] | 0 | 0 |
| 2 | mid | [3,1,2] | [1] | [] | [0,2] | 0 | 0 |
| 3 | recurse_left | [3,1,2] | [] | [] | [0,1] | 0 | 0 |
| 4 | start | [3,1,2] | [] | [] | [0,1] | 0 | 0 |
| 5 | mid | [3,1,2] | [0] | [] | [0,1] | 0 | 0 |
| 6 | recurse_left | [3,1,2] | [] | [] | [0,0] | 0 | 0 |
| 7 | start | [3,1,2] | [] | [] | [0,0] | 0 | 0 |
| 8 | base_case | [3,1,2] | [] | [] | [0,0] | 0 | 0 |
| 9 | recurse_right | [3,1,2] | [] | [] | [1,1] | 0 | 0 |
| 10 | start | [3,1,2] | [] | [] | [1,1] | 0 | 0 |
| 11 | base_case | [3,1,2] | [] | [] | [1,1] | 0 | 0 |
| 12 | merge_call | [3,1,2] | [] | [] | [0,1] | 0 | 0 |
| 13 | buffer | [3,1,2] | [] | [] | [0,1] | 0 | 0 |
| 14 | compare | [3,1,2] | [0,1] | [] | [0,1] | 1 | 0 |
| 15 | write_right | **[1,1,2]** | [0] | [] | [0,1] | 1 | 1 |
| 16 | write_rem | [1,1,2] | [] | [] | [0,1] | 1 | 1 |
| 17 | write_rem | [1,3,2] | [1] | [] | [0,1] | 1 | 2 |
| 18–20 | recurse_right → base_case | [1,3,2] | [] | [] | [2,2] | 1 | 2 |
| 21 | merge_call | [1,3,2] | [] | [] | [0,2] | 1 | 2 |
| 22 | buffer | [1,3,2] | [] | [] | [0,2] | 1 | 2 |
| 23 | compare | [1,3,2] | [0,2] | [] | [0,2] | 2 | 2 |
| 24 | write_left | [1,3,2] | [0] | [] | [0,2] | 2 | 3 |
| 25 | compare | [1,3,2] | [1,2] | [] | [0,2] | 3 | 3 |
| 26 | write_right | **[1,2,2]** | [1] | [] | [0,2] | 3 | 4 |
| 27 | write_rem | [1,2,2] | [] | [] | [0,2] | 3 | 4 |
| 28 | write_rem | [1,2,3] | [2] | [] | [0,2] | 3 | 5 |
| 29 | start | [1,2,3] | [] | **[0,1,2]** | [] | 3 | 5 |

## 34.5 Three things this trace exposes

:::danger 1. Frames 15 and 26 render duplicate element IDs — a real React bug
Look at frame 15: the array renders as `[1,1,2]`. The original `[3,1,2]` had a `3` at index 0; after the merge writes the buffered `1` into slot 0, the array genuinely holds two copies of the value 1 — and, more importantly, **two elements with the same `id`**, because `tempArr` holds shallow clones that preserve `id`.

I measured this across inputs: **23 of the 107 default-input frames** contain a duplicate `id`, and **141 of the 375 frames** for a reverse-sorted 24-element input. `ArrayView` keys its columns by `item.id`, so these are React duplicate-key frames — a warning in development and unspecified reconciliation in production, confined to the transient write-back frames. The final frame is always unique (that is asserted in the test suite).

**The mechanism, stated precisely:** the write-back starts at `k = low` and overwrites slots that still hold the *original* elements, while the source of the written value is a clone sitting in `tempArr`. Until the window is fully rewritten, the same identity exists twice inside `arr`.

**The fixes** (see the script box): make the render key unique per frame (`item.id + ':' + i`), which is safe because every frame is a full snapshot; or re-id the buffered clone at write time. [PROPOSED — not implemented]
:::

:::weak 2. The merge value appears to vanish, and `yOffset` is drawn by nobody in the app
At frame 15 the `3` is not on screen at all — it is sitting in `tempArr`. The generator *knows* this: it sets `yOffset = 80` on every element in the current merge window (lines 70–72) and pushes a `buffer` frame with the message "Pulling elements into temporary O(N) memory buffer." But `ArrayView` never reads `yOffset`, so the buffer is invisible and the animation looks like values are being duplicated and deleted rather than moved through a staging area. (The only file in the repository that *does* read it is `src/modules/core/EfficientSort.jsx`, which has zero importers and is not in the bundle — so the field was designed for a renderer, just not for this one.) Wiring `yOffset` into the bar's `transform: translateY(...)` would make merge sort's animation *correct* with zero engine changes. [PROPOSED]
:::

:::must 3. `sortedIndices` stays empty for the entire merge sort trace
Every frame from 0 to 28 has `sorted: []`. The `sorted` region appears only in the **final** frame, because the only code that fills it is:

```js
if (low === 0 && high === n - 1) {          // the outermost merge only
  for (let i = 0; i < n; i++) sortedIndices.push(i);
}
```

[VERIFIED at lines 159–161] Compare this with the other five: bubble grows its sorted region one index per pass, selection locks one index per pass, insertion adds one per pass, quick locks pivots as partitions complete, heap grows from the right on every extraction. **Merge sort is the only algorithm that shows no partial sortedness on screen.**

Is that a bug? It is defensible — after the first merge of two single elements, positions 0–1 *are* sorted but not *final*, because later merges can move things through them. So marking them would be a lie. The honest framing: *"Merge sort's sorted region is only globally final at the end, so the generator marks it all at once. It's technically correct but it means merge sort's animation carries less information than the other five — the sub-array range is the signal, and that's what `subArrayRange` is for."* [INFERENCE on intent; the code behaviour is VERIFIED]
:::

## 34.6 Complexity

| Case | Comparisons | Writes (the generator's "swaps") | Time | Space |
| --- | --- | --- | --- | --- |
| Best | ≈ (n log n)/2 | n log n | Θ(n log n) | **O(n)** for the buffer |
| Average | Θ(n log n) | n log n | Θ(n log n) | O(n) |
| Worst | Θ(n log n) | n log n | Θ(n log n) | O(n) |

[VERIFIED note on the counter] The generator increments `stats.swaps` on every element written back from the buffer — including the "remaining" elements that need no comparison. For the default 8-element input the trace ends with `swaps: 24` = 8 elements × log₂8 levels × 1 write each. So merge sort's "swaps" is really a **write count**, and comparing it against bubble sort's swap count is comparing two different units. This is exactly what the UI footnote says: *"Legacy generators count exchanges differently; comparison mode deliberately uses comparisons only."* Quote that line in the interview — it is your own documentation defending you.

:::q "Merge sort is O(n log n) in every case. Why does it lose to quick sort in practice?"
"Three reasons. Constant factors: merge does more data movement and allocates a buffer, while partition moves data in place. Cache behaviour: merge's access pattern during a full merge pass is less predictable than quicksort's partition walk over a window. And writes: every element gets written back at every level, whereas a partition only writes the elements that actually move. On the other hand, quicksort's average is only n log n — its worst case is Θ(n²), which merge sort never has. That's why real implementations mix strategies, and why stability pushes you towards merge: it's the stable Θ(n log n) comparison sort."
:::

## 34.7 Stability, edge cases, bugs

| Property | Answer |
| --- | --- |
| **Stable?** | **Yes** — the comparison is `tempArr[leftIdx].val <= tempArr[rightIdx].val`, so on a tie the left element is taken first, preserving original order |
| **In-place?** | No. The generator allocates `tempArr` per merge: O(n) auxiliary. The lab's declared `space: "O(n)"` is accurate |
| **n = 0** | 4 frames: seed, divide `[0,-1]`, base case, final. [VERIFIED] The `low >= high` guard handles the empty and single-element cases |
| **n = 1** | 4 frames, same shape |
| **Recursion depth** | ⌈log₂ n⌉ + 1, so ~5 levels for 24 elements. No stack-risk at this input cap |
| **The duplicate-id bug** | See 34.5. Symptom: React key warning during merge playback, and transient duplicate bars |

:::q "Walk me through the merge function's index arithmetic — why `rightIdx = mid - low + 1`?"
"`tempArr` is a *window-local* copy: index 0 of `tempArr` is element `low` of the array. So the left run occupies `tempArr[0 .. mid-low]` and the right run starts immediately after it, at `tempArr[mid-low+1 .. high-low]`. The loop condition `leftIdx <= mid - low && rightIdx <= high - low` is the same two ranges expressed as inclusive bounds. I use the `actualLeftIdx = low + leftIdx` conversion only to build the `activeIndices` for the frame — the comparison itself works on window-local indices."

That answer demonstrates the one thing interviewers are actually testing with merge sort: do you know the difference between *window-local* and *array-global* indices.
:::

## 34.8 Whiteboard

```js
function mergeSort(a) {
  if (a.length <= 1) return [...a];
  const mid = a.length >> 1;
  const left = mergeSort(a.slice(0, mid));
  const right = mergeSort(a.slice(mid));
  return merge(left, right);
}

function merge(L, R) {
  const out = [];
  let i = 0, j = 0;
  while (i < L.length && j < R.length) {
    out.push(L[i] <= R[j] ? L[i++] : R[j++]);   // <= keeps it stable
  }
  while (i < L.length) out.push(L[i++]);
  while (j < R.length) out.push(R[j++]);
  return out;
}
```

:::must Why AlgoViz's version looks different
The generator does **not** return new arrays — it sorts in place using a buffer, because a frame must show a *single canonical array*, not a tree of sub-arrays. If merge sort returned fresh arrays at each level, there would be no single "current array" to render, and the trace would be a tree rather than a sequence. That is a genuine, defensible engineering reason for deviating from the textbook version, and it is worth saying explicitly: *"I used the in-place-with-buffer variant because the visualisation needs one array whose state can be shown at each moment. The recursive merge-returns-new-array version is easier to read but has no single current state to display."*
:::

---

# 35 · Quick sort

> Lomuto partition with a last-element pivot — the algorithm whose worst case the user can *produce* by pressing the "sorted" preset.

## 35.1 Problem and intuition

**Intuition.** Pick an element and call it the pivot. Rearrange the array so that everything ≤ the pivot is on its left and everything > is on its right. Once that is done, the pivot is in its **final** position — nothing in the rest of the algorithm can move it. Then recurse on the two sides.

The whole algorithm is: *choose, partition, recurse.* Everything hard about quick sort is in the partition, and the choice of pivot.

## 35.2 The invariant

[VERIFIED] **"After partition, the pivot is final; left values are ≤ it and right values are greater."**

## 35.3 The actual implementation

@@code src/modules/core/algorithm/sorting/algorithms/quickSort.js 27 60

@@code src/modules/core/algorithm/sorting/algorithms/quickSort.js 76 122

## 35.4 The real trace: `[3, 1, 2]` → 20 frames

| # | codeLine | array | active | sorted | pivot | range | comps | passes | swaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | start | [3,1,2] | [] | [] | – | [] | 0 | 0 | 0 |
| 1 | start | [3,1,2] | [] | [] | – | [0,2] | 0 | 0 | 0 |
| 2 | partition | [3,1,2] | [] | [] | – | [0,2] | 0 | 1 | 0 |
| 3 | partition | [3,1,2] | [] | [] | **2** | [0,2] | 0 | 1 | 0 |
| 4 | compare | [3,1,2] | [0] | [] | 2 | [0,2] | 1 | 1 | 0 |
| 5 | compare | [3,1,2] | [1] | [] | 2 | [0,2] | 2 | 1 | 0 |
| 6 | swap | [3,1,2] | [0,1] | [] | 2 | [0,2] | 2 | 1 | 1 |
| 7 | swap | [1,3,2] | [0,1] | [] | 2 | [0,2] | 2 | 1 | 1 |
| 8 | swap | [1,3,2] | [1,2] | [] | 2 | [0,2] | 2 | 1 | 2 |
| 9 | swap | [1,2,3] | [1,2] | [] | **1** | [0,2] | 2 | 1 | 2 |
| 10 | partition | [1,2,3] | [] | **[1]** | 1 | [0,2] | 2 | 1 | 2 |
| 11 | recurse_left | [1,2,3] | [] | [1] | – | [0,0] | 2 | 1 | 2 |
| 12 | start | [1,2,3] | [] | [1] | – | [0,0] | 2 | 1 | 2 |
| 13 | base_case | [1,2,3] | [] | [1] | – | [0,0] | 2 | 1 | 2 |
| 14 | base_case | [1,2,3] | [] | **[1,0]** | – | [] | 2 | 1 | 2 |
| 15–18 | recurse_right → base cases | [1,2,3] | [] | [1,0,2] | – | [2,2] | 2 | 1 | 2 |
| 19 | start | [1,2,3] | [] | [0,1,2] | – | [] | 2 | 1 | 2 |

:::must Four details that only a person who read the code would know
1. **`sortedIndices` can be out of order.** At frame 14 it reads `[1, 0]` — the pivot index 1 was locked at frame 10, then the single-element sub-array `[0,0]` added index 0. Order does not matter for `.includes()`, but it is a visible asymmetry between algorithms.
2. **The base case has two kinds of frames.** `if (low >= high)` pushes a bare `base_case` frame; then a nested `if (low === high)` pushes a *second* frame ("Index N is sorted.") and pushes the index onto `sortedIndices`. So a single-element sub-array produces two frames; an empty one (`low > high`, which happens for `pi - 1` when the pivot is 0) produces one. [VERIFIED at lines 27–42]
3. **The pivot swap is conditional.** `if (i + 1 !== high)` avoids a self-swap, and the else branch pushes a distinct message: "Pivot is already in its correct position."
4. **`stats.passes` increments once per `quickSortHelper` call that reaches the recursion step** — for `[3,1,2]` it ends at exactly 1, because only the root call partitioned. That is why the "Passes / calls" tile reads 1 for this input and 4 for the default 8-element input.
:::

## 35.5 The complexity, and the worst case you can demonstrate live

| Case | Comparisons | Time | When it happens |
| --- | --- | --- | --- |
| Best | Θ(n log n) | Θ(n log n) | The pivot lands near the median every time |
| Average | Θ(n log n) | Θ(n log n) | Random input |
| Worst | **n(n−1)/2** | **Θ(n²)** | **Already-sorted input with a last-element pivot** — the classic Lomuto trap |

:::must The demonstration that makes this unforgettable
With `[1,2,3,…,24]` already sorted and the pivot chosen as `arr[high]`, every partition places the pivot at `high` itself: the `while (arr[j].val <= pivot)` condition is true for every `j`, so `i` walks all the way to `high - 1` and the "swap pivot into position" step does nothing. The recursion is then `[low, high-1]` — a **single** subproblem, one element smaller. That is the worst case exactly: n levels of recursion, each doing an O(n) partition.

Measured in this codebase: quick sort on the *default* 8-element input produces 75 frames with 16 comparisons; on the reverse-sorted 24-element input it produces 632 frames with 276 comparisons. The sorted-24 case is the pathological one — *and the user can trigger it by pressing the "sorted" preset*, which is a legitimate interactive demonstration of an algorithmic worst case. [VERIFIED]

**The fix**, if you want to discuss it: median-of-three pivot selection (choose the median of `arr[low]`, `arr[mid]`, `arr[high]`), or randomise the pivot by swapping `arr[high]` with a random index before partitioning. Both reduce the probability of quadratic behaviour to negligible on real inputs. [PROPOSED — not implemented]
:::

## 35.6 Recursion depth and space

[VERIFIED: declared as `space: "O(n) worst"`] Because the recursion is not tail-call optimised by the JavaScript engine and each frame of work is a real stack frame, the deepest path is n−1 levels in the worst case — for the sorted-24 input that is 23 nested `quickSortHelper` calls, each holding `low`, `high`, `pi`. Hence O(n) worst-case auxiliary space, honestly declared in the UI.

:::q "Is quick sort in-place?"
"The partition is in-place — it rearranges within the array using a single scan and one extra index. But the *recursion* is not free: the call stack is O(log n) on average and O(n) in the worst case, which is why the panel says O(n) worst-case space rather than O(1). If you recurse on the smaller side first and loop on the larger, the depth is bounded by O(log n) — that's the standard 'tail-call elimination by hand' trick, and it is not implemented here."
:::

## 35.7 Stability, edge cases, bugs

| Property | Answer |
| --- | --- |
| **Stable?** | **No.** The long-distance swaps in the partition are what break it, exactly as with selection sort |
| **In-place?** | The partition is; the recursion costs O(log n) average / O(n) worst |
| **`[3,1,2]` walked by hand** | Frames 4–9: `3 <= 2`? No. `1 <= 2`? Yes → `i` becomes 0 ≠ `j`=1 → swap → `[1,3,2]`. Then pivot swap (`i+1=1` ≠ `high`=2) → `[1,2,3]`. Pivot index 1 locked. Recurse `[0,0]` → sorted; recurse `[2,2]` → sorted. Total 2 comparisons — beating bubble's 3 on the same input |
| **Duplicates** | Lomuto with `<=` puts equal elements on the left of the pivot, which is *correct* but degrades badly when the array is mostly equal: every element goes left, and the subproblem shrinks by one. This is the "all elements equal" quadratic case |
| **Duplicate-id frames** | [VERIFIED] quick sort does **not** reproduce the merge-sort duplicate-id problem, because it only ever swaps whole element objects between positions — no cloning into a buffer |

:::q "What's the difference between Lomuto and Hoare partitioning, and which did you use?"
"Lomuto, the simpler scheme: a single scan index `i` that marks the boundary of the ≤-region, and a final swap that places the pivot. Hoare's is faster in practice because it does fewer swaps — roughly a third fewer on average — but it's harder to get right and doesn't place the pivot in its final position at the end of the partition. Lomuto was the right choice here because 'the pivot is now final, lock it' is a beautifully clear teaching moment, and the code shows exactly that: `sortedIndices.push(pi)` immediately after the partition returns."
:::

## 35.8 Whiteboard

```js
function quickSort(a, low = 0, high = a.length - 1) {
  if (low >= high) return a;
  const p = partition(a, low, high);
  quickSort(a, low, p - 1);
  quickSort(a, p + 1, high);
  return a;
}

function partition(a, low, high) {
  const pivot = a[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (a[j] <= pivot) { i++; [a[i], a[j]] = [a[j], a[i]]; }
  }
  [a[i + 1], a[high]] = [a[high], a[i + 1]];
  return i + 1;
}
```

:::danger The two things interviewers watch for when you write this
1. **The pivot must not be included in either recursive call.** `p - 1` and `p + 1`, not `p` — otherwise infinite recursion on a sub-array of size 1.
2. **`j < high`, not `j <= high`.** The pivot itself is excluded from the scan and placed by the final swap; including it would compare the pivot with itself and place it incorrectly.
:::

---

# 36 · Heap sort

> Two phases, an array-as-tree, and the only algorithm here whose auxiliary space comes from recursion rather than a buffer.

## 36.1 Problem and intuition

**Intuition.** An array can represent a complete binary tree for free: for index `i`, the children are `2i+1` and `2i+2`, and the parent is `⌊(i−1)/2⌋`. If you enforce "every parent is at least as large as its children" — the max-heap property — then the root is the maximum. Swap the root to the end, shrink the heap by one, restore the property, and repeat. The array fills with sorted values from the right.

## 36.2 The invariant

[VERIFIED] **"After heap restoration, the root is the largest value in the active heap."**

## 36.3 The actual implementation

@@code src/modules/core/algorithm/sorting/algorithms/heapSort.js 20 71

## 36.4 The real trace: `[3, 1, 2]` → 14 frames

| # | codeLine | array | active | sorted | comps | passes | swaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | start | [3,1,2] | [] | [] | 0 | 0 | 0 |
| 1 | build_heap | [3,1,2] | [] | [] | 0 | 0 | 0 |
| 2 | pointers | [3,1,2] | [0,1,2] | [] | 0 | 0 | 0 |
| 3 | compare_children | [3,1,2] | [0,1,2] | [] | **2** | 0 | 0 |
| 4 | extract | [3,1,2] | [] | [] | 2 | 0 | 0 |
| 5 | swap_root | [3,1,2] | [0,2] | [] | 2 | 1 | 1 |
| 6 | heapify_root | [2,1,3] | [0] | [2] | 2 | 1 | 1 |
| 7 | pointers | [2,1,3] | [0,1] | [2] | 2 | 1 | 1 |
| 8 | compare_children | [2,1,3] | [0,1] | [2] | **4** | 1 | 1 |
| 9 | swap_root | [2,1,3] | [0,1] | [2] | 4 | 2 | 2 |
| 10 | heapify_root | [1,2,3] | [0] | [2,1] | 4 | 2 | 2 |
| 11 | pointers | [1,2,3] | [0] | [2,1] | 4 | 2 | 2 |
| 12 | compare_children | [1,2,3] | [0] | [2,1] | **6** | 2 | 2 |
| 13 | start | [1,2,3] | [] | [0,1,2] | 6 | 2 | 2 |

:::must Why the comparison count jumps by 2 every heapify, and why that is worth defending
[VERIFIED lines 35 and 40] `heapify` performs **two unconditional comparison increments**:

```js
stats.comps++;
if (left < size && arr[left].val > arr[maxIdx].val) maxIdx = left;

stats.comps++;
if (right < size && arr[right].val > arr[maxIdx].val) maxIdx = right;
```

Both increments happen even when the child does not exist (for a leaf, both `left < size` and `right < size` are false, so no real comparison occurs). The trace proves it: at frame 11 the parent at index 0 is a leaf in a heap of size 1 — there are no children at all — and the counter still rises from 4 to 6.

**Why this matters, and how to defend it:** the counter is a *generator instrumentation choice* — it counts "comparison slots evaluated", not "value comparisons executed". For most algorithms the difference is invisible, but for heap sort it inflates the number.

The honest answer if challenged: *"Yes — heap sort's comparison counter increments twice per heapify call unconditionally, so leaf calls inflate it. Bubble, selection and insertion count exactly one comparison per actual value comparison. That's a real inconsistency between generators, and it's precisely why I tell people the counters are per-implementation instruments and not comparable across algorithms — and why the comparison panel only uses `comps`, and even then with the disclaimer on screen. If I were to fix it, I'd increment inside the guards, and then update the expected values in the tests."* [PROPOSED fix]
:::

## 36.5 The two phases, and the sorting-region behaviour

| Phase | Code | What the frames show |
| --- | --- | --- |
| **1 — build heap** | `for (let i = Math.floor(n/2) - 1; i >= 0; i--) heapify(n, i, 'Building Heap')` | The heap property is established bottom-up. For n = 3 only one heapify call is needed (i = 0), which is why the trace jumps straight to `extract` at frame 4 |
| **2 — extract** | `for (let i = n - 1; i > 0; i--)` — swap root with `arr[i]`, mark `i` sorted, then `heapify(i, 0, 'Extracting')` | Each extraction pushes one more index into `sortedIndices`, so the sorted region **grows from the right**, one index per pass — the same visual signature as bubble sort but arriving at the ordering by a completely different route |

[VERIFIED] Unlike bubble and selection, heap sort's `sortedIndices` is filled exactly once per extraction and in strictly decreasing index order (n−1, n−2, …, 1), with `sortedIndices.push(0)` after the loop for the final element. The completed region is therefore `[n-1, n-2, ..., 1, 0]`.

## 36.6 Complexity

| Case | Comparisons | Time | Space |
| --- | --- | --- | --- |
| Best / average / worst | Θ(n log n) | **Θ(n log n) always** | Build phase O(n); recursive heapify O(log n) stack |
| Two-phase cost | Build is O(n) (not O(n log n)) | Each of the n−1 extractions costs O(log n) | Hence Θ(n log n) total |

:::must The fact that makes you look like you know heap sort
**Building a heap bottom-up is O(n), not O(n log n).** The intuition: most nodes are near the bottom, and the depth available to sift them down is small, so the sum Σ (number of nodes at depth d) × O(height) telescopes to O(n). That is why heap sort's build phase does not dominate the total.

And the "space O(log n)\*" in the panel is honest about *this implementation*: it uses a **recursive** `heapify`, so each level of sifting holds a stack frame. An iterative sift-down loop would make it O(1) auxiliary, which is the version usually described as "heap sort is in-place". The asterisk in the UI exists precisely to point this out — and if an interviewer asks "is heap sort in-place?", the answer that earns credit is: *"The swaps are in-place, but this implementation recurses in heapify, so the call stack is O(log n). The panel says O(log n) with an asterisk for exactly that reason — the footnote is on screen. To make it truly O(1) I'd convert the recursion into a while loop."* [PROPOSED]
:::

## 36.7 Stability, edge cases, bugs

| Property | Answer |
| --- | --- |
| **Stable?** | **No.** The root-to-end swap moves an element a long distance, and sift-down swaps across the tree — both reorder equal keys |
| **In-place?** | The data is; the heapify recursion is not |
| **n = 0** | 4 frames. The build loop `i = Math.floor(0/2)-1 = -1` does not run, and the extract loop `i = -1` does not run, but the two phase-announcement frames and the terminal frame are still pushed, plus the seed. [VERIFIED] |
| **n = 1** | 4 frames, same shape |
| **`pivotIndex` is always null** | [VERIFIED] Heap sort's frames carry `pivotIndex: null` — the field exists in the schema only because merge and quick use it. `activeIndices` is what shows the parent-and-children triple |

:::q "Why does your heap sort show three active indices at once?"
"Because a heapify call has to compare a parent with both children, so the frame's `activeIndices` is built as `[i, left, right]` filtered to those that exist — `let nodesToHighlight = [i]; if (left < size) nodesToHighlight.push(left); if (right < size) nodesToHighlight.push(right);`. That is the array-as-tree visual: the three nodes involved in one sift step, highlighted together. The parent/child index formulas are `2i+1` and `2i+2`, which is why the highlight can jump around the array rather than sliding next to it."
:::

## 36.8 Whiteboard

```js
function heapSort(a) {
  const arr = [...a], n = arr.length;

  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(arr, n, i);   // build: O(n)

  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];                     // max to its final slot
    siftDown(arr, end, 0);                                       // restore on the shrunken heap
  }
  return arr;
}

function siftDown(a, size, i) {
  while (true) {                       // iterative on the whiteboard: O(1) space
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && a[l] > a[largest]) largest = l;
    if (r < size && a[r] > a[largest]) largest = r;
    if (largest === i) return;
    [a[i], a[largest]] = [a[largest], a[i]];
    i = largest;
  }
}
```

:::must The two sentences that close out heap sort
"Build is O(n) because most nodes are shallow, and each of the n−1 extractions costs O(log n), so the total is Θ(n log n) in every case — no input distribution is bad for it, which is its one real advantage over quick sort. Here I've written the sift as a loop so the space is O(1); the version inside AlgoViz recurses instead, which is why my UI declares O(log n) with a footnote about the call stack." [VERIFIED: the app's own panel says exactly this.]
:::

:::check Red-line drills for Part X
- [ ] For each of the six: complexity table, stability, in-place-ness, and the invariant sentence.
- [ ] Write all five RED algorithms on paper in under ten minutes total.
- [ ] Explain why this bubble sort is Θ(n²) even on sorted input (no early exit).
- [ ] Explain why selection sort's comparison count is input-independent.
- [ ] Explain the insertion-sort `break` frame and why it costs one extra comparison.
- [ ] Explain merge sort's write-based "swap" counter and the duplicate-id bug.
- [ ] Explain quick sort's worst case with a last-element pivot and how to trigger it in the app.
- [ ] Explain heap sort's two-phase structure, the O(n) build, and the recursive-heapify space footnote.
:::
