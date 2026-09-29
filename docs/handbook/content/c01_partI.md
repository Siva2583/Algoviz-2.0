%PART: Project identity | PART I | What AlgoViz is, what problem it solves, who it is for, what it deliberately is not — and four pitches at four lengths.

# 03 · What AlgoViz is and why it exists

> The concept, the problem, the audience, and the boundary that keeps the project honest.

## 3.1 The problem the project actually solves

[VERIFIED] The repository states its own thesis in two places. The README's opening line is "Don't just watch. Understand the why." The Overview page renders: "An algorithm is a sequence of decisions. Slow it down, rewind it, and challenge every assumption."

:::key The engineering problem in one sentence
A normal algorithm implementation returns a **result**. A learning tool needs a **sequence of explainable intermediate states** — and those two requirements pull in opposite directions, because everything that makes an algorithm fast (temporary variables, in-place writes, recursion, buffers) destroys the information a learner needs to see.
:::

Think about what actually happens when you study sorting with a typical visualiser. The bars move, the array ends up sorted, and you have learned almost nothing, because the *decisions* flashed past at animation speed. A learner's real question is never "what does a sorted array look like?" — it is:

- Which two elements were compared, and *why those two*?
- Was a swap performed, or was the comparison false?
- What does the algorithm believe is true right now (its invariant)?
- What did it already know at frame 12 that it didn't know at frame 4?
- If two algorithms get the same input, do they make the same number of decisions?

[VERIFIED] AlgoViz answers these by making execution **inspectable** rather than merely animated. Each generator produces frames carrying: the full array state, which indices are currently active, which indices are already finalised, the pivot index where relevant, the recursion range for divide-and-conquer algorithms, a machine-readable `codeLine` tag, a human sentence in `msg`, and a snapshot of running counters in `currentStats`.

## 3.2 The five capabilities that define the product

[VERIFIED] All five exist in `src/lab/SortingLab.jsx` and `src/lab/engine.js`.

| Capability | Mechanism in the source | What the learner gets |
| --- | --- | --- |
| **Recorded-frame playback** | Each `run()` returns a complete `frames[]` array before playback begins (`engine.js` 8–62) | Any state in the execution can be revisited byte-for-byte |
| **Transport control** | `playbackReducer` with `load`/`toggle`/`tick`/`seek` (`engine.js` 80–105) | Play, pause, replay, step forward, step back, restart, seek |
| **Explained steps** | `msg` + `codeLine` + `activeIndices` on every frame | The *reason* for each state, not just the state |
| **Same-input comparison** | `otherFrames` runs a second algorithm on the identical input array (`SortingLab.jsx` 94–97) | A like-for-like comparison of recorded comparison counts |
| **Counterexample lab** | `findCounterexample()` bounded exhaustive search (`engine.js` 152–169) | A reproducible input that proves a plausible implementation wrong |
| **Portable experiments** | Save to `localStorage`, export/import JSON (`SortingLab.jsx` 156–197) | An interesting input and frame position can be revisited or shared as a file |

## 3.3 Who it is for

[VERIFIED] The product copy, the README, and the twelve module routes make the audience explicit.

- **Primary audience:** a learner who can read the code of an algorithm but cannot yet *predict* its behaviour on a new input. The Overview calls the goal "your next aha moment".
- **Secondary audience:** someone preparing for interviews who needs to explain *why* two O(n²) sorts behave differently on the same array.
- **Tertiary audience (the one that makes the project impressive):** a sceptical reader of their own code. The Counterexample Lab exists precisely because "a working example is not proof".

:::note Who it is NOT for
[VERIFIED] It is not a teaching tool for absolute beginners who have never seen a loop — there is no guided lesson sequencing or progress tracking. It is also not a tool for practising *writing* algorithms: the algorithm set is fixed and closed. The README says so directly: "Not a general code debugger: execution is limited to built-in implementations."
:::

## 3.4 What AlgoViz is NOT — the boundary list

[VERIFIED] This is the most valuable list in the whole handbook, because almost every aggressive interview question is an attempt to get you to claim one of these. Say them proactively.

| AlgoViz is NOT | Evidence |
| --- | --- |
| Not full-stack / not MERN | `package.json` has zero backend dependencies; the only `fetch(` in the repository sits in a **dead, unimported** component (`src/components/CardsGrid.jsx` line 21) |
| Not a database application | Persistence is `localStorage` only, scoped to one browser and one origin |
| Not a benchmark platform | The comparison panel explicitly avoids wall-clock claims: "No wall-clock claims: animation speed is not algorithm performance." |
| Not an AI tutor | Explanations come from static `msg` strings and static tutorial data files |
| Not a general code debugger / not a sandbox for user code | Users supply numbers, never code; no evaluator, no worker, no `eval` |
| Not a formally verified system | Tests are examples and bounded search, not proofs |
| Not an unbounded engine | Input is capped at 24 integers by `parseInput` |
| Not multi-user | No accounts, no sync, no sharing server; export/import is a file, not a service |
| Not mobile-app | It is a responsive web app; the README documents a 390 px smoke check, nothing more |
| Not a security-audited system | No audit exists; the README states the dependency audit is "not a security certification" |

:::trap The trap disguised as a compliment
**"This would be great with a backend so users could share experiments."** The trap is agreeing too enthusiastically and implying you had designed for it. The defensible answer: *"A server would change the trust model — right now the app has no upload path and no accounts, so there is nothing to secure server-side. If sharing became a requirement, I'd add a small API for experiment documents with server-side schema validation and rate limiting, and I'd keep the client-side validation as a UX layer, not as the security boundary."* That answer shows you understand that client-side validation is a UX mechanism, not a security control.
:::

## 3.5 Feature inventory, verified against the source

| Feature | Status | Source |
| --- | --- | --- |
| Six sorting algorithms | [VERIFIED] | `engine.js` 8–62 |
| Frame recording with metadata | [VERIFIED] | six generators under `src/modules/core/algorithm/sorting/algorithms/` |
| Play / pause / replay | [VERIFIED] | `toggle` action; button label switches to "Replay" at the last frame |
| Step forward / step back / restart | [VERIFIED] | `seek(cursor ± 1)`, `seek(0)` |
| Timeline scrubber | [VERIFIED] | `<input type="range" min=0 max={frames.length - 1}>` |
| Speed control (4 presets) | [VERIFIED] | 600 / 300 / 160 / 50 ms; labels 0.5× / 1× / 2× / 6× |
| Keyboard shortcuts | [VERIFIED] | Space, ArrowLeft, ArrowRight; ignored inside form controls |
| Live state inspector | [VERIFIED] | comparisons, passes, exchanges + `activeIndices`, `pivotIndex`, `sortedIndices` |
| Per-algorithm invariant, idea, complexity | [VERIFIED] | `engine.js` metadata objects, rendered in the "What stays true?" panel |
| Same-input comparison with percentage alignment | [VERIFIED] | `compareCursor` computation |
| Comparison throughput meters | [VERIFIED] | `av-meter` width proportional to `comps` |
| Save / list / reload experiments (max 6) | [VERIFIED] | `localStorage` + filtering on read |
| JSON export / import with validation | [VERIFIED] | `download()` + `importExperiment()` |
| Seeded dataset generator + 4 presets | [VERIFIED] | `makeDataset(kind, seed)` |
| Counterexample lab with bounded search | [VERIFIED] | `findCounterexample()` |
| Twelve non-sorting visualisation modules | [VERIFIED] | `Home.jsx` routes 45–79, `constants.js` |
| Learning notes / pseudocode per algorithm | [VERIFIED] | `TutorialTab` rendered from `simplesortData` / `sortingTutorialsData` |
| Dark UI with responsive breakpoints | [VERIFIED] | `lab.css` media queries at 1600/1200/950/680 px; `prefers-reduced-motion` block at line 1570 |

:::notverified Claims the repository cannot establish
"v1" features, development timeline, how long the project took, who wrote which line, whether the algorithms were written from scratch or adapted, GPU/CPU performance figures, real user counts, deployment history beyond the `vercel.json` and README instructions, and whether any employer used it. None of this is in the repository. If asked about authorship history, answer factually about the work you did and do not invent a timeline.
:::

---

# 04 · The stack, and the four pitches

> What is actually installed, why each choice is defensible, and four scripts you can deliver at four lengths.

## 4.1 The stack, verified from `package.json` and the lockfile

| Layer | Declared | Installed | Notes that matter |
| --- | --- | --- | --- |
| UI library | `react` ^19.2.0 | 19.2.1 | Uses `createRoot`, `StrictMode`, hooks only; no class components |
| DOM renderer | `react-dom` ^19.2.0 | 19.2.1 | `react-dom/client` entry |
| Routing | `react-router-dom` ^7.11.0 | 7.18.3 | `BrowserRouter` + `Routes`/`Route`; `useSearchParams`, `useLocation`, `useNavigate`, `NavLink`, `Link` |
| Styling | `tailwindcss` ^3.4.17 (dev) | 3.4.17 | Compiles `@tailwind` directives from `src/index.css`; used by legacy modules |
| Styling (lab) | — | hand-written | `src/lab/lab.css` 1,756 lines; `modules.css` 505; `lesson.css` 419; `styles/global.css` 258 |
| Icons | `lucide-react` ^0.556.0 | 0.556.0 | Tree-shaken icon components (Play, Pause, ChevronLeft…) |
| Build | `vite` aliased to `npm:rolldown-vite@7.2.5` | 7.2.5 | An npm alias, not a forked config. `overrides` pins the same version |
| Lint | `eslint` ^9.39.1 + `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` | 9.39.1 | Flat config in `eslint.config.js` |
| Tests | none in dependencies | — | `node --test tests/*.test.js`, built-in `node:test` + `node:assert/strict` |
| Runtime | `engines.node >= 22.12.0`, `.nvmrc` = 22 | 22.22.3 local | CI pins Node 22 |
| Deploy | `vercel.json` SPA rewrite | — | README documents Vercel preset/commands |

:::must The stack sentence to say in an interview
"React 19 with hooks and no state library, React Router 7 with lazy-loaded routes, Tailwind plus scoped CSS, Vite for build and dev server, ESLint for static checks, Node's built-in test runner for correctness checks, GitHub Actions for CI, Vercel for static hosting. There is no backend and no runtime dependency beyond React, React Router and an icon library."
:::

## 4.2 Why each choice is defensible (and what the alternative would cost)

| Choice | Why it fits AlgoViz | What you gave up |
| --- | --- | --- |
| React | The UI is a function of one cursor value; re-rendering on state change is exactly the required behaviour | Bundle size, a build step, and framework churn |
| `useReducer` for playback | Four named transitions, all pure, all unit-testable without React | Slightly more ceremony than two `useState` calls — and that ceremony is the point |
| Vite | Instant dev server, native ESM, one config file, proper production bundling with code splitting | You inherit Rollup/Rolldown semantics (e.g. `rolldown-vite` alias must be understood) |
| React Router | Twelve deep-linkable module URLs plus query params (`?algorithm=quick`, `?compare=1`) | A routing dependency and the SPA-fallback requirement on the host |
| Tailwind + scoped CSS | Fast iteration for 12 legacy modules; precise control for the lab's bar/timeline visuals | Two styling systems in one codebase — an honest trade-off to acknowledge |
| `localStorage` | Zero infrastructure for a client-only tool; instant, offline, private | ~5 MB per origin, synchronous API, no durability guarantee, no cross-device sync |
| Node test runner | Zero extra dependency; runs the actual generator modules in Node with no DOM | No DOM, no component tests, no coverage report, no watch UI |
| GitHub Actions | The checks already exist as npm scripts; CI is four lines | Nothing, for a public repo |

:::inference Why the sort of "why not Redux / Zustand / MobX?" question you will get
[INFERENCE] The code already keeps its state deliberately small: 12 `useState` calls and one `useReducer`, all local to a single component. There is no cross-component state except the URL, which is React Router's own. Adding a global store would introduce a second source of truth for data that only one screen uses. The honest answer: *"State lives where it is used. The playback state is the only genuinely stateful thing, and a reducer already gives me the transition discipline a store would provide, without the dependency."*
:::

## 4.3 The four pitches

Deliver these from memory in your own words, not by reciting. The bracketed notes are the *intent* of each line — say the line in plain language, not the bracket.

:::script 30-second pitch (elevator / recruiter screen)
"AlgoViz is a browser-based algorithm laboratory in React. The problem it solves is that most algorithm visualisers animate a result — you watch it finish, but you never see *why* the algorithm made each decision. So instead of animating execution, AlgoViz **records** it. Each algorithm runs to completion and produces a list of frames; every frame has the array, the active indices, the sorted region, a message and running counters. The UI plays those frames back through a small reducer, so play, pause, step, seek and rewind are all just moving an index into a recording. It has six sorting algorithms, same-input comparison using comparison counts rather than animation timing, local experiment saves with validated JSON import and export, and a test suite that checks correctness and trace reproducibility."
:::

:::script 60-second pitch (hiring manager)
"The interesting part of AlgoViz isn't the visualiser UI, it's the execution model. A normal sorting function throws away everything interesting: comparisons, decisions, the moment the algorithm learns something. So I split the project into two halves. The engine — the six generators — runs the algorithm synchronously and returns a complete array of frames. A frame is a full snapshot plus metadata: the array at that step, which indices are being compared, which are already final, the pivot, the code line that produced it, a sentence explaining it, and the counters as they stood at that moment. The second half is playback: a `useReducer` with four actions — `load`, `toggle`, `tick`, `seek` — that owns only the cursor, the trace length and whether we're playing. A single effect schedules one timer and cleans it up. That split is what makes rewind possible: seeking backwards is selecting an earlier recorded state, not executing JavaScript backwards. On top of that, the same input can be run through two algorithms and compared by recorded comparison counts — never by animation speed, and the UI says so. Then there's the verification story: 150 sorting correctness and reproducibility cases, 768 sliding-window cases checked against an independent brute-force oracle in the test file, and a counterexample lab that searches a bounded domain for an input that proves an implementation wrong. CI runs tests, lint and build on every push."
:::

:::script 2-minute technical pitch (engineer interviewer)
"AlgoViz is a client-side React 19 app, Vite-built, React Router 7 for twelve module routes. No backend at all.

The core abstraction is a recorded frame. Each of the six sorting algorithms is a generator function that takes a raw array of numbers and returns an array of frames. A frame carries the full array as objects with **stable IDs**, so equal values stay distinguishable; `activeIndices` for the elements under consideration; `sortedIndices` for the region already finalised; `pivotIndex` and `subArrayRange` where the algorithm has those concepts; a `codeLine` tag like `'compare'` or `'swap'`; a human `msg`; and `currentStats` — a snapshot of comparisons, passes and exchanges at that instant. The generators clone the array on every frame push, so frames are independent and immutable.

Playback is a separate concern. A single `useReducer` holds `{cursor, length, playing}` and accepts four actions. `load` resets for a new trace, `toggle` flips playing and rewinds if you're at the end, `tick` advances one frame and clears `playing` when it reaches the end, and `seek` clamps into `[0, length-1]` and pauses. One `useEffect` is the only timer owner: while playing, it schedules a `setTimeout` for the current speed and clears it on cleanup, so there is exactly one pending timer and it is cancelled when playback stops, speed changes or the component unmounts. Clamping happens twice — once in the reducer, once in the component when it derives `cursor` — so a stale cursor after an input change can't index out of bounds.

Comparison mode runs a second algorithm over the identical `input` array via a `useMemo`, so both traces come from the same data. Alignment is proportional: the preview frame is `round(cursor / (frames.length - 1) * (otherFrames.length - 1))`. That's a viewing convenience — I say explicitly in the UI that percentage alignment is not equivalent operations, and I compare recorded comparison counts, not wall-clock time, because animation speed is not algorithm performance.

Persistence is `localStorage` under `algoviz.experiments.v1`, capped at the latest six, filtered on read, and export/import is a versioned JSON document that is re-validated through the same `parseInput` the UI uses, with a 16 KB size cap.

Verification is `node:test` — six algorithm groups covering five edge inputs plus twenty seeded datasets each, which is the 150; assertions are sorted output, input preservation, deep-equal trace reproducibility and final ID uniqueness. Separately, the sliding-window implementation is checked against a brute-force oracle over 64 arrays × 12 targets — the 768 — and there's a bounded differential search that finds the first input where a deliberately buggy variant diverges. CI is four steps: clean install, tests, repository-wide lint, production build."
:::

:::script 5-minute deep technical explanation (the "tell me everything" round)
Use the 2-minute pitch as the spine, then extend it in this order — each extension has a matching chapter in this book:

1. **Why frames instead of live animation** (Ch. 08) — because you cannot rewind an animation you didn't record, and because computing the trace first makes the UI a pure function of `cursor`.
2. **What a frame contains, exactly** (Ch. 09) — the field table, which fields are optional per algorithm, and why the IDs are string keys `block-<original index>`.
3. **The reducer as a state machine** (Ch. 11) — the four actions, the boundary rules, and the three invariants (`0 <= cursor <= length-1`, `playing` only true below the last frame, `length` only changes on `load`).
4. **The timer contract** (Ch. 12) — one effect, one `setTimeout`, cleanup on every dependency change, why `setInterval` would need history to catch up and would still be wrong.
5. **The memory trade-off** (Ch. 05) — full snapshots are O(frames × n) element copies, which for a quadratic algorithm that copies per step is conceptually O(n³) storage; the project's answer is a hard 24-element input cap rather than a scalability claim. Measured: the reverse-sorted 24-element bubble trace is 1,154 frames and ~980 KB of JSON.
6. **Comparison without lying** (Ch. 12–14) — same input, separate traces, comparison counts only, percentage alignment for the preview, explicit on-screen disclaimers about what the numbers are not.
7. **The verification story** (Ch. 17–20) — what is tested, what an oracle is, why reproducibility is the property that matters for a frame-based tool, and precisely what finite testing does not prove.
8. **The honest weakness list** (Ch. 44) — the reducer only owns sorting playback; ten legacy modules still run their own `setTimeout`/`await` loops; there is dead code; there is no component or browser test in the repo.
:::

:::danger If you only remember one thing from Part I
The sentence that makes this project sound senior rather than student: **"The algorithms run to completion and record their decisions; the UI replays the recording. Playback is indexing, not execution — which is why rewinding is free and why the reducer never needs to know anything about sorting."**
:::
