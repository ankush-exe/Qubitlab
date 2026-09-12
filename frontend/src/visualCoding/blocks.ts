import * as Blockly from "blockly";

const qubits = [["q0", "0"], ["q1", "1"], ["q2", "2"], ["q3", "3"], ["q4", "4"], ["q5", "5"], ["q6", "6"], ["q7", "7"]];
const next = { previousStatement: null, nextStatement: null };

const blocks: Blockly.JsonBlockDefinition[] = [
  { type: "quantum_create_circuit", message0: "Create Circuit", colour: "#39c6c0", tooltip: "Start a visual quantum program", nextStatement: null },
  { type: "quantum_create_qubits", message0: "Create %1 Qubits", args0: [{ type: "field_dropdown", name: "QUBITS", options: [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]] }], colour: "#39c6c0", ...next },
  ...["H", "X", "Y", "Z", "S", "T"].map((gate) => ({ type: `quantum_${gate.toLowerCase()}`, message0: `${gate} Gate on %1`, args0: [{ type: "field_dropdown" as const, name: "TARGET", options: qubits }], colour: "#6176ee", ...next })),
  ...["RX", "RY", "RZ"].map((gate) => ({ type: `quantum_${gate.toLowerCase()}`, message0: `${gate} angle %1 custom value %2 on %3`, args0: [
    { type: "field_dropdown" as const, name: "ANGLE", options: [["π", "pi"], ["π/2", "half_pi"], ["π/4", "quarter_pi"], ["0", "zero"], ["custom", "custom"]] },
    { type: "field_number" as const, name: "CUSTOM_ANGLE", value: 0, precision: 0.01 },
    { type: "field_dropdown" as const, name: "TARGET", options: qubits },
  ], colour: "#a978e4", ...next })),
  { type: "quantum_cnot", message0: "CNOT control %1 target %2", args0: [{ type: "field_dropdown", name: "CONTROL", options: qubits }, { type: "field_dropdown", name: "TARGET", options: qubits }], colour: "#f2ad60", ...next },
  { type: "quantum_cz", message0: "CZ %1 %2", args0: [{ type: "field_dropdown", name: "FIRST", options: qubits }, { type: "field_dropdown", name: "SECOND", options: qubits }], colour: "#f2ad60", ...next },
  { type: "quantum_swap", message0: "SWAP %1 %2", args0: [{ type: "field_dropdown", name: "FIRST", options: qubits }, { type: "field_dropdown", name: "SECOND", options: qubits }], colour: "#f2ad60", ...next },
  { type: "quantum_measure", message0: "Measure %1", args0: [{ type: "field_dropdown", name: "TARGET", options: qubits }], colour: "#d576c9", ...next },
  { type: "quantum_measure_all", message0: "Measure All", colour: "#d576c9", ...next },
  { type: "quantum_run", message0: "Run Circuit", colour: "#45b980", tooltip: "Use the Run button above the workspace", ...next },
];

let registered = false;

export function registerQuantumBlocks() {
  if (!registered) {
    Blockly.defineBlocksWithJsonArray(blocks);
    registered = true;
  }
}

export const toolbox: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: "categoryToolbox",
  contents: [
    { kind: "category", name: "SETUP", colour: "#39c6c0", contents: [{ kind: "block", type: "quantum_create_circuit" }, { kind: "block", type: "quantum_create_qubits" }] },
    { kind: "category", name: "GATES", colour: "#6176ee", contents: ["h", "x", "y", "z", "s", "t"].map((name) => ({ kind: "block" as const, type: `quantum_${name}` })) },
    { kind: "category", name: "ROTATIONS", colour: "#a978e4", contents: ["rx", "ry", "rz"].map((name) => ({ kind: "block" as const, type: `quantum_${name}` })) },
    { kind: "category", name: "MULTI-QUBIT", colour: "#f2ad60", contents: ["cnot", "cz", "swap"].map((name) => ({ kind: "block" as const, type: `quantum_${name}` })) },
    { kind: "category", name: "MEASUREMENT", colour: "#d576c9", contents: [{ kind: "block", type: "quantum_measure" }, { kind: "block", type: "quantum_measure_all" }] },
    { kind: "category", name: "SIMULATION", colour: "#45b980", contents: [{ kind: "block", type: "quantum_run" }] },
  ],
};

export const starterWorkspace = {
  blocks: {
    languageVersion: 0,
    blocks: [{
      type: "quantum_create_circuit", id: "starter-circuit", x: 70, y: 55,
      next: { block: {
        type: "quantum_create_qubits", id: "starter-qubits", fields: { QUBITS: "2" },
        next: { block: {
          type: "quantum_h", id: "starter-h", fields: { TARGET: "0" },
          next: { block: {
            type: "quantum_cnot", id: "starter-cnot", fields: { CONTROL: "0", TARGET: "1" },
            next: { block: { type: "quantum_measure_all", id: "starter-measure" } },
          } },
        } },
      } },
    }],
  },
};
