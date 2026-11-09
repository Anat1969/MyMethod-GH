import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConfirmImport } from "./components/ConfirmImport";
import { Home } from "./components/Home";
import { Method } from "./components/Method";
import { Lab } from "./components/Lab";
import { Present } from "./components/Present";
import { Sources } from "./components/Sources";
import { AIMenu, type MenuItem } from "./components/AIMenu";
import {
  read,
  save,
  decode,
  snapshot,
  download,
  validate,
} from "./lib/storage";
import { newProject } from "./data/method";
import type { Project } from "./lib/types";
function route() {
  const [path, query = ""] = location.hash.slice(1).split("?");
  const params = new URLSearchParams(query);
  const name = (path || "/").slice(1);
  return {
    view: ["method", "lab", "present", "sources"].includes(name)
      ? name
      : "home",
    step: Math.max(0, Math.min(5, Math.floor(Number(params.get("step"))) || 0)),
    data: params.get("data") || "",
  };
}
export default function App() {
  const [loc, setLoc] = useState(route),
    [initial] = useState(read),
    [project, setProject] = useState(initial.project),
    [saveState, setSaveState] = useState(initial.error || "נשמר במכשיר הזה"),
    [notice, setNotice] = useState(initial.error),
    [imported, setImported] = useState<Project | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onHash = () => {
      setLoc(route());
      window.scrollTo(0, 0);
      (
        document.querySelector("ai-menu") as
          (HTMLElement & { close?: () => void }) | null
      )?.close?.();
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = useCallback(
    (v: string, n = 0) => {
      const p = new URLSearchParams({ step: String(n) });
      if (loc.data) p.set("data", loc.data);
      location.hash = v === "home" ? "/" : "/" + v + "?" + p;
    },
    [loc.data],
  );
  useEffect(() => {
    setSaveState("שומר במכשיר…");
    const timer = setTimeout(() => {
      try {
        save(project);
        setSaveState("נשמר במכשיר הזה");
      } catch {
        setSaveState("השמירה נכשלה. ייצאו גיבוי מתוך A&I.");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [project]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (saveState.startsWith("שומר") || saveState.includes("נכשלה")) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);
  const shared = useMemo(() => {
    try {
      return loc.data ? decode(loc.data) : null;
    } catch {
      return null;
    }
  }, [loc.data]);
  const invalidShare = !!loc.data && !shared;
  const activeProject = shared ?? project;
  async function share() {
    try {
      const data = snapshot(activeProject);
      const url =
        location.origin +
        location.pathname +
        "#/present?step=" +
        loc.step +
        "&data=" +
        encodeURIComponent(data);
      if (url.length > 14000)
        throw Error("התיעוד גדול לקישור. ייצאו קובץ גיבוי ושיתפו אותו.");
      await navigator.clipboard.writeText(url);
      setNotice(
        "קישור לתמונת מצב של התיעוד הועתק. כל מי שמקבל אותו יוכל לקרוא את התוכן.",
      );
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "לא ניתן להעתיק. השתמשו בייצוא קובץ.",
      );
    }
  }
  const items: MenuItem[] = [
    {
      label: "שיתוף תמונת מצב",
      hint: "כולל את התיעוד בקישור",
      onSelect: share,
    },
    { label: "ייצוא גיבוי", onSelect: () => download(activeProject) },
    { label: "ייבוא תיעוד", onSelect: () => file.current?.click() },
    { label: "מחברת חדשה", onSelect: () => setImported(newProject()) },
  ];
  return (
    <>
      <a
        className="skip"
        href="#content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("content")?.focus();
        }}
      >
        דילוג לתוכן
      </a>
      <header className="topbar">
        <a className="brand" href="#/">
          שיטת העבודה שלי<span>מרעיון לאפליקציה חיה</span>
        </a>
        <nav aria-label="ניווט ראשי">
          {[
            ["home", "התחלה"],
            ["method", "השיטה"],
            ["lab", "המחברת שלי"],
            ["present", "הצגה"],
            ["sources", "מקורות"],
          ].map(([v, t]) => (
            <a
              key={v}
              href={
                v === "home"
                  ? "#/"
                  : "#/" +
                    v +
                    "?step=0" +
                    (loc.data ? "&data=" + encodeURIComponent(loc.data) : "")
              }
              aria-current={loc.view === v ? "page" : undefined}
            >
              {t}
            </a>
          ))}
        </nav>
        <AIMenu
          items={items}
          status={shared ? "צפייה בתמונת מצב" : saveState}
        />
      </header>
      <div id="content" tabIndex={-1} />
      {notice && (
        <div className="notice" role="status">
          {notice}
          <button onClick={() => setNotice("")}>סגירה</button>
        </div>
      )}
      {invalidShare ? (
        <main className="workspace">
          <h1>קישור השיתוף אינו תקין</h1>
          <p>בקשו קישור מלא או חזרו למחברת המקומית.</p>
          <a className="primary" href="#/lab">
            למחברת שלי
          </a>
        </main>
      ) : loc.view === "home" ? (
        <Home />
      ) : loc.view === "method" ? (
        <Method step={loc.step} go={go} />
      ) : loc.view === "sources" ? (
        <Sources />
      ) : loc.view === "present" ? (
        <Present
          project={activeProject}
          step={loc.step}
          go={go}
          shared={!!shared}
        />
      ) : shared ? (
        <main className="workspace">
          <h1>זהו עותק לצפייה</h1>
          <p>כדי לשמור אותו במכשיר ולערוך, אפשר לייבא אותו למחברת שלך.</p>
          <button className="primary" onClick={() => setImported(shared)}>
            ייבוא למחברת שלי
          </button>
          <button onClick={() => go("present", loc.step)}>חזרה להצגה</button>
        </main>
      ) : (
        <Lab
          project={project}
          setProject={setProject}
          step={loc.step}
          go={go}
          saveState={saveState}
        />
      )}
      <input
        hidden
        ref={file}
        type="file"
        accept="application/json,.json"
        onChange={async (e) => {
          try {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 200000) throw Error("הקובץ גדול מדי.");
            setImported(validate(JSON.parse(await f.text())));
          } catch (err) {
            setNotice(err instanceof Error ? err.message : "הקובץ אינו תקין.");
          } finally {
            e.target.value = "";
          }
        }}
      />
      {imported && (
        <ConfirmImport
          incoming={imported}
          current={project}
          onCancel={() => setImported(null)}
          onConfirm={() => {
            setProject(imported);
            setImported(null);
            location.hash = "/lab?step=0";
          }}
        />
      )}
    </>
  );
}
