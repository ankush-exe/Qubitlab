from fastapi.testclient import TestClient

import app.mentor as mentor_module
from app.main import app

client = TestClient(app)

BELL_CIRCUIT = {
    "qubits": 2,
    "gates": [
        {"id": "h-0", "type": "H", "targets": [0], "moment": 0},
        {"id": "cx-1", "type": "CNOT", "controls": [0], "targets": [1], "moment": 1},
    ],
}


def test_bell_mentor_works_offline(monkeypatch) -> None:
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    response = client.post("/api/mentor", json=BELL_CIRCUIT)
    assert response.status_code == 200
    body = response.json()
    assert body["summary"]["gate_counts"] == {"CNOT": 1, "H": 1}
    assert any("Bell-state" in note for note in body["notes"])
    assert "q_0" in body["diagram"]


def test_bell_mentor_uses_llm_when_key_is_set(monkeypatch) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    monkeypatch.setattr(mentor_module, "_llm_notes", lambda summary, diagram, question: ["The mocked tutor reviewed the Bell circuit."])
    response = client.post("/api/mentor", json={**BELL_CIRCUIT, "question": "Why are the results correlated?"})
    assert response.status_code == 200
    assert response.json()["notes"] == ["The mocked tutor reviewed the Bell circuit."]


def test_mentor_falls_back_when_llm_fails(monkeypatch) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    def raise_error(summary, diagram, question):
        raise RuntimeError("network unavailable")
    monkeypatch.setattr(mentor_module, "_llm_notes", raise_error)
    response = client.post("/api/mentor", json=BELL_CIRCUIT)
    assert response.status_code == 200
    assert any("Bell-state" in note for note in response.json()["notes"])
