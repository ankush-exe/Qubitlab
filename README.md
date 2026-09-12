# QubitLab

QubitLab is an AI-powered interactive quantum algorithm learning platform for Smart India Hackathon. The first vertical slice is Circuit Lab: learners visually compose a circuit, run it on Qiskit Aer, and inspect measured state probabilities, OpenQASM, and a circuit diagram.

Visual Coding adds a Scratch-like Blockly workspace alongside Circuit Designer. It converts connected quantum blocks into the same framework-independent circuit model used by Circuit Lab, then generates target code and runs available local simulators.

## Stack

- Frontend: React, TypeScript, Vite, React Router, Three.js-ready visualization layer
- Backend: Python 3.11+, FastAPI, Pydantic
- Quantum: Qiskit and Qiskit Aer behind a framework-independent circuit schema
- Visual Coding: Google Blockly; Qiskit/Aer, PennyLane, Cirq, and a credential-gated qBraid integration boundary
- Data services: PostgreSQL and Redis via Docker Compose
- Planned: PennyLane, Cirq, Plotly, Monaco Editor, RAG mentor, learning modules, challenges, progress

## Run locally

### Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The API is expected at http://localhost:8000. Set `VITE_API_URL` to change it.

## Visual Coding targets

- **Qiskit** and **Qiskit Aer** generate Qiskit code; Aer runs locally without an IBM API key.
- **PennyLane** and **Cirq** generate and execute equivalent circuits on their local simulators.
- **qBraid** generates a qBraid-oriented submission workflow but does not submit cloud jobs without `QBRAID_API_KEY` and a selected backend. See `backend/.env.example`.

### Services

```bash
docker compose up -d
```

## Circuit contract

The frontend sends a framework-independent circuit model. Quantum adapters are responsible for translating it to a specific execution framework:

```json
{
  "qubits": 2,
  "classical_bits": 2,
  "gates": [
    {"id": "h-0", "type": "H", "targets": [0], "moment": 0},
    {"id": "cx-1", "type": "CNOT", "controls": [0], "targets": [1], "moment": 1}
  ]
}
```

## Roadmap

1. Circuit Lab vertical slice (current)
2. Learning modules: Fundamentals, Gates, Superposition, Entanglement, Algorithms
3. AI Circuit Doctor with circuit context and learning history
4. Challenges and automatic evaluation
5. Progress dashboard and personalized learning
6. Authentication, Postgres persistence, Redis sessions, Docker deployment
7. PennyLane and Cirq execution adapters
