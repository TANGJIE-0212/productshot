"use client";

import { useState } from "react";

export default function StudioSandbox() {
  const [items, setItems] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", color: "#1e293b", padding: "48px 8%", fontFamily: "Arial, sans-serif" }}>
      <p style={{ color: "#7551cf", letterSpacing: 2 }}>PRODUCTSHOT / RECORDER TEST FIXTURE</p>
      <h1 style={{ fontSize: 36, margin: "16px 0" }}>An actual interaction. Not a product claim.</h1>
      <p>This isolated test page resets on reload. No business data, no accounts, no network writes.</p>
      <section style={{ marginTop: 32, background: "white", padding: 28, borderRadius: 20 }}>
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>1. Create a test item</h2>
        <label htmlFor="item-name">Item name</label>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <input id="item-name" value={name} onChange={(e) => setName(e.target.value)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: 12, width: 320 }} />
          <button id="add-item" disabled={!name.trim()} onClick={() => { setItems([...items, name.trim()]); setName(""); }} style={{ background: "#7551cf", color: "white", borderRadius: 8, padding: "12px 24px", opacity: name.trim() ? 1 : .5 }}>Add item</button>
        </div>
        <ul id="items" style={{ marginTop: 16 }}>{items.length ? items.map((item, index) => <li key={index} style={{ padding: 8, borderBottom: "1px solid #eef0f7" }}>{item}</li>) : <li>No items yet</li>}</ul>
      </section>
      <section style={{ marginTop: 20, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ background: "#e9e4fa", padding: 24, borderRadius: 20, flex: 1 }}>
          <button id="show-summary" onClick={() => setSummary(true)} style={{ padding: 12, background: "white", borderRadius: 8 }}>2. Show summary</button>
          {summary && <p id="summary" style={{ fontSize: 34, marginTop: 20 }}>{items.length} item{items.length === 1 ? "" : "s"} created</p>}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ background: "white", padding: 24, borderRadius: 20, flex: 1 }}>
          <label htmlFor="feedback">3. Leave test feedback</label>
          <input id="feedback" required value={feedback} onChange={(e) => setFeedback(e.target.value)} style={{ display: "block", width: "100%", border: "1px solid #cbd5e1", padding: 10, margin: "12px 0", borderRadius: 8 }} />
          <button id="submit-feedback" type="submit" style={{ background: "#17745f", color: "white", padding: "10px 18px", borderRadius: 8 }}>Submit feedback</button>
          {submitted && <p id="success" role="status" style={{ color: "#17745f", marginTop: 12 }}>Submitted: {feedback}</p>}
        </form>
      </section>
    </div>
  );
}
