%PART: The playback reducer | PART VII | The state machine, the transition tables, twenty worked simulations, and twenty-eight questions with answers.

# 21 · The reducer, line by line

> Twenty-five lines that carry the transport semantics of the entire application.

## 21.1 The complete source

@@code src/lab/engine.js 80 105

## 21.2 Every line, annotated

| Line | Code | What it does | Why it is written that way |
| --- | --- | --- | --- |
| 80 | `export function playbackReducer(state, action)` | A **pure standalone function**, exported separately from React | Exporting it means the test file can import and exercise it in plain Node with no renderer — this is why the playback rules are testable at all |
| 81 | `switch (action.type)` | Explicit action dispatch | A `switch` gives an exhaustive, greppable list of everything that can happen to transport state. Four cases, no more |
| 82–83 | `case "load": return { cursor: 0, length: action.length, playing: false };` | A **brand-new object**, not a spread of `state` | Loading a new trace discards everything. Spreading `...state` here would carry over a stale cursor, which could exceed the new `length` |
| 84–89 | `case "toggle"` | Spreads state, resets the cursor to 0 **if it is sitting on the last frame**, flips `playing` | This one line implements *replay*: pressing Play at the end starts again from the beginning. It also implements pause, because `!playing` is symmetric |
| 90–95 | `case "tick"` | Advances one frame, clamps at the end, and **derives** whether playback should continue | `playing: state.cursor + 1 < state.length - 1` uses the *old* cursor deliberately: it means "keep playing only if the frame we are moving to is not the last one" |
| 96–101 | `case "seek"` | Clamps into `[0, length-1]` and **always pauses** | Two separate decisions in one case: a clamp (safety) and a forced pause (semantics). See the danger box below for what is missing |
| 102–103 | `default: return state;` | Unknown actions return the identical object reference | React bails out of re-rendering when the reducer returns the same reference by `Object.is`. Returning `state` instead of `{...state}` is therefore a real optimisation, and it makes an accidental typo in an action type harmless rather than destructive |

## 21.3 The three invariants the reducer maintains

:::must The transport invariants
1. **Bound:** `0 <= cursor <= length - 1` — enforced on `seek` (clamp), `tick` (min), and `load` (reset to 0).
2. **Completion:** reaching the last frame always sets `playing: false`. There is no state in which playback is "running" at the end.
3. **Seek pauses:** `playing` is forced to `false` by every `seek`, so dragging the timeline never leaves the animation running underneath.

And the invariant it deliberately does **not** maintain: `length` is never computed from the frames — it is *passed in* by the caller. The reducer has no knowledge of the frame array at all. That is what makes it algorithm-agnostic, and it is also the reason `load()` must run the generator once just to count frames.
:::

## 21.4 The state machine

```
                        dispatch({type:'load', length: F})
                                |
                                v
   +---------------------------------------------------------------+
   |                                                               |
   |   (cursor = 0, playing = false)        <---- initial mount    |
   |              |                                                |
   |              | toggle  (cursor != last)                        |
   |              v                                                |
   |   (cursor = 0, playing = true)  ------------ tick ----------+ |
   |              ^                                             | |
   |              |                                 (cursor < last) |
   |              |                                             v |
   |              |                                      (cursor+1, |
   |              |                                       playing)  |
   |              |                                                |
   |              |            tick at cursor = last-1               |
   |              |            ------------------------            |
   |              |            |                              |    |
   |              |            v                              v    |
   |              |   (cursor = last, playing = false) -----------+ |
   |              |            |                                   |
   |              |            | toggle  -> cursor := 0, playing:=true  (REPLAY)
   |              |            |                                   |
   |              +------------+-----------------------------------+
   |
   |   any state ---- seek(i) ---- (cursor = clamp(i), playing = false)
   |                                     ^
   +-------------------------------------+
```

## 21.5 The transition table — state × action

The table below is the complete truth table for the reducer. `F` = `length`, `L` = `length − 1` (the last index). Every entry was produced by actually running the reducer. [VERIFIED]

| Current state | Action | New state | Notes |
| --- | --- | --- | --- |
| anything | `load(F')` | `{cursor: 0, length: F', playing: false}` | Discards previous state entirely; `length` is replaced, not merged |
| `{c, F, false}`, `c < L` | `toggle` | `{c, F, true}` | Plain play: resume from where you are |
| `{c, F, true}` | `toggle` | `{c, F, false}` | Plain pause |
| `{L, F, false}` | `toggle` | `{0, F, true}` | **Replay**: at the end, Play restarts |
| `{L, F, true}` | `toggle` | `{0, F, false}` | Unreachable in practice (completion always clears `playing`); if it occurred, the cursor rewinds but playback stays stopped |
| `{c, F, _}` | `tick` | `{min(c+1, L), F, (c+1 < L)}` | Advances; sets `playing` from the *old* cursor |
| `{L, F, _}` | `tick` | `{L, F, false}` | Already at the end: stays put, and stops |
| `{c, F, _}` | `seek(i)`, `0 ≤ i ≤ L` | `{i, F, false}` | Pauses unconditionally |
| `{c, F, _}` | `seek(i)`, `i < 0` | `{0, F, false}` | Clamped low |
| `{c, F, _}` | `seek(i)`, `i > L` | `{L, F, false}` | Clamped high |
| anything | unknown type | *same object reference* | `Object.is` bail-out: no re-render |

## 21.6 What the reducer is *not* allowed to know

:::must The ignorance is the design
The reducer never receives, reads, or references the frame array. It handles three numbers and a boolean. That is why:
- it can be tested with plain objects — `playbackReducer({}, {type: "load", length: 3})` — as the test file does;
- it would work unchanged for any other frame list (pathfinding visits, N-Queens placements, tree traversal orders) — which is the migration the README describes as future work;
- playback can never corrupt the trace: there is no code path from the reducer to the frames.
:::

---

# 22 · Twenty-two worked simulations

> Every answer below was produced by executing the real reducer. Copy the table; rehearse the reasoning.

**Common setup for 22.1–22.16:** `length = 20`, so indices `0…19` and the last index `L = 19`.

| # | Starting state | Action | Result | Why |
| --- | --- | --- | --- | --- |
| 1 | *(none)* | `load(20)` | `{cursor:0, length:20, playing:false}` | A load always resets to the beginning and stops |
| 2 | `{5, 20, false}` | `seek(5)` | `{cursor:5, …, playing:false}` | Seek to where you already are is still a valid, simple state change (same values, new object) |
| 3 | `{5, 20, false}` | `tick` | `{cursor:6, playing:true}` | **Careful:** `tick` sets `playing` from the arithmetic, not from the previous value. It is not reachable from the UI while paused, because only the timer dispatches `tick` |
| 4 | `{5, 20, true}` | `tick` | `{cursor:6, playing:true}` | The normal forward step during playback |
| 5 | `{5, 20, false}` | `toggle` | `{cursor:5, playing:true}` | Play in place — it does **not** reset the cursor unless you are on the last frame |
| 6 | `{5, 20, true}` | `toggle` | `{cursor:5, playing:false}` | Pause in place |
| 7 | `{19, 20, false}` | `toggle` | `{cursor:0, playing:true}` | Replay from the top |
| 8 | `{19, 20, true}` | `toggle` | `{cursor:0, playing:false}` | The inconsistent state — under normal operation, reaching frame 19 has already set `playing:false` |
| 9 | `{5, 20, true}` | `seek(10)` | `{cursor:10, playing:false}` | Seeking pauses. This is the rule people forget in the interview |
| 10 | `{5, 20, true}` | `seek(-5)` | `{cursor:0, playing:false}` | Clamped low — a negative seek from a drag or a keyboard mashing session cannot go out of range |
| 11 | `{5, 20, false}` | `seek(99)` | `{cursor:19, playing:false}` | Clamped high |
| 12 | `{18, 20, true}` | `tick` | `{cursor:19, playing:false}` | The completion case: the cursor lands on the last frame and playback stops **in the same transition** |
| 13 | `{5, 20, false}` | `seek(2.5)` | `{cursor:2.5, …}` | **The gap.** The clamp does not floor or validate the type. `frames[2.5]` is `undefined` |
| 14 | `{5, 20, false}` | `seek(NaN)` | `{cursor:NaN, …}` | `Math.min(NaN, 19)` is `NaN`. Same class of problem |
| 15 | `{5, 20, false}` | `"nonsense"` | the same object (identity equal) | The `default` branch returns `state` itself, so React skips the re-render |
| 16 | `{19, 20, false}` | `tick` | `{cursor:19, playing:false}` | Ticking at the end is a no-op |
| 17 | `load(1)` | — | `{cursor:0, length:1, playing:false}` | A one-frame trace |
| 18 | `{0, 1, false}` | `toggle` | `{cursor:0, playing:true}` | Index 0 **is** the last index, so this is a replay request |
| 19 | `{0, 1, true}` | `tick` | `{cursor:0, playing:false}` | Advances to itself and immediately stops — a single-frame trace cannot animate. Not reachable: every generator emits ≥ 2 frames |
| 20 | `{5, 20, true}` | `load(7)` | `{cursor:0, length:7, playing:false}` | A new input **while playing** stops playback and resets. This is the answer to "what happens if the user changes the input mid-playback?" |
| 21 | `{19, 20, false}` | `seek(0)` | `{cursor:0, playing:false}` | Restart |
| 22 | `{5, 20, true}` | `seek(5)` | `{cursor:5, playing:false}` | Seeking to the current position still pauses — the most commonly missed consequence of an unconditional `playing: false` |

:::answer "Walk me through what happens when I press Play on frame 5 of a 20-frame trace."
"Pressing Play dispatches `{type:'toggle'}`. The reducer spreads the state, checks whether the cursor is on the last frame — it is 5, not 19, so the cursor is left alone — and flips `playing` to true. That re-renders, the timer effect's dependency array sees `playing` change, so it schedules a `setTimeout` for the current speed. When it fires it dispatches `tick`; the reducer moves the cursor to 6 and sets `playing: state.cursor + 1 < state.length - 1`, which is `6 < 19`, so true. That re-renders, `cursor` changed, the effect re-runs, cleanup clears the already-fired timer, and a new one is scheduled. That chain continues until `cursor` is 18: the tick moves it to 19 and computes `19 < 19`, which is false — so `playing` becomes false in the same transition, the effect's next run returns early without scheduling, and playback stops with the final frame displayed."
:::

:::danger The two real weaknesses in the reducer — volunteer them before you are asked
1. **`seek` does not validate or floor the index.** `seek(2.5)` yields `cursor: 2.5`, and `frames[2.5]` is `undefined`, which would throw at `frame.array.map`. Every current call site guards against this (the range input passes `Number(...)` of an integer step; saved and imported cursors are checked with `Number.isInteger`), so it is not reachable through the UI — but the reducer itself is not robust, and a reducer is exactly where such a guard belongs. The one-line fix: `cursor: Math.max(0, Math.min(Math.trunc(action.cursor) || 0, state.length - 1))`. [PROPOSED]
2. **`tick` sets `playing` rather than preserving it.** If a tick ever arrived while paused, playback would start. Today only the timer effect dispatches `tick`, and it only runs while playing, so it is unreachable — but it makes the reducer's contract harder to reason about. [PROPOSED] Either rename it (`advanceAndContinue`) or compute `playing: state.playing && (state.cursor + 1 < state.length - 1)`.
:::

---

# 23 · Twenty-eight reducer questions, with answers

> Read the question, answer out loud, then check. Anything you can answer cold here, you can answer in the interview.

:::q 1. Why a reducer instead of three `useState` calls?
Because cursor, length and playing have cross-field rules — clamping, auto-stop at the end, pause-on-seek. A reducer states those rules once, in a pure function, and makes them testable without React. [Ch. 15]
:::

:::q 2. What are the four actions?
`load`, `toggle`, `tick`, `seek`. Anything else hits `default` and returns the same state object.
:::

:::q 3. What does `load` carry?
Only `length`. The reducer never sees the frames themselves.
:::

:::q 4. Why does `load` return a fresh object instead of spreading state?
To guarantee no stale cursor survives a trace change. Spreading could carry a cursor beyond the new length.
:::

:::q 5. What does `tick` do at the last frame?
Clamps the cursor at `length - 1` and sets `playing: false`. It is idempotent at the boundary; the cursor never runs off the end.
:::

:::q 6. Why does `tick` compute `playing` from the old cursor?
Because the expression "the frame I am moving to is not the last one" is `cursor + 1 < length - 1` evaluated *before* the assignment. If you used the new cursor you would write `cursor < length - 1` and get the same result — but the comment-free version makes the intent clearer as written.
:::

:::q 7. Why does `seek` set `playing: false`?
Because dragging a timeline while the animation runs underneath is disorienting, and it would immediately move the cursor away from where the user just put it.
:::

:::q 8. What happens if you seek beyond the end?
The cursor clamps to `length - 1` and playback stops. The test asserts this: `playbackReducer(s, {type:"seek", cursor:999}).cursor === 2` for a 3-frame trace.
:::

:::q 9. What happens if you seek before the start?
Clamps to 0. Also asserted in the test file.
:::

:::q 10. Where is the reducer imported?
Exactly twice: `SortingLab.jsx` (line 20) and `tests/engine.test.js` (line 6).
:::

:::q 11. Is the reducer pure?
Yes — same inputs always produce the same output, and it never mutates `state` or `action`. Every branch returns a new object except `default`, which returns the *same* object (also pure, and better for React).
:::

:::q 12. What does an unknown action do?
Returns the identical state object. React compares with `Object.is` and skips re-rendering.
:::

:::q 13. What is the initial state?
`{cursor: 0, length: frames.length, playing: false}` — computed in the component from the first render's trace.
:::

:::q 14. What happens when the user changes the algorithm while playing?
`load(values, algorithm)` dispatches `load`, which stops playback and resets the cursor to 0 for the new trace. [Simulation 20]
:::

:::q 15. What happens when the user edits the text input while playing?
**Nothing to playback.** `text` is a draft; `input` only changes when Apply succeeds. The animation keeps running against the committed dataset. [Ch. 10]
:::

:::q 16. Can the cursor ever exceed `length - 1`?
Through the reducer, no. Through the *component*, there is a brief window after an input change where the reducer's `length` is still the old value — which is why the component re-derives `cursor = Math.min(playback.cursor, frames.length - 1)`.
:::

:::q 17. Why does the reducer not need the frame array?
Because every decision is about indices, not content. That ignorance is what makes it reusable.
:::

:::q 18. What is the weakest line in the reducer?
`cursor: Math.max(0, Math.min(action.cursor, state.length - 1))` — it clamps the *range* but not the *domain*. Non-integers and `NaN` pass through. Fix with `Math.trunc` and a numeric guard.
:::

:::q 19. How would you add a `step` action?
`case "step": return {...state, cursor: Math.max(0, Math.min(state.cursor + action.delta, state.length - 1)), playing: false};` This would let the keyboard effect use an empty dependency array. [PROPOSED]
:::

:::q 20. How would you test the reducer on its own?
Import the pure function and drive it with a sequence of actions, asserting the resulting state — exactly what the test file does in the "playback keeps final state, pauses on seek and bounds its cursor" group.
:::

:::q 21. Why is `length` in the state at all, rather than passed to each action?
Because `tick`, `toggle` and `seek` all need it, and the reducer cannot look it up. It is the minimal context needed for the rules.
:::

:::q 22. What if `length` is stale?
The derived `cursor` clamp in the component saves the render, and the next `load` repairs the state. It cannot corrupt the trace, because the trace is not in the reducer.
:::

:::q 23. Could you replace the reducer with a `useRef` and imperative code?
Technically yes — but then playback would not be a render input, the UI would not update, and the rules would live in event handlers instead of a tested function. That is a regression, not a simplification.
:::

:::q 24. Does the reducer handle the case where frames are regenerated identically (same input, same algorithm)?
Yes — but `load` is still dispatched because `load()` is called from `apply`/`load`, which is what resets the cursor. If the user re-applies the same value, the trace is identical and the cursor resets to 0. There is no memoisation of "same input → don't reset". [VERIFIED]
:::

:::q 25. What is the reducer's space complexity?
O(1) — a new three-field object per action. The trace lives elsewhere.
:::

:::q 26. Is the reducer's `length` the number of frames or the number of frames minus one?
The number of frames. The last valid index is `length - 1`, which is why every clamp uses `state.length - 1`.
:::

:::q 27. Why not store `cursor` as a percentage?
Because percentage is a *presentation* concern — it is computed on the fly for the comparison preview (`compareCursor`) and for the meters. Storing an index keeps the primary path exact and avoids rounding drift between cursor and frames.
:::

:::q 28. What single property makes the whole design work?
That the trace is immutable and complete before playback starts. Every reducer rule is then a pure index manipulation, and every render is a pure function of `cursor`.
:::

:::check Red-line drills for Part VII
- [ ] Write the reducer from memory, including the `default` branch.
- [ ] State the three invariants.
- [ ] Simulate: `length = 20, cursor = 5` → `toggle` → `tick` ×3 → `seek(0)` → `tick`.
- [ ] Explain why `seek` pauses and why that is a deliberate choice.
- [ ] Volunteer the two weaknesses and their fixes.
- [ ] Explain what happens on `load` while playing.
:::
