%PART: Ten mock interviews, first half | PART XXXVII · 1–5 | Five interviewer personalities, five full question sets, and the answers placed after the questions — never immediately.

# 63 · Mock interviews 1–5

> **How to use this chapter.** Do not read a question and then its answer. Read the whole question list for one interview, answer all of them out loud (record yourself), and only then read the answer block. The delay is the entire point: real interviews don't give you the answer after each question.

---

## Interview 1 · Dr. Arundhati Rao — the algorithms professor

:::mock Interviewer 1 · Dr. Arundhati Rao · Professor of Algorithms
**Style.** Slow, precise, unimpressed by frameworks. She will interrupt a hand-wave with "define that". She cares about invariants, preconditions, and whether you know the difference between a proof and a test.

**What she is testing.** Whether you can reason about correctness rather than describe implementations.

**Ground rules.** Every claim must be stated in terms of inputs, invariants and outputs. Nothing is "just faster".
:::

### Questions

1. Define the problem your sorting engine solves, precisely.
2. State the loop invariant of your bubble sort.
3. Your bubble sort has no early exit. What is the resulting complexity, and is that a defect?
4. Selection sort's comparison count — prove the count is input-independent.
5. Prove insertion sort's worst case.
6. Which of your six algorithms are stable, and give the exact comparison that decides stability in each.
7. Merge sort: what is its recurrence, and what is the space cost of your implementation specifically — not the textbook one?
8. Quicksort: when exactly is your implementation quadratic? Show the input.
9. Is your partition correct? Convince me, not by testing.
10. Heap sort: is the build phase O(n) or O(n log n) in your implementation? Justify.
11. Your sliding window has a precondition. What is it, and what is the mathematical reason?
12. You test 768 cases of length three. Is that a proof of correctness?
13. What is an oracle, and is your brute-force reference a valid one?
14. Define "trace reproducibility" as a property, not a feature.
15. What would it take to prove your sorting correct rather than test it?

---

### Model answers

**1.** The input is an array of 2–24 safe integers; the output is a complete, ordered sequence of snapshots such that the first frame's values equal the input, the last frame's values are the input sorted non-decreasing, and every frame is an independent, deeply-equal-on-rerun value. The sort itself is the secondary output — the primary deliverable is the recording.

**2.** Before iteration *i* of the outer loop, the last *i* elements are final and in their sorted positions, and every element before them is ≤ every element after them. Note that this invariant is *not enforced in the code*, because the early-exit flag is absent — so the shrinking inner bound encodes the invariant but the algorithm doesn't verify it.

**3.** Θ(n²) in every case, since the inner loop runs the full n − i − 1 regardless. It is a defect *relative to the best-known bubble sort* and a deliberate property of a teaching visualiser: on a sorted 24-element input it still costs 276 comparisons, and that is precisely the quadratic behaviour the visualiser exists to show. I'd state it as a design choice with a cost, not as an oversight.

**4.** The inner loop executes for *j* from *i+1* to *n−1*, exactly *n − 1 − i* iterations, independent of the values. Summing over *i* from 0 to *n−2* gives Σ(n−1−i) = n(n−1)/2, which contains no reference to the input at all. Measured: 28 for n = 8, 45 for n = 10.

**5.** The worst case is a reverse-sorted input: for each *i*, the inner loop shifts *i* elements, giving Σ*i* = n(n−1)/2 comparisons and the same number of shifts. The *best* case is a sorted input, where the first comparison fails and the loop breaks: n − 1 comparisons. So insertion sort is adaptive where my bubble sort isn't — a visible asymmetry in the traces.

**6.** Bubble and insertion are stable because their comparison is strict (`>`), so an element never moves past an equal one. Merge is stable because the merge comparison is `<=`, taking from the left run on a tie. Selection is unstable because a long-distance swap can move an element past an equal one. Quick is unstable for two reasons: `<=` sends equals left, and the pivot swap is long-distance. Heap is unstable because the swap of root and last element reorders equal keys arbitrarily.

**7.** T(n) = 2T(n/2) + Θ(n), giving Θ(n log n) by the master theorem. My implementation is *in-place with a buffer* rather than allocating per level, so its auxiliary cost is one O(n) buffer reused across the recursion plus O(log n) stack. That is the same asymptotic O(n) but with a much better constant than allocating a new array per merge.

**8.** Any input where every partition chooses the maximum remaining element as the pivot — which is exactly what a **last-element pivot on already-sorted input** does. Each partition places the pivot at the end of its range, so the recursion has one subproblem of size n−1: T(n) = T(n−1) + Θ(n) = Θ(n²). The app ships that behaviour and the user can trigger it with the "sorted" preset.

**9.** The invariant is that at the start of each iteration, elements in `[low, i]` are ≤ the pivot value and elements in `(i, j)` are > it, where both intervals grow monotonically. Each iteration either does nothing, preserving the invariant because `arr[j] > pivot`, or swaps `arr[i+1]` with `arr[j]`, restoring it by moving a small element into the small region and a large element out. Termination: `j` goes from `low` to `high − 1`. At exit, `i + 1` is the boundary, and swapping the pivot into it places every small element to its left and every large one to its right — which is the postcondition.

**10.** O(n) for the build. My `heapify` is recursive, so the *sift cost* for a node at depth *d* is bounded by its height *h*. The sum over all nodes of their heights is at most 2n, because the number of nodes at height *h* is at most ⌈n/2^(h+1)⌉ and Σ h·n/2^h converges. Summing the per-call work gives O(n) for the build and O(n log n) for the extraction phase.

**11.** Positivity: all values must be > 0 and the target > 0. The reason is monotonicity: with positive values, extending the right pointer strictly increases the sum and advancing the left pointer strictly decreases it, so the two-pointer walk is monotone and a `while` loop that exits has *proven* no shorter window ends at the current right pointer. With a negative value both directions lose that property and the walk can terminate early — measured in this codebase: `[-1,3,2]` with target 3 returns 2 where the true answer is 1.

**12.** No. It is an exhaustive check of a bounded domain: 64 arrays of length exactly three over values 1–4, crossed with 12 targets, compared against an independent oracle. It establishes agreement inside that box. It says nothing about length four, about larger value ranges, or about negative values — where the algorithm is known to be wrong.

**13.** An oracle is an independent mechanism that produces the correct answer for a case, so agreement between implementation and oracle is evidence of correctness. Mine is a brute-force triple-nested enumeration written inline in the test file, so it shares no code with the two-pointer implementation. It's a valid oracle *for the specification as I stated it* — it uses the same `sum >= target` predicate, which means it cannot catch a misreading of the problem statement, only a bug in the mechanism.

**14.** For a pure function *f*, reproducibility means: for any input *x*, `f(x)` deep-equals `f(x)` on every invocation and across processes. In this codebase it also means across algorithms and dataset generation, because the seeded LCG must produce identical arrays from identical seeds — and it is a *product* property, not just a test property, because saved experiments store a frame index.

**15.** Either a machine-checked proof — a refinement proof in a proof assistant connecting the implementation to a sortedness specification — or a proof-carrying approach: instrument the algorithm to emit a certificate (a permutation and the comparison log) that a small verified checker can validate. Practically: the certificate approach is the engineering answer, because the checker is small enough to review, and it also gives you the trace you need for the visualiser.

---

## Interview 2 · Kevin Osei — the senior frontend engineer

:::mock Interviewer 2 · Kevin Osei · Senior Frontend Engineer
**Style.** Fast, concrete, React-fluent. He asks "why" twice per answer and will ask you to write code on a shared editor. He dislikes abstractions that don't pay for themselves.

**What he is testing.** Whether you actually understand React's execution model or have memorised patterns.

**Ground rules.** Cite the effect's dependency array, the render's inputs, and the reconciliation behaviour. No hand-waving about "performance".
:::

### Questions

1. Walk me through one frame of playback, from the timer firing to pixels.
2. Why is `cursor` in the timer effect's dependency array? What breaks without it?
3. Where do the frames live — state, memo, ref? Why?
4. Which component reads the array, and what is its `key`?
5. What is the key's bug, and what are the two fixes?
6. Why `useReducer` here and not `useState` with three setters?
7. Show me how you'd add a "step backward 5" control.
8. If I put `React.memo` on `ArrayView`, what happens?
9. Your keyboard listener is registered on `window`. What are the three bugs this invites?
10. What happens if the user presses Play, then immediately changes the algorithm?
11. Is there any state that could be derived instead of stored? Name them all.
12. How would you test the timer without a browser?
13. What's the accessibility problem with a bar chart of divs?
14. You have no error boundary. Where would you add one and why there?
15. What's the single biggest structural refactor you'd do to `SortingLab.jsx`?

---

### Model answers

**1.** `setTimeout(speed)` fires → the effect body dispatches `{type:'tick'}` → the reducer returns a new state with `cursor + 1`, or clamped at the end with `playing: false` → React re-renders `SortingLab` → the derived `cursor` clamps the reducer value against `frames.length − 1` → `frame = frames[cursor]` → `ArrayView` maps over `frame.array`, computing a class string and an inline height per element → React's reconciler diffs the ~24 elements, changing class attributes on at most two of them and the height on all of them → the browser recalculates styles and paints. Then the effect re-runs, because `cursor` changed, and schedules the next timeout — unless `playing` is false.

**2.** It's the re-scheduling trigger. The effect's *purpose* is "schedule one timeout, and when that timeout fires, re-run me so I can schedule the next one". `tick` changes the cursor, and a changed dependency is what causes React to re-run the effect. Remove it and the sequence is: one timeout scheduled, one tick, one frame advance — and then the effect never re-runs, so playback advances exactly one frame and stops. It's the clearest demonstration of why the dependency array isn't bookkeeping.

**3.** A memo — `useMemo` on `[input, algo]`. Not state, because the frame array is a pure function of the input and the algorithm key: storing it would require an effect to keep it in sync, and every sync point is a chance to disagree. Not a ref, because it participates in the render and must invalidate the render when it changes. The memo gives invalidation from the dependency array and recomputation once per input change, with no synchronisation code at all.

**4.** `ArrayView`, a local function component in `SortingLab.jsx`, rendering one column per array element with `key={item.id}` — the element's identity, `block-<original index>`, which travels with the element through swaps.

**5.** In merge sort's buffer write-back the clone keeps its id, so the same id appears twice in frames near the merge — 23 of 107 on the default input, 141 of 375 on the reverse-24 input. React logs a duplicate-key warning and reconciliation with duplicates is unspecified. Fix one, minimal: `key={item.id + ':' + i}`, which is safe *because every frame is a complete snapshot*, so a positional key can't carry state across frames — the cost is that bars become position-identified, which would matter if I added movement animation. Fix two: re-id the clone at write time, preserving identity semantics at the cost of changing what an id means for merge sort.

**6.** Because the three fields have cross-field rules. `tick` must set the cursor *and* clear `playing` when it lands on the last frame; `toggle` must reset the cursor to 0 *when it's at the end*; `seek` must clamp *and* pause. With three `useState`s those rules become three interdependent setters and each transition is a set of calls that can partially apply. With a reducer, each transition is one line, it's a pure exported function, and I can test every edge case in Node without rendering. Also the reducer's identity-preserving `default` gives React a bail-out for free.

**7.** No new reducer case is needed: `dispatch({type:'seek', cursor: cursor - 5})` — the reducer's clamp handles the boundaries. I'd add a button with `disabled={cursor === 0}` and reuse the existing styling. That's the payoff of expressing navigation as `seek` rather than as `step`, `back`, `forward` and `restart` actions.

**8.** Nothing happens, functionally — and nothing is gained. Its only prop is the current frame object, which is a different object on every cursor change, so the shallow prop comparison never short-circuits and you pay one extra comparison per render. `React.memo` pays off when props are stable across parent renders; here the prop *is* the thing that changed. The version that would help is memoising individual bar rows keyed by element id, because only two rows change class per frame — but that's a measurable optimization to make after profiling, not before.

**9.** *(a)* Stale closure — if `cursor` isn't in the dependency array, the handler keeps seeking the cursor value it captured at registration, so the arrows appear to work once and then do nothing. *(b)* Accumulation — if the effect returns no cleanup, every re-registration adds another live listener, so one press advances 2, then 3, then 4 frames. *(c)* Hijacking — a global `keydown` listener sees keystrokes aimed at form controls, so Space must be ignored when the target is an input, and modifier combinations must be ignored so `Ctrl+←` and `Cmd+←` still belong to the browser.

**10.** The input change commits a new array (a new reference), so the frames memo recomputes; `load()` dispatches `load`, which resets the cursor to 0 and sets `playing` false. So the animation stops and starts at the beginning of the new trace. That's deliberate: the alternative — continuing to play into a different recording — would make the frame index meaningless. And because `setInput` and `dispatch` are batched in the same event, there's no intermediate render where the cursor points past the end of the new trace.

**11.** Three. `meta` is `algorithms[algo]`, and `last` is `frames.at(-1).currentStats`. The interesting one is the *render-time cursor*: `playback.cursor` is genuine state, but it's clamped against `frames.length − 1` on every render, which is why the displayed position and the reducer's position can differ for one frame. Everything else in the component is either genuine input state or a memo.

**12.** Extract the timer into a small custom hook — `usePlaybackTimer(playing, cursor, speed, dispatch)` — so the wiring exists as a named, testable unit. Then with fake timers and a DOM you assert four things: play advances one frame per interval; pause leaves zero pending timers, not one; unmount cancels the pending timer; changing speed while playing reschedules with the new delay. Today none of that is tested, because the suite is `node:test` over pure modules and no component is ever rendered.

**13.** A bar chart built from divs conveys everything visually and nothing programmatically. Specifically: the bars have no `aria-label`, so a screen reader announces a list of unlabelled boxes; there's no live region, so the fact that the visualisation changed is never announced; the range input has no label; and the keyboard shortcuts are undiscoverable. The parts that *are* right by construction: every control is a real `<button>` or `<input>`, focus order follows the DOM, and the active bars are distinguished by more than colour — there's a glyph as well as a background change, which covers the common colour-only failure.

**14.** Inside each lazy route, wrapping the lazy component. That placement means a module that throws shows an error in the content area while the shell, the header and the navigation survive, and the error is scoped to the thing that failed. If I put one boundary at the root I'd get a full-page error for a bug in one panel, which is strictly worse than a partial failure.

**15.** Move the persistence out. Between the `localStorage` read, the filter, the save path, the export helper and the import gates, there's a coherent module — call it `experiments.js` — that owns the schema, the version constant and all the validation, with no React in it. That would cut the component substantially, make the nine import cases unit-testable in the existing runner, and give the schema one home instead of two.

---

## Interview 3 · Marisol Vega — the staff engineer

:::mock Interviewer 3 · Marisol Vega · Staff Engineer
**Style.** Conversational and strategic. She asks about boundaries, ownership and the next six months. She is less interested in syntax than in whether you know what you own and what you'd refuse to own.

**What she is testing.** Judgement, scope control, and whether you can talk about a system over time rather than at a moment.

**Ground rules.** Every answer should name what's in scope, what's out, and what it costs.
:::

### Questions

1. Draw the system boundary for me in one sentence.
2. What is this application *not*?
3. Name the three external dependencies of the app at runtime.
4. If you had six more months, what are the first three things you'd build, in order?
5. What would you explicitly refuse to build, and why?
6. Where does the app's data live, and what is the migration story for that data?
7. Your frame model doesn't scale. At what n does it fail, and what's the structural fix?
8. If a teammate joined tomorrow, what would you have them do first, and what would you not let them touch?
9. What's the most expensive thing in the codebase to change, and why?
10. What single decision would you reverse if you could?
11. How would you introduce a backend, if you had to? What changes first?
12. Where is the project's biggest maintenance risk?
13. What would make you delete this project and start over?
14. How do you decide when a feature is done?
15. What does "production-ready" mean for something with no users?

---

### Model answers

**1.** A single static client-side application: a pure engine (parsers, generators, a reducer) plus a React presentation layer, with no server, whose only persistence is the browser's own `localStorage`, and whose only compatibility contract is the JSON file format at version 1.

**2.** It is not a benchmark — there's no timing anywhere. It is not a backend application — no server, no database, no accounts, no network calls in the shipped code. It is not a proof of correctness — the tests establish behaviour over bounded inputs. And it is not a library — the generators are not published, versioned or documented as an API for anyone else.

**3.** React (with `react-dom`), `react-router-dom`, and the browser platform — `localStorage`, `File`, `Blob`, `setTimeout`. `lucide-react` is a fourth if you count an icon set, and the build toolchain is a build-time dependency rather than a runtime one.

**4.** First, delta frames with keyframes, because the frame model is the constraint that caps input size and therefore the tool's usefulness — that's an architectural change, so it goes first. Second, component tests for the timer and the playback wiring, because that's the largest untested behaviour a user would actually notice. Third, the visualisation of merge sort's buffer, because the generator already emits `yOffset` and `buffer` frames and the renderer ignores them, so it's the cheapest user-visible improvement in the project.

**5.** A backend. As soon as there's an account model there's authentication, session management, authorisation, a data-retention policy, a privacy surface and an operational burden — for an app whose entire value proposition is that your experiments are yours, offline, on your machine. I'd refuse multi-user collaboration for the same reason, and I'd refuse a "shareable link" feature unless the state encoded in the URL was designed for it from the start.

**6.** A single `localStorage` key, `algoviz.experiments.v1`, holding an array of at most six records with an explicit `version: 1` field. The migration story today is: unknown versions are rejected on import and unknown algorithms are filtered on read. That's not a migration story, it's a defensive read — the *real* one requires a per-version upgrade function and a decision about whether to rewrite records in place or read them lazily. The version field is the hook I left myself.

**7.** It fails when frames × n becomes large — at n = 200 with quadratic instrumentation the frame count is roughly 80,000 and each frame clones the whole array, so hundreds of megabytes and a frozen tab. The structural fix is to stop recording state and start recording transitions: store the operations and a keyframe every *k* frames, then reconstruct any frame by replaying from the nearest keyframe. Memory becomes O(operations + keyframes × n) instead of O(frames × n), and the trade is reconstruction cost on seek.

**8.** I'd have them start by reading `engine.js` and writing new test assertions against it — specifically the per-frame id-uniqueness assertion and a property test for the reducer. It's real work with an immediate payoff, it forces them to understand the frame contract, and the test runner has zero setup. What I wouldn't let them touch in the first week is the reducer's boundary semantics or `SortingLab.jsx`, because those are the two places where a plausible-looking change breaks an invariant that isn't asserted anywhere.

**9.** The reducer's boundary semantics, because two separate screens depend on them and neither has a test. Changing `seek` to not pause, or `toggle` to not reset at the end, looks like a one-line improvement and silently changes the behaviour of four controls. After that, the frame schema — adding a field is easy, but every generator has to emit it consistently and the reproducibility assertion compares the whole frame, so a field missing from one generator is a test failure that reads like an unrelated diff.

**10.** The instrumentation density. I recorded a frame at every interesting point, which produced the deepest possible trace and then forced a 24-element cap to keep memory sane. If I'd decided the frame budget first — how many frames per element, and what the user is meant to notice — the cap could be much higher and the tool would work on inputs people actually have.

**11.** The record schema. Everything else can stay: the engine is pure, the reducer is pure, the UI doesn't know where data comes from. What has to change is that the storage read and write become asynchronous, which means the saved list gains a loading and an error state, and the "save" button becomes a request. Then the version field becomes a real migration concern, and authorisation appears. So: schema and the read/write interface first, then the privacy and identity questions, and none of the algorithm or playback code touches any of it.

**12.** Documentation drift, and it's already happened: the README describes the app accurately except for the merge duplicate-key bug, which I found after writing it. The structural mitigation is to keep the things that can drift closest to the code — the ESLint config already explains its own exception in a comment, and the schema constant should live next to the gates that use it. Prose in a separate file will always drift.

**13.** If the goal changed from "an instrument for understanding algorithms" to "a fast way to sort things", the entire recording layer becomes dead weight — the frames exist to be inspected, not to produce a result. That would be a different product, and I'd start over rather than strip this one, because the value of this codebase is precisely the parts that make it slow.

**14.** When the behaviour is asserted at the lowest layer that can express it, and the assertion would fail if the feature were reverted. Not when the UI looks right — the merge duplicate-key bug looked right on screen and was wrong in the frames. Practically, for anything touching the engine: a test in the existing runner, and a decision recorded about what the feature deliberately does *not* do, because a feature with undisclosed limits is a future bug report.

**15.** For this project it means four things: the build is reproducible from a clean checkout; the gates (tests, lint, build) pass in a clean environment; the failure modes are known and documented rather than surprising; and the data format has a version. It does *not* mean high availability, monitoring, on-call or a rollback plan — there's nothing to run and no users to page. Saying which half of the phrase applies is the actual answer.

---

## Interview 4 · Tim Brennan — the skeptical hiring manager

:::mock Interviewer 4 · Tim Brennan · Engineering Manager
**Style.** Blunt, resume-first. He opens by reading your bullet out loud and asking you to defend it line by line. He is not hostile, but he is not convinced by enthusiasm either.

**What he is testing.** Ownership, honesty about scope, and whether you can state what you did without inflation.

**Ground rules.** Every claim needs a location, a measurement, or an admission.
:::

### Questions

1. Read your bullet. Which part is the weakest claim?
2. You say "validated JSON import". Prove it's validated.
3. What percentage of this did you write?
4. How long did it take, and what took the longest?
5. What did you get wrong the first time?
6. Did anyone review this code?
7. Why React? Justify the choice rather than describing it.
8. Why not Next.js?
9. Why not plain JavaScript modules with no framework?
10. What's the hardest bug you fixed, and how did you find it?
11. What part of this project would you not defend in a code review?
12. Tell me about a decision you reversed.
13. How do you know the app works if you don't have users?
14. What would you do differently if a teammate had to maintain this?
15. Why should I believe any of this over the next candidate who claims the same thing?

---

### Model answers

**1.** "Verified correctness and reproducibility across 150 algorithm-input cases." The number is exact and the mechanism is real, but "verified correctness" is doing too much work — 150 cases over a bounded input space establish behaviour, not correctness, and there's a known gap in those assertions, which is that id uniqueness is only checked on the final frame. I'd rewrite the bullet as "150 algorithm-input cases asserting sortedness, input preservation, trace reproducibility and final-frame integrity" — a longer bullet and a more accurate one.

**2.** Four gates in the import path: a 16,384-byte size limit before parsing, `JSON.parse` inside a try/catch, `version === 1`, then `Object.hasOwn(algorithms, data.algorithm)` — deliberately not `in`, because `in` walks the prototype chain and `'constructor' in algorithms` is `true`. Input is checked with `Array.isArray`, and then the values are joined into a string and pushed through the *same* `parseInput` the form uses, so there's one definition of a valid dataset in the codebase. What it does not do: reject extra fields, or bound nesting depth.

**3.** I can't prove authorship from this checkout — the history is a single squashed commit with no co-author metadata, so Git gives you nothing. What I'll say is that I can defend every design decision in it and name the ones I'd change, and you can test that claim by asking about any part of it. That's a weaker claim than "I wrote all of it" and it's the one I can actually support.

**4.** The work split roughly three ways: the engine and the six generators; the playback layer and the lab's UI; and the verification and documentation. By far the longest single item was calibration — deciding what a frame should contain. Every field I added to a frame was a decision about what the UI could explain, and the frame schema was rewritten more than once. The second longest was the documentation, because writing the non-claims honestly took longer than writing the claims.

**5.** Three things. I built the comparison with index-based alignment first, which broke immediately — selection's trace is 65 frames and bubble's is 118 on the default input, so the secondary panel ran out of frames two-thirds through. I assumed merge sort's duplicate ids were harmless because they never reach the final frame; they're in 23 of 107 frames. And I initially reported the merge exchange counter as swaps; it's a buffer-write count, which is why the footnote exists.

**6.** No. There's one commit and no review metadata. In practice the review I got came from re-reading the README's own non-claims against the code — which is how I found that the README over-described the "correctness" of the test suite before I softened it.

**7.** Because the state model is the feature. The UI is a pure function of one integer — the cursor — plus a frame array, and the two things I needed most were fine-grained control over what re-renders when that integer changes, and the ability to test the transport as a plain function. React gives me both: a memoised derivation with an explicit dependency array, and a reducer I can call from Node. A framework that re-runs a render function server-side would add a runtime I don't use.

**8.** Next.js exists for server rendering, routing conventions, data fetching and image optimisation. This app has no server, no fetching and no SEO requirement — it's a local instrument behind a client route. Next.js would add a build toolchain, a server runtime and a mental model I'd never exercise. The honest answer is that it would be strictly more machinery for zero benefit, and the one thing I'd take from that ecosystem — file-based routing — I don't need for seventeen flat routes.

**9.** I'd have to write the routing, the component lifecycle, the reconciliation and the memoisation. Those are the parts I want to be *correct* rather than mine, and the frame/derive/effect model is what makes the playback code as small as it is. The counter-argument is bundle size: React and React DOM dominate a 251 KB build for an app with maybe 600 lines of my own UI logic. That's a real cost and I'd accept it because the alternative is hand-written DOM diffing in the exact place where a diffing bug would look like an algorithm bug.

**10.** The one I'd call the hardest wasn't a crash — it was the merge-sort mid-frame state. The rendered array was momentarily not a permutation of the input: frame 15 of `[3,1,2]` renders `[1,1,2]`, and the `3` was in `tempArr`, which no frame exposes. There was no error and no failing test; the only way to find it was to compare a frame's values against the input's as multisets and notice they disagreed. That's what led to finding the duplicate ids, because the same clone semantics cause both. I found it by writing a script that imports the generator directly and prints every frame's id list, which is also how I measured the 23-of-107 number.

**11.** The duplication of `length`. It's in the reducer's state and it's derivable from `frames.length`, so a code path that swaps the trace without dispatching `load` leaves a stale bound — and the only thing preventing a visible bug is a clamp in the render. In review I'd be told, correctly, to remove one of them rather than guard the mismatch. I'd also flag `SortingLab.jsx` at 596 lines as a file that's too big to review comfortably.

**12.** The comparison alignment, from index-based to proportional. That was forced — the first version visibly broke. The more interesting reversal is the counter display: I originally showed a single combined "operations" number, and had to split it into comparisons, passes/calls and exchanges once I realised the three aren't comparable across algorithms. Adding the footnote was admitting that the panel needed to say less than it appeared to.

**13.** Three ways. The engine's contract is asserted in Node — sortedness, input preservation, deep-equal reproducibility over 150 cases. The build runs from a clean checkout and CI enforces the gates on every push. And the behaviour I *can't* verify, I state: rendering, timing, layout and browser behaviour are tested by me opening the app, not by any automation, and I'd say that in an interview before someone else discovered it.

**14.** I'd add three things: a `known issues` section, because the duplicate-key bug currently lives only in my head and in a chapter of the handbook I wrote; a twenty-minute guide to reviewing the codebase, because the route in — `package.json` → `README` → `main.jsx` → `Home.jsx` → `engine.js` → `SortingLab.jsx` → tests — took me months to see as a path; and I'd split the persistence code out of the lab component so the schema has one home.

**15.** You shouldn't, on the claims alone — you should ask any of us to open the file. I'll offer three specific, checkable things: the merge duplicate-key bug with its measured frame counts, the two-line test change that would have caught it, and the fact that the reducer accepts a non-integer cursor, which means the invariant I'd state in a design doc is false. Those are the kinds of things you only know about code you've actually worked on.

---

## Interview 5 · Priya Nair — the QA lead

:::mock Interviewer 5 · Priya Nair · QA & Test Engineering Lead
**Style.** Methodical and slightly adversarial about evidence. She will ask what a test would have caught, and she treats an untested claim as an unverified one.

**What she is testing.** Test strategy — not tooling, judgement: what to test, at which layer, and what you accept as unverified.

**Ground rules.** Name the failure mode, the layer that should catch it, and the cost of the test.
:::

### Questions

1. Describe your test pyramid, honestly.
2. You have 14 groups. Which three carry the most weight?
3. What's the difference between a test that's slow and a test that's useless?
4. Your reproducibility test compares whole frames. What's the failure mode it *can't* catch?
5. How do you test something non-deterministic? Or do you not allow it?
**6.** What's a flaky test, and would any of yours ever be flaky?
7. You have 768 differential cases. What's the boundary of that coverage, in one sentence?
8. If I deleted your entire test suite, which bug would ship first?
9. What would you add with one more day? With one more week?
10. How do you test a bug fix?
11. Is there any code in the project that's untestable as written?
12. Do you use coverage? Why not?
13. What's the most dangerous thing about a passing test suite?
14. Which of your assertions is weakest, and what's the stronger form?
15. When would you *not* write a test?

---

### Model answers

**1.** It's not a pyramid, it's a base and nothing else: a wide base of unit tests over pure modules — generators, the reducer, the parser, the dataset generator, the window function, the counterexample search — and zero component, integration, or end-to-end tests. So the shape is right at the bottom and missing in the middle. The honest description is "a thorough unit base plus a large unverified surface where React and the browser meet".

**2.** The sorting group, because it's 150 cases asserting four independent properties and it's the only thing standing between a generator change and silently wrong frames. The sliding-window differential group, because it's exhaustive within its domain and compared against an independently written oracle. And the playback group, because the reducer is the one place where boundary semantics are load-bearing for four separate controls.

**3.** A slow test is a test whose cost is execution time; you fix it with parallelism, caching or fake clocks. A useless test asserts something that cannot fail, or that fails only when something else already failed. The clearest example is asserting that `run(input)` returns an array — the generator can't return anything else. Useless tests are worse than slow tests because they consume the attention that should go to real ones.

**4.** Two things. First, a *consistently wrong* trace passes: if a generator is deterministic but wrong — merge's `sortedIndices` stays empty for the entire trace — the deep comparison is stable and passes. Second, it can't catch a specification error: if the frame schema itself is wrong, both runs are equally wrong, and equality holds. Reproducibility is a property about *non-determinism*, and it's easy to mistake it for a property about correctness.

**5.** You test the seam, not the randomness. There are two non-deterministic-looking things in this project and both are actually deterministic: the "random" dataset comes from a seeded LCG, and the trace comes from pure functions. So the strategy is to eliminate non-determinism rather than tolerate it — and then *test* that it was eliminated, which is what a deep-equality rerun assertion does. If genuine randomness existed in a generator, I'd inject the source of randomness and assert against a fixed sequence.

**6.** A flaky test passes and fails on the same code, so it destroys the signal from a suite. None of mine should ever flake, because there's no timing, no network, no dates and no shared mutable state between tests, and the random data is seeded. If I ever added a test with a timer, that's where flakiness would enter — fake clocks or nothing.

**7.** It verifies agreement with an independent implementation on all length-three arrays over values 1–4 for targets 1–12, and nothing outside that box.

**8.** The merge duplicate-key bug would be the first *visible* one — a React warning and a potentially mis-reconciled column — but the more interesting answer is that the entire timer and playback wiring could break and nothing would fail, because no test renders a component. Deleted tests would ship a broken Play button before they shipped a wrong sort, because the sorts are what the suite covers.

**9.** With a day: move the id-uniqueness assertion inside the per-frame loop and add a property test asserting the reducer's cursor is always an integer inside `[0, length−1]` — which would fail immediately, since `seek(2.5)` currently stores 2.5. With a week: extract the import gates and the storage read into pure functions in the engine, and write the nine import cases and the five corrupt-storage cases, still in the `node:test` runner with no new dependency.

**10.** Three steps, in order. First an assertion that fails on the old behaviour — if I can't write that, I don't understand the bug. Then the smallest fix at the layer that owns the invariant. Then the regression test at the lowest layer that expresses it, which for the duplicate-key bug is the generator's frames, not the component — because a component test would pass or fail depending on React's internal warning, which isn't a contract.

**11.** The import and export paths, as written, because they're component methods tangled with `File`, `Blob` and `URL.createObjectURL`. The *logic* is pure — gate ordering and schema checks — so the fix is extraction rather than mocking. That's the general rule I'd apply: if something is untestable, it's usually two things, one of which is pure.

**12.** No, and I'd frame it as a deliberate non-claim rather than a missing metric. Line coverage measures execution, not assertion strength, and this codebase is the perfect counter-example: the merge generators have essentially complete line coverage and a real defect in the frames they emit. If I added a number it would be for a different purpose — a diff-coverage gate, to stop a new module arriving with no tests at all.

**13.** That it becomes the evidence instead of the question. A green suite is a reason to stop looking, and the merge bug lived inside a green suite for as long as it did because the assertion people would have written — "ids are unique" — already existed, in a weaker form. The discipline is to keep asking what the suite would *not* catch, which is what a weakness register is for.

**14.** The id assertion, twice over: it checks only the final frame, and even then it's the least interesting frame, because every trace converges to a unique-id final state. The stronger form is per-frame uniqueness for all frames, which is a two-line change and would have caught the merge bug — plus, if I wanted to go further, a multiset check that every frame's values are a permutation of the input, which would catch any future instrumentation that loses an element.

**15.** When the behaviour is deliberately, visibly provisional — an experiment in a spike branch — or when the cost of the test exceeds the cost of the failure, which for a throwaway script is normal. What I wouldn't skip is a test for a *decision*: any place where the code chooses one behaviour over a plausible alternative. Decisions are precisely what regresses silently.
