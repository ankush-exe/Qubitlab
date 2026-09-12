import type { GateType } from "../types/circuit";

const gates: { type: GateType; label: string; description: string }[] = [
  { type: "H", label: "H", description: "Hadamard: create superposition" },
  { type: "X", label: "X", description: "Pauli-X: flip the qubit" },
  { type: "Y", label: "Y", description: "Pauli-Y rotation" },
  { type: "Z", label: "Z", description: "Pauli-Z phase flip" },
  { type: "S", label: "S", description: "Quarter-turn phase" },
  { type: "T", label: "T", description: "Eighth-turn phase" },
  { type: "CNOT", label: "CX", description: "Controlled-X between qubits" },
  { type: "MEASURE", label: "M", description: "Measure a qubit" },
];

type GatePaletteProps = { onDragStart: (event: React.DragEvent, type: GateType) => void };

export function GatePalette({ onDragStart }: GatePaletteProps) {
  return (
    <aside className="panel palette">
      <div className="panel-heading">
        <span className="eyebrow">01 / OPERATORS</span>
        <h2>Gate palette</h2>
      </div>
      <p className="muted">Drag an operator onto a circuit moment.</p>
      <div className="gate-list">
        {gates.map((gate) => (
          <button
            className={`gate-token gate-${gate.type.toLowerCase()}`}
            draggable
            key={gate.type}
            onDragStart={(event) => onDragStart(event, gate.type)}
            title={gate.description}
            type="button"
          >
            <strong>{gate.label}</strong>
            <span>{gate.type === "CNOT" ? "controlled" : gate.description.split(":")[0]}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
