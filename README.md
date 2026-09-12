# QubitLab

QubitLab (branded in the product as Quantbits) is an AI-powered interactive quantum learning platform for Smart India Hackathon. Learners move from a structured lesson into Quantum Lab, compose a circuit visually, run it on Qiskit Aer, inspect measured state probabilities, and ask the Circuit Doctor why the result happened.

## Stack

- Frontend: React, TypeScript, Vite, React Router, Three.js-ready visualization layer
- Backend: Python 3.11+, FastAPI, Pydantic
- Quantum: Qiskit and Qiskit Aer behind a framework-independent circuit schema
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

### Gemini mentor

The Circuit Doctor uses Google Gemini when `GEMINI_API_KEY` is set. Copy `backend/.env.example` to `backend/.env`, add your private key, and restart the backend. Without a key, the local rule-based mentor remains available.

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

1. Product shell, dashboard, courses, interactive lesson, experiments, progress, and Quantum Lab (current)
2. Learning modules: Fundamentals, Gates, Superposition, Entanglement, Algorithms
3. AI Circuit Doctor with circuit context and learning history
4. Challenges and automatic evaluation
5. Progress dashboard and personalized learning
6. Authentication, Postgres persistence, Redis sessions, Docker deployment
7. PennyLane and Cirq execution adapters
