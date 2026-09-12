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
