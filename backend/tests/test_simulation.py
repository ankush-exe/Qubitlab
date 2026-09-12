from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_bell_circuit_simulates() -> None:
    response = client.post(
        "/api/simulate?shots=200",
        json={
            "qubits": 2,
            "gates": [
                {"id": "h-0", "type": "H", "targets": [0], "moment": 0},
                {
                    "id": "cx-1",
                    "type": "CNOT",
                    "controls": [0],
                    "targets": [1],
                    "moment": 1,
                },
            ],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert set(body["counts"]).issubset({"00", "11"})
    assert "OPENQASM" in body["qasm"]
    assert "q_0" in body["diagram"]


def test_visual_program_generates_and_executes_qiskit_aer() -> None:
    visual_program = {
        "target": "qiskit_aer",
        "shots": 200,
        "circuit": {
            "qubits": 2,
            "gates": [
                {"id": "h", "type": "H", "targets": [0], "moment": 0},
                {"id": "cx", "type": "CNOT", "controls": [0], "targets": [1], "moment": 1},
                {"id": "measure", "type": "MEASURE_ALL", "targets": [], "moment": 2},
            ],
        },
    }
    code_response = client.post("/api/visual-code", json=visual_program)
    assert code_response.status_code == 200
    assert "qc.cx(0, 1)" in code_response.json()["code"]

    simulation_response = client.post("/api/visual-simulate", json=visual_program)
    assert simulation_response.status_code == 200
    assert set(simulation_response.json()["counts"]).issubset({"00", "11"})
