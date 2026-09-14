# Your five-minute interview demo

## 0:00 — State the problem

“Watching animations did not tell me whether I could reason through an algorithm. I made the execution inspectable and added a way to expose incorrect assumptions.”

## 0:30 — Show the sorting lab

Apply a short duplicate-heavy array. Play, pause, step back and seek to completion. Inspect active indices and explain why final state remains visible.

Explain `src/lab/engine.js`'s playback reducer. The algorithm executes first; the cursor selects recorded states. Rewind is recorded-state replay, not running JavaScript backward. A React effect owns one timer and cleans it up when playback changes or the route unmounts.

## 1:30 — Compare fairly

Enable comparison and choose selection versus merge. The input is identical. Show comparison counts. Say explicitly: “I do not compare animated wall-clock durations, and percentage-aligned frames are not equivalent operations.”

Explain why trace storage is expensive: a quadratic algorithm copying an n-element array each step can use cubic snapshot storage. The present release caps inputs at 24 rather than claiming scalability it does not have.

## 2:30 — Demonstrate the differentiator

Open Counterexample Lab. For [2,3], target 4, predict 2. Show how an exact-equality check wrongly gives 0. Search finds [2], target 1. Explain enumeration order, bounded domains, and why this is not universal minimality or formal verification.

## 3:30 — Show engineering evidence

Run `npm test`. Open the tests for sorted output, input preservation, deterministic frames, lifecycle transitions and the sliding-window regression. Explain seeded generated cases versus a full property-testing library; this release uses Node's built-in test runner.

## 4:30 — Save, export, explain trade-offs

Save the experiment at a selected frame. Reload it. Export/import the JSON. Explain that localStorage belongs to this browser/origin, cannot guarantee durable storage, and requires no authentication.

## Questions to prepare

- Why a reducer instead of independent booleans and loops?
- Why preserve the existing generators rather than rewrite all algorithms?
- What is deterministic: input, IDs, events, or wall-clock timings?
- How does a stable ID differ from an array index while sorting?
- Why is a shortest-path claim valid for BFS here but not DFS?
- Which counters are comparable across implementations?
- How would checkpoints and deltas reduce memory?
- When would a Web Worker be worth adding?
- What changes if arbitrary user code is allowed? (Do not call a Worker a security sandbox.)

## What not to claim

Do not call this MERN, full-stack, a general visual debugger, a universal counterexample finder, a secure code runner, a formal verifier, or a production-scale benchmark platform. There is no AI or backend. Legacy non-sorting modules are preserved, not fully rebuilt.

Before interviews, read and modify the reducer/tests yourself. Be comfortable explaining the implementation and acknowledge assistance if asked. A feature you understand deeply is more valuable than five you cannot defend.
