import { Link, useParams } from "react-router-dom";
import gates from "../../../docs/gates-reference.md?raw";
import superposition from "../../../docs/superposition.md?raw";
import entanglement from "../../../docs/entanglement.md?raw";
import blochSphere from "../../../docs/bloch-sphere.md?raw";
import patterns from "../../../docs/circuit-patterns.md?raw";

const docs = [
  { slug: "gates-reference", title: "Quantum gate reference", eyebrow: "REFERENCE", body: gates },
  { slug: "superposition", title: "Superposition explained", eyebrow: "CONCEPT", body: superposition },
  { slug: "entanglement", title: "Entanglement explained", eyebrow: "CONCEPT", body: entanglement },
  { slug: "bloch-sphere", title: "Reading a Bloch sphere", eyebrow: "VISUAL GUIDE", body: blochSphere },
  { slug: "circuit-patterns", title: "Common circuit patterns", eyebrow: "CHEATSHEET", body: patterns },
];

function renderMarkdown(markdown: string) {
  return markdown.split("\n\n").map((block, index) => {
    if (block.startsWith("# ")) return <h1 key={index}>{block.slice(2)}</h1>;
    if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
    return <p key={index}>{block.replace(/\$([^$]+)\$/g, "$1")}</p>;
  });
}

export default function DocsPage() {
  const { slug } = useParams();
  const active = docs.find((doc) => doc.slug === slug) ?? docs[0];
  return <div className="docs-page"><section className="docs-heading"><div><span className="eyebrow">THE KNOWLEDGE BASE</span><h1>Understand the<br /><em>moving parts.</em></h1><p>Clear reference material for the ideas you meet in the lab.</p></div><span className="docs-count">05<br /><small>reference notes</small></span></section><div className="docs-layout"><aside className="docs-sidebar"><span className="eyebrow">ON THIS PAGE</span>{docs.map((doc) => <Link className={doc.slug === active.slug ? "active" : ""} key={doc.slug} to={`/docs/${doc.slug}`}><small>{doc.eyebrow}</small>{doc.title}</Link>)}</aside><article className="doc-article"><span className="eyebrow">{active.eyebrow}</span>{renderMarkdown(active.body)}<div className="doc-footer"><Link to="/courses/fundamentals/learn?tab=lesson">Apply this in a lesson ↗</Link><Link to="/courses/fundamentals/learn?tab=lab">Open the Lab ↗</Link></div></article></div></div>;
}
