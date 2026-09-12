import { useState } from "react";
import { askMentor } from "../services/api";
import type { CircuitModel } from "../types/circuit";

type GlobalChatProps = { circuit?: CircuitModel | null };

export default function GlobalChat({ circuit = null }: GlobalChatProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "I am Q-BOT. Ask me about a quantum concept, or show me what you are building in the Lab." },
  ]);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setQuestion(""); setLoading(true);
    try {
      const response = await askMentor(circuit, trimmed);
      setMessages((current) => [...current, { role: "bot", text: response.notes.join("\n\n") }]);
    } catch {
      setMessages((current) => [...current, { role: "bot", text: "I could not reach the mentor right now. Keep exploring the lesson and try again in a moment." }]);
    } finally { setLoading(false); }
  };

  return <>
    <button className="chat-fab" onClick={() => setOpen(true)} title="Open Q-BOT" type="button"><span>✦</span><b>Q-BOT</b></button>
    {open && <div className="chat-overlay" onClick={() => setOpen(false)}><aside className="chat-drawer" onClick={(event) => event.stopPropagation()}><div className="chat-header"><div><span className="chat-spark">✦</span><span><strong>Q-BOT</strong><small>{circuit ? "Circuit-aware mentor" : "Quantum co-pilot"}</small></span></div><button onClick={() => setOpen(false)} type="button">×</button></div><div className="chat-messages">{messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}{loading && <div className="chat-message bot"><span className="chat-loader" /> Thinking through it...</div>}</div><form className="chat-form" onSubmit={submit}><input aria-label="Ask Q-BOT" onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a quantum question..." value={question} /><button aria-label="Send" disabled={!question.trim() || loading} type="submit">↗</button></form></aside></div>}
  </>;
}
