from math import isfinite
from typing import Literal

from pydantic import BaseModel, Field, model_validator

# `gates` is QubitLab's existing framework-independent circuit contract. Visual
# Coding emits this same shape, so every UI stays compatible with every adapter.
GateType = Literal[
    "H", "X", "Y", "Z", "S", "T", "RX", "RY", "RZ", "CNOT", "CZ", "SWAP", "MEASURE", "MEASURE_ALL"
]
FrameworkTarget = Literal["qiskit", "qiskit_aer", "pennylane", "cirq", "qbraid"]


class GateOperation(BaseModel):
    id: str = Field(min_length=1)
    type: GateType
    targets: list[int] = Field(default_factory=list, max_length=2)
    controls: list[int] = Field(default_factory=list, max_length=1)
    moment: int = Field(ge=0)
    parameter: float | None = None

    @model_validator(mode="after")
    def validate_gate_wiring(self) -> "GateOperation":
        if self.type == "MEASURE_ALL":
            if self.targets or self.controls:
                raise ValueError("Measure All does not take qubit inputs")
        elif self.type == "CNOT":
            if len(self.controls) != 1 or len(self.targets) != 1:
                raise ValueError("CNOT requires one control and one target")
            if self.controls[0] == self.targets[0]:
                raise ValueError("CNOT control and target must differ")
        elif self.type in {"CZ", "SWAP"}:
            if self.controls or len(self.targets) != 2:
                raise ValueError(f"{self.type} requires two different target qubits")
            if self.targets[0] == self.targets[1]:
                raise ValueError(f"{self.type} qubits must differ")
        elif self.type in {"RX", "RY", "RZ"}:
            if self.controls or len(self.targets) != 1:
                raise ValueError(f"{self.type} requires one target qubit")
            if self.parameter is None or not isfinite(self.parameter):
                raise ValueError(f"{self.type} requires a finite angle")
        elif self.controls or len(self.targets) != 1:
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
            if any(index < 0 or index >= self.qubits for index in indices):
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


class VisualProgramRequest(BaseModel):
    circuit: CircuitModel
    target: FrameworkTarget = "qiskit_aer"
    shots: int = Field(default=1024, ge=1, le=100_000)


class GeneratedCodeResponse(BaseModel):
    target: FrameworkTarget
    code: str


class VisualSimulationResponse(SimulationResponse):
    target: FrameworkTarget
    code: str
