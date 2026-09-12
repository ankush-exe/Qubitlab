import type * as Blockly from "blockly";
import type { CircuitModel, GateOperation, GateType } from "../types/circuit";

const angles: Record<string, number> = { zero: 0, pi: Math.PI, half_pi: Math.PI / 2, quarter_pi: Math.PI / 4 };

export type ProgramParseResult = { circuit: CircuitModel; error: null } | { circuit: null; error: string };

function failure(error: string): ProgramParseResult { return { circuit: null, error }; }

function qubit(block: Blockly.Block, field: string): number {
  return Number(block.getFieldValue(field));
}

function angle(block: Blockly.Block): number {
  const selected = block.getFieldValue("ANGLE");
  return selected === "custom" ? Number(block.getFieldValue("CUSTOM_ANGLE")) : angles[selected];
}

/** Converts Blockly's connected statement stack into QubitLab's existing circuit contract. */
export function workspaceToCircuit(workspace: Blockly.WorkspaceSvg): ProgramParseResult {
  const roots = workspace.getTopBlocks(true).filter((block) => block.type !== "quantum_run");
  if (roots.length === 0) return failure("Start by connecting a Create Circuit block.");
  if (roots.length > 1) return failure("Connect your quantum blocks into one program before running it.");

  let block: Blockly.Block | null = roots[0];
  let foundCircuit = false;
  let qubits = 2;
  const gates: GateOperation[] = [];
  let moment = 0;

  while (block) {
    if (block.type === "quantum_create_circuit") {
      if (foundCircuit) return failure("A visual program needs only one Create Circuit block.");
      foundCircuit = true;
    } else if (block.type === "quantum_create_qubits") {
      if (!foundCircuit) return failure("Put Create Circuit before Create Qubits.");
      qubits = Number(block.getFieldValue("QUBITS"));
    } else if (block.type !== "quantum_run") {
      if (!foundCircuit) return failure("Put Create Circuit at the top of your program.");
      const type = gateType(block.type);
      if (!type) return failure(`Unsupported block: ${block.type}`);
      const operation = toOperation(block, type, moment++);
      if (operation.type === "CNOT" && operation.controls?.[0] === operation.targets[0]) return failure(`CNOT control q${operation.controls[0]} and target q${operation.targets[0]} must be different qubits.`);
      if (["CZ", "SWAP"].includes(operation.type) && operation.targets[0] === operation.targets[1]) return failure(`${operation.type} needs two different qubits.`);
      if (["RX", "RY", "RZ"].includes(operation.type) && !Number.isFinite(operation.parameter)) return failure("Choose a valid rotation angle.");
      const indices = [...operation.targets, ...(operation.controls ?? [])];
      if (indices.some((index) => index < 0 || index >= qubits)) return failure(`Choose qubits between q0 and q${qubits - 1}.`);
      gates.push(operation);
    }
    block = block.getNextBlock();
  }
  if (!foundCircuit) return failure("Start with a Create Circuit block.");
  return { circuit: { qubits, classical_bits: qubits, gates }, error: null };
}

function gateType(blockType: string): GateType | null {
  const map: Record<string, GateType> = {
    quantum_h: "H", quantum_x: "X", quantum_y: "Y", quantum_z: "Z", quantum_s: "S", quantum_t: "T",
    quantum_rx: "RX", quantum_ry: "RY", quantum_rz: "RZ", quantum_cnot: "CNOT", quantum_cz: "CZ",
    quantum_swap: "SWAP", quantum_measure: "MEASURE", quantum_measure_all: "MEASURE_ALL",
  };
  return map[blockType] ?? null;
}

function toOperation(block: Blockly.Block, type: GateType, moment: number): GateOperation {
  const id = `visual-${type.toLowerCase()}-${moment}`;
  if (type === "MEASURE_ALL") return { id, type, targets: [], moment };
  if (type === "CNOT") return { id, type, controls: [qubit(block, "CONTROL")], targets: [qubit(block, "TARGET")], moment };
  if (type === "CZ" || type === "SWAP") return { id, type, targets: [qubit(block, "FIRST"), qubit(block, "SECOND")], moment };
  if (type === "RX" || type === "RY" || type === "RZ") return { id, type, targets: [qubit(block, "TARGET")], parameter: angle(block), moment };
  return { id, type, targets: [qubit(block, "TARGET")], moment };
}
