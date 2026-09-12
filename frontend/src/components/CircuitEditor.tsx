import type { CircuitModel, GateOperation, GateType } from "../types/circuit";

type CircuitEditorProps = {
  circuit: CircuitModel;
  moments: number;
  onDropGate: (type: GateType, qubit: number, moment: number) => void;
  onRemoveGate: (id: string) => void;
};

export function CircuitEditor({ circuit, moments, onDropGate, onRemoveGate }: CircuitEditorProps) {
  const gateAt = (qubit: number, moment: number) =>
    circuit.gates.find(
      (gate) => gate.moment === moment && (gate.targets.includes(qubit) || gate.controls?.includes(qubit)),
    );

  return (
    <section className="panel circuit-panel">
      <div className="panel-heading circuit-heading">
        <div>
          <span className="eyebrow">02 / CIRCUIT BOARD</span>
          <h2>Visual program</h2>
        </div>
        <span className="status-pill"><i /> editable</span>
      </div>
      <div className="circuit-scroll">
        <div className="circuit-grid" style={{ gridTemplateColumns: `104px repeat(${moments}, minmax(72px, 1fr))` }}>
          <div className="corner-label">wire</div>
          {Array.from({ length: moments }, (_, moment) => <div className="moment-label" key={moment}>M{moment}</div>)}
          {Array.from({ length: circuit.qubits }, (_, qubit) => (
            <div className="wire-row" key={qubit}>
              <div className="wire-label"><span>q{qubit}</span><small>|0&gt;</small></div>
              {Array.from({ length: moments }, (_, moment) => {
                const gate = gateAt(qubit, moment);
                return (
                  <div
                    className={`drop-cell ${gate ? "occupied" : ""}`}
                    key={`${qubit}-${moment}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const type = event.dataTransfer.getData("gate-type") as GateType;
                      if (type) onDropGate(type, qubit, moment);
                    }}
                  >
                    <span className="wire-line" />
                    {gate && <GateChip gate={gate} qubit={qubit} onRemove={onRemoveGate} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="circuit-footnote"><span className="signal-dot" /> Drop a gate on any wire. CNOT uses the selected wire as target and the row above as control.</div>
    </section>
  );
}

function GateChip({ gate, qubit, onRemove }: { gate: GateOperation; qubit: number; onRemove: (id: string) => void }) {
  const isControl = gate.controls?.includes(qubit);
  if (isControl && gate.type === "CNOT") return <span className="control-dot" title="CNOT control" />;
  return (
    <button className={`placed-gate placed-${gate.type.toLowerCase()}`} onClick={() => onRemove(gate.id)} title="Remove gate" type="button">
      {gate.type === "CNOT" ? "X" : gate.type === "MEASURE" ? "M" : gate.type}
    </button>
  );
}
