import { examples } from "../data/method";
export function Sources() {
  return (
    <main className="workspace sources">
      <div className="page-heading">
        <div>
          <p className="eyebrow">אותה שאלה, מקורות גלויים</p>
          <h1>מאיפה השיטה מגיעה?</h1>
        </div>
        <p>
          התוכן מבוסס על הוראות ענת והקוד שנבדק. הוא אינו שחזור של שיחות פיתוח
          שלא נמסרו.
        </p>
      </div>
      <section className="sources-grid">
        {examples.map((e) => (
          <article key={e.name}>
            <span className="eyebrow">{e.tag}</span>
            <h2>{e.name}</h2>
            <p>{e.detail}</p>
            <div className="proof">
              <small>מה לוקחים מכאן?</small>
              <strong>{e.lesson}</strong>
            </div>
            <small>
              {e.verified ? "קוד נבדק ב־09.11.2026" : "נבדקה רשומת התיק בלבד"}
            </small>
            <div className="actions">
              {e.url && (
                <a
                  className="secondary"
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  פתיחת המקור
                </a>
              )}
              {e.code && (
                <a
                  className="text-link"
                  href={e.code}
                  target="_blank"
                  rel="noreferrer"
                >
                  קוד ב-GitHub
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
      <section className="source-notes">
        <h2>למה נבנתה אפליקציה חדשה?</h2>
        <p>
          הכלים הקיימים אינם מחזיקים את תיעוד תהליך הבנייה ומשמשים בהקשרים
          אחרים. השיטה מקבלת מרחב לימוד עצמאי.
        </p>
        <h3>הכללים שמנחים את הכלי</h3>
        <a
          href="https://github.com/Anat1969/Claude-GH/blob/main/.claude/skills/anat-app-builder/SKILL.md"
          target="_blank"
          rel="noreferrer"
        >
          הסקיל הקנוני של ענת
        </a>
        <a
          href="https://github.com/Anat1969/AppOfApp-GH/blob/main/docs/ai-text-standard.md"
          target="_blank"
          rel="noreferrer"
        >
          תקן זיקוק טקסט AI
        </a>
        <a
          href="https://github.com/Anat1969/MOKED106-GH/tree/main/transparency"
          target="_blank"
          rel="noreferrer"
        >
          מוקד 106: מבנה לפי שאלות
        </a>
        <h3>דוגמה ליישום בעיר</h3>
        <p>
          לתרגול בלבד: כלי לצל ברחובות אשדוד (Ashdod) מתחיל בשאלת הולך הרגל,
          ומסתיים בבדיקת מסלול שימושי במכשיר נוסף.
        </p>
      </section>
    </main>
  );
}
