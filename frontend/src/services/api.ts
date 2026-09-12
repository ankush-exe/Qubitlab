import type { CircuitModel, SimulationResult } from "../types/circuit";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function simulateCircuit(circuit: CircuitModel): Promise<SimulationResult> {
  const response = await fetch(`${API_URL}/api/simulate?shots=1024`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(circuit),
  });
  if (!response.ok) {
    throw new Error(`Simulation failed with status ${response.status}`);
  }
  return response.json() as Promise<SimulationResult>;
}
