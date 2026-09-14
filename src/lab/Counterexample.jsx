import { useState } from "react";
import { Bug, ArrowRight, CheckCircle2, Search, RotateCcw } from "lucide-react";
import Shell from "./Shell";
import { findCounterexample, windowTrace } from "./engine";
export default function Counterexample() {
  const [example, setExample] = useState({ values: [2, 3], target: 4 });
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [searched, setSearched] = useState(false);
  const correct = windowTrace(example.values, example.target),
    buggy = windowTrace(example.values, example.target, true);
  const divergence = correct.trace.findIndex(
    (event, i) => event.best !== buggy.trace[i]?.best,
  );
  function search() {
    const found = findCounterexample();
    if (found) {
      setExample(found);
      setRevealed(true);
      setSearched(true);
      setAnswer(null);
    }
  }
  return (
    <Shell>
      <main className="av-page">
        <div className="av-eyebrow">EXPERIMENT / CORRECTNESS</div>
        <div className="av-workspace-heading">
          <div>
            <h1>
              Small input.
              <br />
              <span className="av-accent">Big misconception.</span>
            </h1>
            <p>
              A working example isn’t proof. Find the one that breaks your
              assumption.
            </p>
          </div>
          <span className="av-big-icon">
            <Bug size={48} />
          </span>
        </div>
        <div className="av-counter-intro">
          <span className="av-tag">CASE STUDY 001</span>
          <h2>“At least” is not “exactly.”</h2>
          <p>
            Find the shortest contiguous subarray whose sum is{" "}
            <strong>at least the target</strong>. Both implementations expand
            and shrink a window. One tiny condition changes the answer.
          </p>
          <span className="av-fine">
            Preconditions: positive integers and a positive target.
          </span>
        </div>
        <div className="av-code-pair">
          {[false, true].map((wrong) => (
            <section
              key={String(wrong)}
              className={`av-panel ${wrong ? "av-bug-panel" : ""}`}
            >
              <div className="av-panel-heading">
                <h2>{wrong ? "The subtle bug" : "Reference implementation"}</h2>
                <span className="av-tag">
                  {wrong ? "VARIANT B" : "REFERENCE A"}
                </span>
              </div>
              <pre>
                <span className="av-code-muted">
                  // Window already includes arr[right]
                </span>
                {"\n"}while (sum &gt;= target) {"{"}
                {"\n"}
                {wrong && (
                  <span className="av-code-bad">
                    {"  if (sum === target)\n"}
                  </span>
                )}
                <span className={!wrong ? "av-code-good" : ""}>
                  {"  best = Math.min(best, right - left + 1);\n"}
                </span>
                {"  sum -= arr[left++];\n}"}
              </pre>
              <p>
                {wrong
                  ? "Records only exact matches, silently ignoring larger qualifying sums."
                  : "Records every qualifying window before shrinking it."}
              </p>
            </section>
          ))}
        </div>
        <section className="av-panel av-prediction">
          <div>
            <span className="av-eyebrow">BEFORE YOU RUN IT</span>
            <h2>What should the correct answer be?</h2>
            <div className="av-example-input">
              {example.values.map((n, i) => (
                <span key={i}>{n}</span>
              ))}
              <strong>target ≥ {example.target}</strong>
            </div>
            <p>Choose the minimum length. Zero means no qualifying window.</p>
          </div>
          <div className="av-answer-buttons">
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                aria-pressed={answer === n}
                className={answer === n ? "chosen" : ""}
                onClick={() => {
                  setAnswer(n);
                  setRevealed(true);
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </section>
        {revealed && (
          <section className="av-verdict" aria-live="polite">
            <div className="av-verdict-heading">
              <CheckCircle2 />
              <h2>
                {answer === null
                  ? "Counterexample found."
                  : answer === correct.result
                    ? "Exactly. Now look at the divergence."
                    : "Not quite. Here’s why."}
              </h2>
            </div>
            <div className="av-result-grid">
              <div>
                <span>REFERENCE RESULT</span>
                <strong>{correct.result}</strong>
              </div>
              <div className="bad">
                <span>BUGGY RESULT</span>
                <strong>{buggy.result}</strong>
              </div>
              <div>
                <span>FIRST DIVERGENCE</span>
                <strong>#{divergence}</strong>
              </div>
            </div>
            <div className="av-divergence">
              <span className="av-eyebrow">
                SAME STATE · DIFFERENT DECISION
              </span>
              <h3>
                sum = {correct.trace[divergence]?.sum}, target ={" "}
                {example.target}
              </h3>
              <p>
                <b>Reference:</b> {correct.trace[divergence]?.action}
              </p>
              <p>
                <b>Variant:</b> {buggy.trace[divergence]?.action}
              </p>
            </div>
            <p className="av-fine">
              {searched
                ? "Search checked positive arrays of length 1–3 with values 1–4 and targets 1–8, in increasing length then lexicographic order. This is the first failure in that bounded domain—not a universal minimality proof."
                : "This example reproduces a correctness mismatch found in the original AlgoViz sliding-window generator. The library implementation has been corrected."}
            </p>
          </section>
        )}
        <div className="av-counter-actions">
          <button className="av-button primary" onClick={search}>
            <Search size={17} /> Find a smaller counterexample{" "}
            <ArrowRight size={17} />
          </button>
          <button
            className="av-button"
            onClick={() => {
              setExample({ values: [2, 3], target: 4 });
              setRevealed(false);
              setAnswer(null);
              setSearched(false);
            }}
          >
            <RotateCcw size={16} /> Reset challenge
          </button>
        </div>
        <div className="av-bottom-banner">
          <div>
            <span className="av-eyebrow">THE ENGINEERING TAKEAWAY</span>
            <h3>
              Don’t just test the happy path.
              <br />
              Test the assumption.
            </h3>
          </div>
          <p>
            Bounded exhaustive search + differential execution +
            first-divergence inspection. No AI guesses. Just reproducible
            evidence.
          </p>
        </div>
      </main>
    </Shell>
  );
}
