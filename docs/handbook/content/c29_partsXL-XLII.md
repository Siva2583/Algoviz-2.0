%PART: Final checklist, night before, and the cheat sheet | PART XL–XLII | One hundred and ten verification items, a five-page revision sheet, and a single page for the last fifteen minutes.

# 67 · The final checklist

> Run this the day before. Tick only what you can do **out loud, without notes**. An unticked box is not a failure — it's tomorrow morning's revision list.

## 67.1 Project identity (1–12)

- [ ] 1. Give the project's one-sentence definition.
- [ ] 2. Give the one-sentence non-claim (not a benchmark, not a backend, not a proof).
- [ ] 3. Deliver the 30-second pitch.
- [ ] 4. Deliver the 60-second pitch.
- [ ] 5. Deliver the 2-minute pitch.
- [ ] 6. Name all six algorithms with their complexity in one breath.
- [ ] 7. State the tech stack and the one unusual item in it (the Vite alias).
- [ ] 8. State the Node floor and where it's declared.
- [ ] 9. Name the three runtime dependencies.
- [ ] 10. State what the app does *not* have: backend, database, accounts, network calls, analytics.
- [ ] 11. Explain "local-first" without overclaiming.
- [ ] 12. Name the repository's single commit and why it limits what Git can prove.

## 67.2 Engine and frames (13–32)

- [ ] 13. Name every field in a frame, including the per-algorithm extras.
- [ ] 14. State the two mandatory clones and what breaks without each.
- [ ] 15. Explain why the array holds `{id, val}` rather than numbers.
- [ ] 16. Explain what `codeLine` is for and who consumes it.
- [ ] 17. Give the frame counts for the default input for all six algorithms.
- [ ] 18. Give the worst trace in the app: 1,154 frames, bubble, reverse-24, ~981 KB.
- [ ] 19. Explain why frames are full snapshots rather than deltas.
- [ ] 20. State the memory trade-off of that decision with the measured number.
- [ ] 21. Explain the duplicate-identifier bug and the frames it affects (23/107, 141/375).
- [ ] 22. Give both fixes for it and their trade-offs.
- [ ] 23. Explain why merge sort's "exchanges" is a write count.
- [ ] 24. Explain why merge sort's `sortedIndices` stays empty.
- [ ] 25. Explain what `yOffset` is for, that the lab never draws it, and that the only reader is an unimported file.
- [ ] 26. Explain the heap counter's unconditional double increment.
- [ ] 27. Explain bubble sort's missing early exit and its cost (276 comparisons on sorted 24).
- [ ] 28. Explain why selection sort's comparison count is input-independent.
- [ ] 29. Explain insertion sort's `break` frame costing one comparison.
- [ ] 30. Explain why quick sort's pivot index is final immediately.
- [ ] 31. State which sorts are stable and which comparison decides it.
- [ ] 32. Name the three algorithms whose traces contain `minimumIndex`.

## 67.3 Reducer and playback (33–50)

- [ ] 33. State the reducer's state shape and initial value.
- [ ] 34. Name all four action types and what each produces, exactly.
- [ ] 35. Recite the `tick` completion expression.
- [ ] 36. Recite the `toggle` cursor expression and explain the replay behaviour.
- [ ] 37. Explain why every `seek` pauses.
- [ ] 38. Explain what an unknown action returns and why that matters in React.
- [ ] 39. Work the `length = 20, cursor = 5` simulation aloud.
- [ ] 40. Work the `length = 20, cursor = 19` simulation aloud.
- [ ] 41. Work the `length = 1` simulation aloud.
- [ ] 42. State the two reducer weaknesses: non-integer cursor, `NaN` cursor.
- [ ] 43. Explain why `length` is duplicated state and what guards the mismatch.
- [ ] 44. Explain why the reducer is in `engine.js` and not in the component.
- [ ] 45. Explain the timer effect's dependency array, item by item.
- [ ] 46. Argue why `setInterval` is the wrong choice here.
- [ ] 47. Explain what happens with no cleanup and with a missing dependency.
- [ ] 48. Explain what happens on unmount mid-playback.
- [ ] 49. Explain the keyboard effect's ignore-list and its `[cursor]` weakness.
- [ ] 50. Name the relative-`step` action as the fix for that weakness.

## 67.4 State, input and comparison (51–68)

- [ ] 51. Distinguish `text` from `input` and explain why both exist.
- [ ] 52. Explain what a failed validation changes (only `error`).
- [ ] 53. Recite `parseInput`'s rules: 2–24, `^-?\d+$`, safe integer, ≤ 999.
- [ ] 54. Give two characters coercion would wrongly accept.
- [ ] 55. Explain why the same-input guarantee holds (same reference, no mutation).
- [ ] 56. Recite the alignment formula.
- [ ] 57. Compute a secondary cursor by hand for two given lengths.
- [ ] 58. Explain why index alignment fails visibly (65 versus 118 frames).
- [ ] 59. State what "50%" does *not* mean.
- [ ] 60. Name the four on-screen comparison disclosures.
- [ ] 61. Name the three counters and which one is comparable.
- [ ] 62. Explain why "passes / calls" is unit-dependent.
- [ ] 63. Give the comparison counts for the default input for all six.
- [ ] 64. Explain the meter's `Math.max(2, …)` floor.
- [ ] 65. Explain the bar height formula and the 25% floor's distortion.
- [ ] 66. Explain why there are four speed labels but only three exact ratios.
- [ ] 67. State that there is no timing code anywhere in the project.
- [ ] 68. Name the label that distinguishes live counters from complete-run counters.

## 67.5 Persistence, import, testing, tooling (69–90)

- [ ] 69. Recite the storage key and the record schema.
- [ ] 70. State the record cap and where the slice happens.
- [ ] 71. Name the four read-path defences.
- [ ] 72. Explain why a record whose algorithm no longer exists is dropped.
- [ ] 73. Explain what `setSaved`'s position inside the `try` protects.
- [ ] 74. Explain why `localStorage` is not secure storage.
- [ ] 75. Recite the export payload's four fields and the omitted one.
- [ ] 76. Recite the import gates in order.
- [ ] 77. Explain the 16 KB size gate's purpose.
- [ ] 78. Explain `Object.hasOwn` versus `in` concretely.
- [ ] 79. Explain why imported values are re-run through `parseInput`.
- [ ] 80. State the import path's biggest gap (nine cases, zero automated).
- [ ] 81. Recite the four sorting assertions.
- [ ] 82. Compute the 150 breakdown aloud.
- [ ] 83. Explain why reproducibility is a product requirement.
- [ ] 84. Compute the 768 breakdown aloud.
- [ ] 85. Explain why the oracle is inline and independent.
- [ ] 86. State what the 768 do *not* prove.
- [ ] 87. State the sliding window's precondition and where it's enforced.
- [ ] 88. Recite the four CI steps in order.
- [ ] 89. State what CI cannot prove.
- [ ] 90. Recite the Vite alias and explain what an alias does.

## 67.6 Weaknesses, defence and meta (91–110)

- [ ] 91. Deliver the ninety-second weakness answer.
- [ ] 92. Rank the S1 defects and give each in two sentences.
- [ ] 93. Explain why the test gap matters more than the bug.
- [ ] 94. Name three deliberate scope boundaries and their justifications.
- [ ] 95. Name four pieces of dead code.
- [ ] 96. Explain the ESLint exception and call it labelled debt.
- [ ] 97. Give the "one thing I'd redo" answer.
- [ ] 98. Give the "what breaks first" answer with a number.
- [ ] 99. Give the "what would you refuse to build" answer.
- [ ] 100. Defend all fourteen resume claims with their file locations.
- [ ] 101. Say the three sentences you must never say (MERN, faster, sole author).
- [ ] 102. Answer "prove you wrote it" without overclaiming.
- [ ] 103. Name the untested behaviour a user would notice first.
- [ ] 104. Describe the app in 15 seconds to a non-engineer.
- [ ] 105. Walk the app live in 15 minutes with no dead air.
- [ ] 106. Answer five random hostile questions with composure.
- [ ] 107. Use the four-step cross-domain formula without thinking.
- [ ] 108. Name your three questions for the interviewer.
- [ ] 109. State the first thing you'd build with six more months.
- [ ] 110. State your metric for success and why it isn't usage.

---

# 68 · Night-before revision sheet

> **Three pages in this layout, five at most. Nothing new. If a fact isn't on this sheet, it isn't for tonight — it's for the morning, and it's covered by the cheat sheet in Chapter 69.**

## 68.1 The numbers

| Number | What it is |
| --- | --- |
| **150** | 6 algorithms × 25 inputs (5 hand-picked + 20 seeded of 10 values in [0,19]) |
| **768** | 64 three-element arrays over values 1–4 × 12 targets, versus a brute-force oracle |
| **1,154 / ~981 KB** | Worst trace and size — bubble sort, reverse-sorted 24 elements |
| **118 / 65 / 76 / 107 / 75 / 84** | Frames on the default input: bubble, selection, insertion, merge, quick, heap |
| **28 / 28 / 22 / 16 / 16 / 44** | Comparison counts on the default input, same order |
| **23 / 107** | Frames with a duplicate id — merge sort, default input (141 / 375 on reverse-24) |
| **24** | The dataset cap. Why: every frame is a full snapshot |
| **4** | Reducer actions: `load`, `toggle`, `tick`, `seek` |
| **2** | Mandatory clones: the array, and the counters |
| **600 / 300 / 160 / 50 ms** | Playback delays, labelled 0.5× / 1× / 2× / 6× (the 2× label is rounded; the real ratio is 1.875×) |
| **16,384** | Import size limit in bytes |
| **6** | Saved experiments retained |
| **1,736 / 251.78 kB / 80.90 kB** | Build: modules, main chunk, gzipped main chunk |
| **22** | Node version, in `.nvmrc`, in `engines`, and in CI |
| **14** | `node:test` groups |
| **11 of 16** | Lazy routes |

## 68.2 The five expressions

```
  cursor        = Math.min(playback.cursor, frames.length - 1)
  frame         = frames[cursor]
  tick playing  = state.cursor + 1 < state.length - 1
  toggle cursor = state.cursor === state.length - 1 ? 0 : state.cursor
  compareCursor = Math.round((cursor / (frames.length - 1)) * (otherFrames.length - 1))
```

## 68.3 The five sentences

1. **The architecture, in one line.** "The engine records complete immutable frames; the reducer is a four-action state machine over an index; the render is a pure function of one frame."
2. **The defensible comparison claim.** "Same input, aligned by percentage of trace — not equivalent operations — with recorded comparison counts only, and no wall-clock claims anywhere."
3. **The bug, in one line.** "Merge sort's buffer write-back stores shallow clones, so ids duplicate in 23 of 107 frames, and my columns are keyed by id."
4. **The testing gap, in one line.** "The id assertion only covers the final frame, which is why that bug passes CI; moving it inside the loop is a two-line fix."
5. **The honesty line.** "Everything I've said is either in a file you can open, a number I can re-measure, or a limitation I named first."

## 68.4 The three never-says

| Never | Say instead |
| --- | --- |
| "It's a full-stack MERN app" | "A client-side application — no backend, no database, no accounts" |
| "The comparison shows which algorithm is faster" | "It shows recorded comparison counts on the same input; timing isn't measured anywhere" |
| "I wrote every line" | "Git here is one squashed commit, so it can't establish authorship — but I can defend any decision in it" |

## 68.5 The ten attacks and their first sentence

| Attack | Your first sentence |
| --- | --- |
| "You didn't build this" | "I can't prove authorship from one commit — I can be interrogated on any part of it." |
| "The architecture is wrong" | "Every frame is a full clone; that's the constraint that caps input at 24, and here's the fix." |
| "Your tests prove nothing" | "The id assertion is final-frame-only, which is a real gap — here's the two-line fix." |
| "This is a toy" | "The algorithms are textbook; the instrumented recording is not." |
| "Your numbers are made up" | "Let me show you the script — I re-run it rather than quote it." |
| "Where's the backend?" | "There isn't one, by design — the README says so in plainer words." |
| "No coverage, no component tests" | "Correct. Line coverage wouldn't have caught the bug my per-frame assertion would." |
| "The reducer is sloppy" | "Clamping in the reducer hides invalid input — `seek(2.5)` stores 2.5, so the invariant is false." |
| "Dead code everywhere" | "Nine components with zero importers plus two dead modules; free to delete." |
| "What's your worst bug?" | "Merge sort's duplicate ids, 23 of 107 frames, and my tests can't see it." |

## 68.6 Tonight's routine

```
  1. Read 68.1 – 68.5 once, slowly. Do not add to them.
  2. Say the five sentences out loud, twice.
  3. Open the app. Load the default input. Play bubble sort for 10 seconds.
     Step forward three times. Seek to the end. Enable Compare on merge.
     Save the experiment. Export it. Do not fix anything.
  4. Confirm the repo state: `npm test` green, `npm run lint` clean.
  5. Put the cheat sheet (Chapter 69) on the desk for the morning.
  6. Sleep. The frame counts will still be there.
```

:::note What not to do tonight
Do not read a new chapter. Do not chase a fact you can't find in five minutes. Do not rewrite the reducer in your head. Do not practise the answer you haven't rehearsed yet — the rehearsed ones are the ones that work. Tonight is consolidation, and the most valuable thing you can do is close the book while the numbers are still quiet in your head.
:::

---

# 69 · The fifteen-minute cheat sheet

> Two pages. Read them in the last fifteen minutes before the call. Nothing here is new — it's the whole interview compressed into what you'd want if you could only keep one sheet.

## 69.1 The pitch — 20 seconds

"AlgoViz records the complete execution of six sorting algorithms as inspectable frames, then lets you replay them. You pick 2–24 integers, pick an algorithm, and you get every comparison and swap as a step you can pause, rewind, and interrogate. I run two algorithms on the same input to compare their recorded comparison counts, and you can save an experiment locally or export it as JSON. It's entirely client-side — no backend, no accounts, nothing leaves the browser."

## 69.2 The three files

| File | Holds |
| --- | --- |
| `src/lab/engine.js` | The algorithm registry, `parseInput`, the playback reducer, `makeDataset`, `windowTrace`, `findCounterexample` |
| `src/lab/SortingLab.jsx` | Every piece of UI state, both effects, the derivations, `ArrayView`, persistence, comparison |
| `tests/engine.test.js` | 14 `node:test` groups — the 150 sorting cases and the 768 window cases |

## 69.3 The architecture in four lines

```
  ENGINE        input -> 6 generators -> frames[] : [{array, activeIndices, sortedIndices,
                codeLine, currentStats, msg, ...extras}]   immutability = 2 clones
  TRANSPORT     useReducer({cursor, length, playing}) with load | toggle | tick | seek
  DERIVATION    cursor = min(playback.cursor, frames.length-1);  frame = frames[cursor]
  RENDER        ArrayView(frame) — pure; key={item.id}; height = 25 + |val|/max * 75 %
```

## 69.4 The reducer, complete

```js
load   -> { cursor: 0,        length: action.length, playing: false }
toggle -> { cursor: cursor === length - 1 ? 0 : cursor, playing: !playing }
tick   -> { cursor: min(cursor + 1, length - 1), playing: cursor + 1 < length - 1 }
seek   -> { cursor: clamp(action.cursor, 0, length - 1), playing: false }
default->  state   // same reference, React bails out
```

## 69.5 Numbers to have ready

**150** cases · **768** cases · **1,154** frames / **~981 KB** worst trace · **24** element cap · **23/107** duplicate-id frames · **16,384** byte import limit · **6** saved experiments · **22** Node · **14** test groups · **14/17** routes backed by lazy imports (12 distinct components) · **251.78 kB** main bundle / **80.90 kB** gzip.

## 69.6 The four disclosures around comparison

Same input · alignment by percentage of trace, **not equivalent operations** · comparisons only, since pass and exchange units differ per algorithm · **no wall-clock claims** anywhere in the project.

## 69.7 Top weaknesses, ranked

1. Merge sort's duplicate ids in 23/107 frames — real, measured, fixable in one line of key logic.
2. The test's id assertion covers only the final frame — the two-line fix that would have caught it.
3. The reducer accepts non-integer and `NaN` cursors — my stated invariant is false.
4. No component or browser tests — the timer wiring is untested.
5. No error boundary. 6. Import's nine cases are unautomated. 7. `windowTrace` lacks `generateWindow`'s positivity guard. 8. `SortingLab.jsx` is 596 lines.

## 69.8 Answers for the six most likely questions

| Question | The first line of your answer |
| --- | --- |
| "What does this do?" | "It records an algorithm's whole execution as inspectable frames and lets you replay it." |
| "Where's the complexity?" | "Not the algorithms — the instrumentation, and keeping the trace and the result from disagreeing." |
| "What's your worst bug?" | "Merge sort's buffer write-back duplicates element ids in 23 of 107 frames." |
| "How do you know it works?" | "150 property cases, 768 differential cases against an independent oracle, and four CI gates." |
| "What's not tested?" | "Anything that renders — no component, browser or timer test exists." |
| "What would you do next?" | "Delta frames with keyframes, to lift the 24-element cap." |

## 69.9 Your three questions for them

1. "What does the first month look like for someone in this role?"
2. "How does the team decide when something is tested enough?"
3. "What's the hardest part of this codebase to work in, and why?"

## 69.10 The last thing

:::must Before you close this page
"Everything I've said is either in a file you can open, a number I can re-measure, or a limitation I named first. If you want to see any of it running, I can open the app — and if you want to see what's wrong with it, ask me about merge sort."
:::
