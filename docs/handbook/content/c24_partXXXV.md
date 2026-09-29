%PART: Two hundred rapid-fire questions | PART XXXV | One line to ask, two lines to answer. Drill these out loud until they're reflex.

# 61 · 200 rapid-fire questions

> Use this as a drill sheet: cover the answers, read the question, answer in two sentences maximum, then check. If you can't answer in two sentences, you don't know it yet — go to the chapter in brackets.

## 61.1 Engine and frames (1–18)

**1. What does a sorting generator return?** An array of frame objects — the complete recording of the run. [Ch12]

**2. Name every field in a frame.** `array`, `activeIndices`, `sortedIndices`, `isSwapping`, `codeLine`, `currentStats`, `msg`, plus per-algorithm extras. [Ch11]

**3. What are the per-algorithm extras?** `minimumIndex` (bubble, selection, insertion), `pivotIndex` and `subArrayRange` (merge, quick, heap), `isLifting` (insertion), `yOffset` (merge). [Ch11]

**4. What shape is `array`?** An array of `{id, val}` objects, id being `block-<original index>`. [Ch11]

**5. Why not store plain numbers?** Identity: the visualisation is about movement, and values can be duplicated, so positions can't identify an element. [Ch11]

**6. What are the two mandatory clones?** `cloneArray()` for the array and `{...stats}` for the counters. [Ch11]

**7. What breaks if you drop the array clone?** Every frame shows the final state, because they all reference one live array. [Ch14]

**8. What breaks if you drop the stats clone?** Every frame shows the final counters. [Ch14]

**9. Is `sortedIndices` cloned?** Yes — a spread on every push, so it's never shared across frames. [Ch12]

**10. What is `codeLine` for?** A machine-readable tag naming the step, so the UI can explain it and tests can group frames by type. [Ch11]

**11. How many distinct message templates per algorithm?** Bubble 9, selection 8, insertion 8, merge 15, quick 17, heap 10. [Ch11]

**12. Trace length for the default 8 values?** Bubble 118, selection 65, insertion 76, merge 107, quick 75, heap 84. [Ch12]

**13. Worst trace the app can produce?** 1,154 frames — bubble sort on the reverse-sorted 24-element input, about 981 KB. [Ch14]

**14. Minimum trace length for an empty input?** Two frames for bubble, selection and insertion; four for merge, quick and heap. [Ch14]

**15. Does a generator mutate its input?** No — asserted for all six algorithms over 25 inputs each. [Ch44]

**16. Why does the generator need the array and not just the values?** It builds its own `{id, val}` array from the values, so the caller's array is never touched. [Ch12]

**17. Where do the algorithms live?** `src/lab/engine.js` from line 8, and the generator bodies in `src/modules/core/algorithm/sorting/algorithms/`. [Ch7]

**18. Is there a seventh algorithm?** No — six entries in the registry, and every list in the app iterates it. [Ch30]

---

## 61.2 The reducer and transport (19–34)

**19. What is the reducer's state shape?** `{cursor, length, playing}`. [Ch21]

**20. How many actions does it have?** Four: `load`, `toggle`, `tick`, `seek`. [Ch21]

**21. What is the initial state?** `{cursor: 0, length: <frame count>, playing: false}`. [Ch21]

**22. What does `load` do?** Resets the cursor to 0, sets the new length and clears `playing`. [Ch21]

**23. What does `toggle` do to the cursor?** Leaves it alone — unless it's on the last frame, in which case it resets to 0, which is what makes the same action a replay. [Ch21]

**24. What does `tick` do at the end of the trace?** Sets the cursor to the last index and `playing` to false. [Ch21]

**25. What does `seek` do to `playing`?** Always sets it to false — every seek pauses. [Ch21]

**26. What is the exact `tick` completion expression?** `playing: state.cursor + 1 < state.length - 1`. [Ch21]

**27. What is the exact `toggle` expression?** `cursor: state.cursor === state.length - 1 ? 0 : state.cursor`, `playing: !state.playing`. [Ch21]

**28. What does an unknown action type return?** The same state object, so React bails out of the re-render. [Ch21]

**29. Where does the clamp live?** In `seek`, against `[0, length - 1]`. [Ch21]

**30. What's wrong with the clamp?** It checks the range but not the domain: `seek(2.5)` stores 2.5 and `seek(NaN)` stores `NaN`. [Ch21]

**31. `length = 20`, `cursor = 5`, click Play, then three ticks?** Cursors 6, 7, 8; `playing` stays true, because 9 < 19. [Ch22]

**32. `length = 20`, `cursor = 19`, click Play?** `cursor` becomes 0 and `playing` becomes true — that's Replay. [Ch22]

**33. Is the reducer exported?** Yes — as a plain function, which is why it's unit-testable without rendering. [Ch21]

**34. How many consumers does the reducer have?** Exactly one: `SortingLab`. [Ch21]

---

## 61.3 Playback, timers and input (35–52)

**35. What schedules the animation?** A `useEffect` that calls `setTimeout` for `speed` milliseconds. [Ch24]

**36. Why not `setInterval`?** An interval captures its delay at creation, so a speed change can't take effect until the next tick, and a stalled thread produces a burst of queued callbacks. [Ch25]

**37. What are the effect's dependencies?** `playing`, `cursor` and `speed`. [Ch24]

**38. Why is `cursor` a dependency?** It's the re-scheduling trigger: the tick changes the cursor, which re-runs the effect and schedules the next one. [Ch24]

**39. What happens if you remove the cleanup?** Timers accumulate and playback advances multiple frames per interval. [Ch25]

**40. What happens if you remove `playing` from the deps?** Pausing won't stop the animation. [Ch25]

**41. What stops the animation on unmount?** The cleanup returned by the effect. [Ch25]

**42. Four speed values?** 600, 300, 160 and 50 ms, labelled 0.5×, 1×, 2× and 6×. [Ch26]

**43. Which label is inaccurate?** 2× — 300/160 is 1.875×. Three of four labels are exact. [Ch26]

**44. Two keyboard shortcuts?** Space toggles playback; the arrow keys seek one frame. [Ch26]

**45. What guards the keyboard handler?** An ignore-list for `INPUT`, `SELECT`, `TEXTAREA`, `BUTTON`, content-editable targets and modifier keys. [Ch26]

**46. What's the keyboard effect's weakness?** Its dependency is `[cursor]`, so the window listener is re-registered on every frame change. [Ch26]

**47. What validates the dataset?** `parseInput`, in `engine.js`. [Ch10]

**48. How many values are allowed?** Two to twenty-four. [Ch10]

**49. What's the accepted number format?** An anchored integer regex — optional minus sign, then digits. No decimals, no exponents, no hex. [Ch10]

**50. What's the numeric bound?** Absolute value at most 999, and `Number.isSafeInteger`. [Ch10]

**51. Why the 24-value cap?** A frame is a full snapshot, so cost is density times length; the cap keeps the worst trace around a megabyte. [Ch14]

**52. What happens to the visualisation when validation fails?** Nothing — only the error banner changes, so the last good trace stays on screen. [Ch10]

---

## 61.4 React state and effects (53–70)

**53. How does state enter the lab?** Ten `useState` calls, one `useReducer`, one `useRef` and two effects. [Ch15]

**54. Name the nine core state variables.** `text`, `input`, `algo`, `speed`, `error`, `notice`, `compare`, `other`, `seed`. [Ch15]

**55. What is `text` versus `input`?** `text` is the editable draft string; `input` is the validated, committed array. [Ch9]

**56. Why keep both?** So the text box stays editable and the trace only changes on a valid commit. [Ch9]

**57. What does `useMemo` hold?** The primary frames, the secondary frames, and now the saved-experiment list's derived values. [Ch16]

**58. Why derive instead of store?** A stored copy can go stale; a derived value cannot. [Ch16]

**59. What's the most important derived value?** `const cursor = Math.min(playback.cursor, frames.length - 1)`. [Ch16]

**60. Why is that clamp there?** It keeps the render safe if the reducer's `length` is stale — a second line of defence. [Ch16]

**61. What is `frame`?** `frames[cursor]` — one object, the only thing the stage needs. [Ch16]

**62. When does the primary memo recompute?** When `input` or `algo` changes. [Ch16]

**63. When does the secondary memo recompute?** When `input`, `other` or `compare` changes. [Ch16]

**64. How many effects does the lab have?** Two: the timer and the keyboard. [Ch24]

**65. What's the naming convention for the event handler state?** `saved` for the list and `savedError`/`notice` for the messages. [Ch15]

**66. Is there a `useRef` in the lab?** No — the two refs in the codebase are in the legacy modules. [Ch15]

**67. Why is there no `useReducer` for the form?** Because there are no cross-field invariants in the form — no rule couples the text to the algorithm. [Ch21]

**68. What's the rule for choosing `useState` or `useReducer`?** Does a rule span two fields? Then it's a reducer. [Ch21]

**69. Where does the saved list come from?** A lazy `useState` initialiser that reads and filters `localStorage`. [Ch41]

**70. Why lazy?** So the read happens once on mount rather than on every render. [Ch41]

---

## 61.5 The six algorithms (71–90)

**71. Which are stable?** Bubble, insertion and merge. [Ch30]

**72. Which are in place?** Bubble, selection, insertion and heap — merge needs O(n) auxiliary, quick needs O(log n) stack. [Ch30]

**73. Which has an early exit in the app?** Insertion sort only — bubble's is deliberately absent. [Ch31]

**74. Bubble sort's comparison count on a sorted 24-element array?** 276 — no early exit. [Ch31]

**75. Selection sort's comparison count?** Exactly n(n−1)/2, independent of the input. [Ch32]

**76. Selection sort's swap count?** At most n−1. [Ch32]

**77. What does insertion sort's `break` frame cost?** One extra comparison, because the comparison happens before the break. [Ch33]

**78. How does insertion sort implement shifts in the app?** As swaps, which over-reports exchanges. [Ch33]

**79. Merge sort's auxiliary space?** O(n) for the buffer, plus O(log n) recursion. [Ch34]

**80. Merge sort's exchange counter?** It's a buffer-write count, not a swap count — 24 for eight elements. [Ch34]

**81. Which algorithm's `sortedIndices` stays empty throughout?** Merge sort's, which is a real gap in its instrumentation. [Ch34]

**82. Quick sort's pivot choice?** The last element — which makes an already-sorted input the worst case. [Ch35]

**83. Quick sort's base case cost?** A single-element range still pushes two frames. [Ch35]

**84. Can quick sort's `sortedIndices` be out of order?** Yes — e.g. `[1, 0]`, because pivots are finalised in partition order, not index order. [Ch35]

**85. Heap sort's heapify implementation?** Recursive, incrementing the comparison counter twice per call unconditionally. [Ch36]

**86. Heap sort's declared auxiliary space?** O(log n), footnoted as call-stack space. [Ch36]

**87. Which algorithm is quadratic in every case?** Selection and bubble. [Ch30]

**88. Which is n log n in every case?** Merge and heap. [Ch30]

**89. Which has the least data movement?** Selection — at most n−1 swaps. [Ch32]

**90. Which is the only one where a value can be absent from the rendered array?** Merge, while it's held in the buffer. [Ch34]

---

## 61.6 Comparison and counts (91–106)

**91. What does `compareCursor` compute?** `Math.round((cursor / (frames.length - 1)) * (otherFrames.length - 1))`. [Ch39]

**92. Why percentage alignment rather than index?** The traces have different lengths — 65 versus 118 on the default input — so index alignment runs out of frames. [Ch39]

**93. Does 50% mean the same amount of work in both?** No. The percentages are positions in two different recordings. [Ch39]

**94. What does the panel disclaim on screen?** That alignment is by percentage of trace, not equivalent operations, and that there are no wall-clock claims. [Ch39]

**95. How many disclosures surround the comparison feature?** Four: same input, percentage alignment, comparisons only, and no timing. [Ch38]

**96. Do both traces use the same array reference?** Yes, and that's safe because generators don't mutate their input. [Ch38]

**97. Which counter is comparable across algorithms?** Comparisons only. [Ch40]

**98. What does "passes / calls" mean?** Unit-dependent: an outer-loop pass, a recursion node, or a heap extraction. [Ch40]

**99. What does "recorded exchanges" mean?** A real swap count in bubble sort and a buffer-write count in merge sort. [Ch40]

**100. Where is that disclosed?** In the footnote at the bottom of the lab page. [Ch40]

**101. Default input comparison counts?** Bubble 28, selection 28, insertion 22, merge 16, quick 16, heap 44. [Ch40]

**102. Which algorithm has the most comparisons on the default input?** Heap sort, at 44 — because of the unconditional increments. [Ch40]

**103. Are the counters guaranteed monotone along a trace?** They only increase, because they're cloned from a mutable object that is only incremented. [Ch40]

**104. Is any counter a timing measurement?** None. There is no `performance.now()` anywhere in the project. [Ch40]

**105. What does the meter width mean?** Only the ratio between two counts, scaled to the larger. [Ch40]

**106. Does the bigger bar mean the faster algorithm?** No — more comparisons means more decisions, not more time. [Ch40]

---

## 61.7 Testing (107–124)

**107. What test runner?** Node's built-in `node:test`, with `node:assert/strict`. [Ch43]

**108. How many test groups?** Fourteen. [Ch43]

**109. How many algorithms × inputs in the sorting suite?** Six × twenty-five = 150. [Ch44]

**110. Name the five hand-picked inputs.** Empty, `[1]`, `[2,2,1]`, `[-4,0,3,-1]`, `[5,4,3,2,1]`. [Ch44]

**111. And the other twenty?** Seeded random datasets of ten values in `[0,19]`. [Ch44]

**112. Name the four assertions per case.** Final frame is sorted; the input is unmutated; a re-run deep-equals the trace; the final frame's ids are unique. [Ch44]

**113. Which assertion is unusual, and why?** Trace reproducibility — because a saved experiment stores a frame index, so a reordered re-run would break it. [Ch45]

**114. What does the reproducibility assert compare?** The whole recording: array contents, metadata, every message string, every counter snapshot. [Ch45]

**115. How many sliding-window cases?** 768 = 64 arrays × 12 targets. [Ch46]

**116. What are those 64 arrays?** All three-element arrays over values 1–4, enumerated by base-4 decomposition. [Ch46]

**117. What is the oracle?** A brute-force triple-nested enumeration written inline in the test file. [Ch46]

**118. Why inline rather than imported?** So it shares no code with the implementation — correlated failure would make the test useless. [Ch46]

**119. Does the oracle use the same predicate?** Yes, `sum >= target`, which is the problem's definition — so the tests can't catch a misread spec. [Ch46]

**120. What does the sliding window require of its input?** Positive values and a positive target. [Ch46]

**121. Where is that precondition enforced?** In `generateWindow`; `windowTrace` has no guard, which is an inconsistency. [Ch46]

**122. What breaks with a negative value?** Monotonicity. Measured: `[-1,3,2]` with target 3 gives 2 instead of 1. [Ch46]

**123. What is the suite's biggest verification gap?** The id assertion covers only the last frame, which is why the merge duplicate-id bug passes CI. [Ch44]

**124. What is the highest-value test change available?** Move that assertion inside the per-frame loop — two lines. [Ch44]

---

## 61.8 Persistence and import (125–142)

**125. What's the storage key?** `algoviz.experiments.v1`. [Ch41]

**126. What's the record shape?** `{version: 1, algorithm, input, cursor, createdAt}`. [Ch41]

**127. How many records are kept?** Six, the most recent, by slicing the front of the list. [Ch41]

**128. How is the list read?** A lazy `useState` initialiser with four defence layers. [Ch41]

**129. Name the four defences.** `|| "[]"` for a missing key; `try/catch` for malformed JSON; an `Array.isArray` shape check; a filter dropping unknown algorithms. [Ch41]

**130. Why is the algorithm filter necessary?** Saved data outlives code — a later release may delete an algorithm, and the record must not crash the page. [Ch41]

**131. Where does clicking a saved experiment go?** Through `parseInput` again, into `load()`. [Ch41]

**132. Is `localStorage` secure?** No — it's readable by any script on the origin and is not encrypted. [Ch53]

**133. Does anything leave the browser?** No. There is no fetch in the shipped app. [Ch53]

**134. What does the export payload contain?** Four fields: version, algorithm, input, cursor — `createdAt` is omitted. [Ch42]

**135. What is the import size limit?** 16,384 bytes. [Ch42]

**136. Name the import gates in order.** Size; JSON parse; object shape; `version === 1`; `Object.hasOwn` registry check; `Array.isArray(input)`; then `parseInput` on the joined values. [Ch42]

**137. Why `Object.hasOwn` and not `in`?** `in` walks the prototype chain, so `'constructor' in algorithms` is true. [Ch42]

**138. What does the import do with the cursor?** Keeps it if it's a non-negative integer, otherwise 0 — and the reducer clamps it anyway. [Ch42]

**139. What's the biggest gap on the import path?** All nine behaviour cases are unautomated, because the gates live in a component. [Ch42]

**140. What's the fix for that?** Extract the gates into a pure function in the engine and test it directly — nine cases. [Ch42]

**141. How does the user get an experiment off one machine?** Export the JSON and import it on the other. [Ch41]

**142. What happens if a storage write fails?** The catch sets a notice and the in-memory list does not advance, because `setSaved` is inside the try after `setItem`. [Ch41]

---

## 61.9 Build, CI and tooling (143–160)

**143. What's the dev command?** `npm run dev`, which runs Vite. [Ch48]

**144. What's unusual about this project's Vite?** `package.json` aliases it to `rolldown-vite@7.2.5` through `npm:`, with an `overrides` entry. [Ch48]

**145. What's the Node floor?** `>= 22.12.0`, with a matching `.nvmrc`. [Ch48]

**146. What does `npm run test` execute?** `node --test tests/*.test.js`. [Ch43]

**147. Difference between `lint` and `lint:lab`?** `lint:lab` targets `src/lab` and the home page for a fast inner loop; `lint` is the full gate. [Ch47]

**148. Name the four CI steps.** `npm ci`, `npm test`, `npm run lint`, `npm run build`. [Ch47]

**149. What triggers CI?** Push and pull request, on `ubuntu-latest`. [Ch47]

**150. What Node version does CI use?** 22, with npm dependency caching. [Ch47]

**151. Is there a deploy job?** No — no deploy, no matrix, no artifacts. [Ch47]

**152. What does CI not prove?** Anything about rendering, timing, layout or browser behaviour — there's no browser automation. [Ch47]

**153. Measured build output?** 1,736 modules; main chunk 251.78 kB (80.90 kB gzip); SortingLab 29.85 kB; engine 18.65 kB. [Ch48]

**154. How many routes are lazy?** Fourteen of seventeen render a lazily-imported component — twelve distinct `React.lazy` components, with `SortingLab` used by three routes. [Ch49]

**155. What's the deployment rewrite for?** Serving `index.html` for unknown paths so client routes survive a refresh. [Ch49]

**156. Which Tailwind utilities does the app actually use?** `flex` and `min-h-screen` in one component; everything else is custom CSS in `lab.css`. [Ch50]

**157. What's in `src/index.css`?** Twelve lines — just the three `@tailwind` directives. [Ch50]

**158. Which lint rule is disabled, and where?** `react-hooks/set-state-in-effect`, for `src/modules/**` only, because those pages are the legacy execution model. [Ch47]

**159. Why does CI run the build?** To exercise the full module graph, which no test imports. [Ch47]

**160. Which script would you run before opening a PR?** `npm test && npm run lint && npm run build` — the CI order. [Ch47]

---

## 61.10 JavaScript and React fundamentals (161–178)

**161. `??` versus `||`?** `??` only falls back on `null` and `undefined`; `||` also falls back on `0`, `""` and `false`. [Ch51]

**162. Where does that distinction matter here?** Reading a stored cursor, where `0` is a valid value — `??` keeps it, `||` would replace it. [Ch51]

**163. `useMemo` versus `useCallback`?** `useMemo` caches a value; `useCallback` caches a function — which is just `useMemo` returning a function. Used once in this repo: `resetBoard` in `Nqueens.jsx`, so an effect can depend on a stable function identity. [Ch18]

**164. What does a lazy state initialiser look like?** `useState(() => read())` — the function runs once, on mount. [Ch41]

**165. Why does `key={item.id}` matter?** It gives React element identity, so a swap looks like a move rather than a value change. [Ch37]

**166. What's the duplicate-key problem?** Two children with the same key; React's reconciliation with duplicates is unspecified. [Ch34]

**167. What does `Array.prototype.sort` do without a comparator?** Sorts by string conversion, which puts 100 before 20. [Ch51]

**168. Is `Array.prototype.sort` stable?** Yes, guaranteed since ES2019 — and it mutates the array. [Ch51]

**169. What does `Number.isSafeInteger` guarantee?** That the value is an integer within ±2⁵³−1, so it round-trips exactly. [Ch51]

**170. What does `Object.hasOwn` do?** Tests for an own property without consulting the prototype chain. [Ch51]

**171. Why `structuredClone`-safe data matter here?** A frame must be a plain, deep-independent value so it can be compared, stored and rendered without shared references. [Ch11]

**172. What does spread on an object do?** Shallow-copies own enumerable properties — which is enough for `{...stats}`, whose values are numbers. [Ch11]

**173. Does shallow copying suffice for an array of objects?** No — the objects are still shared, so the array needs a per-element clone. [Ch11]

**174. What is `Math.imul` for?** 32-bit integer multiplication with wraparound, used in the seeded LCG. [Ch10]

**175. Why `>>> 0`?** To coerce to an unsigned 32-bit integer, keeping the generator's state in range. [Ch10]

**176. What's a stale closure?** A function that captured a value from an earlier render and still reads that old value. [Ch26]

**177. What's the standard fix?** Add the captured value to the effect's dependency array, or restructure so the value isn't read. [Ch26]

**178. What does `Suspense` do here?** Shows a shell-wrapped loader while a lazy route's chunk downloads. [Ch49]

---

## 61.11 Performance and security (179–200)

**179. What's the worst case for memory in this app?** 1,154 frames at about 981 KB, from bubble sort on the reverse-sorted 24-element input. [Ch52]

**180. What's the cost of one commit?** One or two generator runs, depending on whether comparison is on — and two runs even without it, because `load()` needs the length. [Ch52]

**181. What's the cost of one playback frame?** One reducer call, one render, one `map` over at most 24 elements. [Ch52]

**182. What breaks first if you raise the cap?** Generation time and memory, together — the frame count is quadratic and every frame clones. [Ch52]

**183. Name an existing optimisation.** Memoising the traces so the algorithm doesn't re-run per frame. [Ch52]

**184. Name an existing inefficiency.** The double generation per commit. [Ch52]

**185. What's the `React.memo` trap here?** Wrapping `ArrayView` gains nothing, because its only prop changes every frame. [Ch52]

**186. What's the proposed fix for memory?** Delta frames with periodic keyframes. [Ch52]

**187. Where is that proposal recorded?** In this handbook and the README's improvement list — not in the code. [Ch52]

**188. How many trust boundaries does the app have?** Three: the URL query string, the storage read path and the imported file. [Ch53]

**189. Which one is a security boundary?** The imported file — the other two are robustness boundaries. [Ch53]

**190. What stops a crafted algorithm key?** The `Object.hasOwn` registry check. [Ch53]

**191. Is there any `eval` or `innerHTML`?** No, and no `dangerouslySetInnerHTML` either. [Ch53]

**192. How is user text rendered?** Through JSX interpolation, which escapes by default. [Ch53]

**193. What proof is there that nothing leaves the browser?** The only `fetch` in the repository is in a component with zero importers, so it never runs. [Ch53]

**194. What would you add before storing anything sensitive?** Don't — this is the wrong place. Sensitive data belongs behind a server with authentication. [Ch53]

**195. What is the app's threat model, honestly?** A user experiment could have personal data pasted in; everything else is a local, single-user tool with no accounts and no server. [Ch53]

**196. Is the app accessible?** Partially: real buttons and inputs, a reduced-motion query, but no `aria-label`s on the bars and no live-region announcements. [Ch60]

**197. What's the biggest accessibility improvement available?** Announcing the state change, either via the message or a live region, and labelling the bars. [Ch60]

**198. What's the honest one-line description of this project?** A client-side algorithm laboratory that records complete execution traces and provides a controllable, comparable, savable way to inspect them. [Ch03]

**199. And the one-line non-claim?** It is not a benchmark, not a backend application, and not a proof of correctness — it is an instrument for looking at algorithms. [Ch03]

**200. What's the single strongest answer in this whole handbook?** The merge-sort duplicate-id bug: found by measuring, explained with numbers, fixed in two lines, and it exposes a testing weakness rather than hiding one. [Ch59]

:::must How to drill this chapter
Cover the answers. Go through 24 questions in four minutes. Mark every question you cannot answer in two sentences and read only those chapters. Repeat daily until the marked set is empty — that is what "ready" actually means.
:::

:::check Red-line drills for Part XXXV
- [ ] Full pass in under 45 minutes with no more than 10 misses.
- [ ] Second pass in under 30 minutes with no more than 3 misses.
- [ ] Answer the twelve questions marked in brackets as the hard chapters — 33, 39, 44, 46, 52 — without hesitation.
- [ ] Do one pass standing up, speaking, with a timer.
:::
