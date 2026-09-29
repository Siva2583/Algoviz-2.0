%PART: Resume defence | PART XXXI | Every claim in your AlgoViz entry taken apart: what it means, where it lives, how you prove it, and the trap behind it.

# 57 · Defending the resume entry, claim by claim

> The interviewer is holding your resume and has decided to start there. This chapter is the script.

## 57.0 The entry, split into atomic claims

Your AlgoViz bullet contains **fourteen** checkable assertions — eight of them are the grouped audit in Chapter 2, and the list below splits them to the granularity at which each one can be disproved independently. Most candidates cannot even enumerate their own claims; enumerating them first is itself a strong signal.

| # | Claim | Verdict | Proof location |
| --- | --- | --- | --- |
| 1 | Recorded-frame playback | [VERIFIED] | Six generators return `frames[]`; `SortingLab` indexes into it |
| 2 | For 6 sorting algorithms | [VERIFIED] | `engine.js` 8–62, six entries |
| 3 | Using React reducers | [VERIFIED] | `useReducer(playbackReducer, …)`, `SortingLab.jsx` 98 |
| 4 | Pause / resume | [VERIFIED] | the `toggle` action |
| 5 | Single-step navigation | [VERIFIED] | `seek(cursor ± 1)` plus `seek(0)` |
| 6 | Speed control | [VERIFIED] | four preset delays 600/300/160/50 |
| 7 | Timeline seeking | [VERIFIED] | `<input type="range" min=0 max={frames.length-1}>` |
| 8 | Same-input algorithm comparison | [VERIFIED] | `otherFrames` memo over the identical `input` reference |
| 9 | Percentage-aligned replay | [VERIFIED] | `compareCursor` computation, line 201–203 |
| 10 | Recorded operation counts | [VERIFIED] with a scope limit | `currentStats {passes, comps, swaps}`; comparison uses `comps` only |
| 11 | Browser-local saves + validated JSON import/export | [VERIFIED] | `localStorage` under `algoviz.experiments.v1`; size/version/algorithm/shape/`parseInput` gates |
| 12 | 150 algorithm-input cases for correctness and reproducibility | [VERIFIED] | `tests/engine.test.js` 12–36: 6 × 25 |
| 13 | 768 sliding-window cases against brute force | [VERIFIED] | same file, 82–101: 64 × 12 |
| 14 | Tests, lint and build automated through GitHub Actions | [VERIFIED] | `.github/workflows/ci.yml`, four steps |

:::must The opening line that sets the tone
"Before we go into any of it — everything in that bullet is traceable to a file, and I'm happy to open any of them. There's also one thing in the bullet I'd phrase more carefully than I did, which is the operation-count claim: it's comparisons that are recorded and comparable, and the pass and exchange counters are implementation-specific. The UI says that on screen."
:::

That opening does three things: it asserts verifiability, it demonstrates that you have audited your own claim, and it hands the interviewer a correction — which is the single most credible thing a candidate can do.

---

## 57.1 Claim 1–3 — "Engineered recorded-frame playback for 6 sorting algorithms using React reducers"

:::resume Claim: Engineered recorded-frame playback for 6 sorting algorithms using React reducers

**What it means.** You designed an execution model in which an algorithm runs to completion and emits a complete, immutable history, and you built a transport layer over that history with a reducer.

**Where it exists.**
- The six registrations and their metadata: `src/lab/engine.js` lines 8–62
- The six generators: `src/modules/core/algorithm/sorting/algorithms/{bubble,selection,insertion,merge,quick,heap}Sort.js`
- The reducer: `src/lab/engine.js` lines 80–105
- Its single consumer: `src/lab/SortingLab.jsx` line 98
- The frame-consuming render: `ArrayView`, `SortingLab.jsx` lines 22–48

**How you prove it.** Open `engine.js`, show the sixth entry of the registry, then show `playbackReducer`, then show `const frame = frames[cursor]` and say: *"that's the whole playback path — one array index."* Then show the test group named after each algorithm, which loops over the registry and asserts four properties over 25 inputs each.

**Likely question.** *"Why record frames rather than animate as you go?"*

**Follow-up.** *"What's the cost of that decision?"*

**Trap question.** *"So where's the animation library?"* — there isn't one, and that is the point: *"No animation library. The bars are positioned by inline height percentages and the state changes by re-rendering a different array element. There's no interpolation because the design is step-wise — you're looking at discrete recorded states, not a tween."*

**The perfect answer.**
"I split the problem into two halves that don't know about each other. The engine — the six generators — runs the algorithm synchronously and returns a complete array of frames. A frame is a full snapshot plus the metadata that explains it: the array cloned, the indices being compared, the indices already final, the pivot or sub-array range where the algorithm has those concepts, a machine-readable line tag, a sentence for the user, and a snapshot of the counters at that instant. The second half is playback: a `useReducer` holding `{cursor, length, playing}` with four actions — `load`, `toggle`, `tick`, `seek`. It knows nothing about sorting; it's three numbers and a boolean. So rewinding is selecting an earlier frame, not running JavaScript backwards, and the render is a pure function of one integer. The reducer is exported as a plain function, which is why I can unit-test the transport without rendering anything."

**Why this phrasing works.** It states the architecture in one breath, gives the frame schema, names the four actions, and ends on the testability consequence — which is the part that shows you understood *why* the split matters, not just *that* you made it.
:::

---

## 57.2 Claims 4–7 — "enabling pause/resume, single-step navigation, speed control, and timeline seeking"

:::resume Claim: pause/resume, single-step navigation, speed control, timeline seeking

**What it means.** Four transport features which, in this architecture, are four arguments to one action and one effect.

**Where it exists.**

| Feature | Where | How |
| --- | --- | --- |
| Pause / resume | `engine.js` 84–89 | `toggle` flips `playing`; resets the cursor to 0 when it is on the last frame (so the same action is Replay) |
| Step | `SortingLab.jsx` 378–408 | `seek(cursor - 1)` and `seek(cursor + 1)`, with disabled states at the ends, plus `seek(0)` for restart |
| Speed | `SortingLab.jsx` 410–421 | A select whose value is the delay in ms; it is a dependency of the timer effect |
| Seeking | `SortingLab.jsx` 356–367 | A range input bound to the derived cursor, dispatching `seek` on change |

**How you prove it.** Click through them live — but the stronger proof is structural: *"All four are the same action. There's no `next`, no `previous`, no `restart` — the reducer has four actions total and navigation is entirely expressed through `seek`. That's why the transport has no duplicated boundary logic: the clamp lives in one place."*

**Likely question.** *"How does Pause actually work? Does the timer stop?"*

**Follow-up.** *"How do you prevent duplicate timers?"*

**Trap question.** *"You said pause/resume — resume from where, exactly?"* The precise answer: *"From the exact frame you paused on. `toggle` leaves the cursor alone unless it's on the last frame. So pause at frame 42, resume at frame 42. The one exception is at the last frame, where the same action restarts from 0 — that's what turns the Play button into Replay."*

**The perfect answer.**
"Pause is a state change and a cleanup, not a message to the timer. `toggle` sets `playing` to false, React re-runs the effect, and the effect's cleanup calls `clearTimeout` on the single pending timer — so while paused there are zero live timers, not one that's pretending to be off. On resume, the effect sees `playing` true and schedules exactly one timeout for the current speed. There's no interval anywhere, which is deliberate: an interval would capture its delay at creation, so changing the speed couldn't take effect until the next frame, and after a main-thread block it would fire several queued callbacks in a burst and the animation would jump. A self-scheduling timeout chain always measures from the last frame that actually rendered."
:::

---

## 57.3 Claim 8–9 — "same-input algorithm comparison with percentage-aligned replay"

:::resume Claim: same-input comparison with percentage-aligned replay

**What it means.** Two algorithms run over the identical dataset, and their playbacks are positioned proportionally rather than by index.

**Where it exists.** `SortingLab.jsx` lines 74–76 (`compare`, `other`), 94–97 (`otherFrames`), 201–203 (`compareCursor`), 486–543 (the panel).

**How you prove it.** Open the app, enable Compare, select two algorithms. Then open the code and point at the identical `input` reference in both memo calls, plus the two on-screen disclaimers.

**Likely question.** *"What does percentage-aligned replay mean?"*

**Follow-up.** *"So at 50% both have done half the work?"* — no.

**Trap question.** *"This proves which algorithm is faster, right?"* — the whole feature exists to *not* claim that.

**The perfect answer.**
"Both traces come from the same `input` array — the same reference, not a copy — which is safe because the generators don't mutate their input, and that's asserted for all six in the test suite. Alignment is proportional: `round(cursor / (frames.length - 1) * (otherFrames.length - 1))`. On the default eight-element input the traces are 65 frames for selection and 118 for bubble, so an index-based alignment would run out of secondary frames for two-thirds of the playback; proportional mapping keeps both views near their start and near their end at the same time.

What it does not mean is that both algorithms have done equivalent work at the same percentage. At 50% of a bubble trace you're past roughly half of 28 comparisons; at 50% of a merge trace you're past half of 16. The percentages are positions in two different recordings. That's why the UI caption says 'aligned by percentage of trace—not equivalent operations', and why the numbers I actually show are recorded comparison counts, with the panel text saying there are no wall-clock claims because animation speed isn't algorithm performance."
:::

---

## 57.4 Claim 10 — "recorded operation counts"

:::resume Claim: recorded operation counts

**What it means.** Every frame carries the counters as they stood at that moment. Three counters exist: comparisons, passes/calls, and exchanges.

**Where it exists.** `currentStats` in all six generators; displayed in the State Inspector (`SortingLab.jsx` 435–448) and used by the comparison panel (515–521); defined by the footnote at 587–592.

**How you prove it.** Step forward one frame and read the "Comparisons" tile — it changes because `currentStats` is cloned per frame with `{...stats}`. Then show the footnote.

**Likely question.** *"What exactly is counted?"*

**Follow-up.** *"Are those counts equivalent to runtime?"*

**Trap question.** *"So merge sort beats selection sort — fewer comparisons?"* On the default input merge does 16 comparisons against selection's 28, and merge does **more** writes (24 vs 6). The correct answer: *"The counters tell you how many decisions each algorithm made, not how long it took. Merge does fewer comparisons and more data movement here, so the counters don't answer 'which is faster' — and at any realistic n, n log n versus n² swamps both numbers."*

**The perfect answer.**
"Three counters per frame, cloned at generation time. Comparisons is the one I treat as comparable across algorithms, because every generator increments it exactly at a value comparison. Passes is labelled 'Passes / calls' on screen because a pass means an outer-loop iteration in bubble sort, a recursion node in merge sort and an extraction in heap sort — three different units. Exchanges is labelled 'recorded exchanges' because legacy generators count them differently: merge sort increments on every write out of its buffer, so its exchange count is really a write count, while bubble sort's is a real swap count. There's a footnote on the page saying exactly that, and it's the reason the comparison panel deliberately uses comparisons only. None of them is a runtime measurement — there's no timing code anywhere in the project, and the panel says 'No wall-clock claims.'"
:::

---

## 57.5 Claim 11 — "browser-local experiment saves and validated JSON import/export"

:::resume Claim: browser-local saves and validated JSON import/export

**What it means.** An experiment — algorithm, input, and the frame you were looking at — can be kept in the browser or moved as a file.

**Where it exists.** Save: `SortingLab.jsx` 181–197 and the lazy read at 77–92. Export: 49–58 helper, 233–240 button. Import: 156–180.

**How you prove it.** Save at a specific frame, reload the page, click the saved entry and show that it lands on the same frame. Then export, open the JSON in an editor, hand-edit the input, and re-import.

**Likely question.** *"Where are experiments saved, and what if the stored data is malformed?"*

**Follow-up.** *"What's in the file?"*

**Trap question.** *"So if I open this on my phone, will my experiments be there?"* No — `localStorage` is per-origin per-browser per-device. Export is the only portability path.

**The perfect answer.**
"The record is `{version, algorithm, input, cursor, createdAt}` under the key `algoviz.experiments.v1`, capped at the most recent six. What's deliberately not in it is the trace: I store how to re-run it, not the result, so a record is a few hundred bytes instead of a megabyte. The trade-off is real and it's in the README: a stored cursor is a frame index, so if a future release changes frame ordering, an old cursor could mean a different moment.

Storage is untrusted even though I wrote it, so the read path has four defences: a `|| "[]"` for the missing key, a `try/catch` for malformed JSON, an `Array.isArray` shape check, and a filter that drops any record whose algorithm key no longer exists — which matters because saved data outlives code. Then clicking a record re-validates through the same `parseInput` the form uses. Import is the same discipline with a size gate first: 16 KB maximum, then `version === 1`, then `Object.hasOwn(algorithms, ...)` so a crafted `algorithm` can't reach the prototype chain, then `Array.isArray(input)`, then the values go back through `parseInput` by joining them into a string. So there's exactly one definition of a valid dataset in the codebase."
:::

---

## 57.6 Claims 12–14 — the verification bundle

:::resume Claim: verified correctness and trace reproducibility across 150 algorithm-input cases; 768 sliding-window cases against brute force; CI over tests, lint and build

**What it means.** Three separate verification mechanisms: property assertions over generated inputs, exhaustive bounded differential testing, and automated gates on every push.

**Where it exists.** `tests/engine.test.js` (all of it), `.github/workflows/ci.yml`, and the `test` script in `package.json`.

**How you prove it.** Run `npm test` and show 14 passing groups; open the test file and point at the loop that produces the 150 and the inner loop that produces the 768; show the workflow file.

**Likely question.** *"Walk me through the 150."*

**Follow-up.** *"What's the runner?"* — Node's built-in `node:test` with `node:assert/strict`, no test dependency at all.

**Trap question.** *"So 150 cases means your sort is correct?"* The nuanced answer in Chapter 44.

**The perfect answer.**
"Two different strategies, chosen per problem. For sorting, 150 is six algorithms times twenty-five inputs: five hand-picked edge cases — empty, single element, duplicates, negatives and zero, reverse-sorted — plus twenty seeded random datasets of ten values. Because the seed is deterministic, all six algorithms see the same twenty-five arrays. Each of the 150 asserts four things: the final frame is correctly sorted, the input array wasn't mutated, a second run produces a deep-equal trace including every message string and counter, and the final frame's element ids are unique. That third assertion is the one that matters most here — it's what makes the recording a testable artefact rather than just the output.

For the sliding window I could be exhaustive instead of sampled, because the domain is small: all 64 arrays of length three with values one to four, crossed with targets one to twelve, is 768 cases — and each one is checked against a brute-force reference written in the test file itself, so it shares no code with the implementation. The interesting part is *why* brute force: an oracle has to be independent in mechanism. If my oracle used the same sliding logic, a bug in the window arithmetic would infect both sides and the test would pass while both were wrong.

I'd be careful about what that proves. 768 cases establishes agreement with an independent implementation inside a bounded box — length exactly three, values one to four — and it says nothing about length four or about the negative values the technique can't handle at all. And the sorting tests have a known weakness: they check id uniqueness only on the final frame, which is why a duplicate-key bug in merge sort's buffer frames passes CI. The fix is two lines — assert uniqueness on every frame."
:::

---

## 57.7 The three sentences that must never leave your mouth

:::danger Language that loses the interview
1. **"It's a full-stack MERN app."** There is no backend. Checked: zero backend dependencies, no server code, and the only `fetch` in the repository is inside a component that no file imports, so it never runs.
2. **"The comparison shows which algorithm is faster."** It shows recorded comparison counts on the same input with explicit on-screen disclaimers that it makes no wall-clock claims. Claiming more than the code measures is the fastest way to lose credibility with a senior engineer.
3. **"I wrote every line."** [NOT VERIFIED] The repository cannot establish authorship — there is a single commit in the available history and no co-author metadata. Do not claim sole authorship and do not deny it; describe what you did and, if asked, be straightforward: *"The history in this checkout is a single squashed commit, so you can't get authorship from Git here. What I can do is explain any part of it — including the parts I'd change."* That answer is honest, stays within the evidence, and immediately pivots to something you can prove.

**The safe substitute for #3, if you want a strong closed statement:** *"I can defend every design decision in it, and I can point at the things I'd do differently. Ask me about the weakest part and I'll tell you before you find it."*
:::

:::check Red-line drills for Part XXXI
- [ ] Enumerate all fourteen claims from memory.
- [ ] Recite the "everything is traceable to a file" opener plus the self-correction.
- [ ] Give the pause/resume answer including the last-frame exception.
- [ ] Give the percentage-alignment answer including the four disclosures.
- [ ] Give the counting answer including the merge-writes-versus-swaps distinction.
- [ ] Give the 150/768 answer with both coverage weaknesses.
- [ ] Say what you must not claim about MERN, speed and authorship.
:::
