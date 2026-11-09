import { newProject, stages, emptyEntry } from "../data/method";
import type { Project } from "./types";
const KEY = "mymethod-project-v1";
export function validate(value: unknown): Project {
  if (!value || typeof value !== "object")
    throw Error("קובץ התיעוד אינו תקין.");
  const p = value as Project;
  if (
    p.version !== 1 ||
    typeof p.title !== "string" ||
    typeof p.idea !== "string" ||
    typeof p.audience !== "string" ||
    typeof p.notes !== "string" ||
    !p.entries
  )
    throw Error("קובץ התיעוד אינו תואם לגרסה הזאת.");
  const clean = newProject();
  for (const k of ["title", "idea", "audience", "notes"] as const) {
    if (p[k].length > 12000) throw Error("התוכן ארוך מדי.");
    clean[k] = p[k];
  }
  for (const s of stages) {
    const e = p.entries[s.id] ?? emptyEntry();
    if (
      typeof e.decision !== "string" ||
      typeof e.reason !== "string" ||
      typeof e.evidence !== "string" ||
      typeof e.done !== "boolean"
    )
      throw Error("אחד השלבים אינו תקין.");
    clean.entries[s.id] = {
      decision: e.decision.slice(0, 6000),
      reason: e.reason.slice(0, 6000),
      evidence: e.evidence.slice(0, 6000),
      done: e.done,
    };
  }
  return clean;
}
export function read(): { project: Project; error: string } {
  try {
    const s = localStorage.getItem(KEY);
    return { project: s ? validate(JSON.parse(s)) : newProject(), error: "" };
  } catch {
    return {
      project: newProject(),
      error: "לא ניתן לקרוא את התיעוד השמור. ייצאו גיבוי לפני המשך עבודה.",
    };
  }
}
export function save(p: Project) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
export function snapshot(p: Project) {
  const bytes = new TextEncoder().encode(JSON.stringify(p));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
export function decode(s: string) {
  if (s.length > 100000) throw Error("קישור השיתוף ארוך מדי.");
  return validate(
    JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(
        Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
      ),
    ),
  );
}
export function download(p: Project) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(p, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "שיטת-העבודה.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function readiness(p: Project) {
  const filled = stages.filter((s) => {
    const e = p.entries[s.id];
    return e.decision.trim() && e.reason.trim() && e.evidence.trim();
  }).length;
  const done = stages.filter((s) => p.entries[s.id].done).length;
  return { filled, done, percent: Math.round((filled / stages.length) * 100) };
}
