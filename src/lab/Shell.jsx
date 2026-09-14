import { useEffect } from "react";
import { CORE_MODULES, PATTERN_MODULES } from "../constants";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Blocks,
  FlaskConical,
  ArrowUpRight,
  Github,
  Bug,
  Library,
  Command,
} from "lucide-react";
import "./lab.css";
export default function Shell({ children }) {
  const { pathname } = useLocation();
  const module = [...CORE_MODULES, ...PATTERN_MODULES].find(
    (item) => item.path === pathname,
  );
  const sorting =
    pathname === "/lab" ||
    pathname.endsWith("simple-sort") ||
    pathname.endsWith("advanced-sort");
  const inLibrary =
    pathname === "/library" || (pathname.startsWith("/modules/") && !sorting);
  const pageName =
    module?.title ||
    {
      "/": "Overview",
      "/lab": "Sorting laboratory",
      "/library": "Algorithm library",
      "/counterexample": "Counterexample lab",
    }[pathname] ||
    "Workspace";
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="av-app">
      <aside className="av-sidebar">
        <Link to="/" className="av-brand">
          <span className="av-mark">
            <Blocks size={23} />
          </span>
          AlgoViz<span className="av-version">LAB</span>
        </Link>
        <div className="av-nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            <Command size={18} /> Overview
          </NavLink>
          <NavLink
            to="/lab"
            className={sorting ? "active" : ""}
            aria-current={sorting ? "page" : undefined}
          >
            <FlaskConical size={18} /> Sorting laboratory{" "}
            <span className="av-dot" />
          </NavLink>
          <NavLink to="/counterexample">
            <Bug size={18} /> Counterexample lab
          </NavLink>
          <NavLink
            to="/library"
            className={inLibrary ? "active" : ""}
            aria-current={inLibrary ? "page" : undefined}
          >
            <Library size={18} /> Algorithm library
          </NavLink>
        </nav>
        <div className="av-sidebar-note">
          <div className="av-small">
            LESS WATCHING.
            <br />
            MORE UNDERSTANDING.
          </div>
          <p>
            Change the input.
            <br />
            Question the outcome.
            <br />
            See what happens.
          </p>
          <Link to="/counterexample">
            Break an assumption <ArrowUpRight size={15} />
          </Link>
        </div>
        <a
          className="av-github"
          href="https://github.com/Siva2583/Algoviz"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={17} /> Source code <ArrowUpRight size={15} />
        </a>
      </aside>
      <div className="av-main">
        <header className="av-topbar">
          <span>
            THE ALGORITHM WORKSPACE <span className="av-top-sep">/</span>{" "}
            <b>{pageName}</b>
          </span>
          <span className="av-local">
            <i /> Local-first · no account needed
          </span>
        </header>
        {children}
        <footer className="av-footer">
          <span>
            AlgoViz <span className="av-muted">/ Built by Siva Charan</span>
          </span>
          <span>React · JavaScript · Algorithms, made visible.</span>
        </footer>
      </div>
    </div>
  );
}
