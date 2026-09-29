%PART: Complete project architecture | PART II | The real file map, the real data flow, and a colour code that tells you what to study first.

# 05 · The repository, mapped

> Every source file, what it does, whether it is live, and how much you need to know it.

## 5.1 The honest high-level map

The repository contains **two generations of code living side by side**. Understanding this is the difference between sounding like you know your own project and sounding like you inherited someone else's.

:::must Two generations, one repository
**Generation 2 (the lab)** — `src/lab/*`, `src/App.jsx`, `src/main.jsx`, `src/constants.js`, `src/pages/Home.jsx`, `src/components/*`, `src/styles/global.css`, `tests/*`. This is the React 19 + Vite + React Router application whose engine is `src/lab/engine.js`. Its centrepiece is `src/lab/SortingLab.jsx` (596 lines).

**Generation 1 (the legacy modules)** — `src/modules/**`. Twelve algorithm/pattern visualisations that each manage their own animation with `useState` + `async` loops and `setTimeout`-based waiting. They were kept working, share the new page chrome through `ModuleFrame.jsx`, and are **not** driven by the playback reducer. Their algorithm logic lives under a folder named `algorithm/sorting/` even when the algorithm is nothing to do with sorting.
:::

This is a real, defensible narrative: *"I rebuilt the sorting lab on a recorded-frame engine and gave the older modules the shared shell, but I did not migrate non-sorting playback to the reducer — the README lists that as the next migration. I'd rather say that than pretend the whole app uses one execution model."*

## 5.2 The RED / YELLOW / GREEN file classification

Use this to allocate study time. **RED** = you must be able to open, explain line by line, and modify. **YELLOW** = you must know its role, inputs, outputs and one trade-off. **GREEN** = recognition only; know it exists and why.

| File | Lines | Colour | Role |
| --- | --- | --- | --- |
| `src/lab/engine.js` | 169 | **RED** | The heart: algorithm registry, `parseInput`, `playbackReducer`, `makeDataset`, `windowTrace`, `findCounterexample` |
| `src/lab/SortingLab.jsx` | 596 | **RED** | The lab UI: state register, timers, keyboard, save/import/export, comparison |
| `src/modules/core/algorithm/sorting/algorithms/bubbleSort.js` | 92 | **RED** | Canonical frame generator; the one to walk through |
| `src/modules/core/algorithm/sorting/algorithms/mergeSort.js` | 172 | **RED** | Recursion + buffer + write-counting quirks |
| `src/modules/core/algorithm/sorting/algorithms/quickSort.js` | 160 | **RED** | Partition, pivot locking, sorted-index bookkeeping |
| `src/modules/core/algorithm/sorting/algorithms/insertionSort.js` | 86 | **RED** | `isLifting` flag, early-break frame |
| `src/modules/core/algorithm/sorting/algorithms/selectionSort.js` | 73 | **RED** | `minimumIndex` tracking |
| `src/modules/core/algorithm/sorting/algorithms/heapSort.js` | 120 | **RED** | Two phases; recursive heapify; the "O(log n)\*" footnote |
| `tests/engine.test.js` | 140 | **RED** | The 150, the 768, the oracle, the counterexample, playback tests |
| `src/lab/Shell.jsx` | 116 | **YELLOW** | Shared chrome: sidebar, nav, topbar, footer, scroll-to-top |
| `src/lab/Overview.jsx` | 178 | **YELLOW** | Landing page and library grid (also used as `/library`) |
| `src/lab/Counterexample.jsx` | 203 | **YELLOW** | Differential-execution UI with first-divergence display |
| `src/lab/ModuleFrame.jsx` | 156 | **YELLOW** | Breadcrumb, module switcher, Visualize/Learn segmented control |
| `src/pages/Home.jsx` | 104 | **YELLOW** | `BrowserRouter` + all routes + `Suspense` fallback + 404 |
| `src/constants.js` | 102 | **YELLOW** | `CORE_MODULES` (6) + `PATTERN_MODULES` (6) metadata |
| `package.json` | 36 | **YELLOW** | Scripts, deps, engines, the Vite alias override |
| `.github/workflows/ci.yml` | 15 | **YELLOW** | The four CI steps |
| `vite.config.js` | 9 | **YELLOW** | React plugin, dev/preview host + allowedHosts |
| `src/main.jsx` | 9 | **YELLOW** | `createRoot` + `StrictMode` entry |
| `src/App.jsx` | 12 | **GREEN** | Thin wrapper that renders `<Home />` |
| `src/index.css` | 12 | **YELLOW** | The three `@tailwind` directives + body defaults — the only Tailwind entry |
| `tailwind.config.js` / `postcss.config.js` | 9 / 6 | **YELLOW** | Content globs and PostCSS pipeline |
| `eslint.config.js` | 45 | **YELLOW** | Flat config; the legacy `set-state-in-effect` exception is a great talking point |
| `src/lab/lab.css` | 1756 | **GREEN** | Lab visual system. Know: bar colours, timeline, breakpoints, reduced-motion |
| `src/lab/modules.css` | 505 | **GREEN** | Legacy module chrome |
| `src/lab/lesson.css` | 419 | **GREEN** | Tutorial/lesson layout |
| `src/styles/global.css` | 258 | **GREEN** | Root variables, dark theme, legacy page styles |
| `src/modules/core/tutorials/*Data.js` (10 files) | ~700 | **GREEN** | Static learning content per algorithm |
| `src/modules/core/tutorials/TutorialTab.jsx` | 202 | **GREEN** | Renders lesson sections from that data |
| `src/modules/core/*.jsx` (6) + `src/modules/patterns/*.jsx` (6) | ~3,500 | **GREEN** | Legacy visualisations; each self-manages playback |
| `src/modules/core/algorithm/sorting/algorithms/*Logic.js` (9) | ~640 | **GREEN** | Legacy frame producers for the non-sorting modules |
| `vercel.json`, `.nvmrc`, `README.md`, `docs/*` | — | **GREEN** | Deployment fallback, Node version, documentation |
| `src/components/*.jsx` (9 files) | ~370 | **GREEN — dead code** | Not imported anywhere; see 5.4 |
| `src/components/Layout.jsx` | 0 | **GREEN — empty** | Zero bytes. It exists, it is empty, nothing imports it |
| `src/App.css` | 43 | **GREEN — orphan** | Not imported by any module |

:::danger The question you must be ready for the moment you open the repo
**"What is `src/components/Layout.jsx`? It's empty."** And: **"Who imports `CardsGrid.jsx`?"** Nobody. Nine components plus one empty file plus one orphan stylesheet are leftovers from an earlier structure. This is not a scandal — every evolving codebase has them — but you must *know* it and answer instantly: *"Those are remnants from the earlier version's structure. They are not imported anywhere; Vite tree-shakes them out of the build entirely. They're on my cleanup list, and I keep them visible rather than deleting them blind so I don't lose the visit-counter logic that only exists there."*
:::

## 5.3 What happens to dead code in the build

[VERIFIED] I ran `npm run build`: 1,736 modules transformed, 19 emitted asset files (16 JavaScript chunks and 3 stylesheets). No chunk contains `CardsGrid`, `SimpleSorts` or `EfficientSorts` — unreferenced modules are eliminated. **But** the CSS is different: Tailwind scans `./src/**/*.{js,ts,jsx,tsx}` and emits any utility class it finds *in source*, including source that is never bundled. That is why utilities like `mt-12` from a dead component can still appear in the shipped CSS.

:::inference Why this matters for an interview answer
[INFERENCE] It demonstrates you understand the difference between **module elimination** (bundler-level, driven by the import graph) and **class extraction** (Tailwind-level, driven by a content glob over source text). Most candidates cannot articulate that distinction. Say it once, confidently, and move on.
:::

## 5.4 The dead-code inventory, verified

| Path | Evidence it is dead |
| --- | --- |
| `src/components/Algocards.jsx`, `CardsGrid.jsx`, `Header.jsx`, `Layout.jsx`, `ModeToggle.jsx`, `NQueensControls.jsx`, `NQueensplay.jsx`, `SearchControls.jsx`, `SortingControls.jsx` | No source file imports any of them |
| `src/context/ModeContext.jsx` | Only imported by the dead `CardsGrid.jsx` and `ModeToggle.jsx` — therefore effectively dead too |
| `src/App.css`, `src/assets/react.svg`, `public/vite.svg` | No imports / no references (only `favicon.svg` is referenced by `index.html`) |
| `src/modules/core/SimpleSort.jsx`, `EfficientSort.jsx` | Not routed; sorting routes render `SortingLab` instead. They are the v1 sorting UIs, superseded by the lab |

:::weak A subtlety worth knowing before you get asked
`CardsGrid.jsx` contains the only network call in the entire repository — an `await fetch('https://countapi.mileshilliard.com/api/v1/hit/algoviz-siva-2026')` for a visit counter. Because the component is not imported, **no request is ever made**. If you are asked "does your app call any external service?", the correct answer is: *"No. There is one `fetch` left in a component that isn't imported anywhere, so it never executes. It's dead code from the earlier version — and honestly, if it *were* live I'd remove it, because a third-party counter API in a client-side app is both a privacy leak and a supply-chain dependency I don't control."* That answer turns a landmine into evidence of judgement.
:::

---

# 06 · Architecture and data flow

> The pipeline, redrawn to match the actual source rather than the idealised version.

## 6.1 The pipeline as implemented

The block diagram below is the real data flow. Every arrow is a function call or a state write that exists in the code.

```
                          USER (browser)
                                |
                                | types "38, 66, 12, 85" and presses Apply input
                                v
        +-------------------------------------------------------+
        |  SortingLab.jsx  ---  <form onSubmit={apply}>          |
        |  state: text  (the raw string, updated on every keypress)|
        +-------------------------------------------------------+
                                |
                                | apply(e) -> e.preventDefault()
                                v
        +-------------------------------------------------------+
        |  engine.parseInput(text)                    [engine.js]|
        |    1. non-empty string?                                |
        |    2. comma-split length between 2 and 24?              |
        |    3. every part matches /^-?\d+$/?                     |
        |    4. Number.isSafeInteger and |n| <= 999?              |
        |  throws Error(message) on any failure                  |
        +-------------------------------------------------------+
                   |                              |
        throws     |                              | returns number[]
                   v                              v
   +---------------------------+    +-----------------------------------------+
   |  setError(err.message)    |    |  load(values, algorithm = algo)         |
   |  nothing else changes     |    |    setInput(values)      <- committed   |
   |  (committed input is      |    |    setText(values.join(", ")) <- draft  |
   |   untouched)              |    |    setAlgo(algorithm)                   |
   +---------------------------+    |    dispatch({type:'load',               |
                                    |              length: run(values).length})|
                                    +-----------------------------------------+
                                                    |
                                                    v
        +-------------------------------------------------------+
        |  FRAME GENERATION  ---  algorithms[algo].run(input)     |
        |  (invoked twice on this path: once for the length,     |
        |   once inside useMemo for the actual frames)           |
        |                                                        |
        |   raw numbers  ->  [{id:'block-0', val:38}, ...]        |
        |                    loop, pushing a frame at every       |
        |                    meaningful state, cloning the array  |
        |                    each time                            |
        |                      v                                  |
        |   frames = [{array, activeIndices, sortedIndices,       |
        |              isSwapping, codeLine, currentStats, msg,   |
        |              pivotIndex?, subArrayRange?, minimumIndex?}]|
        +-------------------------------------------------------+
                     |                        |
      useMemo(algo,input)                    |  same input, second algorithm
                     v                        v
   +---------------------------+   +---------------------------------+
   |  frames[]   (primary)     |   | otherFrames[]  (compare mode)   |
   +---------------------------+   +---------------------------------+
                     |
                     v
        +-------------------------------------------------------+
        |  PLAYBACK STATE    useReducer(playbackReducer,          |
        |                    {cursor:0, length:frames.length,     |
        |                     playing:false})                     |
        |  actions: load | toggle | tick | seek                   |
        +-------------------------------------------------------+
             |            |                |
             |            |                |  seek(index) from timeline,
             |            |                |  step buttons, keyboard
             |            |                v
             |            |        +------------------+
             |            |        |  playbackReducer |
             |            |        |  clamps cursor   |
             |            |        +------------------+
             |            v
             |      +--------------------------------+
             |      |  useEffect: if playing ->        |
             |      |  setTimeout(dispatch tick, speed)|
             |      |  cleanup clears the timer        |
             |      +--------------------------------+
             v
        +-------------------------------------------------------+
        |  DERIVATION (render time, no state)                      |
        |     cursor = min(playback.cursor, frames.length - 1)    |
        |     frame  = frames[cursor]        <- the only read     |
        |     stats  = frame.currentStats                         |
        |     last   = frames.at(-1).currentStats                 |
        |     compareCursor = round(cursor / (frames.length-1)    |
        |                        * (otherFrames.length-1))        |
        +-------------------------------------------------------+
             |
             +--------------------+---------------------+
             v                    v                     v
   +------------------+  +-----------------+  +-----------------------+
   | ArrayView(frame) |  | State inspector |  | Explanation panel      |
   | bars, active,    |  | comps/passes/   |  | codeLine + msg + step  |
   | sorted, pivot    |  | swaps, indices  |  | badge "005"            |
   +------------------+  +-----------------+  +-----------------------+

   SIDE CHANNELS (all outside the reducer, all synchronous)
     Save   -> localStorage["algoviz.experiments.v1"] = JSON.stringify(latest 6)
     Export -> Blob + object URL + synthetic <a download>.click()
     Import -> FileReader via file.text() -> size check -> JSON.parse ->
               schema check -> parseInput -> load() -> seek()
     Dataset-> makeDataset(kind, seed)  (LCG, 10 values) -> load()
```

## 6.2 The nine stages, each with its guarantee

| Stage | Input | Output | Guarantee it provides |
| --- | --- | --- | --- |
| 1. Draft entry | keystrokes | `text` string | Nothing. It is deliberately unvalidated so the user can type freely |
| 2. Validation | `text` | `number[]` or `Error` | Every value is a safe integer, `\|n\| <= 999`, and there are 2–24 of them |
| 3. Commit | `number[]` | `input` state + reducer `load` | The analysed dataset is frozen until the next successful commit |
| 4. Frame generation | `rawArray` | `frames[]` | Frame 0 is the initial state; the final frame is fully sorted with all indices marked |
| 5. Memoisation | `(algo, input)` | cached `frames[]` | The generator runs once per distinct `(algorithm, input)` pair per render pass |
| 6. Playback state | actions | `{cursor, length, playing}` | `cursor` is always within `[0, length-1]` when `length >= 1` |
| 7. Scheduling | `playing`, `speed`, `cursor` | one pending timeout | At most one timer exists; it is cancelled on any dependency change or unmount |
| 8. Derivation | `playback`, `frames` | `frame`, `stats`, `compareCursor` | Render happens for a valid frame index even if state is momentarily stale |
| 9. Presentation | `frame` | bars, metrics, text | What is shown is exactly what was recorded — nothing is recomputed for display |

## 6.3 Why this architecture, and what the alternative would have been

:::must The architectural argument in three sentences
If you animated while the algorithm ran — the classic approach — you could only ever move **forward**, because the algorithm's own variables are the animation state. To go backwards you would have to re-run the algorithm from the start and stop early, which is wasteful, and impossible to do at a *precise* earlier decision point for algorithms whose behaviour depends on comparisons performed in sequence. Recording frames inverts the problem: execution becomes a pure, testable, DOM-free function returning data, and navigation becomes an index into that data.
:::

| Aspect | Animate live (legacy modules) | Record frames (the lab) |
| --- | --- | --- |
| Rewind | Impossible without re-running or storing history | Free — just set `cursor` |
| Seek to arbitrary frame | Impossible | `frames[i]` |
| Testable without a browser | No — needs a running animation | Yes — `run()` is a pure function returning data |
| Trace reproducibility | Not checkable | Directly checkable with `deepEqual` |
| Memory | O(1) extra | O(frames × n) snapshots |
| Speed control | Changes the wall-clock delay | Changes only how fast the cursor moves |
| Debuggability | Hard — state is spread across timers | Easy — the whole trace is inspectable data |
| Cancellation | Manual flags and refs | Clear the timeout |

## 6.4 The dependency graph (who imports whom)

```
                              index.html
                                  |  <script type="module" src="/src/main.jsx">
                                  v
                              src/main.jsx
                     createRoot + StrictMode
                                  |
                                  v
                              src/App.jsx
                                  |
                                  v
                             src/pages/Home.jsx  .................... BrowserRouter, Routes, Suspense
                        ____________|________________________________
                       |            |                |               |
                       v            v                v               v
                  lab/Overview   lab/SortingLab   lab/Counterexample  modules/** (12 lazy routes)
                       |            |     |              |
                       |            |     |              +--> lab/engine.js  (windowTrace,
                       |            |     |                                    findCounterexample)
                       |            |     +--> modules/core/tutorials/TutorialTab
                       |            |     |         +--> tutorials/*Data.js
                       |            |     +--> lab/Shell  (shared chrome)
                       |            +--> lab/engine.js  (algorithms, parseInput,
                       |                              playbackReducer, makeDataset)
                       |                   |
                       |                   +--> modules/core/algorithm/sorting/algorithms/*.js
                       |                        (bubble, selection, insertion, merge, quick, heap)
                       v
                  lab/Shell  <-- also used by lab/ModuleFrame, which wraps all legacy modules

    Cross-cutting:  styles/global.css (main.jsx, App.jsx)
                    index.css (main.jsx)  -> @tailwind directives -> tailwind.config.js content globs
                    lab/lab.css (Shell)   lab/modules.css (ModuleFrame)   lab/lesson.css (TutorialTab)
```

:::note The structural fact worth noting aloud
`engine.js` is the only file that imports all six sorting generators. It is a deliberate boundary: everything above it (React components) knows nothing about how frames are made, and everything below it (generators) knows nothing about React. That is why the algorithms are testable in plain Node with no DOM shim. [VERIFIED]
:::

## 6.5 The two execution models side by side

This table is the single most useful thing to have memorised, because "why is your app inconsistent?" is a real question you will be asked.

| Property | Generation 2: the lab | Generation 1: the twelve modules |
| --- | --- | --- |
| Where frames are created | In `engine.js` via generator functions that return the whole array | Inside the component, via `generateXAnimations()` |
| When the UI updates | On cursor change | Inside an `async` loop after `await smartWait(...)` |
| Pause mechanism | `playing: false` in a reducer | `isPausedRef` checked in a 20 ms polling loop |
| Rewind / seek | Supported | Not supported |
| Speed control | `setTimeout` delay | `speedRef.current = 2100 - curspeed` |
| Testable in Node | Yes | Partly — the logic module is, the component is not |
| Duplicate-run protection | N/A — the effect owns one timer | `if (isVisualizing) return;` guard |
| State location | One reducer + `useState` | 15–20 `useState` hooks per component |

:::inference Why the legacy code looks like that
[INFERENCE] The stored animation array plus `await`-in-a-loop is the natural first way most developers write a visualiser, and it is exactly the design the lab was built to replace. Keeping it is a deliberate engineering decision — the non-sorting visualisations work, and rewriting twelve of them carries regression risk with no test coverage to catch it. The README says as much: "The shared UI covers all modules; the shared sorting playback reducer does not yet cover every algorithm family."
:::

---

# 07 · Important files you must know

> The table to print out. For each file: purpose, inputs, outputs, state, dependencies, the functions to know, and the question you will be asked.

## 7.1 `src/lab/engine.js` — 169 lines — RED

| Aspect | Detail |
| --- | --- |
| Purpose | The non-React core: algorithm registry, input validation, playback state machine, seeded datasets, the sliding-window reference implementation, and the bounded counterexample search |
| Imports | The six sorting generators only |
| Exports | `algorithms` (object of 6), `parseInput`, `playbackReducer`, `makeDataset`, `windowTrace`, `findCounterexample` |
| State | None. Every export is pure — no module-level mutable state, no I/O |
| Read by | `SortingLab.jsx` (registry, parse, reducer, datasets), `Counterexample.jsx` (`windowTrace`, `findCounterexample`), `tests/engine.test.js` (everything) |
| Functions to know | `parseInput` (validation contract), `playbackReducer` (4 cases), `makeDataset` (LCG + 4 kinds), `windowTrace(values, target, buggy)` (two behaviours in one function), `findCounterexample` (bounded 4³ × 8 search) |
| Likely question | "Walk me through `parseInput`. Why does it split on commas before validating?" |
| Likely follow-up | "Why is `windowTrace` allowed to be buggy?" — because differential testing needs a deliberately wrong implementation to prove the test can detect divergence |

## 7.2 `src/lab/SortingLab.jsx` — 596 lines — RED

| Aspect | Detail |
| --- | --- |
| Purpose | The entire Sorting Lab screen: input panel, transport, stage, inspector, comparison, notes, saved experiments |
| Local components | `ArrayView({frame, compact})` and a module-level `download(data)` helper |
| State | 12 `useState` + 1 `useReducer` + 2 `useRef` (see the state register in Ch. 8) |
| Effects | (1) playback timer, (2) keyboard listener — both with cleanup |
| Derived values | `frames`, `otherFrames`, `cursor`, `frame`, `meta`, `stats`, `last`, `compareCursor`, `initial` |
| Handlers | `load`, `apply`, `importExperiment`, `save`, `seek` |
| Reads from URL | `?algorithm=` (validated against the registry), `?compare=` |
| Likely question | "Why is there both `text` and `input` state?" |
| Likely follow-up | "Why is the timer dependency array `[playing, cursor, speed]` and not just `[playing]`?" |

## 7.3 The six generators — RED

All six share the same shape, which is itself a talking point: `rawArray -> [{id:'block-i', val}] -> frames[]`, with a local `cloneArray()` used on every push.

| Generator | Lines | Frames pushed at | Distinctive machinery |
| --- | --- | --- | --- |
| `generateBubbleSort` | 92 | ready, each outer pass, each `inner` scan, each `compare`, each `swap` before + after, each pass-complete, final | `sortedIndices.push(n - i - 1)` after each pass; `isSwapping` toggles around the swap |
| `generateSelectionSort` | 73 | ready, each pass start, each `inner` scan, each `new_min`, each `swap` before + after, each `lock`, final | `minimumIndex` carried in every frame; loop runs to `n-1`, then `sortedIndices.push(n-1)` |
| `generateInsertionSort` | 86 | ready, each lift, each `compare`, each shift before + after, `break`, `drop`, final | `isLifting` flag on the lifted element; the only generator with an explicit early-`break` frame |
| `generateMergeSort` | 172 | ready, each `divide`, `base_case`, `mid`, `recurse_left`, `recurse_right`, `merge_call`, `buffer`, each `compare`, each write, `write_rem`, remaining-element pushes, final | Recursion; a temporary buffer; `yOffset` set to 80 while elements are "in the buffer"; a single final loop marking every index sorted |
| `generateQuickSort` | 160 | ready, each call, `base_case` (marks the index sorted when `low === high`), `partition`, each `compare`, each conditional swap, pivot placement, `recurse_left`, `recurse_right`, final | `pivotIndex` in most frames; the pivot index is pushed to `sortedIndices` immediately after partition |
| `generateHeapSort` | 120 | ready, `build_heap`, per-heapify `pointers` + `compare_children` + optional swap + recurse, `extract`, per-extraction `swap_root` + `heapify_root`, final | Recursive `heapify`; two comparison increments per call; `phaseMsg` distinguishes "Building Heap" from "Extracting" |

## 7.4 The support files — YELLOW

| File | Purpose | Inputs → Outputs | Likely question |
| --- | --- | --- | --- |
| `src/main.jsx` | Entry point | — → mounted `<App/>` inside `StrictMode` | "What does `StrictMode` do to your effects in development?" |
| `src/pages/Home.jsx` | Router, routes, lazy imports, Suspense fallback, 404 | URL → matched element | "What happens on a direct visit to `/lab`?" |
| `src/lab/Shell.jsx` | Sidebar, top bar, footer, `window.scrollTo(0,0)` on path change | `children` → page chrome | "Why does the sidebar compute `pageName` from `pathname` instead of props?" |
| `src/lab/Overview.jsx` | Landing + library grid | `library` prop → different heading and hero | "How does one component serve two routes?" |
| `src/lab/Counterexample.jsx` | Prediction → reveal → divergence display → bounded search | `findCounterexample()` → example, `revealed`, `searched` | "How do you know the first divergence is meaningful?" |
| `src/lab/ModuleFrame.jsx` | Breadcrumb, module switcher (`navigate`), Visualize/Learn toggle | tab props → framed module content | "Why does the module switcher use `navigate` instead of `<Link>`?" |
| `src/constants.js` | Module metadata for the library and navigation | — → 12 module descriptors | "Where does `/modules/patterns/bs-variants` come from?" |
| `tests/engine.test.js` | All automated verification | generator modules → pass/fail | "Point at the 150. Point at the 768." |
| `.github/workflows/ci.yml` | CI pipeline | push/PR → 4 steps | "What happens if `npm test` fails?" |

## 7.5 The files you must be able to *name* but not explain — GREEN

`src/modules/**` (12 visualisations + 13 logic modules + 10 tutorial data files + `TutorialTab.jsx`), `src/lab/lab.css` (1,756 lines), `modules.css`, `lesson.css`, `global.css`, `src/components/*` (dead), `docs/*`, `vercel.json`, `.nvmrc`, `postcss.config.js`, `public/favicon.svg`.

:::check The 20-file drill
Open a terminal and run this. If you can say one accurate sentence about every line it prints, you have passed the file-level part of the interview.

```
find src tests .github -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.yml' \) | sort
```
:::
