export type GateType = "H" | "X" | "Y" | "Z" | "S" | "T" | "RX" | "RY" | "RZ" | "CNOT" | "CZ" | "SWAP" | "MEASURE" | "MEASURE_ALL";

export type GateOperation = {
  id: string;
  type: GateType;
  targets: number[];
  controls?: number[];
  moment: number;
  parameter?: number;
};

export type CircuitModel = {
  qubits: number;
  classical_bits?: number;
  gates: GateOperation[];
};

export type SimulationResult = {
  circuit: CircuitModel;
  probabilities: { state: string; probability: number }[];
  counts: Record<string, number>;
  shots: number;
  qasm: string;
  diagram: string;
};

export type FrameworkTarget = "qiskit" | "qiskit_aer" | "pennylane" | "cirq" | "qbraid";

export type VisualProgramRequest = { circuit: CircuitModel; target: FrameworkTarget; shots?: number };
export type VisualSimulationResult = SimulationResult & { target: FrameworkTarget; code: string };
