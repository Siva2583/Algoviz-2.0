%PART: Five-day plan and priority tiers | PART XXXVIII–XXXIX | A day-by-day plan with exit criteria, then a full RED/ORANGE/YELLOW/GREEN tiering of everything worth knowing.

# 65 · The five-day master plan

> One rule governs this plan: **each day ends with an exit criterion you either meet or you don't.** "I read the chapter" is not an exit criterion. "I explained the reducer's four transitions out loud in ninety seconds without notes" is.

## 65.1 How the five days are shaped

```
  DAY 1  READ       the repository, not the handbook          -> 90 min
  DAY 2  UNDERSTAND the engine, the reducer, the frame model  -> 4 h
  DAY 3  SPEAK      the pitch, the defence, the attacks       -> 4 h
  DAY 4  CODE       six sorts, the reducer, the parser        -> 4 h
  DAY 5  PRACTICE   two full mock interviews, then weakness   -> 3 h
```

Each day below has the same four-part structure: what to read, what to understand, what to say, and the exit criterion. Do not proceed past a failed exit criterion — the days are cumulative and the exit criteria are the dependencies.

---

## 65.2 Day 1 — READ the source

**Target.** 90 minutes. By the end you should be able to name every file that matters and say what it does in one sentence.

| Time | Task |
| --- | --- |
| 0:00–0:10 | Read `package.json` and `.github/workflows/ci.yml`. Write down the four CI steps and the Node floor from memory. |
| 0:10–0:25 | Read `README.md` end to end. Mark every claim that names a file or a number — those are the claims you will be asked to prove. |
| 0:25–0:35 | Read `index.html`, `src/main.jsx`, `src/App.jsx`, `src/pages/Home.jsx`. Draw the boot path from `<div id="root">` to a rendered route, on paper. |
| 0:35–0:55 | Read `src/lab/engine.js` in full, twice. First pass for structure, second pass for the four things it holds: the registry, the parser, the reducer, and the dataset/window functions. |
| 0:55–1:20 | Read `src/lab/SortingLab.jsx` in three passes: state declarations, effects, render. Do not try to read it linearly. |
| 1:20–1:30 | Read `tests/engine.test.js` and count the groups. Note which assertion you think is weakest. |

:::check Day 1 exit criteria
- [ ] I can name the purpose of these nine files from memory: `main.jsx`, `App.jsx`, `Home.jsx`, `constants.js`, `engine.js`, `SortingLab.jsx`, `Shell.jsx`, `engine.test.js`, `ci.yml`.
- [ ] I can draw the boot path on paper without looking.
- [ ] I can state the four CI steps in order.
- [ ] I can name the file that holds the six algorithms' registry entries and the file that holds their bodies.
- [ ] I identified one assertion I believe is too weak — before reading any chapter that tells me which.
:::

---

## 65.3 Day 2 — UNDERSTAND the engine

**Target.** Four hours, in three sittings. This is the day the interview is actually decided on.

**Sitting 1 — the frame contract (75 min).**
- Read Chapters 11–14 (frames, execution, memory, the schema).
- Open `bubbleSort.js` and read it line by line against the chapter.
- Then open `mergeSort.js` and find the three places where the buffer write-back happens. Write down, in your own words, why the identifiers are duplicated.
- Re-derive from memory: the two mandatory clones, and what breaks without each.

**Sitting 2 — the reducer and the transport (75 min).**
- Read Chapters 21–26 (the reducer, worked simulations, play/pause, timers, seeking, speed).
- Write the reducer's four transitions on a blank page: state before, action, state after, for `load`, `toggle`, `tick`, `seek`. Include the exact expressions.
- Write down the three state pairs from the worked simulations, then check them against Chapter 22.
- State out loud, in one breath, why `cursor` is in the timer effect's dependency array.

**Sitting 3 — counts, comparison and the numbers (90 min).**
- Read Chapters 38–40 (comparison, alignment, counts).
- Write down the alignment formula from memory and compute the secondary cursor for three pairs by hand.
- Learn the number set: 1,154 frames / ~981 KB worst case; 118 / 65 / 76 / 107 / 75 / 84 frames on the default input; comparison counts 28 / 28 / 22 / 16 / 16 / 44; the 150 and the 768.
- Say out loud, twice: why a count of comparisons is not a measurement of speed.

:::check Day 2 exit criteria
- [ ] I wrote all four reducer transitions from memory with the correct expressions.
- [ ] I explained the merge duplicate-identifier bug in under 45 seconds, with the 23-of-107 figure.
- [ ] I stated the alignment formula and computed an example by hand.
- [ ] I recited six frame counts and six comparison counts without looking.
- [ ] I stated why the two mandatory clones exist and what fails without each.
:::

---

## 65.4 Day 3 — SPEAK it

**Target.** Four hours, mostly out loud, standing up, with a timer.

| Block | Exercise | Timer |
| --- | --- | --- |
| 1 | The 30-second pitch, five times, each one different | 10 min |
| 2 | The 2-minute pitch, three times, then the 5-minute version once | 30 min |
| 3 | Resume defence: all fourteen claims, each with its proof location | 45 min |
| 4 | The weakness answer — the ninety-second version, three times | 20 min |
| 5 | The hostile round: pick 20 questions from Chapter 58 at random, answer aloud | 60 min |
| 6 | Cross-domain: 15 questions from Chapter 60, using the four-step formula | 40 min |
| 7 | Record the 2-minute pitch and listen to it once, critically | 15 min |

**Rules for this day.** Speak in complete sentences. Never say "basically", "kind of", or "I think" before a claim you can verify. When you don't know, say "I don't know, and here's how I'd find out". Time yourself and stop mid-sentence when the timer ends — the discipline transfers to interviews.

:::check Day 3 exit criteria
- [ ] I delivered the 2-minute pitch in under 2:30 with no notes and no filler words.
- [ ] I delivered the ninety-second weakness answer without hedging.
- [ ] I answered 20 hostile questions without getting defensive or overclaiming.
- [ ] I used the four-step cross-domain formula (mechanism → consequence → boundary → fix) without thinking about it.
- [ ] I listened to my own recording and named two things to fix.
:::

---

## 65.5 Day 4 — CODE it

**Target.** Four hours at a keyboard or whiteboard. Nothing read except what you need to check.

**Block A — the six sorts (60 min).** Write all six from memory, in this order: bubble, insertion, selection, merge, quick, heap. For each, write the complexity table underneath: best, average, worst, space, stable. Then check against Chapter 56 and mark which ones you got wrong — the *comparison* detail (`<=` versus `<`) is what usually differs.

**Block B — the reducer (30 min).** Write it from memory including the `default` branch. Then write four assertions you'd add: last-frame completion, seek clamp low, seek clamp high, and the property that the cursor is an integer in range. Note out loud that the last one fails today.

**Block C — the parser and the JSON gates (40 min).** Write `parseInput` from memory with its four error messages. Then write the import gate sequence as a list, in order, and say why the size check is first and why `Object.hasOwn` replaces `in`.

**Block D — a frame generator (40 min).** Write a recording insertion sort that clones on every push and carries `codeLine`, `currentMsg`, and a cloned counter object. Then answer out loud: what are the four things that must be fresh per frame?

**Block E — the two-line test fix (20 min).** Write the per-frame identifier uniqueness assertion as it would appear inside the existing loop. Then write the multiset property ("every frame's values are a permutation of the input") and say what extra class of bug it catches.

**Block F — install and run (30 min).** `npm ci`, `npm test`, `npm run lint`, `npm run build`. Note the frame counts and the timings you observe; they're your evidence for the "I ran it in front of you" moment.

:::check Day 4 exit criteria
- [ ] Six sorts written from memory, with at most two comparison-operator mistakes.
- [ ] The reducer written from memory including the `default` branch returning the same state.
- [ ] The four error messages of `parseInput` reproduced accurately.
- [ ] The import gate sequence in the right order, with reasons.
- [ ] The two-line assertion written correctly.
- [ ] The full gate sequence run locally: tests, lint, build all green.
:::

---

## 65.6 Day 5 — PRACTICE under pressure

**Target.** Three hours. Simulate the real thing, then close the gaps.

| Block | Simulation | Duration |
| --- | --- | --- |
| 1 | Interview 2 (Kevin — React deep dive) from Chapter 63 | 35 min |
| 2 | Interview 4 (Tim — skeptical manager) from Chapter 64 | 30 min |
| 3 | Interview 7 (Sofia — security) from Chapter 64 | 25 min |
| 4 | Rapid-fire: 100 questions from Chapter 61 against a clock | 30 min |
| 5 | The weakness answer, timed, then the "what would you redo" answer | 15 min |
| 6 | Open the app and walk through it as if sharing a screen | 15 min |
| 7 | Write your three questions for the interviewer | 10 min |

**How to run a simulation.** Set a timer. Read a question, answer aloud as if the person were in the room, then read the model answer and score yourself as **strong / adequate / weak**. Keep a tally. Anything scored *weak* goes on a single sheet of paper — that sheet, not this book, is what you revise on the morning of the interview.

**The three questions to ask them.** Pick from these, and make them real: *"What does the first month look like for someone in this role?"* · *"How does the team decide when something is tested enough?"* · *"What's the piece of this codebase that's hardest to work in, and why?"* The third one signals that you've worked in a codebase someone else owns.

:::check Day 5 exit criteria
- [ ] Three simulations completed with a written tally, not a feeling.
- [ ] At most five items on the weak sheet.
- [ ] 100 rapid-fire questions in under 30 minutes with fewer than 10 misses.
- [ ] A 15-minute app walkthrough with no dead air: input → algorithm → play → step → seek → compare → counts → save → export.
- [ ] Three questions written for the interviewer.
:::

---

## 65.7 If you only have one day

```
  HOUR 1   Chapter 22 (worked reducer simulations) + Chapter 21
  HOUR 2   Chapter 33 (weaknesses) + Chapter 58 Group A and F
  HOUR 3   Chapter 63 interview 2 + Chapter 64 interview 4, aloud
  HOUR 4   Six sorts from memory, then the reducer
  HOUR 5   Chapters 61.1–61.3 (rapid fire, first 52) with a clock
  HOUR 6   Chapter 68 (night-before sheet) read twice, then recite
  FINAL    The ninety-second weakness answer, three times, recorded
```

---

# 66 · Priority tiers: what to know versus what to recognise

> Tiering is how you allocate scarce attention. **RED** means you will be destroyed if you don't know it. **ORANGE** means you'll be asked and it should be fluent. **YELLOW** means you must recognise it and know where to look. **GREEN** means you should be able to say one correct sentence if it comes up, and otherwise stay quiet.

## 66.1 Files

| Tier | Files | Why this tier |
| --- | --- | --- |
| **RED** | `src/lab/engine.js`, `src/lab/SortingLab.jsx`, `tests/engine.test.js` | The registry, parser and reducer; the only reducer consumer and the whole UI; the entire verification story |
| **ORANGE** | `src/modules/core/algorithm/sorting/algorithms/*.js`, `package.json`, `.github/workflows/ci.yml`, `src/pages/Home.jsx`, `README.md` | The six generators, the toolchain contract, the gates, the routing table, the scope document |
| **YELLOW** | `src/lab/lab.css`, `eslint.config.js`, `vite.config.js`, `vercel.json`, `src/constants.js`, `src/lab/Shell.jsx`, `src/lab/Counterexample.jsx`, `src/lab/Overview.jsx`, `src/lab/ModuleFrame.jsx` | You need to know they exist and what they own — not their contents |
| **GREEN** | `src/components/*`, `SimpleSort.jsx`, `EfficientSort.jsx`, `ModeContext.jsx`, `CardsGrid.jsx`, `src/modules/**` (page bodies), `src/lab/lesson.css`, `src/lab/modules.css` | Dead code and the legacy generation — one sentence each, don't volunteer detail |

## 66.2 Hooks and React concepts

| Tier | Item | The one thing to know |
| --- | --- | --- |
| **RED** | `useReducer`, `useMemo`, `useEffect` (cleanup), `useState` (derived vs stored) | The reducer is pure and exported; the memo keys on `[input, algo]`; the effect's cleanup cancels the timeout; derived values are computed during render |
| **RED** | Dependency arrays, stale closures | `cursor` in the timer effect is the re-scheduling trigger; the keyboard effect reads `cursor`, so it depends on it |
| **ORANGE** | Lazy state initialiser, batching, `useCallback`, `key` semantics, `Suspense`, `React.memo` | The saved list reads storage once via a lazy initialiser; `setInput` and `dispatch` batch together; `key={item.id}` gives element identity; `memo` on `ArrayView` would gain nothing; `useCallback` appears exactly once — `resetBoard` in `Nqueens.jsx` — so an effect can depend on a stable function |
| **YELLOW** | `useRef`, `createContext`, StrictMode double-invoke, error boundaries | The refs are in the legacy modules (`Nqueens.jsx`); there's no context in the lab; StrictMode is on in `main.jsx`; there's no error boundary — mention that as a gap |
| **GREEN** | Portals, transitions, `useId`, `useSyncExternalStore` | Not used anywhere; say so if asked |

## 66.3 Algorithms

| Tier | Item | The one thing to know |
| --- | --- | --- |
| **RED** | Bubble, insertion, selection | Quadratic, stable except selection, insertion is adaptive and bubble sort here is not |
| **RED** | Merge | Θ(n log n) always, stable, O(n) buffer, and **this** implementation duplicates identifiers in 23 of 107 frames |
| **RED** | Quick | Lomuto, last-element pivot, sorted input is the worst case, unstable, pivot index is final |
| **ORANGE** | Heap | n log n in every case, build is O(n), and this `heapify` increments twice per call unconditionally |
| **ORANGE** | Sliding window | O(n), requires positive values, fails on negatives — measured |
| **YELLOW** | Binary search, BFS/DFS, DP | Not in this codebase; know them as general knowledge, don't connect them to AlgoViz |

## 66.4 Tests and verification

| Tier | Item | The one thing to know |
| --- | --- | --- |
| **RED** | 150 = 6 × 25, the four assertions | Sortedness, input preservation, deep-equal re-run, final-frame id uniqueness |
| **RED** | 768 = 64 × 12, the oracle | Brute force, inline, independent mechanism, bounded to length 3 and values 1–4 |
| **RED** | The weakest assertion | Id uniqueness is final-frame-only — the two-line fix |
| **ORANGE** | `node:test` + `node:assert/strict` | Zero test dependencies; `npm test` is `node --test tests/*.test.js` |
| **ORANGE** | What is untested | Rendering, timers, `localStorage` round-trips, all nine import cases |
| **YELLOW** | Coverage, mutation testing, property tests | None are used; the *arguments* for each are in Chapter 43 — don't claim them |
| **GREEN** | Jest, Vitest, Playwright, Cypress | Not installed, never referenced — do not claim them |

## 66.5 Config and tooling

| Tier | Item | The one thing to know |
| --- | --- | --- |
| **RED** | The four CI steps | `npm ci` → `npm test` → `npm run lint` → `npm run build`, Node 22, GitHub-hosted |
| **RED** | Vite alias | `"vite": "npm:rolldown-vite@7.2.5"` plus an `overrides` entry |
| **ORANGE** | The ESLint exception | `react-hooks/set-state-in-effect` disabled for `src/modules/**` only |
| **ORANGE** | Bundle numbers | 251.78 kB main / 80.90 kB gzip, 29.85 kB lab chunk, 18.65 kB engine |
| **YELLOW** | `vercel.json`, `.nvmrc`, `tailwind.config.js` | SPA rewrite, Node 22 floor, three-file Tailwind surface |
| **GREEN** | Docker, Kubernetes, Terraform, AWS | Nothing of the kind exists here |

## 66.6 Concepts, in one ranked list

| Tier | Concept | Why it's there |
| --- | --- | --- |
| **RED** | Immutability of recorded state | The two clones; without them the whole model collapses |
| **RED** | Execution versus playback | The separation is the architecture |
| **RED** | Derived versus stored state | The cursor clamp, `meta`, `last`, `frame` |
| **RED** | Why counts are not timings | The single most likely place to overclaim |
| **ORANGE** | Trust boundaries and prototype safety | `Object.hasOwn` on three inputs |
| **ORANGE** | Memory bounded by design | The 24-element cap and the ~1 MB worst trace |
| **ORANGE** | Determinism as a product requirement | Saved cursors depend on stable frames |
| **YELLOW** | Accessibility, i18n, theming, error handling | Real gaps; describe honestly, don't defend |
| **GREEN** | Micro-frontends, SSR, GraphQL, WebSockets | Not applicable — don't bring them up |

:::must The one-screen summary of this chapter
**RED:** `engine.js`, `SortingLab.jsx`, `engine.test.js`, the frame contract's two clones, the reducer's four transitions, the 150 and the 768, the duplicate-identifier bug with its number, the two-line test fix, the four CI steps, the Vite alias, and "counts are not timings". If you know only that list, you can hold a 45-minute interview.

**If asked anything from ORANGE or YELLOW, answer in one sentence and point at the file.** Knowing where things live is a legitimate engineering skill; pretending to know their contents is not.

**If asked anything from GREEN, say what it is and stop.** The worst version of this interview is a candidate who volunteers detail about the legacy modules they can't defend.
:::

:::check Red-line drills for Parts XXXVIII–XXXIX
- [ ] Five-day plan runs in order, with every exit criterion met — no skipping.
- [ ] The one-day crash plan executed once end to end.
- [ ] Every RED item answered without hesitation.
- [ ] Every GREEN item answered with exactly one sentence and no elaboration.
:::
