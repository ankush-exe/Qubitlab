"""Framework generators and executors for QubitLab's shared circuit contract."""

from collections import Counter
from math import pi

from app.quantum.qiskit_adapter import build_qiskit_circuit, simulate_circuit
from app.schemas.circuit import CircuitModel, FrameworkTarget, GateOperation


def _angle(value: float) -> str:
    for candidate, label in ((pi, "pi"), (pi / 2, "pi / 2"), (pi / 4, "pi / 4"), (0.0, "0")):
        if abs(value - candidate) < 1e-9:
            return label
    return repr(value)


def _ordered(circuit: CircuitModel) -> list[GateOperation]:
    return sorted(circuit.gates, key=lambda operation: (operation.moment, operation.id))


def generate_code(circuit: CircuitModel, target: FrameworkTarget) -> str:
    if target in {"qiskit", "qiskit_aer"}:
        return _qiskit_code(circuit, include_aer=target == "qiskit_aer")
    if target == "pennylane":
        return _pennylane_code(circuit)
    if target == "cirq":
        return _cirq_code(circuit)
    return _qbraid_code(circuit)


def _qiskit_code(circuit: CircuitModel, include_aer: bool) -> str:
    lines = ["from qiskit import QuantumCircuit"]
    if include_aer:
        lines.append("from qiskit_aer import AerSimulator")
    lines.extend(["", f"qc = QuantumCircuit({circuit.qubits})", ""])
    for gate in _ordered(circuit):
        lines.extend(_qiskit_gate_lines(gate))
    if include_aer:
        lines.extend(["", "simulator = AerSimulator()", "result = simulator.run(qc, shots=1024).result()", "counts = result.get_counts()"])
    return "\n".join(lines)


def _qiskit_gate_lines(gate: GateOperation) -> list[str]:
    if gate.type == "CNOT":
        return [f"qc.cx({gate.controls[0]}, {gate.targets[0]})"]
    if gate.type in {"CZ", "SWAP"}:
        return [f"qc.{gate.type.lower()}({gate.targets[0]}, {gate.targets[1]})"]
    if gate.type in {"RX", "RY", "RZ"}:
        return [f"qc.{gate.type.lower()}({_angle(gate.parameter or 0)}, {gate.targets[0]})"]
    if gate.type == "MEASURE":
        return [f"qc.measure({gate.targets[0]}, {gate.targets[0]})"]
    if gate.type == "MEASURE_ALL":
        return ["qc.measure_all()"]
    return [f"qc.{gate.type.lower()}({gate.targets[0]})"]


def _pennylane_code(circuit: CircuitModel) -> str:
    lines = ["import pennylane as qml", "", f'dev = qml.device("default.qubit", wires={circuit.qubits})', "", "@qml.qnode(dev)", "def circuit():"]
    for gate in _ordered(circuit):
        lines.extend(_pennylane_gate_lines(gate))
    lines.extend([f"    return qml.probs(wires=range({circuit.qubits}))", "", "result = circuit()"])
    return "\n".join(lines)


def _pennylane_gate_lines(gate: GateOperation) -> list[str]:
    simple = {"H": "Hadamard", "X": "PauliX", "Y": "PauliY", "Z": "PauliZ", "S": "S", "T": "T"}
    if gate.type in simple:
        return [f"    qml.{simple[gate.type]}(wires={gate.targets[0]})"]
    if gate.type in {"RX", "RY", "RZ"}:
        return [f"    qml.{gate.type}({_angle(gate.parameter or 0)}, wires={gate.targets[0]})"]
    if gate.type == "CNOT":
        return [f"    qml.CNOT(wires=[{gate.controls[0]}, {gate.targets[0]}])"]
    if gate.type in {"CZ", "SWAP"}:
        return [f"    qml.{gate.type}(wires=[{gate.targets[0]}, {gate.targets[1]}])"]
    if gate.type == "MEASURE":
        return [f"    # q{gate.targets[0]} is sampled when the QNode returns"]
    return ["    # all wires are sampled when the QNode returns"]


def _cirq_code(circuit: CircuitModel) -> str:
    lines = ["import cirq", "", f"q = cirq.LineQubit.range({circuit.qubits})", "circuit = cirq.Circuit()", ""]
    for gate in _ordered(circuit):
        lines.extend(_cirq_gate_lines(gate))
    lines.extend(["", "simulator = cirq.Simulator()", "result = simulator.run(circuit, repetitions=1024)"])
    return "\n".join(lines)


def _cirq_gate_lines(gate: GateOperation) -> list[str]:
    simple = {"H": "H", "X": "X", "Y": "Y", "Z": "Z", "S": "S", "T": "T"}
    if gate.type in simple:
        return [f"circuit.append(cirq.{simple[gate.type]}(q[{gate.targets[0]}]))"]
    if gate.type in {"RX", "RY", "RZ"}:
        return [f"circuit.append(cirq.{gate.type.lower()}({_angle(gate.parameter or 0)})(q[{gate.targets[0]}]))"]
    if gate.type == "CNOT":
        return [f"circuit.append(cirq.CNOT(q[{gate.controls[0]}], q[{gate.targets[0]}]))"]
    if gate.type == "CZ":
        return [f"circuit.append(cirq.CZ(q[{gate.targets[0]}], q[{gate.targets[1]}]))"]
    if gate.type == "SWAP":
        return [f"circuit.append(cirq.SWAP(q[{gate.targets[0]}], q[{gate.targets[1]}]))"]
    if gate.type == "MEASURE":
        return [f"circuit.append(cirq.measure(q[{gate.targets[0]}], key='q{gate.targets[0]}'))"]
    return [f"circuit.append(cirq.measure(*q, key='measure_all'))"]


def _qbraid_code(circuit: CircuitModel) -> str:
    qiskit_program = _qiskit_code(circuit, include_aer=False)
    return "\n".join([
        "# qBraid workflow: authenticate with QBRAID_API_KEY, then submit a compatible program.",
        "# This app deliberately does not submit cloud jobs without credentials.",
        qiskit_program,
        "",
        "# import qbraid",
        "# device = qbraid.get_device(\"YOUR_BACKEND_ID\")",
        "# job = device.run(qc)",
    ])


def execute(circuit: CircuitModel, target: FrameworkTarget, shots: int) -> tuple[dict[str, int], str, str]:
    """Execute only on an actual configured local simulator."""
    if target in {"qiskit", "qiskit_aer"}:
        return simulate_circuit(circuit, shots)
    if target == "pennylane":
        return _execute_pennylane(circuit, shots)
    if target == "cirq":
        return _execute_cirq(circuit, shots)
    raise RuntimeError("qBraid cloud execution needs QBRAID_API_KEY and a configured backend; no job was submitted.")


def _counts_from_rows(rows: object) -> dict[str, int]:
    import numpy as np

    values = np.asarray(rows)
    if values.ndim == 1:
        values = values.reshape(-1, 1)
    return dict(Counter("".join(str(int(bit)) for bit in row) for row in values))


def _execute_pennylane(circuit: CircuitModel, shots: int) -> tuple[dict[str, int], str, str]:
    import pennylane as qml

    device = qml.device("default.qubit", wires=circuit.qubits, shots=shots)

    @qml.qnode(device)
    def program():
        for gate in _ordered(circuit):
            if gate.type in {"MEASURE", "MEASURE_ALL"}:
                continue
            _apply_pennylane(qml, gate)
        return qml.sample(wires=range(circuit.qubits))

    counts = _counts_from_rows(program())
    qiskit_circuit = build_qiskit_circuit(circuit)
    return counts, generate_code(circuit, "pennylane"), str(qiskit_circuit.draw(output="text"))


def _apply_pennylane(qml: object, gate: GateOperation) -> None:
    simple = {"H": "Hadamard", "X": "PauliX", "Y": "PauliY", "Z": "PauliZ", "S": "S", "T": "T"}
    if gate.type in simple:
        getattr(qml, simple[gate.type])(wires=gate.targets[0])
    elif gate.type in {"RX", "RY", "RZ"}:
        getattr(qml, gate.type)(gate.parameter, wires=gate.targets[0])
    elif gate.type == "CNOT":
        qml.CNOT(wires=[gate.controls[0], gate.targets[0]])
    elif gate.type in {"CZ", "SWAP"}:
        getattr(qml, gate.type)(wires=gate.targets)


def _execute_cirq(circuit: CircuitModel, shots: int) -> tuple[dict[str, int], str, str]:
    import cirq

    qubits = cirq.LineQubit.range(circuit.qubits)
    program = cirq.Circuit()
    for gate in _ordered(circuit):
        if gate.type in {"MEASURE", "MEASURE_ALL"}:
            continue
        _apply_cirq(cirq, program, qubits, gate)
    program.append(cirq.measure(*qubits, key="result"))
    result = cirq.Simulator().run(program, repetitions=shots)
    return _counts_from_rows(result.measurements["result"]), generate_code(circuit, "cirq"), str(program)


def _apply_cirq(cirq: object, program: object, qubits: object, gate: GateOperation) -> None:
    if gate.type in {"H", "X", "Y", "Z", "S", "T"}:
        program.append(getattr(cirq, gate.type)(qubits[gate.targets[0]]))
    elif gate.type in {"RX", "RY", "RZ"}:
        program.append(getattr(cirq, gate.type.lower())(gate.parameter)(qubits[gate.targets[0]]))
    elif gate.type == "CNOT":
        program.append(cirq.CNOT(qubits[gate.controls[0]], qubits[gate.targets[0]]))
    elif gate.type in {"CZ", "SWAP"}:
        program.append(getattr(cirq, gate.type)(qubits[gate.targets[0]], qubits[gate.targets[1]]))
