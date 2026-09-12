from fastapi import APIRouter, HTTPException

from app.quantum.framework_adapters import execute, generate_code
from app.quantum.qiskit_adapter import simulate_circuit
from app.schemas.circuit import (
    CircuitModel,
    GeneratedCodeResponse,
    ProbabilityResult,
    SimulationResponse,
    VisualProgramRequest,
    VisualSimulationResponse,
)

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


@router.post("/visual-code", response_model=GeneratedCodeResponse)
def visual_code(program: VisualProgramRequest) -> GeneratedCodeResponse:
    """Generate target code from the shared circuit model without running it."""
    return GeneratedCodeResponse(target=program.target, code=generate_code(program.circuit, program.target))


@router.post("/visual-simulate", response_model=VisualSimulationResponse)
def visual_simulate(program: VisualProgramRequest) -> VisualSimulationResponse:
    if program.target == "qbraid":
        raise HTTPException(
            status_code=501,
            detail="qBraid execution is not configured. Set QBRAID_API_KEY and choose a qBraid backend before submitting a cloud job.",
        )
    try:
        counts, qasm, diagram = execute(program.circuit, program.target, program.shots)
    except RuntimeError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    probabilities = [
        ProbabilityResult(state=state, probability=count / program.shots)
        for state, count in sorted(counts.items())
    ]
    return VisualSimulationResponse(
        circuit=program.circuit,
        probabilities=probabilities,
        counts=counts,
        shots=program.shots,
        qasm=qasm,
        diagram=diagram,
        target=program.target,
        code=generate_code(program.circuit, program.target),
    )


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "qubitlab-api"}
