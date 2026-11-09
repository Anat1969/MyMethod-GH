import { useEffect, useRef } from "react";
import type { Project } from "../lib/types";
import { download } from "../lib/storage";
export function ConfirmImport({
  incoming,
  current,
  onConfirm,
  onCancel,
}: {
  incoming: Project;
  current: Project;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      onCancel={onCancel}
      aria-labelledby="import-title"
    >
      <h2 id="import-title">להחליף את המחברת המקומית?</h2>
      <p>
        „{incoming.title}” יחליף את התיעוד במכשיר הזה. אפשר לייצא גיבוי לפני
        ההחלפה.
      </p>
      <div className="actions">
        <button onClick={() => download(current)}>ייצוא התיעוד הקיים</button>
        <button className="primary" onClick={onConfirm}>
          אישור החלפה
        </button>
        <button autoFocus onClick={onCancel}>
          ביטול
        </button>
      </div>
    </dialog>
  );
}
