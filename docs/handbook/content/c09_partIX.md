%PART: Step, seek and the timeline | PART IX | Why `frames[cursor]` is the most important expression in the project, and how to debug navigation.

# 28 · Timeline navigation

> Every way the user can move through a trace, and the exact code path each one takes.

## 28.1 The five navigation affordances

@@code src/lab/SortingLab.jsx 355 368

@@code src/lab/SortingLab.jsx 369 409

| Control | Code | Dispatches | Effect on state |
| --- | --- | --- | --- |
| **Restart** (`SkipBack`) | `onClick={() => seek(0)}` | `seek 0` | Cursor to the first frame, playback stops |
| **Step backward** (`ChevronLeft`) | `onClick={() => seek(cursor - 1)}`, `disabled={!cursor}` | `seek cursor-1` | One frame back, playback stops |
| **Play / Pause / Replay** | `dispatch({type:"toggle"})` | `toggle` | Flips playing, resets to 0 if on the last frame |
| **Step forward** (`ChevronRight`) | `onClick={() => seek(cursor + 1)}`, `disabled={cursor === frames.length - 1}` | `seek cursor+1` | One frame forward, playback stops |
| **Scrubber** | `onChange={e => seek(Number(e.target.value))}` | `seek value` | Jumps to the dragged frame, playback stops |

Note that **four of the five controls are just different arguments to the same action.** There is no `next`, no `previous`, no `restart` action — the reducer has four actions in total and navigation is entirely expressed through `seek`.

## 28.2 The two disabled states, and why they are exactly right

```
   disabled={!cursor}                       ->  disabled only at cursor === 0
   disabled={cursor === frames.length - 1}  ->  disabled only at the last frame
```

:::must The `!cursor` idiom
[VERIFIED] `!cursor` is true when `cursor` is `0` — and also when it is `NaN`, `null` or `undefined`. For this variable, after the derived `Math.min` clamp, the reachable values are non-negative integers, so `!cursor` means exactly "we are at the first frame". It is a compact idiom that works only because of that invariant. The forward button uses the explicit comparison because there is no falsy value that means "at the end" — 19 is truthy.

That asymmetry is worth pointing out before an interviewer does: *"The back button uses `!cursor` and the forward button uses `cursor === frames.length - 1`. That's inconsistent-looking but correct — `!cursor` catches 0, and there's no falsy representation of 'last index'. If I refactored, I'd make both explicit comparisons for symmetry."*
:::

## 28.3 `frames[cursor]` — the single most important expression

```js
const cursor = Math.min(playback.cursor, frames.length - 1),
      frame  = frames[cursor];
```

:::key Why this is the project in one line
Everything the user sees on the stage — the bars, the heights, the labels, the active ring, the sorted tint, the pivot marker, the explanation sentence, the operation name, the three counters, the index list — comes from the single object `frames[cursor]`. Nothing is recomputed, nothing is animated, nothing is stored in parallel state. Rendering the whole screen is a **pure function of one integer**.

If you can say that sentence and then prove it by pointing at `ArrayView` and the inspector, you have demonstrated that you understand your own architecture. [VERIFIED: every one of those values reads from `frame` or `stats = frame.currentStats || {}`.]
:::

| Read in the UI | Source | Line |
| --- | --- | --- |
| Bar heights | `Math.abs(item.val) / max` where `max` is the largest absolute value **in this frame** | ArrayView |
| Active ring | `frame.activeIndices?.includes(i)` | ArrayView |
| Sorted tint | `frame.sortedIndices?.includes(i)` | ArrayView |
| Pivot marker | `frame.pivotIndex === i` | ArrayView |
| Step badge | `String(cursor).padStart(3, "0")` | explanation panel |
| Operation label | `frame.codeLine?.replaceAll("_", " ")` | explanation panel |
| Explanation text | `frame.msg` | explanation panel |
| Counters | `stats.comps`, `stats.passes`, `stats.swaps` | state inspector |
| Index lists | `frame.activeIndices`, `frame.pivotIndex`, `frame.sortedIndices` | state inspector |
| Timeline position | `value={cursor}`, label `{cursor} / {frames.length - 1}` | transport |
| Status tag | `cursor === frames.length - 1` ? "Completed" : playing ? "Running" : `cursor` ? "Paused" : "Ready" | panel heading |

:::note The bar-height detail that surprises people
The height of every bar is computed **relative to the largest absolute value in the current frame** — `Math.max(1, ...frame.array.map(x => Math.abs(x.val)))`. Since the array contents are the same multiset in every frame (sorting only reorders), this maximum is constant across the whole trace for a given input. That is why the bars do not rescale as the animation plays: the visual scale is stable, and only the order changes. The `Math.max(1, …)` guard prevents a division by zero when every value is 0. [VERIFIED]
:::

## 28.4 Completion, and why the final state stays visible

| Question | Answer |
| --- | --- |
| What happens at the last frame? | `tick` clamps the cursor and sets `playing: false`; the status tag reads "Completed"; the Play button's label becomes "Replay" |
| Does the view reset to frame 0? | **No.** The cursor stays at the final frame and the sorted array remains on screen. The README calls this "final-state retention — study the completed result without it disappearing" |
| How do you watch it again? | Press the same button, now labelled "Replay": `toggle` sees `cursor === length - 1` and resets to 0 while starting playback |
| Why is that design better? | Most visualisers snap back to the initial state, so the one moment the learner wants to study — the finished result — is the one moment it is not on screen |

:::q "What happens if you press Play while the trace is complete?"
"It's the same `toggle` action. The reducer checks `state.cursor === state.length - 1`; that's true, so the cursor resets to 0 and `playing` flips to true. The render then shows frame 0 with the button labelled Pause. That one line in the reducer is what turns the Play button into a Replay button without a second action type or any conditional logic in the component."
:::

---

# 29 · Debugging navigation

> Eight hand-built scenarios with symptom, cause, fix and regression test.

## 29.1 The debugging method for anything playback-related

```
   1. Is the reducer wrong, or is the component wrong?
      -> import playbackReducer in a scratch Node file and replay the action sequence.
         If the state sequence is correct, the bug is in the React layer.

   2. Is the cursor out of range, or is the frame wrong?
      -> log cursor, frames.length and frame.codeLine. Any cursor >= frames.length
         means a stale length; a correct cursor with a wrong frame means a stale trace.

   3. Is the trace itself wrong?
      -> assert frames.at(-1).array.map(x => x.val) equals the sorted input.
         If that fails, the bug is in the generator, not in playback.

   4. Is it a timing bug or a state bug?
      -> pause, step manually. If stepping is correct and only playing is wrong,
         the bug is in the timer effect, not the reducer.
```

:::must The 4-step decision tree above is the answer to "how would you debug playback?"
Say the tree, not a story. It is short, ordered from the pure layer to the impure one, and it tells the interviewer you know where the boundaries are. Every scenario below is an instance of it.
:::

## 29.2 Scenario A — the cursor goes past the end of the trace

| | |
| --- | --- |
| **Symptom** | After changing the input, the stage goes blank or the console shows `Cannot read properties of undefined (reading 'array')` at `ArrayView` |
| **Likely causes** | (1) The component is not clamping the cursor; (2) `load` was never dispatched, so the reducer still holds the old `length`; (3) a new input produced a *shorter* trace while the cursor was near the end |
| **Debugging steps** | Log `playback.cursor`, `playback.length`, `frames.length`, and the derived `cursor`. If `frames.length < playback.length`, the reducer's length is stale, which means a code path changed `input` without dispatching `load` |
| **Fix** | Dispatch `load` in every path that changes `input` — or better, make the trace the source of truth and derive `length` in one effect: `useEffect(() => dispatch({type:"load", length: frames.length}), [frames])` |
| **Regression test** | Drive the reducer directly: `load(20)` → `seek(19)` → `load(3)` → assert `cursor === 0`. Then a component-level check: change the input to a much shorter one while the cursor is at the end, and assert the render still shows a valid frame |

## 29.3 Scenario B — playback advances two frames per step

| | |
| --- | --- |
| **Symptom** | The animation runs at double speed; the frame counter jumps 0, 2, 4, 6 |
| **Likely causes** | (1) The timer effect lost its cleanup, so two timers are alive; (2) an extra `tick` is dispatched somewhere; (3) StrictMode's double-invocation is exposing a missing cleanup |
| **Debugging steps** | Add a counter/log inside the effect body and its cleanup: a healthy run logs one cleanup per body. Also check for a second `useEffect` dispatching `tick`, and check the dependency array for a value that changes twice per frame |
| **Fix** | Restore `return () => clearTimeout(id)`; ensure exactly one effect dispatches `tick` |
| **Regression test** | Not directly testable in Node — but you can assert the invariant that makes it impossible: the effect's dependency array must contain everything the body reads, and the body must return a cleanup whenever it schedules |

## 29.4 Scenario C — pause appears to stutter (one extra frame)

| | |
| --- | --- |
| **Symptom** | Pressing Pause at frame 40 shows frame 41 |
| **Likely causes** | The pending timeout was not cleared, so a tick that was already due still landed. This is the *symptom of a missing cleanup*, not of a wrong reducer |
| **Debugging steps** | Log inside the cleanup; compare the timestamp of the pause click with the tick's arrival |
| **Fix** | Ensure the cleanup runs on **every** dependency change, not only on unmount. A common mistake is `useEffect(() => { ... }, [])` with a manual clear inside an event handler |
| **Regression test** | Node-level: the reducer itself cannot produce this (pause is a pure state change). Component-level: step manual + pause sequencing, asserting the cursor does not move after the pause click |

## 29.5 Scenario D — arrow keys stop working after the first press

| | |
| --- | --- |
| **Symptom** | The first ArrowRight steps forward; every later press appears to do nothing (or seeks to the same index) |
| **Likely cause** | The keyboard effect's dependency array was changed to `[]`, so the handler closed over `cursor = 0` forever and kept dispatching `seek(1)` |
| **Debugging steps** | Log the action objects: you will see the same `cursor` value dispatched repeatedly. That confirms a stale closure rather than a broken reducer |
| **Fix** | Either restore `[cursor]` in the dependency array, or (cleaner, [PROPOSED]) add a relative `step` action so the handler no longer reads `cursor` at all |
| **Regression test** | Assert that one listener is attached: wrap `window.addEventListener`/`removeEventListener` in a spy and check the balance after ten cursor changes |

## 29.6 Scenario E — the timeline slider jumps back while dragging

| | |
| --- | --- |
| **Symptom** | Dragging to frame 80 then continuing to drag causes the slider to snap backwards |
| **Likely causes** | (1) `seek` clamps to a stale `length`; (2) the input is uncontrolled and React is resetting it; (3) frames are being regenerated mid-drag |
| **Debugging steps** | Log `e.target.value`, the dispatched cursor, and the resulting `playback.cursor`. If the dispatched value is right but the state clamps, the reducer's `length` is stale |
| **Fix** | This is the "`load` not dispatched" family again; the fix is to keep `length` synchronised with the trace. Note the range input also reflects `value={cursor}` — the *derived* cursor — so if the derived clamp fires, the thumb will visibly fight the drag |
| **Regression test** | `seek(999)` on a 3-frame trace must yield `cursor === 2` — which is exactly what the existing test asserts |

## 29.7 Scenario F — the last frame never renders

| | |
| --- | --- |
| **Symptom** | The animation stops at frame `n-2`; the last frame is only visible after pressing step-forward once |
| **Likely causes** | (1) A `tick` that stops one frame early (`cursor + 1 < length` instead of `< length - 1`); (2) a `<` that should be `<=`; (3) the timeline's `max` set to `frames.length - 2` |
| **Debugging steps** | Drive the reducer to completion in Node and assert the final cursor equals `length - 1`. If that passes, inspect the render path for an off-by-one in the timeline `max` or the disabled condition |
| **Fix** | The correct completion expression is `playing: state.cursor + 1 < state.length - 1`, which reaches the last frame and stops there. The existing test asserts exactly this: after two ticks on a 3-frame trace, `cursor === 2` and `playing === false` |
| **Regression test** | The existing playback test group. Add a case for `length = 2` |

## 29.8 Scenario G — the frame shown does not match the step badge

| | |
| --- | --- |
| **Symptom** | The badge says 012 but the explanation text is from the previous operation |
| **Likely causes** | The badge uses the derived `cursor` and the text uses `frame` — so this symptom means two different traces are in play, i.e. `frames` was recomputed while `cursor` was stale |
| **Debugging steps** | Log `frames.length`, `playback.cursor` and `cursor` in the same render. If `playback.cursor > frames.length - 1`, the clamp is doing its job and the mismatch is cosmetic; a *content* mismatch (right index, wrong message) means the memo returned a new array built from a different input |
| **Fix** | Keep `(algo, input)` as the memo dependencies and never derive frames from `text`. If a future feature needs a live preview while typing, that preview must be a separate value, not the same `frames` |
| **Regression test** | Assert `frames[cursor].codeLine` is defined for every cursor in `[0, frames.length-1]` for a set of inputs |

## 29.9 Scenario H — the timeline shows `0 / 0`

| | |
| --- | --- |
| **Symptom** | The transport reads `0 / 0` and the stage is empty |
| **Likely cause** | `frames.length === 1` (or 0), so `frames.length - 1` is 0. This means a generator produced a single frame |
| **Debugging steps** | Call the generator directly in Node for that input and print `frames.length` and `frames.map(f => f.codeLine)`. All six generators always push a seed frame *and* a terminal frame, so a length below 2 indicates a throwing or short-circuited generator |
| **Fix** | Depends on which generator misbehaved; the general guard is that `parseInput` guarantees at least two values, and every generator handles `n = 0` and `n = 1` (measured: bubble/selection/insertion return 2 frames for `[]`, merge/quick/heap return 4) |
| **Regression test** | The existing "correctness, input preservation and reproducible trace" test group already includes `[]` and `[1]` as inputs for all six algorithms |

:::danger The meta-lesson, and the sentence to say
Four of the eight scenarios above reduce to the same root cause: **the reducer's `length` and the memoised `frames.length` are two separate variables that must be kept in step.** That is a genuine design smell — not a bug, but a coupling that has to be maintained by hand. The refactor that removes it entirely is to stop storing `length` in the reducer and pass it in on each action, or to derive it. If an interviewer asks "what's the weakest part of your playback design?", this is the best answer in the project, because it is real, it is subtle, and you have a concrete fix. [PROPOSED]
:::

:::check Red-line drills for Part IX
- [ ] Name all five navigation affordances and the single action they share.
- [ ] Explain the `!cursor` idiom and why the forward button uses a different test.
- [ ] List everything on screen that comes from `frames[cursor]`.
- [ ] Explain why bar heights do not rescale between frames.
- [ ] Recite the four-step debugging decision tree.
- [ ] Explain why "length is stored twice" is the weakest part of the playback design.
:::
