%PART: Honest weakness defence | PART XXXIII | Thirty weaknesses ranked by severity, each with the concession, the cost, the fix and the sentence to say.

# 59 · Naming the weaknesses first

> This chapter is the reason an interviewer trusts the rest of the book. Every project has weaknesses; the difference between a strong and a weak candidate is who says the number first.

## 59.0 The severity model

Rank by **user impact × cost to fix**, not by how embarrassing it is.

| Tier | Meaning | How to introduce it |
| --- | --- | --- |
| **S1** | A real defect a user can hit; produces a visible or console-level wrong behaviour | "There's a bug I found and haven't fixed — let me show you exactly where." |
| **S2** | A genuine gap in verification or robustness; nothing visibly broken today | "The tests can't catch this class of bug, and here's the two-line change that would." |
| **S3** | An honest limitation of scope, disclosed in the UI or the README | "That's a stated boundary, not an oversight — here's why the boundary is where it is." |
| **S4** | Polish, debt or migration work with no user-visible effect | "That's outstanding cleanup I'd rather do openly than have discovered." |

:::must The framing sentence for the whole section
"I'll start with what's wrong with it, because that's more useful to you than what works. There's one real bug I can point at precisely, two or three verification gaps that matter more than the bug, a handful of deliberate scope boundaries, and some cleanup. Ask me to go deeper on any of them."
:::

---

## 59.1 S1 — Defects you should volunteer

### W1 · Merge sort emits frames with duplicate element ids

**The concession.** "`generateMergeSort` copies the window into a buffer with shallow clones, so each cloned element keeps its original `id`, and then writes them back into the main array while the originals are still present. During those write-back frames the same id appears twice, and `ArrayView` keys its columns by `id`. Measured: 23 of 107 frames on the default input, 4 of 30 on `[3,1,2]`, 141 of 375 on the reverse-sorted 24."
**The cost.** "React logs a duplicate-key warning in development, and in production reconciliation with duplicate keys is unspecified — a column can fail to update for one frame. It never affects the final frame, and the final frame's uniqueness is asserted, so nothing persists."
**The fix.** "Minimal: `key={item.id + ':' + i}` — safe because every frame is a complete snapshot, so positional keys cannot corrupt anything across frames. Deeper: re-id the buffered clone at write time, which preserves element identity at the cost of changing what an id means for merge sort."
**Say this.** "It's a bug in my instrumentation, not in the sorting, and my own test suite can't see it because the id assertion only covers the last frame."

### W2 · The reducer accepts non-integer and `NaN` cursors

**The concession.** "`seek` clamps to `[0, length-1]` but never checks that the value is an integer. `seek(2.5)` stores `2.5`, and `frames[2.5]` is `undefined`; `seek(NaN)` stores `NaN`, because `Math.min(NaN, 19)` is `NaN`."
**The cost.** "Nothing today — every caller is a range input, a button computed from an integer, or a clamp-protected import. It's unreachable through the UI."
**The fix.** "`Math.trunc` plus an `Number.isFinite` guard in the reducer, and a property test asserting the cursor is always an integer in range."
**Say this.** "My stated invariant — that the cursor is always a valid index — is false for two inputs. It happens to be unreachable, but an invariant that's guarded by 'the UI won't do that' isn't an invariant."

### W3 · `tick` starts playback even when it was paused

**The concession.** "The `tick` case sets `playing: cursor + 1 < length - 1` unconditionally, so a `tick` dispatched while paused produces `playing: true`. It's UI-unreachable, because the only dispatcher is the timer effect, which is only scheduled while playing."
**The cost.** "None observable. It matters as a design point: a reducer that relies on its caller for correctness is harder to test in isolation."
**The fix.** "Either drop `playing` from `tick` entirely — the transport already has `toggle` for the flag — or return the state unchanged when `playing` is false."

### W4 · `windowTrace` has no positivity guard

**The concession.** "`generateWindow` rejects non-positive input with 'Use positive numbers and a positive target.', and the Counterexample page states the precondition on screen. But `windowTrace` — the reference the detector compares against — has no guard, so calling it directly on negative values gives a wrong answer silently. Measured: `[-1,3,2]` with target 3 returns 2 where the true answer is 1; `[1,-1,1,1]` with target 2 returns 4 where the true answer is 2."
**The cost.** "Contained, because the search space only generates values 1–4. It's an inconsistency in *where* the precondition is enforced: the library rejects, the reference does not."
**The fix.** "Either guard in `windowTrace` and have `generateWindow` call it, or document the reference as precondition-dependent in a comment."

### W5 · Merge's buffer state is invisible, so a value appears to vanish

**The concession.** "During the merge phase the element held in the buffer is not in the rendered array for a moment — frame 15 of `[3,1,2]` renders `[1,1,2]`, and the `3` is sitting in `tempArr`. The generator already emits `yOffset = 80` and a `buffer` frame for exactly this visual; `ArrayView` doesn't read `yOffset`, so the flag arrives and nothing draws it."
**The cost.** "A confusing half-second during merge playback, and a rendered array that is momentarily not a permutation of the input."
**The fix.** "Apply `translateY` when `yOffset` is non-zero, or render a second 'buffer lane' under the array during merges. No engine change is needed — the data is already there."
**Say this.** "The instrument emits the signal and the renderer ignores it. That's the cheapest visual fix in the project and I'd do it first."

---

## 59.2 S2 — Verification gaps (these matter more than the bugs)

### W6 · The id assertion is on the final frame only

**The concession.** "`tests/engine.test.js` asserts unique ids on `frames.at(-1)`, so a duplicate-id frame anywhere in the middle passes CI. That's why W1 survived to be found by hand."
**The fix.** "Move the assertion inside the per-frame loop: for each frame, `new Set(frame.array.map(x => x.id)).size === frame.array.length`."
**Say this.** "Two lines. It's the highest-value test change available in this repository, and it converts a browser console warning into a CI failure."

### W7 · Nothing renders a component, so the timer is untested

**The concession.** "The suite is `node:test` over pure modules. There is no jsdom, no React Testing Library, no browser automation. So the reducer is tested directly, and the wiring from the reducer to the timer to the frame is not tested at all."
**The fix.** "Component tests with fake timers asserting: play advances exactly one frame per interval; pause leaves zero pending timers; unmount cancels; changing speed while playing reschedules with the new delay. That covers the class of bug that a user would actually report."

### W8 · No error boundary anywhere

**The concession.** "A throw in any route unmounts the entire app rather than degrading one panel. `Suspense` provides a loading fallback, not an error fallback."
**The fix.** "A small boundary component mounted inside each lazy route."

### W9 · Nothing verifies the alignment formula beyond its arithmetic

**The concession.** "`compareCursor` is one `Math.round` expression and it's correct as arithmetic, but there's no test asserting it stays inside `[0, otherFrames.length - 1]` for every primary cursor, and no test of the degenerate case where a trace has one frame — which would divide by zero and produce `NaN`."
**The fix.** "A loop over every cursor in every algorithm pair, asserting the result is an integer in range. Practically unreachable, because every generator emits at least two frames, but that's an argument for the assertion, not against it."

### W10 · Import has nine defined behaviour cases and zero automated ones

**The concession.** "Chapter 42 lists the nine files a reviewer would try — invalid JSON, wrong version, unknown algorithm, non-array input, out-of-range values, oversized, valid, empty object, and a prototype-pollution attempt. None is covered by a test, because the handler lives in a component."
**The fix.** "Extract the gates into a pure `validateExperiment(text)` in the engine, test it directly, and have the component call it. That is a refactor worth doing for its own sake — it also makes the schema a single source of truth instead of two."

### W11 · No test would catch a regression in the derived clamp

**The concession.** "The render clamps the cursor to the frames length. Nothing asserts that no render ever sees `frames[undefined]`, so the safety net itself is unverified."

### W12 · `catch {}` on the storage write discards the reason

**The concession.** "The write path catches and reports 'Browser storage is unavailable' without logging the cause, so a quota error and a security error are indistinguishable to the user and to me."
**The fix.** "Log the exception and branch the message. One line, and it converts an unexplained failure into a diagnosable one."

---

## 59.3 S3 — Deliberate scope boundaries (disclosed, therefore defensible)

### W13 · A 24-element cap

"A frame is a full clone of the array plus a clone of the counters, so cost is instrumentation density times length. Twenty-four elements with the densest instrumentation — bubble sort on reverse-sorted input — produces 1,154 frames and about 981 KB. The cap is what keeps that from becoming a frozen tab, and the validation message says why: 'Small inputs keep every operation inspectable.'"

### W14 · Recording frames is memory-hungry by construction

"Full snapshots are the honest representation and they make rewind free, at roughly a kilobyte per frame. [PROPOSED] The fix is delta frames plus periodic keyframes, which trades reconstruction cost for memory. It's why the cap exists, not a mistake that hid the cap."

### W15 · `length` duplicated in the reducer state

"The reducer can't see `frames`, so the end position has to be in its state or in every action. Duplication means a code path that swaps the trace without dispatching `load` leaves a stale bound. A derived clamp keeps it invisible, and I'd rather remove the duplication than keep the guard."

### W16 · The trace is computed twice per commit

"`load()` calls the generator for the length, and the memo calls it again for the frames. Microseconds at this size, two chances to disagree at any other size."

### W17 · Counter units differ per algorithm

"'Passes / calls' means an outer-loop iteration in bubble sort, a recursion node in merge, an extraction in heap. 'Exchanges' is a real swap count in bubble and a buffer-write count in merge — 24 writes for eight elements. Hence the on-screen footnote and hence the comparison panel using comparisons only."

### W18 · Heap sort's comparison counter increments unconditionally

"Two increments per `heapify` call whether or not the children exist. Verified on a leaf: the counter rises with no children. It's a definition, not corruption, and the footnote says comparison counts are implementation-specific."

### W19 · Bubble sort has no early exit

"So a sorted 24-element input still costs 276 comparisons. The shipped algorithm is the textbook worst case, which is arguably a feature of a teaching tool — you can *see* the quadratic behaviour — but it is not the code you'd ship in a library."

### W20 · No backend, no accounts, no sync

"By design and stated in the README. The consequence a reviewer should know: `localStorage` is per-origin, per-browser and per-device, so experiments don't follow the user. Export is the portability path."

### W21 · `localStorage` is not secure storage

"It's readable by any script on the same origin and it is not encrypted. There's no sensitive data in a record — an algorithm key, an array of integers, a frame index, a timestamp — and the app never transmits anything anywhere."

### W22 · No URL-encoded full experiment

"`?algorithm` and `?compare` can be shared; a dataset, a frame and a saved experiment cannot. Sharing the whole experiment needs either a compact encoding in the query string or an export file, and the export file already exists — so a URL encoding is the missing half."

---

## 59.4 S4 — Debt and polish

### W23 · Nine dead components plus two dead modules
"`src/components/*` including a zero-byte `Layout.jsx`, plus `SimpleSort`, `EfficientSort`, a context file and some CSS. Zero importers; the production bundle confirms it. It's repo readability, nothing else."

### W24 · A `fetch` to a third-party counter sits in unimported code
"`CardsGrid.jsx` calls countapi. It has no importers so it never executes — which is also why it isn't a live privacy issue. It should be deleted, because it contradicts the app's own description."

### W25 · A lint rule is disabled for a directory
"`react-hooks/set-state-in-effect` is off for `src/modules/**` with a comment explaining that those pages are the legacy execution model. It's labelled debt with an address, and I'd rather keep the rule on for the code I'm actively writing than disable it globally."

### W26 · `SortingLab.jsx` is 596 lines
"Ten `useState` calls, a reducer, two effects, the derivations and the whole render in one file. The smell isn't that it uses `useState` — it's the size. The lines that would leave first are the persistence paths, which are pure enough to be lifted out and tested."

### W27 · The keyboard effect re-registers on every cursor change
"Its dependency array is `[cursor]`, so one `removeEventListener` and one `addEventListener` per frame. At six frames a second that's twelve DOM calls a second — harmless, and the fix is a relative `step` action that removes the dependency."

### W28 · The bar height has a 25% floor
"`25 + (|val|/max) * 75` means a zero renders a quarter-height bar and the mapping is affine rather than proportional. Legible at small magnitudes, and an undisclosed distortion — which is the part I'd change."

### W29 · No dark mode, no shortcut discovery, no onboarding
"All three are product polish. The shortcuts exist and are documented in the code rather than in the interface, which is the wrong place for a user to find a feature."

### W30 · Shuffle's first click reloads seed 42
"`setSeed(seed + 1)` then load with the pre-increment value, so the first click shows seed 42 and the sequence effectively starts behind. An off-by-one in the interaction, not in the generator, which is deterministic and asserted."

---

## 59.5 The three-sentence version

:::script The ninety-second weakness answer
"I'd start with the one real bug: merge sort's buffer write-back produces frames where the same element id appears twice — 23 of 107 frames on the default input — and my columns are keyed by id, so React warns about duplicate keys. It's my instrumentation, not the algorithm, the final frame is always clean, and the reason CI misses it is that my id assertion only covers the last frame; moving that assertion inside the per-frame loop is a two-line fix that would have caught it.

Then, ranked by what I'd fix next: the reducer accepts non-integer and NaN cursors, so my stated cursor invariant isn't actually true; nothing in the suite renders a component, so the timer wiring is untested; there's no error boundary; and the import gates are well designed and completely unautomated, which is a refactor I'd do — pull the validation out of the component into a pure function and test the nine cases directly.

And the boundaries that are deliberate rather than accidental: a 24-element cap because a frame is a full snapshot and the worst trace is 1,154 frames and about a megabyte; counters whose units differ per algorithm, which is why the comparison panel uses comparisons only and carries a footnote; no backend and no accounts by design; and localStorage, which I'd never describe as secure storage. The README lists most of this, and where it doesn't, it's because I found it after writing the README — which is the honest reason a doc goes stale."
:::

:::check Red-line drills for Part XXXIII
- [ ] Name the S1 defects in severity order without notes.
- [ ] Give W1 in under 45 seconds, including the measured numbers and the two-line fix.
- [ ] Say why W6 matters more than W1.
- [ ] Name three deliberate boundaries and why each is where it is.
- [ ] Deliver the ninety-second answer without hedging language.
- [ ] Never say "it's basically fine" about any of them.
:::
