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

## Current route map

- `/` — public Quantbits home
- `/courses` — course catalog
- `/courses/:slug` — course landing page and curriculum outline
- `/courses/:slug/learn` — Udemy-style course player with Overview, Lesson, Lab, and Resources tabs
- `/docs` and `/docs/:slug` — markdown-backed quantum reference library
- `/my-learning` — enrolled courses, progress, Continue actions, and the free-play Sandbox entry point

Legacy destinations such as `/dashboard`, `/progress`, `/quantum-lab`, `/experiments`, and `/ai-tutor` redirect into the consolidated IA. Quantum Lab is contextual inside the course player; Q-BOT is a persistent shell-level chat drawer.

## Product status

Real and working: Qiskit Aer simulation, drag-and-drop circuit editing, Blockly visual coding that compiles into the shared circuit model, generated Qiskit code, OpenQASM and diagram output, circuit-aware Gemini mentor with offline fallback, course catalog and player shell, markdown docs, My Learning progress presentation, contextual Lab starter circuit, general and circuit-aware Q-BOT requests, and responsive route navigation.

Demo data / placeholder: authentication, user persistence, course enrollment mutations, saved circuits, certificates, instructor/admin tooling, quiz scoring, real progress writes, and production database/session integration. These are intentionally represented as local demo data until the Postgres and Redis layers are connected.

The remote `drag-drop` branch was an independent snapshot with no merge base to `main`. Its Blockly visual-programming feature was integrated selectively into the current course-player Lab; its unrelated snapshot files, debug logs, and framework expansion were not merged.

## Roadmap

1. Persist users, enrollments, progress, notes, circuits, and AI conversations in Postgres/Redis
2. Add assessments, challenge evaluation, achievements, and certificates
3. Add instructor/admin workspaces and role-based authentication
4. Add PennyLane and Cirq execution adapters
