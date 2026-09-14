<div align="center">

# AlgoViz 2.0

### Don’t just watch. Understand the why.

An interactive algorithm laboratory for exploring execution,
comparing strategies, and challenging assumptions.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Explore_AlgoViz-b9f67a?style=for-the-badge&logo=vercel&logoColor=black)](https://algoviz-2-0.vercel.app/)
[![Source Code](https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Siva2583/Algoviz-2.0)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Rolldown-646CFF?style=flat-square&logo=vite&logoColor=white)

[Live App](https://algoviz-2-0.vercel.app/) ·
[Sorting Lab](https://algoviz-2-0.vercel.app/lab) ·
[Counterexample Lab](https://algoviz-2-0.vercel.app/counterexample) ·
[Algorithm Library](https://algoviz-2-0.vercel.app/library)

</div>

---

## Overview

Watching an algorithm finish is not the same as understanding it.

AlgoViz makes intermediate decisions visible: which elements are compared, how search boundaries move, why a branch is rejected, and where an incorrect assumption changes the answer.

The project began as a collection of algorithm visualizations. Version 2.0 builds on that foundation with an interactive sorting laboratory, recorded-state replay, comparison mode, locally saved experiments, and a counterexample-based learning exercise.

The central workflow is simple:

```text
Choose an input
      ↓
Predict what happens
      ↓
Execute and inspect
      ↓
Compare or change an assumption
      ↓
Experiment again
```

**AlgoViz is currently a client-side React application.** Built-in algorithms run in the browser. No backend, account, database service, or AI API is required.

## Contents

- [Try It in Two Minutes](#try-it-in-two-minutes)
- [Key Features](#key-features)
- [Algorithm Library](#algorithm-library)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Design Decisions](#design-decisions)
- [Current Limitations](#current-limitations)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Author](#author)

---

## Try It in Two Minutes

1. Open the [Sorting Lab](https://algoviz-2-0.vercel.app/lab).
2. Choose a reverse-sorted or duplicate-heavy dataset.
3. Play, pause, step backward, and drag the timeline to inspect a particular state.
4. Enable **Compare** and choose another algorithm to compare recorded comparison counts on the same input.
5. Visit the [Counterexample Lab](https://algoviz-2-0.vercel.app/counterexample), predict the answer, and inspect the decision that makes a buggy implementation fail.
6. Save an interesting sorting experiment locally or export it as JSON.

---

## Key Features

### 1. Sorting Laboratory

Explore six sorting algorithms:

**Bubble · Selection · Insertion · Merge · Quick · Heap**

The laboratory provides:

- Play and pause.
- Restart and replay.
- Step forward and backward.
- A seekable execution timeline.
- Final-state inspection after execution completes.
- Array values, active indices, sorted indices, and pivot information where applicable.
- Operation explanations and implementation counters.
- Algorithm intuition, invariants, and complexity notes.

Custom sorting inputs support **2–24 integers between −999 and 999**.

Available dataset presets include:

- Seeded random values.
- Sorted values.
- Reverse-sorted values.
- Duplicate-heavy values.

#### Keyboard controls

| Key | Action |
|---|---|
| `Space` | Play or pause |
| `←` | Step backward |
| `→` | Step forward |

Shortcuts apply when focus is outside form controls.

> Stepping backward selects an earlier recorded state. It does not execute JavaScript in reverse.

### 2. Algorithm Comparison

Run two sorting strategies against the **same dataset** and inspect their complete-run comparison counts.

This helps answer questions such as:

- How does input order affect this implementation?
- How do different algorithms behave on duplicate-heavy inputs?
- Does this strategy perform fewer comparisons on this particular dataset?

**Comparison mode is not a runtime benchmark.**

Animation duration is not execution time. Side-by-side previews align by percentage of trace completion, not by equivalent semantic operations.

Pass/call and exchange counters have implementation-specific meanings, so the comparison panel deliberately focuses on comparison counts.

### 3. Counterexample Lab

A working example does not prove an algorithm is correct.

The counterexample lab demonstrates this through a curated sliding-window problem:

> Find the shortest contiguous subarray whose sum is **at least** the target.

The exercise uses positive integers and a positive target. It compares a reference implementation against a variant that records only exact matches.

```text
Input: [2, 3]
Target: 4

Reference result: 2
Buggy result:     0
```

The difference comes from one condition:

```js
// Correct: every qualifying window can improve the answer.
if (sum >= target) {
  best = Math.min(best, right - left + 1);
}

// Buggy: larger qualifying sums are ignored.
if (sum === target) {
  best = Math.min(best, right - left + 1);
}
```

You can:

- Predict the correct result.
- Compare the two outputs.
- Inspect the first recorded divergence.
- Search for a smaller failing input within a bounded domain.

The search enumerates:

- Arrays of length **1–3**.
- Values between **1 and 4**.
- Targets between **1 and 8**.

The result is the first failure in the defined enumeration order—not a proof of global minimality, a general-purpose bug finder, or formal verification.

### 4. Local Experiments

Keep interesting sorting inputs without creating an account:

- Save the latest **six experiments** in the current browser.
- Restore the selected algorithm, input, and frame position.
- Export experiments as versioned JSON.
- Import validated experiment files up to **16 KB**.

Saved experiments use `localStorage`.

They do not automatically sync between devices or domains, and browser storage can be cleared. JSON export provides a portable backup.

### 5. Consistent Learning Workspace

The overview, dedicated labs, and algorithm modules share:

- Navigation and page structure.
- Typography, colors, panels, and controls.
- Module breadcrumbs and an experiment switcher.
- **Visualize / Learn the concept** views on individual modules.
- Responsive layouts.

Learning notes include:

- Concept explanations.
- Numbered execution steps.
- Dry-run examples.
- Pseudocode.
- Time and space complexity.
- Common mistakes and pattern-recognition guidance.

On smaller screens, the N-Queens board appears before its console, and the pathfinding grid scrolls horizontally rather than compressing its cells.

---

## Algorithm Library

The library contains **12 module entries**. Some entries contain multiple algorithms.

| Module | Implemented Behavior |
|---|---|
| **Simple Sorts** | Bubble, Selection, and Insertion Sort |
| **Efficient Sorts** | Merge, Quick, and Heap Sort |
| **Binary Search** | Iterative search with left, middle, and right bounds |
| **Pathfinder** | BFS and DFS on a grid with editable walls |
| **Tree Traversals** | Preorder, inorder, and postorder traversal |
| **N-Queens** | Backtracking visualization and an interactive placement board |
| **Two Pointers** | String/palindrome-style converging-pointer checks |
| **Fast & Slow Pointers** | Move Zeroes using read/write-style pointers |
| **Binary Search Variants** | First and last occurrence search |
| **Prefix Sum** | Prefix construction and inclusive range-sum queries |
| **Sliding Window** | Shortest qualifying positive-number window with sum ≥ target |
| **Merge Intervals** | Sorting and merging overlapping intervals |

### Important distinctions

- Tree inputs represent an **array-indexed binary tree**, not automatic BST insertion.
- The Fast & Slow module demonstrates **Move Zeroes**, not Floyd’s cycle detection.
- BFS finds a shortest path on the unweighted grid.
- DFS discovers a path that is **not necessarily shortest**.
- Sorting routes use the shared laboratory; the other modules retain their algorithm-specific execution implementations.

---

## Architecture

### Sorting: Execution Is Separate from Playback

```text
Input + algorithm selection
            │
            ▼
Input validation
            │
            ▼
Bounded synchronous algorithm execution
            │
            ▼
Recorded frames with stable element identities
            │
            ▼
Playback reducer
{ cursor, length, playing }
            │
            ├── Array renderer
            ├── State inspector
            ├── Operation explanation
            └── Timeline and transport controls
```

The algorithm generates frames before playback begins. React renders the frame selected by the playback cursor.

This separation allows the same recorded execution to be paused, replayed, inspected, or revisited without rerunning the algorithm for every playback action.

Element IDs are assigned from original input positions and travel with their elements during sorting. Equal values remain distinguishable, and repeated runs of the same implementation and input produce reproducible traces.

A React effect schedules playback advances and cleans up its timer when the effect is replaced or the component unmounts.

### Counterexamples: Differential Execution

```text
Bounded input enumeration
            │
            ├── Reference implementation → result + trace
            │
            └── Buggy variant            → result + trace
                              │
                              ▼
                    Detect result mismatch
                              │
                              ▼
                   Inspect first divergence
```

The reference and buggy variant are predefined implementations. The application does not interpret arbitrary pasted code.

### Persistence

```text
Algorithm + input + cursor
            │
            ├── localStorage
            └── Versioned JSON export/import
```

The shared visual system applies across the project, but **not every algorithm module has been migrated to the sorting playback reducer**.

---

## Technology Stack

| Area | Technology |
|---|---|
| UI | React 19 |
| Language | JavaScript / JSX |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 3 and scoped custom CSS |
| Icons | Lucide React |
| Build tooling | Vite using the `rolldown-vite` package alias |
| State | React hooks, local component state, and a sorting playback reducer |
| Local persistence | Browser `localStorage` and JSON files |
| Tests | Node.js `node:test` and `node:assert/strict` |
| Static checks | ESLint with React hooks and refresh rules |
| CI | GitHub Actions |
| Hosting | Vercel |

No Next.js, Redux, external animation framework, or application backend is required.

---

## Getting Started

### Prerequisites

- **Node.js 22.12 or newer**.
- npm, included with Node.js.

Node 22 matches the checked-in `.nvmrc` and CI configuration.

### Installation

```bash
git clone https://github.com/Siva2583/Algoviz-2.0.git
cd Algoviz-2.0
npm ci
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173
```

If you downloaded a ZIP instead, extract it and run the commands from the folder containing `package.json`.

> Do not open `index.html` directly or use VS Code Live Server. Vite is needed to process the application’s modules and JSX.

### Available Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate the production application in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run algorithm, reducer, validation, and regression tests |
| `npm run lint` | Run repository-wide ESLint checks |
| `npm run lint:lab` | Check the new workspace and route configuration |

### Windows / PowerShell

If PowerShell reports that script execution is disabled:

```powershell
npm.cmd ci
npm.cmd run dev
```

If `npm` is not recognized, install Node.js and restart your terminal or VS Code.

No environment variables or API keys are required. The development server binds to all interfaces for hosted previews; use it only in a trusted development environment.

---

## Project Structure

```text
Algoviz-2.0/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── INTERVIEW-GUIDE.md
│   └── VERIFICATION.md
├── public/
├── src/
│   ├── lab/
│   │   ├── Shell.jsx
│   │   ├── ModuleFrame.jsx
│   │   ├── Overview.jsx
│   │   ├── SortingLab.jsx
│   │   ├── Counterexample.jsx
│   │   ├── engine.js
│   │   ├── lab.css
│   │   ├── modules.css
│   │   └── lesson.css
│   ├── modules/
│   │   ├── core/
│   │   └── patterns/
│   ├── components/
│   ├── context/
│   ├── pages/
│   │   └── Home.jsx
│   ├── constants.js
│   └── main.jsx
├── tests/
│   └── engine.test.js
├── package.json
├── package-lock.json
├── vite.config.js
└── vercel.json
```

### Key Files

| File | Responsibility |
|---|---|
| `src/lab/engine.js` | Algorithm registry, validation, playback reducer, dataset generation, and counterexample helpers |
| `src/lab/SortingLab.jsx` | Sorting workspace, comparison, transport controls, and experiment persistence |
| `src/lab/Counterexample.jsx` | Prediction exercise and differential-execution interface |
| `src/lab/Shell.jsx` | Shared navigation and page shell |
| `src/lab/ModuleFrame.jsx` | Module headers, experiment switching, and view controls |
| `src/pages/Home.jsx` | Lazy-loaded application routes |
| `tests/engine.test.js` | Correctness, reproducibility, validation, and regression tests |

The original algorithm generators remain under
`src/modules/core/algorithm/sorting/algorithms/`, including some non-sorting logic. That naming is legacy organization and is a candidate for incremental cleanup.

---

## Testing

The current automated suite contains **14 test groups**, including generated cases.

### Covered Areas

**Sorting**
- Expected final ordering.
- Original input preservation.
- Reproducible frames.
- Final element-ID uniqueness.
- Edge cases and 20 seeded datasets per sorting algorithm.

**Playback**
- Cursor bounds.
- Completion-state retention.
- Replay behavior.
- Pausing when seeking.

**Validation and Regression**
- Invalid sorting inputs.
- Reproducible dataset generation.
- Sliding-window ≥-target regression.
- Reproducible counterexample search.
- Window reference checked against a brute-force oracle for **64 arrays × 12 targets**.
- Pathfinder input preservation, repeatability, reachability, and a shortest-path case.
- Prefix-sum full-range calculation and invalid-range handling.

Run the checks with:

```bash
npm test
npm run lint
npm run build
```

The checked-in GitHub Actions workflow runs these checks after `npm ci`.

Additional browser smoke checks have covered playback, saving/importing experiments, counterexample interactions, module controls, and responsive learning views.

**Testing boundaries:** these checks are not exhaustive correctness proofs, a repository-contained automated browser regression suite, or a WCAG certification.

See [`docs/VERIFICATION.md`](docs/VERIFICATION.md) for more detail.

---

## Design Decisions

### Preserve Working Algorithm Code

The sorting laboratory reuses existing generators instead of replacing every implementation. Playback and inspection were improved around that foundation.

### Prefer Explicit Playback State

A reducer makes transport transitions easier to reason about and test than unrelated booleans and duplicated animation loops.

### Use Full Frames—for Now

Full recorded frames make inspection and rewind straightforward.

The trade-off is memory: copying an entire array for many operations can produce substantial trace storage. Sorting input limits are intentional, not an indication that the engine supports arbitrarily large datasets.

### Compare Operations Honestly

Animation speed is controlled for learning, so it cannot serve as an execution-time measurement. Comparison mode uses recorded comparison counts rather than presenting misleading timing results.

### Keep Persistence Local

Local saves and JSON export provide useful experiment persistence without introducing authentication or backend infrastructure before it is necessary.

### Load Modules on Demand

Visualization routes are lazy-loaded so the application does not need to download every module’s JavaScript at startup.

---

## Current Limitations

AlgoViz is an evolving learning project. Its boundaries are explicit:

- **No arbitrary-code execution.** Users cannot paste JavaScript, Java, or Python and generate a trace.
- **No AI tutor.** Explanations come from built-in messages and tutorial content.
- **No backend or cloud synchronization.** Saved experiments belong to the current browser and origin.
- **No Web Worker execution yet.** Sorting traces are generated synchronously on the main thread.
- **No large-input scalability claim.** The sorting lab uses full snapshots and a 24-element input cap.
- **Playback migration is incomplete.** Non-sorting modules still have separate execution and state-handling implementations.
- **Not a performance benchmarking platform.** There are no runtime distributions or attributed heap-memory measurements.
- **Exported cursors are implementation-dependent.** Experiments do not archive an entire engine version; future changes to frame order can affect where an old cursor points.
- **Accessibility work is ongoing.** Responsive layouts and keyboard controls do not constitute full accessibility compliance.
- **Tutorial material remains open to correction.** It is educational guidance, not a formally reviewed curriculum.

Weighted Dijkstra, Floyd cycle detection, rotated-array search, and tree level-order traversal are **not currently implemented features**.

The ESLint configuration also explicitly disables `react-hooks/set-state-in-effect` for legacy `src/modules/**/*.jsx`, where input-to-preview synchronization still uses effects. New lab code retains the stricter rule.

---

## Deployment

### Live Application

**https://algoviz-2-0.vercel.app/**

### Vercel Configuration

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | 22.x |

The included `vercel.json` configures the single-page application fallback so routes such as `/lab` work when opened directly.

Other static hosts need an equivalent route fallback while continuing to serve assets normally.

---

## Roadmap

The next steps focus on strengthening the existing learning workflow:

- [ ] Migrate another algorithm family to the shared playback model.
- [ ] Introduce compact trace events and checkpoints.
- [ ] Add worker execution before increasing input limits.
- [ ] Expand curated counterexamples with independently checked reference implementations.
- [ ] Improve keyboard, screen-reader, and touch interaction coverage.
- [ ] Add an automated browser regression suite.
- [ ] Gradually reorganize algorithm files by domain.

These are planned improvements, not current capabilities.

Backend services or AI would only be added if they meaningfully improve experimentation, explanation, or reproducibility.

---

## Contributing

Useful contributions include:

- A reproducible correctness bug.
- A clearer algorithm explanation.
- A failing regression test.
- An accessibility improvement.
- A focused rendering or playback fix.

For bug reports, include:

1. The module or route.
2. The exact input.
3. Expected behavior.
4. Actual behavior.
5. Reproduction steps.

Before submitting a change:

```bash
npm test
npm run lint
npm run build
```

Keep changes focused. Avoid mixing algorithm-semantic changes and visual redesigns in the same patch unless necessary.

---

## Author

**Siva Charan K.G.**

[GitHub](https://github.com/Siva2583) ·
[LinkedIn](https://www.linkedin.com/in/siva-charan-kg-72a900284/) ·
[Live AlgoViz](https://algoviz-2-0.vercel.app/)

---

<div align="center">

**Change the input. Question the outcome. Understand the algorithm.**

</div>
