from fastapi import APIRouter

from app.quantum.qiskit_adapter import simulate_circuit
from app.mentor import generate_general_mentor_notes, mentor_notes_for_circuit
from app.schemas.circuit import CircuitModel, MentorRequest, ProbabilityResult, SimulationResponse

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


@router.post("/mentor")
def mentor(request: MentorRequest) -> dict:
    circuit = request.as_circuit()
    if circuit is None:
        return {"summary": {"context": "general quantum-computing question"}, "diagram": "", "notes": generate_general_mentor_notes(request.question)}
    summary, diagram, notes = mentor_notes_for_circuit(circuit, request.question)
    return {"summary": summary, "diagram": diagram, "notes": notes}
