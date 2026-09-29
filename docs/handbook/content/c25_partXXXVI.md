%PART: One hundred flashcards | PART XXXVI | Physical flashcards for spaced repetition — front, back, and the chapter to revisit when the back doesn't come.

# 62 · 100 flashcards

> Print this table, cut it into cards, and put the odd-numbered ones in one pile and the even-numbered in another. Review odd on day one, even on day two, both on day five. Anything you miss goes back a pile.

## 62.1 Engine, frames and algorithms (1–30)

| # | Front | Back |
| --- | --- | --- |
| 1 | The two mandatory clones in a frame | `cloneArray()` for the array, `{...stats}` for the counters |
| 2 | Why clone the array per frame | Otherwise every frame references one live array and they all show the final state |
| 3 | Frame field that identifies an element | `id`, shaped `block-<original index>` |
| 4 | Three metadata fields unique to merge/quick/heap | `pivotIndex`, `subArrayRange`, `yOffset` |
| 5 | `minimumIndex` is emitted by which generators | Bubble, selection, insertion |
| 6 | `isLifting` belongs to | Insertion sort |
| 7 | Why `codeLine` exists | Machine-readable step tag for explanation and test grouping |
| 8 | Worst trace in the app | 1,154 frames — bubble sort, reverse-sorted 24 elements, ~981 KB |
| 9 | Trace length: default 8 values, bubble | 118 |
| 10 | Trace length: default 8 values, selection | 65 |
| 11 | Trace length: `[3,1,2]`, merge | 30 |
| 12 | Minimum frames for an empty input | 2 (bubble/selection/insertion), 4 (merge/quick/heap) |
| 13 | Which sorts are stable | Bubble, insertion, merge |
| 14 | Which sorts are truly in place | Selection, heap (and bubble/insertion in practice) |
| 15 | Selection sort's comparison count | Exactly n(n−1)/2, input-independent |
| 16 | Bubble sort's early exit | Absent — 276 comparisons even on a sorted 24-element array |
| 17 | Insertion sort's `break` frame cost | One extra comparison before the break |
| 18 | Merge sort's exchange counter really counts | Buffer writes, not swaps — 24 for eight elements |
| 19 | Merge sort's `sortedIndices` | Stays empty for the whole trace |
| 20 | Merge's buffer `yOffset` | Set to 80 in frames; read by no live component (only by the unimported `EfficientSort.jsx`) |
| 21 | Quick sort's pivot | The last element — sorted input is the worst case |
| 22 | Quick sort's `sortedIndices` quirk | Can be out of order, e.g. `[1, 0]` |
| 23 | Heap sort's `heapify` | Recursive, with two unconditional comparison increments per call |
| 24 | Heap sort's declared auxiliary space | O(log n), footnoted as call-stack space |
| 25 | Merge sort's duplicate-id frames, default input | 23 of 107 |
| 26 | Merge sort's duplicate-id frames, reverse-24 | 141 of 375 |
| 27 | Why the duplicate ids occur | Shallow clones keep their `id` during the buffer write-back |
| 28 | The two-line fix for the duplicate-key warning | `key={item.id + ':' + i}`, safe because frames are full snapshots |
| 29 | What a rendered frame is a function of | One integer — the cursor |
| 30 | Which generator line range holds the LCG | `makeDataset`, engine.js 106–120 |

---

## 62.2 Reducer and transport (31–52)

| # | Front | Back |
| --- | --- | --- |
| 31 | Reducer state shape | `{cursor, length, playing}` |
| 32 | The four action types | `load`, `toggle`, `tick`, `seek` |
| 33 | `load` produces | `{cursor: 0, length, playing: false}` |
| 34 | `toggle` at the last frame | Resets the cursor to 0 — that's Replay |
| 35 | `tick` completion expression | `state.cursor + 1 < state.length - 1` |
| 36 | `seek` and `playing` | Every seek pauses |
| 37 | Unknown action type | Returns the same state object — React bails out |
| 38 | `seek(2.5)` stores | `2.5`, and `frames[2.5]` is undefined |
| 39 | `seek(NaN)` stores | `NaN` — `Math.min` propagates it |
| 40 | `seek(-5)` at length 20 | `0` |
| 41 | `seek(99)` at length 20 | `19` |
| 42 | `length = 1`, `toggle` then `tick` | `{0,1,true}` then `{0,1,false}` |
| 43 | `tick` while paused | Sets `playing` to true — UI-unreachable weakness |
| 44 | Where `length` lives | Reducer state — duplicated from `frames.length` |
| 45 | The render-time clamp | `Math.min(playback.cursor, frames.length - 1)` |
| 46 | Number of reducer consumers | Exactly one: `SortingLab` |
| 47 | Why the reducer is testable | It's an exported pure function |
| 48 | Missing action that would remove a stale-closure risk | A relative `step` action with a delta |
| 49 | What schedules the animation | A `useEffect` calling `setTimeout(speed)` |
| 50 | The timer effect's dependencies | `playing`, `cursor`, `speed` |
| 51 | Why not `setInterval` | It captures its delay and bursts after a stall |
| 52 | What happens without the effect cleanup | Duplicate timers and multi-frame jumps |

---

## 62.3 State, input and comparison (53–72)

| # | Front | Back |
| --- | --- | --- |
| 53 | `text` versus `input` | Editable draft string versus validated committed array |
| 54 | What a failed commit changes | Only the error message — the last good trace survives |
| 55 | `parseInput` accepts | 2–24 whole numbers, `^-?\d+$`, ≤ 999 in absolute value |
| 56 | Value that coercion would wrongly accept | `Number("")` is 0; `Number("1e3")` is 1000; `Number("0x10")` is 16 |
| 57 | Four speed delays | 600, 300, 160, 50 ms |
| 58 | Which speed label is rounded | 2× — 300/160 is 1.875× |
| 59 | Keyboard shortcuts | Space toggles, arrows seek |
| 60 | Keyboard effect's dependency | `[cursor]` — re-registers the listener every frame |
| 61 | `compareCursor` formula | `round(cursor / (frames.length-1) * (otherFrames.length-1))` |
| 62 | Why percentage alignment | Traces differ in length — 65 versus 118 on the default input |
| 63 | Does the alignment imply equal work | No — the percentages are positions in different recordings |
| 64 | Comparable counter across algorithms | Comparisons only |
| 65 | What "passes / calls" means | Unit-dependent: pass, recursion node, or extraction |
| 66 | Four on-screen comparison disclosures | Same input; percentage alignment; comparisons only; no timing |
| 67 | Default-input comparison counts | Bubble 28, selection 28, insertion 22, merge 16, quick 16, heap 44 |
| 68 | Where the counting caveats are stated | The footnote at the foot of the lab page |
| 69 | The bar height formula | `25 + (\|val\| / max) * 75` |
| 70 | What the 25% floor distorts | Zero renders a quarter-height bar; the scale is affine, not proportional |
| 71 | Why the same-input guarantee holds | Both memos take the identical `input` reference, and generators don't mutate |
| 72 | The meter's `Math.max(2, …)` | A visibility floor so a non-zero count draws a visible bar |

---

## 62.4 Persistence, import, build and CI (73–90)

| # | Front | Back |
| --- | --- | --- |
| 73 | Storage key | `algoviz.experiments.v1` |
| 74 | Record shape | `{version: 1, algorithm, input, cursor, createdAt}` |
| 75 | Records kept | Six most recent |
| 76 | Four storage-read defences | `\|\| "[]"`, `try/catch`, `Array.isArray`, algorithm-key filter |
| 77 | Why the algorithm filter exists | Saved data outlives code — a deleted algorithm must not crash the page |
| 78 | Where saved data goes through validation again | Clicking a record re-runs `parseInput` |
| 79 | Is `localStorage` secure | No — same-origin readable, unencrypted |
| 80 | Export payload fields | Four: version, algorithm, input, cursor |
| 81 | Which field export omits | `createdAt` |
| 82 | Import size limit | 16,384 bytes |
| 83 | Import gate that prevents prototype access | `Object.hasOwn(algorithms, data.algorithm)` |
| 84 | The import gap | Nine behaviour cases, zero automated |
| 85 | The fix for that gap | Extract the gates into a pure function and test it directly |
| 86 | Vite alias | `"vite": "npm:rolldown-vite@7.2.5"` with an `overrides` entry |
| 87 | Node floor | `>= 22.12.0`, matching `.nvmrc` |
| 88 | The four CI steps | `npm ci`, `npm test`, `npm run lint`, `npm run build` |
| 89 | What CI cannot prove | Rendering, timing, layout, browser behaviour — no browser automation |
| 90 | Route counts | 17 total; 14 render a lazy component (12 distinct `React.lazy` components) |

---

## 62.5 Testing (91–100)

| # | Front | Back |
| --- | --- | --- |
| 91 | Test runner and assertion library | `node:test` and `node:assert/strict` — no test dependency |
| 92 | 150 = | 6 algorithms × 25 inputs |
| 93 | The five hand-picked inputs | Empty, `[1]`, `[2,2,1]`, `[-4,0,3,-1]`, `[5,4,3,2,1]` |
| 94 | The four assertions per sorting case | Sorted final frame; input unmutated; deep-equal re-run; unique final ids |
| 95 | Why trace reproducibility is a product requirement | A saved experiment stores a frame index, meaningless if frames reorder |
| 96 | 768 = | 64 three-element arrays over values 1–4 × 12 targets |
| 97 | Why the oracle is inline | So it shares no code with the implementation — no correlated failure |
| 98 | The oracle's shared assumption | `sum >= target`, the problem's definition — so a misread spec can't be caught |
| 99 | The sliding window's precondition | Positive values and a positive target — enforced in `generateWindow`, not `windowTrace` |
| 100 | The single highest-value test change | Move the id-uniqueness assertion from the final frame into the per-frame loop |

:::must The three-card rule
If you remember only three cards, remember **25** (the measured duplicate-id frames), **62** (the alignment formula) and **100** (the two-line test fix). Those three are the ones that turn a rehearsed candidate into a credible engineer.
:::

:::check Red-line drills for Part XXXVI
- [ ] One full pass in under 25 minutes.
- [ ] Second pass with no more than 5 misses.
- [ ] Write cards 61, 62 and 100 from memory on paper.
- [ ] Explain card 27, 28 and 100 as one connected story.
:::
