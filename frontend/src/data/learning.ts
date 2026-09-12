export type Course = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  level: string;
  progress: number;
  accent: string;
  modules: string[];
};

export const courses: Course[] = [
  {
    id: "fundamentals",
    title: "Quantum Computing Fundamentals",
    category: "FOUNDATIONS",
    description: "Build the mental models behind qubits, measurement, and the strange rules that power quantum computation.",
    duration: "4h 20m",
    level: "Beginner",
    progress: 72,
    accent: "cyan",
    modules: ["The quantum point of view", "Qubits and states", "Superposition", "Measurement"],
  },
  {
    id: "circuits",
    title: "Quantum Gates & Circuits",
    category: "BUILD",
    description: "Turn intuition into working programs with gates, wires, moments, and your first complete circuits.",
    duration: "6h 10m",
    level: "Beginner",
    progress: 48,
    accent: "violet",
    modules: ["Reading a circuit", "Single-qubit gates", "Entanglement", "Circuit patterns"],
  },
  {
    id: "algorithms",
    title: "Quantum Algorithms",
    category: "ALGORITHMS",
    description: "Explore Grover, the quantum Fourier transform, and why algorithms need a different way of thinking.",
    duration: "8h 40m",
    level: "Intermediate",
    progress: 31,
    accent: "orange",
    modules: ["Algorithmic advantage", "Grover's search", "QFT intuition", "Variational algorithms"],
  },
];

export const recentLessons = [
  { course: "Quantum Computing Fundamentals", lesson: "Superposition is not uncertainty", progress: 72, time: "12 min left", color: "cyan" },
  { course: "Quantum Gates & Circuits", lesson: "Build your first Bell state", progress: 48, time: "18 min left", color: "violet" },
];
