import { useState } from "react";
import { stages, examples } from "../data/method";
import { Process } from "./Process";
export function Home() {
  const [active, setActive] = useState(0);
  const s = stages[active];
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">השיטה של ענת שטיבלמן · ללמוד מתוך העשייה</p>
          <h1>
            מרעיון.
            <br />
            להחלטה.
            <br />
            <span>לאפליקציה חיה.</span>
          </h1>
          <p className="lead">
            AI מקצר את הדרך.
            <br />
            <strong>שיקול הדעת נותן לה כיוון.</strong>
          </p>
          <div className="actions">
            <a className="primary" href="#/method?step=0">
              לראות את השיטה
            </a>
            <a className="secondary" href="#/lab?step=0">
              ליישם על רעיון שלי
            </a>
          </div>
          <p className="quiet">
            לעמיתים ולתלמידים. תהליך שאפשר להבין, לתעד ולהציג.
          </p>
        </div>
        <div className="hero-stage">
          <div className="stage-caption">
            <span>מהרעיון עד המסירה</span>
            <span className="mono">
              {String(active + 1).padStart(2, "0")} / 06
            </span>
          </div>
          <Process active={active} onSelect={setActive} />
          <div className="stage-answer" key={s.id}>
            <span className="eyebrow">{s.question}</span>
            <h2>{s.insight}</h2>
            <p>{s.detail}</p>
            <a className="text-link" href={"#/method?step=" + active}>
              לפתוח את ההחלטה
            </a>
          </div>
          <div className="stage-foot">
            <span>קלט</span>
            <strong>{s.input}</strong>
            <span>תוצאה</span>
            <strong>{s.output}</strong>
          </div>
        </div>
      </section>
      <section className="first-answers" aria-label="שלוש תשובות ראשונות">
        <a href="#/method?step=0">
          <span className="big-num">06</span>
          <h2>איך עוברים מרעיון למוצר?</h2>
          <p>שישה שלבים, מהבדיקה הראשונה ועד כתובת חיה.</p>
        </a>
        <a href="#/method?step=1">
          <span className="big-num">01</span>
          <h2>למה בחרתי בכל שלב?</h2>
          <p>החלטה אחת ברורה, עם סיבה ותוצאה מצופה.</p>
        </a>
        <a href="#/lab?step=0">
          <span className="big-num">03</span>
          <h2>מה אפשר ליישם עכשיו?</h2>
          <p>מתעדים בחירה, נימוק וראיה ברעיון משלך.</p>
        </a>
      </section>
      <section className="source-strip">
        <div>
          <p className="eyebrow">לומדים מהכלים שכבר נבנו</p>
          <h2>
            אותה שיטה.
            <br />
            תוצרים שונים.
          </h2>
          <a className="text-link" href="#/sources">
            מה נבדק במקורות
          </a>
        </div>
        <div className="example-grid">
          {examples.slice(0, 2).map((e, i) => (
            <a
              className="example"
              href={e.url}
              key={e.name}
              target="_blank"
              rel="noreferrer"
            >
              <span className="example-drawing" aria-hidden="true">
                {i === 0 ? (
                  <svg viewBox="0 0 300 105">
                    <path d="M20 80 Q65 0 110 60 T205 25 T280 65" />
                    <circle cx="20" cy="80" r="5" />
                    <circle cx="110" cy="60" r="5" />
                    <circle cx="205" cy="25" r="5" />
                    <circle cx="280" cy="65" r="5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 300 105">
                    <circle cx="150" cy="52" r="42" />
                    <circle cx="150" cy="52" r="22" />
                    <path d="M108 52 H192 M150 10 V94 M120 22 L180 82 M120 82 L180 22" />
                  </svg>
                )}
              </span>
              <h3>{e.name}</h3>
              <p>{e.lesson}</p>
              <small>פתיחת האפליקציה</small>
            </a>
          ))}
        </div>
      </section>
      <footer>
        <p>
          „קודם מחליטים: שדרוג או אפליקציה חדשה.” <small>ענת, 06.11.2026</small>
        </p>
        <p className="poem">
          קו ראשון נמתח
          <br />
          שאלה מוצאת לה צורה
          <br />
          חלון אל העולם
        </p>
        <small>
          הייקו מקורי לאפליקציה. בהשראת תוכנית אדריכלית שמתפתחת למבנה.
        </small>
      </footer>
    </main>
  );
}
