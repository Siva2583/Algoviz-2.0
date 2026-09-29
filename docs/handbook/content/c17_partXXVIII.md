%PART: Debugging master section | PART XXVIII | Forty realistic AlgoViz bug scenarios, each with symptom, causes, steps, fix and regression test.

# 54 · Forty debugging scenarios

> How to use this chapter: cover the answer, read the symptom, say your diagnosis out loud, then check. This is the single highest-value rehearsal in the book, because a debugging question is the one interview question that cannot be bluffed.

## 54.0 The universal method

Before the scenarios, the method — it answers *every* one of them, and interviewers notice when you apply a framework instead of guessing.

```
   1. CLASSIFY   Is the defect in the ENGINE (frames), the REDUCER (transport state),
                 or the RENDER (what is displayed)?
                 -> Test: open the same input in a Node scratch file and inspect frames.

   2. LOCATE     Bisect the pipeline: input -> parseInput -> generator -> frames
                 -> memo -> cursor -> reducer -> frame -> ArrayView.
                 Print the value at each boundary and find the first one that is wrong.

   3. REPRODUCE  Reduce to the smallest input and the fewest actions.
                 "Bubble sort on [3,1,2] with three ticks" beats "sometimes it breaks".

   4. DISTINGUISH Is this a STATE bug or a TIMING bug?
                 -> If manual stepping is correct and only playback misbehaves,
                    it is the timer effect, not the reducer.

   5. FIX        Change the smallest thing. Prefer fixing the layer that owns the
                 invariant (the reducer clamps; the component derives).

   6. GUARD      Add the assertion that would have caught it. If it is assertable in
                 Node, add it to tests/engine.test.js.
```

---

## Playback and transport

### 1 — Playback advances two frames per step

| | |
| --- | --- |
| **Symptom** | The animation advances 2 frames per interval; the step counter jumps 0, 2, 4, 6 |
| **Possible causes** | (a) The timer effect lost its cleanup, so two timeouts are live; (b) a second effect or handler also dispatches `tick`; (c) `speed` or `cursor` was accidentally omitted from the dependency array so the effect never re-schedules and an old timer survives; (d) StrictMode double-mount with no cleanup |
| **Debugging steps** | Instrument the effect: log on schedule, log on cleanup. A healthy run logs one cleanup per body. Count the dispatches: wrap `dispatch` in a logger and check whether each `tick` is followed by exactly one `cursor` change |
| **Fix** | Restore `return () => clearTimeout(id)` and ensure the array is `[playback.playing, playback.cursor, speed]` |
| **Regression test** | Not directly testable in Node. The proxy assertion: the effect must always return a cleanup in the branch where it schedules |

### 2 — Pause does not stop the animation

| | |
| --- | --- |
| **Symptom** | Clicking Pause flips the button label but frames keep advancing |
| **Possible causes** | (a) A `setInterval` was introduced somewhere, which pause cannot cancel; (b) the effect body ignores `playing` (missing the guard); (c) `playing` is read from a stale closure in the timer callback; (d) the button dispatches something other than `toggle` |
| **Debugging steps** | Log `playback.playing` on each render and each effect run. If `playing` is `false` and the effect body still schedules a timer, the guard or the dependency array is wrong |
| **Fix** | The guard `if (!playback.playing) return;` must be the first line, and `playing` must be in the dependency array |
| **Regression test** | Reducer level: `toggle` twice must return `playing: false`. The timer behaviour needs a fake-timer component test, which does not exist yet |

### 3 — The cursor exceeds the frame count

| | |
| --- | --- |
| **Symptom** | Blank stage, or `Cannot read properties of undefined (reading 'array')` in `ArrayView` |
| **Possible causes** | (a) `input` changed without dispatching `load`, so the reducer's `length` is stale and larger than `frames.length`; (b) the derived clamp was removed; (c) a saved/imported cursor was dispatched unclamped after a shorter trace was loaded |
| **Debugging steps** | Log `playback.cursor`, `playback.length`, `frames.length`, `cursor`. If `playback.length > frames.length`, something changed the trace without a `load`. Also log the order of `setInput` and `dispatch` in `load()` — they are batched, so they land in the same commit |
| **Fix** | Dispatch `load` in every path that changes the trace, and keep the derived clamp as a second line of defence |
| **Regression test** | `load(20)` → `seek(19)` → `load(3)` must leave `cursor === 0`. Plus a property assertion: for every cursor in range, `frames[cursor]` is defined |

### 4 — The last frame never renders

| | |
| --- | --- |
| **Symptom** | Playback stops one frame short; the completed array only appears after a manual step |
| **Possible causes** | (a) Completion computed as `cursor + 1 < state.length` instead of `< state.length - 1`; (b) the timeline's `max` is `frames.length - 2`; (c) the step-forward button's disabled condition is off by one; (d) the generator's final frame is missing |
| **Debugging steps** | First check the engine: call the generator in Node and assert `frames.at(-1)` has all indices sorted. If that passes, the bug is in the transport |
| **Fix** | The correct completion expression is `playing: state.cursor + 1 < state.length - 1` |
| **Regression test** | The existing playback group asserts exactly this for a 3-frame trace |

### 5 — Seek jumps to the wrong frame

| | |
| --- | --- |
| **Symptom** | Dragging the timeline to a displayed position lands on a different frame |
| **Possible causes** | (a) The range input's `value` is the derived cursor while `onChange` dispatches the raw event value — a mismatch if the derived clamp is active; (b) the value is not converted with `Number()` so a string reaches the reducer and `Math.min("10", 19)` coerces; (c) `max` does not match `frames.length - 1` |
| **Debugging steps** | Log `e.target.value`, the dispatched cursor, and the resulting `cursor`. If the dispatched value is right and the state is wrong, the reducer clamped against a stale `length` |
| **Fix** | `seek(Number(e.target.value))`, `max={frames.length - 1}`, `value={cursor}`, with the reducer and the derived cursor agreeing on the same length |
| **Regression test** | `seek(-10) → 0` and `seek(999) → length-1` — both already asserted |

### 6 — Step backward does nothing at frame 5

| | |
| --- | --- |
| **Symptom** | The back arrow is unresponsive except at the start |
| **Possible causes** | (a) The button is `disabled={cursor === 0}` on the wrong side; (b) the handler dispatches `{type:'step'}` on an action the reducer does not implement, so `default` returns the same state; (c) the handler reads a stale `cursor` |
| **Debugging steps** | Log the action object. If the reducer logs an unknown action, the `default` branch is silently swallowing it — that is a reminder that the reducer *always* returns a state, which makes typos quiet |
| **Fix** | Use `seek(cursor - 1)`; make sure the disabled condition is `!cursor` or `cursor === 0` |
| **Regression test** | Drive a `seek` sequence in Node and assert each resulting cursor |

### 7 — The keyboard arrows stop working after the first press

| | |
| --- | --- |
| **Symptom** | First arrow press steps once; subsequent presses do nothing |
| **Cause** | Stale closure: the effect's dependency array is `[]`, so the handler permanently holds `cursor = 0` and keeps dispatching the same seek |
| **Debugging steps** | Log the action objects — you will see an identical `cursor` value every time |
| **Fix** | Add `cursor` to the dependency array, or add a relative `step` action so the handler never read `cursor` [PROPOSED] |
| **Regression test** | Spy on `addEventListener`/`removeEventListener` and assert the balance after ten cursor changes |

### 8 — Multiple keyboard listeners accumulate

| | |
| --- | --- |
| **Symptom** | One ArrowRight press advances by 3 or 4 frames, and the amount grows over time |
| **Cause** | The keyboard effect has no cleanup, so every re-registration adds another live listener |
| **Debugging steps** | In DevTools, use `getEventListeners(window)` (Chrome console) and count `keydown` handlers; or log inside the effect and count registrations vs removals |
| **Fix** | `return () => window.removeEventListener("keydown", key);` |
| **Regression test** | The listener-balance spy described above |

### 9 — Space toggles playback while typing in the dataset field

| | |
| --- | --- |
| **Symptom** | Typing a space in the input both inserts a space and starts playback |
| **Cause** | The tag-name guard was removed or is incomplete — the handler must ignore events whose target is `INPUT`, `SELECT`, `TEXTAREA` or `BUTTON` |
| **Debugging steps** | Log `e.target.tagName` at the top of the handler before the guard |
| **Fix** | Keep the guard, and keep `e.target.isContentEditable` and the modifier-key checks |
| **Regression test** | Dispatch a synthetic `keydown` with `target` an input and assert no dispatch occurs |

### 10 — Speed changes have no effect until playback is toggled

| | |
| --- | --- |
| **Symptom** | Changing the speed selector mid-playback does not change the cadence |
| **Cause** | `speed` is missing from the effect's dependency array, so the effect never re-runs to schedule with the new delay |
| **Debugging steps** | Log the delay inside the effect body; it will keep printing the old value |
| **Fix** | Add `speed` to the dependency array |
| **Regression test** | Assert the dependency list contains every value the body reads (a lint rule can enforce this) |

### 11 — The animation continues after navigating away

| | |
| --- | --- |
| **Symptom** | Console warning about a state update on an unmounted component, or the timer firing after a route change |
| **Cause** | The cleanup is not returned, so React has nothing to cancel on unmount |
| **Debugging steps** | Log inside the cleanup; it should print on every dependency change and on unmount |
| **Fix** | Always return the cleanup when the effect schedules anything |
| **Regression test** | Mount, play, unmount manually and assert no timer was pending (a fake-timer component test) |

### 12 — Play does nothing at the very start (frame 0 of a 2-frame trace)

| | |
| --- | --- |
| **Symptom** | With a minimal trace, Play appears to do nothing |
| **Cause** | Not a bug in most cases: `toggle` at `cursor = length - 1` is a *replay* request. With `length = 2` and `cursor = 0`, play starts, the first `tick` moves to frame 1 and immediately sets `playing: false` — a two-frame trace finishes in one interval |
| **Debugging steps** | Check `frames.length`. Every generator emits at least 2 frames even for an empty input, so a short trace is expected for tiny inputs |
| **Fix** | No fix required; the observable behaviour is correct. If it is confusing in the UI, that is a UX issue, not a defect |
| **Regression test** | Assert `run([]).length >= 2` for all six generators |

---

## Engine and frames

### 13 — The final frame is not sorted

| | |
| --- | --- |
| **Symptom** | The trace ends with an unsorted array |
| **Possible causes** | (a) The generator's final `cloneArray()` happens before the last mutation; (b) a loop bound excludes the last element; (c) a swap writes to the wrong index |
| **Debugging steps** | Assert `frames.at(-1).array.map(x => x.val)` against `[...input].sort((a,b)=>a-b)` in a Node scratch file. Then bisect: which frame first diverges from the expected state? |
| **Fix** | Depends on the generator; the invariant to restore is that the final frame is the fully sorted state |
| **Regression test** | The first assertion of the existing sorting group — it covers all six algorithms and 25 inputs |

### 14 — The algorithm returns correct results but the frames are wrong

| | |
| --- | --- |
| **Symptom** | The final frame is sorted but intermediate frames show impossible states (e.g. a value that appears from nowhere, or a sorted region that shrinks) |
| **Possible causes** | (a) The frame captured a reference to the live array instead of a clone; (b) `cloneArray` was applied after the mutation instead of before; (c) `sortedIndices` was shared by reference and mutated retroactively |
| **Debugging steps** | This is the classic symptom of a missing clone. Check all three clone sites: `cloneArray()`, `{...stats}`, `[...sortedIndices]`. A quick test: mutate `frames[0].array[0].val` and re-read `frames[1].array[0].val` — if it changed, the frames share objects |
| **Fix** | Restore the clone at the frame-construction site |
| **Regression test** | A "frames are independent" test: mutate one frame and assert its neighbours are unchanged. **This test does not exist yet** — it is the natural companion to the deep-equality test |

### 15 — Duplicate element IDs in a frame

| | |
| --- | --- |
| **Symptom** | React logs "Encountered two children with the same key" during merge sort playback; a bar momentarily fails to update or the array appears to contain two identical values |
| **Cause** | Merge sort's buffer write-back: shallow clones preserve `id`, and the main array still holds the originals during the partial write. Measured: 23 of 107 frames on the default input, 141 of 375 on the reverse-24 input |
| **Debugging steps** | Log the frame's ids and find duplicates: `new Set(ids).size !== ids.length`. Then look at the frame's `codeLine` — it will be `write_left`, `write_right` or `write_rem` |
| **Fix** | Minimal: make the render key unique per frame, `key={item.id + ':' + i}`, which is safe because every frame is a full snapshot. Alternative: re-id the buffered clone at write time. [PROPOSED — not implemented] |
| **Regression test** | Extend the existing assertion from the final frame to **every** frame: for each frame, `new Set(frame.array.map(x => x.id)).size === input.length`. That single change would have caught this bug in CI |

### 16 — A merge-sort value appears to vanish mid-animation

| | |
| --- | --- |
| **Symptom** | During the merge phase the rendered array shows a duplicate value and the "missing" value is absent |
| **Cause** | The value is in `tempArr`, which no frame exposes. The generator sets `yOffset = 80` to flag it and pushes a `buffer` frame, but `ArrayView` ignores `yOffset` |
| **Debugging steps** | Compare the frame's rendered values to the pre-merge frame: the multiset is wrong by exactly the buffered element |
| **Fix** | Render the buffer: apply `translateY` when `yOffset` is non-zero, or render a "buffer lane" under the array. Engine change not required. [PROPOSED] |
| **Regression test** | Assert that the multiset of values in every frame equals the multiset of the input — a strong property that would also catch bugs 13 and 14 |

### 17 — Trace reproducibility fails intermittently

| | |
| --- | --- |
| **Symptom** | `deepEqual(frames, run(input))` fails only occasionally, or between machines |
| **Possible causes** | (a) `Math.random()` or `Date.now()` inside a generator; (b) object key iteration order affecting a string built from an object; (c) a `Set`/`Map` with insertion-order dependence; (d) floating-point arithmetic on non-integers |
| **Debugging steps** | Diff the two traces frame by frame and print the first index and field that differs. A difference in `msg` points at interpolation; a difference in `array` order points at iteration; a difference only in `currentStats` points at shared-state mutation |
| **Fix** | Remove the non-determinism — generators must be pure functions of their input |
| **Regression test** | The existing determinism assertion, run repeatedly, plus a test that asserts no generator's source contains `Math.random` (a crude but effective guard) |

### 18 — The generator mutates the caller's array

| | |
| --- | --- |
| **Symptom** | After a run, the original array is reordered; the same-input comparison becomes invalid |
| **Cause** | The generator sorted `rawArray` directly, or an element object from `rawArray` was retained and mutated |
| **Debugging steps** | `const before = [...input]; algorithm.run(input); assert.deepEqual(input, before)` |
| **Fix** | Wrap the values into new objects first — `rawArray.map((val, i) => ({id, val}))` — and mutate only that new array |
| **Regression test** | The existing input-preservation assertion, for all six algorithms |

### 19 — Empty input produces a frame claiming a non-existent index is sorted

| | |
| --- | --- |
| **Symptom** | Sorting `[]` with insertion sort yields a seed frame with `sortedIndices: [0]` |
| **Cause** | `const sortedIndices = [0]` is unconditional |
| **Debugging steps** | Run the generator on `[]` and inspect frame 0 |
| **Fix** | `const sortedIndices = n > 0 ? [0] : [];` [PROPOSED] |
| **Regression test** | For every generator and every input, assert every index in every frame's `sortedIndices` and `activeIndices` is `< input.length` |

### 20 — Frame count is unexpectedly large

| | |
| --- | --- |
| **Symptom** | A trace has 1,154 frames where you expected a few dozen |
| **Cause** | Not a bug — it is the instrumentation density. Bubble sort pushes 3–4 frames per inner iteration (window, compare, and two per swap) plus per-pass frames |
| **Debugging steps** | Group frames by `codeLine` and count each group: `frames.reduce((acc,f) => (acc[f.codeLine] = (acc[f.codeLine]\|\|0)+1, acc), {})`. The counts will explain the total exactly |
| **Fix** | No fix; this is the design. If the count is a problem, the answer is coarser instrumentation or delta frames |
| **Regression test** | A frame-count budget assertion per algorithm per input size, so an accidental instrumentation change is caught |

---

## Validation and input

### 21 — Invalid input is accepted

| | |
| --- | --- |
| **Symptom** | `"1, 2, abc"` or a 30-value input is visualized |
| **Possible causes** | (a) The generator is called directly instead of through `load()`; (b) a new entry point bypasses `parseInput`; (c) the regex was weakened to allow decimals or exponents |
| **Debugging steps** | Search for every call to `algorithms[...].run(` and confirm each is reached from a validated path |
| **Fix** | Route all entry points through `parseInput`; the import path already does this by joining to a string first |
| **Regression test** | The existing validation group covers `""`, `"1,"`, `"1,,2"`, `"2.5,3"`, `"1,Infinity"`, `"1,1000"` and 25 values |

### 22 — A valid input is rejected

| | |
| --- | --- |
| **Symptom** | A legitimate entry such as `" 4, 8, 15 "` is rejected |
| **Possible causes** | (a) The trimming happens after the regex test instead of before; (b) the count check runs on the untrimmed split; (c) an over-strict character class |
| **Debugging steps** | Call `parseInput` with the string in Node and read the thrown message — it identifies which of the five rules fired |
| **Fix** | The regex is applied to `p.trim()`; the count uses the raw split length. Both must agree on what a "value" is |
| **Regression test** | A positive case with surrounding whitespace, as the existing test does for `" -2, 0, 3 "` |

### 23 — Applying the same input resets the animation unexpectedly

| | |
| --- | --- |
| **Symptom** | Pressing Apply on an unchanged dataset restarts playback from frame 0 |
| **Cause** | Not a bug: `load()` always dispatches `load`, which resets the cursor and stops playback. `parseInput` returns a **new array**, so `useMemo` recomputes even though the contents are identical — because the dependency is compared by reference |
| **Debugging steps** | Confirm the array reference changed: `frames` recomputes whenever `load()` runs |
| **Fix** | Expected behaviour. If a no-op re-apply were desired, compare array contents before committing [PROPOSED] |
| **Regression test** | Not needed; the behaviour is deterministic and correct |

### 24 — The commit is invisible because the animation is still running

| | |
| --- | --- |
| **Symptom** | A user changes the input while playing and does not notice the trace changed |
| **Cause** | `load` stops playback and resets the cursor, but there is no explicit visual cue |
| **Debugging steps** | Trace `playing` across the commit: it goes `true → false` |
| **Fix** | UX: a brief notice ("Trace reloaded") or a transition. The state machine is correct [PROPOSED] |
| **Regression test** | Assert `load` yields `playing: false` regardless of prior state — already implied by the reducer's `load` case |

---

## Comparison

### 25 — Comparison starts from different data

| | |
| --- | --- |
| **Symptom** | The two previews look like they are sorting different arrays |
| **Possible causes** | (a) The second memo does not depend on `input`, so it is stale; (b) the generator mutates its input, corrupting the second run; (c) the comparison algorithm was changed without re-running the trace |
| **Debugging steps** | Log `frames.at(-1).array.map(x=>x.val)` and `otherFrames.at(-1).array.map(x=>x.val)` — both must be the sorted version of the same input |
| **Fix** | Ensure `otherFrames`'s dependencies include `input`, and that generators do not mutate. The input-preservation test is the guard |
| **Regression test** | For each pair of algorithms, assert both traces' final values equal the same sorted array |

### 26 — Operation counts look inconsistent between panels

| | |
| --- | --- |
| **Symptom** | The inspector shows 12 comparisons while the comparison panel shows 28 |
| **Cause** | Not a bug: the inspector shows the **current frame's** `currentStats`; the comparison panel shows the **complete run's** `frames.at(-1).currentStats`. Two different quantities, deliberately labelled "LIVE" and "COMPLETE-RUN COMPARISONS" |
| **Debugging steps** | Step to the last frame and confirm the inspector matches the panel |
| **Fix** | Expected. If it confuses users, label them more emphatically |
| **Regression test** | Assert `frames.at(-1).currentStats` is monotone non-decreasing along the trace for all three counters |

### 27 — The comparison preview goes blank

| | |
| --- | --- |
| **Symptom** | The secondary array disappears partway through playback |
| **Cause** | Index out of range on `otherFrames[compareCursor]`. The formula can produce `NaN` if `frames.length === 1` (division by zero) |
| **Debugging steps** | Log `compareCursor` and `otherFrames.length`. If `compareCursor` is `NaN` or `>= length`, the denominator was zero or the lengths diverged |
| **Fix** | Guard the denominator: `frames.length > 1 ? ... : 0`. Practically unreachable because every generator emits ≥ 2 frames, but unguarded |
| **Regression test** | For every algorithm pair and a set of inputs, assert `compareCursor` is an integer in `[0, otherFrames.length - 1]` for every primary cursor |

### 28 — Selecting the same algorithm twice

| | |
| --- | --- |
| **Symptom** | Two identical traces and two equal counts |
| **Cause** | The comparison `<select>` is not filtered against the primary selection |
| **Fix** | Filter the options, or show a hint. Harmless but meaningless as an experiment [PROPOSED] |
| **Regression test** | If filtered, assert the option list excludes the current primary |

### 29 — The meters look wrong for very small counts

| | |
| --- | --- |
| **Symptom** | A count of 1 draws a bar as wide as a count of 2 |
| **Cause** | The `Math.max(2, …)` floor exists so a non-zero count is visible at all |
| **Fix** | Expected; the floor is deliberate. A log scale would be misleading |
| **Regression test** | Assert the width expression never exceeds 100% |

### 30 — Swapping which algorithm is primary changes the numbers

| | |
| --- | --- |
| **Symptom** | The counts appear to change after swapping primary/secondary |
| **Cause** | Should be impossible — the counts come from each trace's final frame and do not depend on which is primary. If it happens, one of the memos is not recomputing, so a stale trace is being displayed against the new `algo` |
| **Debugging steps** | Log `algo`, `other` and both `frames.length` values across the swap |
| **Fix** | Ensure both memos depend on their own algorithm key and on `input` |
| **Regression test** | Assert counts are symmetric: the pair of counts is the same set regardless of order |

---

## Persistence and import

### 31 — A saved experiment disappears after reload

| | |
| --- | --- |
| **Symptom** | The saved list is empty after a refresh |
| **Possible causes** | (a) The write threw and was swallowed — but the catch sets a notice, so check for it; (b) storage is disabled (private mode, third-party-cookie blocking) so `setItem` silently fails or throws; (c) the read path's filter rejected the record because the algorithm key changed; (d) the page is on a different origin than when it was saved — e.g. `localhost` versus `127.0.0.1` |
| **Debugging steps** | In DevTools → Application → Local Storage, read `algoviz.experiments.v1` directly and inspect its contents. Then evaluate the filter's three conditions against each record by hand |
| **Fix** | Depends on the cause. For (d), the honest answer is that localStorage is origin-scoped, which is why export exists |
| **Regression test** | Save → clear the in-memory list → re-run the read path → assert the record survives. Requires a DOM environment; not covered today |

### 32 — localStorage contains corrupted data

| | |
| --- | --- |
| **Symptom** | The saved list is empty, or the route crashes on mount |
| **Possible causes** | Hand-edited or partially-written JSON; a record whose `input` is not an array; a record whose `algorithm` no longer exists |
| **Debugging steps** | Read the key in DevTools and try `JSON.parse` on it in the console |
| **Fix** | Already handled — four defence layers on the read path. The gap is that a corrupt store is discarded *silently*, with no user-facing message [PROPOSED] |
| **Regression test** | Seed `localStorage` with `"{"`, `"null"`, `"{}"`, `'[{"algorithm":"nope"}]'` and `'[{"algorithm":"bubble","input":"x"}]'` and assert the component renders an empty list rather than throwing |

### 33 — JSON import crashes the app

| | |
| --- | --- |
| **Symptom** | A red error banner with a parser message, or an unhandled exception |
| **Possible causes** | (a) `file.text()` rejected and the `catch` set a message — fine; (b) `data.input` is valid but produces a cursor that is dispatched unclamped; (c) an exception thrown outside the `try` |
| **Debugging steps** | Log at each gate in `importExperiment` to find which one fired. If all gates pass but the render throws, the cursor path is the suspect |
| **Fix** | The cursor guard `Number.isInteger(data.cursor) ? data.cursor : 0` plus the reducer's clamp should make this unreachable. If a throw still escapes, the `try` block does not cover the render — which is correct, so the fix belongs at the data boundary |
| **Regression test** | The nine import cases listed in Chapter 42; none is automated today |

### 34 — Exported file cannot be re-imported

| | |
| --- | --- |
| **Symptom** | The app says "Not a supported AlgoViz experiment" for a file it exported |
| **Possible causes** | (a) The file was edited and lost a required field; (b) the export payload and the import schema have drifted — note the export omits `createdAt`, which import does not require, so this is currently consistent; (c) the file is larger than 16 KB |
| **Debugging steps** | Open the file and check `version === 1`, that `algorithm` is a current key, and that `input` is an array |
| **Fix** | Keep the schema in one place — a shared `EXPERIMENT_VERSION` constant would prevent drift [PROPOSED] |
| **Regression test** | A round-trip test: export an in-memory experiment object, re-validate it through the import gates, and assert the values survive |

### 35 — Save reports failure even though storage works

| | |
| --- | --- |
| **Symptom** | "Browser storage is unavailable" when storage is fine |
| **Possible causes** | (a) Quota exceeded by another key on the same origin; (b) the payload is not serialisable — it always is here, but a future non-JSON field would throw in `stringify`, which is inside the `try`; (c) storage is disabled for third-party frames |
| **Debugging steps** | Log the actual exception — the `catch` currently discards it with a bare `catch {}`, so you have to add a log to see it. That is a real debuggability weakness [PROPOSED: `catch (e) { console.warn(e); ... }`] |
| **Fix** | Surface the reason, and distinguish quota from access errors |
| **Regression test** | Mock `setItem` to throw `QuotaExceededError` and assert the notice text |

---

## Rendering and React

### 36 — Excessive re-rendering

| | |
| --- | --- |
| **Symptom** | React DevTools Profiler shows the whole component re-rendering on every keystroke |
| **Possible causes** | (a) `text` changes on every keystroke by design, so the component re-renders — that is expected; (b) the memo is missing so `frames` rebuilds; (c) an effect dispatches on every render causing a loop |
| **Debugging steps** | Profile with "highlight updates", then check whether the expensive work (the `useMemo` bodies) re-executes — instrument the memo body with a counter |
| **Fix** | If the memo is working, nothing is wrong: re-rendering a small component tree is cheap. The one genuine inefficiency is the keyboard effect re-registering on every cursor change |
| **Regression test** | Assert the generator is called once per input change (spy on the generator) |

### 37 — The wrong frame renders for one paint

| | |
| --- | --- |
| **Symptom** | A flash of the previous trace's frame immediately after changing the input |
| **Cause** | Storing `frame` in state instead of deriving it, or synchronising with an effect |
| **Debugging steps** | Log `frames.length`, `playback.cursor` and `cursor` in the same render — a render where `cursor >= frames.length` proves the derivation is not in place |
| **Fix** | Derive during render: `const cursor = Math.min(playback.cursor, frames.length - 1); const frame = frames[cursor];` |
| **Regression test** | A component test asserting no render ever receives `frames[undefined]`; today the invariant is protected only by the derivation itself |

### 38 — An error in one module blanks the whole app

| | |
| --- | --- |
| **Symptom** | One route's exception unmounts everything |
| **Cause** | There is no error boundary anywhere in the tree |
| **Fix** | Mount a boundary per route, inside `Suspense`, so a crashing module shows a fallback while the shell survives [PROPOSED] |
| **Regression test** | A test that throws inside a child and asserts the boundary renders its fallback |

### 39 — A lazy route shows the fallback forever

| | |
| --- | --- |
| **Symptom** | "One moment of curiosity…" never resolves |
| **Possible causes** | (a) The chunk 404s after a deploy because the hashed filename changed and the browser holds the old HTML; (b) a dynamic import path typo; (c) the network request failed |
| **Debugging steps** | Check the Network tab for a failed `.js` request and the console for a chunk-load error |
| **Fix** | For (a), a deploy-version check that reloads on a chunk error; for (b), correct the path — note the build would normally fail on a bad static import, but a dynamic one is only resolved at build time for path existence. Error boundaries plus a reload prompt is the standard remedy [PROPOSED] |
| **Regression test** | A build-level assertion that every lazy import produces a chunk (visible in the build output) |

### 40 — CI passes but the feature is broken

| | |
| --- | --- |
| **Symptom** | Green checks, broken behaviour in the browser |
| **Possible causes** | (a) The feature lives in a component, and no test renders a component; (b) the assertion is too weak — e.g. only the final frame's IDs are checked, so the merge duplicate-key bug passes; (c) the feature is only reachable through a route nothing tests; (d) a CSS-only break |
| **Debugging steps** | Ask "which assertion would have failed if this were broken?" If the answer is none, that is the finding — not a mystery, a coverage gap |
| **Fix** | Add the missing assertion at the lowest layer that can express it. The merge bug is the perfect example: the fix is to extend an existing assertion from `frames.at(-1)` to every frame, which is a two-line change that turns a browser-only warning into a CI failure. **That single change is the highest-value test improvement available in this repository** |
| **Regression test** | The new assertion itself |

:::must The three debugging answers that impress most
1. **Scenario 15/40** — "the assertion is too weak; I check IDs on the last frame but the bug lives in the middle frames." This is the rare answer that identifies a *testing* defect rather than a code defect, and it comes with a two-line fix that you can describe precisely.
2. **Scenario 14** — "the frames share objects with the live array", because it demonstrates you understand that `cloneArray` per element is what makes a recorded frame immutable.
3. **Scenario 3** — "`length` lives in two places", because it identifies an architectural smell and proposes the structural fix rather than a patch.
:::

:::check Red-line drills for Part XXVIII
- [ ] Recite the six-step universal method.
- [ ] Explain the engine/reducer/render classification and how to test for it in Node.
- [ ] Give the two-line test fix for the merge duplicate-key bug.
- [ ] Name three scenarios that are *not* bugs (12, 23, 26) and why.
- [ ] Explain why the `default` branch of a reducer can swallow typos.
:::
