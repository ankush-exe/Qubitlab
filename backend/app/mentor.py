import os
from collections import Counter

from app.quantum.qiskit_adapter import build_qiskit_circuit
from app.schemas.circuit import CircuitModel


SYSTEM_PROMPT = """You are a quantum-computing tutor reviewing a student's circuit.
Explain what the circuit does, flag likely mistakes without assuming unstated intent,
and answer the student's question if one is provided. Keep the response to 2-4 short
paragraphs. Do not use markdown headers or bullets."""


def circuit_summary(circuit: CircuitModel) -> dict:
    gate_counts = Counter(gate.type for gate in circuit.gates)
    ordered_gates = sorted(circuit.gates, key=lambda gate: (gate.moment, gate.id))
    touched_qubits = sorted(
        {qubit for gate in circuit.gates for qubit in gate.targets + gate.controls}
    )
    entangling_pairs = [
        {"control": gate.controls[0], "target": gate.targets[0]}
        for gate in circuit.gates
        if gate.type == "CNOT"
    ]
    return {
        "qubits": circuit.qubits,
        "gate_count": len(circuit.gates),
        "gate_counts": dict(sorted(gate_counts.items())),
        "touched_qubits": touched_qubits,
        "untouched_qubits": [qubit for qubit in range(circuit.qubits) if qubit not in touched_qubits],
        "entangling_pairs": entangling_pairs,
        "entangling_before_superposition": any(
            gate.type == "CNOT"
            and not any(previous.type == "H" and previous.moment < gate.moment for previous in ordered_gates)
            for gate in ordered_gates
        ),
    }


def _fallback_notes(summary: dict, question: str | None) -> list[str]:
    notes: list[str] = []
    gate_types = [gate_type for gate_type, count in summary["gate_counts"].items() for _ in range(count)]
    if "H" in gate_types and "CNOT" in gate_types:
        notes.append("This matches the classic Bell-state pattern: the H gate creates superposition, then CNOT correlates the two qubits.")
    elif "H" in gate_types:
        notes.append("The Hadamard gate puts its target qubit into an equal superposition of |0> and |1> before later operations.")
    if summary["entangling_before_superposition"]:
        notes.append("The circuit uses an entangling CNOT before any visible superposition-creating gate, so it may only correlate a computational-basis state.")
    if summary["untouched_qubits"]:
        labels = ", ".join(f"q{qubit}" for qubit in summary["untouched_qubits"])
        notes.append(f"{labels} never receive a gate, so their measured state stays at the initial |0> state.")
    if not notes:
        notes.append("The circuit is ready to explore. Run it, then compare the measured probabilities with the gates acting on each qubit.")
    if question:
        notes.append(f"Offline mentor note: I cannot answer '{question}' with the language model disabled, but the circuit summary above is the place to start.")
    return notes


def _llm_notes(summary: dict, diagram: str, question: str | None) -> list[str]:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt = (
        f"Circuit summary:\n{summary}\n\nCircuit diagram:\n{diagram}\n\n"
        f"Student question: {question or 'No question provided.'}"
    )
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            max_output_tokens=700,
        ),
    )
    text = response.text or ""
    return [paragraph.strip() for paragraph in text.split("\n\n") if paragraph.strip()]


def generate_mentor_notes(circuit_summary: dict, diagram: str, question: str | None) -> list[str]:
    try:
        if os.getenv("GEMINI_API_KEY"):
            return _llm_notes(circuit_summary, diagram, question)
    except Exception:
        pass
    return _fallback_notes(circuit_summary, question)


def mentor_notes_for_circuit(circuit: CircuitModel, question: str | None = None) -> tuple[dict, str, list[str]]:
    summary = circuit_summary(circuit)
    diagram = str(build_qiskit_circuit(circuit).draw(output="text"))
    notes = generate_mentor_notes(summary, diagram, question)
    return summary, diagram, notes