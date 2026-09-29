%PART: Testing and verification | PARTS XVII–XX | The real test runner, the 150 cases, trace reproducibility, and the 768 brute-force comparisons.

# 43 · The testing architecture, as it actually is

> No Jest. No Vitest. No Playwright. Node's built-in test runner — and that is a deliberate, defensible choice.

## 43.1 The mechanism, verified from `package.json`

```json
"scripts": {
  "test": "node --test tests/*.test.js"
}
```

| Aspect | Reality |
| --- | --- |
| Runner | **Node.js built-in test runner** (`node:test`), available since Node 18 and stable in Node 20+ |
| Assertion library | **`node:assert/strict`** — Node's built-in strict assertion module |
| Test file | One: `tests/engine.test.js`, 140 lines |
| Test groups | **14** (verified by running: `# tests 14`, `# pass 14`, `# fail 0`) |
| Dependencies added | **Zero** — there is no test dependency in `package.json` |
| Watch mode | Not used (`node --test --watch` exists, but no script uses it) |
| Coverage tooling | None |
| DOM environment | None. Tests run in plain Node, which is why they can import the generators directly |
| Snapshot testing | None |
| Mocking library | None |

:::must The sentence that makes this a strength, not a shortfall
"AlgoViz tests with Node's built-in runner and `node:assert/strict` — there is no test dependency in `package.json` at all. That was possible because I deliberately kept the engine framework-free: `engine.js` and the six generators import nothing, not even React. A pure module that takes an array and returns an array is testable by importing it in Node. If I had put the frame generation inside a component, I would have needed a DOM environment, a JSX transformer and a test framework — and I'd have been testing React instead of testing the algorithms."
:::

## 43.2 What the test file covers, group by group

| # | Test group | Assertions | Category |
| --- | --- | --- | --- |
| 1–6 | `<id>: correctness, input preservation and reproducible trace` — one group per algorithm | 25 inputs each: sorted output, input unchanged, `deepEqual` against a second run, final-frame ID uniqueness | Unit + property |
| 7 | `input validation rejects ambiguous, unbounded and malformed values` | 7 `assert.throws` cases + 1 positive case | Unit (boundary) |
| 8 | `playback keeps final state, pauses on seek and bounds its cursor` | 7 state assertions on the reducer | Unit (state machine) |
| 9 | `datasets reproduce from a seed` | Same seed equal; different seeds unequal | Unit (determinism) |
| 10 | `sliding window regression: at least is not exactly` | 3 assertions pinning the corrected behaviour | Regression |
| 11 | `bounded differential search finds a reproducible failure` | The search finds a mismatch, is reproducible, and returns exactly `[2]` with target `1` | Differential search |
| 12 | `window reference matches brute force within bounded domain` | 768 assertions against an in-test oracle | Differential (oracle) |
| 13 | `pathfinding is repeatable, preserves input and reports unreachable goals` | BFS and DFS paths, input preservation, a known 5-node path, and an unreachable case | Integration |
| 14 | `prefix sum validates ranges and handles full-range query` | A correct full-range sum and an invalid range | Unit (validation) |

## 43.3 Unit vs integration vs end-to-end — what exists here

| Layer | Exists? | Evidence |
| --- | --- | --- |
| **Unit tests** | **Yes** | `parseInput`, `playbackReducer`, `makeDataset`, `windowTrace`, `generatePrefix` are all called directly |
| **Property-style tests** | **Yes, in a limited form** | 20 generated inputs per algorithm with assertions that must hold for all of them. This is a hand-rolled property test without a framework (no shrinking, no random generation — the inputs come from a fixed seed list) |
| **Differential / oracle tests** | **Yes** | The sliding-window implementation checked against an independent brute-force implementation over 768 cases |
| **Regression tests** | **Yes** | The `at least is not exactly` group pins a previously-fixed bug |
| **Integration tests** | **Partially** | The pathfinding test assembles a grid and runs the full entry point; the sorting tests run the complete generator |
| **Component tests** | **No** | No test renders a React component; no `react-dom`, no `@testing-library`, no DOM environment |
| **End-to-end / browser tests** | **No, not in the repository** | No Playwright, Cypress, Puppeteer or Selenium dependency exists. The browser verification described in `docs/VERIFICATION.md` was performed manually with external tooling, and the README is explicit that it is "not a repository-contained automated browser suite" |
| **Accessibility tests** | **No** | `docs/VERIFICATION.md` states it is not a WCAG certification |
| **Visual regression tests** | **No** | Documented as not performed |

:::danger The three sentences that make this answer safe
1. "There is no browser automation in the repository, and I don't claim there is." [VERIFIED]
2. "The browser checks in `docs/VERIFICATION.md` were run manually with headless Chromium at 1440 px and 390 px, outside the app's stack — they're smoke checks, not a suite." [VERIFIED — that document says exactly this]
3. "What the repository *automates* is the engine: 14 groups covering sorting correctness, reproducibility, playback transitions, validation, seeded datasets, the window oracle, the bounded search, pathfinding and prefix sums."
:::

## 43.4 What the tests deliberately do not cover, and why

| Not covered | Reason | Risk it leaves |
| --- | --- | --- |
| `SortingLab.jsx` (596 lines) | Would need a DOM environment and a component testing library | The timer effect, the keyboard effect, save/import/export and the derived cursor clamp are all untested |
| The import/export path | Same | Six validation gates with zero assertions — the project's biggest test gap |
| `Counterexample.jsx`, `Overview.jsx`, `Shell.jsx`, `ModuleFrame.jsx` | Presentation | Low algorithmic risk |
| The twelve legacy module components | Would require simulating `async` timing | Their logic modules are partly covered (pathfinding, prefix sum) |
| Cross-module interactions | Not in scope | The route/URL behaviours (`?algorithm=`, `?compare=1`) |
| Performance | No benchmark harness | The 24-element cap makes it moot, and the README says it is not a benchmark platform |

:::q "Your test suite has no component tests. Why?"
"Because I'd have needed to add a DOM environment and a component testing library, and I made a judgement that the value was highest at the engine layer. The engine is where correctness lives — if a trace is wrong, the app is wrong regardless of how it renders, and a wrong trace is invisible: the UI would faithfully show you the wrong thing. The component layer is mostly presentation plus two effects, and I covered the effects by reasoning about them plus manual browser checks. I'm not claiming that's sufficient — save/import has six validation gates and no test, and that's the first thing I'd add, along with a test for the playback effect using fake timers."
:::

:::q "Would you add a test framework now?"
"Only if I was adding component tests, and I'd look at Vitest first because the project is already on Vite — it reuses the same transform pipeline and config, so the marginal setup is small. For the engine tests I wouldn't change anything: `node --test` costs zero dependencies, runs in under a second, and reports TAP output that CI reads without configuration. Adding Jest to test pure functions would be adding 300 packages to prove that `[3,1,2].sort()` works." [PROPOSED]
:::

---

# 44 · The 150 sorting cases

> Where the number comes from, what is asserted, and exactly how much it proves.

## 44.1 The generator of the 150

@@code tests/engine.test.js 12 36

| Component | Count | Detail |
| --- | --- | --- |
| Algorithms | **6** | `bubble, selection, insertion, merge, quick, heap` — iterated with `Object.entries(algorithms)` |
| Inputs per algorithm | **25** | 5 hand-written + 20 generated |
| **Total algorithm-input cases** | **150** | 6 × 25 |
| Assertions per case | **4** | Output correctness, input preservation, trace determinism, final ID uniqueness |
| **Total assertions in this group** | **~600** | 150 × 4 |

## 44.2 The 25 inputs, broken down by category

| # | Input | Category | What it exercises |
| --- | --- | --- | --- |
| 1 | `[]` | Empty | Every loop guard; the `n = 0` path in all six generators |
| 2 | `[1]` | Single element | Base cases: quick sort's `low >= high`, merge sort's `low >= high` |
| 3 | `[2, 2, 1]` | Duplicates | Equal keys, stability-relevant behaviour, `minIndex` not changing in selection sort |
| 4 | `[-4, 0, 3, -1]` | Negatives and zero | Comparisons on negative values; the UI's `Math.abs` for height; the `-?` branch of the validation regex |
| 5 | `[5, 4, 3, 2, 1]` | Reverse-sorted | The worst case for bubble and quick (last-element pivot) |
| 6–25 | `makeDataset("random", seed)` for `seed = 0…19` | 20 seeded random datasets of exactly 10 values each | Bulk coverage of ordinary inputs, all reproducible |

:::must The precise claim, in one sentence
"150 is 6 algorithms × 25 inputs. Five inputs are hand-picked edge cases — empty, single, duplicates, negatives and zero, and reverse-sorted — and the other twenty are seeded random datasets of ten values each, generated deterministically from seeds 0 through 19. Because the same seed produces the same array, all six algorithms are tested on the *same* twenty-five arrays, which means the six groups are comparable to each other."
:::

## 44.3 The four assertions, precisely

```
FOR each algorithm in {bubble, selection, insertion, merge, quick, heap}:
  FOR each input in the 25:
     before := copy of input
     frames := algorithm.run(input)

     (1) SORTED OUTPUT
         assert.deepEqual(
            frames.at(-1).array.map(x => x.val),
            [...input].sort((a,b) => a - b)
         )
         -> the final frame holds the correctly sorted values
         -> note: compares values only, using the same comparator as the oracle

     (2) INPUT PRESERVATION
         assert.deepEqual(input, before)
         -> the generator did not mutate the caller's array
         -> this is what makes "same input" in comparison mode structurally true

     (3) TRACE REPRODUCIBILITY
         assert.deepEqual(frames, algorithm.run(input))
         -> a second run produces a deep-equal trace, frames and metadata included
         -> this is the strongest assertion in the suite: it pins the whole recording

     (4) FINAL ID UNIQUENESS
         assert.equal(new Set(frames.at(-1).array.map(x => x.id)).size, input.length)
         -> every original element appears exactly once in the final frame
         -> catches dropped, duplicated or merged elements
```

:::key Why assertion (3) is the most interesting
`deepEqual` on `frames` compares the *entire* recording: every frame, every field — the array contents and order, the ids, `activeIndices`, `sortedIndices`, `isSwapping`, `minimumIndex`, `codeLine`, `currentStats` (all three counters at that moment) and `msg` (the exact string, with its interpolated values). If a generator used `Math.random()`, a `Date`, a `Set` iteration order that varied, or an object key order that depended on insertion path, this assertion would fail.

So the assertion is really a **test of determinism as a property**, not just "the output matches". That is the difference between a sorting test and a *trace* test — and it is the part that is specific to this project. [VERIFIED]
:::

## 44.4 Attack: "Does 150 prove correctness?"

:::answer The nuanced answer — memorise this shape
"No. And I'd be suspicious of anyone who said it did. What 150 cases prove is that the final frame of every trace is correctly sorted, that the generators don't mutate their input, that the traces are reproducible, and that no element is lost or duplicated — for those 150 algorithm-input pairs. What they cannot prove is anything about the infinitely many other inputs.

The honest framing has three parts. **First, what it does prove:** correctness on a stated set, plus four *properties* — sortedness, purity, determinism, and element conservation — and the property assertions are the more valuable half, because they generalise beyond the specific values even though they don't generalise beyond the tested sizes.

**Second, what it's weak at.** Coverage is thin exactly where bugs live in sorts: the twenty random datasets are all ten values drawn from 5–94, so the suite tests almost nothing at n = 2 or 3 (where off-by-one errors actually occur), nothing with mass duplicates beyond `[2,2,1]`, and nothing at 24 elements — the app's own maximum. The `duplicates` preset that the UI offers is not in the test inputs at all, except as `[2,2,1]` and seed 7's dataset, which happens to contain a repeated value. Sizes above 10 are exercised only by the hand-written 5-element and 4-element cases.

**Third, what would strengthen it:** add inputs of every length from 2 to 24 rather than 4 distinct lengths; add an all-equal array like `[5,5,5,5]` and a mostly-equal array; add the `duplicates` preset; and add a *property* test that generates random arrays of random length 2–24 from a seeded generator, so the sizes are not fixed. The cheapest single improvement is one line — include `makeDataset("duplicates", seed)` in the input list — because the duplicates path is where stability and `minIndex` bugs appear, and it is one of the four presets the product advertises."

Then close with the boundary sentence: **"A finite test suite demonstrates the presence of correctness, never its absence. Testing shows that bugs are present, not that they are absent — and with 150 cases in a space that has more than 10⁵⁰ arrays of length 24, the coverage rate is a rounding error, which is exactly why the assertions are properties rather than a golden-output file."**
:::

:::trap The follow-up trap: "Then why 150 and not more?"
The bad answer is "more would be better, I just didn't have time." The good answer: *"Because at n ≤ 24 a generator can run the whole space for small sizes if I want — 4³ arrays of length 3 with values 1–4 is 64 exhaustive cases, which is what I did for the sliding window. The reason the sorting group is 150 rather than exhaustive is that the *exhaustive* space explodes: all arrays of length 24 with distinct values is 24! ≈ 6×10²³. So for sorting I chose breadth through seeded sampling and depth through properties. The place where exhaustive testing was actually feasible — the window problem with values 1–4 and length 3 — I did exhaustively. That's the same reasoning a test designer should apply, and it's the reason I can point at two different coverage strategies in one suite and explain why each fits its problem."*
:::

---

# 45 · Trace reproducibility

> The property that makes a frame-based tool trustworthy — and that an ordinary sorting function never needs.

## 45.1 The concept, precisely

```
   run(input) -> trace A
   run(input) -> trace B
   A must be deep-equal to B

   deep-equal means: every frame, every field, every nested value —
   array order, element ids, values, activeIndices, sortedIndices,
   isSwapping, minimumIndex, pivotIndex, subArrayRange, codeLine,
   currentStats.{passes,comps,swaps}, and every character of msg.
```

## 45.2 Why this matters *more* here than in a sorting utility

| In a sorting utility | In AlgoViz |
| --- | --- |
| You observe one thing: the output array | You observe *every intermediate state* |
| The output is a permutation — easy to check independently by comparison | Intermediate states have no external oracle; the recording *is* the definition of correct behaviour |
| Non-determinism that still produces the correct output is usually harmless | Non-determinism in intermediate states means the user sees different decisions for the same input |
| Determinism is a nice property | **Determinism is the product promise**: "reproducible experiments" is in the page metadata, the README, and the save/export feature |

:::must The sharpest way to put it
"If the final array is right but the intermediate frames differ between runs, then the visualisation is lying about the algorithm's behaviour — the learner would see one thing and someone else would see another for the same input and the same code. And my saved experiments store a *frame index*: if frame 42 means a different moment on the next run, my saved and exported files become meaningless. So reproducibility isn't a nice-to-have in this project, it's the reason the save format can store just a cursor instead of a whole trace."
:::

## 45.3 What could break reproducibility — the checklist

| Source of non-determinism | Present in AlgoViz? | Evidence |
| --- | --- | --- |
| `Math.random()` in a generator | **No** | The generators contain no `Math.random()`; `makeDataset` uses a seeded LCG instead |
| `Date.now()` / timestamps in a frame | **No** in frames. `createdAt` exists only in the *saved record*, which is not part of the trace | `new Date().toISOString()` appears once, in `save()` |
| Object key iteration order | **No** — frames are object literals with a fixed key order, and `deepEqual` on objects is order-insensitive in Node's strict module for `deepStrictEqual`... but the *string* comparison of `msg` is order-sensitive and the messages are pure templates | — |
| `Set` / `Map` iteration | **No** — neither appears in the generators | — |
| Floating point | **No** — inputs are integers and the only arithmetic is comparison; `makeDataset` uses integer LCG arithmetic with `Math.imul` and `>>> 0` | — |
| Mutating shared state between runs | **No** — each `run()` allocates its own `arr`, `frames`, `stats` and `sortedIndices`. There is no module-level mutable state in any generator, so two calls cannot interfere even if interleaved | — |
| Reading the clock or environment | **No** | — |
| Iteration order of an object being sorted | **No** | — |

:::key Why the test is *able* to be this strict
Because every input to a frame is either a number, a string from a fixed template, a boolean, or a freshly allocated literal. There is no ambient state, no I/O, no clock. So `deepEqual` is not testing "the same thing happened twice" — it is testing "the function is a pure function of its input", which is the property a test *can* establish. If a generator read the clock, the test would fail — and that is exactly the value of writing it.
:::

## 45.4 The question in this area you should expect

:::q "What if the final output matches but the intermediate frames differ?"
"That would be a genuine bug that only the trace assertion catches — and it is a bug this project would actually care about, unlike a sorting library. Two cases: if the difference is in the data (a different sequence of swaps that happens to sort correctly), then the visualisation teaches a different algorithm than the code under test. If the difference is in the metadata — say `activeIndices` or the counters at some frame — then the explanations attached to the frames are wrong. Both are user-visible, and neither is caught by asserting only on the final array.

That's the reason the test asserts `deepEqual(frames, algorithm.run(input))` rather than `deepEqual(finalValue, sorted)`. The final-value assertion is one line; the trace assertion is what makes the recording a testable artefact. And it's the assertion that would catch the two things most likely to sneak into this codebase: a `Math.random()` used for a nice-looking jitter, or a frame that captured a mutable reference to something still being modified."

Then add the boundary, because it is the part that shows depth: *"What the assertion does not establish is that the trace is the *same* trace for a different engine version, or across Node versions, or after I refactor a generator. It establishes determinism within one implementation, not stability of the recording across implementations — that's the caveat that makes my saved cursor potentially mean something different after a code change."*
:::

---

# 46 · The 768 sliding-window cases and the brute-force oracle

> The differential test, explained end to end — including why an independent implementation is the point.

## 46.1 The problem under test

Find the length of the **shortest contiguous subarray whose sum is at least a target**, or 0 if none exists.

Both implementations in AlgoViz expand and shrink a window over positive numbers:

- **Reference (correct)** — records every window whose sum satisfies `sum >= target`.
- **Buggy variant (deliberate)** — records only windows whose sum is exactly `target`, silently ignoring larger sums.

The buggy variant lives inside `windowTrace` behind a `buggy` flag, so both behaviours are produced by the same function and can be executed side by side. [VERIFIED in `engine.js` lines 121–151]

## 46.2 The 768 cases

@@code tests/engine.test.js 82 101

| Component | Count | Detail |
| --- | --- | --- |
| Arrays | **64** | All combinations of three values, each in `{1,2,3,4}` — that is 4³ = 64, **exhaustive** over that domain |
| Targets | **12** | `1` through `12` |
| **Total cases** | **768** | 64 × 12 |

**How the array is built** — the digit-extraction trick:

| Iteration | Digit produced | Expression |
| --- | --- | --- |
| code % 4 | 1st value (least significant) | `(code % 4) + 1` |
| ⌊code / 4⌋ % 4 | 2nd value | `(Math.floor(code / 4) % 4) + 1` |
| ⌊code / 16⌋ % 4 | 3rd value | `(Math.floor(code / 16) % 4) + 1` |

So `code = 0` → `[1,1,1]`, `code = 1` → `[2,1,1]`, `code = 63` → `[4,4,4]`. Every array of length 3 with values from 1–4 appears exactly once. [VERIFIED]

## 46.3 What an oracle is

:::must Definition
An **oracle** is an independent mechanism that can decide whether a given answer is correct — without using the implementation being tested. The word means "something that gives the right answer", not "a magic solution". In testing, the oracle is usually the slow, obviously-correct implementation: brute force, a reference model, or a specification.

The rule that makes an oracle useful: **it must not share code with the implementation under test.** If the oracle uses the same helper functions, a bug in a helper infects both sides and the test passes while both are wrong. This is called *correlated failure*, and it is the standard way differential tests give false confidence.
:::

## 46.4 The oracle, line by line

```
   let best = Infinity;
   for (let l = 0; l < a.length; l++) {        // every start position
     let sum = 0;
     for (let r = l; r < a.length; r++) {      // every end position >= l
       sum += a[r];                            // running sum of a[l..r]
       if (sum >= target) best = Math.min(best, r - l + 1);
     }
   }
   // expected = best === Infinity ? 0 : best
```

| Property | Why it matters |
| --- | --- |
| Time complexity **O(n³)** as written (O(n²) subarrays, and the running-sum accumulation makes counting the inner work O(n) per start — overall O(n³) worst case; here n = 3, so at most ~27 additions per case) | Deliberately naive; clarity over speed |
| It enumerates **every** contiguous subarray | Nothing can be missed by a windowing error, because there is no window |
| It is written **in the test file**, not imported | Zero shared code with `windowTrace` — which is what makes this a real oracle |
| It uses the same condition `sum >= target` | The specification is "at least", so the oracle must express "at least". This is the one thing the oracle and the implementation *must* agree on, because it is the requirement |
| It returns 0 for "no qualifying window" | Matches the implementation's `mini === Number.MAX_VALUE ? 0 : mini` convention |

:::danger The critical distinction that earns you the point
The oracle must share the **specification** with the implementation but not the **mechanism**.

It is correct — indeed essential — that both use `sum >= target`, because that is the definition of the problem. If the oracle used `sum > target`, the test would fail on the boundary case where the sum equals the target, and it would be the *oracle* that was wrong.

What must not be shared is the *how*: the reference walks every window with two nested loops and a running sum; the implementation slides a single window with a shrinking left pointer. Those are genuinely different algorithms. So a bug in the sliding logic — an off-by-one in the shrink condition, forgetting to subtract the departing element, comparing with `===` instead of `>=` — cannot appear in the oracle, because the oracle has no sliding logic at all.
:::

## 46.5 Why brute force, specifically

| Reason | Explanation |
| --- | --- |
| **Obviousness** | Nested loops enumerating every subarray are almost impossible to get subtly wrong. The value of an oracle is inversely proportional to its cleverness |
| **Feasibility** | At n = 3 and targets 1–12 the brute force is trivially cheap: 768 cases complete in ~2 ms (measured: the whole test file runs in 226 ms) |
| **It defines the answer independently** | The expected value is *computed*, not hard-coded. So the test does not need a maintainer to know the right answer for each of the 768 cases |
| **It generalises the assertion** | If someone changes the target range from 1–12 to 1–50, the test still works — the oracle recomputes the truth rather than consulting a stored list |

## 46.6 The assumptions the sliding window requires

:::must The correctness precondition of the window technique
**All values must be non-negative (here: strictly positive).** The reason is the monotonicity that makes the technique valid:

When you move `right` forward, the sum **increases** — so once the sum reaches or exceeds the target, adding more elements can only keep it ≥ target. That means the current window is a candidate, and the only way to find something *shorter* is to shrink from the left. That logic is the entire algorithm.

The shrink step relies on the mirror property: when you remove `arr[left]`, the sum strictly **decreases**, so eventually it falls below the target and you must expand again. The two-pointer walk is therefore monotone — `left` and `right` each advance at most n times, giving O(n).

**With a negative value, the increase is not monotone.** Adding an element can *reduce* the sum, so "shrink while sum ≥ target" can terminate while a shorter qualifying window still exists to the right — and the walk will miss it, because the left pointer only ever moves forward and can never come back to sit on a later element alone.

I ran this against the real implementation to be sure rather than asserting it:

| Input | Target | `windowTrace` result | Brute-force result | Agreement |
| --- | --- | --- | --- | --- |
| `[2, 3]` | 4 | 2 | 2 | ✔ (positive input) |
| `[-1, 3, 2]` | 3 | **2** | **1** | ✘ **disagrees** |
| `[1, -1, 1, 1]` | 2 | **4** | **2** | ✘ **disagrees** |
| `[3, -1, 2]` | 3 | 1 | 1 | ✔ (by luck) |

Walking `[-1, 3, 2]` with target 3: `right` reaches index 1 with a running sum of 2 — below target, so no shrink. `right` reaches index 2, the sum becomes 4 ≥ 3, and the window `[0..2]` is recorded as length 3; then the left pointer advances and the window `[1..2]` sums to 5, recorded as length 2. The correct answer is length **1** — the single element `3` at index 1 — but the window never sits on index 1 alone, because by the time the left pointer reaches 1 the right pointer is already at 2. The algorithm therefore over-reports: it says 2 where the truth is 1.

This is a *real, measured* demonstration that the precondition is not a formality, and it is the strongest possible support for the next paragraph. [VERIFIED by execution]

One subtlety worth knowing before you are asked: `windowTrace` itself does **not** guard against this — it will happily return a wrong answer for non-positive input. It is the *library* entry point, `generateWindow`, that rejects non-positive input with an explanatory frame. So the guard exists at the product boundary, not in the reference function the tests import. [VERIFIED]
:::

[VERIFIED] The project enforces the precondition explicitly. `generateWindow` returns a single explanatory frame when the input is not all-positive:

```
'Use positive numbers and a positive target.'
```

And the counterexample lab's page states the precondition on screen: "Preconditions: positive integers and a positive target." The README also describes the problem as "shortest qualifying positive-number window with sum ≥ target". Three separate places, so the assumption is documented, enforced, and disclosed — which is the correct handling of a precondition.

## 46.7 The 768 cases: what they prove and what they do not

| They prove | They do not prove |
| --- | --- |
| For every length-3 array with values in {1,2,3,4}, and every target 1–12, the sliding implementation returns the same answer as an independent enumeration | Anything about arrays of length 4, 5, 10, or 1,000 |
| The domain is **exhaustive** within those bounds — this is not sampling | Anything about values outside 1–4 (no zero, no negatives, no large values) |
| The specific regression (`>=` vs `===`) is caught | That any *other* bug is absent — the assertion only compares final results, not the traces |
| The implementation and the oracle agree on the boundary case `sum === target` | Anything about arrays where the answer is 0 and the target is unreachable — though many cases in the range do produce 0, so that path *is* exercised |

:::answer "Could both implementations be wrong?"
"Yes — that is the fundamental limit of differential testing, and I can be precise about where it applies here. A differential test can only detect a disagreement. If both implementations shared a misconception, they would agree and the test would pass.

Concretely, in this case the shared belief is the *specification*: both say the answer is the shortest window whose sum is at least the target, and both return 0 when none exists. If that specification were wrong — say the intended problem was 'exactly equal to the target', or 'at least the target but the window must include the last element' — then both would be consistently wrong and all 768 cases would pass. The tests cannot validate the requirement; they validate agreement with the requirement as I encoded it. That is why the oracle being *independent in mechanism* matters so much: it eliminates the class of bugs where the sliding logic is wrong, but it cannot eliminate a wrong reading of the problem."

Then add the second half, because the interviewer is waiting for it: *"There is a second correlated-failure risk that I did close off: the assertion only compares final results, so if `windowTrace` were also returning a subtly wrong *trace* — right answer, wrong intermediate frames — these tests would not notice. The trace is checked separately, by the counterexample lab's first-divergence display and by the fact that the buggy variant's trace is asserted to differ at the sentence level in the regression group."*
:::

:::answer "Does 768 prove universal correctness?"
"No, and the enumeration is honestly bounded: 64 arrays of length exactly 3, values 1–4, and targets 1–12. It is exhaustive *within* that box, which is stronger than sampling, but the box itself is small. The domain it leaves untested includes all lengths except 3, all values outside 1–4, zero and negative values (which the technique cannot handle at all, and which the code explicitly refuses), and the full input range the product allows.

So the correct claim is: **the implementation agrees with an independent oracle on all 768 cases in a bounded domain that was chosen to be small enough to enumerate completely.** That is a meaningful statement, and it is a very different statement from 'the sliding window is correct'. And I'd add one thing that matters more than the count: the *bug that motivated these tests* was found by differential search, not by these tests — the search returned `[2]` with target `1`, which is the smallest possible case, and the 768 cases would also have caught it. The search is the mechanism that *finds* bugs; the 768 is the mechanism that *pins* correctness in a box. Both are in the suite for that reason."
:::

## 46.8 The bounded differential search — the most interesting test in the project

@@code src/lab/engine.js 152 169

| Aspect | Detail |
| --- | --- |
| Domain | Arrays of length 1–3, values 1–4 (so 4 + 16 + 64 = 84 arrays), targets 1–8 |
| Order | Increasing length, then increasing `code` (lexicographic by the digit-extraction scheme), then increasing target |
| Predicate | Return the **first** case where `correct.result !== buggy.result` |
| Result | `{values: [2], target: 1, correct, buggy}` — asserted in the tests |
| Claim | "The first failure in that bounded enumeration order" — **not** "the globally minimal counterexample" |
| Cost | 84 arrays × 8 targets × 2 runs = 1,344 pairs of executions; the test completes in under 1 ms |

:::must Why a *deliberately buggy* implementation is in the production module
This is the part an interviewer will find genuinely unusual, and the answer is good: **you cannot test that a test can detect a bug unless you have a bug to detect.** Including a second, wrong-but-plausible implementation behind a `buggy` flag makes the detector testable. If `findCounterexample()` ever stopped finding failures — because a refactor made it compare the same function twice, or the predicate got inverted — the test would fail immediately, because it asserts that a mismatch *exists* and that it is reproducible.

That is a "test the detector" pattern, and together with the first-divergence display it is the most original engineering idea in the repository.
:::

:::danger The precision required when describing this
Say **"the first failure in the defined enumeration order within a bounded domain"**. Do NOT say "the smallest counterexample", "the minimal counterexample", or "the bug finder". The code's own comment says "Bounded exhaustive search in increasing length and lexicographic order", and the Counterexample page says "This is the first failure in that bounded domain—not a universal minimality proof." Your own UI already has the correct wording; use it.
:::

:::check Red-line drills for Parts XVII–XX
- [ ] Name the runner, the assertion library, and the fact that there is no test dependency.
- [ ] Recite the 14 test groups at a high level.
- [ ] Explain 150 = 6 × 25 and name the five hand-written edge inputs.
- [ ] List the four assertions in the sorting group.
- [ ] Say the "testing shows the presence of bugs, not their absence" sentence, then the specific coverage weaknesses.
- [ ] Explain determinism as a *product* requirement via the saved cursor.
- [ ] Explain why the oracle must not share code with the implementation.
- [ ] State the sliding window's positivity precondition and give a negative-value counterexample.
- [ ] Say the exact correct phrasing for `findCounterexample`.
:::
