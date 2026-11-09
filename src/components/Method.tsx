import { useState } from "react";
import { stages } from "../data/method";
import { Process } from "./Process";
export function Method({
  step,
  go,
}: {
  step: number;
  go: (view: string, n?: number) => void;
}) {
  const [copied, setCopied] = useState("");
  const s = stages[step];
  async function copy() {
    try {
      await navigator.clipboard.writeText(s.prompt);
      setCopied("הפרומפט הועתק.");
    } catch {
      setCopied("אפשר לסמן את הפרומפט ולהעתיק ידנית.");
    }
  }
  return (
    <main className="workspace">
      <div className="page-heading">
        <div>
          <p className="eyebrow">מכירים, מבינים, מיישמים</p>
          <h1>איך הופכים רעיון לכלי עובד?</h1>
        </div>
        <p>בוחרים שלב ומגלים את ההחלטה שמניעה אותו.</p>
      </div>
      <Process active={step} onSelect={(n) => go("method", n)} compact />
      <section className="method-layout">
        <article className="decision-panel">
          <span className="chapter-num">
            {String(step + 1).padStart(2, "0")}
          </span>
          <p className="eyebrow">{s.name}</p>
          <h2>{s.question}</h2>
          <h3>
            <mark>{s.insight}</mark>
          </h3>
          <p className="lead">{s.detail}</p>
          <div className="io">
            <div>
              <small>מה נכנס?</small>
              <strong>{s.input}</strong>
            </div>
            <div>
              <small>מה יוצא?</small>
              <strong>{s.output}</strong>
            </div>
          </div>
          <h3>למה זה משנה?</h3>
          <p>{s.why}</p>
          <div className="proof">
            <small>מתי ממשיכים?</small>
            <strong>{s.check}</strong>
          </div>
        </article>
        <aside className="prompt-panel">
          <p className="eyebrow">מה אומרים ל-AI?</p>
          <h2>הנחיה שאפשר לקחת לעבודה.</h2>
          <p className="prompt">{s.prompt}</p>
          <button className="secondary" onClick={copy}>
            העתקת הפרומפט
          </button>
          <small role="status">{copied}</small>
          <div className="pitfall">
            <span>מה עלול להשתבש?</span>
            <p>{s.mistake}</p>
          </div>
          <details>
            <summary>על מה מבוסס השלב?</summary>
            <p>{s.source}</p>
            <a href="#/sources">למקורות השיטה</a>
          </details>
        </aside>
      </section>
      <nav className="bottom-bar" aria-label="מעבר בין שלבים">
        <button disabled={step === 0} onClick={() => go("method", step - 1)}>
          השלב הקודם
        </button>
        <span>
          {step + 1} מתוך {stages.length}
        </span>
        <button onClick={() => go("lab", step)}>לתעד החלטה בשלב הזה</button>
        <button
          className="primary"
          onClick={() => (step < 5 ? go("method", step + 1) : go("present", 0))}
        >
          {step < 5 ? "השלב הבא" : "להציג את התהליך"}
        </button>
      </nav>
    </main>
  );
}
