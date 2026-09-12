import type * as Blockly from "blockly";
import type { CircuitModel, GateOperation, GateType } from "../types/circuit";

export type ProgramParseResult = { circuit: CircuitModel; error: null } | { circuit: null; error: string };

export function workspaceToCircuit(workspace: Blockly.WorkspaceSvg): ProgramParseResult {
  const roots = workspace.getTopBlocks(true);
  if (roots.length !== 1) return { circuit: null, error: "Connect one program starting with Start quantum program." };
  let block: Blockly.Block | null = roots[0];
  let started = false;
  let qubits = 2;
  const gates: GateOperation[] = [];
  let moment = 0;
  while (block) {
    if (block.type === "qlearn_start") started = true;
    else if (block.type === "qlearn_qubits") {
      if (!started) return { circuit: null, error: "Add Start quantum program before choosing qubits." };
      qubits = Number(block.getFieldValue("QUBITS"));
    } else {
      if (!started) return { circuit: null, error: "Start your program before adding gates." };
      const operation = operationFromBlock(block, moment++);
      if (!operation) return { circuit: null, error: `Unsupported block: ${block.type}` };
      const indices = [...operation.targets, ...(operation.controls ?? [])];
      if (indices.some((index) => index >= qubits)) return { circuit: null, error: `This block uses a qubit outside q0-q${qubits - 1}.` };
      if (operation.type === "CNOT" && operation.controls?.[0] === operation.targets[0]) return { circuit: null, error: "CNOT control and target must be different." };
      gates.push(operation);
    }
    block = block.getNextBlock();
  }
  if (!started) return { circuit: null, error: "Start with Start quantum program." };
  return { circuit: { qubits, classical_bits: qubits, gates }, error: null };
}

function operationFromBlock(block: Blockly.Block, moment: number): GateOperation | null {
  const type = block.type.replace("qlearn_", "").toUpperCase() as GateType;
  if (["H", "X", "Y", "Z", "S", "T"].includes(type)) return { id: `visual-${type}-${moment}`, type, targets: [Number(block.getFieldValue("TARGET"))], moment };
  if (type === "CNOT") return { id: `visual-cnot-${moment}`, type, controls: [Number(block.getFieldValue("CONTROL"))], targets: [Number(block.getFieldValue("TARGET"))], moment };
  if (type === "MEASURE") return { id: `visual-measure-${moment}`, type, targets: [0], moment };
  return null;
}

export function circuitToPython(circuit: CircuitModel): string {
  const lines = [`from qiskit import QuantumCircuit`, ``, `qc = QuantumCircuit(${circuit.qubits})`, ``];
  for (const gate of circuit.gates) {
    if (gate.type === "CNOT") lines.push(`qc.cx(${gate.controls?.[0]}, ${gate.targets[0]})`);
    else if (gate.type === "MEASURE") lines.push("qc.measure_all()\n");
    else lines.push(`qc.${gate.type.toLowerCase()}(${gate.targets[0]})`);
  }
  if (!circuit.gates.some((gate) => gate.type === "MEASURE")) lines.push("qc.measure_all()");
  return lines.join("\n");
}
