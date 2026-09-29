%PART: Persistence and portability | PARTS XV–XVI | localStorage, the six-experiment cap, and a JSON format with a version field and four validation gates.

# 41 · Browser-local experiment saves

> What is persisted, where, how it is read back, and every way it can fail.

## 41.1 The storage contract

@@code src/lab/SortingLab.jsx 181 197

@@code src/lab/SortingLab.jsx 77 92

| Aspect | Value |
| --- | --- |
| Storage mechanism | `localStorage` — synchronous, string-only, per-origin |
| Key | `algoviz.experiments.v1` — the `.v1` suffix matches the `version: 1` field in the records |
| Shape | A JSON **array** of experiment objects |
| Record fields | `version`, `algorithm`, `input`, `cursor`, `createdAt` |
| Cap | `slice(0, 6)` — the newest six, prepended |
| Read strategy | Lazy `useState` initialiser, parsed once per mount |
| Failure handling | `try/catch` around both read and write |

:::must The complete experiment record, field by field
```js
{
  version: 1,                                  // schema version, checked on import
  algorithm: "bubble",                         // a key of the `algorithms` registry
  input: [38, 66, 12, 85, 24, 57, 43, 19],     // the committed dataset — a copy via [...input]
  cursor: 42,                                  // the frame the user was looking at
  createdAt: "2026-09-29T14:12:31.004Z"        // ISO-8601 timestamp
}
```

**What is deliberately absent:** the frames, the algorithm implementation, any engine version identifier, the counters, the comparison algorithm. The record stores *what to re-run*, not the result. That is the right call — it keeps records tiny (a few hundred bytes instead of ~1 MB), and it means a saved experiment re-runs the current algorithm code. The cost is the one the README admits: a future change to frame ordering would change the meaning of a stored cursor.
:::

## 41.2 The read path, step by step

```
   localStorage.getItem("algoviz.experiments.v1")
        |
        |  null?  ->  "[]"      (so JSON.parse never sees null)
        v
   JSON.parse(...)              -- can throw -> catch -> return []
        |
        v
   Array.isArray(data) ?
        |
        |-- no  -> []           (valid JSON, wrong shape: an object, a number, a string)
        |
        |-- yes -> data
        |            .filter(x => x && Object.hasOwn(algorithms, x.algorithm) && Array.isArray(x.input))
        |            .slice(0, 6)
        v
   saved  (component state)
        |
        v
   rendered as a list of buttons; clicking one re-validates through parseInput
```

:::must Four independent defence layers on the read path — and why each is necessary
1. **`|| "[]"`** — protects against the missing key, the single most common case (first visit).
2. **`try/catch`** — protects against malformed JSON. `localStorage` is user-writable text; `{"a":` is a legal string to store and an illegal one to parse.
3. **`Array.isArray`** — protects against well-formed JSON with the wrong structure. `"null"`, `"42"`, `"{}"` all parse successfully and would each break the subsequent `.filter`.
4. **`.filter(...)`** — protects against entries whose `algorithm` no longer exists in the registry. This matters because saved data outlives code: if an algorithm were renamed or removed in a future version, a stored record would reach `algorithms[item.algorithm].name` on the render path and throw. The filter turns "the app crashes on load for one user forever" into "the stale entry silently disappears".

There is a fifth layer at the *click* site: `parseInput(item.input.join(","))` inside a `try/catch` that sets "This saved experiment is invalid." So even an entry that survives the filter is re-validated before it can reach state.
:::

## 41.3 The write path, and the two failure modes it handles

@@code src/lab/SortingLab.jsx 189 196

| Concern | How it is handled |
| --- | --- |
| `input` mutation | `[...input]` — the record gets a copy, not the live array |
| Ordering | Newest first, via `[experiment, ...saved].slice(0, 6)` |
| The in-memory list and storage getting out of sync | `setSaved(next)` is called *inside* the `try`, after the successful `setItem`, so state only advances if the write actually succeeded |
| Quota exceeded / storage disabled | Caught; the user is told "Browser storage is unavailable. Use Export instead." — which is the correct remediation, since export does not depend on storage |
| Silent data loss on read | A malformed store returns `[]` and the UI shows the empty state; the user is not told their data was discarded. [WEAK — see below] |

:::weak Three honest limitations of the save feature
1. **A corrupt store is silently discarded.** If `JSON.parse` throws, the user sees an empty list with no explanation, and the next save overwrites the (possibly recoverable) data. A message like "Saved experiments on this device could not be read" would be more honest. [PROPOSED]
2. **No migration path.** The `version` field exists and is checked on import, but the *read* path does not consult it — it only checks that `algorithm` is known and `input` is an array. A future v2 record read by v1 code would be filtered by the algorithm check rather than migrated. [VERIFIED]
3. **Six is a hard cap.** The seventh save silently drops the oldest. That is a deliberate space bound, but there is no warning and no "archive" action — the only escape is Export. [VERIFIED]
:::

## 41.4 Reload behaviour, precisely

| Action | Result |
| --- | --- |
| Save, then reload | The list is restored from `localStorage`; the visualisation resets to the default input and algorithm, because those are `useState` initial values, not persisted |
| Click a restored entry | `parseInput` re-validates, `load()` sets `input`/`text`/`algo` and dispatches `load` for the new trace, then `seek(item.cursor)` jumps to the saved frame |
| The saved cursor's meaning | The frame *index*, not the frame content. For the same input and an unchanged generator, index 42 is the same frame. If the generator changed in a later release, index 42 could be a different moment — this is exactly the caveat the README documents |
| Two tabs open | Each has its own `saved` state. Saving in tab A writes to the shared store, but tab B does not re-read it. On tab B's next successful save, it writes its own list — and if it had loaded before tab A saved, it will overwrite tab A's entry. **There is no `storage` event listener and no conflict resolution.** [VERIFIED as an absence; it is a genuine multi-tab limitation] |

## 41.5 The persistence questions

:::q "Why not a backend?"
"Because the feature doesn't need one, and a backend would add trust problems that don't currently exist. Nothing here needs to be shared, synchronised, or durable beyond one browser — a user saves an experiment to come back to it. A server would mean accounts or anonymous identifiers, a database schema and its migrations, an upload path that has to validate untrusted JSON server-side, rate limiting, and a privacy story. And it would make the app unusable offline, which it currently isn't. The README states the scope explicitly: 'There is no application backend, authentication, cloud database, AI service, or arbitrary user-code execution.'"
:::

:::q "Why not PostgreSQL?"
"PostgreSQL is the right answer to 'I have relational data that must be durable, queryable and shared' — none of which is true here. My data is a handful of small documents, owned by one browser, never queried by anything but its own owner, and never read concurrently. There's no relationship to model: an experiment belongs to the device, not to a user, because there are no users. Using a database would mean adding a server, a connection, a schema, a migration story and an operations burden to store six JSON records — and the record is *already* a portable JSON document, which is why export/import works with no server at all."
:::

:::q "Can another device access it?"
"No. `localStorage` is scoped to an origin on a device — it isn't even shared across browsers on the same machine. That's why export exists: the JSON file is the only cross-device path, and it's a manual one. If synchronisation were a requirement, I'd have to add a server and an identity, and then I'd also have to answer what happens when two devices edit the same experiment."

That last clause is the senior answer: it names the problem that arrives with the feature, not just the missing feature.
:::

:::q "Is localStorage secure?"
"No, and it's important to be precise about what that means. It provides confidentiality from *nothing* — any JavaScript running on the origin can read it, its contents are visible in DevTools, and it isn't encrypted at rest by the browser in any meaningful sense. It provides a small amount of integrity protection by accident: you cannot read it from another origin, and `localStorage` is not sent with requests, so it isn't exposed to CSRF or to network interception.

For this project the data is non-sensitive — an array of integers and a frame index that the user typed. The realistic threats are (a) the user tampering with their own saved data, which is handled by re-validating on read *and again* on click, and (b) any XSS on the origin being able to read or rewrite experiments — and for an app with no accounts and no secrets, an attacker reading your sorting history gains nothing. The one thing I'd never do is store a token or a secret there, and nothing in this codebase does."
:::

:::q "What if the user clears storage?"
"Their saved experiments are gone, silently — there's no warning and no recovery. `localStorage` is explicitly not durable: browsers clear it on 'clear browsing data', in some private-browsing modes it may not persist at all, and under storage pressure the browser may evict it. The mitigation is already in the product: the Export button produces a portable JSON file, and the README says so — 'Export provides the portable backup.' The honest framing is that Export is the primary storage mechanism and localStorage is a convenience cache."
:::

:::q "What if the stored JSON is malformed?"
"Four things could happen and all four are handled. If `getItem` returns `null`, I substitute `'[]'`. If the string doesn't parse, the `try/catch` returns an empty list. If it parses to a non-array, `Array.isArray` rejects it. If it's an array of objects that don't match my shape, `.filter` drops them — checking the record exists, that its `algorithm` is a currently known key, and that `input` is an array. And if a record survives all of that but has a bad value, the click handler re-validates through `parseInput` and reports 'This saved experiment is invalid.' So the boundary is: anything from storage is untrusted input, and it is validated twice before it can reach application state."
:::

:::q "Could a crafted localStorage value execute code in your app?"
"No — there's no code path from stored data to evaluation. The stored fields are used as: a key looked up in a frozen set (`Object.hasOwn`), an array passed through `parseInput` (parsed with a regex and `Number`), a number passed to `Number.isInteger`, and a string rendered as a timestamp. I never `eval`, never construct a function, never build a URL from it, and React escapes the rendered string. The worst a crafted record can do is fail validation. That said, one thing I'd change: `createdAt` is never rendered anywhere, so the field is currently dead weight — and storing anything I don't use is a bad habit, because it's data I'd have to defend without having a purpose for it." [VERIFIED — `createdAt` is written and never read]
:::

---

# 42 · JSON import and export

> A versioned, size-bounded, four-gate import path — and fifteen questions about it.

## 42.1 The export path

@@code src/lab/SortingLab.jsx 49 58

| Step | Detail |
| --- | --- |
| Payload | `{version: 1, algorithm: algo, input, cursor}` — note the export payload is *smaller* than the saved record (no `createdAt`) |
| Serialisation | `JSON.stringify(data, null, 2)` — pretty-printed for human readability |
| Blob | `new Blob([json], {type: "application/json"})` |
| URL | `URL.createObjectURL(blob)` — a `blob:` URL valid only in this document |
| Download | A detached `<a>` with `download="algoviz-experiment.json"`, clicked programmatically |
| Cleanup | `URL.revokeObjectURL(url)` after 1,000 ms |

:::must Why the export payload differs from the saved record — and the trap in it
The saved record has `createdAt`; the export does not. So a saved experiment and an exported experiment carry *different* field sets under the same `version: 1`. That is defensible — `createdAt` is device-local metadata with no use in a portable file — but it means the version number does not describe one canonical shape. If someone later added a required field, `version` would be the place to signal it. Worth knowing before you are asked "is your schema consistent?"

Also note: **`export` does not include the frames, the counters, or any engine identifier.** So an exported file describes *how to reproduce a run*, not the run itself. If the algorithm code changes, the same file produces a different trace — which is precisely the caveat the README documents about cursor meaning.
:::

## 42.2 The import path, gate by gate

@@code src/lab/SortingLab.jsx 156 180

| Gate | Check | Failure message | What it defends against |
| --- | --- | --- | --- |
| 0 | A file was actually selected, and the input is reset (`event.target.value = ""`) | silent return | An empty selection, and the "select the same file twice does nothing" bug — clearing the value makes the change event fire again for a repeated selection |
| 1 | `file.size > 16384` → reject | "Experiment files must be smaller than 16 KB." | Oversized files: a denial-of-service vector against the main thread (`file.text()` and `JSON.parse` both run synchronously) and against the tab's memory |
| 2 | `data?.version !== 1` | "Not a supported AlgoViz experiment." | Wrong-format files, other JSON entirely, and future schemas |
| 3 | `!Object.hasOwn(algorithms, data.algorithm)` | same message | An algorithm key that doesn't exist — including prototype keys, because `Object.hasOwn` does not walk the prototype chain |
| 4 | `!Array.isArray(data.input)` | same message | A non-array input |
| 5 | `parseInput(data.input.join(","))` | the message from `parseInput` itself | **Every value-level rule, re-used.** The imported array is flattened to a comma string and run through the exact same validator the UI uses — so the ±999 bound, the 2–24 count rule, the integer regex and the safe-integer check all apply |
| 6 | `Number.isInteger(data.cursor) ? data.cursor : 0` | falls back to 0 | A missing, non-numeric, or fractional cursor. A fraction would produce `frames[2.5] === undefined` and crash the render |

:::key The design principle behind this path
**An imported file is untrusted input and gets no privileges.** It is not "our own data" even though we produced it, because it may have been edited, hand-written, truncated, corrupted in transit, or produced by a different version. So it is validated through exactly the same function the UI uses (`parseInput`), plus a schema gate, plus a size gate. Nothing about the import path assumes good faith.
:::

:::must Gate 5 is the strongest thing in this chapter — say it explicitly
"I don't have a second validator for imports. The imported input is joined into a comma-separated string and passed to `parseInput` — the same function the form calls. That means there is exactly one definition of a valid dataset in the codebase, and the file format cannot drift away from it. The cost is a tiny inefficiency (I serialise then re-parse), and the benefit is that I can't have a validator that's accidentally more permissive than the UI."
:::

## 42.3 What is NOT validated — the honest gap list

| Gap | Consequence |
| --- | --- |
| `data` being an array, a string, or `null` | Handled implicitly: `data?.version` is `undefined` for a non-object, and `undefined !== 1`, so gate 2 rejects it. This is correct but relies on the `?.` operator rather than an explicit `typeof` check |
| Extra unexpected properties | Ignored silently. `{version:1, algorithm:"bubble", input:[1,2], cursor:0, evil:"payload"}` import is accepted and `evil` is simply never used. Not a vulnerability here, but an explicit allowlist of fields would be more rigorous |
| `cursor` beyond the trace length | Not checked at import time. `dispatch({type:"seek", cursor})` catches it: the reducer clamps to `length - 1`. So the outcome is safe, but the *clamping* happens in the reducer rather than the validator |
| JSON with duplicate keys, depth bombs, or huge nesting | Not specifically defended. `JSON.parse` handles depth, and the 16 KB cap bounds the damage. A nested-array `input` would fail `Array.isArray` only if it weren't an array — `[[1,2],[3,4]]` passes gate 4, then `.join(",")` produces `"1,2,3,4"` and imports as `[1,2,3,4]`. **That is a real quirk**: a 2-D array imports as its flattened values. It fails safely (the result is a valid dataset the user can see), but it is not what the schema says. [VERIFIED] |
| Schema version *downgrade* | A `version: 2` file is rejected outright rather than migrated, which is the safe default |

## 42.4 Fifteen import/export questions

:::q 1. What does the exported file contain?
`{version: 1, algorithm, input, cursor}` — pretty-printed with a 2-space indent. No frames, no counters, no engine version. [VERIFIED]
:::

:::q 2. Why `JSON.stringify(data, null, 2)` and not plain `stringify`?
Readability. The file is meant to be inspectable and hand-editable — you can open it in any editor and see the array. The size cost is irrelevant for a sub-kilobyte document.
:::

:::q 3. Why is the file capped at 16 KB?
To bound a synchronous parse on the main thread, and to keep the import path from being a simple way to hang the tab. A legitimate file is a few hundred bytes, so 16 KB is roughly 50× headroom.
:::

:::q 4. Where does the size check happen?
`file.size > 16384` — before `file.text()` is even awaited, so an oversized file is never read into memory.
:::

:::q 5. What if the file isn't JSON at all?
`JSON.parse` throws, the `catch` sets the error banner to the parser's message. The message is the engine's, not mine — so a malformed JSON file shows something like "Unexpected token < in JSON at position 0". That is honest but not friendly; a nicer version would catch the parse separately and say "This file isn't valid JSON." [PROPOSED]
:::

:::q 6. What if the JSON is valid but is an array?
`data?.version` is `undefined` → `undefined !== 1` → rejected with "Not a supported AlgoViz experiment."
:::

:::q 7. What if `algorithm` is `"constructor"` or `"__proto__"`?
Rejected. `Object.hasOwn(algorithms, "constructor")` is `false`, because `Object.hasOwn` checks own properties only and does not consult the prototype chain. Using `algorithms[key]` alone — or `key in algorithms` — would have been the vulnerable version. This is a good, concrete example of a subtle JavaScript security detail handled correctly. [VERIFIED]
:::

:::q 8. What if `input` contains a nested array?
It passes the `Array.isArray` gate, then `.join(",")` flattens it, and the flattened values are validated by `parseInput`. So `[[1,2],[3,4]]` imports as `[1,2,3,4]`. It fails safe — the user sees a valid, correctly validated dataset — but it is more permissive than the schema implies. [VERIFIED]
:::

:::q 9. What if `cursor` is 5000 and the trace has 100 frames?
It is dispatched as a seek, and the reducer clamps it to 99. Safe, but the clamp lives in the reducer rather than in the validator.
:::

:::q 10. What if `cursor` is 2.5?
`Number.isInteger(2.5)` is false, so it falls back to 0. [VERIFIED]
:::

:::q 11. What if `input` has 30 values?
`parseInput` throws "Use 2–24 values…", and the error is shown. The file's own values never reach state.
:::

:::q 12. Does import overwrite existing data?
No. Import only sets `input`, `text`, `algo` and the cursor. It does not touch `saved` — importing a file does not add it to the saved list. To keep it, the user must press Save.
:::

:::q 13. Does export include the comparison algorithm?
No. `compare` and `other` are not in the payload, so an exported comparison experiment restores only the primary algorithm and the cursor. The comparison panel would be off unless the URL has `?compare=1`.
:::

:::q 14. Could the import path be used for code execution?
No. The only consumers of the parsed data are `Object.hasOwn` (a property lookup), `Array.isArray`, `Array.prototype.join`, `parseInput` (regex + `Number`), `Number.isInteger`, and `dispatch`. Nothing evaluates a string; nothing builds a URL; React escapes the rendered values. The strongest thing an attacker can do with 16 KB of crafted JSON is make the app display a validation error.
:::

:::q 15. How would you test the import path?
These are the cases I'd assert, in order of value: (1) valid file → input/algo/cursor restored; (2) `version: 2` → rejected; (3) unknown algorithm → rejected; (4) `input: "abc"` → rejected; (5) `input: [1,1000]` → rejected by the ±999 bound; (6) `input: [1]` → rejected by the 2–24 rule; (7) 20 KB file → rejected by size; (8) `cursor: 9999` → clamped by the reducer; (9) `algorithm: "__proto__"` → rejected. **Of these nine, none is currently automated** — the import path has no test coverage in the repository. That is the single biggest testing gap in the project, and the honest answer is to say so and describe the first three you would write. [VERIFIED absence]
:::

:::weak The one-line summary of the import story's weakness
Everything about the import path is *robust* but nothing about it is *tested*. It has six gates and zero assertions. If an interviewer asks "what's the biggest gap in your tests?", this is a better answer than "coverage is low", because it is specific, actionable, and shows you distinguished between validation that exists and validation that is verified.
:::
