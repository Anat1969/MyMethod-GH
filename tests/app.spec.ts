import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const menu = readFileSync("public/ai-menu.js", "utf8");
test.beforeEach(async ({ page }) => {
  await page.route("**/ai-menu.js", (r) =>
    r.fulfill({ contentType: "text/javascript", body: menu }),
  );
  await page.route("**/api/distill", (r) =>
    r.fulfill({ json: { available: true } }),
  );
});
test("method, complete notebook, refresh, snapshot and presentation", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("מרעיון");
  await expect(page.locator("ai-menu .logo")).toBeVisible();
  await page.getByRole("link", { name: "לראות את השיטה" }).click();
  await expect(
    page.getByRole("heading", { name: "צריך אפליקציה חדשה?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "השלב הבא", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "איזו פעולה באמת נחוצה?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "לתעד החלטה בשלב הזה" }).click();
  await page.getByLabel("שם הרעיון", { exact: true }).fill("כלי לצל באשדוד");
  await page.getByLabel("למי הוא מיועד?").fill("הולכי רגל");
  await page
    .getByLabel("מה הרעיון ומה הוא אמור לשנות?")
    .fill("עוזר לבחור מסלול מוצל");
  await page.getByLabel("מה החלטתי?").fill("להציג מסלול מוצל");
  await page.getByLabel("למה בחרתי כך?").fill("כדי לצמצם חשיפה לשמש");
  await page
    .getByLabel("מה הראיה? קישור או תיאור של בדיקה")
    .fill("נבדק בתרגיל בכיתה");
  await page.getByRole("checkbox", { name: "בדקתי את התוצאה" }).check();
  await expect(
    page.getByText("1 מתוך 6 שלבים עם החלטה, נימוק וראיה."),
  ).toBeVisible();
  await expect(page.getByRole("status").first()).toContainText("נשמר");
  await page.reload();
  await expect(page.getByLabel("שם הרעיון", { exact: true })).toHaveValue(
    "כלי לצל באשדוד",
  );
  await expect(page.getByLabel("מה החלטתי?")).toHaveValue("להציג מסלול מוצל");
  await page.getByRole("link", { name: "הצגה", exact: true }).click();
  await page.getByRole("button", { name: "2. מזקקים", exact: true }).click();
  await expect(page.locator(".slide-insight")).toContainText(
    "להציג מסלול מוצל",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.locator("ai-menu .logo").click();
  await page
    .getByRole("menuitem", { name: "שיתוף תמונת מצב", exact: false })
    .click();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(url).toContain("data=");
  const other = await context.newPage();
  await other.goto(url);
  await expect(other.getByRole("heading", { level: 1 })).toContainText(
    "כלי לצל באשדוד",
  );
  await expect(other.locator(".slide-insight")).toContainText(
    "להציג מסלול מוצל",
  );
  await other.close();
});
test("AI request excludes evidence, renders structured result and saves notes", async ({
  page,
}) => {
  await page.route("**/api/distill", async (r) => {
    if (r.request().method() === "GET")
      return r.fulfill({ json: { available: true } });
    const input = r.request().postDataJSON();
    expect(input).not.toHaveProperty("evidence");
    expect(input.idea).toBe("מסלול מוצל");
    return r.fulfill({
      json: {
        insight: "**מסלול** לפי צל.",
        detail: "בוחרים **דרך** מתאימה.",
        question: "מה מקור נתוני הצל?",
        next: "בדקו רחוב אחד.",
        provider: "Gemini",
      },
    });
  });
  await page.goto("/#/lab?step=0");
  await page.getByLabel("מה הרעיון ומה הוא אמור לשנות?").fill("מסלול מוצל");
  await page.getByRole("checkbox", { name: "הטקסט כאן ציבורי" }).check();
  await page.getByRole("button", { name: "לקבל זיקוק ושאלה להמשך" }).click();
  await expect(page.locator(".ai-result")).toContainText("מה מקור נתוני הצל?");
  await page.getByRole("button", { name: "לשמור ביומן ההצעות" }).click();
  await page.getByText("יומן הצעות והערות", { exact: true }).click();
  await expect(page.getByLabel("הערות להמשך")).toHaveValue(/מה מקור נתוני הצל/);
});
test("AI failure keeps input; unconfigured service is explicit", async ({
  page,
}) => {
  await page.route("**/api/distill", (r) =>
    r.request().method() === "GET"
      ? r.fulfill({ json: { available: true } })
      : r.fulfill({ status: 502, json: { error: "השירות לא זמין כרגע" } }),
  );
  await page.goto("/#/lab");
  await page.getByLabel("מה הרעיון ומה הוא אמור לשנות?").fill("רעיון לבדיקה");
  await page.getByRole("checkbox", { name: "הטקסט כאן ציבורי" }).check();
  await page.getByRole("button", { name: "לקבל זיקוק ושאלה להמשך" }).click();
  await expect(page.getByRole("alert")).toContainText("השירות לא זמין");
  await expect(page.getByLabel("מה הרעיון ומה הוא אמור לשנות?")).toHaveValue(
    "רעיון לבדיקה",
  );
});
test("export, invalid import, replacement confirmation and malformed share", async ({
  page,
}) => {
  await page.goto("/#/lab");
  await page.locator("ai-menu .logo").click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "ייצוא גיבוי", exact: false })
    .click();
  expect((await download).suggestedFilename()).toContain("json");
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await expect(page.getByRole("status").first()).toContainText("אינו תואם");
  await page.goto("/#/present?data=bad");
  await expect(
    page.getByRole("heading", { name: "קישור השיתוף אינו תקין" }),
  ).toBeVisible();
});
test("all views mobile and desktop, motion, screenshots and installability", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 850 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const view of ["", "method", "lab", "present", "sources"]) {
      await page.goto("/#/" + view);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({ path: `docs/${view || "home"}-${width}.png` });
    }
  }
  expect(errors).toEqual([]);
  await page.goto("/");
  const cdp = await page.context().newCDPSession(page);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  const result = await cdp.send("Page.getInstallabilityErrors");
  expect(result.installabilityErrors).toEqual([]);
});
test("import preserves old notebook until confirmation and supports Escape", async ({
  page,
}) => {
  await page.goto("/#/lab");
  await page.getByLabel("שם הרעיון", { exact: true }).fill("המחברת הקיימת");
  const incoming = {
    version: 1,
    title: "מחברת מיובאת",
    idea: "רעיון אחר",
    audience: "תלמידים",
    notes: "",
    entries: {},
    updatedAt: new Date().toISOString(),
  };
  const upload = () =>
    page
      .locator("input[type=file]")
      .setInputFiles({
        name: "valid.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(incoming)),
      });
  await upload();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("שם הרעיון", { exact: true })).toHaveValue(
    "המחברת הקיימת",
  );
  await upload();
  await page.getByRole("button", { name: "אישור החלפה" }).click();
  await expect(page.getByLabel("שם הרעיון", { exact: true })).toHaveValue(
    "מחברת מיובאת",
  );
  await expect(page.locator(".save-status")).toContainText("נשמר");
  await page.reload();
  await expect(page.getByLabel("שם הרעיון", { exact: true })).toHaveValue(
    "מחברת מיובאת",
  );
});
