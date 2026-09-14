import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  FlaskConical,
  ChevronRight,
  Network,
  Binary,
  Workflow,
  Braces,
  Layers3,
  ListFilter,
} from "lucide-react";
import Shell from "./Shell";
import { CORE_MODULES, PATTERN_MODULES } from "../constants";
import "./modules.css";
const modules = [...CORE_MODULES, ...PATTERN_MODULES];
const descriptions = {
  "binary-search":
    "Watch the search space shrink. Follow the bounds until the answer comes into focus.",
  "n-queens":
    "Explore every choice, discover conflicts, and watch backtracking find a way forward.",
  pathfinding:
    "Build a maze. Follow the frontier. See how a search discovers its path.",
  "tree-traversal":
    "Follow the call stack and discover how visit order changes the story of a tree.",
  "two-pointers":
    "Two positions, one shared goal. Follow each comparison as the pointers converge.",
  "fast-slow":
    "Follow the read and write pointers as non-zero values move into place.",
  "bs-variants":
    "A match is just the beginning. Narrow the bounds to find the first and last occurrence.",
  "prefix-sum":
    "Build once, query efficiently. See exactly which part of a sum gets subtracted.",
  "sliding-window":
    "Expand, measure, shrink. Discover the smallest window that meets the target.",
  "merge-intervals":
    "Sort the boundaries and trace how overlapping intervals become one.",
};
const icons = {
  Graphs: Network,
  Searching: Binary,
  Recursion: Workflow,
  Trees: Workflow,
  Arrays: Braces,
  Intervals: Layers3,
};
export default function ModuleFrame({
  children,
  activeTab,
  onTabChange,
  running,
  paused,
  onMouseLeave,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const module = modules.find((item) => item.path === pathname);
  const slug = pathname.split("/").at(-1);
  const Icon = icons[module?.category] || ListFilter;
  return (
    <Shell>
      <main className="av-page av-module-page">
        <div className="av-breadcrumb">
          <Link to="/library">
            <ArrowLeft size={14} /> Algorithm library
          </Link>
          <ChevronRight size={12} />
          <span>{module?.category}</span>
          <div className="av-module-switch">
            <label htmlFor="module-picker">SWITCH EXPERIMENT</label>
            <select
              id="module-picker"
              value={pathname}
              onChange={(event) => navigate(event.target.value)}
            >
              {modules.map((item) => (
                <option key={item.id} value={item.path}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="av-module-hero">
          <div>
            <div className="av-eyebrow">
              EXPERIMENT / {module?.category?.toUpperCase()}
            </div>
            <h1>
              {module?.title}
              <span className="av-title-dot">.</span>
            </h1>
            <p>{descriptions[slug]}</p>
          </div>
          <div className="av-module-emblem" aria-hidden="true">
            <Icon size={36} strokeWidth={1.3} />
            <span>ALG / {String(module?.id || 0).padStart(2, "0")}</span>
          </div>
        </div>
        <div className="av-module-viewbar">
          <div
            className="av-segmented"
            role="group"
            aria-label="Experiment view"
          >
            <button
              onClick={() => onTabChange("visualize")}
              aria-pressed={activeTab === "visualize"}
            >
              <FlaskConical size={16} /> Visualize
            </button>
            <button
              onClick={() => onTabChange("tutorial")}
              aria-pressed={activeTab === "tutorial"}
            >
              <BookOpen size={16} /> Learn the concept
            </button>
          </div>
          <div className="av-module-state">
            <span className={`av-tag ${module?.difficulty?.toLowerCase()}`}>
              {module?.difficulty}
            </span>
            <span>
              <i className={running && !paused ? "running" : ""} />
              {activeTab === "tutorial"
                ? "Learning notes"
                : running
                  ? paused
                    ? "Paused"
                    : "Running"
                  : "Ready to explore"}
            </span>
          </div>
        </div>
        <div
          className={`av-module-content av-module-${slug}`}
          data-view={activeTab}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </div>
        <div className="av-module-bottom-note">
          <span>
            <BookOpen size={15} /> The best way to learn: change one input and
            predict what happens.
          </span>
          <Link to="/counterexample">
            Challenge an assumption <ArrowUpRight size={14} />
          </Link>
        </div>
      </main>
    </Shell>
  );
}
