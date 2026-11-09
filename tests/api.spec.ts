import { test, expect } from "@playwright/test";
import handler from "../api/distill";
const payload = {
  title: "רעיון",
  idea: "מסלול מוצל",
  audience: "הולכי רגל",
  stage: "מזקקים",
  decision: "",
  reason: "",
};
function req(body: unknown, ip: string, headers: Record<string, string> = {}) {
  return new Request("https://mymethod-gh.vercel.app/api/distill", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
test("server reports missing key and refuses generation", async () => {
  const old = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    expect(
      await (await handler(new Request("https://test/api/distill"))).json(),
    ).toMatchObject({ available: false });
    expect((await handler(req(payload, "missing"))).status).toBe(503);
  } finally {
    if (old) process.env.GEMINI_API_KEY = old;
  }
});
test("server validates origin, payload and size", async () => {
  const old = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only";
  try {
    expect(
      (
        await handler(
          req(payload, "origin", { origin: "https://other.example" }),
        )
      ).status,
    ).toBe(403);
    expect((await handler(req({}, "invalid"))).status).toBe(400);
    expect(
      (await handler(req({ ...payload, idea: "x".repeat(17000) }, "oversize")))
        .status,
    ).toBe(413);
  } finally {
    if (old) process.env.GEMINI_API_KEY = old;
    else delete process.env.GEMINI_API_KEY;
  }
});
test("Gemini is called server-side, output validated, rate limit enforced", async () => {
  const old = process.env.GEMINI_API_KEY,
    fetchOld = globalThis.fetch;
  process.env.GEMINI_API_KEY = "test-only";
  let calls = 0;
  globalThis.fetch = async (input, init) => {
    calls++;
    expect(String(input)).toContain("generativelanguage.googleapis.com");
    expect(new Headers(init?.headers).get("x-goog-api-key")).toBe("test-only");
    const body = JSON.parse(String(init?.body));
    expect(body.systemInstruction.parts[0].text).toContain("עד 8 מילים");
    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    insight: "**צל** מנחה את הבחירה.",
                    detail: "בוחרים **מסלול** לפי **תנאי השטח**.",
                    question: "מה מקור נתוני הצל?",
                    next: "בדקו רחוב אחד.",
                  }),
                },
              ],
            },
          },
        ],
      }),
    );
  };
  try {
    for (let i = 0; i < 3; i++) {
      const r = await handler(req(payload, "rate-test"));
      expect(r.status).toBe(200);
      expect(await r.json()).toMatchObject({ provider: "Gemini" });
    }
    expect((await handler(req(payload, "rate-test"))).status).toBe(429);
    expect(calls).toBe(3);
  } finally {
    globalThis.fetch = fetchOld;
    if (old) process.env.GEMINI_API_KEY = old;
    else delete process.env.GEMINI_API_KEY;
  }
});
test("invalid model output fails without inventing a response", async () => {
  const old = process.env.GEMINI_API_KEY,
    oldClaude = process.env.ANTHROPIC_API_KEY,
    fetchOld = globalThis.fetch;
  process.env.GEMINI_API_KEY = "test-only";
  delete process.env.ANTHROPIC_API_KEY;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: '{"insight":"no"}' }] } }],
      }),
    );
  try {
    const r = await handler(req(payload, "bad-model"));
    expect(r.status).toBe(502);
    expect(await r.json()).toHaveProperty("error");
  } finally {
    globalThis.fetch = fetchOld;
    if (old) process.env.GEMINI_API_KEY = old;
    else delete process.env.GEMINI_API_KEY;
    if (oldClaude) process.env.ANTHROPIC_API_KEY = oldClaude;
  }
});
