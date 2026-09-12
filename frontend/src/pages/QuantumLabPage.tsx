import { useState } from "react";
import { BlochSphere } from "../components/BlochSphere";
import { CircuitEditor } from "../components/CircuitEditor";
import { GatePalette } from "../components/GatePalette";
import { MentorPanel } from "../components/MentorPanel";
import { ResultsPanel } from "../components/ResultsPanel";
import { VisualCoding } from "../components/VisualCoding";
import { askMentor, simulateCircuit } from "../services/api";
import type { CircuitModel, GateType, SimulationResult } from "../types/circuit";

const MOMENTS = 6;
const initialCircuit: CircuitModel = { qubits: 2, gates: [] };

export default function QuantumLabPage({ initialCircuit: startingCircuit = initialCircuit }: { initialCircuit?: CircuitModel }) {
  const [circuit, setCircuit] = useState(startingCircuit);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentorNotes, setMentorNotes] = useState<string[]>([]);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorError, setMentorError] = useState<string | null>(null);
  const [mode, setMode] = useState<"designer" | "blocks">("designer");

  const addGate = (type: GateType, qubit: number, moment: number) => {
    const operation = type === "CNOT"
      ? { id: crypto.randomUUID(), type, controls: [Math.max(0, qubit - 1)], targets: [qubit], moment }
      : { id: crypto.randomUUID(), type, targets: [qubit], moment };
    setCircuit((current) => ({ ...current, gates: [...current.gates.filter((gate) => gate.moment !== moment || !gate.targets.includes(qubit)), operation] }));
    setResult(null);
  };

  const runCircuit = async () => {
    setIsRunning(true); setError(null);
    try {
      setResult(await simulateCircuit(circuit));
      setMentorLoading(true); setMentorError(null);
      try { setMentorNotes((await askMentor(circuit)).notes); } catch (caught) { setMentorError(caught instanceof Error ? caught.message : "Unable to reach the Circuit Doctor"); } finally { setMentorLoading(false); }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to reach the quantum simulator"); } finally { setIsRunning(false); }
  };

  const clearCircuit = () => { setCircuit(startingCircuit); setResult(null); setError(null); setMentorNotes([]); setMentorError(null); };
  const hasHadamard = circuit.gates.some((gate) => gate.type === "H" && gate.targets.includes(0));
  const hasX = circuit.gates.some((gate) => gate.type === "X" && gate.targets.includes(0));

  return <div className="lab-workspace">
    <section className="page-intro lab-intro"><div><span className="eyebrow">QUANTUM LAB / PLAYGROUND</span><h1>Think in <em>states.</em><br />Build in moments.</h1><p>Compose a quantum circuit visually, then send the exact program to Qiskit Aer for measurement.</p></div><div className="hero-readout"><span>ACTIVE CIRCUIT</span><strong>{circuit.qubits} qubits <small>/</small> {circuit.gates.length} gates</strong><div className="readout-line" /></div></section>
    <div className="lab-mode-switch"><button className={mode === "designer" ? "active" : ""} onClick={() => setMode("designer")} type="button">Circuit designer</button><button className={mode === "blocks" ? "active" : ""} onClick={() => setMode("blocks")} type="button">Visual coding</button></div>
    {mode === "blocks" ? <VisualCoding onShowCircuit={(nextCircuit) => { setCircuit(nextCircuit); setMode("designer"); setResult(null); setMentorNotes([]); }} /> : <><div className="actionbar"><div className="qubit-control"><label htmlFor="qubits">QUBITS</label><select id="qubits" value={circuit.qubits} onChange={(event) => { setCircuit({ qubits: Number(event.target.value), gates: [] }); setResult(null); }}><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option></select></div><div className="action-buttons"><button className="button secondary" onClick={clearCircuit} type="button">Clear board</button><button className="button primary" disabled={isRunning} onClick={runCircuit} type="button"><span>{isRunning ? "Running..." : "Run circuit"}</span><b>↗</b></button></div></div><div className="lab-grid"><GatePalette onDragStart={(event, type) => event.dataTransfer.setData("gate-type", type)} /><div className="main-column"><CircuitEditor circuit={circuit} moments={MOMENTS} onDropGate={addGate} onRemoveGate={(id) => setCircuit((current) => ({ ...current, gates: current.gates.filter((gate) => gate.id !== id) }))} /><div className="lower-grid"><BlochSphere circuitHasHadamard={hasHadamard} circuitHasX={hasX} /><ResultsPanel error={error} isRunning={isRunning} result={result} /></div><MentorPanel circuit={circuit} error={mentorError} isLoading={mentorLoading} notes={mentorNotes} onError={setMentorError} onLoading={setMentorLoading} onNotes={setMentorNotes} /></div></div></>}
  </div>;
}
