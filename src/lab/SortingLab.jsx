import { useState, useReducer, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  Upload,
  Shuffle,
  Check,
  GitCompareArrows,
} from "lucide-react";
import Shell from "./Shell";
import TutorialTab from "../modules/core/tutorials/TutorialTab";
import { simpleSortData } from "../modules/core/tutorials/simplesortData";
import { sortingData } from "../modules/core/tutorials/sortingTutorialsData";
import { algorithms, parseInput, playbackReducer, makeDataset } from "./engine";

function ArrayView({ frame, compact = false }) {
  const max = Math.max(1, ...frame.array.map((x) => Math.abs(x.val)));
  return (
    <div
      className={`av-array ${compact ? "compact" : ""}`}
      aria-label="Array execution state"
    >
      {frame.array.map((item, i) => {
        const active = frame.activeIndices?.includes(i),
          sorted = frame.sortedIndices?.includes(i),
          pivot = frame.pivotIndex === i;
        return (
          <div className="av-array-column" key={item.id}>
            <div
              className={`av-bar ${active ? "active" : ""} ${sorted ? "sorted" : ""} ${pivot ? "pivot" : ""}`}
              style={{ height: `${25 + (Math.abs(item.val) / max) * 75}%` }}
            >
              <strong>{item.val}</strong>
              <span>{pivot ? "P" : active ? "●" : sorted ? "✓" : ""}</span>
            </div>
            <small>{i}</small>
          </div>
        );
      })}
    </div>
  );
}
function download(data) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "algoviz-experiment.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function SortingLab() {
  const fileInput = useRef(null);
  const [params] = useSearchParams();
  const location = useLocation();
  const initial = Object.hasOwn(algorithms, params.get("algorithm"))
    ? params.get("algorithm")
    : location.pathname.includes("advanced-sort")
      ? "quick"
      : "bubble";
  const [algo, setAlgo] = useState(initial);
  const [text, setText] = useState("38, 66, 12, 85, 24, 57, 43, 19");
  const [input, setInput] = useState([38, 66, 12, 85, 24, 57, 43, 19]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [speed, setSpeed] = useState(160);
  const [compare, setCompare] = useState(params.has("compare"));
  const [other, setOther] = useState("merge");
  const [seed, setSeed] = useState(42);
  const [saved, setSaved] = useState(() => {
    try {
      const data = JSON.parse(
        localStorage.getItem("algoviz.experiments.v1") || "[]",
      );
      return Array.isArray(data)
        ? data
            .filter(
              (x) => x && Object.hasOwn(algorithms, x.algorithm) && Array.isArray(x.input),
            )
            .slice(0, 6)
        : [];
    } catch {
      return [];
    }
  });
  const frames = useMemo(() => algorithms[algo].run(input), [algo, input]);
  const otherFrames = useMemo(
    () => (compare ? algorithms[other].run(input) : []),
    [compare, other, input],
  );
  const [playback, dispatch] = useReducer(playbackReducer, {
    cursor: 0,
    length: frames.length,
    playing: false,
  });
  const cursor = Math.min(playback.cursor, frames.length - 1),
    frame = frames[cursor];
  const seek = (index) => dispatch({ type: "seek", cursor: index });
  useEffect(() => {
    if (!playback.playing) return;
    const id = setTimeout(() => dispatch({ type: "tick" }), speed);
    return () => clearTimeout(id);
  }, [playback.playing, playback.cursor, speed]);
  useEffect(() => {
    const key = (e) => {
      if (
        /INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName) ||
        e.target.isContentEditable ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        dispatch({ type: "toggle" });
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        dispatch({ type: "seek", cursor: cursor + 1 });
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        dispatch({ type: "seek", cursor: cursor - 1 });
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [cursor]);
  function load(values, algorithm = algo) {
    setInput(values);
    setText(values.join(", "));
    setAlgo(algorithm);
    dispatch({
      type: "load",
      length: algorithms[algorithm].run(values).length,
    });
    setError("");
    setNotice("");
  }
  function apply(e) {
    e?.preventDefault();
    try {
      load(parseInput(text));
    } catch (err) {
      setError(err.message);
    }
  }
  async function importExperiment(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 16384)
        throw new Error("Experiment files must be smaller than 16 KB.");
      const data = JSON.parse(await file.text());
      if (
        data?.version !== 1 ||
        !Object.hasOwn(algorithms, data.algorithm) ||
        !Array.isArray(data.input)
      )
        throw new Error("Not a supported AlgoViz experiment.");
      const values = parseInput(data.input.join(","));
      load(values, data.algorithm);
      dispatch({
        type: "seek",
        cursor: Number.isInteger(data.cursor) ? data.cursor : 0,
      });
      setNotice("Experiment imported. Ready to inspect.");
    } catch (err) {
      setError(err.message);
    }
  }
  function save() {
    const experiment = {
      version: 1,
      algorithm: algo,
      input: [...input],
      cursor,
      createdAt: new Date().toISOString(),
    };
    const next = [experiment, ...saved].slice(0, 6);
    try {
      localStorage.setItem("algoviz.experiments.v1", JSON.stringify(next));
      setSaved(next);
      setNotice("Saved on this device.");
    } catch {
      setNotice("Browser storage is unavailable. Use Export instead.");
    }
  }
  const meta = algorithms[algo],
    stats = frame.currentStats || {},
    last = frames.at(-1).currentStats;
  const compareCursor = otherFrames.length
    ? Math.round((cursor / (frames.length - 1)) * (otherFrames.length - 1))
    : 0;
  return (
    <Shell>
      <main className="av-page av-workspace">
        <div className="av-workspace-heading">
          <div>
            <div className="av-eyebrow">EXPERIMENT / SORTING</div>
            <h1>
              Sorting laboratory<span className="av-title-dot">.</span>
            </h1>
            <p>One input. Every decision. Nothing hidden.</p>
          </div>
          <div className="av-actions">
            <button className="av-button" onClick={save}>
              <Save size={16} /> Save
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={importExperiment}
              aria-label="Import experiment file"
            />
            <button
              className="av-button"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={16} /> Import
            </button>
            <button
              className="av-button"
              onClick={() =>
                download({ version: 1, algorithm: algo, input, cursor })
              }
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
        <form className="av-input-panel" onSubmit={apply}>
          <label>
            ALGORITHM
            <select value={algo} onChange={(e) => load(input, e.target.value)}>
              {Object.entries(algorithms).map(([id, a]) => (
                <option key={id} value={id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="av-input-grow">
            YOUR DATASET
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-describedby="input-help"
              maxLength={150}
            />
          </label>
          <button className="av-button primary" type="submit">
            Apply input
          </button>
          <button
            className="av-icon-button"
            type="button"
            aria-label="Generate seeded random dataset"
            onClick={() => {
              setSeed(seed + 1);
              load(makeDataset("random", seed));
            }}
          >
            <Shuffle size={18} />
          </button>
        </form>
        <div className="av-presets">
          <span id="input-help">2–24 integers · −999 to 999</span>
          <div>
            <span>Try a shape</span>
            {["random", "sorted", "reverse", "duplicates"].map((kind) => (
              <button key={kind} onClick={() => load(makeDataset(kind, 42))}>
                {kind}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <div className="av-error" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="av-notice" role="status">
            {notice}
          </div>
        )}
        <div className="av-lab-grid">
          <section className="av-panel av-stage">
            <div className="av-panel-heading">
              <div>
                <span className="av-live-dot" />
                <h2>{meta.name}</h2>
                <span className="av-tag">
                  {cursor === frames.length - 1
                    ? "Completed"
                    : playback.playing
                      ? "Running"
                      : cursor
                        ? "Paused"
                        : "Ready"}
                </span>
              </div>
              <button
                className={`av-button small ${compare ? "selected" : ""}`}
                onClick={() => setCompare(!compare)}
                aria-pressed={compare}
              >
                <GitCompareArrows size={16} /> Compare
              </button>
            </div>
            <div className="av-stage-caption">
              <span>
                ARRAY STATE <b>[{input.length}]</b>
              </span>
              <span>Height represents magnitude · label preserves sign</span>
            </div>
            <ArrayView frame={frame} />
            <div className="av-legend">
              <span>
                <i /> Unprocessed
              </span>
              <span>
                <i className="active" /> Active
              </span>
              <span>
                <i className="sorted" /> Sorted
              </span>
              <span>
                <i className="pivot" /> Pivot
              </span>
            </div>
            <div className="av-explanation">
              <span className="av-step-badge">
                {String(cursor).padStart(3, "0")}
              </span>
              <div>
                <small>
                  CURRENT OPERATION · {frame.codeLine?.replaceAll("_", " ")}
                </small>
                <p>{frame.msg}</p>
              </div>
            </div>
            <div className="av-transport">
              <div className="av-timeline">
                <input
                  aria-label="Execution timeline"
                  type="range"
                  min="0"
                  max={frames.length - 1}
                  value={cursor}
                  onChange={(e) => seek(Number(e.target.value))}
                />
                <span>
                  {cursor} / {frames.length - 1}
                </span>
              </div>
              <div className="av-transport-row">
                <div>
                  <button
                    className="av-icon-button"
                    onClick={() => seek(0)}
                    aria-label="Restart"
                  >
                    <SkipBack size={17} />
                  </button>
                  <button
                    className="av-icon-button"
                    disabled={!cursor}
                    onClick={() => seek(cursor - 1)}
                    aria-label="Step backward"
                  >
                    <ChevronLeft size={19} />
                  </button>
                  <button
                    className="av-button primary"
                    onClick={() => dispatch({ type: "toggle" })}
                  >
                    {playback.playing ? (
                      <Pause size={17} />
                    ) : (
                      <Play size={17} />
                    )}{" "}
                    {playback.playing
                      ? "Pause"
                      : cursor === frames.length - 1
                        ? "Replay"
                        : "Play"}
                  </button>
                  <button
                    className="av-icon-button"
                    disabled={cursor === frames.length - 1}
                    onClick={() => seek(cursor + 1)}
                    aria-label="Step forward"
                  >
                    <ChevronRight size={19} />
                  </button>
                </div>
                <label className="av-speed">
                  Speed
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  >
                    <option value={600}>0.5×</option>
                    <option value={300}>1×</option>
                    <option value={160}>2×</option>
                    <option value={50}>6×</option>
                  </select>
                </label>
              </div>
              <p className="av-shortcuts">
                <kbd>space</kbd> play / pause <kbd>←</kbd>
                <kbd>→</kbd> step through execution
              </p>
            </div>
          </section>
          <aside className="av-inspector">
            <section className="av-panel">
              <div className="av-panel-heading">
                <h2>State inspector</h2>
                <span className="av-tiny">LIVE</span>
              </div>
              <div className="av-metrics">
                <div>
                  <span>Comparisons</span>
                  <strong>{stats.comps || 0}</strong>
                </div>
                <div>
                  <span>Passes / calls¹</span>
                  <strong>{stats.passes || 0}</strong>
                </div>
                <div>
                  <span>Recorded exchanges²</span>
                  <strong>{stats.swaps || 0}</strong>
                </div>
              </div>
              <div className="av-variable-list">
                <div>
                  <span>active indices</span>
                  <code>{JSON.stringify(frame.activeIndices || [])}</code>
                </div>
                <div>
                  <span>pivot index</span>
                  <code>{frame.pivotIndex ?? "—"}</code>
                </div>
                <div>
                  <span>sorted indices</span>
                  <code>{JSON.stringify(frame.sortedIndices || [])}</code>
                </div>
              </div>
            </section>
            <section className="av-panel av-concept">
              <span className="av-eyebrow">THE MENTAL MODEL</span>
              <h3>What stays true?</h3>
              <p>{meta.invariant}</p>
              <div className="av-complexity">
                <span>
                  Worst-case time <b>{meta.time}</b>
                </span>
                <span>
                  Auxiliary space <b>{meta.space}</b>
                </span>
              </div>
              <p className="av-fine">{meta.idea}</p>
              {algo === "heap" && (
                <p className="av-fine">
                  * This implementation uses recursive heapify; its call stack
                  uses O(log n) space.
                </p>
              )}
            </section>
          </aside>
        </div>
        {compare && (
          <section className="av-panel av-comparison">
            <div className="av-panel-heading">
              <div>
                <GitCompareArrows size={18} />
                <h2>Same dataset. Different strategy.</h2>
              </div>
              <select
                aria-label="Comparison algorithm"
                value={other}
                onChange={(e) => setOther(e.target.value)}
              >
                {Object.entries(algorithms).map(([id, a]) => (
                  <option key={id} value={id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="av-comparison-grid">
              <div>
                <ArrayView frame={otherFrames[compareCursor]} compact />
                <p className="av-fine">
                  Preview aligned by percentage of trace—not equivalent
                  operations.
                </p>
              </div>
              <div className="av-compare-results">
                <span className="av-eyebrow">COMPLETE-RUN COMPARISONS</span>
                {[
                  [meta.name, last.comps],
                  [
                    algorithms[other].name,
                    otherFrames.at(-1).currentStats.comps,
                  ],
                ].map(([name, count], i) => (
                  <div key={i}>
                    <div>
                      <span>{name}</span>
                      <strong>{count}</strong>
                    </div>
                    <div className="av-meter">
                      <i
                        style={{
                          width: `${Math.max(2, (count / Math.max(1, last.comps, otherFrames.at(-1).currentStats.comps)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <p>
                  Actual comparison events from the same input. No wall-clock
                  claims: animation speed is not algorithm performance.
                </p>
              </div>
            </div>
          </section>
        )}
        <details className="av-notes">
          <summary>
            Algorithm notes & pseudocode{" "}
            <span>Read the original learning material ↓</span>
          </summary>
          <TutorialTab data={simpleSortData[algo] || sortingData[algo]} />
        </details>
        <div className="av-saved-heading">
          <h2>Saved experiments</h2>
          <span>Private to this browser · latest 6</span>
        </div>
        <div className="av-saved-list">
          {saved.length ? (
            saved.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  try {
                    const values = parseInput(item.input.join(","));
                    load(values, item.algorithm);
                    dispatch({
                      type: "seek",
                      cursor: Number.isInteger(item.cursor) ? item.cursor : 0,
                    });
                  } catch {
                    setError("This saved experiment is invalid.");
                  }
                }}
              >
                <span>
                  <Check size={15} />
                  {algorithms[item.algorithm].name}
                </span>
                <code>[{item.input.join(", ")}]</code>
                <span>Open ↗</span>
              </button>
            ))
          ) : (
            <div className="av-empty">
              An interesting input? Save it and come back to the exact frame.
            </div>
          )}
        </div>
        <p className="av-fine">
          ¹ Passes/calls are implementation-specific and should not be compared
          across algorithms. ² Legacy generators count exchanges differently;
          comparison mode deliberately uses comparisons only. Trace storage is
          bounded by the 24-element input limit.
        </p>
      </main>
    </Shell>
  );
}
