%PART: The Sorting Lab, end to end | PART IV | Every state variable, the draft-versus-committed distinction, and the full path from a keystroke to a rendered bar.

# 09 · The Sorting Lab state register

> This table is the single most examinable artefact in the project. Learn it as a table, not as prose.

## 9.1 Why a state register matters

An interviewer who says "show me your state" is testing one thing: do you know which of your variables are *inputs*, which are *derived*, and which are *copies that can drift out of sync*. AlgoViz has ten `useState` calls, one `useReducer`, one `useRef`, two `useMemo` values and six derived render-time constants (plus two router hooks that supply read-only values). Knowing the category of each one is the difference between "I have some state" and "I can tell you why each piece exists".

## 9.2 The register (all [VERIFIED] from `src/lab/SortingLab.jsx`)

| State | Type | Initial value | Who changes it | Who reads it | Why it exists |
| --- | --- | --- | --- | --- | --- |
| `fileInput` | `useRef` (`HTMLInputElement`) | `null` | React on mount | the hidden `<input type="file">`, and the Import button's `onClick` | The file input is visually hidden, so a button must programmatically trigger it. A ref is the DOM handle; a state variable would cause pointless re-renders |
| `params` | `URLSearchParams` | from the URL | navigation | `initial` algorithm, `compare` initial value | Deep links: `?algorithm=quick`, `?compare=1` |
| `location` | location object | from the router | navigation | `initial` (advanced-sort detection) | The pathname decides the default algorithm for the two sorting routes |
| `algo` | `string` (key of `algorithms`) | `"bubble"`, `"quick"` for advanced-sort, or a valid `?algorithm=` | `load()`; the algorithm `<select>` | `frames` memo, `meta`, `save()`, `download()` | Which generator produces the primary trace |
| `text` | `string` | `"38, 66, 12, 85, 24, 57, 43, 19"` | the text input's `onChange` **on every keystroke**; `load()` normalises it | the input element; `apply()`; `parseInput` | **The draft.** It must accept intermediate, invalid text like `"38, 66,"` — otherwise the user could not type a comma at the end |
| `input` | `number[]` | `[38, 66, 12, 85, 24, 57, 43, 19]` | `load()` only | `frames` memo, `otherFrames` memo, `save()`, `download()`, the "ARRAY STATE [n]" caption | **The committed dataset.** It is the only array the engine ever sees, and it is guaranteed valid by construction |
| `error` | `string` | `""` | `apply()` and `importExperiment()` (set), `load()` (cleared) | the red `role="alert"` banner | Validation feedback must survive until the next successful action |
| `notice` | `string` | `""` | `save()` (both branches), `importExperiment()` (success), `load()` (cleared) | the `role="status"` banner | Positive confirmation ("Saved on this device.") is separate from validation failure |
| `speed` | `number` (ms) | `160` | the speed `<select>` | the timer effect's delay, and its dependency array | Delay per frame. 160 ms ≈ the 2× label |
| `compare` | `boolean` | `params.has("compare")` | the Compare button (`setCompare(!compare)`) | whether `otherFrames` are computed, and whether the comparison panel renders | Comparison must be opt-in so the default view stays simple |
| `other` | `string` | `"merge"` | the comparison `<select>` | `otherFrames` memo | The second algorithm's key |
| `seed` | `number` | `42` | the shuffle button (`setSeed(seed + 1)`) | the next shuffle click | Makes "random" datasets reproducible: seed 42 always produces the same ten numbers (LCG: 27, 12, 56, 25, 38, 7, 45, 15, 83, 94) |
| `saved` | array of experiment objects | **lazily** read from `localStorage`, filtered, sliced to 6, or `[]` on throw | `save()` | the saved-experiments list | A cache of what is in `localStorage`, so reading and parsing happen once per mount, not once per render |
| `frames` | `object[]` (**derived**) | computed | `useMemo` on `[algo, input]` | almost everything: `ArrayView`, timeline max, tag, counters, comparison | The primary recorded trace |
| `otherFrames` | `object[]` (**derived**) | `[]` or computed | `useMemo` on `[compare, other, input]` | comparison panel | The second recorded trace, from the **same** `input` |
| `playback` | `{cursor, length, playing}` | `{cursor: 0, length: frames.length, playing: false}` | the reducer via `dispatch` | cursor, tag, play button label, timer effect | Transport state — the only genuinely stateful machine in the component |
| `cursor` | `number` (**derived**) | — | recomputed every render | `frame`, timeline value, step buttons, tag, `save()` | `Math.min(playback.cursor, frames.length - 1)` — a defensive clamp against a stale reducer cursor after an input change |
| `frame` | `object` (**derived**) | — | recomputed | `ArrayView`, inspector, explanation | `frames[cursor]` — the one and only read of the trace in the render path |
| `meta` | `object` (**derived**) | — | recomputed | headings, invariant panel, comparison labels | `algorithms[algo]` |
| `stats` | `object` (**derived**) | `{}` | recomputed | the three metric tiles | `frame.currentStats \|\| {}` |
| `last` | `object` (**derived**) | — | recomputed | comparison panel | `frames.at(-1).currentStats` — the **final** counters for the complete run |
| `compareCursor` | `number` (**derived**) | `0` | recomputed | the compact `ArrayView` in comparison mode | `Math.round((cursor / (frames.length - 1)) * (otherFrames.length - 1))` |

## 9.3 The two properties that make this register safe

:::must Property 1 — `input` cannot be invalid
`input` is written in exactly one place, inside `load()`, and every caller of `load()` either passes an already-validated `number[]` from `parseInput` or a `makeDataset()` result. There is no code path that assigns `text` (the unvalidated string) to `input`. [VERIFIED] This is why the engine never needs to defend against bad data: validation happens at the boundary and the interior is total.
:::

:::must Property 2 — `cursor` cannot be out of range
Two independent clamps exist. The reducer clamps on `seek` (`Math.max(0, Math.min(action.cursor, state.length - 1))`) and on `tick` (`Math.min(state.cursor + 1, state.length - 1)`). The component additionally derives `cursor = Math.min(playback.cursor, frames.length - 1)`. [VERIFIED] The second clamp matters in a specific race: if `input` changes, `frames` shrinks in the same render that `playback` still holds the old cursor — because the reducer's `length` only updates when the `load` action is processed. Without the derived clamp, `frames[cursor]` could momentarily be `undefined` and `ArrayView` would throw on `frame.array.map`.
:::

:::q "Why is there both `text` and `input` — isn't that duplicated state?"
This is the most important state question in the project. Answer in three parts:

1. *They have different types and different meanings.* `text` is a string that is allowed to be invalid; `input` is a number array that is guaranteed valid. They are not two copies of one value — they are a draft and a commitment.
2. *If they were one piece of state*, the input field could not hold `"38, 66,"` while the user is typing, because the moment a comma is dangling the value is invalid. You would have to either reject the keystroke (hostile) or store the parsed array and lose the user's literal text.
3. *The sync rule is one-directional:* `text → input` happens only on submit, `input → text` happens on `load()` as normalisation. A user who types junk and presses Apply sees an error and **the previous committed dataset keeps being visualised** — the lab does not blank out. [VERIFIED]
:::

## 9.4 The one place the register costs something

:::weak The duplicated generator run on `load`
`load()` does this:

```js
dispatch({ type: "load", length: algorithms[algorithm].run(values).length });
```

That call executes the whole generator — building every frame — purely to read `.length`. Then the `useMemo` for `frames` runs the same generator a second time to obtain the frames themselves. So every input change runs the selected generator **twice**. [VERIFIED]

**Impact:** for the capped input sizes (≤ 24 elements, ≤ 1,154 frames for the worst measured trace) this is sub-millisecond work and invisible to the user. It is still genuinely wasteful, and the fix is trivial — derive the length from the memo instead of computing it:

```js
// [PROPOSED] not implemented
const frames = useMemo(() => algorithms[algo].run(input), [algo, input]);
useEffect(() => { dispatch({ type: "load", length: frames.length }); }, [frames]);
```

Or better, keep the reducer as the single owner of `length` by having it derive the length from the frame array it is handed. Either way, the honest answer is: *"Yes, I run it twice. It's deliberate only in the sense that I wanted the reducer's length to be set at commit time so the first render after a load is already consistent. At this input cap it's free; at a 10,000-element cap I would restructure it."* This is exactly the kind of answer that reads as senior: acknowledge, quantify, and give the fix.
:::

---

# 10 · The input pipeline: draft → validation → committed dataset

> Six rules, five error messages, and the exact order in which they fire.

## 10.1 The five validation rules in `parseInput`

@@code src/lab/engine.js 63 79

| # | Rule | Code | Failure message | Why this rule exists |
| --- | --- | --- | --- | --- |
| 1 | Non-empty string (and a string at all) | `typeof text !== "string" \|\| !text.trim()` | "Enter 2–24 integers, separated by commas." | Guards against `null` from a missing query param, and against whitespace-only input |
| 2 | Between 2 and 24 values | `parts.length < 2 \|\| parts.length > 24` | "Use 2–24 values. Small inputs keep every operation inspectable." | **The performance guard.** Bubble sort on 24 elements already produces 1,154 frames and ~980 KB of JSON; the cap is what keeps the trace usable and the memory bounded |
| 3 | Every part is an optionally-signed integer | `!/^-?\d+$/.test(p.trim())` | "Use whole numbers separated by commas. Empty values are not allowed." | Rejects `2.5`, ``, `abc`, `1e3`, `Infinity`, `0x10`, and trailing commas — the regex is anchored, so partial matches fail |
| 4 | Safe integer and `\|n\| <= 999` | `!Number.isSafeInteger(n) \|\| Math.abs(n) > 999` | "Each number must be between −999 and 999." | `Number.isSafeInteger` rejects values beyond 2⁵³ even if they parse; the range cap keeps bar heights meaningful and prevents absurd labels |
| 5 | Returns `number[]` | `parts.map(Number)` | — | The single conversion point from text to numbers |

:::must Why rule 3 uses a regex instead of `Number()`/`isNaN()`
`Number("")` is `0`, `Number(" ")` is `0`, `Number("1e3")` is `1000`, `Number("0x10")` is `16`, and `Number("Infinity")` is `Infinity`. Numeric coercion silently accepts all of these. An anchored regex `^-?\d+$` states the accepted *grammar* explicitly, and only then is the value converted. This is the standard "validate the shape, then parse" discipline, and it is worth saying out loud — it is the kind of detail that separates people who have been burned by implicit coercion from people who have not.
:::

## 10.2 What actually happens on submit — the full trace

Trace `apply()` when the user types `"38, 66, 12"` and presses Enter:

1. The `<form onSubmit={apply}>` fires; `apply(e)` calls `e.preventDefault()` so the browser does not perform a native form submission and reload the page. [VERIFIED line 149]
2. `parseInput("38, 66, 12")` runs — note the spaces are preserved in the draft but each part is `.trim()`-ed during the regex test, and `Number(" 66 ")` is `66`, so spaces are harmless.
3. Validation passes → `[38, 66, 12]`.
4. `load([38, 66, 12])` is called with `algorithm = algo` as the default parameter.
5. `setInput([38, 66, 12])` — the committed dataset changes.
6. `setText("38, 66, 12")` — the draft is normalised (so `"38,66 , 12"` becomes `"38, 66, 12"`).
7. `setAlgo(algo)` — a no-op state set to the same value; React bails out of re-rendering for that call.
8. `dispatch({type: "load", length: 16})` — the generator ran once here to count frames for this input.
9. `setError("")`, `setNotice("")` — banners are cleared.
10. React re-renders: `frames` memo recomputes (because `input` is a **new array reference**, even though its contents differ from the old one anyway), `cursor` clamps into the new range, `frame = frames[0]`, and `ArrayView` renders the initial state.

Now trace the **failure** path. The user types `"38, 66, 2.5"`:

1. `parseInput` throws `new Error("Use whole numbers separated by commas. Empty values are not allowed.")`.
2. `catch (err) { setError(err.message); }`.
3. **Nothing else changes.** `input` still holds the previous dataset, `frames` is unchanged, the animation keeps its cursor, and the visualisation keeps rendering the last valid dataset while a red banner appears above it. [VERIFIED]

:::key The design principle to name in the interview
**"A failed commit must not destroy the last good state."** That is why the error path touches exactly one piece of state. It is the same principle that makes the input panel safe to experiment in: you can type nonsense into AlgoViz indefinitely without losing the trace you were studying.
:::

## 10.3 The other three ways a dataset enters the lab

| Entry point | Code path | Notes |
| --- | --- | --- |
| **Preset buttons** (`random`, `sorted`, `reverse`, `duplicates`) | `load(makeDataset(kind, 42))` | Always seed **42** — the presets are fixed shapes, deliberately reproducible. [VERIFIED line 283] |
| **Shuffle button** | `setSeed(seed + 1); load(makeDataset("random", seed))` | The seed increment is a state update, so the *current* render's `seed` value is what gets used. Consequence: the sequence of datasets is still 42, 43, 44…, but the visible `seed` state is always one ahead of the dataset actually loaded. Harmless, but if an interviewer asks "is your shuffle reproducible?", the precise answer is *"The dataset for a given click is determined by the seed value at that click, and the seeds advance by one each click — so a session's shuffle sequence is reproducible even though I don't display the seed."* [VERIFIED] |
| **Saved experiment / imported JSON** | `parseInput(item.input.join(","))` → `load(values, item.algorithm)` | Revalidated through the **same** `parseInput` — untrusted data gets no shortcuts. An invalid saved entry is caught and reported as "This saved experiment is invalid." [VERIFIED] |

## 10.4 `makeDataset`: a hand-rolled deterministic generator

@@code src/lab/engine.js 106 120

Three things worth knowing precisely:

1. **It is a linear congruential generator**, `state = (1664525 * state + 1013904223) mod 2³²`, using `Math.imul` for 32-bit-correct multiplication and `>>> 0` to keep the state unsigned. `Math.imul` matters: plain `*` on numbers above 2⁵³ loses precision and the sequence would not be reproducible.
2. **It always produces exactly ten values**, in the range 5–94 (`5 + floor(random() * 90)`). Not two, not twenty-four — ten. [VERIFIED]
3. **Same seed → identical array, every time, in every browser**, because the arithmetic is integer-only and does not touch `Math.random()`. The test asserts exactly this: `assert.deepEqual(makeDataset("random", 12), makeDataset("random", 12))` and `assert.notDeepEqual(makeDataset("random", 12), makeDataset("random", 13))`. [VERIFIED]

| Kind | Transformation | Purpose |
| --- | --- | --- |
| `random` | as generated | Baseline unsorted input |
| `sorted` | `values.sort((a, b) => a - b)` | **Best case** for insertion sort and bubble sort's early-exit variant — the trace is dramatically shorter |
| `reverse` | `values.sort((a, b) => b - a)` | **Worst case** for bubble sort and quick sort with a last-element pivot |
| `duplicates` | `values.map(n => (n % 4) * 15 + 10)` → values from the set {10, 25, 40, 55} | Forces equal keys, which is the only way to observe whether equal values keep their relative order — and, in this codebase, the only way to see the stable-ID design matter |

:::q "Why is `duplicates` the most interesting preset?"
[VERIFIED] Because equal values are the case where an index-based visualisation breaks down and an ID-based one does not. Each element carries `id: "block-<original index>"`, so when two elements both hold the value 25, React's `key={item.id}` keeps them as distinct DOM nodes and the "active" highlight follows the *element*, not the *position*. The element-object clone on every frame preserves that id, so the identity of an element survives every swap it participates in. With `(n % 4) * 15 + 10` the array is guaranteed to contain repeats, which is exactly the input that would expose an implementation that identified elements by their value.
:::

## 10.5 The input panel's defensive details

| Detail | Source | Why it is there |
| --- | --- | --- |
| `maxLength={150}` on the text input | line 260 | A cheap client-side ceiling so a user cannot paste a 10 MB string and force a 24-slot parse attempt over millions of characters |
| `aria-describedby="input-help"` | line 259 | Connects the input to the hint text "2–24 integers · −999 to 999" |
| `role="alert"` on the error banner | line 290 | Screen readers announce validation failure immediately |
| `role="status"` on the notice banner | line 295 | Polite announcement for save/import confirmations |
| The Apply button is `type="submit"` inside the form | line 263 | Pressing Enter applies the input — the form provides the keyboard affordance for free |
| The shuffle button is `type="button"` | line 267 | Without it, it would submit the form and apply the (unchanged) text instead of shuffling |
| Preset buttons are **outside** the form | lines 278–288 | They are plain buttons in a `div`; being outside the form means they cannot accidentally submit it |

:::trap "Why is there a `maxLength` on an input you validate anyway?"
The trap is answering "because of validation". They are different controls at different layers: `maxLength` is a *UI affordance* that prevents the bad state from being entered; `parseInput` is a *correctness guarantee* that runs regardless of how the value got there (paste, autofill, saved experiment, imported JSON, or a programmatic call in a test). Remove `maxLength` and the app is still correct, just less pleasant. Remove `parseInput` and nothing is guaranteed. Never confuse a UI constraint with an invariant.
:::

:::check Red-line drills for Part IV
- [ ] Can you name all 12 `useState` variables and the reducer without looking?
- [ ] Can you explain `text` vs `input` in under 30 seconds?
- [ ] Can you state all five validation rules and the exact error message for each?
- [ ] Can you trace a failed submit and explain why the visualisation keeps working?
- [ ] Can you name the four dataset kinds and say what each one is good for?
- [ ] Can you say the LCG formula and why `Math.imul` is necessary?
- [ ] Can you point at the duplicated generator run and give the fix?
:::
