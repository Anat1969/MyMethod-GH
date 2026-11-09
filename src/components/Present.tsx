import { stages } from "../data/method";
import type { Project } from "../lib/types";
import { readiness } from "../lib/storage";
import { useEffect } from "react";
export function Present({
  project,
  step,
  go,
  shared,
}: {
  project: Project;
  step: number;
  go: (v: string, n?: number) => void;
  shared: boolean;
}) {
  const s = stages[step],
    e = project.entries[s.id],
    stats = readiness(project);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft" && step < 5) go("present", step + 1);
      if (e.key === "ArrowRight" && step > 0) go("present", step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, go]);
  return (
    <main className="workspace presentation">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {shared
              ? "תמונת מצב משותפת · לצפייה"
              : "מציגים את הדרך, לא רק את התוצאה"}
          </p>
          <h1>{project.title || "הרעיון שלי"}</h1>
        </div>
        <p>
          {project.audience
            ? `למי: ${project.audience}`
            : "אפשר לעבור בין השקפים גם בחיצי המקלדת."}
        </p>
      </div>
      <div className="presentation-layout">
        <div className="slide">
          <span className="slide-number">
            {String(step + 1).padStart(2, "0")}
          </span>
          <p className="eyebrow">{s.name}</p>
          <h2>{s.question}</h2>
          <p className="slide-insight">{e.decision || s.insight}</p>
          <div className="slide-details">
            <div>
              <small>למה בחרתי כך?</small>
              <p>{e.reason || "כאן יופיע הנימוק שיתועד במחברת."}</p>
            </div>
            <div>
              <small>מה מוכיח שזה עובד?</small>
              <p>{e.evidence || "כאן תופיע הראיה שתתווסף במחברת."}</p>
            </div>
          </div>
          {!e.decision && (
            <p className="quiet">תבנית להוראה. ההחלטה האישית עדיין לא תועדה.</p>
          )}
        </div>
        <aside>
          <span className="big-num">
            {stats.filled}
            <small>/6</small>
          </span>
          <h2>שלבים מתועדים במלואם</h2>
          <p>
            <mark>{6 - stats.filled} שלבים עדיין מחכים לתיעוד מלא.</mark>
          </p>
          <nav className="slide-index" aria-label="שקפים">
            {stages.map((st, i) => (
              <button
                key={st.id}
                aria-pressed={step === i}
                className={step === i ? "selected" : ""}
                onClick={() => go("present", i)}
              >
                {i + 1}. {st.name}
              </button>
            ))}
          </nav>
          <button className="secondary" onClick={() => window.print()}>
            הדפסה או PDF
          </button>
          <p className="quiet">
            לשיתוף התיעוד פותחים את A&I ובוחרים „שיתוף תמונת מצב”.
          </p>
        </aside>
      </div>
      <nav className="bottom-bar">
        <button disabled={step === 0} onClick={() => go("present", step - 1)}>
          השקף הקודם
        </button>
        <span>{step + 1} מתוך 6</span>
        {!shared && (
          <button onClick={() => go("lab", step)}>לתיעוד בשלב הזה</button>
        )}
        <button
          className="primary"
          disabled={step === 5}
          onClick={() => go("present", step + 1)}
        >
          השקף הבא
        </button>
      </nav>
      <div className="print-all">
        {stages
          .filter((_, i) => i !== step)
          .map((st) => (
            <section key={st.id}>
              <h2>
                {st.name}: {st.question}
              </h2>
              <h3>{project.entries[st.id].decision || st.insight}</h3>
              <p>{project.entries[st.id].reason}</p>
              <p>{project.entries[st.id].evidence}</p>
            </section>
          ))}
      </div>
    </main>
  );
}
