import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import { generateVisualCode, simulateVisualProgram } from "../services/api";
import type { CircuitModel, FrameworkTarget, VisualSimulationResult } from "../types/circuit";
import { ResultsPanel } from "./ResultsPanel";
import { registerQuantumBlocks, starterWorkspace, toolbox } from "../visualCoding/blocks";
import { workspaceToCircuit } from "../visualCoding/program";

const labels: Record<FrameworkTarget, string> = { qiskit: "Qiskit", qiskit_aer: "Qiskit Aer", pennylane: "PennyLane", cirq: "Cirq", qbraid: "qBraid" };

type Props = { onShowCircuit: (circuit: CircuitModel) => void };

export function VisualCoding({ onShowCircuit }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const [parsed, setParsed] = useState<{ circuit: CircuitModel | null; error: string | null }>({ circuit: null, error: null });
  const [target, setTarget] = useState<FrameworkTarget>("qiskit_aer");
  const [code, setCode] = useState("# Connect a Create Circuit block to start generating code.");
  const [result, setResult] = useState<VisualSimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!host.current) return;
    registerQuantumBlocks();
    const nextWorkspace = Blockly.inject(host.current, { toolbox, trashcan: true, scrollbars: true, renderer: "zelos", theme: Blockly.Themes.Zelos });
    workspace.current = nextWorkspace;
    Blockly.serialization.workspaces.load(starterWorkspace, nextWorkspace);
    const sync = () => {
      const next = workspaceToCircuit(nextWorkspace);
      setParsed(next.circuit ? { circuit: next.circuit, error: null } : { circuit: null, error: next.error });
      setResult(null);
      setError(null);
    };
    nextWorkspace.addChangeListener(sync);
    sync();
    const resize = () => Blockly.svgResize(nextWorkspace);
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); nextWorkspace.dispose(); workspace.current = null; };
  }, []);

  useEffect(() => {
    if (!parsed.circuit) { setCode("# Connect a valid Create Circuit program to preview framework code."); return; }
    let alive = true;
    generateVisualCode(parsed.circuit, target).then((response) => { if (alive) setCode(response.code); }).catch((caught) => { if (alive) setCode(`# Code generation error\n# ${caught instanceof Error ? caught.message : "Unknown error"}`); });
    return () => { alive = false; };
  }, [parsed.circuit, target]);

  const run = async () => {
    if (!parsed.circuit) { setError(parsed.error ?? "Create a valid program before running it."); return; }
    setIsRunning(true); setError(null);
    try {
      const nextResult = await simulateVisualProgram({ circuit: parsed.circuit, target });
      setResult(nextResult); setCode(nextResult.code);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to run the visual program."); }
    finally { setIsRunning(false); }
  };

  const reset = () => {
    if (!workspace.current) return;
    workspace.current.clear();
    Blockly.serialization.workspaces.load(starterWorkspace, workspace.current);
  };

  const copy = async () => { await navigator.clipboard.writeText(code); };
  const download = () => {
    const file = new Blob([code], { type: "text/x-python;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(file); link.download = `qubitlab-${target}.py`; link.click(); URL.revokeObjectURL(link.href);
  };

  return <main className="workspace visual-workspace" id="visual-coding">
    <section className="hero visual-hero"><div><span className="eyebrow">VISUAL CODING / BLOCKLY</span><h1>Build quantum ideas<br />one <em>block</em> at a time.</h1><p>Snap together a beginner-friendly quantum program. QubitLab converts it into one shared circuit model, then real framework adapters generate and execute it.</p></div><div className="hero-readout"><span>UNIFIED PROGRAM</span><strong>{parsed.circuit?.qubits ?? "–"} qubits <small>/</small> {parsed.circuit?.gates.length ?? 0} operations</strong><div className="readout-line" /></div></section>
    <section className="visual-toolbar">
      <div className="target-picker"><label htmlFor="target">TARGET FRAMEWORK</label><select id="target" value={target} onChange={(event) => setTarget(event.target.value as FrameworkTarget)}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
      <div className="action-buttons"><button className="button secondary" onClick={reset} type="button">Reset</button><button className="button secondary" disabled={!parsed.circuit} onClick={() => parsed.circuit && onShowCircuit(parsed.circuit)} type="button">Show Circuit</button><button className="button primary" disabled={isRunning} onClick={run} type="button"><span>{isRunning ? "Running..." : "Run program"}</span><b>↗</b></button></div>
    </section>
    <section className="visual-grid">
      <div className="panel block-panel"><div className="panel-heading"><span className="eyebrow">BLOCK TOOLBOX</span><h2>Quantum building blocks</h2></div><p className="muted">Drag blocks into the workspace and snap them into one vertical program. Only quantum operations are included—no classical programming required.</p><div className="toolbox-guide"><span>01</span> Start with <b>Create Circuit</b><span>02</span> Choose your qubits <span>03</span> Add gates and measure</div></div>
      <div className="panel block-workspace"><div className="panel-heading"><span className="eyebrow">BLOCK WORKSPACE</span><h2>Visual quantum program</h2></div><div className="blockly-host" ref={host} /></div>
      <div className="panel code-panel"><div className="code-heading"><div><span className="eyebrow">GENERATED CODE</span><h2><span className="framework-badge">{labels[target]}</span></h2></div><div className="code-actions"><button className="mini-button" onClick={() => void copy()} type="button">Copy</button><button className="mini-button" onClick={download} type="button">Download</button></div></div><pre className="generated-code"><code>{code}</code></pre></div>
    </section>
    {parsed.error && <div className="visual-validation">{parsed.error}</div>}
    <section className="visual-results"><ResultsPanel error={error} isRunning={isRunning} result={result} /></section>
  </main>;
}
