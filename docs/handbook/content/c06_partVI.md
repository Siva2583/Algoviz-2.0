%PART: React state management in AlgoViz | PART VI | Only the React concepts this project actually uses — with the exact line they appear on and the alternative you rejected.

# 15 · `useState` — ten independent pieces of state

> What it does, where it is used, why, what the alternative was, and what it costs.

:::must The concept
`useState(initial)` returns a pair: the current value for this render, and a setter that schedules a re-render with a new value. State is **per component instance** and **persists across renders** but is **reset when the component unmounts**. Setters do not change the variable you already captured in this render — they queue an update for the next render. That single sentence explains 80% of "why is my state stale?" bugs.
:::

## 15.1 Where AlgoViz uses it

[VERIFIED] Ten calls in `SortingLab.jsx` (`algo`, `text`, `input`, `error`, `notice`, `speed`, `compare`, `other`, `seed`, `saved`); the state register in Chapter 9 lists all of them with types and readers. Two other hook calls look like state but are not: `useSearchParams()` and `useLocation()`. The grouping that matters:

| Group | Variables | Why they are separate state |
| --- | --- | --- |
| Input | `text`, `input` | Draft (invalid-tolerant string) vs committed (guaranteed-valid array). Different types, different lifetimes |
| Feedback | `error`, `notice` | Failure and success need different roles (`alert` vs `status`) and different styling, and they must not overwrite each other's semantics |
| Configuration | `algo`, `other`, `speed`, `compare`, `seed` | Each is an independent user choice; none is derivable from the others |
| Persistence cache | `saved` | Read from `localStorage` **lazily** so the parse happens once per mount |
| Playback | *none* | Deliberately moved into `useReducer` (see Chapter 16) |

## 15.2 The deep dive: initialising `saved` lazily

@@code src/lab/SortingLab.jsx 77 92

:::must The lazy-initialiser pattern, explained
`useState(fn)` is not the same as `useState(fn())`. If you pass a function, React calls it **once**, during the first render, to compute the initial value. If you pass the *result* of a call, the expression executes on **every render** and the result is thrown away on all but the first.

So `useState(() => JSON.parse(localStorage.getItem(...)))` is a genuine optimisation, not a style preference. It matters here because the initialiser touches `localStorage` (synchronous, can throw, and is not free), then parses JSON, then filters and slices. Doing that on every keystroke-driven re-render would be pure waste.

`useState(42)` is fine with a primitive because there is nothing to compute.
:::

Also inside that initialiser, three defensive layers, all of which you should be able to name:

1. `localStorage.getItem(...) || "[]"` — a `null` (missing key) becomes a valid JSON literal rather than a parse error.
2. `try { } catch { return []; }` — **a bare `catch` with no binding.** This is required because `JSON.parse` throws on malformed data, and `localStorage` itself can throw in restricted contexts (Safari private mode historically, or a `SecurityError` when storage is disabled).
3. `Array.isArray(data) ? data.filter(...).slice(0, 6) : []` — the stored value might be valid JSON but the wrong *shape* (an object, a string, a number). `Array.isArray` catches that, and `.filter()` re-checks every entry against the live `algorithms` registry so that a stored entry for a removed algorithm cannot crash the render.

:::q "Why does the filter check `Object.hasOwn(algorithms, x.algorithm)` again, if you only ever save valid algorithms?"
Because the stored data is **not trustworthy input**. It may be from an older version of the app with a different algorithm set, edited by the user in DevTools, or written by another page on the same origin. Validation happens at the boundary between storage and application state — that boundary is the point of trust, not the moment of writing. [INFERENCE on intent; the code is VERIFIED]
:::

## 15.3 Alternative · trade-off · question

| Aspect | Detail |
| --- | --- |
| **Alternative** | `useReducer` for a single `{text, input, error, notice}` object |
| **Trade-off** | A reducer would make the draft→commit transition explicit in one place, and make "clear both banners on load" a single action. It would also force every keystroke through a dispatch, adding indirection for a value that is genuinely just "the string in the box" |
| **What AlgoViz chose** | Independent `useState` for independent concerns; a reducer only where transitions are *related* (playback) |
| **Interview question** | *"Your component has ten `useState` calls. Isn't that a smell?"* See the model answer below |

:::answer "Ten useState calls — isn't that a smell?"
"Ten pieces of state, but only about eight conceptual concerns: the draft, the committed dataset, two kinds of feedback, the algorithm pair, speed, seed, and the storage cache. None of them is derived from another, and none of them is shared with a component that would need it lifted. The one place where the values are genuinely coupled — cursor, length and playing, which must change together under strict rules — is exactly where I did use a reducer. So I'd argue the smell test isn't the count, it's whether the state has any cross-field invariants. The playback state has three; the rest have none."
:::

:::trap "Why not `useState` for playback instead of `useReducer`?"
Because the three playback values have **cross-field invariants**: `cursor` must stay within `[0, length-1]`, `playing` must be false on a seek, and `playing` must become false automatically at the last frame. With three `useState` calls, those rules would be re-implemented at every call site (the play button, the timeline, the arrows, the keyboard handler) and could drift apart. With a reducer, the rules exist once, are pure functions of `(state, action)`, and can be tested without rendering React — which is exactly what the test file does.
:::

---

# 16 · `useReducer` — the playback state machine

> The single most important React decision in the project.

:::must The concept
`useReducer(reducer, initialArg)` returns `[state, dispatch]`. `dispatch(action)` queues an action; React calls `reducer(state, action)` during the next render to compute the new state and re-renders if it differs by `Object.is`. The reducer must be **pure** and must **not mutate** its arguments. Multiple dispatches in one event are batched. Because `dispatch` is stable across renders and the reducer is a standalone function, both are easy to test.
:::

## 16.1 The exact call site

@@code src/lab/SortingLab.jsx 98 105

Three things to notice:

1. **The initial state is a value, not a function** — so `frames.length` is evaluated on every render even though it is only used on the first. Harmless, but a purist would wrap it: `useReducer(playbackReducer, {…}, init)`.
2. **`length` is initialised from `frames.length`**, which at the very first render is the trace for the default 8-element input. It is kept in sync afterwards by the `load` action.
3. **`cursor` is immediately re-derived** on the next line with `Math.min(playback.cursor, frames.length - 1)` — the defensive clamp discussed in Chapter 9.

## 16.2 Alternative · trade-off · question

| Aspect | Detail |
| --- | --- |
| **Alternative** | Three `useState` calls, or a custom hook `usePlayback(length)` wrapping the reducer |
| **Trade-off** | A custom hook would be tidier and reusable — [PROPOSED] `usePlayback(frames.length)` would return `{cursor, playing, toggle, tick, seek, restart}` and would make the reducer reusable for the non-sorting modules (which the README lists as the next migration). It would also hide the reducer from a reader who wants to see the transition table |
| **What AlgoViz chose** | The raw `useReducer` in the component, so the state machine is visible where it is used |
| **Interview question** | *"Where would you extract this?"* → the hook. Say it as PROPOSED, not as existing work |

:::danger Never claim the reducer is "shared" or "generic"
[VERIFIED] The reducer is generic in *design* — it knows nothing about sorting — but it is currently used by exactly one component, `SortingLab`, and only one component imports it. The README says the migration to other algorithm families has not happened yet. Say: *"The reducer is algorithm-agnostic and would drive any frame list, but today only the sorting lab consumes it — the migration of the other modules is the next step."*
:::

---

# 17 · `useEffect` — two effects, both with cleanup

> The most dangerous hook in the project, used carefully.

:::must The concept
`useEffect(fn, deps)` runs `fn` **after** the render commits. If `deps` is present, the effect re-runs only when a dependency changes by `Object.is`. Before each re-run — and on unmount — React calls the function returned by the previous run (the cleanup). `useEffect` has no dependency array = runs after every render; empty array `[]` = runs once on mount (twice in StrictMode development).
:::

## 17.1 Effect #1 — the playback timer

@@code src/lab/SortingLab.jsx 106 110

| Element | Explanation |
| --- | --- |
| `if (!playback.playing) return;` | The guard. When paused, the effect body does nothing — but note it **does not return a cleanup function**, so React has nothing to clean up. That is correct: no timer was scheduled |
| `setTimeout(() => dispatch({type: "tick"}), speed)` | One frame advance, scheduled once. Not an interval |
| `return () => clearTimeout(id)` | The cleanup. Fires before the next run and on unmount |
| `[playback.playing, playback.cursor, speed]` | `playing` to start/stop; `cursor` so each tick schedules the next one; `speed` so a mid-play speed change reschedules at the new delay |

:::must The re-scheduling pattern, stated precisely
This effect is a **self-perpetuating chain, one link at a time**: playing → schedule a timeout → the timeout dispatches `tick` → `cursor` changes → the effect re-runs → the old timer is already fired, and the new one is scheduled → repeat. There is never more than one pending timer, because each run's cleanup clears the previous one. That is the whole "how do you prevent duplicate timers" answer: **the cleanup, plus a dependency array that includes everything the body reads.**
:::

## 17.2 Effect #2 — the keyboard listener

@@code src/lab/SortingLab.jsx 111 136

The interesting parts:

1. **The guard clause** (lines 113–120) ignores events when the target is an `INPUT`, `SELECT`, `TEXTAREA` or `BUTTON`, when the target is content-editable, or when any modifier key is held. [VERIFIED] Without it, typing a space in the dataset field would both insert a space *and* toggle playback — the classic global-shortcut bug.
2. **`e.code === "Space"`** vs `e.key === "ArrowRight"`. `code` is the *physical* key (so it works regardless of keyboard layout for the space bar), while `key` is the produced character. Mixing them here is deliberate but inconsistent-looking; a question worth anticipating.
3. **`e.preventDefault()`** on each handled key stops the page from scrolling when an arrow key is pressed.
4. **`[cursor]` as the dependency array.** The handler closes over `cursor`, so the listener must be re-attached whenever `cursor` changes, otherwise the arrows would read a stale cursor and appear to do nothing after the first press. This is *the* stale-closure trap in this codebase, and the correct fix is visible: the effect depends on the value the handler reads.
5. **The cleanup removes the listener** — without it, every cursor change would add another listener and the arrow keys would fire N times per press.

:::weak The inefficient-but-correct detail worth knowing
Because the dependency array contains `cursor`, this effect tears down and re-registers a window listener on **every frame advance during playback** — roughly 6 times per second at 6×. The correct and more efficient pattern is a functional update (`dispatch({type: "seek", cursor: cursorRef.current ± 1})` via a ref, or making the reducer accept a relative seek action like `{type: "step", delta: 1}`), which would let the dependency array be empty.

[VERIFIED] that this is the current behaviour; [INFERENCE] that the step action is the cleaner design. If asked "what would you change in this file?", this is one of the two best answers — the other being the duplicated generator run in `load()`.
:::

## 17.3 What is *not* in an effect, and why that matters

:::must The effects that are deliberately absent
There is **no effect that synchronises playback with the frame array.** When `input` or `algo` changes, the trace is recomputed by `useMemo` during render, and the cursor is clamped by a plain `Math.min(...)` during render. No `useEffect` participates. This is why the lab never shows a frame of a stale trace: the clamp is *derived during render*, not reconciled after the fact.

That is a genuine pattern worth naming: **"derive, don't synchronise."** If you had written `useEffect(() => setCursor(0), [frames])`, you would get one render with the old cursor against the new frames — the classic "flash of the wrong frame" and, in the worst case, an index out of bounds.
:::

---

# 18 · `useMemo` — two memoised traces

> Caching that carries real semantics, not just performance.

## 18.1 Where it is used

@@code src/lab/SortingLab.jsx 93 97

| Aspect | Detail |
| --- | --- |
| What it does | Returns a cached value, recomputed only when a dependency changes by `Object.is` |
| Why here | Each generator call allocates hundreds of objects. Without memoisation, `frames` would be rebuilt on every render: on every keystroke in the dataset field, every speed change, every hover, every error banner — for data that had not changed |
| Why `[algo, input]` and not `[text]` | `text` is the unvalidated draft. Deriving frames from it would mean running the generator on invalid input |
| Why `input` works as a dependency | Arrays compare by reference. `input` is replaced only by `load()`, which receives a freshly created array from `parseInput` or `makeDataset` — so the reference changes exactly when the dataset changes |
| The comparison memo | `[compare, other, input]`: `compare` gates the work (empty array when off), `other` selects the algorithm, `input` is the shared dataset — **the same reference for both traces**, which is precisely what makes the comparison honest |

:::q "Isn't `useMemo` just an optimisation? Why does it matter architecturally?"
Because here it also encodes a **semantic guarantee**: both memos depend on the same `input` reference, so the primary and comparison traces are provably derived from the same dataset. If the comparison ran on a *copy* of the input, the traces could still be correct but they would not be provably like-for-like. The single shared reference is the mechanism behind "same dataset" in the panel heading. [VERIFIED]

The honest caveat: **`useMemo` is a performance hint, not a semantic guarantee** — React is permitted to discard memoised values. It happens to be safe here because recomputing produces identical frames (the generators are pure), so a discarded cache costs time, not correctness. That is the distinction to make out loud.
:::

## 18.2 Alternative · trade-off

| Alternative | Result |
| --- | --- |
| No `useMemo` — build frames during render each time | Correct but wasteful; the worst trace is ~1 MB of objects *per render* |
| `useState` + an effect to build frames | Worse: an extra render pass with no frames, and the "flash of the wrong frame" problem |
| `useMemo` with `[algo, input, compare, other]` merged | Couples the two traces: toggling comparison off would needlessly rebuild the primary trace |
| Move generation into a Worker | [PROPOSED] the scale answer; adds async complexity that is unjustified at n ≤ 24 |

## 18.3 `useCallback` — used exactly once, and not here

[VERIFIED] `useCallback` appears once in the entire repository: `src/modules/core/Nqueens.jsx`, line 21, where `resetBoard` is memoised with the dependency `[gridSize]` and then invoked by an effect whose dependency is the memoised function itself.

```jsx
const resetBoard = useCallback(() => { /* rebuild the board */ }, [gridSize]);
useEffect(() => { resetBoard(); }, [resetBoard]);
```

That pattern is worth understanding, because it is the reason `useCallback` exists in a codebase that mostly doesn't need it: **the effect depends on a function, and a function defined inline is a new object every render, so the effect would run on every render.** Memoising the function makes the effect's dependency stable, and the effect then runs only when `gridSize` genuinely changes — which is exactly when the board must be rebuilt.

The lab does not use `useCallback`, and the reason is structural rather than stylistic: its two effects depend on *values* (`playing`, `cursor`, `speed`), never on a function, so there is no unstable identity to stabilise. Adding `useCallback` where nothing consumes the function's identity is pure noise — React would allocate the wrapper and compare it against nothing.

:::q "So why not memoise `load`, `apply` and `save` with `useCallback`?"
Because nothing downstream depends on their identity. They are passed to `onClick` and `onSubmit` handlers, which are recreated every render anyway, and neither effect reads them. `useCallback` buys you a stable reference; if no dependency array and no memoised child consumes that reference, it buys you nothing. The correct order is to profile first and memoise only where an unstable identity is *causing* work. [GENERAL KNOWLEDGE, applied to this codebase]

Where it *would* start to matter: if `ArrayView` were memoised and given a callback prop, or if an effect took one of these functions as a dependency. Neither is true today.
:::

---

# 19 · `useRef` — two refs, two jobs

> One for the DOM, one that is a trap.

[VERIFIED] There is exactly **one** `useRef` call in `SortingLab.jsx`:

1. **`fileInput`** (line 60) — holds the hidden `<input type="file">` element so the Import button can call `fileInput.current?.click()`. This is the canonical use: a mutable handle that must not trigger renders.

Two other values are easy to misremember as refs under pressure: **`params`** and **`location`** come from `useSearchParams()` and `useLocation()` — read-only router hooks, not refs, and not written to. Say the count precisely: one ref in the lab, two refs in the legacy modules (`isPausedRef` and `speedRef`).

Inside the legacy modules — the live example is `src/modules/core/Nqueens.jsx`, which is a lazy route — refs do a very different job: `isPausedRef` and `speedRef` mirror state so that `async` loops — which captured their own closure long ago — can read current values. That is the classic "state that the render cycle cannot reach" problem, and it is why the legacy code has synchronous pause behaviour without re-running effects.

:::must The `useRef` facts an interviewer is checking
- A ref's `.current` mutation **does not** re-render the component.
- The ref object is **stable** across renders (`useRef` returns the same object every time).
- Refs are the escape hatch for **values that must survive renders but must not drive them**.
- In React 19 + StrictMode, ref *callbacks* may be invoked twice in development; the ref *object* pattern used here is unaffected.
:::

:::trap "Why is `fileInput` a ref and not state?"
Because you never want to render based on the file input element. Putting it in state would cause a re-render the moment it attaches (and the element identity would change on every render, potentially causing an infinite loop if used as a dependency). Refs exist exactly for this: an imperative handle to a DOM node. [GENERAL KNOWLEDGE, applied to VERIFIED code]
:::

---

# 20 · Props, lifting, and derived state

> How data moves between the components in this project.

## 20.1 Every significant prop in the project

| Component | Props | Direction |
| --- | --- | --- |
| `App` | none | — |
| `Home` | none | Reads URL via router hooks |
| `Overview` | `library` (boolean) | One prop switches hero vs library presentation |
| `Shell` | `children` | Layout slot |
| `ModuleFrame` | `children, activeTab, onTabChange, running, paused, onMouseLeave` | **This is the only component in the project with a callback prop** — the legacy modules own their own tab and running state and pass handlers down |
| `SortingLab` | none | Self-contained; gets everything from URL hooks |
| `ArrayView` | `frame`, `compact` (default `false`) | Pure presentation; no callbacks |
| `TutorialTab` | `data` | Renders whichever lesson object it is given |

:::note What is notable by its absence
There is **no prop drilling deeper than two levels**, no context provider in the live tree, and no state lifted above a page component. `ModeContext` exists but is only consumed by dead components. The consequence is a codebase with almost no indirection — which is a legitimate architectural answer to "how is your state organised?".
:::

## 20.2 Derived state, done right

[VERIFIED] Seven values are computed during render and stored in no state at all: `initial`, `cursor`, `frame`, `meta`, `stats`, `last`, `compareCursor`. They are plain `const` declarations.

:::must The rule AlgoViz follows
**If a value can be computed from existing state during render, it must not be its own state.** Storing `frame` in state would create a second source of truth that could disagree with `frames` and `cursor` — for example after an input change. Deriving it guarantees consistency by construction: there is no moment when `frame` is not `frames[cursor]`.
:::

:::q "Give me an example of derived state in your project and what would go wrong if you made it real state."
"`frame` is derived — it's `frames[cursor]`. If I kept it in state and updated it in an effect on cursor change, then between the cursor change and the effect firing there would be a render where the cursor had moved but the rendered frame had not. The UI would show one frame while the timeline and step badge showed another. The dangerous half of that is when `frames` shrinks: for one render, `frame` would be an element of the *previous* trace — or `undefined` if the index no longer exists, which would crash `ArrayView` at `frame.array.map`. Deriving it makes that impossible." [VERIFIED reasoning from the code]
:::

## 20.3 The cleanup checklist (everything that must be cleaned up)

| Resource | Where it is acquired | How it is cleaned up | Verified |
| --- | --- | --- | --- |
| Playback timeout | the timer effect | `return () => clearTimeout(id)` | [VERIFIED] line 109 |
| Keydown listener | the keyboard effect | `return () => window.removeEventListener("keydown", key)` | [VERIFIED] line 135 |
| Generated object URL | `URL.createObjectURL(blob)` in `download()` | `setTimeout(() => URL.revokeObjectURL(url), 1000)` | [VERIFIED] line 57 |
| Synthetic anchor | created in `download()` | never appended to the document, so nothing to remove | [VERIFIED] — it is clicked while detached; the browser still honours the download |
| Lazy chunks | React Router + `lazy()` | nothing to clean — module registry is process-wide | [GENERAL KNOWLEDGE] |

:::must The revokeObjectURL detail, and why the 1,000 ms delay is deliberate
`URL.createObjectURL` pins the blob in memory until it is revoked. Revoking **immediately** after `.click()` is a known failure mode in some browsers, because the download may not have started reading the blob yet. Delaying revocation by a second is the standard safe pattern. If asked "does your code leak memory?", this is the answer: *"The only object URL I create is revoked on a timer, deliberately delayed so the download can start reading it first. A leak there would pin at most one small JSON blob per export."* [VERIFIED code; the rationale is GENERAL KNOWLEDGE]
:::

:::check Red-line drills for Part VI
- [ ] Explain the lazy `useState` initialiser and why `useState(fn())` is wrong.
- [ ] Explain the difference between the two effects' dependency arrays.
- [ ] Explain why the keyboard effect must depend on `cursor`.
- [ ] Explain "derive, don't synchronise" with the `frame` example.
- [ ] Name two things that are cleaned up and one that is only cleaned up after a delay.
- [ ] Say what the reducer is *not*: shared, generic-in-use, or used outside the lab.
:::
