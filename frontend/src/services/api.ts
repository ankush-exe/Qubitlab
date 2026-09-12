import type { CircuitModel, MentorResponse, SimulationResult } from "../types/circuit";

const API_URL = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:8000`;

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

export async function askMentor(circuit: CircuitModel | null, question?: string): Promise<MentorResponse> {
  const response = await fetch(`${API_URL}/api/mentor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...(circuit ?? {}), question }),
  });
  if (!response.ok) {
    throw new Error(`Mentor request failed with status ${response.status}`);
  }
  return response.json() as Promise<MentorResponse>;
}
