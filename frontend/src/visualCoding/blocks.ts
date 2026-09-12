import * as Blockly from "blockly";

const qubits = [["q0", "0"], ["q1", "1"], ["q2", "2"], ["q3", "3"]];
const chain = { previousStatement: null, nextStatement: null };
const gateBlocks = ["H", "X", "Y", "Z", "S", "T"].map((gate) => ({
  type: `qlearn_${gate.toLowerCase()}`,
  message0: `${gate} gate on %1`,
  args0: [{ type: "field_dropdown", name: "TARGET", options: qubits }],
  colour: "#4e76c6",
  ...chain,
}));

const definitions: Blockly.JsonBlockDefinition[] = [
  { type: "qlearn_start", message0: "Start quantum program", colour: "#087c83", nextStatement: null },
  { type: "qlearn_qubits", message0: "Use %1 qubits", args0: [{ type: "field_dropdown", name: "QUBITS", options: [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]] }], colour: "#087c83", ...chain },
  ...gateBlocks,
  { type: "qlearn_cnot", message0: "CNOT control %1 target %2", args0: [{ type: "field_dropdown", name: "CONTROL", options: qubits }, { type: "field_dropdown", name: "TARGET", options: qubits }], colour: "#bf7a2b", ...chain },
  { type: "qlearn_measure", message0: "Measure all qubits", colour: "#a15d99", ...chain },
];

let registered = false;
export function registerBlocks() {
  if (!registered) { Blockly.defineBlocksWithJsonArray(definitions); registered = true; }
}

export const toolbox: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: "categoryToolbox",
  contents: [
    { kind: "category", name: "Setup", colour: "#087c83", contents: [{ kind: "block", type: "qlearn_start" }, { kind: "block", type: "qlearn_qubits" }] },
    { kind: "category", name: "Gates", colour: "#4e76c6", contents: gateBlocks.map((block) => ({ kind: "block" as const, type: block.type })) },
    { kind: "category", name: "Two qubits", colour: "#bf7a2b", contents: [{ kind: "block", type: "qlearn_cnot" }] },
    { kind: "category", name: "Measurement", colour: "#a15d99", contents: [{ kind: "block", type: "qlearn_measure" }] },
  ],
};

export const starterWorkspace = { blocks: { languageVersion: 0, blocks: [{ type: "qlearn_start", id: "start", x: 35, y: 30, next: { block: { type: "qlearn_qubits", id: "qubits", fields: { QUBITS: "2" }, next: { block: { type: "qlearn_h", id: "hadamard", fields: { TARGET: "0" }, next: { block: { type: "qlearn_cnot", id: "cnot", fields: { CONTROL: "0", TARGET: "1" }, next: { block: { type: "qlearn_measure", id: "measure" } } } } } } } } }] } };
