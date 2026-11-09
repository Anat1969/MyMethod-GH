import { useEffect, useState } from "react";
import type { Project, Entry, AIResult } from "../lib/types";
import { stages } from "../data/method";
import { readiness } from "../lib/storage";
import { Field } from "./Field";
import { Rich } from "./Rich";
export function Lab({
  project,
  setProject,
  step,
  go,
  saveState,
}: {
  project: Project;
  setProject: (p: Project) => void;
  step: number;
  go: (v: string, n?: number) => void;
  saveState: string;
}) {
  const s = stages[step],
    entry = project.entries[s.id],
    stats = readiness(project);
  const [result, setResult] = useState<AIResult | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [consent, setConsent] = useState(false),
    [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    fetch("/api/distill")
      .then((r) => r.json())
      .then((d) => {
        if (live) setAvailable(d.available === true);
      })
      .catch(() => {
        if (live) setAvailable(false);
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    setResult(null);
    setError("");
  }, [step]);
  const update = (key: keyof Project, v: string) =>
    setProject({ ...project, [key]: v, updatedAt: new Date().toISOString() });
  function updateEntry(patch: Partial<Entry>) {
    setProject({
      ...project,
      entries: { ...project.entries, [s.id]: { ...entry, ...patch } },
      updatedAt: new Date().toISOString(),
    });
  }
  async function ask() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch("/api/distill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          idea: project.idea,
          audience: project.audience,
          stage: s.name,
          decision: entry.decision,
          reason: entry.reason,
        }),
        signal: AbortSignal.timeout(40000),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "הזיקוק לא הושלם. נסו שוב.");
      if (
        !["insight", "detail", "question", "next"].every(
          (k) => typeof d[k] === "string",
        )
      )
        throw Error("התקבלה תשובה לא תקינה.");
      setResult(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "החיבור נכשל. נסו שוב.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="workspace">
      <div className="page-heading">
        <div>
          <p className="eyebrow">המחברת שלי · נשמרת במכשיר הזה</p>
          <h1>מה ההחלטה הבאה שלי?</h1>
        </div>
        <div className="save-status" role="status">
          {saveState}
        </div>
      </div>
      <div className="lab-layout">
        <aside className="lab-index">
          <div className="progress-summary">
            <span className="big-num">
              {stats.percent}
              <small>%</small>
            </span>
            <h2>מהתהליך מתועד</h2>
            <div
              className="meter"
              role="progressbar"
              aria-label="שלבים עם תיעוד מלא"
              aria-valuenow={stats.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: stats.percent + "%" }} />
            </div>
            <p>
              <mark>{stats.filled} מתוך 6 שלבים עם החלטה, נימוק וראיה.</mark>
            </p>
            <small>המדד סופר שדות מלאים. הוא אינו בודק איכות או אמיתות.</small>
          </div>
          <nav aria-label="בחירת שלב לתיעוד">
            {stages.map((st, i) => (
              <button
                key={st.id}
                className={i === step ? "selected" : ""}
                aria-current={i === step ? "step" : undefined}
                onClick={() => go("lab", i)}
              >
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <strong>{st.name}</strong>
                <small>
                  {project.entries[st.id].done ? "סומן כהושלם" : "בתהליך"}
                </small>
              </button>
            ))}
          </nav>
          <p className="quiet">לגיבוי, ייבוא ושיתוף פותחים את כפתור A&I.</p>
        </aside>
        <section className="lab-paper">
          <div className="project-fields">
            <Field
              label="שם הרעיון"
              value={project.title}
              onChange={(v) => update("title", v)}
            />
            <Field
              label="למי הוא מיועד?"
              value={project.audience}
              onChange={(v) => update("audience", v)}
            />
          </div>
          <Field
            multiline
            label="מה הרעיון ומה הוא אמור לשנות?"
            value={project.idea}
            onChange={(v) => update("idea", v)}
          />
          <div className="entry-heading">
            <span className="chapter-num">
              {String(step + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="eyebrow">{s.name}</p>
              <h2>{s.question}</h2>
            </div>
          </div>
          <p>{s.check}</p>
          <Field
            multiline
            label="מה החלטתי?"
            value={entry.decision}
            onChange={(v) => updateEntry({ decision: v })}
          />
          <Field
            multiline
            label="למה בחרתי כך?"
            value={entry.reason}
            onChange={(v) => updateEntry({ reason: v })}
          />
          <Field
            multiline
            label="מה הראיה? קישור או תיאור של בדיקה"
            value={entry.evidence}
            onChange={(v) => updateEntry({ evidence: v })}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={entry.done}
              onChange={(e) => updateEntry({ done: e.target.checked })}
            />
            בדקתי את התוצאה ואני מסמן/ת שהשלב הושלם
          </label>
          <section className="ai-panel">
            <div>
              <span className="eyebrow">עוזר לשיקול הדעת</span>
              <h2>לזקק את הרעיון עם AI</h2>
              <p>תובנה, שאלה חסרה ופעולה הבאה. ההצעה נשארת לבדיקה שלך.</p>
            </div>
            {available === false && (
              <p className="system-message">
                ה-AI ממתין להגדרת מפתח Gemini בשרת. אפשר להמשיך לתעד ולייצא
                כרגיל.
              </p>
            )}
            <label className="check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              הטקסט כאן ציבורי ומותר לשליחה ל-Gemini החינמי. פרטי הראיה אינם
              נשלחים.
            </label>
            <button
              className="primary"
              disabled={
                !consent || busy || available !== true || !project.idea.trim()
              }
              onClick={ask}
            >
              {busy ? "מזקק את הרעיון…" : "לקבל זיקוק ושאלה להמשך"}
            </button>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            {result && (
              <div className="ai-result">
                <small>הצעת AI · {result.provider}</small>
                <h3>
                  <Rich text={result.insight} />
                </h3>
                <p>
                  <Rich text={result.detail} />
                </p>
                <p>
                  <strong>מה חסר?</strong> <Rich text={result.question} />
                </p>
                <p>
                  <strong>מה עושים עכשיו?</strong> <Rich text={result.next} />
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    update(
                      "notes",
                      project.notes +
                        "\n" +
                        result.insight +
                        "\n" +
                        result.detail +
                        "\n" +
                        result.question +
                        "\n" +
                        result.next,
                    );
                    setResult(null);
                  }}
                >
                  לשמור ביומן ההצעות
                </button>
              </div>
            )}
          </section>
          <details>
            <summary>יומן הצעות והערות</summary>
            <Field
              multiline
              label="הערות להמשך"
              value={project.notes}
              onChange={(v) => update("notes", v)}
            />
          </details>
        </section>
      </div>
      <nav className="bottom-bar">
        <button disabled={step === 0} onClick={() => go("lab", step - 1)}>
          השלב הקודם
        </button>
        <button onClick={() => go("method", step)}>להסבר ולפרומפט</button>
        <button
          className="primary"
          onClick={() => (step < 5 ? go("lab", step + 1) : go("present", 0))}
        >
          {step < 5 ? "השלב הבא" : "להצגת התהליך"}
        </button>
      </nav>
    </main>
  );
}
