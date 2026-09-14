# AlgoViz — The Algorithm Laboratory

**Don't just watch. Understand the why.**

A local-first algorithm workspace by **Siva Charan K.G.** Built with the original React, JavaScript, React Router, Tailwind CSS and Vite/Rolldown stack. No backend, account, AI API, or paid service is required.

## Run locally

Use Node **22.12+** (Node 22 LTS recommended).

```bash
npm ci
npm run dev
```

Open the address printed by Vite. The development server binds to all interfaces for hosted previews; do not expose it to an untrusted public network. Production deployments should serve `dist`, not the development server.

```bash
npm test           # 14 Node-native test groups, including generated cases
npm run lint       # whole repository
npm run lint:lab   # strict checks on the new workspace
npm run build
npm run preview
```

## What's new

### Sorting laboratory — `/lab`

- Six existing algorithm generators: bubble, selection, insertion, merge, quick and heap.
- Play/pause, restart, step forward/back and a seekable execution timeline.
- Final states stay visible. Playback timers are cleaned up on pause/unmount.
- Live array, active/sorted indices, pivot, explanation and counters.
- Comparison mode uses the same input and **actual recorded comparison counts**.
- Seeded random, sorted, reverse and duplicate-heavy datasets.
- Input validation: 2–24 integers, from −999 to 999. This intentionally bounds snapshot memory.
- Keyboard shortcuts: Space to play/pause, left/right arrows to step outside form controls.
- Save up to six experiments to this browser; restore the selected frame.
- Export/import versioned JSON experiments without an account.
- Original sorting tutorials and pseudocode remain available in expandable notes.

### Counterexample lab — `/counterexample`

A curated differential-testing case study: shortest positive-number window with sum **at least** a target. A reference implementation is compared with a buggy exact-match variant. Predict the result, inspect the first divergence, or search for a smaller failing input.

The bounded search enumerates positive arrays of length 1–3 with values 1–4 and targets 1–8. Its result is first by enumeration order, not a general proof of global minimality. There is no arbitrary-code execution or AI interpretation.

### Preserved library — `/library`

All twelve module routes remain. Sorting routes use the new laboratory. The remaining modules retain their algorithm-specific renderers inside the same shared workspace:

- Binary search; positional binary-tree preorder/inorder/postorder.
- N-Queens solver and interactive board.
- BFS and DFS pathfinding with editable walls.
- Palindrome/converging pointers; Move Zeroes; first/last occurrence.
- Prefix sums; shortest qualifying sliding window; merge intervals.

**Not implemented:** weighted Dijkstra, Floyd cycle detection, rotated-array search, tree level-order traversal, arbitrary-code execution, shared accounts, cloud persistence, Web Workers, compact event streaming.

## Architecture

```text
Validated input + algorithm selection
            ↓
Existing algorithm generator (bounded synchronous execution)
            ↓
Deterministic full-state frames
            ↓
Playback reducer: cursor / length / playing
            ↓
React array renderer + inspector + explanation
            ↘
             localStorage / versioned JSON export
```

The counterexample lab uses two deterministic window traces and a bounded exhaustive input search. The existing library has not been fully migrated to the playback reducer.

```text
src/lab/
  Shell.jsx           Navigation and shared workspace shell
  Overview.jsx        Landing page and module directory
  SortingLab.jsx      Interactive laboratory and experiment persistence
  Counterexample.jsx  Prediction and differential-execution case study
  engine.js           Registry, validation, reducer, datasets, window traces
  lab.css             Scoped responsive workspace styles
src/modules/          Preserved algorithm pages, generators and tutorial data
src/pages/Home.jsx    Lazy-loaded route configuration
src/components/      Original reusable components
tests/engine.test.js Correctness, replay, validation and regression checks
```

## Unified interface

The overview, sorting lab, counterexample lab and all ten other modules share the same navigation, surface colors, typography, header hierarchy and accents. `src/lab/ModuleFrame.jsx` supplies module breadcrumbs, experiment switching and Visualize/Learn controls. Algorithm-specific diagrams and execution behavior are preserved.

Learning notes use a shared, responsive `TutorialTab`: section navigation, numbered steps, dry-run timelines, code panels and complexity cards. On smaller screens the N-Queens board appears before the console and the pathfinding grid scrolls horizontally instead of compressing its cells. All four navigation destinations remain visible on mobile.

## Correctness and reliability improvements

- Fixed the documented ≥-target sliding-window mismatch.
- Stable input-index IDs replace random IDs in all six sorting generators.
- Pathfinder computes on an isolated graph, not React state.
- Removed the misleading BFS-as-Dijkstra option.
- Pathfinder waits for actual completion, reports unreachable goals, measures path edges, and cleans up timers on navigation.
- Prefix-sum range validation now reports invalid ranges.
- Sorting/tree completion no longer intentionally resets final results to input.
- Route splitting, not a framework migration, reduces initial bundle cost.
- Updated dependency lockfile within the existing stack.
- Removed thousands of accidental nonbreaking-space indentation violations.

## Measurements and honest limitations

The audit baseline built a ~508 kB minified initial JavaScript bundle. The new lazy-routed build is about **249 kB**, before route chunks. Size varies with later changes. This is a bundle-size comparison, not a measured page-load speedup.

The comparison lab is **not a benchmark suite**. Animation duration is not execution time. Side-by-side frames align by trace percentage, not equivalent operations. Pass/call and exchange counters remain implementation-specific, so comparisons use comparison counts only. Heap sort's recursive heapify uses call-stack space.

Full snapshots are retained for clarity, bounded to 24 input values. No claims of handling thousands of elements. The classic non-sorting pages still use their legacy playback architecture; broader cancellation, validation and accessibility work remains. Existing tutorial prose should be reviewed before treating it as authoritative curriculum.

ESLint retains strict rules for the new lab. `react-hooks/set-state-in-effect` is explicitly disabled only for legacy `src/modules/**/*.jsx`, where editable inputs still synchronize to preview state. This is documented migration debt, not a claim those pages have all been refactored.

Saved data stays on the current origin/device and may be cleared by the browser. Export is the portable backup. Imported files are bounded to 16 KB and validated before replay. Do not put secrets in experiments.

## Deployment

Deploy `npm run build` output (`dist`) to a static host. Vercel SPA fallback configuration is included in `vercel.json`. Other hosts must rewrite application routes to `index.html` while serving assets normally. No environment variables required.

CI runs a clean install, tests, full lint and production build. See [the interview guide](docs/INTERVIEW-GUIDE.md) and [verification notes](docs/VERIFICATION.md).

## Next steps—not prerequisites for interviewing

1. Migrate one additional algorithm family to shared playback.
2. Add trace checkpoints/deltas and worker execution if raising input limits.
3. Expand counterexamples with independently validated reference implementations.
4. Only introduce persistence services when cross-device experiments become a real need.
