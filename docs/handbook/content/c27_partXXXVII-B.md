%PART: Ten mock interviews, second half | PART XXXVII · 6–10 | Five more personalities: platform, security, startup, performance, and the behavioural round.

# 64 · Mock interviews 6–10

> Same rule as the previous chapter: read the whole question list, answer out loud, then read the answer block.

---

## Interview 6 · Dmytro Kovalenko — the platform engineer

:::mock Interviewer 6 · Dmytro Kovalenko · DevOps / Platform Engineer
**Style.** Procedural and literal. He wants the commands, the versions and the failure modes. He will ask what happens on a clean machine and expects an exact sequence.

**What he is testing.** Whether the build is reproducible and whether you understand what your pipeline actually guarantees.

**Ground rules.** Name the command, the version and the failure you're guarding against.
:::

### Questions

1. Give me the exact sequence from a clean machine to a passing pipeline.
2. Why `npm ci` and not `npm install`?
3. What pins your Node version, and what happens on Node 20?
4. What does your CI do on a pull request from a fork?
5. Could your build pass while the app is broken? Give an example.
6. Is the build reproducible byte for byte? Why not?
7. What's in the production bundle, roughly, and how would you check?
8. What's your rollback plan?
9. There's an npm alias in your manifest. Explain the risk.
10. How would you add a preview deployment? What would it cost?
11. What would you monitor if this had real users, and what would you not bother with?
12. What happens if the CI runner's Node version changes?
13. Where are secrets, and what would you do if you needed one?
14. How long does your pipeline take end to end, and what dominates it?
15. What's the one thing in your pipeline you'd fix first?

---

### Model answers

**1.** Clone, then `nvm use` (which reads `.nvmrc` and gives Node 22), then `npm ci` — which requires the lockfile and installs exactly it — then `npm test`, `npm run lint`, `npm run build`. That's the same four gates CI runs, in the same order, which is the point: if it passes locally in that order, there are no surprises in the pipeline. The failure mode people hit is skipping `npm ci` and then running `npm run build`, which fails with "vite: not found" because there's no `node_modules`.

**2.** `npm ci` installs strictly from `package-lock.json` and deletes `node_modules` first, so it cannot silently update a transitive dependency. `npm install` may resolve a newer version within a semver range and rewrite the lockfile, which means the pipeline could install something no developer has ever run. In CI, the lockfile *is* the environment, so `npm ci` is the only command that reproduces it.

**3.** `.nvmrc` contains 22 and `package.json` declares `engines.node: ">= 22.12.0"`. On Node 20, `npm ci` prints an `EBADENGINE` warning by default — and would *fail* only under `engine-strict=true`, which isn't set. So today the floor is advisory. That's a deliberate trade: advisory failures keep the repo usable for someone on an older runtime, at the cost of letting them run it in an unsupported environment.

**4.** It runs the same four steps, read-only: the default token has no write permission on a fork's PR except to report status, no secrets are exposed, and there's no deploy step to be gated. That's the safe default. The consequence is that a maintainer merging a fork's PR is trusting that CI's four steps are meaningful — which is another argument for the build step being in there.

**5.** Easily — and it has. The merge duplicate-key bug is exactly that case: every gate green, and a real defect in the frames. More generally, any bug that lives in the seam between React and the browser is invisible to a suite that never renders. Concretely: a broken timer cleanup, a stale closure in the keyboard handler, a wrong `disabled` condition, a layout that collapses at 400 px — all of these can pass tests, lint and build.

**6.** No, and it isn't worth pretending otherwise. The bundle includes a hash of file content, so identical inputs give identical output *of my code* — but the dependency tree comes from the registry and the toolchain is Rust-based (Rolldown), so byte-for-byte determinism across machines and platforms isn't guaranteed by anything in this project. What *is* guaranteed is a reproducible *dependency graph*, via the lockfile plus `npm ci`.

**7.** Roughly: React and React DOM dominate a 251.78 kB main chunk (80.90 kB gzip), plus a 29.85 kB SortingLab chunk, an 18.65 kB engine chunk and 72.37 kB of CSS, from 1,736 modules. To check, I'd run the build and read the output — Vite prints the chunk table — and if I wanted more, a bundle visualiser to see which dependency owns the space. The number I actually watch is whether a new dependency silently doubles the main chunk.

**8.** For the deployed artefact, there isn't one in the repository: the config is a rewrite rule for a static host, and no deploy job exists in CI. [PROPOSED] The practical version is that a static SPA is rolled back by redeploying the previous build, and the reason that's safe is that there's no server state and no schema migration — the one thing that *isn't* rolled back is the user's `localStorage`, which is exactly why the record has a `version` field and the import path rejects unknown versions.

**9.** The risk is that `"vite": "npm:rolldown-vite@7.2.5"` means the name `vite` and the actual package differ, so anyone reasoning about "what Vite does" from the package name can be looking at different docs or behaviour. The `overrides.vite` entry is what stops a transitive dependency from pulling a *different* Vite, which would put two bundlers in the tree. The mitigation is the lockfile plus a README note — and the honest caveat is that this is a non-default, fast-moving bundler, so an upgrade is a deliberate act rather than a `npm update`.

**10.** A preview deployment needs two things: a host that builds on push (Vercel is already referenced via `vercel.json`) and a per-branch URL. The cost is the build minutes plus the fact that a preview URL is a *public* URL for an app whose data is local — so nothing sensitive, but it does mean anyone with the link can use the app, and `allowedHosts` in the Vite config becomes relevant for the dev server rather than the preview. I'd add it, because a clickable preview link in a PR is the cheapest possible review improvement.

**11.** Monitoring for a static SPA with no users: I'd want error reporting for uncaught exceptions, because without an error boundary an exception is a blank page and I'd otherwise never know. I'd want basic availability on the static host, which is the provider's job. What I wouldn't bother with: performance monitoring, because there's no server and the client work is bounded by design; and any product analytics, because the app's promise is that it doesn't phone home.

**12.** Nothing, in the sense that CI pins Node 22 via `actions/setup-node@v4` with `node-version: 22`, so the runner's default is irrelevant. But `22` is a major version, so a patch or minor release *will* change the runtime under the pipeline without any change to the repository. That's the accepted norm for GitHub Actions, and the more careful version is pinning the exact minor and bumping deliberately — which is also what a supply-chain-conscious team does with the action versions themselves, currently `@v4` tags rather than commit SHAs.

**13.** There are no secrets, which is a property rather than an accident: nothing is deployed, nothing is authenticated, and the app makes no network calls at runtime. If I needed one — a preview-deployment token, say — it goes in repository secrets and is referenced by `${{ secrets.NAME }}` inside the workflow, never in the repository, and I'd scope it to the environment rather than the whole repo. The relevant local rule is that anything in the client bundle is public, so a key that must be secret cannot be a `VITE_` variable.

**14.** Minutes, and what dominates it is the `npm ci` step — installing React, Tailwind, PostCSS and ESLint from the registry, with dependency caching configured in the workflow. The test suite itself is a few hundred milliseconds; lint and build are seconds. That dominance is why the cache exists and why a lockfile change is the slowest kind of push.

**15.** The build's position in the sequence. Right now it's last, after lint, so if the build fails you've paid for install, test *and* lint first. Reordering to `test → build → lint` would surface the most expensive-to-fix failure earlier. It's a two-line change and it's exactly the kind of thing that's only worth doing once you've watched the pipeline run fifty times.

---

## Interview 7 · Sofia Lindqvist — the security engineer

:::mock Interviewer 7 · Sofia Lindqvist · Application Security Engineer
**Style.** Calm and systematic. She will not accept "it's just a local app" as an answer to a design question, but she will accept it as an answer to a scoping question. She asks for the threat model before the controls.

**What she is testing.** Whether you can reason about trust boundaries instead of listing best practices.

**Ground rules.** Name the asset, the actor, the boundary, and what the control actually prevents.
:::

### Questions

1. Give me your threat model in three sentences.
2. What are the assets here, and are any of them sensitive?
3. Enumerate the trust boundaries.
4. You parse JSON from a file. Walk me through what an attacker could put in it.
5. What does `Object.hasOwn` prevent, precisely?
6. What does React protect you from for free, and what does it not?
7. Could a stored XSS happen in this app? What would have to be true?
8. Is `localStorage` a security problem here?
9. What's the riskiest dependency decision you made?
10. If you added a backend, what are the first three things you'd have to get right?
11. Where would you put rate limiting, and why haven't you?
12. What would you do if a user pasted a password into the dataset field and saved it?
13. What's the difference between validation and sanitisation, in your code specifically?
14. How would you handle a security report against this repository?
15. Name one thing in this codebase you'd flag in a security review, even though nothing is exploitable today.

---

### Model answers

**1.** The system is a single-user, client-side application with no server, no accounts and no network egress; the only assets are the user's own experiments, which live in their browser. The only untrusted inputs are the user's own data — a URL query string, a `localStorage` value that any script on the origin could have written, and an imported JSON file that could have come from anyone. So the realistic risks are self-inflicted: crashing the page with malformed data, or a rendering path that turns data into executable content. I'm explicitly not defending against a hostile server, a hostile co-tenant on the origin, or a compromised dependency — because the first two don't exist and the third is unfixable at this scale.

**2.** The saved experiments — an algorithm key, an array of integers, a frame index and a timestamp. They're not intrinsically sensitive, but "not sensitive" is an assumption: the input field is free text and a user could paste anything into it, so the asset is really *anything the user chose to type into a number field*. There's no credential, no token, no PII by design, and nothing is transmitted anywhere.

**3.** Three. First, the URL query string — `?algorithm` and `?compare` — which is attacker-controllable when a link is crafted. Second, the `localStorage` read path, which is attacker-controllable if anything else ever runs on the origin. Third, the imported file, which is attacker-controllable by definition. Everything else — the frames, the reducer, the rendering — is downstream of those three and takes the validated output.

**4.** Before parsing: a file large enough to make `JSON.parse` expensive — bounded by the 16 KB limit. After parsing: a payload whose `algorithm` is `'constructor'` or `'__proto__'`, intending to reach the prototype chain — blocked by the own-property check. A payload where `input` is not an array — blocked. An array of non-numbers, or of numbers outside the integer grammar — caught by re-running `parseInput` on the joined values. A `cursor` that isn't a number or is negative or enormous — normalised to 0 or clamped by the reducer. What's left: extra fields pass silently, nesting depth isn't bounded, and a carefully-shaped object could still be large enough to be slow, though the size limit makes that uninteresting.

**5.** It requires an own property of the object rather than any property reachable through the prototype chain. Concretely, `'constructor' in algorithms` evaluates to `true` because `Object.prototype.constructor` exists, so an `in` check would pass and `algorithms['constructor']` would be the `Object` function — a truthy value that then fails confusingly later, in the component. Own-property checking makes the registry a closed allowlist.

**6.** React protects against HTML injection through JSX interpolation — text is escaped, so a string containing `<script>` is rendered as text. It does not protect you from `dangerouslySetInnerHTML`, from `href` values with `javascript:` schemes, from writing untrusted data into a `style` attribute's *expression* position, or from anything outside the render path. In this codebase there's no `dangerouslySetInnerHTML`, no user-controlled `href`, and the only dynamic style assignment is a numeric height percentage computed from a validated integer — so the by-construction argument is real, and it's an argument about absence.

**7.** It would require a script from a different origin running in the page's context, or a dependency that turns data into a sink. Neither exists: the app loads no third-party scripts, there's no CDN, no analytics, no service worker and no `postMessage` handler. If one were added — an analytics snippet, say — the stored experiments become readable by it and the argument changes entirely. That's the honest version: the app is safe from stored XSS because it has no untrusted script, not because it has a sanitizer.

**8.** Not for confidentiality. It's not encrypted, it's origin-scoped, and any script on the origin can read it — but the data is integers the user typed, and the app never transmits it. The genuine problems with `localStorage` here are availability and integrity: clearing site data destroys the user's work irreversibly, and any script on the origin could silently rewrite it. Both are handled defensively rather than cryptographically — the read path treats the contents as untrusted — and I'd never describe it as secure storage.

**9.** Depending on the network at build time at all, with a semver-range dependency tree and no integrity verification in the repository. That's the universality of npm rather than a decision I made, but it *is* the largest supply-chain surface here, and the standard mitigations — a committed lockfile, `npm ci` in CI, and Dependabot-style review of bumps — are partially present. The stronger version, pinning `actions/*` to commit SHAs rather than `@v4` tags, isn't.

**10.** Authentication that doesn't put a bearer token anywhere readable by JavaScript; an authorisation check on every read *and* write, because an object identifier in a URL is not an authorisation; and server-side validation of the exact same schema, because client-side validation is a UX feature and nothing more. And a fourth that people forget: a data-retention policy, because "the user's experiments" becomes "my stored data" the moment it's on a server.

**11.** At the server, which doesn't exist — so there's nowhere to put it and nothing to protect. In the client, the only unbounded work is the generation path, and that's bounded by the 24-element cap rather than by a rate limit, which is the right way to bound it: a limit would let the work happen and then punish it, whereas a cap makes the work impossible. [PROPOSED] If a worker or a server ever did the generation, the bound would need to move with it.

**12.** Nothing happens today — it sits in their own browser and is never transmitted. But it's a good example of why "the data isn't sensitive" is an assumption rather than a guarantee: the field accepts a string and the only validation is that it parses as integers, so a user *can* type prose into it and save it. The mitigation I'd want is a hint in the UI that the dataset field is for numbers and that saves are stored unencrypted in the browser — a disclosure, not a control, because there's no control available in a local app.

**13.** Validation is rejecting input that doesn't satisfy a schema — `parseInput` rejects anything that isn't 2–24 integers, and the import gates reject anything that isn't version 1 with a known algorithm and an array. Sanitisation would be *transforming* input to make it safe, and I deliberately don't do it, because silently coercing `"2.5"` to `2` would hide the user's mistake. The one place transformation happens is benign and explicit: joining the imported array into a comma-string so it can go through the same validator as the form.

**14.** Reproduce it first, in a scratch script that imports the engine directly, so the report becomes a failing assertion rather than a story. Then fix at the layer that owns the property, add the regression test, and write the finding into the known-issues list even if it isn't exploitable — because "we decided this wasn't a risk" is exactly the decision that gets lost. If it were in a dependency rather than my code, the response would be different: assess exposure, then pin or replace, and check whether the lockfile means the vulnerable path is even reachable.

**15.** The `catch {}` on the storage write, which discards the exception. It's not exploitable, but it's a blind spot by construction: quota errors, disabled-storage errors and serialisation errors all become the same message, so a real failure is indistinguishable from a non-event. The second is the `default` branch of the reducer silently accepting any action, which means a typo in an action name is a no-op rather than an error — in a security context that pattern is how an authorisation check quietly stops being called.

---

## Interview 8 · Jake Torres — the startup CTO

:::mock Interviewer 8 · Jake Torres · CTO of a twenty-person startup
**Style.** Fast, impatient, product-oriented. He interrupts long answers and asks "so what". He is deciding whether you'd be useful in a week, not whether you're rigorous.

**What he is testing.** Prioritisation, pragmatism, and whether you can ship.
:::

### Questions

1. What does this do that a whiteboard doesn't?
2. Would you ship it today? Yes or no.
3. You've got two days before a demo. What do you cut?
4. What's the first thing a user will complain about?
5. If this had to make money, what's the product?
6. What's the smallest change with the biggest perceived improvement?
7. You have no analytics. How do you know anything?
8. Why are there two generations of UI in the repo? Which one wins?
9. You spent time on a 30-page testing chapter. Was that the right call?
10. What would you cut from the app entirely?
11. What's the fastest way to make this feel more finished?
12. What would you build next, in one sprint?
13. Someone says "make it handle 10,000 elements". What do you say?
14. What's your one metric for success?
15. Why would anyone use this instead of watching a YouTube video?

---

### Model answers

**1.** It's self-paced, reversible and precise. A video plays at one speed and you can't inspect a single comparison interval; here you can pause at the exact frame where a swap happens, step backwards, read the comparison count at that instant, and see two algorithms on the same input side by side. The specific thing it does that a whiteboard can't is *preserve the history* — a whiteboard gets wiped, whereas a frame is a permanent, inspectable record.

**2.** Yes, for the audience it has: a browser, no accounts, no server, saved work in the browser, and an honest README. What holds it back from a wider audience isn't a defect, it's the 24-element cap, and that's disclosed on the input itself rather than discovered.

**3.** Everything except six features and one page: load an input, pick an algorithm, play, step, compare, and show the counts. I'd hide the JSON import/export, the saved-experiment list and the module pages behind a flag or simply out of the nav, and I'd keep the comparison panel because it's the demo moment. Then I'd check the demo path at 800×600, because that's the resolution the projector will actually be.

**4.** That it doesn't accept their input — 30 values, or decimals, or a spreadsheet paste with a trailing comma. The rejection is correct and the message explains why, but it will still be the first complaint, which is why the message exists. The second complaint is that shuffle's first click reloads the default dataset, which looks like a bug because it is one.

**5.** Teaching. Not the app as a product but the material around it: a guided path with a fixed set of exercises, a classroom mode where the input is constrained to the concept being taught, and paid licences to institutions. The core insight is that a visualiser's value is instructional, so the customer is a course, not an individual. The alternative — a "sorting API" — makes no sense, because nobody needs a visualization service.

**6.** Render merge sort's buffer. The generator already emits `yOffset` and a `buffer` frame, and the renderer ignores both, so the change is a `translateY` or a second lane during merges. It fixes the most visible oddity in the app — a value appearing to vanish mid-merge — for a fraction of the effort of anything else on the list.

**7.** By using it and watching. That's the honest answer for a project with no instrumentation, and it's why the weakness register exists in the handbook rather than in a dashboard: the bugs I know about were found by running the app and by measuring the engine in a script, not by a metric. If it had users I'd want uncaught-exception reporting first, because without an error boundary a crash is a blank page that nobody reports.

**8.** Because the module pages came first and the lab is where the design ended up; both work, but the lab has the better execution model and the better tests. The lab wins, and the modules' job in the medium term is to migrate onto the frame model one page at a time — starting with the ones that have the most logic in them, since they have the most to gain from recorded frames and tests.

**9.** Yes, with one caveat. The testing content isn't decoration — it's the part an interviewer can verify, and almost none of it is generic: the 150 and the 768 are specific to this codebase, the reproducibility assertion is a product requirement, and the known gaps are the interesting half. The caveat is that I wrote it *after* the code rather than alongside it, so the handbook found the merge duplicate-key bug instead of the test suite finding it. Writing the assertions first would have been better engineering and a worse handbook.

**10.** The module pages' lesson scaffolding, or the dead components. The dead code is free to remove — nine components with no importers — and the lesson content is duplicated context with the generator, which is a maintenance cost. What I wouldn't cut is the comparison panel, even though it's the most complex surface, because it's the feature that makes the tool more than an animation.

**11.** Three visual things, in order: render the buffer in merge sort so nothing appears to vanish; stack the comparison panel at narrow widths instead of shrinking both arrays; and add a one-line hint under the dataset field saying that the keyboard shortcuts exist. All three are cosmetic, and all three are the difference between "a project" and "an app".

**12.** Delta frames with keyframes, plus a raised input cap. It's the one piece of work that changes what the tool can be used for rather than how it looks, and it's the item that everything else gets easier after: with a higher cap, the comparison feature becomes genuinely useful and the saved experiments become worth keeping.

**13.** I'd ask what they'd do with the output. Visualization of a 10,000-element sort at 60 fps is not a visualization — the bars are sub-pixel, and no human can perceive a single comparison. The right answers are aggregate views: a chart of comparisons per pass, a heat map of accesses, or a coarser trace. That's a different product surface, and I'd rather build that than pretend the current one scales.

**14.** For a learning tool, the metric is whether someone can answer a question about an algorithm *using the tool* that they couldn't answer before. That's not instrumentable in a local app, which is why the honest proxy is a teaching pilot: give it to a class and see whether the comparison panel gets used voluntarily. What I would *not* measure is session length or frames viewed, because those reward making the app slower and longer.

**15.** Because a video can't answer a question you *have* — it can only play the answer someone else picked. Here you choose the input, choose the algorithm, and stop wherever the confusion is; you can put the interviewer's favourite adversary input in — already sorted, all duplicates, one element — and see what the algorithm does with it in three seconds. That's not a better explanation; it's a different activity.

---

## Interview 9 · Hana Sato — the performance engineer

:::mock Interviewer 9 · Hana Sato · Performance / Data Engineer
**Style.** Measurement-obsessed. She asks for numbers, units and the method behind them, and she treats an unmeasured claim as a hypothesis, not a fact.

**What she is testing.** Whether you can reason quantitatively about your own system.
:::

### Questions

1. What is the cost model of one commit, in units?
2. Give me the measured worst case, with the input that produces it.
3. Where does the memory actually go?
4. What's the per-frame cost during playback?
5. How did you measure any of this? Show me the method.
6. What would you measure first if I said the app felt slow?
7. Is there anything in the code that's O(n²) that shouldn't be?
8. What's the constant factor hiding behind your complexity claims?
9. If you raised the cap to 100, predict the numbers before measuring.
10. What's your frame budget, and how was it chosen?
11. What would a profiler show you that your own counters don't?
12. Where's the risk of a memory leak?
13. How would you make seek O(1) if frames were deltas?
14. What's the most expensive single line of code in the project?
15. What's your confidence in your own numbers, and where's the weakest one?

---

### Model answers

**1.** Units are operations and objects. Generation is O(F) time where F is the frame count, and O(F × n) objects allocated, because every frame clones the array and the counters. The frame count itself is O(n²) for bubble, selection and insertion, O(n log n) for merge, quick and heap — so the worst-case storage is O(n³) in operations for the quadratic sorts with per-comparison instrumentation. Then `load()` runs the generator twice, and comparison mode runs it a third and fourth time.

**2.** 1,154 frames, about 981 KB serialised, from bubble sort on the reverse-sorted 24-element input. For comparison, the same input with selection sort is 492 frames, insertion 876, merge 375, quick 632, heap 348 — merge's 375 frames are 429,684 bytes and heap's 348 are 310,978 bytes. So bubble is roughly three times heap's frame count and roughly three times its bytes.

**3.** Into two places per frame: the cloned array — n `{id, val}` objects plus the container — and the cloned `currentStats` object, plus the metadata arrays (`activeIndices`, `sortedIndices`) and the message string. The strings are interned-ish by the engine but each is a distinct template result, so they're real allocations. For n = 24 that's roughly a few hundred bytes of objects per frame, and the 24-element case with 1,154 frames lands around a megabyte with serialisation overhead included.

**4.** One reducer call, one React render of the component, one array lookup, one `map` over ≤ 24 elements with a class-string computation and a `max` reduction for the height normaliser, plus React reconciling ~24 host elements. So O(n) with n ≤ 24 and a small constant — hundreds of microseconds at worst, dominated by reconciliation rather than by my arithmetic. With comparison enabled, add a second `map` over a second trace.

**5.** By importing the engine's modules directly into a standalone Node script — `import("<abs path>/src/lab/engine.js")` — and printing aggregate tables: for every algorithm and a fixed set of inputs, the frame count, the serialised size via `JSON.stringify(frames).length`, the final counters, and the id-duplication count per frame. That method matters because it measures the *engine*, not the UI: no rendering, no timer, no React, so the numbers are about the data model rather than about the browser. I re-run the script rather than quoting remembered values.

**6.** Input latency first: click a preset and time to the first painted frame, because that's the path that includes two full generations plus a React commit. If that's fine, I'd look at playback smoothness — the interval between rendered frames versus the configured delay — because a long render would show up as jitter rather than as a slow commit. Only then would I look at memory, because memory here fails loudly rather than gradually.

**7.** Not in the algorithmic sense — the six generators are what they are, and O(n²) is the point for three of them. But there is a *repeated-work* pattern: `load()` computes the length by running the generator and the memo runs it again, so every commit does two identical O(F) computations. That's not quadratic, it's a factor of two, and it's the kind of thing that becomes a real bug rather than a cost at scale, because the two runs are two chances to disagree.

**8.** The constant factor is the clone. Each frame allocates n objects plus containers, so a "single comparison" in bubble sort costs roughly a 24-element deep copy — which means the instrumentation is asymptotically larger than the work it's instrumenting. That's the honest framing: at this scale the trace costs more than the sort, by a wide margin, and that's an accepted trade for inspectability.

**9.** Frame counts scale roughly with the operation count, so 100/24 ≈ 4.2× the elements gives roughly 17× the comparisons for a quadratic sort — about 20,000 comparisons, and if the density holds, on the order of 80,000 frames. Each frame clones a 100-element array, so it's 8 million object allocations and, at roughly 100 bytes per element plus metadata, on the order of hundreds of megabytes — and the strings for the messages add more. Prediction: a freeze on generation, and a browser tab that may be killed. Then I'd measure, and I'd expect to be within a factor of two.

**10.** No explicit animated-frame budget — and that's a weakness in the design process, not just the code. The measurements I have are: worst commit under about 100 ms, worst retained trace under about 1 MB, and playback interval equal to the configured delay with no visible jitter. If I set them deliberately I'd state 60 fps for interaction, 16 ms per frame for playback, and 4 MB retained, and then choose the instrumentation density to meet them — which would probably mean frame-per-pass rather than frame-per-comparison for the quadratic sorts.

**11.** A profiler would separate *my* cost from *React's*: my counters measure the engine, and the profiler would show the commit phase, layout, paint, and how much time React spends reconciling versus how much is spent in `ArrayView`'s arithmetic. It would also catch something my counters can't see at all — the cost of the effect churn from the keyboard listener being re-registered every frame, which is invisible to anything measuring the engine.

**12.** Three candidates. The `URL.createObjectURL` used by export is the classic one, though it's revoked in the same handler. The event listeners are the real one: the keyboard effect registers on `window` and does remove its listener, so it's balanced, but a future early-return added above the cleanup call would leak a listener per frame change. And in the legacy module pages, `iscPausedRef`/`speedRef` loops are cleared on unmount — that's the place where an async loop that outlives the component is a realistic leak.

**13.** Seek with deltas is either replay-from-keyframe or a precomputed cumulative index. The standard design is: store a full keyframe every k frames, store per-frame deltas, and carry a map from frame index to byte/array offset. Seek is then O(k) reconstruction worst case — bounded by the keyframe interval, not by the trace length — which is O(1) with respect to n if k is a constant. The trade is memory for reconstruction time, and the visible consequence is that seeking becomes slightly slower while memory drops by roughly the keyframe interval factor.

**14.** By allocation count, the frame-construction line in each generator — the one that builds `{array: cloneArray(), ..., currentStats: {...stats}}` — because it runs F times and allocates n+2 objects each time. By wall-clock in the browser, the generator call inside `load()`, which runs twice per commit. By frequency in the UI, the class-string computation inside `ArrayView`'s `map`, which runs 24 times per frame and 1,154 times in a long trace, though each is trivial.

**15.** High confidence in the frame counts and the serialised sizes — those come from re-runnable scripts over the real engine and I can reproduce any of them on request. Medium confidence in the *predictions*, like what happens at n = 100, because they extrapolate from a single density measurement. Lowest confidence in the browser-side numbers — commit latency and playback jitter — because I have no profiling data for those, only the absence of visible problems on my machine, which is a sample size of one.

---

## Interview 10 · Youssef Al-Amin — the director's round

:::mock Interviewer 10 · Youssef Al-Amin · Director of Engineering
**Style.** Warm, unhurried, and listening for structure and self-awareness rather than detail. He asks about people and decisions, and he will ask the same question twice in different words to see whether the answer changes.

**What he is testing.** Communication, ownership, judgement and whether you'd raise the level of a team.

**Ground rules.** No technical detail unless asked. Say what you did, why, and what you learned.
:::

### Questions

1. Walk me through this project in ninety seconds, for someone non-technical.
2. Why this project? What problem were you solving for yourself?
3. What's the most important decision you made, and why was it yours to make?
4. Tell me about something you were wrong about.
5. What did you do when the tests passed but the app was still wrong?
6. How did you decide what *not* to build?
7. What would you do differently about the order you worked in?
8. What are you proud of that isn't in the code?
9. What was the hardest thing to explain to someone else?
10. If a teammate disagreed with your frame design, what would happen?
11. How do you know when to stop improving something?
12. What's the next thing you'd learn, and why that?
13. What would you want to be true about your work in five years?
14. What's your relationship with criticism of this project?
15. And the same question again in different words: why should I care about this?

---

### Model answers

**1.** "It's a tool for watching an algorithm think. You give it a handful of numbers, pick a sorting method, and instead of just seeing the result, you get the entire story of how it got there — every comparison, every swap, each one as a picture you can pause on, step through, and rewind. You can run two methods on the same numbers side by side and see exactly where they diverge in effort. It runs entirely in the browser, it never sends your data anywhere, and you can save an experiment or hand it to someone as a file. The point isn't sorting — nobody needs help sorting eight numbers. The point is that watching the process is how the process becomes obvious."

**2.** I kept getting the *result* of an algorithm when what I wanted was the *behaviour*. Even a good explanation of merge sort tells you what it does and skips over the moment where the comparison goes one way rather than another, and that moment is the whole algorithm. So the project started as an attempt to make the intermediate state the product rather than the by-product — which, once I framed it that way, meant the recording wasn't an implementation detail any more, it was the deliverable.

**3.** Deciding that a frame is a complete snapshot rather than a diff. That was mine to make because it's a trade-off, not a fact: snapshots are simpler, they make rewinding free, and they're trivially comparable in tests — at roughly a kilobyte per frame for the kind of arrays this tool handles. The alternative is smaller and faster and much harder to reason about. I chose the version I could defend line by line, and I've been explicit ever since that it's the constraint that caps the input size.

**4.** I assumed that because the final frame is always correct, the intermediate frames must be too. That's not a logical step at all — it's an assumption that the *end* being right says something about the *middle* — and it was wrong in a specific, measurable way: merge sort's buffer write-back produces frames where the same element identifier appears twice, 23 of 107 frames on my default input. I found it by writing a script that printed every frame's identifiers, which was a method I only reached for because I'd stopped trusting my own reasoning.

**5.** I asked what the passing tests actually asserted. That's the whole technique: a green suite is not evidence, it's a set of specific claims, and if I write the claims down, the gap becomes obvious. In this case the assertion said "the final frame's identifiers are unique" — so of course a bug in the middle frames passes. The fix was two lines, and the more valuable output was the habit: for every green test, ask which bug it would *not* catch.

**6.** By asking who it was for. Three candidates lost that argument: a backend and accounts, because the value of the tool is that your work is local and private, and an account would add infrastructure I couldn't test; real-time animation easing, because the design is about discrete inspectable states and interpolation would blur exactly the thing being shown; and a general-purpose algorithm framework, because abstractions I'm not using are abstractions I can't defend. What I kept was the boring, defensible core.

**7.** I'd have written the assertions before the last three generators. Writing tests first against three algorithms would have made the frame contract explicit at the moment it was still negotiable — instead, I discovered what the contract was by writing six implementations and then trying to describe the common shape. The duplicate-identifier bug is the direct consequence: the contract would have said "identifiers are unique within a frame" if I'd had to state it up front.

**8.** The weakness register — the list of things that are wrong, ranked by how much they matter, with what each one would cost to fix. It took real work to make it honest, and it changed how I talk about the project: I now open with what's broken rather than what works, because that's the only way anyone can calibrate the rest. The other thing is the non-claims in the README. It's easy to write what a thing does; it takes discipline to write down what it deliberately doesn't.

**9.** Why the alignment is proportional rather than index-based. The code is one line, but the reasoning is about two recordings of different lengths — 65 frames versus 118 on my default input — and why index alignment fails visibly rather than subtly. What made it hard was that the correct version isn't obviously *better* until you see the two traces diverge, so I had to explain it with a concrete pair of numbers rather than with a principle. That's a lesson I've kept: when someone doesn't understand a design, they don't need the principle, they need the failing example.

**10.** I'd want them to attack it with a specific case rather than a preference, and if their case held I'd change it. The frame design is a trade-off, so the useful disagreement is about a consequence — memory, seek cost, test comparability — not about aesthetics. And I'd rather find out early, because this is the decision that everything else is built on; every generator, the reducer, the tests and the comparison feature all assume snapshots.

**11.** When the remaining improvement costs more than the next feature's entire value, or when it no longer changes what a user can do. The merge buffer visualization is the interesting case: the data is already there, and rendering it would fix a visible oddity, so it passes both tests — which is why it's item one on the list. Adding a seventh sorting algorithm fails both: it makes nothing clearer and costs a generator, a tutorial entry and tests.

**12.** Performance measurement — specifically profiling in the browser, because that's the one area where my numbers are weakest. I can measure the engine exactly, and I have essentially no data on commit latency, render cost or where the browser spends its time. Learning to read a flame graph properly would make me able to say what's slow instead of what *should* be slow, which is the difference between reasoning and knowing.

**13.** That the things I build are trusted because they're honest about their limits, not because they're impressive. Specifically, I'd like a reputation where a claim I make about a system can be checked — so the first thing someone does when reading my work is not to look for what I've oversold. That's a smaller ambition than "be a staff engineer" and it's the one I actually control.

**14.** Criticism is the most useful thing anyone can give me about it, and I've built the project so that criticism has somewhere to land: the weakness register, the non-claims, the footnotes on the counters. The failure mode I try to avoid is defending a design *because* I made it. When someone points at the duplicate-key bug, the useful part isn't the two-line fix — it's that my testing had a blind spot that the fix explains, and that's true regardless of who found it.

**15.** "Because the way you handle the parts that don't work will tell you more about me than the parts that do. There's a real bug in this project that I can point at, measure, and explain, and there's a testing gap that let it through — and I'd rather show you that than show you a demo that only runs on the inputs I chose. Nearly everyone can build something that works on the happy path; the signal is whether someone knows where theirs stops working and can say why."
