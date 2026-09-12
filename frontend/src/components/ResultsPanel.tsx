import type { SimulationResult } from "../types/circuit";

type ResultsPanelProps = { result: SimulationResult | null; isRunning: boolean; error: string | null };

export function ResultsPanel({ result, isRunning, error }: ResultsPanelProps) {
  return (
    <section className="panel results-panel">
      <div className="panel-heading"><span className="eyebrow">04 / MEASUREMENT</span><h2>Simulation results</h2></div>
      {isRunning && <div className="empty-state"><span className="loader" /> Running on Qiskit Aer...</div>}
      {!isRunning && error && <div className="error-state">{error}</div>}
      {!isRunning && !error && !result && <div className="empty-state">Press <strong>Run circuit</strong> to measure your program.</div>}
      {result && !isRunning && <>
        <div className="result-summary"><span><strong>{result.shots.toLocaleString()}</strong> shots</span><span><strong>{result.probabilities.length}</strong> observed states</span></div>
        <div className="probability-list">{result.probabilities.map((item) => <div className="probability-row" key={item.state}><span>|{item.state}&gt;</span><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(item.probability * 100, 2)}%` }} /></div><strong>{(item.probability * 100).toFixed(1)}%</strong></div>)}</div>
        <details><summary>OpenQASM and circuit diagram</summary><pre>{result.qasm}\n\n{result.diagram}</pre></details>
      </>}
    </section>
  );
}
