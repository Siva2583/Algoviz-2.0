# 01 · How to use this handbook

> Read this page first. It tells you what you are holding, how claims are labelled, and how to study it.

This handbook was written by reading your repository, not by reading your resume. Every technical statement about AlgoViz is grounded in a file that exists in the project at commit `80f9862` ("Update Shell.jsx", 15 Sep 2026), in the 61 JavaScript/JSX modules under `src/`, the 140-line test file, the CI workflow, and the build configuration. Where a statement goes beyond what the code shows, it is labelled.

**Project:** AlgoViz 2.0 — an in-browser algorithm laboratory. **Stack as installed:** React 19.2.1, react-dom 19.2.1, react-router-dom 7.18.3, Tailwind CSS 3.4.17, Vite (aliased to `rolldown-vite@7.2.5`), Lucide React icons, ESLint 9, Node's built-in test runner. **No backend, no database, no authentication, no AI service, no API keys.**

---

## 1.1 The five claim labels used in this book

Every important claim carries one of these tags. They are not decoration: in a real interview, the difference between *"the code does this"* and *"I believe this is why the code does this"* is the difference between a hire and a rejection. Say the label out loud mentally before you answer.

| Label | Meaning | How to say it |
| --- | --- | --- |
| [VERIFIED] | Directly supported by source code you can open right now | "If you open `src/lab/engine.js` line 80, you can see…" |
| [INFERENCE] | A reasonable engineering explanation inferred from the implementation, not written down anywhere | "My reading of the code is that… I did not document that at the time." |
| [GENERAL KNOWLEDGE] | Standard React / JavaScript / algorithm / testing background needed to understand the implementation | "That is the general rule; here is how it shows up in my code." |
| [NOT VERIFIED] | The available source does not establish the claim | "I cannot prove that from the repository." |
| [PROPOSED] | A future improvement or design idea, **not** an existing feature | "That is not implemented. It is the next thing I would do, and here is how." |

:::danger The single most dangerous sentence in an interview
"The code does X" — when the code does not do X. A senior interviewer will ask you to open the file. Everything in this handbook is written so that you never have to walk a claim back. When the source is silent, this book says [NOT VERIFIED] and gives you a defensible sentence that still sounds strong: *"The repository doesn't establish that; here is what I can prove."*
:::

## 1.2 How to read this book

- **Days before the interview:** use Chapter 65 (the 5-day plan). It tells you exactly which chapters to read on which day, and what to say out loud at the end of each day.
- **Two days before:** use Chapter 66 (RED / ORANGE / YELLOW / GREEN). It filters this entire book down to what is actually worth memorising.
- **The night before:** read Chapter 68 only. Five pages, everything that matters.
- **Fifteen minutes before:** read Chapter 69. Two pages, written to be read in fifteen minutes.
- **When you are stuck on a file:** Chapter 55 is a walkthrough of the ~30 most important code blocks in the project, with line-level explanation and the question an interviewer would ask about each one.
- **When you need to rehearse:** Chapters 63–64 are ten full mock interviews with model answers. Chapters 58 and 60 are the aggressive and cross-domain question banks. Chapter 61 is the 200-question rapid-fire drill, Chapter 62 the flashcards, and Chapter 57 the claim-by-claim defence of your resume entry.

Boxes are colour-coded by purpose: **green** is a must-know or a model answer, **navy** is an interview question, **red** is a danger zone or trap, **amber** is a weakness or an unverified claim, **purple** is a proposed (not implemented) improvement, and **teal** is a line you can say out loud.

## 1.3 What AlgoViz is, in one paragraph you can memorise

[VERIFIED] AlgoViz 2.0 is a client-side React application that makes algorithm execution *inspectable*. Its central idea is stated in the product copy itself: an animation can show **what happened**, but AlgoViz shows **why**. The mechanism is a **recorded-frame architecture**: instead of animating while the algorithm runs, each algorithm generator executes to completion and returns a complete array of immutable frames — one frame per meaningful state. The UI then simply renders whichever frame a playback cursor points at. Playback is therefore not execution: pausing, stepping, seeking and rewinding are all *array indexing into a recording*. Rewind is recorded-state replay, not JavaScript running backwards.

---

# 02 · Resume reality check: every claim, audited

> Before you defend the project, know exactly which of your public claims the repository proves.

Your resume entry makes eight assertions. Each one was checked against the source. This is the audit an aggressive interviewer performs mentally in the first two minutes.

## 2.1 The audit table

| # | Resume claim | Verdict | Where it is proven |
| --- | --- | --- | --- |
| 1 | "recorded-frame playback for 6 sorting algorithms using React reducers" | [VERIFIED] | `src/lab/engine.js` lines 8–62 register exactly six algorithms (`bubble, selection, insertion, merge, quick, heap`); each `run` is a frame generator; `SortingLab.jsx` line 98 uses `useReducer(playbackReducer, …)` |
| 2 | "pause/resume, single-step navigation, speed control, timeline seeking" | [VERIFIED] | `toggle` action = play/pause (`engine.js` 84–89); step buttons = `seek(cursor ± 1)` (`SortingLab.jsx` 378–408); speed `<select>` with four values 600/300/160/50 (`SortingLab.jsx` 410–421); `<input type="range">` timeline (`SortingLab.jsx` 356–367) |
| 3 | "same-input algorithm comparison with percentage-aligned replay" | [VERIFIED] | `otherFrames` runs the second algorithm on the **same** `input` (`SortingLab.jsx` 94–97); `compareCursor` is a proportional mapping (`SortingLab.jsx` 201–203); the UI's own caption reads "Preview aligned by percentage of trace—not equivalent operations." |
| 4 | "recorded operation counts" | [VERIFIED], with a scope limit | Every frame carries `currentStats {passes, comps, swaps}`; the comparison panel reads **`comps` only** (`SortingLab.jsx` 515–521). Pass/exchange counters are labelled implementation-specific in the UI footnote (lines 587–592) |
| 5 | "browser-local experiment saves" | [VERIFIED], with limits | `localStorage` key `algoviz.experiments.v1`, latest **6** saved (`SortingLab.jsx` 181–197, 77–92) |
| 6 | "validated JSON import/export" | [VERIFIED] | Export builds `{version:1, algorithm, input, cursor}` (line 236); import enforces a 16 KB size cap, `version === 1`, a known algorithm key, and an array input, then re-validates through `parseInput` (lines 156–180) |
| 7 | "150 algorithm-input cases" for sorting correctness and trace reproducibility | [VERIFIED] | `tests/engine.test.js` lines 12–36: six algorithm groups × 25 inputs (5 fixed edge cases + 20 seeded datasets via `makeDataset("random", seed)`), asserting sorted output, input preservation, deep-equal trace reproducibility and final ID uniqueness |
| 8 | "768 sliding-window cases against brute force" | [VERIFIED] | `tests/engine.test.js` lines 82–101: 64 arrays (all 4³ combinations of values 1–4 at length 3) × targets 1–12 = 768 assertions against an in-test brute-force oracle |
| 9 | "automated tests, lint, and build checks through GitHub Actions" | [VERIFIED] | `.github/workflows/ci.yml`: `npm ci` → `npm test` → `npm run lint` → `npm run build` on every push and pull request |

**Result: there is no claim in your resume entry that the repository contradicts.** That is a genuinely strong position, and it is worth saying calmly in an interview: *"Everything in that bullet is traceable to a file — I can open any of them."*

## 2.2 The five nuances that will separate you from a bluffing candidate

These are not problems. They are the details that show you actually read the code you shipped. Raise them **before** the interviewer finds them.

:::must Nuance 1 — "150 cases" means 150 algorithm-input pairs, not 150 distinct inputs
The loop is `6 algorithms × 25 inputs`. Twenty of those 25 inputs per algorithm are generated from a fixed linear-congruential sequence seeded 0…19, so all six algorithms are tested on the same 25 arrays. The 150 is a real count of *executions checked*; it is not 150 hand-written test vectors. [VERIFIED]
:::

:::must Nuance 2 — "operation counts" in the comparison panel means comparisons only
The panel's own footnote says it: "Legacy generators count exchanges differently; comparison mode deliberately uses comparisons only." Merge sort's generator increments `swaps` on every *write* out of the temporary buffer, not on a physical swap — so its `swaps` number is not the same *kind* of event as bubble sort's `swaps`. [VERIFIED] This is the single best answer to "are your counters comparable?" and it is already written into your own UI.
:::

:::must Nuance 3 — percentage-aligned replay is a viewing convention, not a result
It positions a preview frame proportional to the primary cursor's progress through its own trace. A 100-frame trace and a 40-frame trace are shown at 10% / 10%, 50% / 50%, 100% / 100% — so at the *same* percentage you are looking at different numbers of executed operations. [VERIFIED]
:::

:::weak Nuance 4 — the UI allows comparing an algorithm with itself
The comparison `<select>` lists all six algorithms and is not filtered against the primary selection, so a user can select Bubble vs Bubble and see two identical traces. There is no guard. It is harmless (the counts match) but it is a real gap. [VERIFIED]
:::

:::weak Nuance 5 — Tailwind is in the stack but not in the new lab UI
`index.css` contains the three `@tailwind` directives and the legacy module pages under `src/modules/**` are styled almost entirely with Tailwind utility classes. The current Sorting Lab uses hand-written CSS (`src/lab/lab.css`, 1,756 lines) with an `av-` prefix. Tailwind is still compiled and shipped, and it is still used by ten of the twelve module routes. [VERIFIED] Do not say "AlgoViz is a Tailwind app"; say "Tailwind ships and styles the legacy modules; the lab I rebuilt uses scoped CSS."
:::

## 2.3 The honesty script (memorise this shape)

:::script How to open the discussion
"Quick framing before we go deep, because I think it matters: AlgoViz is a client-side React app with no backend. The interesting engineering is in three places — recording execution as frames instead of animating it live, a reducer that owns playback, and a verification story built on Node's test runner rather than a test framework. I'm happy to open any file. And if you find a claim I can't back with code, I'd rather you tell me — I'd like to know."
:::

That paragraph does three things at once: it scopes the project before the interviewer can scope it for you, it names your three strongest mechanisms, and it pre-empts the "are you bluffing" question by inviting the audit.

## 2.4 The deployment claim, handled honestly

The README links a live deployment — `https://algoviz-2-0.vercel.app/` appears in eight places, and `vercel.json` supplies the SPA rewrite that keeps client routes working on refresh. That is the whole of what the repository establishes about deployment:

| Claim | Verdict |
| --- | --- |
| A Vercel deployment is intended and configured | [VERIFIED] — `vercel.json` exists and the README links the URL |
| The site is reachable *today* | [NOT VERIFIED] — I did not fetch it; this handbook is grounded in the repository |
| CI deploys it | [VERIFIED as a negative] — `.github/workflows/ci.yml` has no deploy step; the deployment is external to the repository |
| There is a custom domain, uptime monitoring or analytics | [NOT VERIFIED] — nothing in the repository suggests any of them |

**How to answer.** *"There's a Vercel deployment configured through `vercel.json` and linked from the README. Deployment happens outside the repository — CI only verifies, it doesn't publish, and that's deliberate: nothing merges and ships on its own. I'd be careful about claiming uptime or usage, because nothing in the repo measures either."*

If the interview is remote, have the live URL open in a tab and the repository open in another. **Showing the deployed app is stronger than describing it — but check the link the morning of the interview**, because a claim you cannot demonstrate is worse than a claim you scoped.
