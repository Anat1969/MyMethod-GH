export interface Stage {
  id: string;
  name: string;
  question: string;
  insight: string;
  detail: string;
  input: string;
  output: string;
  why: string;
  prompt: string;
  check: string;
  mistake: string;
  source: string;
}
export interface Entry {
  decision: string;
  reason: string;
  evidence: string;
  done: boolean;
}
export interface Project {
  version: 1;
  title: string;
  audience: string;
  idea: string;
  entries: Record<string, Entry>;
  notes: string;
  updatedAt: string;
}
export interface AIResult {
  insight: string;
  detail: string;
  question: string;
  next: string;
  provider?: string;
}
