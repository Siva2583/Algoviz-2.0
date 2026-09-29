%PART: The hostile interviewer | PART XXXII | Fifty-five adversarial questions, grouped by the attack, with the answer that holds up.

# 58 · "You're bluffing" — the hostile round

> Some interviewers open with pressure on purpose. The test is not whether you know the answer; it is whether you stay inside the evidence when pushed. Every answer below follows one rule: **concede what is true, correct what is false, and never reach past what the code shows.**

## 58.0 The rules for this round

:::must Four rules for surviving a hostile round
1. **Never mirror the aggression.** Stay flat, factual and short.
2. **Concede fast and precisely.** "Yes — that's a real weakness, and here's what it costs." A candidate who concedes accurately is believed on everything else.
3. **Correct false premises explicitly.** "That specific claim isn't in the code — what's in the code is X." Do not accept a premise you did not make.
4. **End with the thing you can prove.** Every answer finishes at a file, a number, or a behaviour you can demonstrate.
:::

---

## Group A · "You didn't build this" (Q1–Q6)

**Q1. "This is clearly a tutorial project."**
"Parts of it are, and I'll point at them. The `/modules/core/*` pages are a deliberate reproduction of the classic visualizer pattern — a module page with a preview and a control panel, styled as lesson content. The distinguishing part is the recorded-frame lab: the generators, the reducer, the alignment formula, the persistence schema and the test suite are specific to this codebase and there's no tutorial that produces that arrangement. If you think a specific file is boilerplate, name it and I'll either agree or show you what's mine."

**Q2. "I've seen this exact design on YouTube."**
"Might well be — visualizers converge on the same shape: an array of frames, a cursor, a timer. What I'd ask you to compare isn't the shape but the details, because that's where the decisions are: the reducer's edge cases, the duplicate-id bug in merge sort's buffer, the disclosed precondition on the sliding window, the fact that the comparison panel refuses to rank the algorithms. Those are the parts that could have gone either way, and I can defend each one."

**Q3. "Prove you wrote it."**
"I can't prove authorship from this checkout: there's a single squashed commit and no co-author metadata, so Git gives you nothing. What I can do is be interrogated on any part of it — including the parts I'd change — and I'd rather be judged on that than on a commit log."

**Q4. "If you wrote it, tell me what's in `engine.js` line 137 without looking."**
"I'd rather look, honestly — I know the file's structure better than its line numbers. Line range 106 to 120 is `makeDataset`, the seeded generator with the LCG. If you want a specific behaviour: line 137 is inside `windowTrace`, and the whole of the counterexample lab's bug is one word there — the condition is `if (!buggy || sum === target)`, so the `buggy` flag swaps an `>=` for an `===`. That's the interesting line."

**Q5. "Your README says 'local-first'. That's marketing for 'I have no backend'."**
"Correct — and the README says the same thing in plainer words: no account, no server, no database, no network calls in the shipped app. 'Local-first' here means the entire application is a static bundle and experiments live in `localStorage`. I'd rather state the constraint than imply a service that doesn't exist."

**Q6. "What did you personally not understand while building this?"**
"The proportional alignment, the first time. I wrote it index-based, which broke immediately — selection sort's trace is 65 frames on the default input and bubble's is 118, so the secondary panel ran out of frames two-thirds through and then sat frozen. That's what forced the proportional formula, and it's why the first version of the feature is not in the repository. The other thing I got wrong was assuming merge sort's duplicate ids were harmless because they never reach the final frame — they're in 23 of 107 frames, and I only found that by measuring."

---

## Group B · "The architecture is wrong" (Q7–Q18)

**Q7. "Recording every frame is absurd. That's O(n³) memory."**
"It's worse than it needs to be, and I'll give you the number: the worst trace the app can produce is a reverse-sorted 24-element input under bubble sort — 1,154 frames, about 981 KB serialised. That's acceptable inside a 24-element cap and unacceptable outside it, which is exactly why the cap exists. The structural fix is not to record full snapshots: it's to record the operations and rebuild state, or to keyframe every k-th frame and replay forward. Both are real work and neither is in the repository — they're the first item on my own improvement list."

**Q8. "Why is `length` in the reducer state at all? You have `frames.length`."**
"Because a reducer is a pure function of its state and its action, and it can't see `frames`. It needs to know where the end is, so either `length` lives in the state or every action carries it. I chose the state, and I'll concede the cost: the length is now duplicated, and a code path that replaces the frames without dispatching `load` leaves the reducer's length stale. There's a derived clamp in the render that keeps that from being user-visible, but the correct fix is to remove the duplication rather than to guard it."

**Q9. "You compute the trace twice on every commit. That's just sloppy."**
"Yes, it is. `load()` calls the generator once to get the length for the `load` action, and the `useMemo` calls it again to build the frames. At this input size it's microseconds, so it's invisible — but it's a real inefficiency and it's the kind of thing that becomes a bug rather than a cost at scale, because the two calls are two chances to disagree. The fix is to derive the length from the memo, or to let the reducer take the frames."

**Q10. "Why is your reducer full of clamping logic? That belongs in the component."**
"Arguably. My reasoning was that the reducer is the only place that knows both the cursor and the length, so it's the only place that can enforce the invariant without duplicating the bound. The counter-argument is real: clamping hides invalid input. That's measurable here — `seek(2.5)` stores `2.5`, `seek(NaN)` stores `NaN`, and the clamp doesn't catch either, because it checks the range but not the domain. So the clamp gives you a false sense of completeness."

**Q11. "Your reducer's `default` branch returns the same state. That's how typo'd actions get swallowed."**
"That's exactly the risk, and it's a fair criticism. The benefit is that React bails out of the re-render when the reducer returns the identical object, which is what makes an unknown action a no-op rather than a render. The alternative is to throw on an unknown type in development — a `default` that throws when `NODE_ENV !== 'production'` — and I'd take that if I were doing it again."

**Q12. "Two different generations of code in one repo — the module pages and the lab — with different execution models. That's incoherent."**
"It is, and it's visible in the lint config: `react-hooks/set-state-in-effect` is disabled for `src/modules/**` only, with a comment saying why. Those pages run an async loop with a paused ref and a speed ref; the lab records frames and replays them. I migrated the pattern for the new surface rather than rewriting twelve working pages with no tests to catch a regression, and I labelled the boundary in code and in the README. If the question is whether I'd keep both forever: no — the modules should migrate onto the frame model, and that's a stated piece of planned work."

**Q13. "You have dead code in the repo."**
"I do: nine components under `src/components` — one of them is a zero-byte `Layout.jsx` — plus `SimpleSort`, `EfficientSort`, a context file and some CSS. None of them is imported; the production build confirms it, because the bundle contains one chunk graph from `main.jsx` and those files contribute nothing. They cost repo readability and nothing else, and deleting them is a one-line diff I'd rather do in daylight than have done silently."

**Q14. "The only network call in the repo is a hit counter in a component nobody imports. Why is that there?"**
"It's inside `CardsGrid.jsx`, which has zero importers, so it never executes — which is also why it isn't a privacy issue in the shipped build. It's leftover from an earlier shell. If it were live I'd remove it, because a third-party counter in a local-first app contradicts the README's own description."

**Q15. "Why does `Home.jsx` hold all seventeen routes in one file?"**
"Because routing here is a table, not a hierarchy: seventeen flat paths with no nesting, no nested layouts and no loaders, so a single declarative table is the shortest true description of the app's surface. The cost is that the file is a hundred lines of literal data, and the moment a route needs auth, a layout or a loader, that file becomes the wrong shape and should split."

**Q16. "There's no error boundary. So one bad route takes down the app."**
"Correct, and there's no boundary anywhere in the tree. It's a real gap: a throwing module unmounts the whole app instead of showing an error in one pane. `Suspense` gives you a loading fallback, not an error fallback, and it's a common confusion — I'd add a boundary inside each lazy route so the shell survives. I'd rather name it than have you find it."

**Q17. "Your `App.jsx` is twelve lines and renders one component. Why does it exist?"**
"Because `main.jsx` should be about mounting and `App` should be about composition — the moment the app needs a provider, a boundary or an auth gate, that belongs in one place and not in the mount file. Today it's a pass-through, and I'd say so on the way in rather than pretend it's doing work."

**Q18. "No state management library. Is that a choice or a limitation?"**
"A choice, and the sizing is deliberate: the shared state is a cursor and a boolean, and it's consumed by one component. Redux or Zustand for that would be more machinery than the problem. What I'd flag is that `SortingLab.jsx` is 596 lines with ten `useState` calls plus a reducer, and that's the honest smell — not the absence of a library, but the size of the component that made one unnecessary."

---

## Group C · "Your tests prove nothing" (Q19–Q28)

**Q19. "150 test cases is a made-up number. Real test suites are thousands."**
"The number isn't the claim. The claim is twenty-five inputs per algorithm, chosen to cover four specific failure modes — empty, single, duplicates, and sign — plus twenty seeded random ones, with four assertions each: sortedness, input preservation, trace reproducibility, and final-frame uniqueness. Reproducibility is the unusual one, and it's a product requirement rather than a nicety, because a saved experiment stores a frame index and is meaningless if a re-run reorders frames."

**Q20. "You assert the final frame is sorted. Any sort that returns a sorted array passes. That's trivial."**
"Agreed — that alone is nearly worthless, and I'd never defend it as the suite's value. The three companions are what carry the weight, and specifically trace reproducibility, which deep-compares the entire recording including every message string and every counter snapshot. A single field differing anywhere in 1,154 frames fails it."

**Q21. "Your id assertion only checks the last frame. That's why your merge bug exists."**
"That's the strongest criticism of the suite and I agree with it completely. The assertion is on `frames.at(-1)`, and the duplicate-id frames are in the write-back phase — 23 of 107 on the default input. The fix is two lines: move the uniqueness check inside the per-frame loop. That change turns a browser console warning into a CI failure, and it's the first thing on my list."

**Q22. "768 cases on length-3 arrays is a toy. What about length 10?"**
"Length three with values one to four is what makes exhaustiveness affordable, and the honest reading is that it verifies agreement with an independent oracle on a bounded box, not correctness in general. The property it's actually protecting is the counterexample detector, which is the app's own instrument — if the detector stopped finding real divergences, that test fails. For broader coverage the lever isn't more cases of the same shape, it's length four and five with a wider value range, plus property-based generation."

**Q23. "Your oracle could have the same bug as your implementation."**
"That's precisely why it's written inline in the test file rather than imported: the oracle is O(n²) triple-nested enumeration, the implementation is a two-pointer walk. Different mechanism, no shared code. The one thing they do share is the specification — `sum >= target`, which is the definition of the problem, so by construction the test can't catch a misreading of the spec. That's why the counterexample lab exists and why it's labelled a plausibility check rather than a proof."

**Q24. "You have no component tests at all."**
"Correct — no React Testing Library, no jsdom, no browser automation. The suite is `node:test` over pure modules: the generators, the reducer, the parser, the dataset generator, the window function, the counterexample search. That means the reducer's transitions are tested directly and *rendering* is not tested at all. I'd add component tests for the reducer-to-timer wiring, because 'play for one second and stop' is behaviour I cannot verify today — and I'd start there rather than with snapshot tests."

**Q25. "No coverage percentage anywhere. So you don't know what's tested."**
"That's a gap, and I'd frame it as an incomplete metric rather than a missing one: lines covered says nothing about the assertions' strength, and the merge bug is the proof — the generator has near-total line coverage and a real defect in the frames it emits. What I'd add is a mutation check or, more cheaply, the per-frame assertions that make this class of bug detectable."

**Q26. "If CI passes, can I deploy?"**
"No, and I wouldn't say so. CI runs tests, lint and a production build on Node 22. It establishes that the pure modules behave, the style rules hold and the bundle builds. It cannot establish that playback looks right, that the layout survives a narrow viewport, that the timer wiring is correct, or that the alignment formula produces something readable. Zero browser automation exists in this repository."

**Q27. "Your test command has no watch mode and no reporting. That's a hobby setup."**
"It's the Node built-in runner with no test dependency at all, which was the choice — the suite is fast, the assertion library comes from `node:assert/strict`, and the workflow is four steps: `npm ci`, `npm test`, `npm run lint`, `npm run build`. If I needed parallel shards, coverage thresholds or reports I'd move to a runner that provides them; for fourteen test groups over pure functions I'd rather have zero test dependencies."

**Q28. "You test the reducer's edge cases you happened to think of. Where's the property test?"**
"That's a fair hit and the reducer is the cheapest place in this codebase to add one: assert that for any sequence of actions from a fixed set, the cursor stays inside `[0, length-1]`, the cursor stays an integer, and reaching the last frame always leaves `playing` false. It found something the moment I looked at it by hand — `seek(2.5)` stores a non-integer, which means the invariant as I've stated it is *false* today. So the property test wouldn't have just added coverage; it'd have failed."

---

## Group D · "The product is trivial" (Q29–Q38)

**Q29. "Six sorting algorithms a first-year can write. Where's the difficulty?"**
"The algorithms aren't the difficulty, and I wouldn't claim they are. The difficulty is the instrumentation: making a synchronous algorithm emit a complete, immutable, deterministic, human-explainable history while keeping the array the source of truth for the final result, so the trace and the algorithm can't disagree. That's an inversion of the normal relationship — normally the algorithm's output is the deliverable and you throw the intermediate state away."

**Q30. "A visualizer is a toy. Nobody uses it."**
"I have no usage numbers and I won't invent any — the app has no analytics and no accounts, by design. What I'd say is that the interesting engineering isn't adoption, it's that visualization forces you to expose state you'd otherwise discard, and that constraint produced genuinely non-obvious findings: the duplicate-id bug, a comparison counter that increments on leaves, a precondition asymmetry between the reference function and the one that validates."

**Q31. "Why 24 elements maximum? Because it looks like a toy."**
"Because of what one frame costs — a full clone of the array plus a clone of the counters, per instrumentation point — and because of what the screen can show. The worst trace at that cap is 1,154 frames and about a megabyte serialised. I could raise the cap and freeze the tab; I could lower it and lose the reverse-sorted cases. Twenty-four is a stated bound rather than a discovered one, and raising it is exactly why delta frames are the first item in the improvement plan."

**Q32. "You don't handle the case where the array has more than 24 elements."**
"I don't, and I say so on screen: the validation message is 'Use 2–24 values. Small inputs keep every operation inspectable.' Refusing is the design; silently truncating or accepting-and-freezing would be worse. If someone needs sorting at scale, this is the wrong tool and the README's own description says what it is."

**Q33. "Your UI has footnotes. Real products don't footnote their own graphs."**
"They do when the graph invites an inference the data can't support. Two bars labelled 'comparisons' next to each other read as a ranking; the footnote is what stops the product from claiming something the counters don't measure. I'd rather a slightly denser panel than a misreading — and a senior interviewer has usually been on the receiving end of a product claiming more than its data."

**Q34. "Where's the dark mode toggle?"**
"There isn't one. The styling is a set of custom properties in `lab.css` and Tailwind is used in one place, so they're all in one file — a `data-theme` attribute on the root plus a second block of variables would do it. It's a real gap in polish, not a limitation of the design."

**Q35. "No keyboard shortcut help, no onboarding."**
"Guarded shortcuts exist — Space, the arrow keys — with an ignore-list for form fields, and there's no discoverability UI for them. The two pages carry introductory copy rather than a tour. That's a product gap: the shortcuts are invisible unless you read the code, which is the wrong place for a user to find a feature."

**Q36. "What happens on small screens? The lab has six panels."**
"The layout is media-query driven at four breakpoints, with a reduced-motion query, and at the narrowest the panels stack vertically rather than disappear — so the trace stays visible and the inspector moves below it. It's usable at the narrowest breakpoint but it's not optimised for it; the comparison panel's two arrays side by side compress the bars considerably and I'd stack them at that width rather than shrink them."

**Q37. "Your bar heights use a 25% floor, so the visualisation lies about the values."**
"That's a real distortion and I'll name it precisely: the height is `25 + (|val| / max(|val|)) * 75`. So a zero-valued element renders a bar a quarter of the maximum height, and the mapping is affine rather than proportional to the value. The reason is legibility at small magnitudes and it's not disclosed. The fix is either a true proportional scale with a minimum render height of a few pixels, or a documented note — and I'd want the note if the floor stayed."

**Q38. "Why does the shuffle button reload seed 42 the first time?"**
"Because the shuffle does `setSeed(seed + 1)` and then loads with the *current* seed — which at mount is 42. So the first click shows seed 42's dataset and the sequence effectively starts one step behind. It's a genuine off-by-one in the interaction, not the dataset generator, which is deterministic and asserted."

---

## Group E · "Your numbers are made up" (Q39–Q46)

**Q39. "1,154 frames. Did you count that or guess it?"**
"Counted, by importing `engine.js` into a Node script and running every algorithm over the reverse-sorted 24-element input. Bubble sort produces 1,154 frames; its serialised size is about 981 KB; selection is 492, insertion 876, merge 375, quick 632, heap 348. I can re-run the script and show you the table."

**Q40. "Compare bubble and merge — bubble does more comparisons, so bubble is slower. Right?"**
"Bubble does more comparisons here, but comparisons are a count of decisions, not a measure of time. Merge does fewer comparisons and *more* writes — 24 writes against bubble's 16 exchanges on the default input — so the counters don't produce a ranking. What genuinely matters is that bubble is quadratic and merge is n log n, and at 24 elements you can't see that difference in any of these numbers."

**Q41. "Is the percentage alignment a measurement of execution time?"**
"No. The percentages are positions in two recorded sequences. The caption says 'aligned by percentage of trace—not equivalent operations', and the panel text says there are no wall-clock claims. If both traces were timed, the alignment would still be positional — the alignment and the timing are unrelated concerns."

**Q42. "You said 150 cases. Is it 150 or 300?"**
"150 is the algorithm-input count: six algorithms times twenty-five inputs. Each of those runs four assertions, so if you prefer counting runs rather than cases you get 600. Both numbers are true; the one I quote is the narrower one, because it's the one that maps to the loop bounds in the file."

**Q43. "Does the app measure speed at all?"**
"No. There's no `performance.now()`, no `Date`-based timing, and nothing in the UI is labelled with a duration. The one thing that has a duration is the playback speed control — 600, 300, 160 and 50 milliseconds per frame — which is a viewing preference, not an algorithm property."

**Q44. "Your heap sort counters are inflated. So the comparison is broken."**
"The counter is inflated relative to a hand-written comparison count, because `heapify` increments twice per call regardless of whether the children exist — verified directly: the counter rises even on a leaf with no children. It's not corruption, it's a definition. The panel carries a footnote that comparison counts are implementation-specific and it uses comparisons only, which is the one counter where the definitions agree."

**Q45. "Merge sort's exchange count of 24 is nonsense for eight elements."**
"It's a write count, not a swap count. Merge sort never swaps; it copies out of a buffer and writes back, and every one of those writes increments the exchange counter. Eight elements across seven merges with the tail copies gives 24 writes. The UI labels it 'recorded exchanges' and the footnote says the exchange counter is counted differently per generator. The honest fix is to rename the counter per algorithm."

**Q46. "How do I know your 768 number isn't just printed in the docs?"**
"Because the loop bounds produce it: 64 arrays times 12 targets. The 64 comes from all three-element arrays over the digits 1 to 4 — four to the third — and the targets run 1 to 12. Run `npm test` and the group executes 768 comparisons against the inline brute-force oracle. If you want to see the arithmetic, it's two nested loops in `tests/engine.test.js`."

---

## Group F · "You're hiding something" (Q47–Q55)

**Q47. "What's the worst bug in this codebase?"**
"The merge sort duplicate-id bug: the buffer write-back stores shallow clones, so the same id exists twice in the main array for the write-back frames, and `ArrayView` keys columns by id. Twenty-three of 107 frames on the default input; 141 of 375 on the reverse-sorted 24. It's a real defect, it produces a React duplicate-key warning, and my own test suite misses it because the id assertion only covers the final frame."

**Q48. "What breaks first under load?"**
"Frame storage. Every frame is a full cloned array plus a cloned counter object, so memory grows with instrumentation density times array length — the worst case in the app is about a megabyte of serialised frames for one trace. Right after that comes the render, because `ArrayView` maps every element on every frame with no virtualization, and then the comparison mode, which doubles both."

**Q49. "What's not implemented that a reviewer would assume is?"**
"Five things worth naming: no error boundary; no component or browser testing; no dark mode; no shareable URL for a full experiment, only `?algorithm` and `?compare`; and no export format other than the single-experiment JSON. Also, four fields the frame schema carries that the app's UI never draws: the swap flag, the sub-array range, the tracked minimum and merge sort's buffer offset. Two unimported legacy files do read them, which is why I'm precise about saying the *shipped* UI doesn't."

**Q50. "You claim a trust boundary. Where's the code that enforces it?"**
"Three places. The import path, where every field is re-validated and `Object.hasOwn` is used instead of `in` so a crafted algorithm key can't walk the prototype chain; the storage read path, with a try/catch, a shape check and a filter that drops unknown algorithms; and the URL path, where `?algorithm` is checked against the registry before use. What I do *not* claim is that those make the app secure — there's no authentication, no server and no user data to protect. The boundary is about not executing or rendering something a file told me to."

**Q51. "Your saved data includes user input. Is that a privacy issue?"**
"There is no personal data in a record: an algorithm key, an array of integers, a frame index and a timestamp. It stays in the user's own browser and is never transmitted — there's no code path that sends anything anywhere. The exposure is exactly what `localStorage` is: readable by any script on the same origin, so any XSS would read it. The app renders user text through JSX interpolation rather than raw HTML, which is what makes script injection by-construction unlikely, but I wouldn't describe it as a security guarantee."

**Q52. "If I give you a JSON file with a million entries, what happens?"**
"It's rejected before parsing, by the size gate: 16,384 bytes. That bound exists so a large file can't be parsed into a gigabyte of array before the shape check runs. What it doesn't do is stop a small file that expands — there's no depth limit on the parsed object, though JSON.parse doesn't execute anything and the shape gates reject anything that isn't the expected flat form."

**Q53. "What happens if the algorithm is deleted from a future version but the user has saved experiments using it?"**
"Those records are dropped on read rather than crashing: the filter requires the algorithm key to still exist in the registry. The consequence is silent data loss for that record, which I'd rather surface — a 'three saved experiments could not be loaded' notice. Dropping is the safe half of the trade; telling the user is the missing half."

**Q54. "What happens if the team changes frame ordering in a release?"**
"A saved cursor becomes meaningless — it addresses an index, and the record stores an index, not a semantic position. That trade-off is in the README. Two ways out: store the cursor as a fraction of the trace, which survives reordering but not regression, or store the `codeLine` plus the counters and resolve on load, which is the robust version and needs the frames to be stable enough to search. Neither is implemented."

**Q55. "Tell me something about this project that isn't in the README and isn't in the code."**
"Then I'd be making it up, and I won't. What I can give you is something the README doesn't say: the strongest thing I've learned from building it is that instrumentation is a design decision, not a logging concern. Where you put a snapshot determines what a user can be told, and where you *don't* put one becomes a feature gap — merge sort's buffer is invisible because there's no frame exposing it, not because nobody thought of the idea. The generator emits the flag for it; the renderer just doesn't read it."

:::must The one-sentence landing for a hostile round
"Everything I've told you is either in a file you can open, a number I can re-measure, or a limitation I named first. Where I don't know, I'll say I don't know — and I'd rather be trusted on the small things than impressive on the big ones."
:::

:::check Red-line drills for Part XXXII
- [ ] Answer the six "you didn't build this" questions without being defensive.
- [ ] Name the four architectural criticisms you *agree* with and their fixes.
- [ ] Recite the merge duplicate-id bug and the two-line test fix.
- [ ] Recite the worst-trace numbers: 1,154 frames, ~981 KB, bubble on reverse-24.
- [ ] Explain why the bars' 25% floor is a real distortion.
- [ ] Answer Q49 — the five things a reviewer would assume exist.
:::
