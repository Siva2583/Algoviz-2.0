import { useId } from "react";
import {
  BookOpen,
  ArrowDownRight,
  Code2,
  Lightbulb,
  AlertTriangle,
  Timer,
  Database,
} from "lucide-react";
import "../../../lab/lesson.css";

function LessonSection({ id, number, title, children }) {
  return (
    <section id={id} className="av-lesson-section">
      <div className="av-lesson-section-title">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
export default function TutorialTab({ data }) {
  const prefix = useId().replaceAll(":", "");
  if (!data) return null;
  const anchor = (name) => `${prefix}-${name}`;
  const links = [
    ["overview", "Overview"],
    ["how", "How it works"],
    ["example", "Walk through an example"],
    ["code", "Pseudocode"],
    ["complexity", "Time & space"],
    ...(data.pattern ? [["patterns", "When to use it"]] : []),
    ...(data.mistakes ? [["mistakes", "Common mistakes"]] : []),
  ];
  return (
    <div className="av-lesson">
      <aside className="av-lesson-nav">
        <div className="av-eyebrow">
          <BookOpen size={14} /> FIELD NOTES
        </div>
        <h3>{data.title}</h3>
        <p>
          Build the mental model.
          <br />
          Then test it in the visualizer.
        </p>
        <nav aria-label="Lesson contents">
          {links.map(([id, label], i) => (
            <a href={`#${anchor(id)}`} key={id}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {label}
              <ArrowDownRight size={13} />
            </a>
          ))}
        </nav>
        <div className="av-lesson-tip">
          <Lightbulb size={18} />
          <p>Before you run it, try to predict the next operation.</p>
        </div>
      </aside>
      <div className="av-lesson-body">
        <LessonSection
          id={anchor("overview")}
          number="01"
          title="The big picture"
        >
          <p className="av-lesson-lead">{data.overview}</p>
          {data.whyExists && (
            <div className="av-lesson-callout">
              <Lightbulb size={19} />
              <div>
                <h3>Why this approach?</h3>
                <p>{data.whyExists}</p>
              </div>
            </div>
          )}
        </LessonSection>
        <LessonSection id={anchor("how")} number="02" title="How it works">
          <ol className="av-lesson-steps">
            {data.mechanics?.map((step, i) => (
              <li key={i}>
                <span>{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </LessonSection>
        <LessonSection
          id={anchor("example")}
          number="03"
          title="Walk through an example"
        >
          <div className="av-lesson-trace">
            {data.dryRun?.map((run, i) => (
              <div key={i}>
                <span className="av-lesson-trace-dot" />
                <div>
                  <small>STEP {String(i + 1).padStart(2, "0")}</small>
                  <h3>{run.step}</h3>
                  <code>{run.state}</code>
                </div>
              </div>
            ))}
          </div>
        </LessonSection>
        <LessonSection
          id={anchor("code")}
          number="04"
          title="The logic, without the noise"
        >
          <div className="av-lesson-code">
            <div>
              <span>
                <Code2 size={16} /> Pseudocode
              </span>
              <span>READ · TRACE · UNDERSTAND</span>
            </div>
            <pre>
              <code>{data.pseudo}</code>
            </pre>
          </div>
        </LessonSection>
        <LessonSection
          id={anchor("complexity")}
          number="05"
          title="Time & space"
        >
          <div className="av-lesson-metrics">
            <div>
              <Timer size={19} />
              <span>TIME COMPLEXITY</span>
              <strong>{data.time}</strong>
            </div>
            <div>
              <Database size={19} />
              <span>AUXILIARY SPACE</span>
              <strong>{data.space}</strong>
            </div>
          </div>
          {data.memory && <p className="av-lesson-memory">{data.memory}</p>}
        </LessonSection>
        {data.pattern && (
          <LessonSection
            id={anchor("patterns")}
            number="06"
            title="Recognize the pattern"
          >
            <ul className="av-lesson-checklist">
              {data.pattern.map((item, i) => (
                <li key={i}>
                  <span>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            {data.apps && (
              <>
                <h3 className="av-lesson-subheading">Where it shows up</h3>
                <div className="av-lesson-apps">
                  {data.apps.map((app, i) => (
                    <div key={i}>{app}</div>
                  ))}
                </div>
              </>
            )}
          </LessonSection>
        )}
        {!data.pattern && data.apps && (
          <LessonSection
            id={anchor("applications")}
            number="06"
            title="Where it shows up"
          >
            <div className="av-lesson-apps">
              {data.apps.map((app, i) => (
                <div key={i}>{app}</div>
              ))}
            </div>
          </LessonSection>
        )}
        {data.mistakes && (
          <LessonSection
            id={anchor("mistakes")}
            number="07"
            title="Watch out for these"
          >
            <div className="av-lesson-warnings">
              {data.mistakes.map((item, i) => (
                <div key={i}>
                  <AlertTriangle size={16} />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </LessonSection>
        )}
      </div>
    </div>
  );
}
