import { useState } from "react";
export function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  multiline?: boolean;
}) {
  const [voice, setVoice] = useState("");
  function dictate() {
    const ctor =
      (
        window as unknown as {
          SpeechRecognition?: new () => any;
          webkitSpeechRecognition?: new () => any;
        }
      ).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => any })
        .webkitSpeechRecognition;
    if (!ctor) {
      setVoice("תמלול קולי זמין ב-Chrome במכשירים תומכים. אפשר להקליד כאן.");
      return;
    }
    const r = new ctor();
    r.lang = "he-IL";
    r.interimResults = false;
    r.onresult = (e: any) => {
      onChange(value + (value ? " " : "") + e.results[0][0].transcript);
      setVoice("התמלול נוסף לשדה.");
    };
    r.onerror = () =>
      setVoice("ההקלטה לא הושלמה. בדקו הרשאת מיקרופון ונסו שוב.");
    r.onend = () => setVoice((v) => (v === "מקשיב…" ? "ההקלטה הסתיימה." : v));
    try {
      r.start();
      setVoice("מקשיב…");
    } catch {
      setVoice("המיקרופון לא זמין כרגע.");
    }
  }
  return (
    <div className="field">
      <label>
        <span>{label}</span>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={6000}
            autoComplete="off"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={300}
            autoComplete="off"
          />
        )}
      </label>
      <button type="button" className="voice" onClick={dictate}>
        הכתבה קולית
      </button>
      {voice && <small role="status">{voice}</small>}
    </div>
  );
}
