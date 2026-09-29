%PART: Code walkthrough master section | PART XXIX | Thirty code blocks, explained line by line, with the question an interviewer will ask about each.

# 55 · Thirty walkthroughs

> Format: the code, then **What it does** · **Line by line** · **Why it matters** · **The question** · **The trap**.

## Block 01 · The algorithm registry

@@code src/lab/engine.js 1 17

- **What it does** — declares the six algorithms as data: a generator function plus display metadata.
- **Why it matters** — this object is the only place algorithms are registered, so everything else iterates it: the algorithm `<select>`, the comparison `<select>`, the save/import validators (`Object.hasOwn(algorithms, …)`), the test loop (`Object.entries(algorithms)`), and the label lookup `algoviz.experiments.v1` → display name on the saved list.
- **The question** — *"What happens if you add a seventh algorithm?"* Add a generator, add an entry here, and everything follows: the dropdowns, the comparison panel, the tests (the loop is data-driven, so it grows automatically), the default-algorithm fallback, and the import validator. The only thing you would have to add by hand is tutorial content, because `simpleSortData[algo] || sortingData[algo]` needs an entry.
- **The trap** — someone will ask whether `time` and `space` are measured. They are **declared strings**, rendered in the panel as static text. Say so before you are asked: *"Those are hand-written metadata, not measurements — the app does not benchmark anything."*

## Block 02 · `parseInput` in full

@@code src/lab/engine.js 63 79

- **What it does** — the single definition of a valid dataset. Throws on violation; returns `number[]` otherwise.
- **Line by line** — (63) a pure exported function; (64–65) type and emptiness, catching `null` from a missing query param; (66) split on commas, keeping empty segments so `"1,,2"` produces a length that fails later; (67–70) the 2–24 count rule with a message that explains *why* (readability); (71–74) the anchored integer regex on each trimmed part; (75–78) `Number.isSafeInteger` plus the ±999 bound; (79) returns the parsed array.
- **Why it matters** — three callers, all through this one function: the form's `apply()`, the saved-experiment click handler, and the JSON import (which joins the array back to a string first). One validator means the file format cannot drift from the UI.
- **The question** — *"Why split before validating instead of using `Number()` and `isNaN`?"* Because `Number("")` is 0, `Number(" ")` is 0, `Number("1e3")` is 1000, `Number("0x10")` is 16 and `Number("Infinity")` is `Infinity`. Coercion silently accepts all of them. Validating the grammar with an anchored regex and only then converting states the accepted form explicitly.
- **The trap** — `Number.isSafeInteger(n)` can never fail here, because the regex has already restricted the string to digits. It is belt-and-braces rather than load-bearing — but it is what documents the intent, and the ±999 bound is the load-bearing half. Know the difference.

## Block 03 · The reducer

@@code src/lab/engine.js 80 105

Summarised in Chapter 21. **The question** to expect: *"Change `seek` so that seeking to the current position does not pause."* `cursor: action.cursor === state.cursor ? state.playing : false` — and then note that this makes the reducer's behaviour depend on a value-comparison, which is a design decision rather than a bug fix.

## Block 04 · The seeded dataset generator

@@code src/lab/engine.js 106 120

- **What it does** — a deterministic pseudo-random dataset generator with four shapes.
- **Line by line** — (107) coerce the seed to an unsigned 32-bit integer; (108–111) the LCG step with `Math.imul` for 32-bit-correct multiplication and `>>> 0` to keep the state unsigned, returning a float in `[0,1)`; (112–115) exactly ten values in the range 5–94; (116–118) shape transforms; (119) the identity case.
- **Why it matters** — the "shuffle" button and the four presets both go through it, and the tests rely on same-seed equality. It is why "random" in this app is reproducible.
- **The question** — *"Why `Math.imul` and not plain multiplication?"* `1664525 * state` exceeds 2⁵³ for large states, and JavaScript numbers lose integer precision beyond that — so the sequence would stop being reproducible. `Math.imul` performs the multiply as a 32-bit operation, matching the LCG's arithmetic definition.
- **The trap** — a questioner may point out that a hand-rolled LCG has poor statistical properties versus `crypto.getRandomValues` or a seeded PRNG library. The answer: *"Correct — it is not for simulation, it is for reproducibility. Its only requirement is that the same seed gives the same ten numbers, which is exactly what my test asserts. If I needed good distribution I would use a library or `crypto`, and I would no longer have reproducibility for free."*

## Block 05 · The timer effect

@@code src/lab/SortingLab.jsx 106 110

Covered in Chapters 24–26. **The question**: *"What happens if you remove `playback.cursor` from the array?"* The effect schedules one timeout, the tick changes the cursor, and the effect does not re-run — so playback advances exactly one frame and stops. That is the clearest demonstration of why `cursor` is in the array: it is the re-scheduling trigger.

## Block 06 · The keyboard effect

@@code src/lab/SortingLab.jsx 111 136

- **What it does** — a global `keydown` listener providing Space (play/pause) and the arrow keys (step).
- **Line by line** — (112) the handler; (113–120) the ignore-list for form controls, content-editable targets and modifier keys; (121–124) Space with `preventDefault`; (125–132) the arrows, each seeking `cursor ± 1`; (134) registration; (135) cleanup; (136) the `[cursor]` dependency.
- **Why it matters** — it is the second of the project's two effects and the only place a stale closure would bite.
- **The question** — *"Why does the arrow handler read `cursor` instead of using a functional update?"* Because the reducer's action is an absolute `seek`. React state updaters support functional updates, but `dispatch` with a reducer does not — the action is a value. Hence the effect depends on `cursor`. The cleaner design is a relative action.
- **The trap** — *"a handler that reads state and is registered on `window` must be re-registered when that state changes, or it will be stale — and it must be removed, or it will accumulate."* Say both halves; the second half is what most candidates forget.

## Block 07 · The `load` function

@@code src/lab/SortingLab.jsx 137 147

- **What it does** — the single entry point for committing a new dataset or algorithm.
- **Line by line** — (137) default parameter `algorithm = algo`; (138) commit the array; (139) normalise the draft text; (140) set the algorithm; (141–144) dispatch `load` with the **length of a freshly computed trace**; (145–146) clear both banners.
- **Why it matters** — every route into the lab funnels through here: apply, presets, shuffle, saved experiments, import.
- **The question** — *"Why do you call `run()` again for the length?"* Because the reducer needs `length` and cannot see the frames. It costs a second full generation per commit. The fix is to derive `length` from the memo in an effect, or to have the reducer take the frames. [PROPOSED]
- **The trap** — being unaware of the double generation. Volunteer it: *"That's a deliberate-looking inefficiency I'd remove — it's a second full trace per input change, which is free at this input cap and would matter at scale."*

## Block 08 · `apply` and the error path

@@code src/lab/SortingLab.jsx 148 155

- **What it does** — validates and commits, or reports the validation error.
- **Line by line** — (149) `e?.preventDefault()` — optional chaining because `apply` is called both from the form and programmatically with no event; (150–154) the try/catch around `load(parseInput(text))`.
- **Why it matters** — the failed path touches exactly one piece of state (`error`), which is why a bad input never destroys the working visualisation.
- **The question** — *"What state changes when validation fails?"* Only `error`. Not `input`, not `frames`, not the cursor, not `playing`. That is the design principle: a failed commit must not destroy the last good state.
- **The trap** — an interviewer may ask why the error is not cleared on the first keystroke. Today it persists until the next successful action, which means an old error can sit under new text. A `setError("")` in the `onChange` handler is the UX refinement [PROPOSED].

## Block 09 · Import, gate by gate

@@code src/lab/SortingLab.jsx 156 180

Covered in Chapter 42. **The question**: *"What is `event.target.value = ""` for?"* It clears the file input so selecting the same file twice fires a second `change` event. Without it, the second selection is a no-op because the input's value never changed.

## Block 10 · Save

@@code src/lab/SortingLab.jsx 181 197

Covered in Chapter 41. **The question**: *"Why is `setSaved` inside the try, after `setItem`?"* So the in-memory list only advances if the write succeeded. If the write throws and the state had already advanced, the UI would show a saved experiment that does not exist in storage — the list would survive until reload and then silently lose an entry.

## Block 11 · The derivation block

@@code src/lab/SortingLab.jsx 198 203

- **What it does** — computes everything the render needs from state, with no state of its own.
- **Line by line** — (198–200) `meta` (the registry entry), `stats` (the current frame's counters, defaulting to `{}` so a missing field renders as 0 rather than throwing), `last` (the complete-run counters); (201–203) the percentage-aligned secondary cursor.
- **Why it matters** — this one expression is the entire comparison alignment feature.
- **The question** — *"Why is `stats = frame.currentStats || {}`?"* Defensive: if a generator omitted `currentStats`, reading `.comps` would throw. With `{}`, the tile renders 0. It is a cheap guard on an interface that six independent generators implement.
- **The trap** — the `|| {}` masks a schema violation rather than surfacing it. A stricter design would assert the field's presence in a test and let a missing field fail loudly in development.

## Block 12 · `ArrayView`

@@code src/lab/SortingLab.jsx 22 48

- **What it does** — renders one frame as a row of bars.
- **Line by line** — (23) the height normaliser: the largest absolute value in this frame, floored at 1 to avoid division by zero; (29–33) map over the array, deriving three booleans; (34) `key={item.id}` — stable element identity; (36) the class list combining active/sorted/pivot; (37) the height percentage `25 + (|val| / max) * 75`; (39–40) the value label and the state glyph; (42) the index label.
- **Why it matters** — the entire visualisation is this one pure function of a frame. Nothing else in the UI reads the array.
- **The question** — *"Why `key={item.id}` and not the index?"* Because identity is what the visualisation is about. With index keys, React would reuse the DOM node positionally, and since the trace shows movements, a swap would look like a value change instead of a move. The ID travels with the element through every swap. Also: with duplicate *values* in the array, only the ID distinguishes them.
- **The trap** — this is where the merge-sort duplicate-key bug lives. Know it: *"Except in merge sort's buffer write-back frames, where the same id temporarily exists twice — 23 of 107 frames on the default input. I'd fix it by making the key unique per frame, since every frame is a full snapshot."*

## Block 13 · The status tag ternary chain

@@code src/lab/SortingLab.jsx 305 313

- **What it does** — derives "Completed" / "Running" / "Paused" / "Ready" from two values.
- **The question** — *"Why is the order of the conditions important?"* Because `cursor === frames.length - 1` must be tested first: a completed trace with `playing` false would otherwise fall through to the `cursor ? "Paused" : "Ready"` branch and report "Paused" for a finished run. Order encodes precedence.

## Block 14 · The timeline range input

@@code src/lab/SortingLab.jsx 356 368

- **What it does** — the scrubber.
- **Line by line** — `min="0"`, `max={frames.length - 1}`, `value={cursor}` (the derived cursor), `onChange` seeking `Number(e.target.value)`, and a text label showing `cursor / frames.length - 1`.
- **Why it matters** — it is one of five controls that all reduce to `seek`.
- **The question** — *"Why `Number(...)`?"* Because a DOM input's value is always a string. `Math.min("10", 19)` happens to work by coercion, but `"10" < 19` and arithmetic on a string are the kind of implicit coercion that eventually bites. Converting at the boundary is explicit.
- **The trap** — *"what is the maximum value of this input?"* `frames.length - 1`. If it were `frames.length` the user could select an index that does not exist, and the reducer would clamp it — a silently ignored interaction.

## Block 15 · The transport buttons

@@code src/lab/SortingLab.jsx 371 408

- **What it does** — restart, step back, play/pause/replay, step forward.
- **The question** — *"Explain the disabled conditions."* Back: `disabled={!cursor}` — falsy only at 0 (given the clamp, `cursor` is always a non-negative integer). Forward: `disabled={cursor === frames.length - 1}`. The asymmetry is idiomatic rather than meaningful.
- **The trap** — *"what does the Play button do at the last frame?"* It shows "Replay" and `toggle` resets the cursor to 0. That behaviour lives in the reducer, not the button — the button only changes its *label*.

## Block 16 · Speed select

@@code src/lab/SortingLab.jsx 410 421

- **What it does** — four preset delays.
- **The question** — *"Are the labels accurate?"* 600/300 = 0.5×, 300/300 = 1× correct; 300/160 = 1.875× but labelled 2×; 300/50 = 6× correct. Three of four are exact; the 2× label is rounded. Say it before you are asked.

## Block 17 · The state inspector

@@code src/lab/SortingLab.jsx 435 462

- **What it does** — three metric tiles plus three raw-value rows.
- **The question** — *"Which frame's counters are these?"* The current frame's — `stats = frame.currentStats`. The comparison panel shows complete-run counters. Two different things on one screen, deliberately labelled "LIVE" and "COMPLETE-RUN COMPARISONS".

## Block 18 · The comparison panel

@@code src/lab/SortingLab.jsx 513 539

- **What it does** — two labelled counts and two proportional meters.
- **Line by line** — the array of `[name, count]` pairs; the meter width expression with its `Math.max(2, …)` visibility floor; the explanatory paragraph.
- **The question** — *"What does the meter width mean?"* Only the ratio between two counts, scaled to the larger. Not a score, not a percentage of anything meaningful.
- **The trap** — *"so the wider bar is the faster algorithm"* — an invitation to overclaim. Correct answer: *"No. It is the algorithm that performed more comparisons on this input. That is a count of decisions, not a measurement of speed, and the panel text says so."*

## Block 19 · The page footnote

@@code src/lab/SortingLab.jsx 587 592

- **What it does** — three superscripted disclaimers.
- **Why it matters** — this is the most interview-valuable twenty lines in the file. It documents that pass/call counters are implementation-specific, that exchange counters are counted differently per generator, that comparison mode uses comparisons only, and that trace storage is bounded by the 24-element cap.
- **The question** — *"Did you write these because you were worried about criticism?"* The best answer: *"I wrote them because the alternative was a UI that implies more than the code measures. A comparison panel with two bars invites the reader to rank them; the footnote is what stops that being a claim I can't support."*

## Block 20 · Bubble sort, the whole generator

@@code src/modules/core/algorithm/sorting/algorithms/bubbleSort.js

Covered in Chapters 31–33. **The question**: *"Where exactly is the trace made immutable?"* Two places: `cloneArray()` on every push (so the array is copied), and `{...stats}` on every push (so the counters are copied). Everything else in a frame is a primitive, a fresh literal, or a spread of `sortedIndices`. Name all three.

## Block 21 · Merge sort's buffer write-back

@@code src/modules/core/algorithm/sorting/algorithms/mergeSort.js 80 122

- **What it does** — copies the window into a buffer and merges it back.
- **Line by line** — (81) the shallow-clone copy into `tempArr`; (83–85) window-local and array-global index bookkeeping; (87) the merge loop condition; (92–96) the comparison frame; (98–108) the left branch, writing `tempArr[leftIdx]` into `arr[k]` and pushing a `write_left` frame; (110–120) the right branch; (124–131) the "remaining elements" announcement; (133–157) the two tail loops that copy whatever is left.
- **Why it matters** — it is the source of the duplicate-ID frames, the reason the merged value appears to vanish, and the reason merge sort's "swaps" counter is really a write counter.
- **The question** — *"Is this in-place?"* No — it allocates an O(n) buffer per merge, which is why the algorithm's declared auxiliary space is O(n). The recursion is O(log n) deep on top of that.
- **The trap** — *"why does the array show a duplicate value?"* Because the buffered element is a shallow clone that keeps its `id`, and the write-back overwrites the left of the window while the originals are still present. This is the bug; own it.

## Block 22 · Quick sort's partition

@@code src/modules/core/algorithm/sorting/algorithms/quickSort.js 76 122

- **What it does** — Lomuto partition around the last element.
- **Line by line** — (77) the pivot **value** is captured, so later swaps cannot change the pivot; (78) `i = low - 1`, the boundary of the ≤ region; (80–84) the pivot-selection frame; (86) the scan, excluding `high`; (87–92) the comparison frame and increment; (94) the `<=` test — this is the stability-breaking and worst-case-driving comparison; (95–120) the conditional swap with both frames, plus the "already in position" branch; (124–147) the pivot placement with its own pair of frames and an else branch; (149) returns the pivot's final index.
- **Why it matters** — the pivot's index is final the instant the partition returns, which is why `quickSortHelper` pushes it into `sortedIndices` immediately afterwards. That is the clearest invariant in the project.
- **The question** — *"Why capture `pivot = arr[high].val` before the loop instead of comparing against `arr[high]`?"* Because the loop swaps `arr[i]` and `arr[j]`, and if the pivot were read from the array it could be moved by a swap — the comparison would then be against the wrong value. Capturing the value is what makes the partition correct.
- **The trap** — *"is it stable?"* No. `<=` sends equal elements left, and the long-distance swaps reorder them.

## Block 23 · Heap sort's `heapify`

@@code src/modules/core/algorithm/sorting/algorithms/heapSort.js 20 71

- **What it does** — sift down, recursively, with two unconditional comparison increments.
- **Line by line** — (21–27) compute the candidate children and build the highlight list; (29–33) the `pointers` frame; (35–38) the left-child comparison with an unconditional increment; (40–43) the right-child comparison, also unconditional; (45–49) the `compare_children` frame; (51–70) the swap, the two frames, and the recursive call on the affected subtree.
- **Why it matters** — the unconditional increments are why heap sort's comparison counter is inflated on leaf nodes, and why the counters must not be compared across algorithms.
- **The question** — *"Why is this recursive when a loop would be O(1) space?"* Because recursion is what a reader expects from `heapify` and it keeps the code aligned with the pseudocode, while the panel honestly declares `O(log n)` auxiliary space with a footnote. Converting it to a `while (true)` sift loop is the O(1) version and is what I would write on a whiteboard.
- **The trap** — *"how many comparisons does heapify perform?"* Careful: it *increments* twice per call regardless of whether the children exist. The number of comparisons *evaluated* is at most two and often zero.

## Block 24 · The `windowTrace` bug flag

@@code src/lab/engine.js 121 151

- **What it does** — one function producing both the correct and the deliberately buggy sliding-window behaviour.
- **Line by line** — (122–124) window state and `best = Infinity`; (126–134) expand right, push an expand frame; (135) the shrink loop; (136) the **entire bug**, in one line: `if (!buggy || sum === target)`; (137–146) the record/explanation frame with a different message for the buggy branch; (147) shrink; (150) normalise `Infinity` to 0.
- **Why it matters** — this is the counterexample lab's engine. Two behaviours in one function guarantees they share the same framing and differ only in the condition, which is exactly what makes the comparison instructive.
- **The question** — *"Isn't having a buggy implementation in production code dangerous?"* It is unreachable unless the `buggy` flag is passed, which happens in exactly two places: the counterexample component and the tests. The value is that it makes the detector testable — if `findCounterexample` stopped finding divergences, the test fails. That is a "test the instrument" pattern.
- **The trap** — note that `windowTrace` does **not** guard against non-positive input, while `generateWindow` does. So calling the reference directly on negative numbers gives a wrong answer silently. I measured it: `[-1,3,2]` with target 3 gives 2 instead of 1.

## Block 25 · The bounded search

@@code src/lab/engine.js 152 169

Covered in Chapter 46. **The question**: *"Is `[2]` with target 1 the smallest counterexample?"* The precise answer: it is the first failure in the defined enumeration order — increasing length, then lexicographic by the digit scheme, then increasing target. It is not a minimality proof, and your own UI says exactly that.

## Block 26 · The test harness for sorting

@@code tests/engine.test.js 12 36

- **What it does** — one data-driven test group per algorithm, asserting four properties over 25 inputs.
- **Line by line** — (12) iterate the registry; (13) the group name including the algorithm key; (14–21) the input list; (22–23) snapshot the input and run the generator; (24–27) sortedness; (28) input preservation; (29) trace reproducibility; (30–33) final-frame ID uniqueness.
- **Why it matters** — it is the entire correctness story for the engine, and it is 24 lines long because the registry is data.
- **The question** — *"Which assertion finds the most bugs per line?"* The `deepEqual(frames, algorithm.run(input))` on line 29. It compares the whole recording including every message string and counter value, so any non-determinism anywhere in a generator fails it.
- **The trap** — *"does it check every frame's IDs?"* No — only the final frame. That is precisely why the merge duplicate-key bug survives CI. Saying this unprompted is the single strongest thing you can do in this section.

## Block 27 · The brute-force oracle

@@code tests/engine.test.js 82 101

- **What it does** — 768 comparisons against an independently written reference.
- **Line by line** — (83–88) build the array from base-4 digits; (89) targets 1–12; (90–97) the oracle: every start, every end, running sum, record the shortest qualifying length; (98) compare the implementation against it.
- **Why it matters** — it is the only place in the project where correctness is established against something other than my own code.
- **The question** — *"Why is the oracle written in the test file rather than imported?"* So it cannot share code with the implementation. If both used a shared helper, a bug in the helper would infect both and the test would pass while both were wrong — correlated failure.
- **The trap** — the oracle uses `sum >= target`, the same specification as the implementation. That is *required* (it is the definition of the problem) but it means the tests verify agreement with the specification, not the specification's correctness.

## Block 28 · The routing table

@@code src/pages/Home.jsx 39 100

Covered in Chapter 49. **The question**: *"What is `key="advanced"` for?"* To force a distinct component instance so the initial-algorithm computation, which reads `location.pathname` at mount, is re-evaluated when navigating between the two sorting routes.

## Block 29 · The ESLint configuration

@@code eslint.config.js

- **What it does** — flat ESLint config with a deliberate, documented exception.
- **Line by line** — ignores `dist`; applies `js.configs.recommended`, the React Hooks rules and the React Refresh rules to all JS/JSX; sets 2020+ syntax, browser globals and JSX parsing; overrides `no-unused-vars` to permit `^[A-Z_]` (component names and constants); **disables `react-hooks/set-state-in-effect` for `src/modules/**`** with a comment explaining that the legacy pages synchronise editable inputs to preview state in effects; keeps the rule on for the new lab code; allows the `useMode` export from a context file; and gives the test files Node globals.
- **Why it matters** — it is the only place where the project's two generations are explicitly distinguished by policy, and it is documented in code rather than in a wiki.
- **The question** — *"Why disable a lint rule instead of fixing the code?"* Because the rule flags a pattern that is a genuine design flaw in *new* code and an intentional, working pattern in *legacy* code. Fixing the legacy modules means restructuring their input synchronisation, which is a real migration with no tests to catch regressions. Scoping the exception to that directory keeps the guard active everywhere it can be acted on, and the README documents it. The alternative — disabling it globally — would have removed the guard from the code I was actively writing.
- **The trap** — *"isn't that technical debt?"* Yes, and it is **labelled** debt. The honest framing: *"It's debt with an address. The rule stays on for the lab and off for the modules I haven't migrated, and both the config comment and the README say so."*

## Block 30 · `package.json`

@@code package.json

- **What it does** — scripts, dependencies, the engines floor, and the Vite alias.
- **The question** — *"Which script would you run before opening a PR?"* `npm test && npm run lint && npm run build` — exactly what CI runs, in the same order. The README instructs contributors to do exactly this.
- **The trap** — *"why is there both `lint` and `lint:lab`?"* `lint:lab` targets `src/lab` and `src/pages/Home.jsx` specifically, for a fast inner loop while working on the new code. CI runs the full `lint`, so `lint:lab` is a developer convenience, not the gate.

:::check Red-line drills for Part XXIX
- [ ] Pick five blocks at random and explain each without reading the answer.
- [ ] Recite why `key={item.id}` and not the index — then immediately say the merge-sort exception.
- [ ] Explain the `Math.imul` LCG detail.
- [ ] Explain why the oracle lives in the test file.
- [ ] Explain the ESLint exception and call it labelled debt.
- [ ] Name the weakest assertion in the test suite (final-frame-only ID uniqueness) and its two-line fix.
:::
