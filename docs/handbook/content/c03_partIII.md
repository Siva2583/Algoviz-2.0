%PART: Application startup and routing | PART III | From index.html to the first rendered frame of the Sorting Lab — the exact chain of files.

# 08 · Startup: index.html → main.jsx → App → Home → routes

> Six files, in order, with the reason each one exists.

## 8.1 Stage 1 — `index.html` (the only HTML file)

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AlgoViz — The Algorithm Laboratory</title>
<meta name="description" content="Inspect, rewind and compare algorithms. A local-first algorithm laboratory with reproducible experiments and counterexample challenges." />
...
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

[VERIFIED] What matters here:

- **One mount point:** `<div id="root">`. Nothing else in the document is React-managed.
- **No bundler script tag in the source:** the `<script>` points at `/src/main.jsx`, which browsers cannot execute directly. In development Vite serves and transforms it on the fly; in production the build rewrites the tag to a hashed, minified chunk. This is why the built `dist/index.html` looks different from the source file — the same reason "you can't just open `index.html`" (which your README warns about).
- **`<meta name="description">` is real product copy**, not filler. It contains the project's three honest self-descriptions: local-first, reproducible, counterexample.
- **No CSS `<link>`:** all styles arrive through JavaScript imports, which Vite extracts into CSS chunks at build time (one 72.37 kB stylesheet plus two smaller ones, per my build run).

:::q "Why is there no `<link rel="stylesheet">` in your HTML?"
[VERIFIED] Because the stylesheets are imported from JavaScript (`main.jsx` imports `global.css` and `index.css`; `Shell.jsx` imports `lab.css`; and so on). This gives per-route CSS: Vite emits `ModuleFrame-*.css` and `TutorialTab-*.css` only alongside the chunks that need them. The trade-off is that a `<link rel="stylesheet">` would let the browser start CSS download before the JS bundle is parsed — a real, if small, difference in first paint.
:::

## 8.2 Stage 2 — `src/main.jsx` (9 lines)

@@code src/main.jsx

[VERIFIED] Four decisions are visible in nine lines:

1. **`createRoot`** — the React 18+ client API, replacing `ReactDOM.render`. It enables concurrent features and is the only supported entry for React 19.
2. **`document.getElementById('root')` is not null-checked** — a deliberate simplification that is safe *only* because `index.html` is in the same repository and does declare that element. It is a coupling between two files, and it is the classic "what if you misspell the id?" question.
3. **`<React.StrictMode>`** wraps the application. In development only, React intentionally double-invokes render functions, effects, and (in React 19) ref callbacks to surface non-idempotent code. This has a *direct* consequence for AlgoViz's timer effect, which you should be able to explain — see 8.6.
4. **Stylesheet import order:** `global.css` then `index.css`, and `index.css` is the Tailwind entry containing `@tailwind base`, which includes Tailwind's preflight reset. Import order therefore matters more than it looks: preflight loading *after* `global.css` means Tailwind's reset wins on conflicting base rules. [INFERENCE] That ordering is intentional enough to be worth mentioning, and it is a good answer to "does CSS order matter in a JS-bundled app?"

:::q "Where does React start?"
[VERIFIED] *"`ReactDOM.createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>)`. That's it — the root and the render call are in `src/main.jsx`. Everything after that is ordinary component composition and routing."*
:::

## 8.3 Stage 3 — `src/App.jsx` (12 lines)

@@code src/App.jsx

[VERIFIED] `App` is intentionally almost empty: it imports `global.css` (a second time — `main.jsx` already did) and renders `<Home />` inside a `<div>`. There is no provider, no theme context, no error boundary.

:::inference Why this file exists at all if it only renders Home
[INFERENCE] It is a conventional seam: the natural place to add providers, error boundaries, or global layout later, and the conventional filename that tooling and readers expect. It is also the only place a global error boundary *could* go today, which makes it a good answer to "how would you handle a render crash in one module?" — [PROPOSED]: add an `ErrorBoundary` component in `App.jsx` so a crash in one lazily loaded module does not blank the whole workspace.
:::

Note the duplicate stylesheet import: `main.jsx` imports `./styles/global.css` and `App.jsx` imports it again. Vite deduplicates the module in the bundle, so there is no double download, but the redundancy is real. [VERIFIED]

## 8.4 Stage 4 — `src/pages/Home.jsx` (104 lines): routing

@@code src/pages/Home.jsx 1 20

[VERIFIED] All twelve heavy module components are imported with `React.lazy(() => import(...))`. `Overview` and `Shell` are imported eagerly because they are needed on the very first paint — the shell would otherwise flash empty.

@@code src/pages/Home.jsx 21 44

The complete route table, verified from lines 39–100:

| Path | Element | Lazy? | Notes |
| --- | --- | --- | --- |
| `/` | `<Overview />` | no | Landing page |
| `/library` | `<Overview library />` | no | Same component, different presentation |
| `/lab` | `<SortingLab />` | yes | The Sorting Lab |
| `/counterexample` | `<Counterexample />` | yes | Counterexample Lab |
| `/modules/core/simple-sort` | `<SortingLab />` | yes | Routes to the lab, not to `SimpleSort.jsx` |
| `/modules/core/advanced-sort` | `<SortingLab key="advanced" />` | yes | The `key` forces a fresh mount so the initial algorithm differs |
| `/modules/core/binary-search` | `<BinarySearch />` | yes | Legacy module |
| `/modules/core/n-queens` | `<NQueens />` | yes | Legacy module |
| `/modules/patterns/two-pointers` | `<TwoPointers />` | yes | Legacy module |
| `/modules/patterns/fast-slow` | `<FastSlowPointers />` | yes | Legacy module |
| `/modules/patterns/bs-variants` | `<BinaryVariants />` | yes | Legacy module |
| `/modules/patterns/prefix-sum` | `<PrefixSum />` | yes | Legacy module |
| `/modules/patterns/sliding-window` | `<SlidingWindow />` | yes | Legacy module |
| `/modules/patterns/merge-intervals` | `<MergeIntervals />` | yes | Legacy module |
| `/modules/core/tree-traversal` | `<TreeTraversal />` | yes | Legacy module |
| `/modules/core/pathfinding` | `<Pathfinder />` | yes | Legacy module |
| `*` | 404 panel inside `<Shell>` | no | "404 / OUTSIDE THE SEARCH SPACE" |

:::must Three details in that table that earn you credibility
1. **`<SortingLab key="advanced" />`** — the `key` prop makes React treat the advanced-sort route as a *different component instance*, so state resets and the initial algorithm becomes `quick` instead of `bubble`. Without the key, navigating between `/modules/core/simple-sort` and `/modules/core/advanced-sort` would reuse the same mounted component and keep the previous algorithm. [VERIFIED: the default algorithm is derived from `location.pathname.includes("advanced-sort")` at line 65, which is only re-evaluated on mount.]
2. **The 404 route renders inside `<Shell>`** with nav and footer intact, rather than dumping a bare error page. That is a UX choice with a cost: the 404 page imports `Shell`, so it is not lazy.
3. **`/library` reuses `Overview` with a boolean prop** instead of duplicating a component. Together with the `*` 404 panel, those are the only three routes that never suspend: `Overview` and `Shell` are imported eagerly, so first paint never waits on a chunk for them. The other fourteen routes render a lazily-imported component.
:::

## 8.5 Stage 5 — the Suspense boundary

@@code src/pages/Home.jsx 22 38

[VERIFIED] One `<Suspense>` wraps **all** routes, with a fallback that is itself wrapped in `<Shell>`. Consequences worth stating:

- The navigation chrome stays visible while a lazy chunk downloads — the user is never looking at a blank page.
- The fallback is not per-route, so navigating between two lazy routes shows the same "PREPARING YOUR EXPERIMENT / One moment of curiosity…" screen.
- `<main role="status" aria-label="Loading workspace">` gives the loading state a live-region role and a label, which is the accessibility-minded way to announce loading.

:::q "What happens during a route change?"
Trace it in this order: **(1)** `BrowserRouter` reads the new `location` and re-renders its children; **(2)** `<Routes>` matches the new pathname against the route table; **(3)** if the matched element is a lazy component whose chunk has not been fetched, React suspends and renders the `<Suspense>` fallback instead; **(4)** when the chunk resolves, the module component mounts; **(5)** inside it, `Shell`'s `useEffect` on `pathname` fires and calls `window.scrollTo(0, 0)`; **(6)** any component that reads `useLocation` or `useSearchParams` (like `SortingLab`) re-computes its derived values on the next render. [VERIFIED]
:::

## 8.6 StrictMode and the timer: the question that catches candidates

:::q "You use StrictMode. What does that do to your playback effect?"
[VERIFIED] In development, StrictMode mounts, unmounts and remounts each component to expose effects that are not safe to run twice. The playback effect is exactly the kind of code this is designed to test:

```js
useEffect(() => {
  if (!playback.playing) return;
  const id = setTimeout(() => dispatch({ type: "tick" }), speed);
  return () => clearTimeout(id);
}, [playback.playing, playback.cursor, speed]);
```

The first mount schedules a timeout; the simulated unmount runs the cleanup, which clears it; the remount schedules a new one. **Net effect: one timer, because the cleanup always cancels before the replacement schedules.** If the effect had no cleanup — the classic bug — StrictMode would leave two live timers in development and the animation would visibly double-step. So the honest, impressive answer is: *"StrictMode is why I have a cleanup that clears the timeout. Without it, double-mounting in development would leave an orphaned timer... and the same bug would appear in production whenever the effect re-ran, for example when the user changed speed mid-playback."*
:::

:::danger The three timer bugs StrictMode will expose in your code, if you ever remove the cleanup
1. Two pending timers after any dependency change → the cursor advances twice per interval.
2. A tick dispatched after unmount → a React warning, and in older React versions a state update on an unmounted component.
3. Speed changes that appear not to take effect, because the old timer is still the one firing.
:::
