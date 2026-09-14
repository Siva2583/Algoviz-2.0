import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  GitCompareArrows,
  ScanLine,
  Rewind,
  Bug,
  Braces,
  Network,
  Binary,
  Workflow,
  ArrowDownWideNarrow,
  Layers3,
} from "lucide-react";
import Shell from "./Shell";
import { CORE_MODULES, PATTERN_MODULES } from "../constants";
const categoryIcons = {
  Graphs: Network,
  Sorting: ArrowDownWideNarrow,
  Searching: Binary,
  Recursion: Workflow,
  Trees: Workflow,
  Arrays: Braces,
  Intervals: Layers3,
};
const bars = [38, 66, 46, 92, 58, 80, 30, 72, 50, 100];
export default function Overview({ library = false }) {
  return (
    <Shell>
      <main
        className={`av-page av-overview ${library ? "av-library-page" : ""}`}
      >
        {!library && (
          <>
            <div className="av-eyebrow">
              <span /> YOUR NEXT AHA MOMENT STARTS HERE
            </div>
            <section className="av-hero">
              <div>
                <h1>
                  Don’t just watch.
                  <br />
                  <em>Understand the why.</em>
                </h1>
                <p>
                  An algorithm is a sequence of decisions. Slow it down, rewind
                  it, and challenge every assumption—in your own little
                  laboratory.
                </p>
                <div className="av-actions">
                  <Link className="av-button primary" to="/lab">
                    Open the laboratory <ArrowRight size={17} />
                  </Link>
                  <Link className="av-text-link" to="/counterexample">
                    Find a counterexample <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="av-hero-meta">
                  <span>06 sorting algorithms</span>
                  <span>Frame-by-frame replay</span>
                  <span>100% in your browser</span>
                </div>
              </div>
              <div className="av-hero-art">
                <div className="av-art-head">
                  <span>
                    <i /> execution.trace
                  </span>
                  <span>QUICK SORT</span>
                </div>
                <div className="av-art-bars">
                  {bars.map((n, i) => (
                    <div
                      key={i}
                      style={{ height: `${n}%` }}
                      className={i === 3 ? "selected" : i > 6 ? "done" : ""}
                    >
                      <span>{n}</span>
                    </div>
                  ))}
                </div>
                <div className="av-art-bottom">
                  <Braces size={17} />
                  <span>Compare. Partition. Understand.</span>
                  <span className="av-cursor">_</span>
                </div>
                <div className="av-float">
                  <ScanLine size={17} /> Every operation tells a story.
                </div>
              </div>
            </section>
            <section className="av-features">
              <Link to="/lab">
                <Rewind />
                <div>
                  <h3>Time is in your hands</h3>
                  <p>Step forward, rewind, or jump to any frame.</p>
                </div>
                <ArrowUpRight size={17} />
              </Link>
              <Link to="/lab?compare=1">
                <GitCompareArrows />
                <div>
                  <h3>Same input. Different thinking.</h3>
                  <p>Compare actual comparison counts, not animation speed.</p>
                </div>
                <ArrowUpRight size={17} />
              </Link>
              <Link to="/counterexample">
                <Bug />
                <div>
                  <h3>Break an assumption</h3>
                  <p>Find the input that exposes a subtle algorithm bug.</p>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            </section>
          </>
        )}
        <div className="av-section-heading">
          <div>
            <div className="av-eyebrow">
              {library ? "THE COLLECTION" : "PICK A STARTING POINT"}
            </div>
            <h2>
              {library
                ? "Algorithm library"
                : "A world of patterns. One workspace."}
            </h2>
          </div>
          <span className="av-count">12 interactive modules</span>
        </div>
        <div className="av-library-grid">
          {[...CORE_MODULES, ...PATTERN_MODULES].map((m, i) => {
            const Icon = categoryIcons[m.category] || Braces;
            return (
              <Link key={m.id} to={m.path} className="av-module">
                <div className="av-module-top">
                  <div className="av-module-card-identity">
                    <span className="av-module-card-icon">
                      <Icon size={23} strokeWidth={1.4} />
                    </span>
                    <span className="av-module-number">
                      {String(i + 1).padStart(2, "0")} /
                    </span>
                  </div>
                  <span className={`av-tag ${m.difficulty.toLowerCase()}`}>
                    {m.difficulty}
                  </span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <div className="av-module-bottom">
                  <span>{m.category}</span>
                  <ArrowUpRight size={19} />
                </div>
              </Link>
            );
          })}
        </div>
        <div className="av-bottom-banner">
          <div>
            <span className="av-eyebrow">A BETTER WAY TO PREPARE</span>
            <h3>
              The interesting part isn’t the answer.
              <br />
              It’s explaining how you got there.
            </h3>
          </div>
          <Link to="/lab" className="av-button">
            Run your first experiment <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    </Shell>
  );
}
