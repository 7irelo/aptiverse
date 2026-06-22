import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures";

Given(
  "I have a subject {string} in grade {int} on the {word} curriculum",
  async ({ api }, subjectName: string, grade: number, curriculumCode: string) => {
    await api.patch("/api/academic-planning/me/profile", {
      curriculumId: curriculumCode.toLowerCase(),
      grade,
    });
    const catalog = await api.get<
      { id: string; curriculumSubjectId: number; name: string }[]
    >(`/api/academic-planning/curricula/${curriculumCode.toLowerCase()}/subjects`);
    const match = catalog.find((s) => s.name === subjectName);
    expect(match, `catalog has no subject named '${subjectName}'`).toBeDefined();
    await api.post("/api/academic-planning/subjects", {
      curriculumSubjectId: match!.curriculumSubjectId,
      grade,
    });
  },
);

When(
  "I create an assessment titled {string} with type {word} weight {int}% due in {int} days",
  async ({ page }, title: string, type: string, weight: number, daysOut: number) => {
    await page.goto("/dashboard/assessments/new");

    // Wait for the subject dropdown to populate. MUI Select renders as a div
    // with role="combobox" — we wait for it to leave the disabled state
    // (subjectsQuery returns -> length>0 -> field enabled).
    const subjectSelect = page.getByLabel("Subject");
    await expect(subjectSelect).toBeEnabled({ timeout: 15_000 });

    await subjectSelect.click();
    await page.getByRole("option").first().click();

    await page.getByLabel("Title").fill(title);

    await page.getByLabel("Type").click();
    await page.getByRole("option", { name: new RegExp(`^${type}$`, "i") }).click();

    await page.getByLabel("Weight").fill(String(weight));

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysOut);
    await page.getByLabel("Due date").fill(dueDate.toISOString().slice(0, 10));

    await page.getByRole("button", { name: /save assessment/i }).click();

    // Redirect to /dashboard/assessments/{id} signals success
    await page.waitForURL(/\/dashboard\/assessments\/\d+/);
  },
);

Then(
  "the API should report an assessment titled {string}",
  async ({ api }, title: string) => {
    const rows = await api.get<{ title: string }[]>("/api/academic-planning/assessments");
    expect(rows.map((r) => r.title)).toContain(title);
  },
);

// Seeds an assessment via the API for the notification-producer tests.
// We POST directly rather than driving the /new form because the test
// is about the PATCH→submitted transition, not the create flow. Looks
// up the enrolled subject by display name so the Given reads naturally.
Given(
  "I have an assessment {string} in subject {string} with status {string}",
  async ({ api }, title: string, subjectName: string, status: string) => {
    type EnrolledSubject = { subjectId: string; name: string };
    const enrolled = await api.get<EnrolledSubject[]>("/api/academic-planning/subjects");
    const match = enrolled.find((s) => s.name === subjectName);
    expect(match, `student is not enrolled in subject '${subjectName}'`).toBeDefined();
    await api.post("/api/academic-planning/assessments", {
      subjectId: match!.subjectId,
      title,
      type: "test",
      weight: 10,
      dueDate: new Date(Date.now() + 14 * 86400_000).toISOString(),
      status,
    });
  },
);
