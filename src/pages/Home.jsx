import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Overview from "../lab/Overview";
import Shell from "../lab/Shell";
const SortingLab = lazy(() => import("../lab/SortingLab"));
const Counterexample = lazy(() => import("../lab/Counterexample"));
const BinarySearch = lazy(() => import("../modules/core/BinarySearch"));
const NQueens = lazy(() => import("../modules/core/Nqueens"));
const TwoPointers = lazy(() => import("../modules/patterns/TwoPointers"));
const FastSlowPointers = lazy(
  () => import("../modules/patterns/FastSlowPointers"),
);
const BinaryVariants = lazy(() => import("../modules/patterns/BinaryVariants"));
const PrefixSum = lazy(() => import("../modules/patterns/PrefixSum"));
const SlidingWindow = lazy(() => import("../modules/patterns/SlidingWindow"));
const MergeIntervals = lazy(() => import("../modules/patterns/MergeIntervals"));
const TreeTraversal = lazy(() => import("../modules/core/TreeTraversal"));
const Pathfinder = lazy(() => import("../modules/core/PathFinder"));
export default function Home() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <Shell>
            <main
              className="av-page av-loading"
              role="status"
              aria-label="Loading workspace"
            >
              <div className="av-eyebrow">PREPARING YOUR EXPERIMENT</div>
              <h1>One moment of curiosity…</h1>
              <div className="av-loading-block" />
              <div className="av-loading-block tall" />
              <p>Loading workspace</p>
            </main>
          </Shell>
        }
      >
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/library" element={<Overview library />} />
          <Route path="/lab" element={<SortingLab />} />
          <Route path="/counterexample" element={<Counterexample />} />
          <Route path="/modules/core/simple-sort" element={<SortingLab />} />
          <Route
            path="/modules/core/advanced-sort"
            element={<SortingLab key="advanced" />}
          />
          <Route
            path="/modules/core/binary-search"
            element={<BinarySearch />}
          />
          <Route path="/modules/core/n-queens" element={<NQueens />} />
          <Route
            path="/modules/patterns/two-pointers"
            element={<TwoPointers />}
          />
          <Route
            path="/modules/patterns/fast-slow"
            element={<FastSlowPointers />}
          />
          <Route
            path="/modules/patterns/bs-variants"
            element={<BinaryVariants />}
          />
          <Route path="/modules/patterns/prefix-sum" element={<PrefixSum />} />
          <Route
            path="/modules/patterns/sliding-window"
            element={<SlidingWindow />}
          />
          <Route
            path="/modules/patterns/merge-intervals"
            element={<MergeIntervals />}
          />
          <Route
            path="/modules/core/tree-traversal"
            element={<TreeTraversal />}
          />
          <Route path="/modules/core/pathfinding" element={<Pathfinder />} />
          <Route
            path="*"
            element={
              <Shell>
                <main className="av-page av-loading">
                  <div className="av-eyebrow">
                    404 / OUTSIDE THE SEARCH SPACE
                  </div>
                  <h1>Experiment not found.</h1>
                  <p>
                    That path does not lead to an experiment. Let’s find you a
                    new starting point.
                  </p>
                  <Link className="av-button primary" to="/library">
                    ← Explore the library
                  </Link>
                </main>
              </Shell>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
