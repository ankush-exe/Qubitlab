from typing import Literal

from pydantic import BaseModel, Field, model_validator

GateType = Literal["H", "X", "Y", "Z", "S", "T", "CNOT", "MEASURE"]


class GateOperation(BaseModel):
    id: str = Field(min_length=1)
    type: GateType
    targets: list[int] = Field(min_length=1, max_length=2)
    controls: list[int] = Field(default_factory=list, max_length=1)
    moment: int = Field(ge=0)

    @model_validator(mode="after")
    def validate_gate_wiring(self) -> "GateOperation":
        if self.type == "CNOT":
            if len(self.controls) != 1 or len(self.targets) != 1:
                raise ValueError("CNOT requires one control and one target")
            if self.controls[0] == self.targets[0]:
                raise ValueError("CNOT control and target must differ")
        elif self.controls:
            raise ValueError("Only CNOT gates may have controls")
        elif len(self.targets) != 1:
            raise ValueError("Single-qubit gates require one target")
        return self


class CircuitModel(BaseModel):
    qubits: int = Field(ge=1, le=8)
    classical_bits: int | None = Field(default=None, ge=1, le=8)
    gates: list[GateOperation] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_qubit_indices(self) -> "CircuitModel":
        classical_bits = self.classical_bits or self.qubits
        if classical_bits < self.qubits:
            raise ValueError("classical_bits must cover every qubit")
        for gate in self.gates:
            indices = gate.targets + gate.controls
            if any(index >= self.qubits for index in indices):
                raise ValueError("Gate references a qubit outside the circuit")
        return self


class ProbabilityResult(BaseModel):
    state: str
    probability: float


class SimulationResponse(BaseModel):
    circuit: CircuitModel
    probabilities: list[ProbabilityResult]
    counts: dict[str, int]
    shots: int
    qasm: str
    diagram: str
