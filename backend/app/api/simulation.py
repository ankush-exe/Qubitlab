from fastapi import APIRouter

from app.quantum.qiskit_adapter import simulate_circuit
from app.schemas.circuit import CircuitModel, ProbabilityResult, SimulationResponse

router = APIRouter(prefix="/api", tags=["simulation"])


@router.post("/simulate", response_model=SimulationResponse)
def simulate(circuit: CircuitModel, shots: int = 1024) -> SimulationResponse:
    counts, qasm, diagram = simulate_circuit(circuit, shots)
    probabilities = [
        ProbabilityResult(state=state, probability=count / shots)
        for state, count in sorted(counts.items())
    ]
    return SimulationResponse(
        circuit=circuit,
        probabilities=probabilities,
        counts=counts,
        shots=shots,
        qasm=qasm,
        diagram=diagram,
    )


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "qubitlab-api"}
