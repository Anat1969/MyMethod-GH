import { stages } from "../data/method";
import { motion, useReducedMotion } from "framer-motion";
export function Process({
  active,
  onSelect,
  compact = false,
}: {
  active: number;
  onSelect: (n: number) => void;
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className={"process " + (compact ? "compact" : "")}
      aria-label="מרעיון לאפליקציה: שישה שלבים"
    >
      <div className="process-spine" aria-hidden="true" />
      {stages.map((s, i) => (
        <motion.button
          key={s.id}
          className={"process-step " + (active === i ? "active" : "")}
          onClick={() => onSelect(i)}
          aria-pressed={active === i}
          initial={false}
          animate={{ y: active === i && !reduce ? -8 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="process-number">
            {String(i + 1).padStart(2, "0")}
          </span>
          <strong>{s.name}</strong>
          <span className="process-output">{s.output}</span>
          <span className="step-line" aria-hidden="true" />
        </motion.button>
      ))}
    </div>
  );
}
