%PART: Comparison, alignment and operation counts | PARTS XII–XIV | What the comparison feature really measures — and the three disclaimers already written into your own UI.

# 38 · Same-input comparison

> One input array, two traces, four pieces of on-screen disclosure.

## 38.1 The code

@@code src/lab/SortingLab.jsx 74 76

@@code src/lab/SortingLab.jsx 93 97

@@code src/lab/SortingLab.jsx 198 203

## 38.2 What "same input" is guaranteed to mean

| Guarantee | Mechanism |
| --- | --- |
| Both algorithms receive **the identical array** | `algorithms[algo].run(input)` and `algorithms[other].run(input)` pass the *same reference* — not a copy — so there is no possibility of a divergence introduced by copying |
| Neither mutates it | The generators wrap values in new objects (`rawArray.map(...)`) and only ever sort their own `arr`. This is asserted for all six by the test suite: `assert.deepEqual(input, before)` |
| Both traces are recomputed together when the input changes | `otherFrames`'s dependency array includes `input` |
| Comparison is opt-in | `compare` defaults to `params.has("compare")`, and `otherFrames` is `[]` when comparison is off, so no work happens unless the user asked for it |

:::key Why passing the same reference matters more than it sounds
If the second algorithm had been given a copy, the two runs would still be *correct* — but the claim "same dataset" would rest on the developer having remembered to copy faithfully. By passing the identical reference and relying on the generators' purity, the guarantee becomes structural. The test suite proves the purity property for all six generators, so the comparison's core assumption is itself tested. [VERIFIED]
:::

## 38.3 The four pieces of disclosure in the UI

This is the most important part of the chapter, because it is where the project demonstrates intellectual honesty — and every one of these lines is already written in your own code, so you can quote them.

| # | What the UI says | Where | Why it matters |
| --- | --- | --- | --- |
| 1 | "Preview aligned by percentage of trace—not equivalent operations." | under the comparison array | Disclaims the *alignment* |
| 2 | "Actual comparison events from the same input. No wall-clock claims: animation speed is not algorithm performance." | in the comparison results panel | Disclaims the *metric* |
| 3 | "COMPLETE-RUN COMPARISONS" as the panel's eyebrow | above the meters | States that the numbers describe the whole run, not the current frame |
| 4 | "Passes/calls are implementation-specific and should not be compared across algorithms. Legacy generators count exchanges differently; comparison mode deliberately uses comparisons only. Trace storage is bounded by the 24-element input limit." | the page footnote | Disclaims the *other two counters* and documents the memory bound |

:::must The sentence that wins this part of the interview
"If you look at the comparison panel in the app, the disclaimers are already there — I wrote them into the product, not into the README. The panel says percentage alignment is not equivalent operations, and it says there are no wall-clock claims. The reason is that a comparison feature is exactly where a project is most tempted to lie, and I'd rather the UI be honest than the demo be impressive."

That is a genuinely differentiating answer, because it demonstrates that you anticipated the criticism and encoded the response.
:::

## 38.4 What the feature compares, and what it refuses to

| The feature DOES show | The feature does NOT show |
| --- | --- |
| Recorded **comparison counts** for the complete run of each algorithm | Wall-clock time |
| The two numbers side by side, as labelled figures | Memory or allocation counts |
| Two proportional meter bars, scaled to the larger of the two | A "winner" or a ranking |
| A second array preview at the proportionally corresponding frame | A claim that equivalent frames mean equivalent work |
| The primary algorithm's live counter as you step | A per-step difference between the two algorithms |

[VERIFIED] There is no sorting of the results, no "faster/slower" label, no verdict. The panel renders the two counts and two meters and stops.

## 38.5 The five comparison questions, answered

:::q "Why the same input?"
"Because otherwise the numbers are not comparable at all. Comparison counts depend heavily on the input — insertion sort's count on a sorted array is n−1, while on a reversed array it's n(n−1)/2. If the two algorithms were given different arrays, any difference in the counters could be explained by the data rather than the algorithm. Using the identical array removes the input as a variable. The fact that the generators don't mutate their input is what makes passing the same reference safe, and that's asserted in the test suite."
:::

:::q "What exactly are you comparing?"
"One recorded quantity: the number of comparison operations each algorithm performed on the complete run. Not time, not swaps, not memory. I chose comparisons because it's the one counter that is semantically the same across all six implementations — every generator increments `stats.comps` exactly at a value comparison. The other counters are not: the exchange counter means a swap in bubble sort, a shift in insertion sort, and a buffer write in merge sort. That's why the footnote says the pass and exchange counters are implementation-specific and why the panel uses comparisons only."
:::

:::q "Does comparison prove runtime superiority?"
"No, and the app says so explicitly. Comparison count is a proxy for the number of decisions, not the cost of them. Runtime depends on constant factors, memory access patterns, branch prediction, how the engine optimises each function, and the actual data distribution — none of which the counter captures. A concrete example from my own traces: merge sort does 16 comparisons and 24 writes on the default eight-element input, while selection sort does 28 comparisons and 6 swaps. Merge has fewer comparisons and more data movement — which one is faster in a browser depends on whether a comparison or a write costs more on that machine, and I don't measure either."
:::

:::q "Can two algorithms have different trace lengths?"
"Always, and that's exactly why the alignment question exists. On the default eight-element input: selection 65 frames, quick 75, insertion 76, heap 84, merge 107, bubble 118. Measured, not estimated. The reason is that frame count is a function of how many *states* the generator records, and different algorithms produce different numbers of intermediate states per unit of work — merge sort records recursion-entry, buffer, comparison and write frames, while bubble records a frame per comparison plus two per swap. So frame count encodes structure, not speed."
:::

:::q "Are operation counts normalized?"
"No. They are raw counts for the complete run. There is no per-element normalisation and no attempt to weight operations by cost — the meters are scaled against the larger of the two counts purely for visual proportion, which is a presentation decision. Part of the reason I don't normalise is that I'd have to answer 'normalised by what?' For different n? Both algorithms already saw the same n. By cost? I'd have to decide the relative cost of a comparison and a write, which is machine-dependent. Raw counts with an explicit disclaimer are more honest than a normalised number with a hidden assumption inside it."

:::
---

# 39 · Percentage-aligned replay, explained precisely

> Ten numerical examples, one formula, and the single most important "does not equal" in the project.

## 39.1 The formula

@@code src/lab/SortingLab.jsx 201 203

| Symbol | Meaning |
| --- | --- |
| `cursor` | The primary algorithm's current frame index, `0 … frames.length - 1` |
| `frames.length - 1` | The primary trace's last valid index — the denominator, i.e. "how far is the primary playback from the end" |
| `otherFrames.length - 1` | The same for the secondary trace |
| `compareCursor` | The secondary frame index to render |

The expression converts the primary position into a **fraction of progress**, then converts that fraction into an index in the other trace:

```
   progress        = cursor / (frames.length - 1)
   compareCursor   = round( progress * (otherFrames.length - 1) )
```

## 39.2 Worked examples

**Example A — Algorithm A has 100 frames, Algorithm B has 40 frames.**

| Primary cursor | Progress | `compareCursor` | What you see of B |
| --- | --- | --- | --- |
| 0 | 0 / 99 = 0.000 | `round(0 × 39) = 0` | B's first frame |
| 10 | 0.101 | 4 | B's 5th frame |
| 25 | 0.253 | 10 | B's 11th frame |
| 50 | 0.505 | 20 | B's 21st frame |
| 75 | 0.758 | 30 | B's 31st frame |
| 90 | 0.909 | 35 | B's 36th frame |
| 99 | 1.000 | 39 | B's last frame |

**Example B — A has 40 frames, B has 100 (the reverse).**

| Primary cursor | Progress | `compareCursor` |
| --- | --- | --- |
| 0 | 0.000 | 0 |
| 10 | 0.256 | 26 |
| 20 | 0.513 | 51 |
| 30 | 0.769 | 77 |
| 39 | 1.000 | 99 |

**Example C — the doubling case.** If B's trace is exactly twice A's and A is at 50%, then `compareCursor = round(0.5 × (2×A - 1))`. With A = 100, B = 199: A at cursor 50 → progress 0.505 → `round(0.505 × 198) = 100`. So at the halfway point of a 100-frame trace you are shown frame 100 of a 199-frame trace — B's halfway point. The alignment is proportional and symmetric.

## 39.3 What percentage alignment is actually for

| Purpose | Explanation |
| --- | --- |
| **Visual sanity** | Two arrays of wildly different lengths cannot be index-aligned: frame 50 of a 118-frame bubble trace and frame 50 of a 375-frame merge trace are at completely different points in their execution. Index alignment would show, at the start, a nearly-initial bubble trace next to a nearly-finished merge trace |
| **A single slider for two traces** | The user drives one control; the second view follows. Proportional mapping is the simplest rule that keeps both views near their ends at the same time |
| **Honest by construction** | The transform is *obviously* a proportion, so nobody can mistake it for a claim about equivalent operations — especially with the on-screen caption |

## 39.4 Why direct frame-index alignment is worse

| Problem with `otherFrames[cursor]` | Consequence |
| --- | --- |
| The secondary array is `undefined` when `cursor >= otherFrames.length` | Merge sort has 375 frames and selection 492 on the same 24-element input; when the *shorter* trace is primary you would read past the end of the longer one — actually the safe direction — but in the reverse case, driving bubble (1,154 frames) against merge (375), 779 of the primary cursors would have no secondary frame at all. The array preview would be blank for two-thirds of the playback |
| Different work per frame | Step 10 of bubble sort is roughly "one comparison"; step 10 of merge sort is "enter recursion, compute a midpoint, recurse left" — index equality implies nothing |
| The end states drift apart | Index-aligned playback would finish the shorter trace long before the longer one, so the user would see a completed array beside an unfinished one for most of the run |

## 39.5 The limitations, stated without hedging

:::weak Five limitations of percentage alignment
1. **The mapping is not injective.** With A = 1,154 and B = 375, several primary cursors map to the same secondary frame (the ratio is ~3:1). Scrolling through the primary trace, the secondary preview will visibly *stall* on some frames.
2. **`round` introduces quantisation.** Small traces lose resolution: with B = 7 frames, only 7 distinct secondary positions exist, so most primary steps show an unchanged preview.
3. **Equal percentages are not equal work.** At 50% of a bubble sort you are halfway through ~276 comparisons; at 50% of a merge sort you are halfway through ~16 comparisons. The two views are at comparable *completion of their own trace*, nothing more.
4. **Frame counts are generator artefacts.** A generator that pushed fewer frames would appear "faster" if anyone mistakenly read playback length as speed. Merge sort's 375 frames vs bubble's 1,154 on the same input does **not** mean merge is 3× faster — it means the generators emit different numbers of states per unit of work.
5. **The alignment is not reversible.** The secondary view cannot drive the primary; there is no reverse mapping in the code.
:::

:::danger THE SENTENCE YOU MUST NOT GET WRONG
**Percentage-aligned replay ≠ same execution time.**

Aligned percentage means: *"both views are at the same fraction of their own recorded trace."*

Aligned percentage does **not** mean: *"the same amount of work has been done", "the same number of operations has elapsed", "the algorithms are at the same point in the array", or "one is ahead of the other."*

And separately: **frame count ≠ CPU runtime.** A frame is a recorded state, and the number of states a generator emits is a property of how that generator was instrumented — how many frames it pushes per comparison, whether it records both halves of a swap, whether it emits recursion-entry frames. CPU runtime is a property of executed machine instructions, cache behaviour and the engine's optimisations. There is no monotone relationship between them. **Concretely: merge sort has 375 frames to bubble sort's 1,154 on the same reversed 24-element input — and on any real machine merge sort is thousands of times faster.** If frame count predicted runtime, that measurement would be backwards.
:::

## 39.6 Ten interviewer attacks on alignment, with answers

:::q Attack 1. "So at 50% both algorithms have done half the work?"
No — at 50% both *recordings* are half-played. Half of bubble sort's 276 comparisons is 138 comparisons; half of merge sort's 16 comparisons on that input is 8. The percentage is a position in a recording, not a fraction of work.
:::

:::q Attack 2. "Then what is the alignment for?"
For the human watching. One slider has to drive two views; proportional mapping is the only simple rule that keeps both views near their beginnings and near their ends at the same time. With index alignment, the shorter trace would sit finished on screen for most of the longer one's playback.
:::

:::q Attack 3. "Why not align by operation count instead? That would be meaningful."
That would be more meaningful, and it is a real design option: you would record the cumulative comparison count on each frame (which the data already has — `currentStats.comps`) and map the primary cursor to the secondary frame whose counter is closest to the same value. It is harder because comparison counts are not monotone per frame index in a predictable way, and you would need a lookup. It is a legitimate improvement, and I'd describe it as a change I considered rather than something I implemented. [PROPOSED]
:::

:::q Attack 4. "Does the alignment ever show one algorithm ahead?"
No, and it cannot: proportional alignment guarantees both views reach 100% together. Any impression of "ahead" comes from reading the arrays, not the alignment.
:::

:::q Attack 5. "What happens when the secondary trace has only one frame?"
`otherFrames.length - 1 = 0`, so `Math.round(progress × 0) = 0` for every cursor — the preview is pinned to frame 0. The code guards the empty case with `otherFrames.length ? ... : 0`. Since every generator emits at least two frames for any valid input, the single-frame case is not reachable from the UI. [VERIFIED]
:::

:::q Attack 6. "What if `frames.length === 1`?"
Then `cursor / (frames.length - 1)` divides by zero → `Infinity` or `NaN` when the cursor is 0. `Math.round(NaN)` is `NaN`, and `otherFrames[NaN]` is `undefined`, which would crash `ArrayView`. This is unreachable because `parseInput` requires at least two values and every generator produces ≥ 2 frames even for empty input (measured: bubble/selection/insertion produce 2, merge/quick/heap produce 4). But it is an unguarded division, and the defensive fix is one line — clamp the denominator. [VERIFIED as a latent risk]
:::

:::q Attack 7. "Is the comparison panel showing me the current frame's counters or the whole run's?"
The whole run's. `last = frames.at(-1).currentStats` and the panel renders `last.comps` against `otherFrames.at(-1).currentStats.comps`. The *live* counters in the State Inspector are the current frame's, from `frame.currentStats`. Two different things on the same screen, deliberately labelled: "COMPLETE-RUN COMPARISONS" versus "State inspector / LIVE".
:::

:::q Attack 8. "So switching which algorithm is primary changes the numbers?"
No — the counts are properties of complete runs. Swapping primary and secondary swaps the labels and the meters, not the values. `frames.at(-1).currentStats.comps` is the same number regardless of which trace is currently being scrubbed.
:::

:::q Attack 9. "Can I compare an algorithm with itself?"
Yes, and that is a gap: the comparison `<select>` lists all six algorithms and is not filtered against the primary selection. Selecting the same algorithm twice produces two identical traces and two identical counts. It is harmless — nothing breaks, and the result is trivially consistent — but it is not guarded, and a self-comparison is not a meaningful experiment. [VERIFIED]
:::

:::q Attack 10. "Does the meter width mean anything?"
Only proportion: `Math.max(2, (count / max(1, last.comps, otherFrames.at(-1).currentStats.comps)) * 100)%`. The `Math.max(2, …)` floor ensures a non-zero count always shows a visible sliver instead of vanishing. It is a bar chart of two numbers, not a measurement. [VERIFIED]

:::
---

# 40 · Operation counts: what is recorded, and what it is not

> Three counters, three different meanings, one of which is comparable across algorithms.

## 40.1 The counter contract

[VERIFIED] Every generator maintains `let stats = { passes: 0, comps: 0, swaps: 0 }` and clones it into each frame as `currentStats`. The three fields are rendered in the State Inspector as "Comparisons", "Passes / calls¹" and "Recorded exchanges²" — the superscripts are real, and the page footnote defines them.

| Counter | Incremented where | Semantic meaning | Comparable across algorithms? |
| --- | --- | --- | --- |
| `comps` | Immediately before each value comparison | "A comparison of two values was evaluated" | **Yes** — this is the counter comparison mode uses |
| `passes` | Once per outer-loop iteration (bubble, selection, insertion), per recursion node (merge, quick), per extraction (heap) | "A structural unit of the algorithm occurred" | **No** — the unit differs per algorithm; the UI labels it "Passes / calls¹" |
| `swaps` | On each named exchange event | Bubble/selection/insertion: a real swap. Merge: a write from the buffer. Quick: a swap or pivot placement. Heap: a root exchange or a sift swap | **No** — the UI labels it "Recorded exchanges²" and the footnote says legacy generators count exchanges differently |

## 40.2 The exact increment sites, verified across all six generators

| Algorithm | `comps` incremented | `swaps` incremented | `passes` incremented |
| --- | --- | --- | --- |
| Bubble | once per inner iteration, before the `compare` frame | once per real swap | once per outer pass |
| Selection | once per `j` in the inner scan (i.e. once per element scanned) | once per actual exchange (guarded by `minIndex !== i`) | once per pass |
| Insertion | once per `while` iteration, before the comparison frame | once per shift | once per lift |
| Merge | once per element **taken from the buffer** | once per element **written back**, including the remaining element | once per non-base recursion call |
| Quick | once per `j` in the partition scan | once per swap inside the partition, plus once for the pivot placement | once per `quickSortHelper` call that partitions |
| Heap | **twice per heapify call, unconditionally** | once per sift swap, plus once per extraction | once per extraction |

:::danger The two counter behaviours that will be probed
1. **Heap sort double-counts.** Both increments happen even when the guard `left < size` / `right < size` is false, so a leaf's heapify still adds 2. Verified in the trace: on `[1,2,3]` the counter rises from 4 to 6 at a frame where the parent has no children at all.
2. **Merge sort counts writes, not swaps.** On the default 8-element input merge reports `swaps: 24` — that is 8 elements written back per level across roughly 3 levels of merging. Nothing was "swapped" in the bubble-sort sense; elements were copied out of a buffer into position.

Both are correct as *instrumentation*, and both would be wrong as *cross-algorithm measurements*. That is why the comparison panel uses only `comps` — and even then with an on-screen disclaimer.
:::

## 40.3 What the numbers do not mean

:::must Four things the counters are not
1. **Not runtime.** No timing code exists anywhere in the project. The counters are increments inside a synchronous function.
2. **Not memory.** Nothing measures allocation, frame size, or heap usage.
3. **Not portable across implementations.** A different bubble sort that counts a swap's two writes separately, or an insertion sort that shifts instead of swaps, would produce different numbers for the same algorithm.
4. **Not normalised.** The panel displays raw complete-run counts; the meter width is a proportion of the larger count, not a normalised score.
:::

## 40.4 Worked example — why "merge has fewer comparisons" is a statement about this input

Using the **measured** default input `[38, 66, 12, 85, 24, 57, 43, 19]`:

| Algorithm | Comparisons | Passes/calls | Exchanges | Frames |
| --- | --- | --- | --- | --- |
| Selection | 28 | 7 | 6 | 65 |
| Merge | **16** | 7 | 24 | 107 |
| Quick | 16 | 4 | 8 | 75 |
| Insertion | 22 | 7 | 16 | 76 |
| Bubble | 28 | 8 | 16 | 118 |
| Heap | 44 | 7 | 18 | 84 |

:::key How to read that table in an interview
"Merge sort does the fewest comparisons here — 16 against bubble's 28 — and the *most* writes, 24. So if you asked me which one is faster on this input, the counter data doesn't answer it: it tells me merge made fewer decisions and moved more data. In practice merge is much faster, because n log n versus n² dominates these constant-factor differences at any realistic n — but the counters don't show that, they show what was counted. This is precisely why I refuse to put a 'winner' in the comparison panel."

Notice also that **selection sort reports the same 28 comparisons as bubble** — and selection's count is provably input-independent (n(n−1)/2), while bubble's varies with the data. Two algorithms with equal counters that behave completely differently is the cleanest possible demonstration that a single counter is not a performance measurement.
:::

## 40.5 The counter questions

:::q "Which counter would you use to compare two algorithms, and why?"
Comparisons, because it is the only one with the same definition in all six generators: one evaluation of `a.val ? b.val`. Passes and exchanges are structurally different per algorithm — a "pass" is an outer-loop iteration in bubble sort, a recursion node in merge sort, and an extraction in heap sort. Comparing those is comparing units.
:::

:::q "So your comparison feature is fair?"
It is fair in the sense that both algorithms did the same kind of thing the same number of times on the same input, and the count reaches the end of the complete run. It is not a performance verdict, and the UI says so in two places. I'd say it is *honest* rather than *fair* — and the difference is that I've disclosed what it doesn't mean instead of letting the meter bars imply a ranking.
:::

:::q "How would you make the counters more rigorous?"
Three steps, in order of value: first, move every increment inside the guard that performs the actual comparison, so heap sort stops double-counting leaves; second, rename `swaps` per generator (or add a separate `writes` field for merge sort) so the field's meaning is explicit rather than "whatever this generator counts"; third, add per-algorithm metadata declaring what each counter means, and render that declaration next to the number. All three are data changes, not architecture changes. [PROPOSED]
:::

:::q "Is `currentStats` a copy or a reference?"
A copy — `{...stats}` on every frame push. If it were a reference, every frame would display the final counters, because the object is mutated in place throughout the run. This is the second of the two clones that make the frame model correct. [VERIFIED]
:::

:::check Red-line drills for Parts XII–XIV
- [ ] State the four disclosures the UI already makes, from memory.
- [ ] Compute `compareCursor` for A = 100, B = 40 at primary cursor 25 and 75.
- [ ] Say the "percentage ≠ time" sentence and the "frame count ≠ runtime" sentence.
- [ ] Quote the merge-vs-bubble frame counts (375 vs 1,154) as proof that frame count is not speed.
- [ ] Name the two counter quirks (heap double-count, merge write-counting).
- [ ] Explain why `comps` is the only comparable counter.
:::
