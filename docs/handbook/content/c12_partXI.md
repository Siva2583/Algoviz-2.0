%PART: Algorithm visualization design | PART XI | The engineering problem behind the product: turning an algorithm that returns a result into a sequence of explainable states.

# 37 · From result to recorded explanation

> The design problem, the instrumentation model, and why this is not CSS animation.

## 37.1 The mismatch that defines the project

```
   WHAT AN ALGORITHM NATURALLY PRODUCES          WHAT A LEARNER NEEDS
   -------------------------------------         -------------------------------------
   sorted([3, 1, 2])  ->  [1, 2, 3]              "at step 4, elements at index 1 and 2
                                                  were compared; 3 > 2 was true so they
                                                  swapped; after that the region from
                                                  index 2 rightward is final"

   one value in, one value out                   a sequence of (state, reason) pairs
   no memory of the path                         the path is the product
   optimised to forget intermediates             the intermediates are the whole point
```

:::must The thesis of the whole application
**An algorithm is a sequence of decisions, and a normal implementation discards that sequence.** Every optimisation an implementation makes — temporary variables, in-place writes, a merge buffer, recursion — is work done to *avoid* keeping the intermediate states. AlgoViz's contribution is not the sorting; it is the decision to run each algorithm in a mode that keeps them, and then to treat the resulting sequence as a first-class, inspectable artefact.
:::

## 37.2 Instrumentation: how execution becomes data

The generators are not a separate implementation of the algorithms. They *are* the algorithms, with three instrumentation techniques applied at every step.

| Technique | Mechanism in the code | What it produces |
| --- | --- | --- |
| **Snapshot before mutation** | `cloneArray()` is called *before* the state changes, so the frame captures the pre-state | The frame that explains *why* the next action happens |
| **Snapshot after mutation** | A second frame is pushed with a fresh `cloneArray()` after a swap or a write | The frame that shows the *result* of the decision |
| **Metadata annotation** | `activeIndices`, `sortedIndices`, `pivotIndex`, `subArrayRange`, `codeLine`, `msg`, `currentStats` | The *explanation*, carried with the state rather than derived from it later |
| **Counter snapshot** | `{...stats}` on every frame | "How much work had happened by this moment" |
| **Bookkeeping lists** | `sortedIndices.push(...)` at the algorithmic moment when a position becomes final | The invariant, rendered |

:::key The critical insight about annotation
`activeIndices` is **not derivable** from the array state. If you only had the array at each step, you could not tell which two elements were being compared — after the fact, all you know is the order. **The indices are knowledge about the algorithm's intent, and intent leaves no trace in the data.** That is why the instrumentation exists at all, and it is the sharpest possible answer to "why not just diff the arrays?"
:::

## 37.3 Why "just animate the CSS" is a different (and weaker) design

| Aspect | CSS/transition animation | Recorded frames |
| --- | --- | --- |
| What is the source of truth? | The DOM's current visual state | The `frames` array |
| Can you pause *mid-animation* at an exact logical step? | Only if the animation duration happens to align with a step boundary — CSS interpolates, it does not know about steps | Yes, by definition: the frame *is* the step |
| Can you step backwards one logical operation? | No — you would have to reverse a transition | Yes |
| Can you ask "what were the counters at this moment?" | No — the counters are not in the DOM's animation state | Yes — `frame.currentStats` |
| Can you test the sequence without a browser? | No | Yes — it is a pure function returning an array |
| Can you render the same trace twice and compare? | No | Yes — `deepEqual` |
| What breaks first at scale? | The compositor | Memory |

:::answer "Why not just use CSS transitions between array states?"
"Because a CSS transition interpolates between two *visual* states — it has no idea what a logical operation is. If I wanted the user to be able to stop at the exact moment a comparison was evaluated, the animation would have to be quantised to logical steps anyway, at which point I am building a step engine and animating it. And the deeper problem is that the interesting information isn't visual: which elements are being compared, whether the comparison returned true, what the counter values were, which sub-array we're inside. None of that is expressible as a transition between two bar charts.

There is also a testing argument. Because my trace is data produced by a pure function, I can assert properties on it in Node with no browser: sortedness, input preservation, determinism, and ID uniqueness. That is only possible because the visualisation is downstream of the data rather than *being* the data."
:::

## 37.4 The visual encoding, mapped to the data

Every visual channel in the lab is driven by a specific field. This table is the bridge between the frame schema and what the user sees.

| Visual channel | Frame field | CSS / logic | Meaning for the learner |
| --- | --- | --- | --- |
| Bar **height** | `array[i].val` → `25 + (\|val\| / max) * 75` % | inline `style` | Magnitude. `Math.abs` means negative values are shown by size, with the sign preserved in the label |
| Bar **label** | `array[i].val` | `<strong>{item.val}</strong>` | The actual value — including its sign |
| **Green** fill | `activeIndices.includes(i)` → `.av-bar.active` (`#a6df71`) | the elements under consideration *right now* | "Look here" |
| **Teal** fill | `sortedIndices.includes(i)` → `.av-bar.sorted` (`#204c41`) | elements the algorithm considers final | "This part is done" |
| **Amber** fill | `pivotIndex === i` → `.av-bar.pivot` (`#63532e`) | quick sort's pivot; also used for heap's staging | "This is the reference value" |
| **Marker glyph** | `pivot ? "P" : active ? "●" : sorted ? "✓" : ""` | inside the bar | A redundant channel, so colour is not the only signal |
| **Index label** | `i` (render index) | `<small>{i}</small>` under each bar | The position — **not** the element's identity |
| **Operation line** | `frame.codeLine.replaceAll("_", " ")` | "CURRENT OPERATION · BASE CASE" | Which line of the algorithm produced this state |
| **Explanation sentence** | `frame.msg` | the paragraph under the stage | Why this state exists, in words |
| **Step badge** | `cursor` → `String(cursor).padStart(3, "0")` | `005` | Where in the recording we are |
| **Counters** | `frame.currentStats.{comps, passes, swaps}` | three tiles | Work done *so far* |
| **Index lists** | `activeIndices`, `pivotIndex`, `sortedIndices` | the inspector | The raw metadata, for people who want numbers |
| **Sub-array range** | `subArrayRange` | **not rendered by the lab** | [PROPOSED] the missing channel for merge/quick/heap (a dead legacy file reads it) |

:::must The one visual channel that is missing, and why it matters
`subArrayRange` is present on every merge, quick and heap frame, and `ArrayView` ignores it. The only reader anywhere in the repository is `src/modules/core/EfficientSort.jsx`, a 498-line component with zero importers — which is a useful reminder that "unused" needs a scope: the field is unused *by the shipped app*, not by the codebase. That is the reason recursion-heavy algorithms are harder to read in the lab than the O(n²) ones: the user can see *what* changed but not *which sub-problem* is being worked on. Rendering a bracket or a background tint over `[low, high]` would make divide-and-conquer legible with zero engine changes. It is the single highest-value visual improvement available, and it requires no new data. [PROPOSED]
:::

## 37.5 What makes an explanation *explainable*

The `msg` strings are not decoration; they follow a discipline. Comparing them across the six generators reveals four distinct message types:

| Type | Example | Why it is written that way |
| --- | --- | --- |
| **Decision** | `"Comparing 3 and 1. Is 3 > 1?"` | States the predicate as a question, so the reader can answer it before the next frame reveals the outcome. This is a deliberate pedagogical device: the app asks, the user predicts |
| **Outcome** | `"Yes! 3 > 1. Swapping blocks..."` / `"No swap needed. Moving window forward."` | Both branches are voiced, so a false comparison is as informative as a true one |
| **Structural** | `"Pass 1 of 3."`, `"Dividing sub-array [0 to 2]."`, `"Base case reached."` | Orients the reader in the algorithm's control flow, not just its data |
| **Completion** | `"Bubble Sort Complete! Array is fully sorted."` | Marks the terminal state unambiguously |
| **Self-critical** | `"5 ≠ 4: incorrectly skip a qualifying window."` (buggy variant in `windowTrace`) | Names the mistake at the exact frame it is made — the counterexample lab's key trick |

:::key The rule the messages follow
**A message must tell you what the algorithm is doing and why, without requiring you to read the array.** If the sentence only restated the data ("array is now [1,3,2]") it would add nothing. Every message in this codebase either states a predicate, reports its outcome, or names the control-flow position. [INFERENCE from reading all ~64 message strings; the strings themselves are VERIFIED]
:::

## 37.6 Comparison with the alternative designs

| Design | How it would represent an execution | Why AlgoViz did not choose it |
| --- | --- | --- |
| **Instrumented live run** (legacy modules) | The algorithm runs and pushes state into React as it goes, with `await` for pacing | Cannot seek backwards; state is spread across timers; untestable without a browser |
| **Video / screen recording** | Record the animation and play it back | Not queryable, not inspectable, not testable, not searchable — you cannot ask a video for the comparison count at frame 40 |
| **Step-through debugger** | Pause real execution with breakpoints | Requires either a real interpreter or a code transformation pipeline; and the user must understand the source. Also: the README explicitly rules out arbitrary user-code execution |
| **Operation log** | Record only the operations, replay from scratch to reach a frame | [PROPOSED at scale] Much smaller memory, but every seek costs a replay and frames stop being independently renderable. See Chapter 14 |
| **Frame recording (chosen)** | Run to completion, record every state, index into it | The one design where seeking is free, frames are testable data, and the algorithm code stays ordinary |

:::danger Never say "I made a visualiser"
It is the weakest possible description of this project, and it invites the question "so what did you build that isn't in every other visualiser?" Use this instead: **"I built an execution recorder with a playback layer on top, and the algorithms are instrumented to report their decisions as data rather than to animate themselves. The visualisation is the least interesting part — it's a pure function of one integer."**
:::

:::check Red-line drills for Part XI
- [ ] Explain why `activeIndices` cannot be derived from the array snapshots.
- [ ] Give three reasons CSS transitions cannot support step-accurate backwards navigation.
- [ ] Name the five message types and why both branches of a decision are voiced.
- [ ] Name the visual channel that exists in the data and is not rendered.
- [ ] Say the one-sentence description that beats "I made a visualiser".
:::
