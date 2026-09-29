%PART: Recorded-frame architecture | PART V | What a frame is, how generators build them, why cloning matters, and why execution is not playback.

# 11 · Frame anatomy

> Ten possible fields, six required ones, and the exact meaning of each.

## 11.1 The definition

:::must What is a frame?
[VERIFIED] A frame is a **plain JavaScript object** describing one meaningful moment in an algorithm's execution. It is created by the generator, never mutated afterwards, and rendered as-is. A trace is an array of frames: `frames[0]` is always the initial state before any work, and `frames.at(-1)` is always the completed, fully sorted state with every index marked sorted.
:::

@@code src/lab/engine.js 8 17

## 11.2 The complete field table

The right-hand columns show which generators emit each field. A dot means "always present", a dash means "not present".

| Field | Type | Meaning | bub | sel | ins | mer | qck | hea |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `array` | `{id, val, ...}[]` | The full array state at this moment — a **fresh clone**, never a shared reference | ● | ● | ● | ● | ● | ● |
| `activeIndices` | `number[]` | The indices under consideration right now; drives the green highlight and the `●` marker | ● | ● | ● | ● | ● | ● |
| `sortedIndices` | `number[]` | Indices considered finalised; drives the teal "done" styling and the `✓` marker | ● | ● | ● | ● | ● | ● |
| `isSwapping` | `boolean` | True only on the frame pushed immediately *before* a real swap is applied | ● | ● | ● | ● | ● | ● |
| `minimumIndex` | `number \| null` | Selection sort's tracked minimum | ● | ● | ● | – | – | – |
| `codeLine` | `string` | Machine-readable tag naming the operation (`'compare'`, `'swap'`, `'base_case'`…) | ● | ● | ● | ● | ● | ● |
| `currentStats` | `{passes, comps, swaps}` | A **clone** of the running counters at this moment | ● | ● | ● | ● | ● | ● |
| `msg` | `string` | The human sentence shown in the explanation panel | ● | ● | ● | ● | ● | ● |
| `pivotIndex` | `number \| null` | Quick sort's pivot / heap sort's staging field | – | – | – | ● | ● | ● |
| `subArrayRange` | `[low, high]` | The recursion window currently being processed | – | – | – | ● | ● | ● |
| `isLifting` | `boolean` | Insertion sort's "this element is being carried" flag | – | – | ● | – | – | – |

:::note Four fields the live UI does not consume — and the subtle reason why
[VERIFIED] In the lab, `ArrayView` and the inspector read `array`, `activeIndices`, `sortedIndices`, `pivotIndex`, `codeLine`, `msg` and `currentStats`. They do not read `isSwapping`, `subArrayRange`, `minimumIndex` or merge sort's `yOffset`.

**Be precise about this, because the careless version of the claim is false.** I grepped it: those four fields *are* read — by `src/modules/core/SimpleSort.jsx` (`isSwapping`, `minimumIndex`, `isLifting`) and `src/modules/core/EfficientSort.jsx` (`isSwapping`, `pivotIndex`, `subArrayRange`, `yOffset`, for a `translateY` on buffered elements). Both files have **zero importers** anywhere in the repository, so neither is in the bundle. The accurate statement is therefore: *no component in the shipped application reads these fields; the only readers are two unimported files from an earlier generation of the UI.*

This is a real, honest finding and a superb thing to volunteer, because it shows you read your own data model critically: *"The frame schema carries four fields the app's UI doesn't consume — `isSwapping`, `subArrayRange`, `minimumIndex` and merge sort's `yOffset`. They were written for a richer renderer: the swap flag for a flash animation, `subArrayRange` for a nested-invocation bracket, `minimumIndex` for a corner marker. Two files from the earlier UI generation do read them, but both have zero importers and aren't in the bundle — so in the shipped app the data is recorded, cloned, compared for determinism, and not drawn."* [PROPOSED] Adding a sub-array bracket for merge/quick/heap and a swap pulse would consume the existing data with no engine changes at all.
:::

## 11.3 The `codeLine` vocabulary — the complete list

[VERIFIED] Extracted from the six generators. This is the closest thing the project has to "which line of pseudocode are we on", and it is what the UI displays as "CURRENT OPERATION".

| Generator | Tags |
| --- | --- |
| Bubble | `start`, `outer`, `inner`, `compare`, `swap` |
| Selection | `start`, `outer`, `inner`, `new_min`, `swap`, `lock` |
| Insertion | `start`, `outer`, `compare`, `swap`, `break`, `drop` |
| Merge | `start`, `base_case`, `mid`, `recurse_left`, `recurse_right`, `merge_call`, `buffer`, `compare`, `write_left`, `write_right`, `write_rem` |
| Quick | `start`, `base_case`, `partition`, `compare`, `swap`, `recurse_left`, `recurse_right` |
| Heap | `start`, `build_heap`, `extract`, `pointers`, `compare_children`, `swap_heapify`, `swap_root`, `heapify_root` |

[VERIFIED] The renderer prints it with underscores replaced by spaces: `frame.codeLine?.replaceAll("_", " ")` — so `base_case` renders as "BASE CASE" in the operation line. The optional chaining (`?.`) is defensive: if a frame somehow lacked `codeLine`, the panel would render "CURRENT OPERATION · " rather than crashing.

## 11.4 The ID scheme, and why it is not an index

:::must Stable identity is the quiet hero of the whole design
[VERIFIED] Every element is wrapped once, at the top of the generator:

```js
let arr = rawArray.map((val, index) => ({ id: `block-${index}`, val }));
```

Then `ArrayView` renders `key={item.id}`. The ID is assigned **before** any sorting happens and it travels with the element object through every swap for the rest of the trace. `id` therefore encodes *which original input position this value came from*, and it is stable across the whole recording.

Three consequences, in increasing order of interview value:

1. **React reconciliation is correct.** If you used `key={i}` (the render index), React would reuse DOM nodes positionally and a swap would look like a value change rather than a movement — and any in-progress CSS transition would attach to the wrong element.
2. **Equal values stay distinguishable.** With `duplicates` input the array holds repeated values; only the ID can tell which of the two 25s is under comparison.
3. **It makes traces comparable as data.** `assert.deepEqual(frames, algorithm.run(input))` passes only if IDs are deterministic. Because they are derived from the original index, they are — which is the property that makes the reproducibility test possible at all.
:::

:::trap "So IDs are just array indices with extra steps?"
No, and the distinction is precise: an **index** is a *position* in the current array; an **ID** is a *property of the element*. After one swap, index 3 holds a different element while `block-3` sits somewhere else. The test that proves the difference is in the test file: `new Set(frames.at(-1).array.map(x => x.id)).size === input.length` — after sorting, every original element is still present exactly once. If IDs were reused or duplicated, that assertion fails.
:::

:::danger The one place where IDs genuinely break — merge sort, and it is a real bug
[VERIFIED — I reproduced this by running the generator] In `generateMergeSort`, the merge step copies the window into a temporary buffer with `tempArr.push({...arr[i]})` — a **shallow copy of the element object, including its `id`** — then writes each buffered object back into `arr[k]`, starting at `k = low`. Because the write-back starts at the *left* edge of the window while the original elements are still sitting at their old positions, the **same `id` exists twice inside `arr` at the same time** — and the frame pushed by `write_left` / `write_right` / `write_rem` clones `arr` in exactly that state.

Measured on the real code:

| Input | Trace length | Frames containing a duplicate `id` |
| --- | --- | --- |
| default 8 values | 107 | **23** (e.g. frame 39, `write_right`, duplicate `block-2`) |
| `[3,1,2]` | 30 | 4 (e.g. frame 15, duplicate `block-1`, array renders as `[1,1,2]`) |
| seeded 10 values | 142 | 24 |
| `duplicates` preset | 142 | 22 |
| reverse 24 values | 375 | **141** (frame 24: duplicate `block-1`) |

`ArrayView` renders each column with `key={item.id}`, so those frames are React **duplicate-key** frames. In development React logs "Encountered two children with the same key…"; in production reconciliation with duplicate keys is unspecified, so a column can momentarily fail to update. The **final** frame is always clean — every trace's last frame has unique ids, which is exactly what the test file asserts — so nothing corrupts permanently; the bug is confined to the transient mid-merge frames.

There is a second, visual half to the same root cause: the value that was moved into the buffer *disappears* from the rendered array until it is written back. Frame 15 of `[3,1,2]` renders `[1,1,2]` — the `3` is momentarily gone because it is sitting in `tempArr`, which no frame exposes. The generator already carries `yOffset = 80` and a `buffer` frame for exactly this visual, but `ArrayView` does not read `yOffset`, so the buffer state is invisible.

:::

:::script How to answer if the interviewer spots it
"That's a real bug and I'm glad you found it — it's in merge sort's write-back. The generator copies elements into a temporary buffer as shallow clones, so the clone keeps the same `id`, and then writes them back into the array from the left while the originals are still at their old positions. For the frames pushed during the write-back, the same id appears twice in the array, and my column key is `item.id`, so React sees a duplicate key. It never affects the final frame — the last frame always has unique ids and that's asserted in the test suite — so the damage is a React warning plus the theoretical risk of a mis-reconciled column for one frame. There are two candidate fixes and they trade off against each other. The minimal one is to make the render key unique per frame — `key={item.id + ':' + i}` — which removes the warning immediately, because every frame is a full snapshot so positional keys cannot corrupt anything across frames; the cost is that React then treats bars as position-identified rather than element-identified, which would matter if I ever added per-element movement animations. The other option is to keep element identity and give the buffered clone a fresh id at write time, e.g. `{...tempArr[i], id: tempArr[i].id + '-m' + low + '-' + high}`; that preserves identity semantics but changes what an id *means* for merge sort, and the final-frame uniqueness assertion would still pass either way. I would take the key fix first because it is one line and cannot affect the algorithm, and the deeper fix is that the renderer should show the buffer explicitly — that's also why the value appears to vanish mid-merge; the generator already emits `yOffset` and a `buffer` frame for it, but the renderer ignores them."
:::

## 11.5 The `currentStats` clone

[VERIFIED] The generators keep one mutable `stats` object and clone it into every frame: `currentStats: { ...stats }`. This is the second-most important clone in the project.

Why it matters: if a frame stored a *reference* to `stats`, then every frame would show the **final** counters, because the object is mutated in place throughout the run. Frame 0 would display the total comparisons of the entire sort. The spread makes each frame's counters a true snapshot of "how many comparisons had happened at this moment" — which is what the "Comparisons 12" tile claims to mean.

:::must The invariant that the clone protects
**Any value inside a frame must be immutable from the moment the frame is created.** There are exactly two cloning operations that enforce it, and you should name both: `cloneArray()` for the array, `{...stats}` for the counters. Everything else in a frame is either a primitive or a freshly allocated literal.
:::

---

# 12 · How a generator builds a trace

> The canonical walkthrough: `generateBubbleSort` line by line, then the general pattern that all six follow.

## 12.1 The general shape (all six generators)

```
generate<Algo>(rawArray)
  |
  +-- 1. WRAP      rawArray.map((val, i) => ({ id: `block-${i}`, val }))
  |                (insertion adds isLifting:false; merge adds yOffset:0)
  |
  +-- 2. INIT      frames = []; n = arr.length; sortedIndices = [];
  |                stats = { passes: 0, comps: 0, swaps: 0 }
  |
  +-- 3. CLONE     const cloneArray = () => arr.map(item => ({ ...item }))
  |
  +-- 4. SEED      push the "System Ready" frame (empty active, empty sorted, zero stats)
  |
  +-- 5. LOOP      for each structural step:
  |                   push a frame  BEFORE the state changes
  |                   mutate arr and/or stats
  |                   push a frame  AFTER the state changed   (only for swaps)
  |                   update the bookkeeping lists (sortedIndices, minIndex, ...)
  |
  +-- 6. FINISH    push a terminal frame with sortedIndices = all indices and the final stats
  |
  +-- 7. RETURN    frames
```

## 12.2 Annotated source: the first twelve frames of bubble sort

@@code src/modules/core/algorithm/sorting/algorithms/bubbleSort.js 1 29

Reading it precisely, line by line:

| Lines | What happens | Why it is written that way |
| --- | --- | --- |
| 2–5 | Wrap each value in an object with a stable id | The id survives sorting; the value is what gets compared |
| 7–10 | `frames`, `n`, `sortedIndices`, `stats` | `sortedIndices` is a plain array that is *copied* into each frame with `[...sortedIndices]` — never shared |
| 12 | `cloneArray` | A shallow-per-element clone: a new array whose element objects are new objects. Any in-place write to `arr[j]` after this point cannot retroactively change an earlier frame |
| 14–19 | The seed frame | Guarantees `frames[0]` is a valid, renderable state — this is what makes "restart" trivially safe |
| 21–23 | Outer loop; `stats.passes++` **before** the frame is pushed | So the pass frame reports the pass it is *starting*, not the one it finished |
| 24–29 | Pass-start frame with `activeIndices: []` | An "empty-handed" frame: the pass is announced before any comparison happens. This is what gives the play-through a readable rhythm |

@@code src/modules/core/algorithm/sorting/algorithms/bubbleSort.js 31 45

| Lines | What happens | Why |
| --- | --- | --- |
| 31 | `for (let j = 0; j < n - i - 1; j++)` | The inner bound shrinks because the last `i` elements are already locked |
| 32–37 | A frame **before** the comparison, `codeLine: 'inner'` | Separates "moving the window" from "comparing the window" |
| 39 | `stats.comps++` | Incremented once per comparison pair — the counter is incremented before the compare frame so the frame reports this comparison as already counted |
| 40–45 | The `compare` frame, with `msg` interpolating the actual values | This is the sentence a learner reads to understand the decision |

@@code src/modules/core/algorithm/sorting/algorithms/bubbleSort.js 47 73

| Lines | What happens | Why |
| --- | --- | --- |
| 47 | `if (arr[j].val > arr[j + 1].val)` | The decision. It is a strict `>` — equal values are **not** swapped |
| 48 | `stats.swaps++` | Counted once per physical swap |
| 49–54 | Pre-swap frame with `isSwapping: true` | The frame exists so the UI *could* render a "mid-swap" moment. It carries the pre-swap array, so it also proves what the array looked like before |
| 56–58 | The actual three-line swap | Classic temp-variable swap — no destructuring, which is a readability choice |
| 60–65 | Post-swap frame, `isSwapping: false` | The other half of the pair. Together, these two frames make the swap visible as a two-step event |
| 66–73 | The else branch pushes a `"No swap needed"` frame | **This is the frame most visualisers omit.** It records a *negative decision* — proof that the comparison happened and the answer was "no". Without it, a viewer cannot tell a skipped comparison from a comparison that returned false |

**Line 76** is the subtlest line in the file:

```js
sortedIndices.push(n - i - 1);
```

After each outer pass, exactly one more index is finalised — the last unsorted position. The array `sortedIndices` is **mutated**, and the *next* frame that reads it copies it with `[...sortedIndices]`. Note that the number of elements marked sorted grows by one per pass, which is why the "sorted" region in the UI grows from the right. [VERIFIED]

## 12.3 The frame-count arithmetic (measured, not guessed)

I ran every generator against several inputs. These are real numbers from this repository:

| Input | bubble | selection | insertion | merge | quick | heap |
| --- | --- | --- | --- | --- | --- | --- |
| `[5, 1]` (n = 2) | 10 | 8 | 7 | 16 | 16 | 10 |
| default 8 values | 118 | 65 | 76 | 107 | 75 | 84 |
| seeded 10 values | 172 | 76 | 79 | 142 | 136 | 122 |
| reverse-sorted 24 values | **1,154** | 492 | 876 | 375 | 632 | 348 |
| `[]` (empty) | 2 | 2 | 2 | 4 | 4 | 4 |

:::must The formula for bubble sort's frame count
For an input where every adjacent pair swaps (`m` swaps total), each inner iteration produces: **1** `inner` frame + **1** `compare` frame + **2** swap frames (`swap` + `swap complete`) = 4 frames. A non-swapping iteration produces 1 + 1 + 1 = 3 frames. Plus **1** seed frame + **1** outer frame per pass + **1** "pass complete" frame per pass + **1** terminal frame.

For reverse-sorted `n = 24`: comparisons = n(n−1)/2 = 276, all of which swap. Frames = 1 (seed) + 24 (outer) + 276×4 (inner+compare+swap+swap-complete) + 24 (pass complete) + 1 (final) = **1,154**. [VERIFIED — this matches the measured value exactly, which is a beautiful thing to derive on a whiteboard if you are asked.]
:::

:::q "How many frames does bubble sort produce for 24 elements, and why that number?"
Answer with the derivation, not the number: *"There's a seed frame, one frame per pass start, one per inner iteration for the window, one for the comparison, two for each swap — the pre-swap and the post-swap — one per pass completion, and one final frame. For a reverse-sorted 24-element array every comparison swaps, so 276 comparisons × 4 + 1 + 24 + 24 + 1 = 1,154. I've measured it; it matches."*
:::

## 12.4 The same pattern, seen in the other five

| Algorithm | Structural frames that make it recognisable on screen |
| --- | --- |
| **Selection** | Every frame carries `minimumIndex`, so the "current best candidate" is visible while the scan continues. `new_min` frames mark the exact moment the candidate changes; `lock` frames mark the moment an index becomes final. The outer loop runs to `n-1` and the last index is force-marked sorted afterwards |
| **Insertion** | `isLifting` is set on the element being carried (line 23), and the `drop` frame is pushed *after* `isLifting = false` (line 70) — so the renderer could animate a lift-and-drop with data that already exists. The `break` frame is the only explicit "we are stopping early" record in the project |
| **Merge** | The recursion produces `recurse_left` / `recurse_right` frames *before* the recursive call, so the trace shows the call tree in order. `buffer` frames mark the moment elements are conceptually moved into temporary memory, and `yOffset = 80` is set on exactly the elements in the current merge window (lines 70–72) — a visual channel the lab's renderer does not use |
| **Quick** | `partition` frames bracket the partition work; the pivot index is carried on nearly every frame; after `partition()` returns, the pivot index is pushed onto `sortedIndices` immediately (line 54) because a pivot is final the moment its partition ends |
| **Heap** | Split into two phases with explicit `build_heap` and `extract` frames. `heapify` pushes a `pointers` frame showing parent and children, then a `compare_children` frame — two comparisons are counted per call (lines 35 and 40) even if the first condition short-circuits |

:::must The one statement to make about all six generators
"They all share one contract: take a raw array of numbers, never mutate it, and return a complete immutable trace whose first frame is the initial state and whose last frame is the sorted state with all indices marked. That uniformity is what lets `engine.js` treat them interchangeably and what lets the tests loop over all six with a single assertion body." [VERIFIED]
:::

---

# 13 · Execution vs playback — the separation that defines the project

> Two phases, two very different properties, one interface between them.

## 13.1 The two phases

```
   PHASE 1 · EXECUTION                          PHASE 2 · PLAYBACK
   -------------------------------------        -------------------------------------
   when:  inside algorithms[algo].run(input)    when:  every render after that
   cost:  one synchronous burst, O(n^2)         cost:  O(1) — read frames[cursor]
          comparisons + O(frames x n) copies
   output: frames[]                              input:  frames[] + playback state
   knows about: sorting                          knows about: nothing but an index
   testable: yes, in plain Node                  testable: the reducer is; the UI is not
   happens: once per (algo, input) pair          happens: on every tick, seek, keypress
```

:::must Why this separation is the whole design
Playback does not know what a comparison is. It knows there are `length` things and a `cursor` pointing at one of them. That is why the same reducer could drive N-Queens, pathfinding, or a tree traversal with zero modification — it has no algorithm-specific knowledge to unlearn.
:::

## 13.2 "Why does the algorithm not need to run backwards when you seek backwards?"

Because **nothing is being computed during playback at all.** The algorithm has already finished. Its entire history is sitting in `frames` as data. To show an earlier moment, React renders a different array element.

:::script The answer, in the strongest form
"The algorithm ran once, to completion, before you ever pressed Play. Every state it passed through was recorded as an object with the array cloned and the counters cloned. Playback is `frames[cursor]`. When you drag the timeline left, the cursor decreases and React renders a different element of an array that is already in memory. There is no reverse execution, no inverse operation, no re-run — and that's precisely why *arbitrary* seeking works: jumping from frame 900 to frame 40 costs exactly the same as jumping to frame 899."

That last clause is the part that demonstrates understanding. A naive implementation that re-ran the algorithm to reach a target frame would make seek cost O(target) — which is exactly the design's alternative, and it is worth naming as such.
:::

## 13.3 What you give up — the honest trade-off

| Consequence | Detail |
| --- | --- |
| **Memory becomes a real cost** | Full snapshots mean memory is proportional to frames × elements, not to the algorithm's own auxiliary space. The engine's space complexity and the *application's* space complexity are now different numbers. |
| **Execution must complete before playback starts** | There is no streaming, no "watch it think". For 24 elements that is imperceptible; for a large input it would be a visible freeze on the main thread. |
| **Traces need a bound** | Hence the 24-element cap: it is the mechanism that keeps the memory consequence acceptable. [VERIFIED: `parseInput` enforces it, and the UI footnote says "Trace storage is bounded by the 24-element input limit."] |
| **You cannot inspect a state you did not record** | Frames only exist where the generator pushed one. If a step is missing from the generator, it is invisible to the user — the recording defines the observable history. |

## 13.4 The alternative designs, and why they lose (for this use case)

| Alternative | How seek would work | Verdict |
| --- | --- | --- |
| **Live animation, no history** | Impossible — you cannot go back | Original v1 approach; cannot support the headline feature |
| **Re-run to a target step** | Re-execute from frame 0 and stop at step *k* → O(k) per seek, O(n) per scrub position | Simple to implement, but scrubbing becomes quadratic and non-deterministic under a mutable seed |
| **Record operations, replay forward from a checkpoint** | Store deltas + periodic snapshots; reconstruct by replaying from the nearest checkpoint | [PROPOSED] The right answer at scale — far less memory, still O(1)-ish seeks with periodic reconstruction |
| **Inverse operations** | Derive the reverse of each mutation | Fragile: `merge` and `heapify` have no clean inverse, and every algorithm needs bespoke undo code |
| **Web Worker + streaming frames** | Worker computes and posts frames; UI stays responsive | [PROPOSED] Solves the freeze, not the memory; the README lists workers as a future step before raising the input cap |

:::danger Do not say "I chose full snapshots because memory is cheap"
That is a non-answer. The defensible version: *"I chose full snapshots because they make every frame independently renderable and independently testable, which is what I needed for reproducibility and for the test suite. That was a deliberate first implementation with a known cost, and I bounded the input size to 24 to keep the cost contained instead of claiming scalability I haven't tested. The next architecture step is compact events with periodic checkpoints, which the README lists as planned work."* — [VERIFIED] that plan is literally in the README's "What's next" list.
:::

---

# 14 · The memory trade-off, quantified

> Real measurements from this repository, and the asymptotic story behind them.

## 14.1 Measured trace sizes

I serialised every trace with `JSON.stringify` to get a concrete byte count (a fair proxy for retained memory, since these are plain data objects):

| Input | Algorithm | Frames | JSON size |
| --- | --- | --- | --- |
| 2 elements | quick | 16 | 4.4 KB |
| default 8 elements | bubble | 118 | 48.6 KB |
| seeded 10 elements | bubble | 172 | 80.1 KB |
| reverse 24 elements | heap | 348 | 311 KB |
| reverse 24 elements | merge | 375 | 430 KB |
| reverse 24 elements | selection | 492 | 420 KB |
| reverse 24 elements | quick | 632 | 554 KB |
| reverse 24 elements | insertion | 876 | 1.13 MB |
| reverse 24 elements | **bubble** | **1,154** | **981 KB** |

:::must The number to remember
The worst trace this application can produce is **~1 MB of frames** — bubble sort on a reverse-sorted 24-element array, 1,154 frames. That is the consequence of the input cap, and it is why the cap exists. Quote this number: it makes the trade-off concrete instead of hand-wavy.
:::

## 14.2 The asymptotics, stated exactly

Let *n* be the input length and *F* the number of frames.

| Quantity | Complexity | Reason |
| --- | --- | --- |
| Frame count for bubble/insertion/selection | **O(n²)** | The inner loop is quadratic and each iteration pushes a constant number of frames |
| Frame count for merge/quick/heap | O(n log n) typical, O(n²) worst for quick | Driven by the number of comparisons and recursive calls |
| Elements per frame | O(n) | `cloneArray()` copies every element object |
| **Total retained data** | **O(F × n)** | Both factors multiply |
| For a quadratic sort with per-step cloning | **conceptually O(n³)** | Because F itself is O(n²) and each frame is O(n) → O(n²·n) |
| Playback per render | **O(1)** to select the frame, O(n) to render its bars | `frames[cursor]` is an array index; the DOM work is proportional to visible elements |

Check the O(n³) claim against the measurements: n goes from 8 to 24 (3×). n³ grows by 27×. Bubble's JSON goes from 48.6 KB to 981 KB — 20×, in the same ballpark once you account for fixed per-frame overhead. [INFERENCE — but the measured growth is consistent with it, and the README itself states the cubic-storage consequence.]

:::q "What is the space complexity of AlgoViz?"
This question has two correct answers and you must give both, in this order:

1. **The algorithms:** all six are in-place or near-in-place. Bubble/selection/insertion are O(1) auxiliary; merge sort's implementation allocates a temporary buffer per merge, up to O(n); heap sort's implementation recurses, so its auxiliary stack is O(log n) — which is exactly the footnote the UI displays as "\* This implementation uses recursive heapify; its call stack uses O(log n) space." [VERIFIED: `engine.js` declares heap's space as `"O(log n)*"` and the UI renders that asterisk explanation.]
2. **The visualisation layer:** O(F × n), which for the quadratic sorts is conceptually O(n³). This is *the application's* cost, not the algorithm's, and it is the honest price of record-and-replay.

If you only give answer 1, you have missed the interesting part of your own project. If you only give answer 2, you have missed that the generators themselves are the standard textbook complexities.
:::

## 14.3 "What happens with a huge trace?" — the failure sequence

If the 24-element cap were removed (say via a code change — there is no UI path around `parseInput`):

1. **First pain: synchronous main-thread freeze.** The generator is a plain synchronous loop. For n = 10,000, bubble sort performs ~50 million comparisons *and* clones a 10,000-element array on every push — hundreds of millions of object allocations, all before the first paint. The tab locks up.
2. **Second pain: memory.** Naive frame counts explode. At 10,000 elements a quadratic trace would need on the order of 10¹¹ element copies. The tab crashes with an out-of-memory error long before it finishes.
3. **Third pain: render cost per frame.** Even if a frame existed, rendering 10,000 DOM nodes per frame — each with nested `div`/`strong`/`span` — would blow past any reasonable frame budget.
4. **Fourth pain: the timeline becomes useless.** A range input with 10⁸ steps cannot be scrubbed meaningfully.
5. **Fifth pain: `localStorage`** would throw `QuotaExceededError` on the first save (typically ~5 MB per origin), which the `try/catch` in `save()` would catch and report as "Browser storage is unavailable. Use Export instead." [VERIFIED that this catch exists]

:::script What would break first, and how you would fix it
*"The main thread would lock up first, before memory even becomes the issue, because generation is synchronous. So the fixes come in this order: (1) put generation in a Web Worker so the UI never blocks; (2) change the frame representation from full snapshots to compact events with periodic checkpoints, so memory drops from O(frames × n) to something closer to O(operations + checkpoints × n); (3) keep an input cap, just a much larger one, because there is always a size where a browser tab is the wrong tool. The README lists exactly those first two as planned work — they are the designed next step, not something I'd invent on the spot."* [VERIFIED for the README plan; the ordering is INFERENCE]
:::

## 14.4 The delta-frame design, described properly [PROPOSED]

This is the answer to "how would you make this scale?", and it is worth being able to sketch precisely.

```
   CURRENT (full snapshots)                 PROPOSED (events + checkpoints)

   frame 0: {array: [A B C D], ...}         frame 0:      SNAPSHOT {array: [A B C D]}
   frame 1: {array: [A C B D], ...}         frame 1:      EVENT {swap: [1, 2], stats}
   frame 2: {array: [A C B D], ...}         frame 2:      EVENT {compare: [1, 2], stats}
   frame 3: {array: [A C D B], ...}         frame 3:      EVENT {swap: [2, 3], stats}
   ...                                      ...
   frame k: full array again (every time)   frame k%50:   SNAPSHOT (re-anchor)

   memory: O(frames x n)                    memory: O(events x constant) + O(n x n/50)
   seek to frame j: O(1)                    seek to frame j: O(1) to the last checkpoint,
                                                             then replay <= 50 events
```

**The trade-off, stated honestly:** deltas make *forward* playback cheaper but make random seek cost a bounded amount of work (bounded by the checkpoint interval), and they make every frame's array *derived* rather than stored — which means the "render any frame directly" simplicity is lost, and the test suite would need a reconstruction function to assert against. The simplicity of full snapshots is the thing being traded away, and at 24 elements that trade was not worth making. [PROPOSED]

:::check Red-line drills for Part V
- [ ] Recite the frame field table from memory (6 required + 4 optional fields).
- [ ] Explain `cloneArray()` and `{...stats}` and what breaks without each.
- [ ] Derive bubble sort's frame count for n = 5 if every pair swaps.
- [ ] Quote the worst-case trace size: 1,154 frames / ~1 MB at n = 24.
- [ ] State the memory complexity for the algorithms AND for the application, separately.
- [ ] Explain what breaks first at 1 million frames, and give the three-step fix.
:::
