from qiskit import QuantumCircuit, qasm2
from qiskit_aer import AerSimulator

from app.schemas.circuit import CircuitModel, GateOperation


SINGLE_QUBIT_GATES = {
    "H": "h",
    "X": "x",
    "Y": "y",
    "Z": "z",
    "S": "s",
    "T": "t",
}


def build_qiskit_circuit(circuit: CircuitModel, measure: bool = True) -> QuantumCircuit:
    quantum_circuit = QuantumCircuit(circuit.qubits, circuit.classical_bits or circuit.qubits)
    for gate in sorted(circuit.gates, key=lambda operation: (operation.moment, operation.id)):
        apply_gate(quantum_circuit, gate)
    has_measurement = any(gate.type in {"MEASURE", "MEASURE_ALL"} for gate in circuit.gates)
    if measure and not has_measurement:
        quantum_circuit.measure(range(circuit.qubits), range(circuit.qubits))
    return quantum_circuit


def apply_gate(quantum_circuit: QuantumCircuit, gate: GateOperation) -> None:
    if gate.type == "CNOT":
        quantum_circuit.cx(gate.controls[0], gate.targets[0])
        return
    if gate.type == "MEASURE":
        quantum_circuit.measure(gate.targets[0], gate.targets[0])
        return
    if gate.type == "MEASURE_ALL":
        quantum_circuit.measure(range(quantum_circuit.num_qubits), range(quantum_circuit.num_clbits))
        return
    if gate.type == "CZ":
        quantum_circuit.cz(gate.targets[0], gate.targets[1])
        return
    if gate.type == "SWAP":
        quantum_circuit.swap(gate.targets[0], gate.targets[1])
        return
    if gate.type in {"RX", "RY", "RZ"}:
        getattr(quantum_circuit, gate.type.lower())(gate.parameter, gate.targets[0])
        return
    getattr(quantum_circuit, SINGLE_QUBIT_GATES[gate.type])(gate.targets[0])


def simulate_circuit(circuit: CircuitModel, shots: int) -> tuple[dict[str, int], str, str]:
    quantum_circuit = build_qiskit_circuit(circuit)
    simulator = AerSimulator()
    result = simulator.run(quantum_circuit, shots=shots).result()
    counts = result.get_counts(quantum_circuit)
    return counts, qasm2.dumps(quantum_circuit), str(quantum_circuit.draw(output="text"))
