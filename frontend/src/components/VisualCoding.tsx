import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import type { CircuitModel } from "../types/circuit";
import { registerBlocks, starterWorkspace, toolbox } from "../visualCoding/blocks";
import { circuitToPython, workspaceToCircuit } from "../visualCoding/program";

type Props = { onShowCircuit: (circuit: CircuitModel) => void };

export function VisualCoding({ onShowCircuit }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const [code, setCode] = useState("Connect blocks to generate Qiskit code.");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!host.current) return;
    registerBlocks();
    const nextWorkspace = Blockly.inject(host.current, { toolbox, trashcan: true, scrollbars: true, renderer: "zelos" });
    workspace.current = nextWorkspace;
    Blockly.serialization.workspaces.load(starterWorkspace, nextWorkspace);
    const sync = () => {
      const parsed = workspaceToCircuit(nextWorkspace);
      if (parsed.circuit) { setCode(circuitToPython(parsed.circuit)); setError(null); } else setError(parsed.error);
    };
    nextWorkspace.addChangeListener(sync);
    sync();
    const resize = () => Blockly.svgResize(nextWorkspace);
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); nextWorkspace.dispose(); workspace.current = null; };
  }, []);

  const showCircuit = () => {
    if (!workspace.current) return;
    const parsed = workspaceToCircuit(workspace.current);
    if (parsed.circuit) { onShowCircuit(parsed.circuit); setError(null); } else setError(parsed.error);
  };

  return <section className="visual-coding-panel"><div className="visual-coding-heading"><div><span className="eyebrow">VISUAL CODING / BLOCKS</span><h2>Build a program one block at a time.</h2><p>Snap together a quantum program, then send the same circuit to the visual editor.</p></div><button className="button primary" onClick={showCircuit} type="button">Show in circuit editor ↗</button></div><div className="visual-coding-grid"><div className="blockly-host" ref={host} /><pre className="visual-code"><code>{code}</code></pre></div>{error && <div className="visual-error">{error}</div>}</section>;
}
