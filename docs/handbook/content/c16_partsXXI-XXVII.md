%PART: The toolchain | PARTS XXI–XXVII | CI, Vite, React Router, Tailwind, the JavaScript that actually matters, performance, and the real trust boundaries.

# 47 · GitHub Actions, line by line

> Fifteen lines of YAML that enforce the same three commands you run locally.

## 47.1 The workflow

@@code .github/workflows/ci.yml

| Line | Meaning | Why it is there |
| --- | --- | --- |
| `name: Verify AlgoViz` | The workflow's display name | Shows in the Actions tab and on PR checks |
| `on: [push, pull_request]` | Triggers on every push to any branch, and every PR | Deliberately broad: a push to a feature branch gets verified before it becomes a PR. The cost is duplicate runs when a push is part of an open PR |
| `runs-on: ubuntu-latest` | A fresh GitHub-hosted Linux VM per run | No state carries between runs — a clean-room guarantee |
| `actions/checkout@v4` | Clones the repository into the runner | Pinned to a major version tag — the conventional practice; the rigorous version is a full commit SHA pin, which defends against a compromised tag |
| `actions/setup-node@v4` with `node-version: 22` | Installs Node 22 | Matches `.nvmrc` (`22`) and `engines.node: ">=22.12.0"` — three places agree on the runtime version |
| `cache: npm` | Caches the npm download cache keyed on the lockfile | Makes `npm ci` fast without skipping installation |
| `npm ci` | Clean, reproducible install straight from `package-lock.json` | The critical choice: `npm ci` **fails** if the lockfile and `package.json` disagree, and it deletes `node_modules` first. `npm install` would silently update the lockfile and hide drift |
| `npm test` | `node --test tests/*.test.js` | Fails the job on any failing assertion |
| `npm run lint` | `eslint .` | Fails on any lint error |
| `npm run build` | `vite build` | Fails if the app cannot be bundled |

:::must Why `npm ci` matters, and how to say it
"`npm ci` is the CI-correct install: it requires the lockfile to be in sync with `package.json`, it removes `node_modules` first so nothing can leak in from a previous run, and it installs the exact resolved versions rather than the newest matching a semver range. `npm install` in CI would happily *update* the lockfile and mask a version drift that would break a teammate's machine. The one-line version: **`npm ci` verifies the lockfile; `npm install` edits it.**"
:::

## 47.2 The pipeline as a gate

```
   push / pull_request
          |
          v
   ubuntu-latest  ->  checkout  ->  setup-node 22 (with npm cache)
          |
          v
   npm ci  ............ fails if lockfile != package.json
          |
          v
   npm test .......... 14 groups; the 150 cases and the 768 comparisons
          |            (exits non-zero on the first failure)
          v
   npm run lint ..... eslint flat config, whole repository
          |
          v
   npm run build .... vite build -> dist/
          |
          v
   PASS  ->  green check on the commit / PR
   FAIL  ->  red check, and the job stops at the first failing step
```

**Step order matters.** Tests run before lint and build: if a correctness test fails, you learn that first, and you do not wait for a build to discover it. Build runs last because it is the slowest and the least specific.

## 47.3 What CI catches, and what it cannot

| CI catches | CI cannot catch |
| --- | --- |
| A generator change that breaks sorted output, purity, determinism or ID uniqueness | A rendering bug — nothing in CI renders a component |
| A reducer change that breaks cursor bounds or the pause-on-seek rule | A CSS regression, a broken layout, a contrast problem |
| A validation change that lets through `"1,"`, `"2.5"`, `"1,1000"` or 25 values | A stale closure, a missing cleanup, or a timer bug — none of these are reachable without a DOM and a clock |
| A dependency or lockfile drift | A runtime error in a route that is never executed by tests |
| Lint violations (unused variables, hook-dependency mistakes, react-refresh export rules) | Anything about the twelve legacy modules' *behaviour* — only pathfinding and prefix sum are exercised |
| A build break: a bad import path, invalid JSX, a missing module | A broken user flow that type-checks and builds fine |
| A failing snapshot of the sliding-window regression | Whether the UI actually shows what the code intends |

:::answer "So a green CI build could still contain bugs?"
"Absolutely, and I can name the bug classes it would sail past. CI runs tests, lint and build — none of which touch a browser. So a green run tells me that the engine behaves, that the code satisfies the lint rules, and that it compiles. It says nothing about whether the playback effect schedules one timer or three; whether the keyboard listener accumulates; whether `ArrayView` renders the merge sort buffer correctly; whether a saved experiment reloads; whether the layout holds at 390 px.

There's a concrete example in this project. The merge-sort duplicate-key frames — 23 of 107 frames on the default input — pass CI completely, because the test asserts ID uniqueness on the *final* frame and the duplicate ids only occur in the intermediate `write_left`/`write_right` frames. And no test renders a component, so React would warn about duplicate keys only in a browser. If I wanted CI to catch that class of bug, I'd need to add a component test with a DOM environment, or a browser test driver, or at minimum a property test that asserts ID uniqueness across *every* frame rather than just the last — and that third option is the cheapest, so it's the first thing I'd add."
:::

## 47.4 The CI questions

:::q "Why GitHub Actions?"
"Because the checks were already npm scripts and the repository was already on GitHub. The workflow is fifteen lines: checkout, set up Node, install, then run the three commands I run locally. There's no service to host, no runner to maintain, no configuration beyond a YAML file — and for a public repository the minutes are free. A more heavyweight choice like Jenkins would have meant running and securing a server to execute three shell commands."
:::

:::q "What happens when a test fails?"
"The `npm test` step exits with a non-zero status, GitHub marks that step failed and stops the job — so lint and build do not run. The check appears against the commit and any PR, red, with the failing assertion printed in the log. If branch protection were enabled, a red check would block the merge."
:::

:::q "Can the build pass while the UI is broken?"
"Yes, in at least four ways. A component can throw at runtime on a route the tests never visit. A CSS change can make the layout unusable without failing anything. An effect can have a stale-closure bug that only manifests when you interact. Or a feature can be entirely absent — nothing asserts that a button exists or does what its label says. Build success means 'the bundler resolved every import and transformed every module'; it says nothing about behaviour."
:::

:::q "Why does the workflow run on `push` and not just `pull_request`?"
"A push trigger verifies every commit, including ones pushed directly to a branch before a PR exists, so a broken commit is caught within a minute rather than at review time. The cost is that a branch with an open PR gets two runs — one for the push and one for the PR event. If I wanted to trim the cost, I'd restrict the push trigger to the default branch."
:::

:::q "Is anything in the workflow pinned for supply-chain safety?"
"Partially. The actions are pinned to major-version tags (`@v4`), which is the community norm but not the hardened choice — a tag can be retargeted by a compromised maintainer, and the rigorous practice is to pin a full commit SHA. Node is pinned precisely, to 22, matching `.nvmrc` and `engines`. Dependencies are pinned through `package-lock.json` with `npm ci`. So the dependency graph is reproducible; the workflows are not yet hardened. That's an honest gap rather than a design decision." [PROPOSED: SHA-pin the actions]

:::
---

# 48 · Vite, in the amount this project needs

> Dev server, build pipeline, and the one detail that makes this repository unusual: the Rolldown alias.

## 48.1 The scripts

| Script | Command | What it does |
| --- | --- | --- |
| `npm run dev` | `vite` | Starts the dev server with native ESM and on-demand transform; no bundling until a request arrives |
| `npm run build` | `vite build` | Produces the production bundle in `dist/` |
| `npm run preview` | `vite preview` | Serves the built output locally, to check the production artefact |
| `npm test` | `node --test tests/*.test.js` | **Not Vite.** Node runs the tests directly |

## 48.2 The measured production build

I ran `npm run build` in this repository. The output is the most concrete Vite artefact you can quote:

```
rolldown-vite v7.2.5 building client environment for production...
transforming... ✓ 1736 modules transformed.
dist/index.html                         0.66 kB │ gzip:  0.40 kB
dist/assets/TutorialTab-*.css           6.19 kB │ gzip:  1.79 kB
dist/assets/ModuleFrame-*.css           8.55 kB │ gzip:  2.14 kB
dist/assets/index-*.css                72.37 kB │ gzip: 14.03 kB
dist/assets/ModuleFrame-*.js            3.87 kB │ gzip:  1.72 kB
dist/assets/TutorialTab-*.js            5.58 kB │ gzip:  1.92 kB
dist/assets/Counterexample-*.js         5.84 kB │ gzip:  2.24 kB
dist/assets/TwoPointers-*.js           12.44 kB │ gzip:  4.42 kB
dist/assets/FastSlowPointers-*.js      13.74 kB │ gzip:  4.39 kB
dist/assets/BinarySearch-*.js          16.40 kB │ gzip:  5.16 kB
dist/assets/SlidingWindow-*.js         16.76 kB │ gzip:  5.31 kB
dist/assets/MergeIntervals-*.js        17.01 kB │ gzip:  5.34 kB
dist/assets/PrefixSum-*.js             17.28 kB │ gzip:  5.68 kB
dist/assets/PathFinder-*.js            18.41 kB │ gzip:  6.29 kB
dist/assets/engine-*.js                18.65 kB │ gzip:  3.92 kB
dist/assets/Nqueens-*.js               18.69 kB │ gzip:  6.13 kB
dist/assets/TreeTraversal-*.js         20.16 kB │ gzip:  6.15 kB
dist/assets/BinaryVariants-*.js        20.43 kB │ gzip:  5.83 kB
dist/assets/SortingLab-*.js            29.85 kB │ gzip: 10.64 kB
dist/assets/index-*.js                251.78 kB │ gzip: 80.90 kB
✓ built in 1.18s
```

(The chunk sizes are stable across runs; the total build time is not — it moves by a few tenths of a second depending on the machine and what is already warm. Quote it as "about a second", not as a decimal.)

:::must How to read that output in an interview
**"1,736 modules transformed, 19 emitted asset files — sixteen JavaScript chunks and three stylesheets — in about a second."** Then three observations:

1. **The initial bundle is 251.78 kB / 80.90 kB gzipped** — that is React, React DOM, React Router and Lucide, plus the shell and the overview. Nothing else is in it.
2. **Every heavy module has its own chunk** — `SortingLab` is 29.85 kB, and the twelve legacy modules range from 12 to 20 kB. That is `React.lazy` doing real work: a visitor to the landing page never downloads the N-Queens solver or the pathfinder. This is the kind of claim you can only make because you measured it.
3. **`engine.js` gets its own 18.65 kB chunk**, shared between `SortingLab`, `Counterexample` and the test-adjacent code paths. That is a Rollup/Rolldown-level consequence of the module boundary: `engine.js` imports the six generators and nothing else imports them directly.
:::

## 48.3 The Rolldown alias — the detail that shows you read your own config

```json
"devDependencies": {
  "vite": "npm:rolldown-vite@7.2.5"
},
"overrides": {
  "vite": "npm:rolldown-vite@7.2.5"
}
```

[VERIFIED] This is an npm **alias**: the package name `vite` resolves to the package `rolldown-vite` at version 7.2.5. `vite.config.js` still says `import { defineConfig } from 'vite'` and `import react from '@vitejs/plugin-react'`, and nothing in the config mentions Rolldown — because the alias does the substitution at install time.

Rolldown is the Rust-based bundler intended as Vite's eventual Rollup replacement; the `rolldown-vite` package is the drop-in bundle that swaps the bundler while keeping the Vite API.

:::danger What to say, and what not to say
**Do not say** "I built it with Rolldown" as if you had chosen a custom bundler, and do not claim any performance numbers for it.

**Do say:** *"Vite is aliased to `rolldown-vite` in `package.json` — the `vite` package name resolves to that instead. It's a drop-in: the config is still `defineConfig` with the React plugin, and the command is still `vite build`. The alias is duplicated in `overrides` to force every transitive dependency to the same version. It's an experiment with the new bundler rather than a requirement — nothing in the code depends on it, and I could revert by removing those two lines. What I can tell you is that the build transforms 1,736 modules in about 1.2 seconds, but I have not benchmarked it against the standard bundler, so I won't claim it's faster."*

That answer is unimpeachable: it states what the config does, why it is safe, and explicitly refuses to make a performance claim you have not measured.
:::

## 48.4 Vite questions

:::q "Is Vite your backend?"
"No — Vite is a development server and a bundler, and in this project it's used only for local development and for producing static files. In production there is no Node process at all: Vercel serves `dist/` as static assets. The `vite preview` server is a local convenience for checking the built output, not a deployable server."
:::

:::q "What happens during `npm run build`?"
"Vite resolves the module graph from `index.html`, transforms every JSX and CSS file through the plugin pipeline, resolves the seventeen dynamic `import()` calls into separate chunks, minifies and hashes the assets, and writes them to `dist/` along with a rewritten `index.html` whose script tag points at the hashed entry chunk. It also runs PostCSS and therefore Tailwind's content scan, which is why the CSS bundle contains only the utility classes actually used in source. The output is pure static files: an `index.html` and `assets/` containing hashed JS and CSS."
:::

:::q "What is the `vercel.json` rewrite for?"
"`{"rewrites":[{"source":"/((?!assets/|favicon.svg).*)","destination":"/index.html"}]}` — an SPA fallback. Because routing is client-side, a direct request to `/lab` would 404 on a static host, since no such file exists. The rewrite serves `index.html` for any path that is not a real asset, so the router can see the URL and render the right route. The negative lookahead keeps requests for hashed assets and the favicon out of the fallback."
:::

:::q "What are `server.host` and `allowedHosts` doing in your config?"
[VERIFIED] `{ host: '0.0.0.0', allowedHosts: ['.e2b.app'] }` in both `server` and `preview`. Binding to `0.0.0.0` makes the dev server reachable from outside the container rather than only on loopback, and `allowedHosts` permits the hostname pattern used by the hosted preview environment. The README also warns about it: "The development server binds to all interfaces for hosted previews. Use it only in a trusted development environment; production hosting should serve the built application." That is a **development-environment convenience with a documented security caveat**, not a production setting.
:::

:::q "Does the app use environment variables?"
"No. There is no `.env` file, no `import.meta.env` reference in the source, and the README states that no environment variables or API keys are needed. That is a natural consequence of having no backend and no third-party services — there is nothing to configure, and nothing to leak."
:::

---

# 49 · React Router, as this project uses it

> Sixteen routes, seventeen lazy imports, one Suspense boundary, two URL parameters.

## 49.1 The pattern

[VERIFIED] `BrowserRouter` (not `HashRouter`) wrapped around a single `Routes` block inside `Suspense`, in `src/pages/Home.jsx`. Router hooks used across the app: `useSearchParams` and `useLocation` in `SortingLab`, `useLocation` in `Shell` and `ModuleFrame`, `useNavigate` in `ModuleFrame`, and `Link`/`NavLink` for navigation.

| Hook / component | Where | What it reads or does |
| --- | --- | --- |
| `<BrowserRouter>` | `Home.jsx` | Provides history-based routing using the real URL path |
| `<Routes>` | `Home.jsx` | Matches the current location against the route list |
| `<Route path element>` | `Home.jsx` | Declarative route definition; `*` is the catch-all 404 |
| `<Suspense fallback>` | `Home.jsx` | Renders the loading page while a lazy chunk downloads |
| `<Link>` / `<NavLink>` | `Shell`, `Overview`, `ModuleFrame` | Client-side navigation; `NavLink` adds `active` state for the sidebar |
| `useSearchParams` | `SortingLab` | Reads `?algorithm=` and `?compare=` |
| `useLocation` | `Shell`, `SortingLab`, `ModuleFrame` | Reads `pathname` for titles, page names and default algorithm selection |
| `useNavigate` | `ModuleFrame` | Programmatic navigation from the module switcher `<select>` |

## 49.2 The URL parameters, precisely

| Parameter | Where it is read | Effect |
| --- | --- | --- |
| `?algorithm=<id>` | `SortingLab` line 63 | Sets the initial algorithm **only if** `Object.hasOwn(algorithms, value)` — an unknown value silently falls back to `bubble` (or `quick` on the advanced-sort route). So `?algorithm=hack` is safe |
| `?compare` | `SortingLab` line 74 | `params.has("compare")` — presence is enough, so `?compare=1`, `?compare=true` and `?compare=` all enable comparison mode. This is what makes the landing page's `/lab?compare=1` link work |

:::must The detail that will impress an interviewer
[VERIFIED] `initial` is computed like this:

```js
const initial = Object.hasOwn(algorithms, params.get("algorithm"))
  ? params.get("algorithm")
  : location.pathname.includes("advanced-sort")
    ? "quick"
    : "bubble";
```

Three things are happening. **First, the query parameter is validated against the registry** rather than trusted, so a hand-typed URL cannot put an unknown key into `algorithms[algo]` and crash the render with `Cannot read properties of undefined`. **Second, the precedence is deliberate:** an explicit `?algorithm=` beats the route's default, so `/modules/core/advanced-sort?algorithm=bubble` shows bubble sort. **Third, it is computed from `useSearchParams`, not `useState`** — but then stored in `useState`, which means changing the URL after mount does *not* change the algorithm. That is a real, subtle limitation: the parameter is an initial value, not a source of truth.

Note also that these are read **in the component body**, so the value is recomputed on every render — but since only the first render's value reaches `useState`, later recomputations are discarded. Harmless, and typical of this pattern.
:::

## 49.3 Client-side routing questions

:::q "Why client-side routing?"
"Because the application is already a client-side React app and every 'page' is a different view over the same data and the same engine. Client-side routing gives me three things a multi-page app would not: state survives navigation, so the shell and the shared CSS stay mounted; navigating between modules does not re-download the application; and the URL stays meaningful — `/modules/patterns/sliding-window` is a real, shareable, bookmarkable address, and `/lab?algorithm=quick&compare=1` restores a specific experiment configuration. The trade-off is that the server must serve `index.html` for unknown paths, which is what the `vercel.json` rewrite does."
:::

:::q "What happens when someone opens `/modules/patterns/prefix-sum` directly?"
"The static host has no such file, so the rewrite returns `index.html`. The browser parses that document and requests the entry JS chunk. React mounts, `BrowserRouter` reads `window.location.pathname` — which is still `/modules/patterns/prefix-sum` — and `Routes` matches it to the lazily imported `PrefixSum` component. React suspends while that chunk downloads and renders the `Suspense` fallback inside `Shell`; when the chunk resolves, the module mounts. Total extra round trips compared with an in-app navigation: the chunk fetch, unless it is already cached. No server-side rendering happens at any point."
:::

:::q "Why are sub-route paths so deep — `/modules/patterns/two-pointers`?"
"Because they encode a hierarchy that the UI actually mirrors: `Shell` groups the sidebar into workspace sections, `ModuleFrame` shows a breadcrumb with the category, and `constants.js` holds the same category field used in the library grid. It costs nothing at runtime — the path is just a string that has to match — and it makes the URLs self-describing. If I were optimising for brevity I'd flatten them, but then the breadcrumb would have to invent a category that the URL doesn't contain."
:::

:::q "What does the `key` on one of your routes do?"
"`<SortingLab key="advanced" />` on `/modules/core/advanced-sort`. Adding a distinct `key` makes React treat it as a different element from the `<SortingLab />` on `/modules/core/simple-sort`, so navigating between the two routes unmounts and remounts the component instead of reusing it. That matters because the initial algorithm is computed from `location.pathname` at mount time — without the key, the component would keep the algorithm it started with, and the advanced-sort route would still show bubble sort."

:::
---

# 50 · Tailwind, in three pages instead of thirty

> What it does in this project, where it is used, and the honest description of the split.

## 50.1 The configuration

@@code tailwind.config.js

@@code src/index.css

| Piece | Detail |
| --- | --- |
| Entry point | `src/index.css` — the only file containing `@tailwind` directives, imported by `main.jsx` |
| Content globs | `./index.html` and `./src/**/*.{js,ts,jsx,tsx}` — Tailwind scans source *text* for class-name candidates |
| PostCSS pipeline | `postcss.config.js` runs `tailwindcss` then `autoprefixer` |
| Theme customisation | None — `theme.extend` is empty, so only default Tailwind scales exist |
| Plugins | None |
| Output (measured) | `dist/assets/index-*.css` at 72.37 kB, 14.03 kB gzipped |

## 50.2 Where Tailwind is actually used — the honest split

| Area | Styling approach | Evidence |
| --- | --- | --- |
| `src/modules/**` (the twelve legacy visualisations) | **Tailwind utility classes**, heavily | e.g. `SlidingWindow.jsx` uses `flex flex-col md:flex-row justify-between items-center bg-gray-800/60 border border-gray-700 p-4 rounded-xl mb-4 gap-4 shadow-lg` on one element |
| `src/lab/**` (the lab, shell, overview, counterexample) | **Hand-written CSS** with an `av-` prefix | `lab.css` 1,756 lines, `modules.css` 505, `lesson.css` 419, `styles/global.css` 258 |
| Dead components | Tailwind classes | `CardsGrid.jsx` has a fully utility-styled footer — scanned by Tailwind and emitted into the CSS bundle, though the component is tree-shaken out of the JS |

:::must The sentence to use, and the sentence to avoid
**Avoid:** "AlgoViz is built with Tailwind CSS." It is technically defensible — Tailwind is a dependency and it ships — but it misrepresents the lab, which is the part of the project you want to talk about.

**Use:** *"Tailwind is in the stack and it styles the twelve module pages — that's where most of the utility classes are. The lab itself, which is the rebuilt part, uses scoped CSS with an `av-` prefix: about 1,750 lines in `lab.css`. I kept Tailwind for the modules to avoid rewriting them, and used plain CSS for the lab because I needed precise control over the bar geometry, the timeline and the responsive breakpoints. So it's two systems, and I'd call that a deliberate trade-off rather than a design."*

If pushed on whether two systems are a problem: *"It's a real cost — there are two places a style can live, and the bundle ships utilities for pages that are dead code. The benefit is that I didn't have to touch twelve working visualisations to rebuild the sixteenth screen. If I were starting over I'd pick one."*
:::

## 50.3 The three Tailwind facts that matter here

| Fact | Why it is relevant |
| --- | --- |
| Tailwind is a **build-time** tool, not a runtime library | There is no Tailwind JavaScript in the browser bundle. It runs during the build, scans source files for class names, and emits matching CSS rules. That is why `dist/assets/index-*.css` contains only the utilities used in source |
| The content globs decide what is emitted | A class name that appears nowhere in `index.html` or `src/**` produces no CSS. That is also why classes inside *dead* components are still emitted — the globs scan source text, and the files exist |
| `@tailwind base` includes Preflight, a CSS reset | It is imported by `index.css`, which `main.jsx` imports *after* `global.css` — so Tailwind's reset wins on conflicting base rules |

:::q "Why did the project use Tailwind at all?"
"Speed of iteration for the module pages. Twelve visualisations each need controls, grids, panels and responsive behaviour, and utility classes let those be built in place without inventing component CSS for each one. For the lab I wanted a small, explicit style vocabulary — the bars, timeline and panel chrome are all in one file with an `av-` namespace, which makes them easy to reason about and easy to change in one place."
:::

---

# 51 · JavaScript, only where it matters to AlgoViz

> Ten language features, each tied to a specific line in this repository.

| Concept | Where it appears in AlgoViz | Why it matters here |
| --- | --- | --- |
| **Arrays and objects** | `frames` is an array of objects; each element is `{id, val}` | The whole engine is array-of-object manipulation. Understanding that `.map` returns a new array while `arr[i] = x` mutates is the difference between a correct and a corrupt trace |
| **Spread for shallow copy** | `cloneArray = () => arr.map(item => ({...item}))`, `{...stats}`, `[...sortedIndices]`, `[...input]` | Three different copies with three different purposes: element objects, the counters, the bookkeeping lists. All three are shallow and all three are *sufficient* because the values inside are primitives |
| **Reference vs copy** | `useMemo(() => algorithms[algo].run(input), [algo, input])` | `input` is compared by reference, so `load()` must create a new array for the memo to recompute — which `parseInput` does |
| **Immutability** | The generators never mutate `rawArray`; `input` is only replaced | This is what the `assert.deepEqual(input, before)` test asserts, and what makes same-input comparison structurally valid |
| **`Array.prototype.map`** | `rawArray.map((val, i) => ({id: 'block-'+i, val}))`, every `cloneArray()` | The identity-assignment step and the per-frame clone |
| **`Array.prototype.at(-1)** | `frames.at(-1).currentStats`, `otherFrames.at(-1)` | Negative indexing, added in ES2022. Node 22 and all modern browsers support it |
| **`Array.prototype.includes`** | `frame.activeIndices?.includes(i)` | The O(n) membership test that drives every highlight. At n ≤ 24 it is free; at n = 100,000 it would be the bottleneck, and a `Set` would be the fix |
| **Closures** | The keyboard handler closing over `cursor`; the timer callback dispatching a constant action | The stale-closure trap and the deliberate avoidance of it |
| **Optional chaining / nullish** | `frame.codeLine?.replaceAll("_", " ")`, `event.target.files?.[0]`, `frame.array.map(...)` | Defensive reads on fields that only some generators emit. `pivotIndex ?? "—"` distinguishes "no pivot" from "pivot at index 0" — a bug `\|\|` would introduce |
| **`Object.hasOwn`** | `Object.hasOwn(algorithms, params.get("algorithm"))`, and twice in the save/import paths | The correct prototype-safe existence check. `key in obj` walks the prototype chain and would accept `"constructor"`; `obj[key] !== undefined` would accept nothing useful and reject nothing dangerous |
| **Template literals** | Every `msg` string; `` `block-${index}` `` | The explanation text is built at generation time, which is why the messages can contain the actual values |
| **`Number.isSafeInteger` / `Number.isInteger`** | `parseInput`, and the cursor guard on save/import | Distinguishes "a number" from "a whole number in the representable integer range". `Number.isInteger(2.5)` is false, which is what stops `frames[2.5]` |
| **JSON** | `JSON.stringify(next, null, 2)`, `JSON.parse(await file.text())`, `JSON.stringify(frame.activeIndices)` in the inspector | The persistence format and the display format |
| **ES modules** | `import`/`export` throughout; no `require` in `src/` | Enables tree-shaking: the six generators are only pulled into the `engine` chunk because `engine.js` imports them |
| **Timers** | `setTimeout` in the playback effect; `clearTimeout` in the cleanup; a `setTimeout` for `revokeObjectURL` | Discussed at length in Chapter 25 |
| **Async/await** | `await file.text()` in the import handler; no `async` anywhere in the engine | The engine is deliberately synchronous. Only file reading is async |

## 51.1 Three language questions AlgoViz makes concrete

:::q "Why is `{...item}` a sufficient clone for a frame element?"
"Because an element is `{id: string, val: number}` — two primitives. A shallow copy of a two-primitive object is a complete copy; there is no nested object that could still be shared. Insertion sort adds a third primitive (`isLifting`) and merge sort a fourth (`yOffset`), both primitives, so the shallow copy remains sufficient in all six generators. If I ever attached a nested object to an element — say a history array — the shallow copy would suddenly be insufficient and frames would share that nested object. That is the kind of change that would silently break the trace, and it is exactly the kind of thing a test asserting deep equality across runs would *not* catch. It would need a test that mutates a frame and checks that an earlier frame is unaffected."
:::

:::q "What's the difference between `pivotIndex ?? '—'` and `pivotIndex || '—'`?"
"`??` only falls back on `null` or `undefined`; `||` falls back on any falsy value — including `0`. Since the pivot index is 0 whenever the pivot is the first element, `||` would display '—' for a real pivot at index 0 and the app would look broken on a specific class of inputs. That's a one-character bug that only appears on some inputs, which makes it the worst kind. The code uses `??`, and it is the right choice here."
:::

:::q "Why `Object.hasOwn` rather than `in` or a truthiness check?"
"Because the key comes from a user-controlled string — a URL query parameter, or a field in an imported JSON file. `'constructor' in algorithms` is `true` because `in` walks the prototype chain, so `algorithms['constructor']` would resolve to a function. `Object.hasOwn` only checks own properties, so `'constructor'` and `'__proto__'` are correctly rejected. And `.run` would then be called on a function that has no `.run`, which is a crash. So the choice is the difference between a validation error and an unhandled exception on a crafted URL or a crafted file."

:::
---

# 52 · Performance: the real limits and the real fixes

> Measured numbers, the first thing that breaks, and the four-step plan to make it scale.

## 52.1 The measured baseline

| Quantity | Measured value |
| --- | --- |
| Worst trace the app can produce | 1,154 frames (bubble, reverse-sorted 24 elements) |
| Its serialised size | ~981 KB |
| Typical trace (default 8 elements, bubble) | 118 frames, ~49 KB |
| Generator runtime for the worst case | Milliseconds — well under one animation frame |
| Whole test suite | 226 ms for 14 groups including 150 sorting runs and 768 window cases |
| Production build | 1,736 modules, ~1.2 s, initial bundle 251.78 kB / 80.90 kB gzipped |
| Bundle for the lab route | 29.85 kB / 10.64 kB gzipped, downloaded only when visited |

## 52.2 Where the time actually goes (in order)

| # | Cost | When it happens | Why it is bounded today |
| --- | --- | --- | --- |
| 1 | **Frame generation** | Once per `(algorithm, input)` pair, synchronously | n ≤ 24, so at most ~29,000 element comparisons for the worst quadratic case *times* the copying overhead — milliseconds |
| 2 | **`cloneArray` allocations** | Per frame push, inside generation | Same bound; the dominant allocation source but still trivial at n = 24 |
| 3 | **Rendering a frame** | Every cursor change: ~6 times/second at 6× speed, or every frame while scrubbing | ≤ 24 columns, each a few DOM nodes |
| 4 | **`useMemo` cache misses** | When `algo` or `input` changes, or when `compare`/`other` change | Guarded by the memo; the second generator runs only in comparison mode |
| 5 | **The duplicated generator run in `load()`** | Every input change | A real 2× waste on the generation path; invisible at this scale |
| 6 | **The keyboard effect's re-registration** | Every cursor change (~6/s during playback) | A `removeEventListener`/`addEventListener` pair against `window` — microseconds |
| 7 | **`localStorage` writes** | On save only | Six small records |

:::must The performance sentence to lead with
"The input cap is a performance decision, not an arbitrary restriction. The worst trace the application can produce is 1,154 frames and about 1 MB, and generation is a single synchronous burst in the milliseconds — so the cap is what makes 'run to completion, then replay' safe on the main thread. I've measured the worst case rather than assumed it."
:::

## 52.3 What would break first, in order

1. **Synchronous generation blocks the main thread.** The generators are plain synchronous loops with no yielding. At n = 10,000 a quadratic sort would perform tens of millions of comparisons *and* clone a 10,000-element array on every push, before the first paint. The tab freezes and the browser may offer to kill the page.
2. **Memory explodes.** Retained data is O(frames × n), and frames is O(n²) for the quadratic sorts — so conceptually O(n³) elements. At n = 1,000 a bubble trace could need on the order of 10⁹ element copies.
3. **Rendering becomes the bottleneck.** 1,000 DOM columns per frame, re-rendered as the cursor moves, is far beyond a frame budget. `ArrayView` has no virtualization and no `memo`.
4. **The timeline stops being usable.** A range input with a million steps cannot be scrubbed to a meaningful position.
5. **`localStorage` throws.** The 5 MB per-origin quota would be exceeded by the first save; the existing `try/catch` would catch the `QuotaExceededError` and show "Browser storage is unavailable. Use Export instead."

:::answer "Could AlgoViz handle 1 million frames?"
"Not today, and I can tell you exactly what fails. At a million frames you're looking at roughly 800 MB to a gigabyte of retained objects, since each frame is about 800 bytes of array-of-objects, and the timeline alone would have a million steps. The main thread would freeze before any of that even mattered, because generation is synchronous — a million-frame trace can't be built one frame at a time without blocking the UI for seconds. So the answer is no, and the honest follow-up is how I'd get there, which is a four-step plan rather than one fix."
:::

:::must The optimization plan, in the order it should be done
1. **Move generation into a Web Worker.** The generators have no DOM dependency — they take an array and return an array, which is exactly what a worker does well. This removes the freeze. The cost is that traces become async, so `frames` needs a state machine (loading/ready/error) and the reducer's `load` has to wait.
   *Do not call this a security sandbox.* A worker is a concurrency tool; it shares the origin and can still make requests.
2. **Replace full snapshots with compact events plus checkpoints.** Store operations (`{op:'swap', i, j}`, `{op:'compare', i, j}`) and a full snapshot every k frames. Memory drops from O(frames × n) to O(frames) events plus O((frames/k) × n) checkpoints — with k = 50 that is a ~50× reduction on the snapshot component.
3. **Virtualise the array view.** Render only the visible columns for large n, or switch to a canvas-based bar chart.
4. **Only then** raise the input cap, and keep one — there is always a size at which a browser tab is the wrong tool, and a visualisation of 100,000 bars is not readable by a human anyway.

Steps 1 and 2 are listed in the README's own "What's next" section as "Introduce compact trace events and checkpoints" and "Add worker execution before increasing input limits" — so the plan is the project's declared direction, not something improvised in an interview.
:::

## 52.4 The optimizations already present

| Optimization | Where | Effect |
| --- | --- | --- |
| `useMemo` for both traces | `SortingLab` 93–97 | The generator runs once per `(algo, input)` pair, not once per render |
| Lazy routes with `Suspense` | `Home.jsx` | Twelve module chunks are not downloaded until visited |
| `useState` lazy initialiser for `saved` | `SortingLab` 77 | `localStorage` is read once per mount, not once per render |
| `Object.is` bail-out on unknown actions | reducer `default` | No re-render for an unrecognised dispatch |
| Tree-shaking | Vite/Rolldown, verified by inspecting `dist/` | Dead components are absent from the bundle |
| Tailwind's content scan | build time | Only used utility classes are emitted |
| Bounded input | `parseInput` | The single most effective performance control in the project |

:::trap "Why don't you memoise ArrayView with React.memo?"
The honest answer: *"Because at n ≤ 24 the render is not the bottleneck, and memoising prematurely would add a dependency comparison for every cursor change with no measurable benefit — and the props are never actually equal, since `frame` changes on every tick. It becomes worth doing at step 3 of the scale plan, together with virtualization, when n is large enough that the render dominates. Adding it now would be cargo-culting."* The key point: `React.memo` on `ArrayView` would be useless here because `frame` is a different object every tick, so the shallow comparison always fails. That is a strong, specific answer.
:::

---

# 53 · Security and trust boundaries

> Only the boundaries that actually exist in this project — and an explicit list of what is not claimed.

## 53.1 The trust boundary diagram

```
   +---------------------------------------------------------------+
   |  TRUSTED (same origin, shipped by me)                          |
   |                                                                |
   |   frames[]        <- produced by my generators                 |
   |   algorithms{}    <- a frozen-in-practice registry             |
   |   playback state  <- owned by my reducer                       |
   |   route table     <- literal paths in Home.jsx                 |
   +---------------------------------------------------------------+
              ^                                  ^
              |  validated                       |  validated
              |                                  |
   +---------------------------+    +--------------------------------+
   |  SEMI-TRUSTED             |    |  UNTRUSTED                     |
   |                           |    |                                |
   |  localStorage contents    |    |  A file the user imports       |
   |  (?algorithm= URL param)  |    |  (arbitrary bytes, <= 16 KB)   |
   |  saved experiment records |    |  Text typed into the input     |
   +---------------------------+    +--------------------------------+
              |                                  |
              +---------------+------------------+
                              v
                BOUNDARY CONTROLS (the only validation points)
                   Object.hasOwn(algorithms, ...)   <- prototype-safe key check
                   Array.isArray(...)               <- shape check
                   parseInput(...)                  <- 5 value rules, one definition
                   Number.isInteger(...)            <- cursor type check
                   file.size > 16384                <- size limit
                   try/catch everywhere             <- parse + storage failures
                   React's escaping                 <- all rendered values
```

## 53.2 What each control defends against

| Control | Threat | Failure mode it prevents |
| --- | --- | --- |
| `Object.hasOwn(algorithms, key)` | A crafted `algorithm` value from a URL or file resolving via the prototype chain | `algorithms["constructor"].run(...)` → `TypeError`, crashing the component and blanking the route |
| `parseInput`'s anchored regex | Type-confusion via implicit coercion (`""` → 0, `"1e3"` → 1000, `"0x10"` → 16, `"Infinity"` → `Infinity`) | Values that are not what they look like reaching the algorithm and the display |
| `Number.isSafeInteger` + `\|n\| ≤ 999` | Out-of-range values, and numbers beyond 2⁵³ that lose precision | Silently wrong comparisons; absurd bar labels; division-by-zero risk in the height calculation |
| The 2–24 length rule | Unbounded work | A synchronous generator run that freezes the tab |
| The 16 KB file cap | Oversized parse on the main thread | A crafted or accidental large file hanging the tab before any validation runs |
| `Number.isInteger(cursor)` on save/import | Fractional or non-numeric cursors | `frames[2.5] === undefined` → `ArrayView` throws on `frame.array.map` |
| `try/catch` around `JSON.parse` and `localStorage` | Malformed or hostile stored bytes | An exception during the lazy `useState` initialiser, which is the worst place for one — it would make the route unrenderable |
| React's default escaping | Injected markup from any string value | The imported `input` values, the `algorithm` name and the stored data are all rendered through JSX children, which React escapes. There is no `dangerouslySetInnerHTML` anywhere in the codebase |
| `.filter()` on the read path | Records referring to removed algorithms | A crash at `algorithms[item.algorithm].name` during render |

:::danger Four things to never claim
1. **Never claim a security audit.** None was performed. The README is explicit: the dependency audit result is "not a security certification".
2. **Never claim localStorage is secure.** It is plaintext, readable by any script on the origin, visible in DevTools, and not a secret store.
3. **Never claim a Web Worker is a sandbox.** A worker shares the origin, can `fetch`, and can access `indexedDB`. It is a threading and responsiveness tool. The README's interview guide says this explicitly: "Do not call a Worker a security sandbox."
4. **Never claim the import validator is a security boundary for a server.** It is a **client-side** control. Its job is to protect the user's own session from bad data. If a server ever accepted uploads, that server would need its own validation, because a client-side check protects nothing against a client that simply doesn't run it.
:::

## 53.3 What the project is safe *from*, by construction

| Vector | Why it does not exist here |
| --- | --- |
| **SQL injection** | There is no SQL and no database |
| **Command injection** | There is no server and no shell |
| **Server-side request forgery** | No server |
| **Stored XSS** | No server-side storage; saved data is re-validated, and React escapes everything rendered |
| **Reflected XSS** | The only URL inputs are `algorithm` (validated against a registry) and the presence of `compare` (a boolean). Neither is rendered as markup |
| **Arbitrary code execution via the import path** | No `eval`, no `new Function`, no dynamic `import()` of user data, no URL built from user input, no `dangerouslySetInnerHTML`. The imported values pass through a regex and `Number()` |
| **Credential leakage** | No credentials exist. No `.env`, no API keys, no tokens, no cookies set by the app |
| **CSRF** | No authenticated state-changing endpoints, and `localStorage` is not sent with requests |
| **Prototype pollution via the algorithm key** | `Object.hasOwn` blocks prototype-chain access |
| **Open redirect** | The app never navigates to a URL derived from user input |

## 53.4 What is genuinely exposed

| Exposure | Reality | Mitigation available |
| --- | --- | --- |
| **Any script on the origin can read saved experiments** | True. `localStorage` has no access control within an origin | Store nothing sensitive there — and nothing in this app is sensitive. If it ever became sensitive, the answer is not "encrypt in localStorage" (the key would have to live in the same place) but "don't store it client-side" |
| **The user's own saved data is editable via DevTools** | True, and treated as untrusted | The read path validates twice: filter on load, `parseInput` on click |
| **A dependency could be compromised** | True for every npm project. 300+ transitive packages are installed | Lockfile pinning via `npm ci`, the `overrides` pin for the Vite alias, and a periodic `npm audit`. Actions are pinned to major tags, not SHAs — an identified gap |
| **Prompts from the browser's own warnings** | `vite.config.js` binds the dev server to all interfaces and allows `.e2b.app` hosts | Documented in the README as a development-only convenience. Production serves static files with no dev server |
| **No CSP / security headers** | `vercel.json` contains only the SPA rewrite | [PROPOSED] Add a `Content-Security-Policy` with `default-src 'self'`, plus `X-Content-Type-Options: nosniff` and `Referrer-Policy`. For a static SPA with no inline scripts this is cheap and would meaningfully raise the cost of an XSS |
| **No Subresource Integrity for the CDN** | Nothing is loaded from a CDN — there are no external script tags at all | Not applicable; this is a strength worth stating |

:::answer "What is your threat model?"
"A single user, on their own machine, running an offline-capable client-side app with no accounts and no server. So the assets worth protecting are: the user's browser session (no XSS), their typed data (not being corrupted by malformed input), and their own saved experiments (not becoming a crash on load). I've hardened exactly three boundaries — the imported file, the URL parameters, and the localStorage contents — because those are the only places where data crosses from untrusted into application state. Beyond that, the honest position is that there's nothing here to steal: no credentials exist, no personal data is collected, and no requests leave the origin. That's why I'd describe this project as having a *small* attack surface rather than a *hardened* one."
:::

:::check Red-line drills for Parts XXI–XXVII
- [ ] Recite the four CI steps and why `npm ci` is used.
- [ ] Name three bug classes a green build cannot catch, with the merge-sort duplicate-key example.
- [ ] Quote the build figures: 1,736 modules, 19 asset files, ~1.2 s, 251.78 kB initial (80.90 kB gzipped).
- [ ] Explain the `rolldown-vite` alias without claiming a performance win.
- [ ] Explain the `vercel.json` rewrite and the `allowedHosts` setting.
- [ ] Say the Tailwind split sentence without overclaiming.
- [ ] Explain `Object.hasOwn` vs `in` with the `constructor` example.
- [ ] List the five first-to-break performance limits in order.
- [ ] Say the four things you must never claim about security.
:::
