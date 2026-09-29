%PART: Cross-domain questioning | PART XXXIV | Fifty-four questions that cut across two subjects at once — the format senior interviewers actually use.

# 60 · Fifty-four cross-domain questions

> Single-topic questions can be answered from notes. These cannot: each one requires you to hold two domains at once and decide which one governs. Every answer below is short on purpose — say the mechanism, then the consequence in this codebase.

## 60.1 Algorithms × React rendering

**1. "You clone the array on every frame. Where does that memory actually live, and when does React care about it?"**
The frames are plain objects in a JavaScript array held by a `useMemo` value — ordinary heap memory, not React state and not DOM. React only cares about the small part that reaches the render: one frame object, which `ArrayView` maps into ~24 elements. So the kilobyte-per-frame cost is GC pressure, not render cost; the frames are retained for as long as the memo is, and the memo survives until `input` or `algo` changes.

**2. "Does React re-render when the cursor changes? Does it re-render the algorithm?"**
It re-renders the component, yes — a cursor change is state, so the render runs. It does **not** re-run the algorithm: the frames are memoised on `[input, algo]`. That split is the entire performance story of the app: quadratic work happens once per commit, linear work happens per frame, and per-frame work is a `map` over at most 24 elements.

**3. "You said rendering is a pure function of a frame. Is that literally true?"**
Almost — `ArrayView` is pure in its frame, but the parent render also reads `cursor`, `compare`, `speed`, the saved list and the banners. The stage itself is pure; the page isn't. That distinction matters because it's what would let you extract the stage into its own memoised component today, and it's the first thing I'd do before profiling anything.

**4. "Where would a virtualised list help this app, and where would it hurt?"**
It would help `frames.length` — the timeline and any frame browser — and it would help the comparison panel at large n, because it maps two arrays per render. It would **hurt** the main stage: virtualization exists to avoid mounting thousands of DOM nodes, and the stage mounts at most 24 bars, of which only the active two change class. Virtualizing 24 elements single-file would add measurement and scroll-sync code to remove nothing.

**5. "What's the algorithmic complexity of a single React render here?"**
O(n) in the array length for the `map`, plus O(n) for the `max` reduction inside `ArrayView` — so O(n) with n ≤ 24, and the constant is dominated by React's reconciliation of ~24 elements with ~6 class strings each. Comparing to the generation cost, a render is negligible relative to one memo recomputation, which is O(frames × n).

**6. "If you memoised `ArrayView` with `React.memo`, what would break?"**
Nothing would break, and nothing would be gained: its only prop is the current frame, which changes on every render of the parent, so the shallow comparison never short-circuits. `React.memo` on a component whose props change every frame is a pure cost. The version that would help is memoising the *bar rows* keyed by element id, because only two of them change class per frame — and that's only worth doing if profiling says so.

---

## 60.2 Algorithms × the browser event loop

**7. "You run a quadratic algorithm in the middle of a React useMemo. Does that block the UI?"**
It blocks the thread, and it is synchronous. At n = 24 the worst case is bubble sort with 1,154 frame pushes and about 1,154 array clones of 24 elements each — tens of thousands of operations, sub-millisecond to a few milliseconds. It's imperceptible, which is exactly why the 24 cap exists. At n = 500 the same code would block noticeably, and the fix is a worker, not a `setTimeout` split.

**8. "Where would a Web Worker help, and what would it cost you?"**
Generation is pure and takes plain data, so it's the ideal worker payload: post the array, get back frames, keep the thread responsive at any n. The costs are real — structured-clone serialisation of the whole trace across the boundary, which for a megabyte trace is worse than computing it; a loading state the UI doesn't have; and a second copy of `engine.js` in the bundle unless it's shared. [PROPOSED] The right first step is a heavier cap plus incremental chunking, not a worker.

**9. "Your timer is 50 ms at the fastest speed. What's the actual frame interval?"**
At least 50 ms, and often more, for two reasons: the browser clamps nested timeouts to a minimum (4 ms after nesting depth 5), and timers are macrotasks, so a long render or a GC pause delays the next one. So the animation is *approximately* 20 fps at best, and the label "6×" describes the ratio between delay values, not a guaranteed frame rate.

**10. "What happens to playback if the user switches tabs for ten seconds?"**
Throttled: background tabs get clamped timers, typically to one per second or less. Because the design is a self-scheduling chain rather than an interval, no burst fires on return — the outstanding single timeout is simply late. So the animation effectively pauses and resumes without skipping, which is precisely the failure mode intervals have.

**11. "Is `Math.min` in the reducer in any sense asynchronous?"**
No. The reducer is a synchronous pure function; the entire transport is synchronous. The only asynchronous things in the lab are `setTimeout` for scheduling, the `File.text()` promise in import, and React's own batching — which is why `setInput` and `dispatch({type:'load'})` in `load()` land in the same commit rather than causing an intermediate render with a mismatched pair.

**12. "If I click Step 20 times fast, how many frames render?"**
Up to 20 commits, one per `seek`, because each click is a discrete event and React batches synchronously within the handler. Automatic batching in React 19 collapses updates within a single event, not across events, so 20 clicks are 20 renders. Each render is cheap by design — one array index and a `map` of 24 — which is why this isn't a problem worth solving.

---

## 60.3 State management × testing

**13. "You test the reducer but not the component. Which bugs does that leave invisible?"**
Three classes: timer wiring (a missing cleanup, a missing dependency, duplicate schedules), render-time derivation (a stale frame index, an off-by-one in a disabled condition), and persistence round-trips, because `localStorage` and `File` are browser APIs. Everything about the *state machine* is covered; everything about the *edges between the machine and the browser* is not.

**14. "How would you test the timer without a browser?"**
Fake timers — Node's `mock.timers` in the built-in runner, or a library's fake clock — plus a component test that renders the lab, clicks Play, advances the clock one interval, and asserts the cursor advanced exactly one. That requires a DOM, which means adding jsdom or the react-test-renderer. The honest sequencing: extract the timer wiring into a small custom hook, test the hook, leave the component thin.

**15. "What's the cheapest test that would have caught your merge bug?"**
Two lines inside the existing loop: for every frame, assert that the number of distinct ids equals the frame's array length. It needs no new dependency, no DOM, no new file — it's an assertion that already exists, moved from the last frame into the loop.

**16. "Property test versus example test — which suits each module here?"**
Property tests suit `parseInput` (for any accepted string, the parsed values round-trip to the same string form), the reducer (the cursor is always an integer in range; the last frame always clears `playing`), and `compareCursor` (the result is always in range for any pair of lengths). Example tests suit the generators' specific shapes — the seed frame, the `break` frame, the duplicate-id frames — because those are decisions, not properties.

**17. "You have no coverage number. What would it buy you, and what would it not?"**
It would buy two things: an automated check that a new module is referenced by some test at all, and a diff-coverage gate on PRs. It would not measure assertion strength, and the merge bug proves it — the generator has essentially full line coverage and a real defect in the frames it emits. Coverage is a floor detector, not a quality signal.

**18. "Is the reducer's `default` branch testable? Should it be?"**
It is: dispatch an unknown action and assert reference equality with the input state, which is the same assertion that guarantees React bails out of the re-render. It should be tested precisely because the branch exists for a runtime reason and not merely for exhaustiveness. The stronger version is to throw in development, and then the test asserts the throw.

---

## 60.4 Persistence × security

**19. "Name every way something the app trusts can be wrong."**
Three sources: `localStorage`, which the app wrote but users and other scripts can edit; the URL query string, which is entirely user-controlled; and an imported file, which is entirely user-controlled. All three end up as `{algorithm, input, cursor}` and all three are re-validated — the registry check for the algorithm, `parseInput` for the values, integer-and-clamp for the cursor.

**20. "You use `Object.hasOwn`. What does it prevent, concretely?"**
It prevents a lookup from reaching inherited properties. `'constructor' in algorithms` is `true` because `in` walks the prototype chain, so an import file with `"algorithm":"constructor"` would pass an `in` check and then `algorithms['constructor']` would be `Object` — a function — and calling `.run()` on it would throw inside the component. `Object.hasOwn` requires the key to be an own property of the registry object.

**21. "Could a crafted import file execute code?"**
Not through this path. The file's text goes to `JSON.parse`, which produces data and executes nothing; the values then go through a regex-anchored validator; the algorithm key goes through an own-property check; nothing is passed to `eval`, `new Function`, `setTimeout` with a string, or `innerHTML`. React renders text through JSX interpolation, which escapes by default. What I *don't* claim is that the app is secure — there's no server, no authentication and no user data, so there's no meaningful attack surface beyond the user's own browser.

**22. "What's the risk of storing input in `localStorage`?"**
Any script that runs on the same origin can read it, and it is not encrypted. The data is an array of integers, so the privacy exposure is minimal; the availability exposure is that clearing site data destroys the user's saved experiments with no warning and no recovery path. Export is the only backup, and there's no prompt to use it.

**23. "Is your storage read path a security boundary or a robustness boundary?"**
Robustness, deliberately. It exists so a corrupted store produces an empty list rather than a crash on mount. The security-relevant part is the prototype-safe algorithm check on the *import* path, because that data arrives from outside. I'd describe the storage path as defensive, not as a security control.

**24. "What would you have to add before this could safely sync to a server?"**
Almost everything that doesn't exist: an identity model, transport encryption, authorisation on the record, server-side validation of exactly the same schema, a conflict-resolution policy for two devices editing one record, and a migration story for the `version` field. The one thing I'd keep as-is is the record's shape — it's a few hundred bytes of plain data with an explicit version number, which is the right starting point for that work.

---

## 60.5 Build, bundling and module systems

**25. "You use `rolldown-vite` through an npm alias. What does that mean for a reviewer?"**
It means `package.json` says `"vite": "npm:rolldown-vite@7.2.5"`, so the package named `vite` is actually Rolldown-based Vite, and `overrides.vite` makes the transitive dependencies resolve to the same one. A reviewer cloning the repo gets exactly that build, and the practical consequence is that it's a fast, native-Rust bundler that is not the current default — so "why is your vite different from everyone's" has an answer in the manifest, plus a chapter in the README.

**26. "Your bundle is 251 KB for an app this small. What's in it?"**
React and React DOM dominate; `react-router-dom` and `lucide-react` add the rest. The measured build prints 1,736 modules, one main chunk at 251.78 kB (80.90 kB gzip), plus a 29.85 kB SortingLab chunk and an 18.65 kB engine chunk, with 72.37 kB of CSS. The size is unremarkable for React 19 and there's no obvious dead weight to cut; the lever if I needed one is the icon package, which imports per-icon but is the kind of dependency that grows silently.

**27. "Why is there no code splitting beyond the routes?"**
Because the routes are the natural seams and they're already split: fourteen of the seventeen routes render a lazily-imported component — twelve distinct `React.lazy` components, with `SortingLab` used by three routes — so the module pages and the lab load on demand. Splitting further — the algorithm generators out of the lab, for example — would create a chunk boundary inside a feature that's always loaded together, adding a request to save nothing.

**28. "How does the build ensure the test files aren't shipped?"**
Two ways. Vite only follows the import graph from the HTML entry, so `tests/` is never reachable — it's not in `src/` and nothing imports it. And the test command is `node --test tests/*.test.js`, which is a separate execution path entirely. The guarantee is structural: the entry graph is the bundle.

**29. "What would break if someone upgraded Node?"**
The floor is `engines.node >= 22.12.0` with a matching `.nvmrc`, so a downgrade is a warning today and an install-time failure under `engine-strict`. An upgrade is the interesting direction: Node 22's test runner is a stable feature, `node --test` with glob patterns behaves consistently, and the code uses no Node APIs beyond `node:test` and `node:assert/strict` — so the risk is in the toolchain, not in my source.

**30. "Why does CI run the build at all, if tests are the gate?"**
Because a test suite over pure modules can pass while the app fails to build — a bad import path, a syntax error in a JSX file no test imports, a Tailwind or PostCSS config problem, a missing asset. The build step is the only gate that exercises the whole module graph. In this repository it's genuinely non-redundant: none of the fourteen lazily-loaded route components is imported by any test.

---

## 60.6 URL, routing and HTTP semantics

**31. "A URL is a user input. How do you treat it?"**
Like an untrusted one. `?algorithm` is validated against the registry before use and falls back to a default; `?compare` is tested with `params.has`, so `?compare=0` still enables comparison — a deliberate "presence means yes" reading rather than an accidental one. Nothing from the URL is rendered as HTML, and nothing from it is used as a key without an own-property check.

**32. "Why does a static SPA need a rewrite rule?"**
Because the server sees `/modules/core/advanced-sort` as a path, not a route. Without a rewrite, a direct hit or a refresh returns 404 since no such file exists. `vercel.json` rewrites everything to `index.html`, and the client router resolves the path. That's why the rule exists in the deployment config rather than in the app.

**33. "What's the difference between the dev server's host config and the deployment's?"**
`vite.config.js` allows specific hosts and binds to all interfaces so the dev server is reachable from outside the machine — a preview requirement. `vercel.json` is about path resolution in production. Neither affects the app's routing logic, which is entirely client-side in both cases.

**34. "If you added a `/experiment/:id` route, what would have to change?"**
The route table, the lazy import, and the data source — there's no server to fetch an id from, so `:id` would have to address something local: an index into the saved list, or a compact encoding of the experiment in the URL itself. The second is the version worth building for shareability, and it's [PROPOSED]; today only `?algorithm` and `?compare` travel in a link.

**35. "Does deep-linking a lab state survive a refresh?"**
Partly. The algorithm and the compare flag are in the URL, so they survive; the dataset, the cursor and the speed do not, because they're component state. A saved experiment survives a refresh but is not in the URL. So the honest answer: the *route* is linkable, the *state* is not.

---

## 60.7 CSS, layout and rendering

**36. "Your bars change class per frame. Is that more or less expensive than animating height?"**
Less, in this design. A class change invalidates style for that element and typically only triggers paint, and there are four states changing a background and a border. Animating `height` would invalidate layout for the whole row every frame — and with flexbox, every sibling. If the design wanted smooth growth, the correct property to animate is `transform: scaleY`, which is compositor-friendly.

**37. "Why `prefers-reduced-motion` matters in a visualizer."**
Because the motion *is* the content: continuous bar movement and a self-scheduling timer at up to 20 fps is exactly the pattern that triggers motion sensitivity. The media query in `lab.css` is the accessibility affordance, and the honest limitation is that it doesn't automatically stop autoplay — a user still has to press Pause, and ideally playback would start paused when the query matches.

**38. "What's the layout cost of the comparison panel?"**
Two flex rows of up to 24 bars each, plus two meters — so roughly 50 additional DOM elements and a second `ArrayView` invocation per frame while comparison is on. It's the most expensive per-frame render path in the app, and the cheapest mitigation is to memoise the secondary view on `compareCursor`: while the primary advances, the secondary also advances, so that doesn't help; the real fix would be a static preview rather than a second live trace.

**39. "Your bars use percentage heights inside a fixed-height stage. What breaks?"**
A fixed-height parent with percentage children is the standard way to get proportional sizing without measurement, and it's stable — but the child's height is a percentage of the parent, not of the data, so the 25% floor and the max-normalisation both live in the formula rather than the layout. What breaks first is very large `|val|` spread: one 999 and a row of 1s makes every other bar 25% of the stage, because the scale is relative to the frame's maximum.

**40. "Is your UI accessible?"**
Partially, and I'd say so plainly. There are real flaws: the bars carry no `aria-label`, the range input has no associated label, the metric tiles are visual only, and the keyboard shortcuts are undiscoverable. There are also things done right by construction: every actionable control is a real `<button>` or `<input>`, focus order follows DOM order, and the icon-only transport buttons have `title` attributes. What's missing is the general affordance — nothing announces that the visualisation changed, which is exactly the part a screen-reader user would need.

---

## 60.8 Numerics and JavaScript semantics

**41. "Your dataset generator uses `Math.imul`. Why does that matter for reproducibility?"**
Because `1664525 * state` overflows 2⁵³ for large 32-bit states, and once a JavaScript number loses integer precision the low bits are gone — so the recurrence stops being the mathematical LCG the seed implies, and could differ across engines that handle the rounding differently. `Math.imul` performs the multiply as a 32-bit operation with wraparound, which is the definition the algorithm needs, and `>>> 0` keeps the state unsigned.

**42. "Integers between −999 and 999. Why not floats?"**
Because the visualisation, the counters and the trace all assume exact equality: a comparison count is only meaningful if `a === b` is well-defined, and duplicate detection matters for the id assertion. Floating point introduces values where `0.1 + 0.2 !== 0.3`, and any algorithm using `<=` or `>=` would then have input-order-dependent behaviour. Integer-only is a stated precondition that removes an entire class of subtlety from the tool.

**43. "Is `-0` a problem anywhere?"**
It's accepted by the parser and by `Number.isSafeInteger`. It renders as `0`, sorts fine, and compares equal to `0` — so it's invisible. The one place it would matter is a strict `Object.is`-style comparison in a test; nothing here uses one.

**44. "Why is `Array.prototype.sort`'s comparator written as `(a, b) => a - b`?"**
Because the default sort converts to strings, which puts 100 before 20, and because the `a - b` form returns a number rather than a boolean. Also worth knowing: `Array.prototype.sort` is guaranteed stable since ES2019, and it mutates — which is why the test's expected value is computed from a copy, not the input the generator receives.

**45. "Where could a floating-point value reach the UI?"**
Only through a cursor: `compareCursor` is `Math.round` of a ratio, so it's always an integer. The percentage displays are ratios rendered as text. Nothing else does division, which is why the app has no rounding drift anywhere in its displayed numbers.

---

## 60.9 Complexity, scale and cost

**46. "Give me the full cost model of one commit."**
Generation is O(frames) time and O(frames × n) space, and for a quadratic algorithm with per-step instrumentation that's conceptually O(n³) storage. At n = 24 the worst measured case is 1,154 frames and about 981 KB serialised. On top of that, `load()` runs the generator a second time for the length, and the memo runs the comparison trace if comparison is on — so a commit with comparison enabled is four generator runs.

**47. "What's the cost of one playback frame?"**
One `seek`/`tick` through the reducer — O(1) — one component render, one array index, one `map` over ≤ 24 elements, and up to two class recomputations. Plus, if comparison is on, a second `map` over its own trace. So per-frame cost is O(n) with n bounded at 24, independent of the algorithm.

**48. "Which grows first: time, memory or DOM?"**
Memory, by a wide margin. Time is bounded by the instrumented operation count, which at this cap is a few tens of thousands of operations; DOM is capped at 24 bars plus the comparison's second row. Memory grows as frames × n and is the only quantity that has ever made me reduce a bound.

**49. "If you raised the cap to 200, what's the first measured thing that breaks?"**
Generation time and memory together: bubble sort on a reverse-sorted 200-element input is 19,900 comparisons at roughly 4 frames per comparison — on the order of 80,000 frames, each cloning a 200-element array, which is millions of object allocations and hundreds of megabytes. That's a freeze, not a slowdown. The lever is the instrumentation density — push a frame per pass rather than per comparison — and the structural fix is delta frames. [PROPOSED]

**50. "How would you decide the frame budget — measured, or by feel?"**
Measured, with a stated target: interact at 60 fps, never let a commit exceed about 100 ms, and never retain more than a few megabytes. Then choose the instrumentation density to meet it. The current cap was chosen before I took those measurements, which is the honest order of operations — measurement first, bound second.

---

## 60.10 Process, tooling and the human layer

**51. "You have one commit. How would you review this repository as a stranger?"**
Start at `package.json` for the scripts and the Node floor, then `README.md` for scope and non-claims, then `src/main.jsx` → `src/App.jsx` → `src/pages/Home.jsx` for the route table, then `src/lab/engine.js` because it holds the algorithms, the parser and the reducer, then `SortingLab.jsx` as the only consumer, then `tests/engine.test.js`, then the workflow. That's about twenty minutes and it covers the whole surface. The one thing a stranger cannot get from the repository is history, because there isn't any.

**52. "What would you put in the README that isn't there?"**
Three things: a screenshot or a short recording, because the value is visual and text can't carry it; a 'known issues' section listing the merge duplicate-key bug and the non-integer cursor, so the weaknesses are documented rather than discovered; and a one-paragraph 'how to review this codebase in 20 minutes' section, because the route I just described took me months to learn.

**53. "How do you know your README is accurate?"**
Because it's written to be falsifiable. It names files and behaviours, it lists non-claims explicitly — no backend, no timing, no coverage claim, no deployment — and every claim in it maps to something I can point at. What I can't guarantee is that it's *current*: the duplicate-key bug was found after the README was written. That's the honest failure mode of documentation, and the fix is the same known-issues section.

**54. "What's the one thing you'd redo from the start?"**
The instrumentation boundary. I started by pushing a frame wherever something interesting happened, which produced the densest possible trace and a memory bound I then had to justify. If I started again I'd decide the frame budget first — how many frames per element, and what the user is actually supposed to notice — and let that decision determine where snapshots go. That ordering changes the design: coarser instrumentation means fewer frames, which means the 24-element cap could be much higher, which means the tool could be used on the inputs a person actually has.

:::must The cross-domain answer formula
1. **Name the governing mechanism** ("that's the event loop, not the reducer").
2. **Give the consequence in this codebase** ("so a background tab pauses instead of bursting").
3. **Name the boundary** ("at 24 elements this is imperceptible; at 200 it's a freeze").
4. **Name the fix and label it** ("[PROPOSED] delta frames, or a worker with the serialisation cost").
:::

:::check Red-line drills for Part XXXIV
- [ ] Answer five questions at random, out loud, using the four-step formula.
- [ ] Explain why `React.memo` on `ArrayView` would gain nothing.
- [ ] Explain why the timer chain means a background tab pauses rather than bursts.
- [ ] Give the full cost model of one commit, including the double generation.
- [ ] Name the accessibility gaps honestly.
- [ ] Give the "one thing I'd redo" answer — the instrumentation boundary.
:::
