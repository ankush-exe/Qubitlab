import { useState } from "react";
import type { CircuitModel } from "../types/circuit";
import { askMentor } from "../services/api";

type MentorPanelProps = {
  circuit: CircuitModel;
  notes: string[];
  isLoading: boolean;
  error: string | null;
  onNotes: (notes: string[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
};

export function MentorPanel({ circuit, notes, isLoading, error, onNotes, onLoading, onError }: MentorPanelProps) {
  const [question, setQuestion] = useState("");

  const submitQuestion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;
    onLoading(true);
    onError(null);
    try {
      const response = await askMentor(circuit, question.trim());
      onNotes(response.notes);
      setQuestion("");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Unable to reach the Circuit Doctor");
    } finally {
      onLoading(false);
    }
  };

  return (
    <section className="panel mentor-panel">
      <div className="panel-heading mentor-heading">
        <div><span className="eyebrow">05 / CIRCUIT DOCTOR</span><h2>AI Mentor</h2></div>
        <span className="mentor-badge">{isLoading ? "thinking" : "online"}</span>
      </div>
      <p className="muted">A second pair of eyes for the program you just built.</p>
      <div className="mentor-notes">
        {isLoading && <div className="empty-state"><span className="loader" /> Reading your circuit...</div>}
        {!isLoading && error && <div className="error-state">{error}</div>}
        {!isLoading && !error && notes.length === 0 && <div className="empty-state">Run the circuit to get a diagnosis, or ask a question below.</div>}
        {!isLoading && !error && notes.map((note, index) => <article className="mentor-note" key={`${index}-${note}`}><span className="note-index">0{index + 1}</span><p>{note}</p></article>)}
      </div>
      <form className="mentor-form" onSubmit={submitQuestion}>
        <input aria-label="Ask the Circuit Doctor" onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about this circuit..." value={question} />
        <button aria-label="Send question" className="button primary" disabled={isLoading || !question.trim()} type="submit">Ask <b>↗</b></button>
      </form>
    </section>
  );
}
