export type GateType = "H" | "X" | "Y" | "Z" | "S" | "T" | "CNOT" | "MEASURE";

export type GateOperation = {
  id: string;
  type: GateType;
  targets: number[];
  controls?: number[];
  moment: number;
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
