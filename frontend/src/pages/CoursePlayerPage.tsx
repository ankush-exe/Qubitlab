import { Link, useParams, useSearchParams } from "react-router-dom";
import GlobalChat from "../components/GlobalChat";
import QuantumLabPage from "./QuantumLabPage";
import { courses } from "../data/learning";
import type { CircuitModel } from "../types/circuit";

const starterCircuit: CircuitModel = { qubits: 2, gates: [{ id: "starter-h", type: "H", targets: [0], moment: 0 }, { id: "starter-cx", type: "CNOT", controls: [0], targets: [1], moment: 1 }] };

export default function CoursePlayerPage() {
  const { courseId = "fundamentals" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const course = courses.find((item) => item.id === courseId) ?? courses[0];
  const tab = searchParams.get("tab") ?? "overview";
  const lesson = Number(searchParams.get("lesson") ?? "2");
  const currentLesson = course.modules[Math.min(Math.max(lesson - 1, 0), course.modules.length - 1)];
  const setTab = (nextTab: string) => setSearchParams({ tab: nextTab, lesson: String(lesson) });

  return <div className="course-player"><div className="player-top"><div><Link className="back-link" to={`/courses/${course.id}`}>← {course.title}</Link><span className="player-kicker"> / COURSE PLAYER</span></div><span className="player-progress">{course.progress}% complete</span></div><div className="player-tabs">{["overview", "lesson", "lab", "resources"].map((item) => <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)} type="button">{item[0].toUpperCase() + item.slice(1)}</button>)}</div><div className="player-body"><aside className="curriculum-tree"><span className="eyebrow">CURRICULUM</span><h2>{course.title}</h2><div className="tree-section"><small>SECTION 01 · ORIENTATION</small><button className={tab === "overview" ? "done current" : "done"} onClick={() => setTab("overview")} type="button"><b>✓</b> Why quantum?</button></div><div className="tree-section"><small>SECTION 02 · THE CORE IDEA</small>{course.modules.slice(1).map((module, index) => <button className={currentLesson === module && tab === "lesson" ? "current" : ""} key={module} onClick={() => { setSearchParams({ tab: "lesson", lesson: String(index + 2) }); }} type="button"><b>{index === 0 ? "●" : `0${index + 2}`}</b> {module}<i>{index === 0 ? "now" : ""}</i></button>)}</div><div className="tree-section"><small>SECTION 03 · PRACTICE</small><button onClick={() => setTab("lab")} type="button"><b>⌁</b> Build a Bell state</button><button onClick={() => setTab("resources")} type="button"><b>○</b> Quick check</button></div></aside><main className="player-main">{tab === "lab" ? <QuantumLabPage initialCircuit={starterCircuit} /> : tab === "resources" ? <ResourcesTab /> : tab === "lesson" ? <LessonTab lesson={currentLesson} course={course.title} /> : <OverviewTab course={course.title} onStart={() => setTab("lesson")} />}</main></div><GlobalChat circuit={tab === "lab" ? starterCircuit : null} /></div>;
}

function OverviewTab({ course, onStart }: { course: string; onStart: () => void }) { return <section className="player-overview"><span className="eyebrow">WELCOME BACK / MODULE 02</span><h1>{course}<br /><em>continues here.</em></h1><p className="player-lead">The best way to learn quantum computing is to move between the idea and the experiment until they become the same thing.</p><div className="overview-callout"><span>02</span><div><small>NEXT LESSON</small><h2>Qubits and states</h2><p>18 min · interactive reading</p></div><button className="button primary" onClick={onStart} type="button">Start lesson <b>↗</b></button></div></section>; }

function LessonTab({ lesson, course }: { lesson: string; course: string }) { return <section className="player-lesson"><span className="eyebrow">{course.toUpperCase()} / LESSON 02</span><h1>{lesson}<br /><em>is a new lens.</em></h1><p className="player-lead">A classical bit is either 0 or 1. A qubit can be in a combination of both, until you ask it a question.</p><div className="lesson-reading"><div className="reading-sphere"><span>ψ</span></div><div><span className="eyebrow">STATE INTUITION</span><h2>Think of a direction.</h2><p>Every pure state of one qubit can be represented as a point on a sphere. The poles are familiar. Everything between them is where quantum computing gets interesting.</p></div></div><h2>Superposition, made visible</h2><p>A measurement samples one outcome, with probabilities given by the squared magnitudes of the amplitudes. Take this idea into the Lab and compare the measured counts with your prediction.</p></section>; }

function ResourcesTab() { return <section className="player-resources"><span className="eyebrow">COURSE RESOURCES</span><h1>Useful things<br /><em>to keep nearby.</em></h1><div className="resource-list"><Link to="/docs/gates-reference">Quantum gate reference <b>↗</b></Link><Link to="/docs/bloch-sphere">Reading a Bloch sphere <b>↗</b></Link><Link to="/docs/circuit-patterns">Common circuit patterns <b>↗</b></Link></div></section>; }
