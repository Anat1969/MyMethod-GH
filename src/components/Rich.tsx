export function Rich({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*[^*]+\*\*|==[^=]+==)/g)
        .map((p, i) =>
          p.startsWith("**") ? (
            <strong key={i}>{p.slice(2, -2)}</strong>
          ) : p.startsWith("==") ? (
            <mark key={i}>{p.slice(2, -2)}</mark>
          ) : (
            p
          ),
        )}
    </>
  );
}
