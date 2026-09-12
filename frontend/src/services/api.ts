import type { CircuitModel, FrameworkTarget, SimulationResult, VisualProgramRequest, VisualSimulationResult } from "../types/circuit";

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

async function postVisual<T>(path: string, program: VisualProgramRequest): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...program, shots: program.shots ?? 1024 }),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(detail?.detail ?? `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function generateVisualCode(circuit: CircuitModel, target: FrameworkTarget): Promise<{ target: FrameworkTarget; code: string }> {
  return postVisual("/api/visual-code", { circuit, target });
}

export function simulateVisualProgram(program: VisualProgramRequest): Promise<VisualSimulationResult> {
  return postVisual("/api/visual-simulate", program);
}
