import test from "node:test";
import assert from "node:assert/strict";
import {
  algorithms,
  parseInput,
  playbackReducer,
  makeDataset,
  windowTrace,
  findCounterexample,
} from "../src/lab/engine.js";
import { generateWindow } from "../src/modules/core/algorithm/sorting/algorithms/SlidingWindow.js";
for (const [id, algorithm] of Object.entries(algorithms)) {
  test(`${id}: correctness, input preservation and reproducible trace`, () => {
    for (const input of [
      [],
      [1],
      [2, 2, 1],
      [-4, 0, 3, -1],
      [5, 4, 3, 2, 1],
      ...Array.from({ length: 20 }, (_, seed) => makeDataset("random", seed)),
    ]) {
      const before = [...input],
        frames = algorithm.run(input);
      assert.deepEqual(
        frames.at(-1).array.map((x) => x.val),
        [...input].sort((a, b) => a - b),
      );
      assert.deepEqual(input, before);
      assert.deepEqual(frames, algorithm.run(input));
      assert.equal(
        new Set(frames.at(-1).array.map((x) => x.id)).size,
        input.length,
      );
    }
  });
}
test("input validation rejects ambiguous, unbounded and malformed values", () => {
  for (const value of [
    "",
    "1,",
    "1,,2",
    "2.5,3",
    "1,Infinity",
    "1,1000",
    Array(25).fill(1).join(","),
  ])
    assert.throws(() => parseInput(value));
  assert.deepEqual(parseInput(" -2, 0, 3 "), [-2, 0, 3]);
});
test("playback keeps final state, pauses on seek and bounds its cursor", () => {
  let s = playbackReducer({}, { type: "load", length: 3 });
  s = playbackReducer(s, { type: "toggle" });
  s = playbackReducer(s, { type: "tick" });
  assert.equal(s.cursor, 1);
  s = playbackReducer(s, { type: "tick" });
  assert.equal(s.cursor, 2);
  assert.equal(s.playing, false);
  s = playbackReducer(s, { type: "toggle" });
  assert.equal(s.cursor, 0);
  assert.equal(s.playing, true);
  s = playbackReducer(s, { type: "seek", cursor: -10 });
  assert.equal(s.cursor, 0);
  assert.equal(s.playing, false);
  assert.equal(playbackReducer(s, { type: "seek", cursor: 999 }).cursor, 2);
});
test("datasets reproduce from a seed", () => {
  assert.deepEqual(makeDataset("random", 12), makeDataset("random", 12));
  assert.notDeepEqual(makeDataset("random", 12), makeDataset("random", 13));
});
test("sliding window regression: at least is not exactly", () => {
  assert.equal(generateWindow("2,3", 4).at(-1).bestSize, 2);
  assert.equal(windowTrace([2, 3], 4).result, 2);
  assert.equal(windowTrace([2, 3], 4, true).result, 0);
});
test("bounded differential search finds a reproducible failure", () => {
  const e = findCounterexample();
  assert.notEqual(e.correct.result, e.buggy.result);
  assert.deepEqual(e, findCounterexample());
  assert.deepEqual(e.values, [2]);
  assert.equal(e.target, 1);
});
test("window reference matches brute force within bounded domain", () => {
  for (let code = 0; code < 64; code++) {
    const a = [
      (code % 4) + 1,
      (Math.floor(code / 4) % 4) + 1,
      (Math.floor(code / 16) % 4) + 1,
    ];
    for (let target = 1; target <= 12; target++) {
      let best = Infinity;
      for (let l = 0; l < a.length; l++) {
        let sum = 0;
        for (let r = l; r < a.length; r++) {
          sum += a[r];
          if (sum >= target) best = Math.min(best, r - l + 1);
        }
      }
      assert.equal(windowTrace(a, target).result, best === Infinity ? 0 : best);
    }
  }
});

test("pathfinding is repeatable, preserves input and reports unreachable goals", async () => {
  const { runPathfinder } =
    await import("../src/modules/core/algorithm/sorting/algorithms/pathFinderLogic.js");
  const grid = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) => ({
      row,
      col,
      isWall: false,
      isVisited: false,
      previousNode: null,
    })),
  );
  const before = JSON.stringify(grid);
  for (const algorithm of ["bfs", "dfs"]) {
    const result = runPathfinder(grid, grid[0][0], grid[2][2], algorithm);
    assert.ok(result.nodesInShortestPathOrder.length > 0);
    assert.equal(JSON.stringify(grid), before);
    assert.equal(result.nodesInShortestPathOrder.at(-1).row, 2);
  }
  assert.equal(
    runPathfinder(grid, grid[0][0], grid[2][2], "bfs").nodesInShortestPathOrder
      .length,
    5,
  );
  grid[0][1].isWall = true;
  grid[1][0].isWall = true;
  assert.equal(
    runPathfinder(grid, grid[0][0], grid[2][2], "bfs").nodesInShortestPathOrder
      .length,
    0,
  );
});
test("prefix sum validates ranges and handles full-range query", async () => {
  const { generatePrefix } =
    await import("../src/modules/core/algorithm/sorting/algorithms/prefixSumLogic.js");
  assert.match(generatePrefix("1,2,3", "0", "2").at(-1).msg, /6/);
  assert.match(generatePrefix("1,2,3", "2", "0").at(-1).msg, /Invalid range/);
});
