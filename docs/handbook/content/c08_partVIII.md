%PART: Play, pause and the timer system | PART VIII | One timer, one owner, one cleanup — and the five bugs that pattern prevents.

# 24 · The complete Play sequence, in nine steps

> Anything that happens when you click Play, in the exact order React runs it.

## 24.1 The code involved

@@code src/lab/SortingLab.jsx 106 110

@@code src/lab/SortingLab.jsx 386 400

## 24.2 The nine steps

| Step | What happens | React/JS mechanism |
| --- | --- | --- |
| 1 | The user clicks the Play button | A click handler runs inside a React event |
| 2 | `onClick={() => dispatch({type: "toggle"})}` is called | `dispatch` is passed the action object; React does not run the reducer yet |
| 3 | React schedules a re-render and calls `playbackReducer(prev, action)` during it | `toggle` returns a new state with `playing: true` (and the cursor unchanged, because the cursor is not on the last frame) |
| 4 | The component re-renders with `playback.playing === true` | The button's label becomes "Pause" and its icon switches to the Pause glyph; the status tag becomes "Running" |
| 5 | After the commit, React runs effects whose dependencies changed | The timer effect's dependency array `[playing, cursor, speed]` changed (`playing` went `false → true`) |
| 6 | The effect body runs: `if (!playback.playing) return;` does not fire | The guard exists for the pause case |
| 7 | `const id = setTimeout(() => dispatch({type: "tick"}), speed)` schedules exactly one callback | The browser holds the timer; `id` is captured in this effect run's closure |
| 8 | The effect returns `() => clearTimeout(id)` | React stores this cleanup against that effect run |
| 9 | After `speed` milliseconds, the callback fires and dispatches `tick` | The reducer advances the cursor, sets `playing` to `cursor + 1 < length - 1`, React re-renders, and the effect re-runs because `cursor` changed. Its cleanup clears the *already-fired* timer (a harmless no-op), and step 7 repeats. |

:::must The one-sentence summary
**Play sets a boolean; a single effect owns the timer; each tick re-enters the effect; the cleanup guarantees at most one pending timer at any instant.**
:::

## 24.3 The pause sequence, and why it is clean

| Step | What happens |
| --- | --- |
| 1 | The user clicks Pause (the same button) |
| 2 | `dispatch({type:'toggle'})` → the reducer flips `playing` to `false`, leaving the cursor untouched |
| 3 | React re-renders; the button label returns to "Play" (or "Replay" if the cursor is on the last frame) |
| 4 | The effect's dependency array changed, so React runs the previous run's cleanup **before** the new body |
| 5 | The cleanup calls `clearTimeout(id)`, cancelling the pending tick |
| 6 | The new body runs, hits `if (!playback.playing) return;`, and schedules nothing |

**Pause is therefore not "asking the timer to stop" — it is "removing the only thing that was going to schedule another one", plus cancelling the one already in flight.** If the cleanup were missing, pause would stop scheduling new ticks but the pending one would still fire, producing one extra frame after the user pressed pause — the "pause stutters by one frame" bug.

:::trap "Does the timer keep running while paused?"
No, and the correct nuance is: *"There is no interval to keep running. A single timeout was pending, and the cleanup cancelled it. While paused, the effect body returns early and schedules nothing — so there are zero timers alive."* The wrong answer is "the timer keeps running but does nothing".
:::

---

# 25 · The timer system: ownership, cleanup, and duplicates

> Everything the interviewer wants to know about timers, asked and answered.

## 25.1 The ownership model

| Question | Answer |
| --- | --- |
| Who owns the timer? | Exactly one `useEffect` in `SortingLab.jsx` (lines 106–110). No other code in the lab schedules playback |
| How many can exist at once? | At most one. Each effect run clears its predecessor's timer before scheduling its own |
| What re-schedules it? | A change to `playing`, `cursor`, or `speed` |
| What cancels it? | The cleanup function, which React calls before each re-run and on unmount |
| Who dispatches `tick`? | Only the timer callback |
| What if the component unmounts mid-playback? | React runs the cleanup, `clearTimeout` cancels the pending tick, and no state update occurs after unmount |

## 25.2 The five timer bugs this pattern prevents

| Bug | What it looks like | The mechanism that prevents it |
| --- | --- | --- |
| **Orphaned timer** | The animation "runs" after you leave the page; React warns about a state update on an unmounted component | Cleanup on unmount |
| **Duplicate timers** | Each frame advances two or three steps at once — the classic "playback runs at double speed" bug | Cleanup runs before the next scheduling |
| **Stale-delay timer** | Changing speed has no effect until the next frame, or forever | `speed` is in the dependency array, so the effect re-runs and re-schedules with the new delay |
| **Runaway chain** | The cursor overshoots the last frame and `frames[cursor]` is `undefined` | `tick` clamps with `Math.min`, and completion sets `playing: false` |
| **Ghost pause** | One more frame advances after pressing pause | The sweep that clears the pending timeout |

## 25.3 Why `setTimeout` and not `setInterval`

:::answer "Why not setInterval?"
"Because the interval would be a second source of truth for 'where are we'. Four reasons in order of importance.

First, **state control**: with `setInterval` the timer keeps firing whether or not the cursor is at the end — I would still need to clear it from inside the reducer's effect, so I have not removed any complexity, I have added a second thing that must be kept in sync.

Second, **speed changes**: `setInterval` captures its delay at creation. Changing the speed would require clearing and recreating the interval anyway — which is exactly what the `setTimeout` chain does naturally on every re-render.

Third, **pause**: pausing would need an explicit `clearInterval`, and pausing *mid-frame* would be ambiguous. With the chain, pause simply stops the next link from being scheduled.

Fourth, and this is the one people miss: **an interval creates catch-up behaviour.** If the main thread is blocked for 500 ms, a 160 ms interval will queue several callbacks and then fire them back to back, and the animation jumps or stutters to catch up. A self-scheduling `setTimeout` chain always measures from when the previous frame *actually rendered* — so a slow frame simply delays the next one, which is what you want for a visualisation. There's also `requestAnimationFrame` as an alternative, but that is for smooth 60 fps motion, not for stepping through discrete recorded states half a second apart."
:::

## 25.4 Stale closures — the concept, and where it would bite here

:::must What a stale closure is
A function remembers the variables from the scope in which it was **created**. If a React render creates a handler that reads `cursor`, and that handler is stored somewhere permanent (a window listener, a timer, a ref), it will keep reading the *old* `cursor` forever — because it closed over that render's value.
:::

[VERIFIED] There are exactly two places in `SortingLab.jsx` where a closure captures state:

1. **The keyboard handler** reads `cursor` and calls `dispatch({type:"seek", cursor: cursor + 1})`. The effect's dependency array is `[cursor]`, so React removes the old listener and attaches a new one whenever the cursor changes — the handler is never stale. **The cost**: a remove/add pair on most frame advances.
2. **The timer callback** reads nothing — it dispatches a constant action. It is immune to staleness precisely because it captures no state. (This is a nice pattern to name: *keep the callback dumb, let the reducer read the state*.)

:::trap "Why does the keyboard effect depend on `cursor`? Why not just use `[]`?"
Because the handler body reads `cursor`. With `[]`, the listener would be attached once with the cursor value from the first render, and after the first arrow-key press every subsequent press would dispatch a seek to the *same* index — the arrows would look broken. So the dependency is not decoration; it is what makes the closure current. The better design, which I would do next, is to add a `step` action with a `delta` so the handler never needs to read `cursor` at all, and then the array can be empty. [PROPOSED]
:::

## 25.5 Race conditions and unmount

| Scenario | What happens | Is it a problem? |
| --- | --- | --- |
| User changes speed mid-playback | The effect re-runs with the new delay; the pending tick is cancelled and rescheduled | No — the next frame simply waits the new duration |
| User drags the timeline mid-playback | `seek` pauses, so `playing` becomes false and the effect stops scheduling | No |
| User presses Apply with new input mid-playback | `load` resets `playing` to false; the trace changes; the derived cursor clamp keeps the render valid | No. **This is the important one** — the frame array and the cursor update in the same commit |
| Component unmounts mid-playback (route change) | Cleanup cancels the pending timeout | No |
| The timer fires in the same tick as a user's pause click | Either order is safe: if the tick lands first, the cursor advances and then pause stops it; if pause lands first, the cleanup cancels the timer and the tick never runs. There is no way to end up with `playing: true` and no timer | No |
| Two rapid Play clicks | `toggle` twice returns `playing` to `false`; the second render's effect cleanup cancels the timer | No — the button is idempotent-ish by symmetry |

:::danger The one genuine risk, and how to talk about it
JavaScript's event loop is single-threaded, so there is no true parallelism here — but a `setTimeout` callback can become due at almost exactly the moment a click handler runs. The saving grace is that **both paths go through the reducer**, and the reducer is a pure function of the *current* state. Whichever order the two dispatches are processed in, each one sees the state left by the previous one. There is no shared mutable variable that both paths write to, which is precisely why reducers are used for this kind of coordination. [GENERAL KNOWLEDGE applied to VERIFIED code]
:::

---

# 26 · Speed control, and what it does not change

> A one-selector feature with a disproportionately good interview answer.

## 26.1 The control

@@code src/lab/SortingLab.jsx 410 421

| Option | Value | Label |
| --- | --- | --- |
| 1 | 600 ms | 0.5× |
| 2 | 300 ms | 1× |
| 3 | 160 ms | 2× (the default) |
| 4 | 50 ms | 6× |

[VERIFIED] The `value` is a **delay in milliseconds**, and `setSpeed(Number(e.target.value))` converts the DOM string back to a number — the select's value is always a string, which is a real source of bugs in React apps and worth mentioning.

:::must What speed does and does not change
| It changes | It does not change |
| --- | --- |
| The delay between scheduled `tick` dispatches | The number of frames in the trace |
| How long the user waits between visible states | The number of comparisons, passes or exchanges |
| Perceived smoothness | The algorithm's time or space complexity |
| Nothing else | The trace itself — frames are computed once, before playback |
:::

:::q "Does speed affect algorithm complexity?"
This is a comprehension check disguised as a trick question. The answer: *"No — and the cleanest way to say why is that the algorithm has already finished by the time speed matters. Speed is a `setTimeout` delay in the playback effect. The trace was computed in one synchronous burst when the input was committed. Changing the delay changes how fast I walk through a recording, in the same way that rewinding a video faster doesn't make the actors perform better. The UI says exactly that: 'No wall-clock claims: animation speed is not algorithm performance.' Also — the complexity labels in the side panel are static metadata declared in `engine.js`, not measured from the run."*

The last sentence is the part that makes it airtight: complexity in AlgoViz is **declared, not measured**. [VERIFIED: `time: "O(n²)"`, `space: "O(1)"` etc. are literal strings in the algorithm registry.]
:::

:::trap "So your app has no way to tell me which algorithm is actually faster?"
Correct, and you should say so without hedging: *"It cannot, and it does not claim to. What it measures is recorded operation counts — comparisons, and separately the generator-specific pass and exchange counters. Those are a proxy for work done, not for wall-clock time, because real runtime depends on cache behaviour, constant factors, the JavaScript engine, and the data distribution. The project is explicit about that: it is listed as 'not a benchmark platform' in the README, and the panel text says it avoids wall-clock claims."*
:::

:::weak What "0.5×" and "6×" actually mean
The labels are relative to the 300 ms option (1×). 0.5× is 600 ms — twice as long per frame — and 6× is 50 ms. But note the ratios are not exact across the set: 600/300 = 2 (0.5× is right), 300/300 = 1 (1× is right), 300/160 = 1.875 (the "2×" label is approximate), and 300/50 = 6 (6× is right). So the labels are *presentation*, and only three of the four are exact. If an interviewer inspects the numbers, the honest answer is: *"The labels are indicative — they're relative to the 300 ms option, and 160 ms is 1.875× rather than exactly 2×. Rounding that to a friendly label was a deliberate UI choice, but if I wanted exactness I'd either use values that divide evenly or display the millisecond delay directly."* [VERIFIED arithmetic]
:::

---

# 27 · Keyboard control, second by second

> A small feature with three real bugs to avoid, all of which are avoided here.

@@code src/lab/SortingLab.jsx 111 136

| Guard | Reason | What breaks without it |
| --- | --- | --- |
| `INPUT\|SELECT\|TEXTAREA\|BUTTON` test on `e.target.tagName` | Space must type a space when the user is in the dataset field, and Space must activate a focused button natively | Typing `38, 66, 12` in the input would toggle playback on the first space; pressing Space on a focused button would both click the button and toggle playback |
| `e.target.isContentEditable` | The same idea for rich-text-ish elements | Rare here, but it is the complete version of the check |
| `e.ctrlKey \|\| e.metaKey \|\| e.altKey` | Never hijack browser or OS shortcuts (Ctrl+R, Cmd+←, Alt+Tab) | `Ctrl+ArrowLeft` would step the animation *and* do whatever the browser does; `Cmd+←` would do both |
| `e.preventDefault()` inside each handled branch | Stop the page from scrolling on arrow keys, and stop Space from scrolling | The whole page jumps while stepping through frames |
| `window.addEventListener` in an effect with **return cleanup** | Register once per dependency change, remove exactly one | Every cursor change would add another listener; a single ArrowRight press would advance by an increasing number of frames |

:::must The memorable name for this bug
**Listener accumulation.** It is the same failure mode as the duplicate-timer bug, arriving through a different door, and it makes a perfect pairing in an answer: *"Both of my effects return cleanup functions for the same reason — the timer effect clears its timeout, and the keyboard effect removes its listener. If either cleanup were missing, the bug would be the same shape: the old thing keeps running alongside the new one."*
:::

:::q "Which key is checked with `e.code` and which with `e.key` — and is that deliberate?"
`Space` uses `e.code` (the physical key) while the arrows use `e.key` (the produced value). [VERIFIED] `code` is layout-independent, so it is the safer choice for a physical key like the space bar; `key` is more readable for named keys like `"ArrowRight"`. Mixing them is slightly inconsistent, and if I were reviewing my own code I would pick one convention — but both calls are correct, and on every standard layout `e.key === " "` matches the same physical key.
:::

:::check Red-line drills for Part VIII
- [ ] Recite the nine steps of Play without notes.
- [ ] Explain exactly what pauses: the boolean, the cleanup, and the guard.
- [ ] Give four reasons `setTimeout` beats `setInterval` here.
- [ ] Name the five timer bugs the pattern prevents.
- [ ] Explain the stale-closure risk in the keyboard effect and why `[cursor]` fixes it.
- [ ] State precisely what speed does **not** change.
:::
